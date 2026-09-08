#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { stderr, stdout } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distReleaseTasks = ["lint", "typecheck", "build", "test:ci", "prepack"];
const sourceOnlyReleaseTasks = ["typecheck", "test:ci"];
const pnpmInvocation = (args) => {
  if (process.platform !== "win32") {
    return { command: "pnpm", args };
  }
  if (!process.env.npm_execpath) {
    throw new Error("Windows workspace commands must be invoked through pnpm");
  }
  return {
    command: process.execPath,
    args: [process.env.npm_execpath, ...args],
  };
};

const workspace = (workspacePath, maturity, packageClass, options = {}) => {
  const releaseStage = options.releaseStage ?? "internal";
  return {
    path: workspacePath,
    maturity,
    packageClass,
    releaseStage,
    consumerFixture: options.consumerFixture ?? null,
    consumerChecks: options.consumerChecks ?? [],
    publicationDependencies: options.publicationDependencies ?? [],
    releaseTasks:
      packageClass === "dist" ? distReleaseTasks : sourceOnlyReleaseTasks,
  };
};

// Root package.json order is intentional. A workspace addition must update this
// catalog in the same review so its maturity, gate, and packaging policy are
// visible in one diff.
export const workspaceCatalog = [
  workspace("packages/core/model", "core", "dist", {
    releaseStage: "supported",
    consumerFixture: "tooling/fixtures/credential-model-consumer",
    consumerChecks: [
      "node",
      "typescript",
      "legacy-typescript",
      "browser",
    ],
    publicationDependencies: [],
  }),
  workspace("packages/core/compact", "core", "dist", {
    releaseStage: "supported",
    consumerFixture: "tooling/fixtures/credential-compact-consumer",
    consumerChecks: ["node", "typescript", "compact"],
    publicationDependencies: [],
  }),
  workspace("examples/core-composition", "reference", "source-only"),
];

export const allowedMaturityValues = new Set(["core", "reference"]);
export const allowedPackageClasses = new Set(["dist", "source-only"]);
export const allowedReleaseStages = new Set(["internal", "supported"]);
export const allowedConsumerChecks = new Set([
  "node",
  "typescript",
  "legacy-typescript",
  "browser",
  "compact",
]);
export const releasePackageFiles = () => [
  "dist/**",
  "README.md",
  "CHANGELOG.md",
  "package.json",
];
export const workspaceCatalogByPath = new Map(
  workspaceCatalog.map((entry) => [entry.path, entry]),
);
export const packableWorkspacePaths = workspaceCatalog
  .filter((entry) => entry.releaseStage === "supported")
  .map((entry) => entry.path);
export const supportedWorkspacePaths = workspaceCatalog
  .filter((entry) => entry.releaseStage === "supported")
  .map((entry) => entry.path);

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const checkCatalog = () => {
  const rootPackage = JSON.parse(
    readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  );
  const catalogPaths = workspaceCatalog.map((entry) => entry.path);
  const workspacePackageJsonByPath = new Map(
    workspaceCatalog.map((entry) => [
      entry.path,
      JSON.parse(
        readFileSync(path.join(repoRoot, entry.path, "package.json"), "utf8"),
      ),
    ]),
  );
  const workspaceCatalogByName = new Map(
    workspaceCatalog.map((entry) => [
      workspacePackageJsonByPath.get(entry.path).name,
      entry,
    ]),
  );

  assert.equal(
    new Set(catalogPaths).size,
    catalogPaths.length,
    "workspace catalog must not contain duplicate paths",
  );
  assert.equal(
    workspaceCatalogByName.size,
    workspaceCatalog.length,
    "workspace catalog must not contain duplicate package names",
  );
  assert.deepEqual(
    catalogPaths,
    rootPackage.workspaces,
    "workspace catalog must match root package.json order and membership",
  );

  const workspaceInvocation = pnpmInvocation([
    "--recursive",
    "list",
    "--depth",
    "-1",
    "--json",
  ]);
  const pnpmWorkspaceResult = spawnSync(
    workspaceInvocation.command,
    workspaceInvocation.args,
    { cwd: repoRoot, encoding: "utf8" },
  );
  assert.equal(
    pnpmWorkspaceResult.status,
    0,
    `pnpm workspace enumeration failed: ${pnpmWorkspaceResult.stderr}`,
  );
  const pnpmWorkspacePaths = JSON.parse(pnpmWorkspaceResult.stdout)
    .map((entry) => path.relative(repoRoot, entry.path).split(path.sep).join("/"))
    .filter(Boolean)
    .sort();
  assert.deepEqual(
    pnpmWorkspacePaths,
    [...catalogPaths].sort(),
    "workspace catalog must match pnpm-workspace.yaml enumeration",
  );

  for (const entry of workspaceCatalog) {
    assert.ok(
      allowedMaturityValues.has(entry.maturity),
      `${entry.path} has unsupported maturity '${entry.maturity}'`,
    );
    assert.ok(
      allowedPackageClasses.has(entry.packageClass),
      `${entry.path} has unsupported package class '${entry.packageClass}'`,
    );
    assert.ok(
      allowedReleaseStages.has(entry.releaseStage),
      `${entry.path} has unsupported release stage '${entry.releaseStage}'`,
    );
    assert.ok(
      entry.releaseStage === "internal" || entry.packageClass === "dist",
      `${entry.path} supported packages must be dist packages`,
    );
    assert.equal(
      entry.releaseStage !== "internal",
      typeof entry.consumerFixture === "string" &&
        entry.consumerFixture.length > 0,
      `${entry.path} consumer fixture must match external release status`,
    );
    assert.equal(
      entry.releaseStage !== "internal",
      entry.consumerChecks.length > 0,
      `${entry.path} consumer checks must match external release status`,
    );
    assert.ok(
      Array.isArray(entry.publicationDependencies),
      `${entry.path} publication dependencies must be an array`,
    );
    assert.ok(
      entry.consumerChecks.every((check) => allowedConsumerChecks.has(check)),
      `${entry.path} has an unsupported clean-consumer check`,
    );
    assert.equal(
      new Set(entry.consumerChecks).size,
      entry.consumerChecks.length,
      `${entry.path} clean-consumer checks must be unique`,
    );
    assert.equal(
      new Set(entry.publicationDependencies).size,
      entry.publicationDependencies.length,
      `${entry.path} publication dependencies must be unique`,
    );
    if (entry.consumerFixture !== null) {
      assert.ok(
        existsSync(path.join(repoRoot, entry.consumerFixture, "package.json")),
        `${entry.path} consumer fixture must include package.json`,
      );
    }
    const packageJson = workspacePackageJsonByPath.get(entry.path);
    assert.equal(packageJson.midnight?.maturity, entry.maturity);
    assert.equal(packageJson.midnight?.packageClass, entry.packageClass);
    assert.equal(
      packageJson.midnight?.releaseStage ?? "internal",
      entry.releaseStage,
      `${entry.path} release stage metadata must match the catalog`,
    );
    assert.equal(
      packageJson.private,
      entry.releaseStage !== "supported",
      `${entry.path} private must match its release stage`,
    );
    assert.equal(
      packageJson.license,
      "Apache-2.0",
      `${entry.path} must declare the repository license`,
    );
    assert.equal(packageJson.type, "module", `${entry.path} must be ESM`);
    if (entry.releaseStage === "internal") {
      assert.equal(
        entry.packageClass,
        "source-only",
        `${entry.path} internal workspaces must be source-only`,
      );
      assert.equal(packageJson.private, true, `${entry.path} must remain private`);
      assert.equal(
        packageJson.publishConfig,
        undefined,
        `${entry.path} must not define publishConfig`,
      );
      assert.ok(
        packageJson.main?.startsWith("src/"),
        `${entry.path} must use a source entrypoint`,
      );
      assert.equal(
        packageJson.exports,
        undefined,
        `${entry.path} must not publish exports`,
      );
      assert.equal(
        packageJson.scripts?.prepack,
        undefined,
        `${entry.path} must not prepack`,
      );
    }
    const workspaceDependencies = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.optionalDependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
    ]);
    for (const dependencyName of workspaceDependencies) {
      const dependencyEntry = workspaceCatalogByName.get(dependencyName);
      if (dependencyEntry !== undefined) {
        assert.ok(
          dependencyEntry.path.startsWith("packages/core/"),
          `${entry.path} must not depend on non-core workspace ${dependencyEntry.path}`,
        );
      }
    }
    const publicationWorkspaceDependencies = [...workspaceDependencies]
      .filter((dependencyName) => workspaceCatalogByName.has(dependencyName))
      .sort();
    if (entry.releaseStage !== "internal") {
      assert.deepEqual(
        publicationWorkspaceDependencies,
        [...entry.publicationDependencies].sort(),
        `${entry.path} workspace dependencies must match its publication allowlist`,
      );
      for (const dependencyName of entry.publicationDependencies) {
        const dependencyEntry = workspaceCatalogByName.get(dependencyName);
        assert.notEqual(
          dependencyEntry?.releaseStage,
          "internal",
          `${entry.path} publication dependency ${dependencyName} must be supported`,
        );
      }
    }
    for (const task of entry.releaseTasks) {
      assert.ok(
        packageJson.scripts?.[task],
        `${entry.path} is missing cataloged release task '${task}'`,
      );
      assert.ok(
        !packageJson.scripts[task].includes("test:integration"),
        `${entry.path} release task '${task}' must not invoke Docker integration`,
      );
    }
  }
};

const printLines = (lines) => stdout.write(`${lines.join("\n")}\n`);
const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const [command] = process.argv.slice(2);
  try {
    switch (command) {
      case "--packable-paths":
        printLines(packableWorkspacePaths);
        break;
      case "--publishable-paths":
        printLines(supportedWorkspacePaths);
        break;
      case "--check":
        checkCatalog();
        stdout.write("[workspace-catalog] Catalog checks passed.\n");
        break;
      default:
        stderr.write(
          "Usage: workspace-catalog.mjs --check | --packable-paths | --publishable-paths\n",
        );
        process.exit(command === undefined ? 0 : 1);
    }
  } catch (error) {
    stderr.write(`[workspace-catalog] ${error.message}\n`);
    process.exit(1);
  }
}
