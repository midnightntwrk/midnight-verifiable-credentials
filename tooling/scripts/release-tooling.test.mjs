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
const supportedTarballNames = [
  "midnight-ntwrk-credential-model",
  "midnight-ntwrk-credential-compact",
  "midnight-ntwrk-credential-did-midnight",
];
const writeSupportedTarballs = (directory, version = "0.2.0") => {
  for (const packageName of supportedTarballNames) {
    writeFileSync(path.join(directory, `${packageName}-${version}.tgz`), "");
  }
};

test("computes rc and stable release metadata", () => {
  assert.deepEqual(
    computeReleaseVersion({
      baseVersion: "0.2.0",
      channel: "rc",
      rcIndex: "1",
    }),
    {
      channel: "rc",
      version: "0.2.0-rc1",
      npmTag: "rc",
    },
  );
  assert.deepEqual(
    computeReleaseVersion({
      baseVersion: "0.2.0",
      channel: "release",
    }),
    {
      channel: "release",
      version: "0.2.0",
      npmTag: "latest",
    },
  );
});

test("rejects ambiguous versions and invalid rc indexes", () => {
  assert.throws(() => requireStableVersion("0.2.0-rc1"), /stable semantic/u);
  assert.throws(
    () =>
      computeReleaseVersion({
        baseVersion: "0.2.0",
        channel: "rc",
        rcIndex: "0",
      }),
    /positive integer/u,
  );
  assert.throws(
    () =>
      computeReleaseVersion({
        baseVersion: "0.2.0",
        channel: "release",
        rcIndex: "1",
      }),
    /only valid for rc/u,
  );
});

test("configures npm publication for the protected OIDC environment", () => {
  const workflow = readFileSync(
    path.join(repoRoot, ".github/workflows/publish.yml"),
    "utf8",
  );

  assert.match(workflow, /^    environment: npm-release$/mu);
  assert.match(workflow, /^      id-token: write$/mu);
  assert.match(workflow, /^  group: vc-npm-publish$/mu);
  assert.doesNotMatch(workflow, /MIDNIGHTCI_NPMJS_TOKEN/u);
  assert.doesNotMatch(workflow, /NODE_AUTH_TOKEN/u);
  assert.doesNotMatch(workflow, /vc-npm-publish-\$\{\{ github\.ref \}\}/u);
});

test("publishes tested tarballs through tokenless OIDC with provenance and the requested tag", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-publish-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const npmLog = path.join(temporaryRoot, "npm.log");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "\${FAKE_NPM_LOG}"
if [[ "$1" == "view" && "$2" == *"@0.2.0" && "$3" == "version" ]]; then
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
  writeSupportedTarballs(temporaryRoot);

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
          NPM_TOKEN: "",
          NODE_AUTH_TOKEN: "",
          VERSION: "0.2.0",
        },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const commands = readFileSync(npmLog, "utf8");
    assert.match(commands, /publish .*credential-model-0\.2\.0\.tgz/u);
    assert.match(commands, /publish .*credential-compact-0\.2\.0\.tgz/u);
    assert.match(commands, /publish .*credential-did-midnight-0\.2\.0\.tgz/u);
    assert.match(commands, /--provenance/u);
    assert.match(commands, /--tag rc/u);
    assert.doesNotMatch(commands, /dist-tag add/u);
    assert.doesNotMatch(commands, /dist-tag rm/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("preflights every tarball before publishing any package", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-publish-preflight-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const npmLog = path.join(temporaryRoot, "npm.log");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "\${FAKE_NPM_LOG}"
if [[ "$1" == "view" ]]; then
  echo "npm error code E404" >&2
  exit 1
fi
exit 0
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeFileSync(
    path.join(temporaryRoot, `${supportedTarballNames[0]}-0.2.0.tgz`),
    "",
  );

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
          NODE_AUTH_TOKEN: "test-token",
          VERSION: "0.2.0",
        },
      },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /tested tarball is missing/u);
    assert.doesNotMatch(readFileSync(npmLog, "utf8"), /^publish /mu);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("waits with a clean public metadata probe", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-npm-waiter-clean-probe-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const npmLog = path.join(temporaryRoot, "npm.log");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
if env | grep -Fq "publish-secret"; then
  echo "probe received publish credentials" >&2
  exit 42
fi
printf '%s\\n' "$*" > "\${FAKE_NPM_LOG}"
echo "0.2.0"
`,
  );
  chmodSync(fakeNpm, 0o755);

  try {
    const result = spawnSync(
      process.execPath,
      [
        "tooling/scripts/wait-for-npm-packages.mjs",
        "--version",
        "0.2.0",
        "--attempts",
        "1",
        "--delay-ms",
        "0",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          FAKE_NPM_LOG: npmLog,
          NODE_AUTH_TOKEN: "publish-secret",
          "NPM_CONFIG_//registry.npmjs.org/:_authToken": "publish-secret",
          NPM_COMMAND: fakeNpm,
        },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /3 package\(s\) visible/u);
    assert.match(readFileSync(npmLog, "utf8"), /--userconfig \/dev\/null/u);
    assert.match(
      readFileSync(npmLog, "utf8"),
      /--globalconfig \/dev\/stdin/u,
    );
    assert.match(readFileSync(npmLog, "utf8"), /--prefer-online/u);
    assert.match(
      readFileSync(npmLog, "utf8"),
      /--@midnight-ntwrk:registry=https:\/\/registry\.npmjs\.org\//u,
    );
    assert.doesNotMatch(result.stdout, /publish-secret/u);
    assert.doesNotMatch(result.stderr, /publish-secret/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("distinguishes a missing version from npm view errors and fails closed", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-npm-waiter-diagnostics-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
if [[ "\${FAKE_NPM_MODE}" == "error" ]]; then
  echo "npm error code E503" >&2
  exit 17
fi
echo "0.0.9"
`,
  );
  chmodSync(fakeNpm, 0o755);

  const runProbe = (mode) =>
    spawnSync(
      process.execPath,
      [
        "tooling/scripts/wait-for-npm-packages.mjs",
        "--version",
        "0.2.0",
        "--attempts",
        "1",
        "--delay-ms",
        "0",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          FAKE_NPM_MODE: mode,
          NPM_COMMAND: fakeNpm,
        },
      },
    );

  try {
    const missing = runProbe("missing");
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /missing version/u);
    assert.match(missing.stderr, /version not visible/u);
    assert.doesNotMatch(missing.stderr, /npm view\/registry errors/u);

    const error = runProbe("error");
    assert.notEqual(error.status, 0);
    assert.match(error.stderr, /npm view\/registry errors/u);
    assert.match(error.stderr, /E503/u);
    assert.doesNotMatch(error.stderr, /publish-secret/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("fails closed when npm cannot determine whether a version exists", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-publish-error-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "view" && "$2" == *"@0.2.0" && "$3" == "version" ]]; then
  echo "npm error code E503" >&2
  exit 17
fi
exit 0
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeSupportedTarballs(temporaryRoot);

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
          NPM_TOKEN: "",
          NODE_AUTH_TOKEN: "",
          VERSION: "0.2.0",
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

test("fails closed when an existing version needs token-authorized tag repair", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-tag-read-error-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "view" && "$2" == *"@0.2.0" && "$3" == "version" ]]; then
  echo "0.2.0"
elif [[ "$1" == "view" && "$3" == "dist-tags.rc" ]]; then
  echo "0.0.9"
fi
exit 0
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeSupportedTarballs(temporaryRoot);

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
          VERSION: "0.2.0",
        },
      },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /dist-tag updates require the scoped npm token/u);
    assert.match(result.stdout, /exists; repairing rc/u);
    assert.doesNotMatch(result.stdout, /Publishing tested/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("treats an existing version with the requested tag as a tokenless no-op", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-tag-noop-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const npmLog = path.join(temporaryRoot, "npm.log");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "\${FAKE_NPM_LOG}"
if [[ "$1" == "view" && "$2" == *"@0.2.0" && "$3" == "version" ]]; then
  echo "0.2.0"
elif [[ "$1" == "view" && "$3" == "dist-tags.rc" ]]; then
  echo "0.2.0"
fi
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeSupportedTarballs(temporaryRoot);

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
          VERSION: "0.2.0",
        },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /no action required/u);
    const commands = readFileSync(npmLog, "utf8");
    assert.doesNotMatch(commands, /^publish /mu);
    assert.doesNotMatch(commands, /dist-tag add/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("repairs incorrect tags without mixing npm notices into metadata", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-tag-repair-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const npmLog = path.join(temporaryRoot, "npm.log");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "\${FAKE_NPM_LOG}"
if [[ "$1" == "view" && "$2" == *"@0.2.0" && "$3" == "version" ]]; then
  echo "npm notice registry metadata is current" >&2
  echo "0.2.0"
elif [[ "$1" == "view" && "$3" == "dist-tags.latest" ]]; then
  echo "0.0.9"
elif [[ "$1" == "view" ]]; then
  exit 0
fi
`,
  );
  chmodSync(fakeNpm, 0o755);
  writeSupportedTarballs(temporaryRoot);

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
          VERSION: "0.2.0",
        },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const commands = readFileSync(npmLog, "utf8");
    assert.match(
      commands,
      /dist-tag add @midnight-ntwrk\/credential-model@0\.2\.0 rc/u,
    );
    assert.doesNotMatch(commands, /^publish /mu);
    assert.doesNotMatch(commands, /dist-tag rm/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("verifies the selected npm tag and every untouched tag", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-tag-state-test-"),
  );
  const fakeNpm = path.join(temporaryRoot, "npm");
  const statePath = path.join(temporaryRoot, "state.json");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env bash
set -euo pipefail
if env | grep -Fq 'publish-secret'; then
  echo 'registry read received publish credentials' >&2
  exit 42
fi
if [[ " $* " != *" --prefer-online "* || " $* " != *" --userconfig /dev/null "* || " $* " != *" --globalconfig /dev/stdin "* || " $* " != *" --@midnight-ntwrk:registry=https://registry.npmjs.org/ "* ]]; then
  echo "registry read is not fresh and anonymous: $*" >&2
  exit 43
fi
if [[ "$1" == "view" ]]; then
  case "\${FAKE_NPM_PHASE}" in
    absent-before)
      echo 'npm error code E404' >&2
      exit 1
      ;;
    registry-probe-error)
      echo 'npm error code E500' >&2
      exit 1
      ;;
    *)
      echo "unexpected npm view fallback: $*" >&2
      exit 2
      ;;
  esac
fi
if [[ "$1" != "dist-tag" || "$2" != "ls" ]]; then
  echo "unexpected npm command: $*" >&2
  exit 2
fi
case "\${FAKE_NPM_PHASE}" in
  stable-before)
    printf 'latest: 0.1.0\nrc: 0.2.0-rc2\n'
    ;;
  stable-after)
    printf 'latest: 0.2.0\nrc: 0.2.0-rc2\n'
    ;;
  stable-rc-drift)
    printf 'latest: 0.2.0\nrc: 0.3.0-rc1\n'
    ;;
  stable-custom-drift)
    printf 'beta: 0.2.0\nlatest: 0.2.0\nrc: 0.2.0-rc2\n'
    ;;
  rc-after)
    printf 'latest: 0.2.0\nrc: 0.3.0-rc1\n'
    ;;
  rc-latest-drift)
    printf 'latest: 0.3.0-rc1\nrc: 0.3.0-rc1\n'
    ;;
  absent-before|registry-probe-error)
    echo 'npm error code E401' >&2
    exit 1
    ;;
  zero-tags)
    echo 'npm error No dist-tags found for @midnight-ntwrk/example' >&2
    exit 1
    ;;
  first-rc-after)
    echo 'rc: 0.3.0-rc1'
    ;;
  snapshot-after)
    echo 'snapshot: 0.3.0-snapshot.1'
    ;;
  snapshot-latest-drift)
    printf 'latest: 0.2.0\nsnapshot: 0.3.0-snapshot.1\n'
    ;;
  dist-tag-error)
    echo 'npm error code E500' >&2
    exit 1
    ;;
  proto-tag)
    printf '__proto__: 9.9.9\nlatest: 0.2.0\nrc: 0.2.0-rc2\n'
    ;;
  invalid-output)
    echo 'not valid dist-tag output'
    ;;
  *)
    echo "unknown fake npm phase: \${FAKE_NPM_PHASE}" >&2
    exit 2
    ;;
esac
`,
  );
  chmodSync(fakeNpm, 0o755);

  try {
    const runState = (args, phase) =>
      spawnSync(
        process.execPath,
        ["tooling/scripts/npm-release-state.mjs", ...args],
        {
          cwd: repoRoot,
          encoding: "utf8",
          env: {
            ...process.env,
            FAKE_NPM_PHASE: phase,
            NPM_COMMAND: fakeNpm,
            NODE_AUTH_TOKEN: "publish-secret",
            "NPM_CONFIG_//registry.npmjs.org/:_authToken": "publish-secret",
          },
        },
      );
    const snapshot = (phase) =>
      runState(["--snapshot", "--output", statePath], phase);
    const verify = (tag, version, phase) =>
      runState(
        [
          "--verify",
          "--input",
          statePath,
          "--tag",
          tag,
          "--version",
          version,
        ],
        phase,
      );

    const stableSnapshot = snapshot("stable-before");
    assert.equal(stableSnapshot.status, 0, stableSnapshot.stderr);
    const stable = verify("latest", "0.2.0", "stable-after");
    assert.equal(stable.status, 0, stable.stderr);

    const wrongRc = verify("latest", "0.2.0", "stable-rc-drift");
    assert.notEqual(wrongRc.status, 0);
    assert.match(wrongRc.stderr, /rc changed from 0\.2\.0-rc2/u);

    const unexpectedTag = verify(
      "latest",
      "0.2.0",
      "stable-custom-drift",
    );
    assert.notEqual(unexpectedTag.status, 0);
    assert.match(unexpectedTag.stderr, /beta changed from <absent>/u);

    const rcSnapshot = snapshot("stable-after");
    assert.equal(rcSnapshot.status, 0, rcSnapshot.stderr);
    const rc = verify("rc", "0.3.0-rc1", "rc-after");
    assert.equal(rc.status, 0, rc.stderr);
    const wrongLatestForRc = verify(
      "rc",
      "0.3.0-rc1",
      "rc-latest-drift",
    );
    assert.notEqual(wrongLatestForRc.status, 0);
    assert.match(wrongLatestForRc.stderr, /latest changed from 0\.2\.0/u);

    const protoTagSnapshot = snapshot("proto-tag");
    assert.equal(protoTagSnapshot.status, 0, protoTagSnapshot.stderr);
    const protoTagState = JSON.parse(readFileSync(statePath, "utf8"));
    assert.equal(
      protoTagState.packages["@midnight-ntwrk/credential-model"].distTags
        .__proto__,
      "9.9.9",
    );

    const zeroTagSnapshot = snapshot("zero-tags");
    assert.equal(zeroTagSnapshot.status, 0, zeroTagSnapshot.stderr);
    const zeroTagState = JSON.parse(readFileSync(statePath, "utf8"));
    assert.deepEqual(
      zeroTagState.packages["@midnight-ntwrk/credential-model"].distTags,
      { latest: null, rc: null },
    );

    const absentSnapshot = snapshot("absent-before");
    assert.equal(absentSnapshot.status, 0, absentSnapshot.stderr);
    const savedState = JSON.parse(readFileSync(statePath, "utf8"));
    assert.equal(
      savedState.schemaVersion,
      "midnight-vc-npm-release-state.v2",
    );
    assert.deepEqual(
      savedState.packages["@midnight-ntwrk/credential-model"].distTags,
      { latest: null, rc: null },
    );
    const firstRc = verify("rc", "0.3.0-rc1", "first-rc-after");
    assert.equal(firstRc.status, 0, firstRc.stderr);
    const snapshotTag = verify(
      "snapshot",
      "0.3.0-snapshot.1",
      "snapshot-after",
    );
    assert.equal(snapshotTag.status, 0, snapshotTag.stderr);
    const wrongLatestForSnapshot = verify(
      "snapshot",
      "0.3.0-snapshot.1",
      "snapshot-latest-drift",
    );
    assert.notEqual(wrongLatestForSnapshot.status, 0);
    assert.match(wrongLatestForSnapshot.stderr, /latest changed from <absent>/u);

    const registryProbeError = verify(
      "snapshot",
      "0.3.0-snapshot.1",
      "registry-probe-error",
    );
    assert.notEqual(registryProbeError.status, 0);
    assert.match(registryProbeError.stderr, /npm view failed/u);

    const distTagError = verify(
      "snapshot",
      "0.3.0-snapshot.1",
      "dist-tag-error",
    );
    assert.notEqual(distTagError.status, 0);
    assert.match(distTagError.stderr, /npm dist-tag ls failed/u);

    const invalidRegistryOutput = snapshot("invalid-output");
    assert.notEqual(invalidRegistryOutput.status, 0);
    assert.match(invalidRegistryOutput.stderr, /invalid dist-tags/u);

    const invalidSnapshot = structuredClone(savedState);
    delete invalidSnapshot.packages[
      "@midnight-ntwrk/credential-model"
    ].distTags.latest;
    writeFileSync(statePath, `${JSON.stringify(invalidSnapshot)}\n`);
    const missingAbsentState = verify(
      "snapshot",
      "0.3.0-snapshot.1",
      "snapshot-after",
    );
    assert.notEqual(missingAbsentState.status, 0);
    assert.match(missingAbsentState.stderr, /invalid dist-tags/u);

    invalidSnapshot.schemaVersion = "midnight-vc-npm-release-state.v1";
    writeFileSync(statePath, `${JSON.stringify(invalidSnapshot)}\n`);
    const oldSchema = verify(
      "snapshot",
      "0.3.0-snapshot.1",
      "snapshot-after",
    );
    assert.notEqual(oldSchema.status, 0);
    assert.match(oldSchema.stderr, /incompatible schema or registry/u);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
