import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { cachePathsFromManifest, inventoryManifest, manifestKeyIdentity, validateManifest } from "./compact-fixtures.mjs";

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
    ], provenance: { sourceDigest: "drifted-source" },
  };
  const result = validateManifest(root, manifest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("digest/bytes mismatch")));
  assert.ok(result.errors.some((error) => error.includes("declared artifact is missing")));
  assert.equal(result.fallbackRequired, false);
  assert.equal(result.classification, "structural-integrity-failure");
});

test("cache paths are manifest-driven and limited to public ZKP artifacts", () => {
  const manifest = {
    fixtureRoots: [{ path: "pkg/src/managed" }],
    artifacts: [
      { path: "pkg/src/managed/demo/keys/demo.verifier" },
      { path: "pkg/src/managed/demo/zkir/demo.zkir" },
      { path: "pkg/src/managed/demo/generated.js" },
    ],
  };
  assert.deepEqual(cachePathsFromManifest(manifest), [
    "pkg/src/managed/demo/keys/demo.verifier",
    "pkg/src/managed/demo/zkir/demo.zkir",
  ]);
  assert.throws(() => cachePathsFromManifest({
    fixtureRoots: [{ path: "pkg/src/managed" }],
    artifacts: [{ path: "pkg/src/managed/demo/keys/wallet.verifier" }],
  }), /forbidden private-material/u);
  assert.throws(() => cachePathsFromManifest({
    fixtureRoots: [{ path: "pkg/src/managed" }],
    artifacts: [{ path: "pkg/src/managed/../private/secret.verifier" }],
  }), /unsafe cache artifact path/u);
});

test("manifest cache identity is stable and changes when an artifact digest changes", () => {
  const manifest = {
    schemaVersion: 1, fixtureSet: "public-v1", compiler: { version: "0.30.0" },
    runtime: { packageInputs: ["package.json"] }, lockfileInputs: ["pnpm-lock.yaml"],
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    artifactPolicy: { trackedRootsOnly: true },
    provenance: { sourceDigest: "a", runtimeDigest: "b", lockfileDigest: "c" },
    artifacts: [{ path: "pkg/src/managed/demo.zkir", bytes: 1, sha256: "d", fixture: "demo" }],
    generatedAt: "first",
  };
  assert.equal(manifestKeyIdentity(manifest), manifestKeyIdentity({ ...manifest, generatedAt: "later" }));
  assert.notEqual(manifestKeyIdentity(manifest), manifestKeyIdentity({
    ...manifest, artifacts: [{ ...manifest.artifacts[0], sha256: "e" }],
  }));
  assert.notEqual(manifestKeyIdentity(manifest), manifestKeyIdentity({
    ...manifest, provenance: { ...manifest.provenance, runtimeDigest: "changed" },
  }));
  assert.notEqual(manifestKeyIdentity(manifest), manifestKeyIdentity({
    ...manifest, compiler: { version: "0.31.0" },
  }));
  assert.notEqual(manifestKeyIdentity(manifest), manifestKeyIdentity({
    ...manifest, provenance: { ...manifest.provenance, compilerVersion: "0.31.0" },
  }));
});

test("unhydrated valid LFS pointers select the explicit source rebuild fallback", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/keys"), { recursive: true });
  const oid = "a".repeat(64);
  writeFileSync(path.join(root, "pkg/src/managed/demo/keys/demo.prover"), "version https://git-lfs.github.com/spec/v1\noid sha256:" + oid + "\nsize 123456\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [{ path: "pkg/src/managed/demo/keys/demo.prover", bytes: 123456, sha256: oid }], provenance: {},
  };
  const result = validateManifest(root, manifest, { requireLfs: true, requireHydrated: true });
  assert.equal(result.ok, false);
  assert.equal(result.fallbackRequired, true);
  assert.equal(result.classification, "source-rebuild-fallback");
  assert.match(result.fallbackReason, /unhydrated-lfs-pointers|lfs-unavailable/u);
});

test("hydrated stale bytes remain a structural integrity failure", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/keys"), { recursive: true });
  writeFileSync(path.join(root, "pkg/src/managed/demo/keys/demo.verifier"), "stale\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [{ path: "pkg/src/managed/demo/keys/demo.verifier", bytes: 999, sha256: "b".repeat(64) }], provenance: {},
  };
  const result = validateManifest(root, manifest);
  assert.equal(result.ok, false);
  assert.equal(result.fallbackRequired, false);
  assert.equal(result.classification, "structural-integrity-failure");
});

test("valid artifacts plus source/runtime/lockfile drift select source rebuild fallback", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/compiler"), { recursive: true });
  mkdirSync(path.join(root, "pkg/src"), { recursive: true });
  writeFileSync(path.join(root, "pkg/src/demo.compact"), "export circuit demo {}\n");
  writeFileSync(path.join(root, "pkg/package.json"), "{}\n");
  writeFileSync(path.join(root, "pkg/pnpm-lock.yaml"), "lockfileVersion: 9\n");
  writeFileSync(path.join(root, "pkg/src/managed/demo/compiler/contract-info.json"), "fixture\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: ["pkg/pnpm-lock.yaml"], runtime: { packageInputs: ["pkg/package.json"] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [{ path: "pkg/src/managed/demo/compiler/contract-info.json", bytes: 8, sha256: "e80b71cd14d3cbd65f4173abcbfcf01a545dbca32a72d575108b553a648cc96f", fixture: "demo" }],
    provenance: { sourceDigest: "drifted-source", runtimeDigest: "drifted-runtime", lockfileDigest: "drifted-lockfile" },
  };
  const result = validateManifest(root, manifest);
  assert.equal(result.ok, false);
  assert.equal(result.fallbackRequired, true);
  assert.equal(result.fallbackReason, "input-provenance-drift");
  assert.equal(result.classification, "source-rebuild-fallback");
  assert.equal(result.errors.length, 3);
  assert.ok(result.errors.every((error) => /(?:input )?digest mismatch$/u.test(error)));
});

test("invalid artifact plus provenance drift remains a structural failure", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/compiler"), { recursive: true });
  mkdirSync(path.join(root, "pkg/src"), { recursive: true });
  writeFileSync(path.join(root, "pkg/src/demo.compact"), "export circuit demo {}\n");
  writeFileSync(path.join(root, "pkg/package.json"), "{}\n");
  writeFileSync(path.join(root, "pkg/src/managed/demo/compiler/contract-info.json"), "tampered\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [{ path: "pkg/src/managed/demo/compiler/contract-info.json", bytes: 8, sha256: "b".repeat(64), fixture: "demo" }],
    provenance: { sourceDigest: "drifted-source" },
  };
  const result = validateManifest(root, manifest);
  assert.equal(result.ok, false);
  assert.equal(result.fallbackRequired, false);
  assert.equal(result.classification, "structural-integrity-failure");
  assert.ok(result.errors.some((error) => error.includes("artifact digest/bytes mismatch")));
  assert.ok(result.errors.some((error) => error.includes("source input digest mismatch")));
});

test("unhydrated valid LFS pointers plus provenance drift select source rebuild fallback", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/keys"), { recursive: true });
  const oid = "a".repeat(64);
  writeFileSync(path.join(root, "pkg/src/managed/demo/keys/demo.prover"), `version https://git-lfs.github.com/spec/v1\noid sha256:${oid}\nsize 123456\n`);
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [{ path: "pkg/src/managed/demo/keys/demo.prover", bytes: 123456, sha256: oid, fixture: "demo" }],
    provenance: { sourceDigest: "drifted-source" },
  };
  const result = validateManifest(root, manifest, { requireLfs: true, requireHydrated: true });
  assert.equal(result.ok, false);
  assert.equal(result.fallbackRequired, true);
  assert.equal(result.classification, "source-rebuild-fallback");
  assert.ok(result.errors.includes("fixture artifact is not hydrated in the worktree: pkg/src/managed/demo/keys/demo.prover"));
  assert.ok(result.errors.includes("source input digest mismatch"));
});

test("compiler provenance drift prevents ready classification", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/compiler"), { recursive: true });
  writeFileSync(path.join(root, "pkg/src/managed/demo/compiler/contract-info.json"), "fixture\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [{ path: "pkg/src/managed/demo/compiler/contract-info.json", bytes: 8, sha256: "e80b71cd14d3cbd65f4173abcbfcf01a545dbca32a72d575108b553a648cc96f", fixture: "demo" }],
    provenance: { compilerVersion: "0.30.0" },
  };
  const previousCompilerVersion = process.env.COMPACT_COMPILER_VERSION;
  process.env.COMPACT_COMPILER_VERSION = "0.31.0";
  try {
    const result = validateManifest(root, manifest);
    assert.equal(result.ok, false);
    assert.equal(result.fallbackRequired, true);
    assert.equal(result.fallbackReason, "input-provenance-drift");
    assert.equal(result.classification, "source-rebuild-fallback");
    assert.ok(result.errors.includes("compiler provenance mismatch"));
  } finally {
    if (previousCompilerVersion === undefined) delete process.env.COMPACT_COMPILER_VERSION;
    else process.env.COMPACT_COMPILER_VERSION = previousCompilerVersion;
  }
});

test("malformed LFS pointers fail closed", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "compact-fixtures-"));
  mkdirSync(path.join(root, "pkg/src/managed/demo/keys"), { recursive: true });
  writeFileSync(path.join(root, "pkg/src/managed/demo/keys/demo.prover"), "version https://git-lfs.github.com/spec/v1\noid sha256:not-a-digest\nsize 123456\n");
  const manifest = {
    fixtureRoots: [{ id: "demo", path: "pkg/src/managed", sourceRoot: "pkg" }],
    lockfileInputs: [], runtime: { packageInputs: [] }, compiler: { version: "0.30.0" },
    artifactPolicy: { maxNormalGitBytes: 100 },
    artifacts: [{ path: "pkg/src/managed/demo/keys/demo.prover", bytes: 123456, sha256: "a".repeat(64), fixture: "demo" }],
    provenance: { sourceDigest: "drifted-source" },
  };
  const result = validateManifest(root, manifest, { requireHydrated: true });
  assert.equal(result.ok, false);
  assert.equal(result.fallbackRequired, false);
  assert.equal(result.classification, "structural-integrity-failure");
  assert.match(result.errors[0], /invalid Git LFS pointer/u);
});
