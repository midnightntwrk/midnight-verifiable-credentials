import assert from "node:assert/strict";
import test from "node:test";

import {
  createConsumerPnpmWorkspace,
  validateRootPnpmSupplyPolicy,
} from "./pnpm-supply-policy.mjs";

const validPolicy = {
  blockExoticSubdeps: true,
  minimumReleaseAge: 10080,
  minimumReleaseAgeExclude: ["turbo@2.11.5", "typescript"],
  trustPolicy: "no-downgrade",
  trustPolicyExclude: [],
};

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
});

test("rejects broad and duplicate policy exceptions", () => {
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: ["@midnight-ntwrk/*"],
      }),
    /must not contain wildcard selector/,
  );
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAgeExclude: ["turbo@2.11.4", "turbo@2.11.5"],
      }),
    /more than one selector for turbo/,
  );
});

test("preserves root policy for local clean consumers", () => {
  const workspace = JSON.parse(
    createConsumerPnpmWorkspace({
      rootPolicy: validateRootPnpmSupplyPolicy(validPolicy),
    }),
  );

  assert.deepEqual(workspace.minimumReleaseAgeExclude, [
    "turbo@2.11.5",
    "typescript",
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
});
