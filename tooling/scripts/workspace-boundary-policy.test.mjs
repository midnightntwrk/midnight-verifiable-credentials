import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyWorkspacePath,
  findBoundaryViolations,
  isSupportedSourceFile,
  leastPrivilegeStatusDependencyEdges,
  transitiveWorkspaceDependencyPaths,
  workspaceDependencyPaths,
} from "./check-package-boundaries.mjs";

test("workspace catalog has no forbidden ownership edges", () => {
  assert.deepEqual(findBoundaryViolations(), []);
});

test("ownership taxonomy keeps the retained workspaces bounded", () => {
  assert.equal(classifyWorkspacePath("packages/core/primitives/credentials"), "reusable-core");
  assert.equal(classifyWorkspacePath("packages/registry/status-registry"), "registry");
  assert.equal(classifyWorkspacePath("packages/components/adapters/offchain-did"), "component");
  assert.equal(classifyWorkspacePath("examples/core-composition"), "example");
});

test("status verifier/proof consumers cannot import mutation or signing authority transitively", () => {
  const verifier = "packages/registry/status-midnight-verifier";
  const contract = "packages/registry/status-midnight-contract";
  const authority = "packages/registry/status-midnight-authority";
  assert.deepEqual(
    leastPrivilegeStatusDependencyEdges[verifier],
    ["packages/core/proofs", "packages/core/status", contract],
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
