#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(scriptDirectory, "..");
const ignoredDirectories = new Set([".vitepress", "node_modules"]);
const markdownFiles = [];
const failures = [];

const exists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
};

const collectMarkdown = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await collectMarkdown(path);
    else if (entry.name.endsWith(".md")) markdownFiles.push(path);
  }
};

const routeCandidates = (file, target) => {
  const cleanTarget = decodeURIComponent(target.split(/[?#]/u)[0]);
  const base = cleanTarget.startsWith("/")
    ? resolve(docsRoot, cleanTarget.slice(1))
    : resolve(dirname(file), cleanTarget);
  const publicBase = cleanTarget.startsWith("/")
    ? resolve(docsRoot, "public", cleanTarget.slice(1))
    : resolve(
        docsRoot,
        "public",
        relative(docsRoot, dirname(file)),
        cleanTarget,
      );
  if (extname(base)) return [base, publicBase];
  return [base, `${base}.md`, resolve(base, "index.md")];
};

await collectMarkdown(docsRoot);

for (const file of markdownFiles) {
  const lines = (await readFile(file, "utf8")).split(/\r?\n/u);
  let fenced = false;
  for (const [index, line] of lines.entries()) {
    if (line.trim().startsWith("```")) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    for (const match of line.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/gu)) {
      const target = match[1].trim().replace(/^<|>$/gu, "");
      if (
        !target ||
        target.startsWith("#") ||
        /^(?:https?:|mailto:|tel:)/u.test(target)
      )
        continue;
      const candidates = routeCandidates(file, target);
      if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
        failures.push(
          `${file.slice(docsRoot.length + 1)}:${index + 1} -> ${target}`,
        );
      }
    }
  }
}

for (const route of [
  "index.md",
  "guide/quickstart.md",
  "spec/index.md",
  "conformance/index.md",
  "packages/model.md",
  "packages/compact.md",
  "architecture/core-only.md",
]) {
  if (!(await exists(resolve(docsRoot, route))))
    failures.push(`missing required route: ${route}`);
}

if (failures.length > 0) {
  console.error("Documentation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validated ${markdownFiles.length} documentation pages.`);
