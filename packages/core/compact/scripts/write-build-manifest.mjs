#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const filesUnder = (directory, predicate) => {
  const files = [];
  const visit = (current) => {
    for (const name of readdirSync(current).sort()) {
      const file = resolve(current, name);
      if (statSync(file).isDirectory()) visit(file);
      else if (predicate(file)) files.push(file);
    }
  };
  visit(directory);
  return files;
};
const digestFiles = (files) => {
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file.slice(root.length + 1));
    hash.update(readFileSync(file));
  }
  return hash.digest("hex");
};
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const compiler = execFileSync("compact", ["compile", "--version"], { encoding: "utf8" }).trim();
const compilerVersion = compiler.match(/(?:^|\s)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\s|$)/u)?.[1];
const expectedCompiler = packageJson.midnight?.compactCompilerVersion;
const expectedRuntime = packageJson.midnight?.compactRuntimeVersion;
const require = createRequire(import.meta.url);
const runtimeVersion = require("@midnight-ntwrk/compact-runtime/package.json").version;
if (compilerVersion !== expectedCompiler || runtimeVersion !== expectedRuntime) {
  throw new Error(`Generated output toolchain drifted: compiler ${compilerVersion ?? compiler}, runtime ${runtimeVersion}`);
}
const runtime = {
  name: "@midnight-ntwrk/compact-runtime",
  version: runtimeVersion,
};
const sourceFiles = filesUnder(resolve(root, "src"), (file) => file.endsWith(".compact") && !file.includes("/managed/"));
const artifactFiles = filesUnder(resolve(root, "dist"), (file) => !file.endsWith("compact-build.json"));
writeFileSync(resolve(root, "dist/compact-build.json"), `${JSON.stringify({
  schema: 1,
  compiler: compilerVersion,
  runtime,
  sourceDigest: digestFiles(sourceFiles),
  artifactDigest: digestFiles(artifactFiles),
  sourceFiles: sourceFiles.map((file) => file.slice(root.length + 1)),
}, null, 2)}\n`);
