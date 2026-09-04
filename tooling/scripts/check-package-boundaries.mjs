#!/usr/bin/env node
/**
 * Enforce the repository ownership boundary without moving packages.
 *
 * The source-import checks remain in check-package-boundaries.sh. This check
 * covers workspace dependency edges and keeps the current orchestration
 * compatibility exception explicit and reviewable.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
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

// The legacy birth protocol package is an outward compatibility adapter. The
// exact edge list is intentionally closed: family-neutral orchestration lives
// in `components/orchestration/exchange` and cannot use this exception.
export const migrationExceptions = {
  "packages/components/orchestration/protocol": [
    "packages/components/orchestration/exchange",
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

export const prohibitedFamilyDependencyClasses = ["protocol", "use-case"];

const isCredentialFamily = (workspacePath) =>
  workspacePath.startsWith("packages/prototypes/credential-families/");

const isOrchestrationDependency = (workspacePath) =>
  workspacePath.startsWith("packages/components/orchestration/");

export const isProhibitedFamilyDependency = (workspacePath) =>
  prohibitedFamilyDependencyClasses.includes(classifyWorkspacePath(workspacePath)) ||
  isOrchestrationDependency(workspacePath);

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

export const familySourceImportPaths = (workspacePath) => {
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

export const findFamilySourceImportViolations = () =>
  workspaceCatalog.flatMap((entry) => {
    if (!isCredentialFamily(entry.path)) return [];
    return familySourceImportPaths(entry.path)
      .filter(isProhibitedFamilyDependency)
      .map(
        (dependency) =>
          `${entry.path}: credential family source must not import protocol, orchestration, or use-case package ${dependency}`,
      );
  });

const familyNeutralExchangePath = "packages/components/orchestration/exchange";
const familyNeutralExchangeAllowedImports = new Set(["packages/core/model"]);

export const findFamilyNeutralExchangeSourceImportViolations = () =>
  familySourceImportPaths(familyNeutralExchangePath)
    .filter(
      (dependency) => !familyNeutralExchangeAllowedImports.has(dependency),
    )
    .map(
      (dependency) =>
        `${familyNeutralExchangePath}: family-neutral exchange source must not import ${dependency}`,
    );

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
  const violations = [
    ...findFamilySourceImportViolations(),
    ...findFamilyNeutralExchangeSourceImportViolations(),
  ];
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
      if (
        isCredentialFamily(entry.path) &&
        isProhibitedFamilyDependency(dependency)
      ) {
        violations.push(
          `${entry.path}: credential families must not depend on protocol, orchestration, or use-case package ${dependency}`,
        );
        continue;
      }
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
