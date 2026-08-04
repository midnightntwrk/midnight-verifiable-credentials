#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const expectedCompiler = packageJson.midnight?.compactCompilerVersion;
const expectedRuntime = packageJson.midnight?.compactRuntimeVersion;
if (typeof expectedCompiler !== "string" || typeof expectedRuntime !== "string") {
  throw new Error("Compact package must declare exact compiler and runtime versions");
}
const compiler = execFileSync("compact", ["compile", "--version"], { encoding: "utf8" }).trim();
const compilerVersion = compiler.match(/(?:^|\s)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\s|$)/u)?.[1];
if (compilerVersion !== expectedCompiler) {
  throw new Error(`Compact compiler drift: expected ${expectedCompiler}, resolved ${compiler || "unknown"}`);
}
const require = createRequire(import.meta.url);
const runtime = require("@midnight-ntwrk/compact-runtime/package.json").version;
if (runtime !== expectedRuntime) {
  throw new Error(`Compact runtime drift: expected ${expectedRuntime}, resolved ${runtime}`);
}
const declaredRuntime = packageJson.dependencies?.["@midnight-ntwrk/compact-runtime"];
if (declaredRuntime !== expectedRuntime) {
  throw new Error(`Compact runtime dependency must be pinned to ${expectedRuntime}, found ${declaredRuntime}`);
}
console.log(`[credential-compact] toolchain ${expectedCompiler} / @midnight-ntwrk/compact-runtime ${expectedRuntime}`);
