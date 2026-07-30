import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { inventoryManifest, validateManifest } from "./compact-fixtures.mjs";

test("fixture inventory records bytes and sha256 for the curated root", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/keys"), { recursive: true });
  mkdirSync(path.join(root, "pkg/src"), { recursive: true });
  writeFileSync(path.join(root, "pkg/src/demo.compact"), "export circuit demo {}\n");
  writeFileSync(path.join(root, "pkg/package.json"), "{}\n");
  writeFileSync(path.join(root, "pkg/src/managed/demo/keys/demo.verifier"), "public-key\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [],
    runtime: { packageInputs: [] },
    compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [],
    provenance: {},
  };
  const inventory = inventoryManifest(root, manifest);
  assert.equal(inventory.artifactCount, 1);
  assert.equal(inventory.artifacts[0].bytes, 11);
  assert.match(inventory.artifacts[0].sha256, /^[a-f0-9]{64}$/u);
});

test("validation fails closed on undeclared artifacts and private material", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/keys"), { recursive: true });
  writeFileSync(path.join(root, "pkg/src/managed/demo/keys/demo.prover"), "fixture\n");
  writeFileSync(path.join(root, "pkg/src/managed/demo/controller.key"), "private\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 }, artifacts: [], provenance: {},
  };
  const result = validateManifest(root, manifest);
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /forbidden private-material/u);
});
