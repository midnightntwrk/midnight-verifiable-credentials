#!/usr/bin/env node
/**
 * Enforce the repository ownership boundary without moving packages.
 *
 * The source-import checks remain in check-package-boundaries.sh. This check
 * covers workspace dependency edges.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { workspaceCatalog } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const classifyWorkspacePath = (workspacePath) => {
  const [root, area] = workspacePath.split("/");
  if (root === "examples") return "example";
  assert.equal(root, "packages", `workspace must live under packages/ or examples/: ${workspacePath}`);
  return {
    core: "reusable-core",
    components: "component",
  }[area] ?? "unknown";
};

const packageJson = (workspacePath) =>
  JSON.parse(readFileSync(path.join(repoRoot, workspacePath, "package.json"), "utf8"));

const workspaceByName = new Map(
  workspaceCatalog.map((entry) => [packageJson(entry.path).name, entry.path]),
);

export const workspaceDependencyPaths = (workspacePath) => {
  const manifest = packageJson(workspacePath);
  return Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
    ...manifest.optionalDependencies,
  })
    .map((name) => workspaceByName.get(name))
    .filter(Boolean)
    .sort();
};

const sourceExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
]);
export const isSupportedSourceFile = (fileName) =>
  sourceExtensions.has(path.extname(fileName));
const sourceImportPattern =
  /(?:\bfrom\s*|\bimport\s*\(|\brequire\s*\()\s*["']([^"']+)["']/gu;
const bareImportPattern = /\bimport\s*["']([^"']+)["']/gu;

const workspaceSourceFiles = (workspacePath) => {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (["dist", "managed", "node_modules", "coverage", "reports"].includes(entry.name)) {
        continue;
      }
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolute);
      } else if (isSupportedSourceFile(entry.name)) {
        files.push(absolute);
      }
    }
  };
  visit(path.join(repoRoot, workspacePath));
  return files;
};

export const workspacePathForImport = (specifier, importerFile) => {
  for (const [packageName, workspacePath] of workspaceByName) {
    if (specifier === packageName || specifier.startsWith(`${packageName}/`)) {
      return workspacePath;
    }
  }
  if (!importerFile || !specifier.startsWith(".")) return undefined;

  const importerPath = path.isAbsolute(importerFile)
    ? importerFile
    : path.join(repoRoot, importerFile);
  const importedPath = path.resolve(path.dirname(importerPath), specifier);
  for (const { path: workspacePath } of workspaceCatalog) {
    const workspaceRoot = path.join(repoRoot, workspacePath);
    const relative = path.relative(workspaceRoot, importedPath);
    if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
      return workspacePath;
    }
  }
  return undefined;
};

export const workspaceSourceImportPaths = (workspacePath) => {
  const imports = new Set();
  for (const sourceFile of workspaceSourceFiles(workspacePath)) {
    const source = readFileSync(sourceFile, "utf8");
    for (const pattern of [sourceImportPattern, bareImportPattern]) {
      pattern.lastIndex = 0;
      for (const match of source.matchAll(pattern)) {
        const dependencyPath = workspacePathForImport(match[1], sourceFile);
        if (dependencyPath && dependencyPath !== workspacePath) {
          imports.add(dependencyPath);
        }
      }
    }
  }
  return [...imports].sort();
};

const classAllows = (ownerClass, dependencyClass) => {
  switch (ownerClass) {
    case "reusable-core":
      return dependencyClass === "reusable-core";
    case "component":
      return dependencyClass === "reusable-core";
    case "example":
      return dependencyClass === "reusable-core";
    default:
      return false;
  }
};

export const findBoundaryViolations = () => {
  const violations = [];
  for (const entry of workspaceCatalog) {
    const ownerClass = classifyWorkspacePath(entry.path);
    const dependencies = workspaceDependencyPaths(entry.path);
    if (ownerClass === "unknown") {
      violations.push(`${entry.path}: unknown ownership area`);
      continue;
    }
    for (const dependency of dependencies) {
      const dependencyClass = classifyWorkspacePath(dependency);
      if (!classAllows(ownerClass, dependencyClass)) {
        violations.push(`${entry.path} (${ownerClass}) must not depend on ${dependency} (${dependencyClass})`);
      }
    }
  }
  return violations;
};

export const checkPackageBoundaries = () => {
  const violations = findBoundaryViolations();
  if (violations.length > 0) {
    for (const violation of violations) console.error(`[package-boundary] ${violation}`);
    process.exitCode = 1;
    return false;
  }
  console.log(`[package-boundary] OK: checked ${workspaceCatalog.length} core, adapter, and example workspaces.`);
  return true;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkPackageBoundaries();
}
