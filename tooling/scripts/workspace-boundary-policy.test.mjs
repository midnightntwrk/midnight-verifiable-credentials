import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyWorkspacePath,
  findBoundaryViolations,
} from "./check-package-boundaries.mjs";

test("workspace catalog has no forbidden ownership edges", () => {
  assert.deepEqual(findBoundaryViolations(), []);
});

test("ownership taxonomy keeps the retained workspaces bounded", () => {
  assert.equal(classifyWorkspacePath("packages/core/compact"), "reusable-core");
  assert.equal(classifyWorkspacePath("examples/core-composition"), "example");
  assert.equal(classifyWorkspacePath("packages/unknown/removed"), "unknown");
});
