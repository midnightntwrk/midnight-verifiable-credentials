#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, relative, resolve, sep } from "node:path";
import { createBuildManifest, computeSha256Digest } from "@midnight-ntwrk/credential-proofs";

const scriptPath = fileURLToPath(import.meta.url);
const packageRoot = resolve(dirname(scriptPath), "..");
const repositoryRoot = resolve(packageRoot, "../..", "..");
const require = createRequire(resolve(packageRoot, "package.json"));

const toPosix = (value) => value.split(sep).join("/");
const relativePath = (root, file) => toPosix(relative(root, file));
const digest = (bytes) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;

const filesUnder = (directory) => {
  if (!existsSync(directory)) return [];
  const files = [];
  const visit = (current) => {
    for (const name of readdirSync(current).sort()) {
      const file = resolve(current, name);
      if (statSync(file).isDirectory()) visit(file);
      else files.push(file);
    }
  };
  visit(directory);
  return files;
};

const git = (...args) => execFileSync("git", args, {
  cwd: repositoryRoot,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
}).trim();

const generatedSourceRoot = relativePath(repositoryRoot, resolve(packageRoot, "src/managed"));

export const filterUnexpectedChanges = (status, generatedRoot = generatedSourceRoot) => status
  .split("\n")
  .filter((line) => {
    if (line === "" || !line.startsWith("?? ")) return line !== "";
    const path = line.slice(3).replace(/^"|"$/gu, "");
    return path !== generatedRoot && !path.startsWith(`${generatedRoot}/`);
  });

const assertNonEmpty = (value, label) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} is required`);
  }
  return value;
};

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

const resolveRuntimeVersion = () => {
  const runtimePackage = require.resolve("@midnight-ntwrk/compact-runtime/package.json");
  return readJson(runtimePackage).version;
};

const resolveCompilerVersion = () => {
  const output = execFileSync("compact", ["compile", "--version"], { encoding: "utf8" }).trim();
  const version = output.match(/(?:^|\s)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\s|$)/u)?.[1];
  return assertNonEmpty(version, "Compact compiler version");
};

const ensureCleanTree = () => {
  const status = git("status", "--porcelain", "--untracked-files=all");
  const unexpectedChanges = filterUnexpectedChanges(status);
  if (unexpectedChanges.length > 0) {
    throw new Error("source tree must be clean before generating a release build manifest");
  }
};

export const classifyArtifact = (path) => {
  if (/(?:^|\/)keys\/[^/]+\.prover$/u.test(path)) return ["prover-key", "application/octet-stream"];
  if (/(?:^|\/)keys\/[^/]+\.verifier$/u.test(path)) return ["verifier-key", "application/octet-stream"];
  if (/(?:^|\/)zkir\/.+\.bzkir$/u.test(path) || /\.z(?:kir|key)$/u.test(path)) return ["circuit", "application/octet-stream"];
  if (/\.(?:compact)$/u.test(path)) return ["metadata", "text/plain"];
  if (/\.(?:js|mjs|cjs|d\.ts|js\.map|d\.ts\.map)$/u.test(path) || path.startsWith("managed/")) return ["managed-code", "application/javascript"];
  return ["metadata", path.endsWith(".json") ? "application/json" : "application/octet-stream"];
};

const enumerateArtifacts = async (outputRoot, expectedPaths) => {
  const files = filesUnder(outputRoot).filter((file) => {
    const path = relativePath(outputRoot, file);
    return path !== "build-manifest.json" && path !== "compact-build.json";
  });
  const actualPaths = files.map((file) => relativePath(outputRoot, file));
  if (actualPaths.length === 0) throw new Error("generated output contains no artifacts");
  if (expectedPaths !== undefined) {
    const expected = [...expectedPaths].sort();
    const actual = [...actualPaths].sort();
    if (expected.length !== actual.length || expected.some((path, index) => path !== actual[index])) {
      const missing = expected.filter((path) => !actual.includes(path));
      const extra = actual.filter((path) => !expected.includes(path));
      throw new Error(`generated artifact inventory mismatch (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"})`);
    }
  }
  const artifacts = [];
  for (const file of files) {
    const path = relativePath(outputRoot, file);
    const bytes = readFileSync(file);
    const [role, mediaType] = classifyArtifact(path);
    artifacts.push({
      id: `compact/${path}`,
      role,
      mediaType,
      path,
      bytes: bytes.byteLength,
      sha256: digest(bytes),
    });
  }
  return artifacts.sort((left, right) => left.id.localeCompare(right.id));
};

const buildCircuitDescriptors = (config, artifacts) => config.circuits.map((circuit) => {
  assertNonEmpty(circuit.id, "buildManifest.circuits[].id");
  assertNonEmpty(circuit.version, `buildManifest.circuits[${circuit.id}].version`);
  assertNonEmpty(circuit.artifactPathPrefix, `buildManifest.circuits[${circuit.id}].artifactPathPrefix`);
  const artifactIds = artifacts
    .filter((artifact) => artifact.path.startsWith(circuit.artifactPathPrefix))
    .map((artifact) => artifact.id);
  if (artifactIds.length === 0) throw new Error(`circuit ${circuit.id} has no generated artifacts under ${circuit.artifactPathPrefix}`);
  return {
    id: circuit.id,
    version: circuit.version,
    parameters: circuit.parameters ?? {},
    artifactIds,
  };
});

export const createBuildManifestFromOutput = async ({
  outputRoot = resolve(packageRoot, "dist"),
  packageJson = readJson(resolve(packageRoot, "package.json")),
  expectedPaths,
  sourceCommit,
  compilerVersion = resolveCompilerVersion(),
  runtimeVersion = resolveRuntimeVersion(),
  enforceCleanTree = true,
} = {}) => {
  const config = packageJson.midnight?.buildManifest;
  if (config === undefined || typeof config !== "object") throw new Error("midnight.buildManifest configuration is required");
  const configuredExpectedPaths = config.expectedArtifactPaths;
  const inventory = expectedPaths ?? configuredExpectedPaths;
  if (!Array.isArray(inventory) || inventory.length === 0 || inventory.some((path) => typeof path !== "string" || path.length === 0)) {
    throw new Error("build manifest requires an explicit expected artifact inventory");
  }
  if (!enforceCleanTree && process.env.NODE_ENV !== "test") {
    throw new Error("clean-tree enforcement may only be disabled by tests");
  }
  if (enforceCleanTree) ensureCleanTree();
  const resolvedSourceCommit = assertNonEmpty(sourceCommit ?? git("rev-parse", "HEAD"), "sourceCommit");
  const expectedCompiler = assertNonEmpty(packageJson.midnight?.compactCompilerVersion, "midnight.compactCompilerVersion");
  const expectedRuntime = assertNonEmpty(packageJson.midnight?.compactRuntimeVersion, "midnight.compactRuntimeVersion");
  if (compilerVersion !== expectedCompiler) throw new Error(`Compact compiler mismatch: expected ${expectedCompiler}, got ${compilerVersion}`);
  if (runtimeVersion !== expectedRuntime) throw new Error(`Compact runtime mismatch: expected ${expectedRuntime}, got ${runtimeVersion}`);
  const lockfile = resolve(repositoryRoot, "pnpm-lock.yaml");
  if (!existsSync(lockfile)) throw new Error("pnpm-lock.yaml is required for build manifest generation");
  const artifacts = await enumerateArtifacts(outputRoot, inventory);
  const circuits = buildCircuitDescriptors(config, artifacts);
  const lockfileDigest = await computeSha256Digest(new Uint8Array(readFileSync(lockfile)));
  return createBuildManifest({
    formatVersion: 1,
    manifestKind: "build",
    productId: assertNonEmpty(config.productId, "buildManifest.productId"),
    packageName: assertNonEmpty(packageJson.name, "package.name"),
    schemaId: assertNonEmpty(config.schemaId, "buildManifest.schemaId"),
    contractId: assertNonEmpty(config.contractId, "buildManifest.contractId"),
    sourceCommit: resolvedSourceCommit,
    cleanTree: true,
    toolchain: {
      compactCompiler: compilerVersion,
      runtime: runtimeVersion,
      generator: "write-build-manifest@1",
    },
    circuits,
    proofs: [],
    artifacts,
    lockfileDigest,
  });
};

const writeLegacyManifest = (outputRoot, compilerVersion, runtimeVersion, sourceFiles, artifacts) => {
  const sourceDigest = digest(Buffer.concat(sourceFiles.map((file) => Buffer.concat([Buffer.from(relativePath(packageRoot, file)), readFileSync(file)]))));
  const artifactDigest = digest(Buffer.concat(artifacts.map((artifact) => Buffer.concat([Buffer.from(artifact.path), readFileSync(resolve(outputRoot, artifact.path))]))));
  writeFileSync(resolve(outputRoot, "compact-build.json"), `${JSON.stringify({
    schema: 1,
    compiler: compilerVersion,
    runtime: { name: "@midnight-ntwrk/compact-runtime", version: runtimeVersion },
    sourceDigest,
    artifactDigest,
    sourceFiles: sourceFiles.map((file) => relativePath(packageRoot, file)),
  }, null, 2)}\n`);
};

export const writeBuildManifests = async (options = {}) => {
  const outputRoot = options.outputRoot ?? resolve(packageRoot, "dist");
  const packageJson = options.packageJson ?? readJson(resolve(packageRoot, "package.json"));
  const compilerVersion = options.compilerVersion ?? resolveCompilerVersion();
  const runtimeVersion = options.runtimeVersion ?? resolveRuntimeVersion();
  const sourceFiles = filesUnder(resolve(packageRoot, "src")).filter((file) => file.endsWith(".compact") && !file.includes(`${sep}managed${sep}`));
  const manifest = await createBuildManifestFromOutput({
    ...options,
    outputRoot,
    packageJson,
    compilerVersion,
    runtimeVersion,
    expectedPaths: options.expectedPaths ?? packageJson.midnight?.buildManifest?.expectedArtifactPaths,
  });
  writeFileSync(resolve(outputRoot, "build-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeLegacyManifest(outputRoot, compilerVersion, runtimeVersion, sourceFiles, manifest.artifacts);
  return manifest;
};

if (process.argv[1] !== undefined && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await writeBuildManifests();
}
