import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createConsumerPnpmWorkspace,
  readProjectPnpmConfig,
  validateRootPnpmSupplyPolicy,
} from "./pnpm-supply-policy.mjs";

const validPolicy = {
  blockExoticSubdeps: true,
  minimumReleaseAge: 10080,
  minimumReleaseAgeExclude: ["turbo@2.11.5", "typescript@5.9.3"],
  trustPolicy: "no-downgrade",
  trustPolicyExclude: [],
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
test("requires every pnpm supply-chain control", () => {
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
        minimumReleaseAge: 1,
      }),
    /must enforce at least a seven-day cooldown/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        trustPolicyIgnoreAfter: 1,
      }),
    /must not weaken provenance enforcement/,
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
  assert.doesNotThrow(() =>
    validateRootPnpmSupplyPolicy({
      blockExoticSubdeps: readProjectPnpmConfig(
        repoRoot,
        "blockExoticSubdeps",
      ),
      minimumReleaseAge: readProjectPnpmConfig(repoRoot, "minimumReleaseAge"),
      minimumReleaseAgeExclude:
        readProjectPnpmConfig(repoRoot, "minimumReleaseAgeExclude") ?? [],
      trustPolicy: readProjectPnpmConfig(repoRoot, "trustPolicy"),
      trustPolicyExclude:
        readProjectPnpmConfig(repoRoot, "trustPolicyExclude") ?? [],
      trustPolicyIgnoreAfter: readProjectPnpmConfig(
        repoRoot,
        "trustPolicyIgnoreAfter",
      ),
    }),
  );
});

test("project policy cannot be supplied by inherited npm environment", () => {
  const emptyProject = mkdtempSync(path.join(os.tmpdir(), "pnpm-policy-test-"));
  const environment = {
    ...process.env,
    NPM_CONFIG_MINIMUM_RELEASE_AGE: "1",
    npm_config_minimumReleaseAge: "1",
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

test("preserves root policy for local clean consumers", () => {
  const workspace = JSON.parse(
    createConsumerPnpmWorkspace({
      rootPolicy: validateRootPnpmSupplyPolicy(validPolicy),
    }),
  );

  assert.deepEqual(workspace.minimumReleaseAgeExclude, [
    "turbo@2.11.5",
    "typescript@5.9.3",
  ]);
  assert.equal(workspace.blockExoticSubdeps, true);
  assert.equal(workspace.trustPolicy, "no-downgrade");
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
