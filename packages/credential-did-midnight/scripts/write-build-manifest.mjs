#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readToolchain } from "../../../tooling/scripts/compact-build-profile.mjs";

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
const profile = readToolchain(root);
const sourceFiles = filesUnder(
  resolve(root, "src"),
  (file) => file.endsWith(".compact") && !file.includes("/managed/"),
);
const artifactFiles = filesUnder(
  resolve(root, "dist"),
  (file) => !file.endsWith("compact-build.json"),
);
writeFileSync(
  resolve(root, "dist/compact-build.json"),
  `${JSON.stringify(
    {
      ...profile,
      sourceDigest: digestFiles(sourceFiles),
      artifactDigest: digestFiles(artifactFiles),
      sourceFiles: sourceFiles.map((file) => file.slice(root.length + 1)),
    },
    null,
    2,
  )}\n`,
);
