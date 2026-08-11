#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, rmSync, renameSync, realpathSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const schema = 1;
const lockTimeoutMs = 5 * 60 * 1000;
const ownerlessLockGraceMs = 1000;
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

const isWithin = (root, candidate) => {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
};

const assertPackagePath = (packageRoot, value, label, { allowRoot = false } = {}) => {
  if (typeof value !== "string" || value.length === 0 || value.includes(String.fromCharCode(0))) {
    throw new Error(`${label} must be a non-empty path inside the package root`);
  }
  const resolved = path.resolve(packageRoot, value);
  if ((!allowRoot && resolved === packageRoot) || !isWithin(packageRoot, resolved)) {
    throw new Error(`${label} must remain inside the package root: ${value}`);
  }
  let existing = resolved;
  while (!existsSync(existing) && existing !== packageRoot) existing = path.dirname(existing);
  if (!isWithin(realpathSync(packageRoot), realpathSync(existing))) {
    throw new Error(`${label} must remain inside the package root: ${value}`);
  }
  return resolved;
};

const filesUnder = (root, boundary) => {
  const files = [];
  const visit = (current) => {
    if (!existsSync(current)) return;
    if (!isWithin(boundary, realpathSync(current))) {
      throw new Error(`Compact source path escapes the package root: ${current}`);
    }
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
  for (const file of files.sort()) {
    hash.update(path.relative(root, file).split(path.sep).join("/"));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
};

const repositoryRootFor = (packageRoot) => {
  try {
    return realpathSync(execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: packageRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim());
  } catch {
    return realpathSync(packageRoot);
  }
};

const resolveInclude = (includingFile, includePath, repositoryRoot) => {
  if (path.isAbsolute(includePath) || includePath.includes(String.fromCharCode(0))) return undefined;
  const requested = path.resolve(path.dirname(includingFile), includePath);
  if (!isWithin(repositoryRoot, requested)) return undefined;
  const candidates = [requested, `${requested}.compact`];
  if (existsSync(requested) && statSync(requested).isDirectory()) {
    candidates.push(path.join(requested, `${path.basename(requested)}.compact`));
  }
  return candidates.find((candidate) => {
    if (!existsSync(candidate) || !statSync(candidate).isFile() || !candidate.endsWith(".compact")) return false;
    return isWithin(repositoryRoot, realpathSync(candidate));
  });
};

const skipTrivia = (contents, start, file) => {
  let index = start;
  while (index < contents.length) {
    if (/\s/u.test(contents[index])) { index += 1; continue; }
    if (contents.startsWith("//", index)) {
      const end = contents.indexOf("\n", index + 2);
      index = end < 0 ? contents.length : end + 1;
      continue;
    }
    if (contents.startsWith("/*", index)) {
      const end = contents.indexOf("*/", index + 2);
      if (end < 0) throw new Error(`Unterminated Compact comment in ${file}`);
      index = end + 2;
      continue;
    }
    break;
  }
  return index;
};

const compactIncludes = (contents, file) => {
  const includes = [];
  let index = 0;
  while (index < contents.length) {
    index = skipTrivia(contents, index, file);
    if (index >= contents.length) break;
    if (contents[index] === '"' || contents[index] === "'") {
      const quote = contents[index++];
      while (index < contents.length) {
        if (contents[index] === "\\") index += 2;
        else if (contents[index++] === quote) break;
      }
      continue;
    }
    if (!/[A-Za-z_$]/u.test(contents[index])) { index += 1; continue; }
    const wordStart = index;
    while (index < contents.length && /[A-Za-z0-9_$]/u.test(contents[index])) index += 1;
    if (contents.slice(wordStart, index) !== "include") continue;
    index = skipTrivia(contents, index, file);
    const quote = contents[index];
    if (quote !== '"' && quote !== "'") throw new Error(`Malformed Compact include directive in ${file}`);
    index += 1;
    let includePath = "";
    let closed = false;
    while (index < contents.length) {
      if (contents[index] === "\\") {
        if (index + 1 >= contents.length) break;
        includePath += contents[index + 1]; index += 2;
      } else if (contents[index] === quote) {
        index += 1; closed = true; break;
      } else {
        includePath += contents[index++];
      }
    }
    if (!closed) throw new Error(`Malformed Compact include directive in ${file}`);
    index = skipTrivia(contents, index, file);
    if (contents[index] === ";") index += 1;
    includes.push(includePath);
  }
  return includes;
};

const compactInputs = (root, sourceRoot, repositoryRoot) => {
  const initial = filesUnder(sourceRoot, root).filter((file) => file.endsWith(".compact"));
  if (initial.length === 0) throw new Error(`No Compact source files found below ${sourceRoot}`);

  const inputs = new Set(initial);
  const pending = [...initial];
  while (pending.length > 0) {
    const file = pending.pop();
    for (const includePath of compactIncludes(readFileSync(file, "utf8"), path.relative(root, file))) {
      const dependency = resolveInclude(file, includePath, repositoryRoot);
      if (!dependency) throw new Error(`Unresolved Compact include ${includePath} from ${path.relative(root, file)}`);
      if (!inputs.has(dependency)) {
        inputs.add(dependency);
        pending.push(dependency);
      }
    }
  }
  return [...inputs];
};

const sourceDigest = (root, sourceRoot, repositoryRoot) => digest(root, compactInputs(root, sourceRoot, repositoryRoot));

const compilerVersion = () => execFileSync("compact", ["compile", "--version"], { encoding: "utf8" }).trim();

const runtimeVersion = (root, explicit) => {
  if (explicit) return explicit;
  const require = createRequire(import.meta.url);
  const runtimePackage = require.resolve("@midnight-ntwrk/compact-runtime/package.json", { paths: [root] });
  return JSON.parse(readFileSync(runtimePackage, "utf8")).version;
};

const outputIsValid = (output) => existsSync(path.join(output, "contract", "index.js"));

const validManifest = (manifest, packageRoot) => {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return false;
  if (typeof manifest.schema !== "number" || typeof manifest.sourceRoot !== "string"
      || typeof manifest.sourceDigest !== "string" || !/^[a-f0-9]{64}$/u.test(manifest.sourceDigest)
      || typeof manifest.compiler !== "string" || typeof manifest.runtime !== "string"
      || !Array.isArray(manifest.outputs) || manifest.outputs.length === 0
      || manifest.outputs.some((output) => typeof output !== "string" || output.length === 0)
      || new Set(manifest.outputs).size !== manifest.outputs.length) return false;
  try {
    assertPackagePath(packageRoot, manifest.sourceRoot, "Manifest sourceRoot", { allowRoot: true });
    for (const output of manifest.outputs) assertPackagePath(packageRoot, output, "Manifest output");
  } catch {
    return false;
  }
  return true;
};

const readManifest = (manifestFile, packageRoot) => {
  try {
    const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
    if (!validManifest(manifest, packageRoot)) throw new Error("schema or package-boundary validation failed");
    return manifest;
  } catch (error) {
    if (existsSync(manifestFile)) console.warn(`[compact-artifacts] Ignoring malformed manifest ${manifestFile}; resetting and rebuilding (${error.message})`);
    return null;
  }
};

const sleep = (milliseconds) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);

const reclaimLock = (lockPath) => {
  const quarantine = `${lockPath}.reclaim-${process.pid}-${randomUUID()}`;
  try {
    // rename is the compare-and-remove operation: once it succeeds, a new
    // owner can only create lockPath, never be removed with quarantine.
    renameSync(lockPath, quarantine);
    rmSync(quarantine, { recursive: true, force: true });
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    if (error.code === "EEXIST") return false;
    throw error;
  }
};

const acquireLock = (lockPath) => {
  const started = Date.now();
  const token = randomUUID();
  mkdirSync(path.dirname(lockPath), { recursive: true });
  while (true) {
    try {
      mkdirSync(lockPath);
      const ownerFile = path.join(lockPath, "owner");
      const temporary = path.join(lockPath, `.owner-${token}.tmp`);
      writeFileSync(temporary, `${JSON.stringify({ pid: process.pid, token, acquiredAt: Date.now() })}\n`);
      renameSync(temporary, ownerFile);
      return () => {
        try {
          const owner = JSON.parse(readFileSync(ownerFile, "utf8"));
          if (owner.token === token) reclaimLock(lockPath);
        } catch {
          // An interrupted owner write is ownerless; never blindly remove a
          // lock that may now belong to another process.
        }
      };
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      let owner = null;
      try { owner = JSON.parse(readFileSync(path.join(lockPath, "owner"), "utf8")); } catch { /* ownerless */ }
      let stale = false;
      if (owner && Number.isInteger(owner.pid) && typeof owner.token === "string") {
        try { process.kill(owner.pid, 0); } catch (ownerError) { stale = ownerError.code === "ESRCH"; }
      } else {
        try { stale = Date.now() - statSync(lockPath).mtimeMs >= ownerlessLockGraceMs; } catch { stale = true; }
      }
      if (stale) {
        reclaimLock(lockPath);
        continue;
      }
      if (Date.now() - started > lockTimeoutMs) throw new Error(`Timed out waiting for Compact artifact lock ${lockPath}`);
      sleep(25);
    }
  }
};

export const ensureArtifacts = ({ root = process.cwd(), manifest, sourceRoot, outputs, runtime, command, env = process.env }) => {
  const absoluteRoot = path.resolve(root);
  const packageRoot = realpathSync(absoluteRoot);
  const sourceRootPath = assertPackagePath(absoluteRoot, sourceRoot, "sourceRoot", { allowRoot: true });
  const requestedOutputNames = [...new Set(outputs)];
  const requestedOutputs = requestedOutputNames.map((output) => assertPackagePath(absoluteRoot, output, "output"));
  if (requestedOutputs.some((output) => output === sourceRootPath || isWithin(output, sourceRootPath))) {
    throw new Error("output must not contain or replace sourceRoot");
  }
  const manifestFile = assertPackagePath(absoluteRoot, manifest, "manifest");
  const repositoryRoot = repositoryRootFor(packageRoot);
  const releaseLock = acquireLock(`${manifestFile}.lock`);
  try {
    let currentSourceDigest = sourceDigest(packageRoot, sourceRootPath, repositoryRoot);
    const currentCompiler = compilerVersion();
    const currentRuntime = runtimeVersion(absoluteRoot, runtime);
    const previous = readManifest(manifestFile, packageRoot);

    // A manifest has one owner and declares that owner's complete output set. A
    // sub-target cannot silently replace it with a partial set.
    if (previous?.outputs && previous.outputs.some((output) => !requestedOutputNames.includes(output))) {
      throw new Error(`Manifest ${manifest} owns outputs not declared by this command; invoke the package artifact owner with all outputs`);
    }
    const reusable = previous?.schema === schema
      && previous.sourceRoot === sourceRoot
      && previous.sourceDigest === currentSourceDigest
      && previous.compiler === currentCompiler
      && previous.runtime === currentRuntime
      && previous.outputs?.length === requestedOutputNames.length
      && previous.outputs.every((output) => requestedOutputNames.includes(output))
      && requestedOutputs.every((output) => outputIsValid(output));

    if (reusable) {
      console.log(`[compact-artifacts] Reusing validated outputs (${manifest})`);
      return { reused: true, sourceDigest: currentSourceDigest, compiler: currentCompiler, runtime: currentRuntime };
    }

    // Invalidation is package-wide: every declared output is removed and the
    // owner command must regenerate the complete set before publishing. The
    // post-generation digest check prevents an edit racing the compiler from
    // producing a manifest for a different source revision.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      for (const output of requestedOutputs) rmSync(output, { recursive: true, force: true });
      const result = spawnSync(command[0], command.slice(1), { cwd: absoluteRoot, env, stdio: "inherit" });
      if (result.status !== 0) process.exitCode = result.status ?? 1;
      if (result.status !== 0) throw new Error(`Compact generation failed with exit status ${result.status}`);
      if (!requestedOutputs.every((output) => outputIsValid(output))) {
        throw new Error(`Compact generation completed without all required outputs: ${requestedOutputNames.join(", ")}`);
      }
      const completedSourceDigest = sourceDigest(packageRoot, sourceRootPath, repositoryRoot);
      if (completedSourceDigest !== currentSourceDigest) {
        currentSourceDigest = completedSourceDigest;
        console.log(`[compact-artifacts] Sources changed during generation; retrying (${manifest})`);
        continue;
      }
      mkdirSync(path.dirname(manifestFile), { recursive: true });
      const temporary = `${manifestFile}.tmp-${process.pid}`;
      writeFileSync(temporary, `${JSON.stringify({ schema, sourceRoot, sourceDigest: currentSourceDigest, compiler: currentCompiler, runtime: currentRuntime, outputs: requestedOutputNames }, null, 2)}\n`);
      renameSync(temporary, manifestFile);
      console.log(`[compact-artifacts] Generated validated outputs (${manifest})`);
      return { reused: false, sourceDigest: currentSourceDigest, compiler: currentCompiler, runtime: currentRuntime };
    }
    throw new Error(`Compact sources changed repeatedly during generation: ${manifest}`);
  } finally {
    releaseLock();
  }
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
