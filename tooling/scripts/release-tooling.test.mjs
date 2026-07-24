import assert from "node:assert/strict";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  computeReleaseVersion,
  requireStableVersion,
} from "./prepare-release-version.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

test("computes rc and stable release metadata", () => {
  assert.deepEqual(
    computeReleaseVersion({
      baseVersion: "0.1.0",
      channel: "rc",
      rcIndex: "1",
      shortSha: "abc123",
    }),
    {
      channel: "rc",
      version: "0.1.0-rc1",
      npmTag: "rc",
    },
  );
  assert.deepEqual(
    computeReleaseVersion({
      baseVersion: "0.1.0",
      channel: "release",
      shortSha: "abc123",
    }),
    {
      channel: "release",
      version: "0.1.0",
      npmTag: "latest",
    },
  );
});

test("computes commit-bound snapshot metadata", () => {
  assert.deepEqual(
    computeReleaseVersion({
      baseVersion: "0.1.0",
      channel: "snapshot",
      runNumber: "42",
      shortSha: "abcdef123456",
    }),
    {
      channel: "snapshot",
      version: "0.1.0-snapshot.42.abcdef123456",
      npmTag: "snapshot",
    },
  );
});

test("rejects ambiguous versions and invalid rc indexes", () => {
  assert.throws(() => requireStableVersion("0.1.0-rc1"), /stable semantic/u);
  assert.throws(
    () =>
      computeReleaseVersion({
        baseVersion: "0.1.0",
        channel: "rc",
        rcIndex: "0",
        shortSha: "abc123",
      }),
    /positive integer/u,
  );
});

test("allows rc publication from develop and rejects stable publication", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-release-context-"),
  );
  const outputPath = path.join(temporaryRoot, "output");
  try {
    const rcResult = spawnSync(
      "bash",
      ["tooling/scripts/release-resolve-context.sh"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          DISPATCH_CHANNEL: "rc",
          DISPATCH_RC_INDEX: "1",
          DISPATCH_VERSION: "0.1.0",
          GITHUB_EVENT_NAME: "workflow_dispatch",
          GITHUB_OUTPUT: outputPath,
          GITHUB_REF_NAME: "develop",
        },
      },
    );
    assert.equal(rcResult.status, 0, rcResult.stderr);
    assert.match(readFileSync(outputPath, "utf8"), /channel=rc/u);

    const stableResult = spawnSync(
      "bash",
      ["tooling/scripts/release-resolve-context.sh"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          DISPATCH_CHANNEL: "release",
          GITHUB_EVENT_NAME: "workflow_dispatch",
          GITHUB_OUTPUT: outputPath,
          GITHUB_REF_NAME: "develop",
        },
      },
    );
    assert.notEqual(stableResult.status, 0);
    assert.match(stableResult.stdout, /only allowed from main/u);

    const injectedVersionResult = spawnSync(
      "bash",
      ["tooling/scripts/release-resolve-context.sh"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          DISPATCH_CHANNEL: "rc",
          DISPATCH_RC_INDEX: "1",
          DISPATCH_VERSION: "0.1.0\nnpm_tag=latest",
          GITHUB_EVENT_NAME: "workflow_dispatch",
          GITHUB_OUTPUT: outputPath,
          GITHUB_REF_NAME: "develop",
        },
      },
    );
    assert.notEqual(injectedVersionResult.status, 0);
    assert.match(injectedVersionResult.stdout, /stable semantic version/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("publishes the tested tarball with provenance and the requested tag", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-publish-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const npmLog = path.join(temporaryRoot, "npm.log");
  const tarballName = "midnight-ntwrk-credential-model-0.1.0.tgz";
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "\${FAKE_NPM_LOG}"
if [[ "$1" == "view" && "$2" == *"@0.1.0" && "$3" == "version" ]]; then
  echo "npm error code E404" >&2
  exit 1
fi
if [[ "$1" == "view" ]]; then
  exit 0
fi
exit 0
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeFileSync(path.join(temporaryRoot, tarballName), "");

  try {
    const result = spawnSync(
      "bash",
      ["tooling/scripts/publish-npm-packages.sh"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          ARTIFACT_DIRECTORY: temporaryRoot,
          FAKE_NPM_LOG: npmLog,
          NPM_ACCESS: "public",
          NPM_COMMAND: fakeNpm,
          NPM_REGISTRY: "https://registry.npmjs.org/",
          NPM_TAG: "rc",
          VERSION: "0.1.0",
        },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const commands = readFileSync(npmLog, "utf8");
    assert.match(commands, /publish .*credential-model-0\.1\.0\.tgz/u);
    assert.match(commands, /--provenance/u);
    assert.match(commands, /--tag rc/u);
    assert.doesNotMatch(commands, /^dist-tag /mu);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("fails closed when npm cannot determine whether a version exists", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-publish-error-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const tarballName = "midnight-ntwrk-credential-model-0.1.0.tgz";
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "view" && "$2" == *"@0.1.0" && "$3" == "version" ]]; then
  echo "npm error code E503" >&2
  exit 17
fi
exit 0
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeFileSync(path.join(temporaryRoot, tarballName), "");

  try {
    const result = spawnSync(
      "bash",
      ["tooling/scripts/publish-npm-packages.sh"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          ARTIFACT_DIRECTORY: temporaryRoot,
          NPM_ACCESS: "public",
          NPM_COMMAND: fakeNpm,
          NPM_REGISTRY: "https://registry.npmjs.org/",
          NPM_TAG: "rc",
          VERSION: "0.1.0",
        },
      },
    );
    assert.equal(result.status, 17);
    assert.match(result.stderr, /npm view failed/u);
    assert.doesNotMatch(result.stdout, /Publishing tested/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("fails closed when npm cannot read the previous latest tag", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-tag-read-error-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const tarballName = "midnight-ntwrk-credential-model-0.1.0.tgz";
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "view" && "$3" == "dist-tags.latest" ]]; then
  echo "npm error code E503" >&2
  exit 23
fi
exit 0
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeFileSync(path.join(temporaryRoot, tarballName), "");

  try {
    const result = spawnSync(
      "bash",
      ["tooling/scripts/publish-npm-packages.sh"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          ARTIFACT_DIRECTORY: temporaryRoot,
          NPM_ACCESS: "public",
          NPM_COMMAND: fakeNpm,
          NPM_REGISTRY: "https://registry.npmjs.org/",
          NPM_TAG: "rc",
          VERSION: "0.1.0",
        },
      },
    );
    assert.equal(result.status, 23);
    assert.match(result.stderr, /tag latest/u);
    assert.doesNotMatch(result.stdout, /Publishing tested/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("repairs an incorrect tag without mixing npm notices into metadata", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-tag-repair-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const npmLog = path.join(temporaryRoot, "npm.log");
  const tarballName = "midnight-ntwrk-credential-model-0.1.0.tgz";
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "\${FAKE_NPM_LOG}"
if [[ "$1" == "view" && "$2" == *"@0.1.0" && "$3" == "version" ]]; then
  echo "npm notice registry metadata is current" >&2
  echo "0.1.0"
elif [[ "$1" == "view" && "$3" == "dist-tags.latest" ]]; then
  echo "0.0.9"
elif [[ "$1" == "view" ]]; then
  exit 0
fi
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeFileSync(path.join(temporaryRoot, tarballName), "");

  try {
    const result = spawnSync(
      "bash",
      ["tooling/scripts/publish-npm-packages.sh"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          ARTIFACT_DIRECTORY: temporaryRoot,
          FAKE_NPM_LOG: npmLog,
          NODE_AUTH_TOKEN: "test-token",
          NPM_ACCESS: "public",
          NPM_COMMAND: fakeNpm,
          NPM_REGISTRY: "https://registry.npmjs.org/",
          NPM_TAG: "rc",
          VERSION: "0.1.0",
        },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const commands = readFileSync(npmLog, "utf8");
    assert.match(
      commands,
      /dist-tag add @midnight-ntwrk\/credential-model@0\.1\.0 rc/u,
    );
    assert.doesNotMatch(commands, /^publish /mu);
    assert.doesNotMatch(commands, /dist-tag rm/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("verifies that an rc publication preserves latest", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-tag-state-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const statePath = path.join(temporaryRoot, "state.json");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
if [[ "\${FAKE_NPM_PHASE}" == "before" ]]; then
  echo '{"latest":"0.0.9"}'
elif [[ "\${FAKE_NPM_PHASE}" == "wrong" ]]; then
  echo '{"latest":"0.1.0-rc1","rc":"0.1.0-rc1"}'
else
  echo '{"latest":"0.0.9","rc":"0.1.0-rc1"}'
fi
`,
  );
  chmodSync(fakeNpm, 0o755);

  try {
    const snapshot = spawnSync(
      process.execPath,
      [
        "tooling/scripts/npm-release-state.mjs",
        "--snapshot",
        "--output",
        statePath,
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          FAKE_NPM_PHASE: "before",
          NPM_COMMAND: fakeNpm,
        },
      },
    );
    assert.equal(snapshot.status, 0, snapshot.stderr);

    const verify = spawnSync(
      process.execPath,
      [
        "tooling/scripts/npm-release-state.mjs",
        "--verify",
        "--input",
        statePath,
        "--tag",
        "rc",
        "--version",
        "0.1.0-rc1",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          FAKE_NPM_PHASE: "after",
          NPM_COMMAND: fakeNpm,
        },
      },
    );
    assert.equal(verify.status, 0, verify.stderr);

    const wrongLatest = spawnSync(
      process.execPath,
      [
        "tooling/scripts/npm-release-state.mjs",
        "--verify",
        "--input",
        statePath,
        "--tag",
        "rc",
        "--version",
        "0.1.0-rc1",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          FAKE_NPM_PHASE: "wrong",
          NPM_COMMAND: fakeNpm,
        },
      },
    );
    assert.notEqual(wrongLatest.status, 0);
    assert.match(wrongLatest.stderr, /unexpectedly changed latest/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
