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
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 }, artifacts: [], provenance: {},
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

test("validation accepts an LFS pointer as the checked-out artifact", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/keys"), { recursive: true });
  const oid = "a".repeat(64);
  writeFileSync(path.join(root, "pkg/src/managed/demo/keys/demo.prover"), `version https://git-lfs.github.com/spec/v1\noid sha256:${oid}\nsize 123456\n`);
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [{ path: "pkg/src/managed/demo/keys/demo.prover", bytes: 123456, sha256: oid }], provenance: {},
  };
  const result = validateManifest(root, manifest);
  assert.equal(result.ok, true);
  assert.equal(result.inventory.artifacts[0].lfsPointer, true);
});

test("validation rejects stale and missing manifest artifacts", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/compiler"), { recursive: true });
  writeFileSync(path.join(root, "pkg/src/managed/demo/compiler/contract-info.json"), "current\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [
      { path: "pkg/src/managed/demo/compiler/contract-info.json", bytes: 99, sha256: "b".repeat(64) },
      { path: "pkg/src/managed/demo/compiler/missing.json", bytes: 1, sha256: "c".repeat(64) },
    ], provenance: {},
  };
  const result = validateManifest(root, manifest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("digest/bytes mismatch")));
  assert.ok(result.errors.some((error) => error.includes("declared artifact is missing")));
});
