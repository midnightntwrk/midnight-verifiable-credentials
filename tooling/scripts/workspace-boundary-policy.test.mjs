import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyWorkspacePath,
  findBoundaryViolations,
  isSupportedSourceFile,
} from "./check-package-boundaries.mjs";

test("workspace catalog has no forbidden ownership edges", () => {
  assert.deepEqual(findBoundaryViolations(), []);
});

test("ownership taxonomy keeps the retained workspaces bounded", () => {
  assert.equal(classifyWorkspacePath("packages/core/compact"), "reusable-core");
  assert.equal(classifyWorkspacePath("examples/core-composition"), "example");
  assert.equal(classifyWorkspacePath("packages/unknown/removed"), "unknown");
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
