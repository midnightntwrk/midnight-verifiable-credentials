import test from "node:test";
import assert from "node:assert/strict";
import { findBoundaryViolations, classifyWorkspacePath, migrationExceptions } from "./check-package-boundaries.mjs";

test("workspace catalog has no forbidden ownership edges", () => {
  assert.deepEqual(findBoundaryViolations(), []);
});

test("ownership taxonomy keeps family evidence below reusable core", () => {
  assert.equal(classifyWorkspacePath("packages/core/primitives/credentials"), "reusable-core");
  assert.equal(classifyWorkspacePath("packages/prototypes/credential-families/birth"), "prototype");
  assert.equal(classifyWorkspacePath("packages/use-cases/age-gate/contract"), "use-case");
  assert.ok(migrationExceptions["packages/components/orchestration/protocol"]);
});
