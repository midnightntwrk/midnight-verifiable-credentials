#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, rmSync, renameSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const schema = 1;
const usage = "ensure-compact-artifacts.mjs --manifest <path> --source-root <path> --output <path> [--output <path> ...] [--runtime-version <version>] -- <compiler command>";

const parseArgs = (argv) => {
  const options = { outputs: [], command: [] };
  let separator = argv.indexOf("--");
  if (separator < 0) separator = argv.length;
  for (let index = 0; index < separator; index += 1) {
    const arg = argv[index];
    if (arg === "--manifest" || arg === "--source-root" || arg === "--output" || arg === "--runtime-version") {
      const value = argv[++index];
      if (!value) throw new Error(`${arg} requires a value`);
      if (arg === "--output") options.outputs.push(value); else if (arg === "--source-root") options.sourceRoot = value;
      else if (arg === "--runtime-version") options.runtime = value; else options[arg.slice(2).replaceAll("-", "_")] = value;
    } else {
      throw new Error(`Unknown argument: ${arg}\nUsage: ${usage}`);
    }
  }
  options.command = argv.slice(separator + 1);
  if (!options.manifest || !options.sourceRoot || options.outputs.length === 0 || options.command.length === 0) {
    throw new Error(`Missing required argument. Usage: ${usage}`);
  }
  return options;
};

const filesUnder = (root) => {
  const files = [];
  const visit = (current) => {
    if (!existsSync(current)) return;
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current).sort()) visit(path.join(current, entry));
    } else {
      files.push(current);
    }
  };
  visit(root);
  return files;
};

const digest = (root, files) => {
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(path.relative(root, file).split(path.sep).join("/"));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
};

const sourceDigest = (root, sourceRoot) => {
  const files = filesUnder(path.resolve(root, sourceRoot)).filter((file) =>
    file.endsWith(".compact"),
  );
  if (files.length === 0) throw new Error(`No Compact source files found below ${sourceRoot}`);
  return digest(root, files);
};

const compilerVersion = () => execFileSync("compact", ["compile", "--version"], { encoding: "utf8" }).trim();

const runtimeVersion = (root, explicit) => {
  if (explicit) return explicit;
  const require = createRequire(import.meta.url);
  const runtimePackage = require.resolve("@midnight-ntwrk/compact-runtime/package.json", { paths: [root] });
  return JSON.parse(readFileSync(runtimePackage, "utf8")).version;
};

const outputIsValid = (root, output) => {
  const directory = path.resolve(root, output);
  return existsSync(path.join(directory, "contract", "index.js"));
};

const readManifest = (root, manifestPath) => {
  try { return JSON.parse(readFileSync(path.resolve(root, manifestPath), "utf8")); }
  catch { return null; }
};

export const ensureArtifacts = ({ root = process.cwd(), manifest, sourceRoot, outputs, runtime, command, env = process.env }) => {
  const absoluteRoot = path.resolve(root);
  const currentSourceDigest = sourceDigest(absoluteRoot, sourceRoot);
  const currentCompiler = compilerVersion();
  const currentRuntime = runtimeVersion(absoluteRoot, runtime);
  const previous = readManifest(absoluteRoot, manifest);
  const outputPaths = [...new Set([...(previous?.outputs ?? []), ...outputs])];
  const reusable = previous?.schema === schema
    && previous.sourceRoot === sourceRoot
    && previous.sourceDigest === currentSourceDigest
    && previous.compiler === currentCompiler
    && previous.runtime === currentRuntime
    && outputPaths.every((output) => outputIsValid(absoluteRoot, output));

  if (reusable) {
    console.log(`[compact-artifacts] Reusing validated outputs (${manifest})`);
    return { reused: true, sourceDigest: currentSourceDigest, compiler: currentCompiler, runtime: currentRuntime };
  }

  for (const output of outputs) rmSync(path.resolve(absoluteRoot, output), { recursive: true, force: true });
  const result = spawnSync(command[0], command.slice(1), { cwd: absoluteRoot, env, stdio: "inherit" });
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  if (result.status !== 0) throw new Error(`Compact generation failed with exit status ${result.status}`);
  if (!outputs.every((output) => outputIsValid(absoluteRoot, output))) {
    throw new Error(`Compact generation completed without all required outputs: ${outputs.join(", ")}`);
  }
  const manifestFile = path.resolve(absoluteRoot, manifest);
  mkdirSync(path.dirname(manifestFile), { recursive: true });
  const temporary = `${manifestFile}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify({ schema, sourceRoot, sourceDigest: currentSourceDigest, compiler: currentCompiler, runtime: currentRuntime, outputs: outputPaths }, null, 2)}\n`);
  renameSync(temporary, manifestFile);
  console.log(`[compact-artifacts] Generated validated outputs (${manifest})`);
  return { reused: false, sourceDigest: currentSourceDigest, compiler: currentCompiler, runtime: currentRuntime };
};

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    ensureArtifacts(options);
  } catch (error) {
    console.error(`[compact-artifacts] ${error.message}`);
    process.exitCode = 1;
  }
}
