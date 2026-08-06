#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const DEFAULT_MANIFEST = "tooling/fixtures/compact-public/manifest.json";
const ALLOWED = /\.(?:js|d\.ts|js\.map|json|prover|verifier|zkir|bzkir)$/u;
const LFS_ARTIFACT = /\/managed\/.*\/(?:keys\/.*\.(?:prover|verifier)|zkir\/.*\.(?:zkir|bzkir))$/u;
const CACHE_ARTIFACT = /\.(?:prover|verifier|zkir|bzkir)$/u;
const FORBIDDEN = /(?:^|[/._-])(wallet|controller|sign(?:ing)?|seed|witness|deployment|credential-secret)(?:[._/-]|$)/iu;

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const normalize = (p) => p.split(path.sep).join("/");
const readJson = (root, p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

/**
 * Return the immutable identity used by the public fixture cache key.
 * Generated timestamps and the pointer/hydrated observation are deliberately
 * excluded; paths, declared digests, source/runtime inputs, and compiler
 * identity are all included so a cache hit cannot silently use stale bytes.
 */
export function manifestKeyIdentity(manifest) {
  const identity = {
    schemaVersion: manifest.schemaVersion,
    fixtureSet: manifest.fixtureSet,
    compiler: manifest.compiler,
    runtime: manifest.runtime,
    lockfileInputs: manifest.lockfileInputs,
    fixtureRoots: manifest.fixtureRoots,
    artifactPolicy: manifest.artifactPolicy,
    provenance: {
      sourceDigest: manifest.provenance?.sourceDigest,
      compilerVersion: manifest.provenance?.compilerVersion,
      runtimeDigest: manifest.provenance?.runtimeDigest,
      lockfileDigest: manifest.provenance?.lockfileDigest,
    },
    artifacts: [...(manifest.artifacts ?? [])]
      .map(({ path: artifactPath, bytes, sha256: digest, fixture }) => ({ path: artifactPath, bytes, sha256: digest, fixture }))
      .sort((a, b) => a.path.localeCompare(b.path)),
  };
  return sha256(Buffer.from(JSON.stringify(canonicalize(identity))));
}

/**
 * Return only manifest-declared public ZKP files for actions/cache. Keeping
 * this list exact avoids caching unrelated build outputs or private material.
 */
export function cachePathsFromManifest(manifest) {
  const roots = (manifest.fixtureRoots ?? []).map((fixture) => normalize(fixture.path).replace(/\/+$/u, ""));
  const paths = [];
  for (const item of manifest.artifacts ?? []) {
    const artifactPath = normalize(item.path);
    const normalizedPath = path.posix.normalize(artifactPath);
    if (artifactPath !== normalizedPath || path.posix.isAbsolute(artifactPath) || normalizedPath.startsWith("../")) {
      throw new Error(`unsafe cache artifact path: ${artifactPath}`);
    }
    if (!CACHE_ARTIFACT.test(artifactPath)) continue;
    if (FORBIDDEN.test(artifactPath)) throw new Error(`forbidden private-material path in cache manifest: ${artifactPath}`);
    if (!roots.some((root) => artifactPath.startsWith(`${root}/`))) {
      throw new Error(`cache artifact is outside a governed fixture root: ${artifactPath}`);
    }
    paths.push(artifactPath);
  }
  return [...new Set(paths)].sort();
}

function filesUnder(root, relative) {
  const absolute = path.join(root, relative);
  if (!existsSync(absolute)) return [];
  const out = [];
  const visit = (current) => {
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current).sort()) visit(path.join(current, entry));
      return;
    }
    out.push(normalize(path.relative(root, current)));
  };
  visit(absolute);
  return out;
}

function digestFiles(root, files) {
  const hash = createHash("sha256");
  for (const file of [...new Set(files)].sort()) {
    hash.update(file).update("\0").update(readFileSync(path.join(root, file))).update("\0");
  }
  return hash.digest("hex");
}

function parseLfsPointer(bytes) {
  const text = bytes.toString("utf8");
  if (!text.startsWith("version https://git-lfs.github.com/spec/v1\n")) return null;
  const oid = text.match(/^oid sha256:([a-f0-9]{64})$/mu)?.[1];
  const size = text.match(/^size (\d+)$/mu)?.[1];
  if (!oid || !size) throw new Error("invalid Git LFS pointer");
  return { bytes: Number(size), sha256: oid, lfsPointer: true };
}

function artifactDigest(root, file) {
  const bytes = readFileSync(path.join(root, file));
  return parseLfsPointer(bytes) ?? { bytes: bytes.length, sha256: sha256(bytes), lfsPointer: false };
}

function hasLfsAttribute(root, file) {
  try {
    const result = execFileSync("git", ["check-attr", "filter", "--", file], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return result.endsWith(": filter: lfs");
  } catch {
    return false;
  }
}

function sourceFiles(root, sourceRoot) {
  const prefix = `${normalize(sourceRoot)}/`;
  return filesUnder(root, sourceRoot).filter((file) =>
    !file.startsWith(`${prefix}src/managed/`) &&
    !file.startsWith(`${prefix}dist/`) &&
    !file.includes("/target/") &&
    !file.includes("/.turbo/") &&
    !file.endsWith(".tsbuildinfo") &&
    !file.includes("/node_modules/")
  );
}

export function inventoryManifest(root, manifest) {
  const sources = [];
  const artifacts = [];
  const missingRoots = [];
  for (const fixture of manifest.fixtureRoots) {
    const rootFiles = filesUnder(root, fixture.path);
    if (rootFiles.length === 0) missingRoots.push(fixture.path);
    for (const file of rootFiles) {
      if (FORBIDDEN.test(file)) throw new Error(`forbidden private-material path in fixture root: ${file}`);
      if (!ALLOWED.test(file)) continue;
      artifacts.push({ path: file, ...artifactDigest(root, file), fixture: fixture.id });
    }
    sources.push(...sourceFiles(root, fixture.sourceRoot), `${fixture.sourceRoot}/package.json`);
  }
  const lockfiles = (manifest.lockfileInputs ?? []).filter((file) => existsSync(path.join(root, file)));
  const runtimeInputs = (manifest.runtime?.packageInputs ?? []).filter((file) => existsSync(path.join(root, file)));
  const allSourceFiles = [...new Set(sources)].filter((file) => existsSync(path.join(root, file)));
  const byFixture = Object.fromEntries(manifest.fixtureRoots.map((fixture) => [fixture.id, { files: 0, bytes: 0 }]));
  const byType = {};
  for (const item of artifacts) {
    const type = path.extname(item.path) || "<no-extension>";
    byType[type] = { files: (byType[type]?.files ?? 0) + 1, bytes: (byType[type]?.bytes ?? 0) + item.bytes };
    byFixture[item.fixture] = { files: (byFixture[item.fixture]?.files ?? 0) + 1, bytes: (byFixture[item.fixture]?.bytes ?? 0) + item.bytes };
  }
  return {
    sourceDigest: digestFiles(root, allSourceFiles),
    compilerVersion: process.env.COMPACT_COMPILER_VERSION || manifest.compiler.version,
    runtimeDigest: digestFiles(root, runtimeInputs),
    lockfileDigest: digestFiles(root, lockfiles),
    generatedAt: new Date().toISOString(),
    artifactCount: artifacts.length,
    artifactBytes: artifacts.reduce((total, item) => total + item.bytes, 0),
    byFixture,
    byType,
    largestArtifact: artifacts.reduce((largest, item) => !largest || item.bytes > largest.bytes ? item : largest, null),
    artifacts: artifacts.sort((a, b) => a.path.localeCompare(b.path)),
    missingRoots,
    sourceFiles: allSourceFiles.sort(),
  };
}

export function validateManifest(root, manifest, { allowMissing = false, requireLfs = false, requireHydrated = false } = {}) {
  let lfsFiles = null;
  let lfsCheckError = null;
  if (requireLfs) {
    try {
      lfsFiles = new Set(execFileSync("git", ["lfs", "ls-files", "--name-only"], { cwd: root, encoding: "utf8" }).split(/\r?\n/u).filter(Boolean));
    } catch (error) {
      lfsCheckError = error instanceof Error ? error.message : String(error);
    }
  }
  const errors = [];
  const hydrationErrors = [];
  let inventory;
  try { inventory = inventoryManifest(root, manifest); } catch (error) { return { ok: false, fallbackRequired: false, classification: "structural-integrity-failure", errors: [error.message] }; }
  if (inventory.missingRoots.length > 0 && !allowMissing) errors.push(`missing fixture roots: ${inventory.missingRoots.join(", ")}`);
  const expected = new Map((manifest.artifacts ?? []).map((item) => [item.path, item]));
  for (const item of inventory.artifacts) {
    const declared = expected.get(item.path);
    if (!declared) errors.push(`artifact is not declared in manifest: ${item.path}`);
    else if (declared.bytes !== item.bytes || declared.sha256 !== item.sha256) errors.push(`artifact digest/bytes mismatch: ${item.path}`);
    const lfsRequired = LFS_ARTIFACT.test(item.path);
    const lfsTracked = item.lfsPointer || hasLfsAttribute(root, item.path);
    if (requireLfs && LFS_ARTIFACT.test(item.path) && lfsFiles && !lfsFiles.has(item.path)) errors.push("fixture artifact is not present in Git LFS tracking: " + item.path);
    if (requireHydrated && item.lfsPointer) errors.push("fixture artifact is not hydrated in the worktree: " + item.path);
    if (requireHydrated && item.lfsPointer) hydrationErrors.push("fixture artifact is not hydrated in the worktree: " + item.path);
    if (lfsRequired && !lfsTracked) errors.push(`fixture artifact is not Git LFS tracked: ${item.path}`);
    if (item.bytes > (manifest.artifactPolicy?.maxNormalGitBytes ?? 104857600) && !lfsTracked) errors.push(`oversized artifact requires Git LFS: ${item.path} (${item.bytes} bytes)`);
  }
  for (const item of expected.values()) if (!inventory.artifacts.some((actual) => actual.path === item.path)) errors.push(`declared artifact is missing: ${item.path}`);
  if (manifest.provenance?.sourceDigest && manifest.provenance.sourceDigest !== inventory.sourceDigest) errors.push("source input digest mismatch");
  if (manifest.provenance?.runtimeDigest && manifest.provenance.runtimeDigest !== inventory.runtimeDigest) errors.push("runtime input digest mismatch");
  if (manifest.provenance?.lockfileDigest && manifest.provenance.lockfileDigest !== inventory.lockfileDigest) errors.push("lockfile digest mismatch");
  const onlyHydrationFailure = hydrationErrors.length > 0 && errors.length === hydrationErrors.length &&
    inventory.artifacts.every((item) => item.lfsPointer || !LFS_ARTIFACT.test(item.path));
  const lfsUnavailable = Boolean(lfsCheckError) && inventory.artifacts.some((item) => item.lfsPointer) &&
    errors.every((error) => error.startsWith("fixture artifact is not hydrated in the worktree: "));
  const fallbackRequired = onlyHydrationFailure || lfsUnavailable;
  const fallbackReason = onlyHydrationFailure ? "unhydrated-lfs-pointers" : lfsUnavailable ? "lfs-unavailable" : null;
  const classification = errors.length === 0 ? "ready" : fallbackRequired ? "source-rebuild-fallback" : "structural-integrity-failure";
  return { ok: errors.length === 0, fallbackRequired, fallbackReason, classification, errors, inventory };
}

export function updateManifest(root, manifestPath = DEFAULT_MANIFEST) {
  const absolute = path.join(root, manifestPath);
  const manifest = readJson(root, manifestPath);
  const inventory = inventoryManifest(root, manifest);
  const oversized = inventory.artifacts.filter((item) => item.bytes > manifest.artifactPolicy.maxNormalGitBytes);
  let lfsAvailable = false;
  try { execFileSync("git", ["lfs", "version"], { stdio: "ignore" }); lfsAvailable = true; } catch {}
  if (oversized.length > 0 && !lfsAvailable) throw new Error(`Git LFS unavailable; refusing to write oversized fixtures: ${oversized.map((item) => `${item.path} (${item.bytes} bytes)`).join(", ")}`);
  const { artifacts: _artifacts, missingRoots: _missingRoots, sourceFiles: _sourceFiles, ...provenance } = inventory;
  const next = { ...manifest, status: inventory.artifactCount ? "validated" : "awaiting-lfs-storage", provenance: { ...manifest.provenance, ...provenance }, artifacts: inventory.artifacts };
  writeFileSync(absolute, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

if (process.argv[1]?.endsWith("compact-fixtures.mjs")) {
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const args = new Set(process.argv.slice(2));
  const manifestPath = process.argv.includes("--manifest") ? process.argv[process.argv.indexOf("--manifest") + 1] : DEFAULT_MANIFEST;
  const manifest = readJson(root, manifestPath);
  if (args.has("--update")) { console.log(JSON.stringify(updateManifest(root, manifestPath), null, 2)); process.exit(0); }
  if (args.has("--cache-key")) { console.log(manifestKeyIdentity(manifest)); process.exit(0); }
  if (args.has("--cache-paths")) { console.log(cachePathsFromManifest(manifest).join("\n")); process.exit(0); }
  const result = validateManifest(root, manifest, { allowMissing: args.has("--allow-missing"), requireLfs: args.has("--require-lfs"), requireHydrated: args.has("--require-hydrated") });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok && !(args.has("--allow-missing") && result.fallbackRequired)) process.exit(1);
}
