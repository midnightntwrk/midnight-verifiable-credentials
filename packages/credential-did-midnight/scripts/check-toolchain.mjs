#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf8"),
);
const expectedCompiler = packageJson.midnight.compactCompilerVersion;
const expectedRuntime = packageJson.midnight.compactRuntimeVersion;
const compilerOutput = execFileSync("compact", ["compile", "--version"], {
  encoding: "utf8",
}).trim();
const compilerVersion = compilerOutput.match(
  /(?:^|\s)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\s|$)/u,
)?.[1];
const require = createRequire(import.meta.url);
const runtimeVersion = require(
  "@midnight-ntwrk/compact-runtime/package.json",
).version;

if (compilerVersion !== expectedCompiler || runtimeVersion !== expectedRuntime) {
  throw new Error(
    `Expected Compact ${expectedCompiler} / runtime ${expectedRuntime}; found ${compilerVersion ?? compilerOutput} / ${runtimeVersion}`,
  );
}

console.log(
  `[credential-did-midnight] toolchain ${expectedCompiler} / @midnight-ntwrk/compact-runtime ${expectedRuntime}`,
);
