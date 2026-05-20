#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { removableTopLevelShells } from "./compatibility-aliases.mjs";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const json = args.has("--json");
const skippedDirectories = new Set([".git", "node_modules"]);
const generatedDirectoryNames = new Set([
  ".midnight-db",
  ".midnight-test",
  ".npm",
  ".npm-cache",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "playwright-report",
  "reports",
  "target",
  "test-results",
]);
const generatedRelativeDirectories = new Set(["tooling/artifacts/npm"]);
const preservedDidVendorTarballPrefix = "tooling/vendor/midnight-did/";
const disposableShellDirectoryNames = new Set([
  ...generatedDirectoryNames,
  "managed",
  "node_modules",
]);
const trackedFiles = new Set(
  execFileSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/u)
    .filter(Boolean),
);
const trackedPaths = new Set();
for (const file of trackedFiles) {
  trackedPaths.add(file);

  let directory = path.posix.dirname(file);
  while (directory !== ".") {
    trackedPaths.add(directory);
    directory = path.posix.dirname(directory);
  }
}
const removed = new Set();
const skippedPreserved = new Set();
const skippedTracked = new Set();
const skippedDeadShells = new Set();
const classifiedTopLevelShells = new Set();

const toRelative = (absolutePath) =>
  path.relative(repoRoot, absolutePath).split(path.sep).join("/");

const containsTrackedFile = (relativePath) => trackedPaths.has(relativePath);

const isPreservedArtifact = (relativePath) =>
  relativePath.startsWith(preservedDidVendorTarballPrefix) &&
  relativePath.endsWith(".tgz");

const isDisposableDeadShell = (absolutePath) => {
  for (const entry of readdirSync(absolutePath, { withFileTypes: true })) {
    const entryPath = path.join(absolutePath, entry.name);

    if (entry.isSymbolicLink()) {
      return false;
    }

    if (entry.isDirectory()) {
      if (disposableShellDirectoryNames.has(entry.name)) {
        continue;
      }

      if (entry.name === "src" && isDisposableDeadShell(entryPath)) {
        continue;
      }

      return false;
    }

    if (
      entry.isFile() &&
      (entry.name === ".DS_Store" ||
        entry.name.endsWith(".log") ||
        entry.name.endsWith(".tsbuildinfo"))
    ) {
      continue;
    }

    return false;
  }

  return true;
};

const removePath = (absolutePath) => {
  const relativePath = toRelative(absolutePath);

  if (isPreservedArtifact(relativePath) && containsTrackedFile(relativePath)) {
    skippedPreserved.add(relativePath);
    return;
  }

  if (containsTrackedFile(relativePath)) {
    skippedTracked.add(relativePath);
    return;
  }

  removed.add(relativePath);

  if (!dryRun) {
    rmSync(absolutePath, { recursive: true, force: true });
  }
};

const isGeneratedDirectory = (absolutePath, direntName) => {
  const relativePath = toRelative(absolutePath);

  return (
    generatedDirectoryNames.has(direntName) ||
    generatedRelativeDirectories.has(relativePath) ||
    relativePath === "managed" ||
    relativePath.endsWith("/src/managed")
  );
};

const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isSymbolicLink()) {
      if (
        isGeneratedDirectory(absolutePath, entry.name) ||
        entry.name.endsWith(".tsbuildinfo") ||
        entry.name.endsWith(".tgz")
      ) {
        removePath(absolutePath);
      }
      continue;
    }

    if (entry.isDirectory()) {
      if (skippedDirectories.has(entry.name)) {
        continue;
      }

      if (
        directory === repoRoot &&
        classifiedTopLevelShells.has(toRelative(absolutePath))
      ) {
        continue;
      }

      if (isGeneratedDirectory(absolutePath, entry.name)) {
        removePath(absolutePath);
        continue;
      }

      walk(absolutePath);
      continue;
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith(".tsbuildinfo") || entry.name.endsWith(".tgz"))
    ) {
      removePath(absolutePath);
    }
  }
};

for (const relativePath of generatedRelativeDirectories) {
  const absolutePath = path.join(repoRoot, relativePath);
  try {
    if (statSync(absolutePath).isDirectory()) {
      removePath(absolutePath);
    }
  } catch {
    // Missing generated directories do not need cleanup.
  }
}

for (const relativePath of removableTopLevelShells) {
  const absolutePath = path.join(repoRoot, relativePath);
  try {
    if (statSync(absolutePath).isDirectory()) {
      classifiedTopLevelShells.add(relativePath);
      if (containsTrackedFile(relativePath)) {
        skippedTracked.add(relativePath);
      } else if (!isDisposableDeadShell(absolutePath)) {
        skippedDeadShells.add(relativePath);
      } else {
        removePath(absolutePath);
      }
    }
  } catch {
    // Missing legacy shell directories do not need cleanup.
  }
}

walk(repoRoot);

const removedPaths = [...removed].sort();
const skippedPreservedPaths = [...skippedPreserved].sort();
const skippedTrackedPaths = [...skippedTracked].sort();
const skippedDeadShellPaths = [...skippedDeadShells].sort();

if (json) {
  console.log(
    JSON.stringify(
      {
        dryRun,
        removed: removedPaths,
        skippedPreserved: skippedPreservedPaths,
        skippedTracked: skippedTrackedPaths,
        skippedDeadShells: skippedDeadShellPaths,
      },
      null,
      2,
    ),
  );
} else if (
  removedPaths.length === 0 &&
  skippedPreservedPaths.length === 0 &&
  skippedTrackedPaths.length === 0 &&
  skippedDeadShellPaths.length === 0
) {
  console.log("[clean-artifacts] No generated artifacts found.");
} else {
  if (removedPaths.length > 0) {
    const action = dryRun ? "Would remove" : "Removed";
    console.log(
      `[clean-artifacts] ${action} ${removedPaths.length} generated artifact paths:`,
    );
    for (const relativePath of removedPaths) {
      console.log(`  ${relativePath}`);
    }
  }

  if (skippedPreservedPaths.length > 0) {
    console.log("[clean-artifacts] Preserved vendor artifact paths:");
    for (const relativePath of skippedPreservedPaths) {
      console.log(`  ${relativePath}`);
    }
  }

  if (skippedTrackedPaths.length > 0) {
    console.log("[clean-artifacts] Skipped tracked artifact paths:");
    for (const relativePath of skippedTrackedPaths) {
      console.log(`  ${relativePath}`);
    }
  }

  if (skippedDeadShellPaths.length > 0) {
    console.log(
      "[clean-artifacts] Skipped non-disposable dead-shell candidates:",
    );
    for (const relativePath of skippedDeadShellPaths) {
      console.log(`  ${relativePath}`);
    }
  }
}
