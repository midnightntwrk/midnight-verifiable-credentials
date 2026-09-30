import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createConsumerPnpmWorkspace,
  readProjectPnpmConfig,
  readRootPnpmSupplyPolicy,
  sanitizePnpmPolicyEnvironment,
  validateRootPnpmSupplyPolicy,
} from "./pnpm-supply-policy.mjs";

const validPolicy = {
  allowBuilds: { esbuild: true },
  blockExoticSubdeps: true,
  dangerouslyAllowAllBuilds: false,
  engineStrict: true,
  minimumReleaseAge: 10080,
  minimumReleaseAgeExcludePrune: false,
  minimumReleaseAgeIgnoreMissingTime: false,
  minimumReleaseAgeStrict: true,
  minimumReleaseAgeExclude: ["turbo@2.11.5", "typescript@5.9.3"],
  overrides: {
    algoliasearch: "5.52.1",
    "brace-expansion@1": "5.0.12",
    "brace-expansion@2": "5.0.12",
    "brace-expansion@5": "5.0.12",
    "js-yaml": "4.3.2",
    postcss: "8.5.23",
    vite: "7.3.6",
  },
  pmOnFail: "error",
  trustLockfile: false,
  trustPolicy: "no-downgrade",
  trustPolicyExclude: [],
  strictDepBuilds: true,
  verifyStoreIntegrity: true,
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
test("requires every pnpm supply-chain control", () => {
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        overrides: { ...validPolicy.overrides, "brace-expansion@5": undefined },
      }),
    /overrides must pin brace-expansion@5 to an exact version/u,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        allowBuilds: { esbuild: true, unknown: true },
      }),
    /allowBuilds must approve only esbuild and deny every other entry/,
  );
  assert.deepEqual(
    validateRootPnpmSupplyPolicy({
      ...validPolicy,
      allowBuilds: { esbuild: true, "fixture-build@1.0.0": false },
    }).allowBuilds,
    { esbuild: true, "fixture-build@1.0.0": false },
  );
  assert.doesNotThrow(() =>
    validateRootPnpmSupplyPolicy({
      ...validPolicy,
      allowBuilds: { "esbuild@0.28.2": true },
    }),
  );
  assert.throws(
    () => validateRootPnpmSupplyPolicy({ ...validPolicy, trustPolicy: undefined }),
    /trustPolicy must be "no-downgrade"/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        blockExoticSubdeps: false,
      }),
    /blockExoticSubdeps must be true/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        dangerouslyAllowAllBuilds: true,
      }),
    /dangerouslyAllowAllBuilds must be false/,
  );
  assert.throws(
    () => validateRootPnpmSupplyPolicy({ ...validPolicy, engineStrict: false }),
    /engineStrict must be true/,
  );
  assert.throws(
    () => validateRootPnpmSupplyPolicy({ ...validPolicy, pmOnFail: "download" }),
    /pmOnFail must be "error"/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({ ...validPolicy, strictDepBuilds: false }),
    /strictDepBuilds must be true/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        verifyStoreIntegrity: false,
      }),
    /verifyStoreIntegrity must be true/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAge: 1,
      }),
    /must enforce at least a seven-day cooldown/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeIgnoreMissingTime: true,
      }),
    /minimumReleaseAgeIgnoreMissingTime must be false/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExcludePrune: true,
      }),
    /minimumReleaseAgeExcludePrune must be false/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeStrict: false,
      }),
    /minimumReleaseAgeStrict must be true/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        trustPolicyIgnoreAfter: 1,
      }),
    /must not weaken provenance enforcement/,
  );
  assert.throws(
    () => validateRootPnpmSupplyPolicy({ ...validPolicy, trustLockfile: true }),
    /trustLockfile must be false/,
  );
});

test("rejects broad and duplicate policy exceptions", () => {
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: ["@midnight-ntwrk/*"],
      }),
    /must not contain broad selector/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: ["!nonexistent-package"],
      }),
    /must not contain broad selector/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: ["turbo@2.11.4", "turbo@2.11.5"],
      }),
    /more than one selector for turbo/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: ["typescript"],
      }),
    /must include an exact version/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: ["typescript@^5.9.3"],
      }),
    /must use exact semantic versions/,
  );
});

test("the real workspace enables the required supply-chain policy", () => {
  assert.doesNotThrow(() => readRootPnpmSupplyPolicy(repoRoot));
});

test("project policy cannot be supplied by inherited package-manager environment", () => {
  const emptyProject = mkdtempSync(path.join(os.tmpdir(), "pnpm-policy-test-"));
  const hostileUserConfig = path.join(emptyProject, "hostile.npmrc");
  const hostileConfigHome = path.join(emptyProject, "config-home");
  mkdirSync(path.join(hostileConfigHome, "pnpm"), { recursive: true });
  writeFileSync(
    hostileUserConfig,
    "minimum-release-age=1\ntrust-policy-ignore-after=1\n",
  );
  writeFileSync(
    path.join(hostileConfigHome, "pnpm", "config.yaml"),
    "minimumReleaseAge: 1\ntrustPolicyIgnoreAfter: 1\n",
  );
  const environment = {
    ...process.env,
    NPM_CONFIG_MINIMUM_RELEASE_AGE: "1",
    npm_config_minimumReleaseAge: "1",
    PNPM_CONFIG_MINIMUM_RELEASE_AGE: "1",
    pnpm_config_trustPolicyIgnoreAfter: "1",
    NPM_CONFIG_USERCONFIG: hostileUserConfig,
    NPM_CONFIG_GLOBALCONFIG: hostileUserConfig,
    XDG_CONFIG_HOME: hostileConfigHome,
  };
  try {
    assert.equal(
      readProjectPnpmConfig(emptyProject, "minimumReleaseAge", environment),
      undefined,
    );
  } finally {
    rmSync(emptyProject, { recursive: true, force: true });
  }
});

test("pnpm enforces the project engine policy", () => {
  const project = mkdtempSync(path.join(os.tmpdir(), "pnpm-engine-policy-"));
  writeFileSync(
    path.join(project, "package.json"),
    `${JSON.stringify({
      name: "engine-policy-fixture",
      version: "1.0.0",
      private: true,
      engines: { node: ">=999" },
    })}\n`,
  );
  writeFileSync(
    path.join(project, "pnpm-workspace.yaml"),
    "packages:\n  - .\nengineStrict: true\n",
  );
  try {
    const result = spawnSync("pnpm", ["install", "--no-frozen-lockfile"], {
      cwd: project,
      encoding: "utf8",
      env: sanitizePnpmPolicyEnvironment(process.env),
    });
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /ERR_PNPM_UNSUPPORTED_ENGINE/u,
    );
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("pnpm rejects an unapproved dependency build script", () => {
  const project = mkdtempSync(path.join(os.tmpdir(), "pnpm-build-policy-"));
  const dependency = path.join(project, "dependency");
  mkdirSync(dependency);
  writeFileSync(
    path.join(project, "package.json"),
    `${JSON.stringify({
      name: "build-policy-fixture",
      version: "1.0.0",
      private: true,
      dependencies: { "fixture-build": "file:./dependency" },
    })}\n`,
  );
  writeFileSync(
    path.join(dependency, "package.json"),
    `${JSON.stringify({
      name: "fixture-build",
      version: "1.0.0",
      scripts: { postinstall: 'node -e "process.exit(0)"' },
    })}\n`,
  );
  writeFileSync(
    path.join(project, "pnpm-workspace.yaml"),
    [
      "packages:",
      "  - .",
      "allowBuilds:",
      "  esbuild: true",
      "dangerouslyAllowAllBuilds: false",
      "strictDepBuilds: true",
      "",
    ].join("\n"),
  );
  try {
    const result = spawnSync("pnpm", ["install", "--no-frozen-lockfile"], {
      cwd: project,
      encoding: "utf8",
      env: sanitizePnpmPolicyEnvironment(process.env),
    });
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /ERR_PNPM_IGNORED_BUILDS/u,
    );
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("consumer installs cannot inherit pnpm policy overrides", () => {
  const environment = sanitizePnpmPolicyEnvironment({
    PATH: process.env.PATH,
    NPM_CONFIG_TRUST_POLICY_IGNORE_AFTER: "1",
    npm_config_minimumReleaseAge: "1",
    PNPM_CONFIG_TRUST_LOCKFILE: "true",
    PNPM_CONFIG_ALLOW_BUILDS: '{"malicious-package":true}',
    pnpm_config_dangerouslyAllowAllBuilds: "true",
    PNPM_CONFIG_ENGINE_STRICT: "false",
    PNPM_CONFIG_OVERRIDES: '{"vite":"0.0.0"}',
    PNPM_CONFIG_PM_ON_FAIL: "ignore",
    PNPM_CONFIG_REGISTRY: "https://registry.invalid/",
    pnpm_config_strictDepBuilds: "false",
    PNPM_CONFIG_VERIFY_STORE_INTEGRITY: "false",
    XDG_CONFIG_HOME: "/hostile/config",
    pnpm_config_minimumReleaseAgeStrict: "false",
    pnpm_config_minimumReleaseAgeExcludePrune: "false",
  });
  assert.equal(environment.PATH, process.env.PATH);
  assert.equal(environment.NPM_CONFIG_USERCONFIG, os.devNull);
  assert.equal(environment.NPM_CONFIG_GLOBALCONFIG, os.devNull);
  assert.equal(environment.NPM_CONFIG_TRUST_POLICY_IGNORE_AFTER, undefined);
  assert.equal(environment.npm_config_minimumReleaseAge, undefined);
  assert.equal(environment.PNPM_CONFIG_TRUST_LOCKFILE, undefined);
  assert.equal(environment.PNPM_CONFIG_ALLOW_BUILDS, undefined);
  assert.equal(environment.pnpm_config_dangerouslyAllowAllBuilds, undefined);
  assert.equal(environment.PNPM_CONFIG_ENGINE_STRICT, undefined);
  assert.equal(environment.PNPM_CONFIG_OVERRIDES, undefined);
  assert.equal(environment.PNPM_CONFIG_PM_ON_FAIL, "error");
  assert.equal(environment.PNPM_CONFIG_REGISTRY, undefined);
  assert.equal(environment.pnpm_config_strictDepBuilds, undefined);
  assert.equal(environment.PNPM_CONFIG_VERIFY_STORE_INTEGRITY, undefined);
  assert.notEqual(environment.XDG_CONFIG_HOME, "/hostile/config");
  assert.equal(environment.pnpm_config_minimumReleaseAgeStrict, undefined);
  assert.equal(
    environment.pnpm_config_minimumReleaseAgeExcludePrune,
    undefined,
  );
});

test("preserves root policy for local clean consumers", () => {
  const workspace = JSON.parse(
    createConsumerPnpmWorkspace({
      rootPolicy: validateRootPnpmSupplyPolicy(validPolicy),
      overrides: {
        "@midnight-ntwrk/credential-model": "file:./vendor/model.tgz",
      },
    }),
  );

  assert.deepEqual(workspace.minimumReleaseAgeExclude, [
    "turbo@2.11.5",
    "typescript@5.9.3",
  ]);
  assert.deepEqual(workspace.allowBuilds, { esbuild: true });
  assert.deepEqual(workspace.overrides, {
    ...validPolicy.overrides,
    "@midnight-ntwrk/credential-model": "file:./vendor/model.tgz",
  });
  assert.equal(workspace.blockExoticSubdeps, true);
  assert.equal(workspace.dangerouslyAllowAllBuilds, false);
  assert.equal(workspace.engineStrict, true);
  assert.equal(workspace.minimumReleaseAgeIgnoreMissingTime, false);
  assert.equal(workspace.minimumReleaseAgeExcludePrune, false);
  assert.equal(workspace.minimumReleaseAgeStrict, true);
  assert.equal(workspace.pmOnFail, "error");
  assert.equal(workspace.trustLockfile, false);
  assert.equal(workspace.trustPolicy, "no-downgrade");
  assert.equal(workspace.strictDepBuilds, true);
  assert.equal(workspace.verifyStoreIntegrity, true);
});

test("exempts only the published package version in registry mode", () => {
  const workspace = JSON.parse(
    createConsumerPnpmWorkspace({
      rootPolicy: validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: [
          "@midnight-ntwrk/credential-model@0.2.0",
        ],
      }),
      publishedPackageNames: [
        "@midnight-ntwrk/credential-model",
        "@midnight-ntwrk/credential-compact",
      ],
      expectedVersion: "0.3.0-rc.1",
    }),
  );

  assert.deepEqual(workspace.minimumReleaseAgeExclude, [
    "@midnight-ntwrk/credential-model@0.2.0 || 0.3.0-rc.1",
    "@midnight-ntwrk/credential-compact@0.3.0-rc.1",
  ]);

  const unchangedWorkspace = JSON.parse(
    createConsumerPnpmWorkspace({
      rootPolicy: validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: [
          "@midnight-ntwrk/credential-model@0.3.0-rc.1",
        ],
      }),
      publishedPackageNames: ["@midnight-ntwrk/credential-model"],
      expectedVersion: "0.3.0-rc.1",
    }),
  );
  assert.deepEqual(unchangedWorkspace.minimumReleaseAgeExclude, [
    "@midnight-ntwrk/credential-model@0.3.0-rc.1",
  ]);
});
