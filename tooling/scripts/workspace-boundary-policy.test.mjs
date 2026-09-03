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
  migrationExceptions,
  prohibitedFamilyDependencyClasses,
  workspaceDependencyPaths,
  workspacePathForImport,
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

test("relative imports resolve to workspace paths before denied-edge classification", () => {
  assert.equal(
    workspacePathForImport(
      "../../../../protocols/openid/dist/index.js",
      "packages/prototypes/credential-families/digital-passport/src/codecs.ts",
    ),
    "packages/protocols/openid",
  );
});

test("family-neutral exchange depends only on the canonical model", () => {
  assert.deepEqual(
    workspaceDependencyPaths("packages/components/orchestration/exchange"),
    ["packages/core/model"],
  );
  assert.deepEqual(findFamilyNeutralExchangeSourceImportViolations(), []);
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
