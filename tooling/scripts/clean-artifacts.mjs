#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const json = args.has("--json");
const generatedDirectoryNames = new Set([
  ".midnight-db",
  ".midnight-test",
  ".npm",
  ".npm-cache",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "managed",
  "node_modules",
  "playwright-report",
  "reports",
  "target",
  "test-results",
]);
const skippedDirectories = new Set([".git", "node_modules"]);
const trackedPaths = new Set();

for (const file of execFileSync("git", ["ls-files"], {
  cwd: repoRoot,
  encoding: "utf8",
}).split(/\r?\n/u).filter(Boolean)) {
  trackedPaths.add(file);
  let directory = path.posix.dirname(file);
  while (directory !== ".") {
    trackedPaths.add(directory);
    directory = path.posix.dirname(directory);
  }
}

const removed = new Set();
const skippedTracked = new Set();
const relative = (absolutePath) =>
  path.relative(repoRoot, absolutePath).split(path.sep).join("/");

const removeGenerated = (absolutePath) => {
  const relativePath = relative(absolutePath);
  if (trackedPaths.has(relativePath)) {
    skippedTracked.add(relativePath);
    return;
  }
  removed.add(relativePath);
  if (!dryRun) {
    rmSync(absolutePath, { recursive: true, force: true });
  }
};

const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (skippedDirectories.has(entry.name)) {
        continue;
      }
      if (
        generatedDirectoryNames.has(entry.name) ||
        relative(absolutePath).endsWith("/src/managed")
      ) {
        removeGenerated(absolutePath);
      } else {
        walk(absolutePath);
      }
    } else if (
      entry.name.endsWith(".tgz") ||
      entry.name.endsWith(".tsbuildinfo")
    ) {
      removeGenerated(absolutePath);
    }
  }
};

walk(repoRoot);

const report = {
  dryRun,
  removed: [...removed].sort(),
  skippedTracked: [...skippedTracked].sort(),
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else if (report.removed.length === 0 && report.skippedTracked.length === 0) {
  console.log("[clean-artifacts] No generated artifacts found.");
} else {
  const action = dryRun ? "Would remove" : "Removed";
  for (const relativePath of report.removed) {
    console.log(`[clean-artifacts] ${action} ${relativePath}`);
  }
  for (const relativePath of report.skippedTracked) {
    console.log(`[clean-artifacts] Preserved tracked path ${relativePath}`);
  }
}
