#!/usr/bin/env node
/**
 * Enforce the repository ownership boundary without moving packages.
 *
 * The source-import checks remain in check-package-boundaries.sh. This check
 * covers workspace dependency edges.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

const classAllows = (ownerClass, dependencyClass) => {
  switch (ownerClass) {
    case "reusable-core":
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
  console.log(`[package-boundary] OK: checked ${workspaceCatalog.length} core and example workspaces.`);
  return true;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkPackageBoundaries();
}
