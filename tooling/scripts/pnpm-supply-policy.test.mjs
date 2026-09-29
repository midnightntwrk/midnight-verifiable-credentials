import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const readPnpmConfig = (name) => {
  const output = execFileSync("pnpm", ["config", "get", name, "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  return output === "" ? undefined : JSON.parse(output);
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
  assert.throws(
    () =>
      validateRootPnpmSupplyPolicy({
        ...validPolicy,
        minimumReleaseAge: 1,
      }),
    /must enforce a seven-day cooldown/,
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
});

test("the real workspace enables the required supply-chain policy", () => {
  assert.doesNotThrow(() =>
    validateRootPnpmSupplyPolicy({
      blockExoticSubdeps: readPnpmConfig("blockExoticSubdeps"),
      minimumReleaseAge: readPnpmConfig("minimumReleaseAge"),
      minimumReleaseAgeExclude:
        readPnpmConfig("minimumReleaseAgeExclude") ?? [],
      trustPolicy: readPnpmConfig("trustPolicy"),
      trustPolicyExclude: readPnpmConfig("trustPolicyExclude") ?? [],
      trustPolicyIgnoreAfter: readPnpmConfig("trustPolicyIgnoreAfter"),
    }),
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
