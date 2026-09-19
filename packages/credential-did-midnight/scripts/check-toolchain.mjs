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
const expectedLedger = packageJson.midnight.ledgerVersion;
const compilerOutput = execFileSync("compact", ["compile", "--version"], {
  encoding: "utf8",
}).trim();
const compilerVersion = compilerOutput.match(
  /(?:^|\s)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\s|$)/u,
)?.[1];
const ledgerVersion = execFileSync("compact", ["compile", "--ledger-version"], {
  encoding: "utf8",
}).trim();
const require = createRequire(import.meta.url);
const runtimeVersion = require(
  "@midnight-ntwrk/compact-runtime/package.json",
).version;

if (
  compilerVersion !== expectedCompiler ||
  runtimeVersion !== expectedRuntime ||
  ledgerVersion !== expectedLedger
) {
  throw new Error(
    `Expected Compact ${expectedCompiler} / runtime ${expectedRuntime} / ${expectedLedger}; found ${compilerVersion ?? compilerOutput} / ${runtimeVersion} / ${ledgerVersion}`,
  );
}

console.log(
  `[credential-did-midnight] toolchain ${expectedCompiler} / @midnight-ntwrk/compact-runtime ${expectedRuntime} / ${expectedLedger}`,
);
