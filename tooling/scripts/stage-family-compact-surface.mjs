#!/usr/bin/env node
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const fail = (message) => {
  throw new Error(`[stage-family-compact-surface] ${message}`);
};

const args = process.argv.slice(2);
const values = new Map();
for (let index = 0; index < args.length; index += 2) {
  const flag = args[index];
  const value = args[index + 1];
  if (!flag?.startsWith("--") || value === undefined) {
    fail(
      "Usage: stage-family-compact-surface.mjs --source <file> --output-root <directory> --core-root <directory>",
    );
  }
  values.set(flag, value);
}

const source = values.get("--source");
const outputRoot = values.get("--output-root");
const coreRoot = values.get("--core-root");
if (source === undefined || outputRoot === undefined || coreRoot === undefined) {
  fail(
    "Usage: stage-family-compact-surface.mjs --source <file> --output-root <directory> --core-root <directory>",
  );
}
if (values.size !== 3) {
  fail("unknown or duplicate arguments");
}

const monorepoCoreInclude =
  /include "(?:\.\.\/)+packages\/core\/compact\/src\/credentials\/composable";/gu;
const sourceText = readFileSync(source, "utf8");
const matches = sourceText.match(monorepoCoreInclude) ?? [];
if (matches.length !== 1) {
  fail(`${source} must contain exactly one canonical core include`);
}

const portableSource = sourceText.replace(
  monorepoCoreInclude,
  'include "./credential-compact/credentials/composable";',
);
const bundledCoreRoot = path.join(
  outputRoot,
  "credential-compact",
  "credentials",
);
rmSync(bundledCoreRoot, { recursive: true, force: true });
mkdirSync(path.dirname(bundledCoreRoot), { recursive: true });
cpSync(coreRoot, bundledCoreRoot, { recursive: true });
writeFileSync(path.join(outputRoot, path.basename(source)), portableSource);
