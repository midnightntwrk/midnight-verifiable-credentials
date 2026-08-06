#!/usr/bin/env node
/**
 * Enforce the repository ownership boundary without moving packages.
 *
 * The source-import checks remain in check-package-boundaries.sh. This check
 * covers workspace dependency edges and keeps the current orchestration
 * compatibility exception explicit and reviewable.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { workspaceCatalog } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const classifyWorkspacePath = (workspacePath) => {
  const [root, area] = workspacePath.split("/");
  assert.equal(root, "packages", `workspace must live under packages/: ${workspacePath}`);
  return {
    core: "reusable-core",
    registry: "registry",
    protocols: "protocol",
    components: "component",
    prototypes: "prototype",
    "use-cases": "use-case",
  }[area] ?? "unknown";
};

// Existing protocol-agent tests are a tracked migration exception. The exact
// edge list is intentionally closed: adding another edge requires a catalog
// and architecture-policy review rather than silently widening this waiver.
export const migrationExceptions = {
  "packages/components/orchestration/protocol": [
    "packages/core/primitives/credentials",
    "packages/prototypes/credential-families/birth",
    "packages/prototypes/credential-families/birth-secret",
    "packages/use-cases/age-gate/contract",
    "packages/core/capabilities/same-holder",
    "packages/components/integration/standalone-environment",
  ],
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
    case "registry":
      return dependencyClass === "reusable-core";
    case "protocol":
      return dependencyClass === "reusable-core" || dependencyClass === "registry";
    case "component":
      return dependencyClass === "reusable-core" || dependencyClass === "registry" || dependencyClass === "protocol";
    case "prototype":
      return dependencyClass === "reusable-core" || dependencyClass === "registry" || dependencyClass === "protocol" || dependencyClass === "component" || dependencyClass === "prototype";
    case "use-case":
      return dependencyClass !== "unknown";
    default:
      return false;
  }
};

export const findBoundaryViolations = () => {
  const violations = [];
  for (const entry of workspaceCatalog) {
    const ownerClass = classifyWorkspacePath(entry.path);
    const dependencies = workspaceDependencyPaths(entry.path);
    const exception = migrationExceptions[entry.path] ?? [];
    if (ownerClass === "unknown") {
      violations.push(`${entry.path}: unknown ownership area`);
      continue;
    }
    if ((ownerClass === "prototype" || ownerClass === "use-case") && entry.releaseStage !== "internal") {
      violations.push(`${entry.path}: evidence workspaces must remain internal, not ${entry.releaseStage}`);
    }
    if (exception.length > 0 && JSON.stringify(dependencies) !== JSON.stringify([...exception].sort())) {
      violations.push(`${entry.path}: migration exception edge list drifted; catalog must enumerate exactly [${[...exception].sort().join(", ")}] but found [${dependencies.join(", ")}]`);
    }
    for (const dependency of dependencies) {
      const dependencyClass = classifyWorkspacePath(dependency);
      if (exception.includes(dependency)) continue;
      if (!classAllows(ownerClass, dependencyClass)) {
        violations.push(`${entry.path} (${ownerClass}) must not depend on ${dependency} (${dependencyClass})`);
      }
    }
    // Never allow family-specific or application packages into reusable core,
    // even if a future broad class rule is changed.
    if (ownerClass === "reusable-core" && dependencies.some((dependency) =>
      dependency.startsWith("packages/prototypes/") || dependency.startsWith("packages/use-cases/"))) {
      violations.push(`${entry.path}: reusable core must remain family-agnostic and application-free`);
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
  console.log(`[package-boundary] OK: checked ${workspaceCatalog.length} workspaces; reusable core is family-agnostic; prototype/use-case evidence remains private.`);
  return true;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkPackageBoundaries();
}
