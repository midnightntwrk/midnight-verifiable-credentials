import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyWorkspacePath,
  familySourceImportPaths,
  findBoundaryViolations,
  findFamilyNeutralExchangeSourceImportViolations,
  findFamilySourceImportViolations,
  isProhibitedFamilyDependency,
  isSupportedSourceFile,
  leastPrivilegeStatusDependencyEdges,
  migrationExceptions,
  prohibitedFamilyDependencyClasses,
  transitiveWorkspaceDependencyPaths,
  workspaceDependencyPaths,
} from "./check-package-boundaries.mjs";

test("workspace catalog has no forbidden ownership edges", () => {
  assert.deepEqual(findBoundaryViolations(), []);
});

test("ownership taxonomy keeps family evidence below reusable core", () => {
  assert.equal(classifyWorkspacePath("packages/core/primitives/credentials"), "reusable-core");
  assert.equal(classifyWorkspacePath("packages/prototypes/credential-families/birth"), "prototype");
  assert.equal(classifyWorkspacePath("packages/use-cases/age-gate/contract"), "use-case");
  assert.ok(migrationExceptions["packages/components/orchestration/protocol"]);
});

test("family packages deny protocol, orchestration, and use-case dependencies", () => {
  assert.deepEqual(prohibitedFamilyDependencyClasses, ["protocol", "use-case"]);
  assert.equal(isProhibitedFamilyDependency("packages/protocols/openid"), true);
  assert.equal(
    isProhibitedFamilyDependency("packages/components/orchestration/exchange"),
    true,
  );
  assert.equal(isProhibitedFamilyDependency("packages/core/compact"), false);
  assert.ok(
    !workspaceDependencyPaths(
      "packages/prototypes/credential-families/digital-passport",
    ).includes("packages/protocols/openid"),
  );
  assert.ok(
    familySourceImportPaths(
      "packages/prototypes/credential-families/digital-passport",
    ).includes("packages/core/compact"),
  );
  assert.deepEqual(findFamilySourceImportViolations(), []);
});

test("family-neutral exchange depends only on canonical reusable core", () => {
  assert.deepEqual(
    workspaceDependencyPaths("packages/components/orchestration/exchange"),
    ["packages/core/model", "packages/core/proofs"],
  );
  assert.deepEqual(findFamilyNeutralExchangeSourceImportViolations(), []);
});

test("status verifier/read consumers cannot import mutation or signing authority transitively", () => {
  const verifier = "packages/registry/status-midnight-verifier";
  const contract = "packages/registry/status-midnight-contract";
  const authority = "packages/registry/status-midnight-authority";
  assert.deepEqual(
    leastPrivilegeStatusDependencyEdges[verifier],
    ["packages/core/status", contract],
  );
  assert.ok(!transitiveWorkspaceDependencyPaths(verifier).includes(authority));
  assert.ok(!transitiveWorkspaceDependencyPaths(contract).includes(authority));
  assert.deepEqual(workspaceDependencyPaths(authority), [
    "packages/core/proofs",
    contract,
  ]);
});

test("source import guards scan every supported JavaScript module extension", () => {
  for (const extension of [
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".ts",
    ".tsx",
    ".mts",
    ".cts",
  ]) {
    assert.equal(isSupportedSourceFile(`source${extension}`), true, extension);
  }
  assert.equal(isSupportedSourceFile("source.d.mts"), true);
  assert.equal(isSupportedSourceFile("README.md"), false);
});
