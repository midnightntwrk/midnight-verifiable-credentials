#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { stderr, stdout } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distReleaseTasks = ["lint", "typecheck", "build", "test:ci", "prepack"];
const scenarioReleaseTasks = ["typecheck", "test:ci"];
const sourceOnlyReleaseTasks = ["typecheck", "test:ci"];

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
      options.releaseTasks ??
      (packageClass === "dist"
        ? distReleaseTasks
        : packageClass === "scenario"
          ? scenarioReleaseTasks
          : sourceOnlyReleaseTasks),
    pack: releaseStage !== "internal",
    packageTest: options.packageTest ?? packageClass !== "scenario",
    testFromArtifacts:
      options.testFromArtifacts ??
      (packageClass === "scenario"
        ? ["run", "test:ci"]
        : ["exec", "vitest", "run"]),
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
  workspace("packages/core/primitives/credentials", "core", "dist"),
  workspace("packages/registry/status-registry", "reference", "dist"),
  workspace("packages/core/capabilities/same-holder", "core", "dist"),
  workspace("packages/core/primitives/iso-registry", "reference", "dist"),
  workspace(
    "packages/components/adapters/offchain-did",
    "infrastructure",
    "dist",
  ),
  workspace("packages/protocols/openid", "reference", "dist", {
    testFromArtifacts: [
      "exec",
      "vitest",
      "run",
      "--config",
      "vitest.config.ts",
    ],
  }),
  workspace(
    "packages/components/orchestration/protocol",
    "infrastructure",
    "dist",
  ),
  workspace(
    "packages/prototypes/credential-families/birth",
    "reference",
    "dist",
  ),
  workspace(
    "packages/prototypes/credential-families/birth-secret",
    "reference",
    "dist",
  ),
  workspace(
    "packages/prototypes/credential-families/hello-family",
    "reference",
    "dist",
  ),
  workspace(
    "packages/prototypes/credential-families/dummy-claims",
    "lab",
    "dist",
  ),
  workspace(
    "packages/prototypes/credential-families/mixed-claims",
    "lab",
    "dist",
  ),
  workspace(
    "packages/prototypes/credential-families/university-diploma",
    "reference",
    "dist",
  ),
  workspace(
    "packages/prototypes/credential-families/digital-passport",
    "reference",
    "dist",
  ),
  workspace("packages/use-cases/age-gate/contract", "demo", "dist", {
    testFromArtifacts: [
      "exec",
      "vitest",
      "run",
      "--exclude",
      "src/test/integration/**/*.test.ts",
    ],
  }),
  workspace("packages/use-cases/hello-verifier/contract", "demo", "dist"),
  workspace("packages/use-cases/university/contract", "demo", "dist"),
  workspace("packages/use-cases/age-gate/scenarios", "demo", "scenario"),
  workspace(
    "packages/use-cases/bdd-support",
    "infrastructure",
    "source-only",
  ),
  workspace("packages/use-cases/university/scenarios", "demo", "scenario"),
  workspace("packages/use-cases/university/protocol", "demo", "dist"),
  workspace("packages/use-cases/university/reporting", "demo", "dist"),
  workspace(
    "packages/components/integration/standalone-environment",
    "infrastructure",
    "source-only",
    {
      releaseTasks: ["typecheck", "build", "test:ci"],
    },
  ),
];

export const allowedMaturityValues = new Set([
  "core",
  "reference",
  "lab",
  "demo",
  "infrastructure",
]);
export const allowedPackageClasses = new Set([
  "dist",
  "scenario",
  "source-only",
]);
export const allowedReleaseStages = new Set([
  "internal",
  "candidate",
  "supported",
]);
export const allowedConsumerChecks = new Set([
  "node",
  "typescript",
  "legacy-typescript",
  "browser",
  "compact",
]);
export const releaseCandidateFiles = (hasCompactSources) => [
  "dist/**",
  ...(hasCompactSources ? ["src/**/*.compact"] : []),
  "README.md",
  "CHANGELOG.md",
  "package.json",
];
export const workspaceCatalogByPath = new Map(
  workspaceCatalog.map((entry) => [entry.path, entry]),
);
export const packableWorkspacePaths = workspaceCatalog
  .filter((entry) => entry.pack)
  .map((entry) => entry.path);
export const packageTestWorkspacePaths = workspaceCatalog
  .filter(
    (entry) =>
      entry.packageTest && entry.releaseTasks.includes("test:ci"),
  )
  .map((entry) => entry.path);
export const releaseCandidateWorkspacePaths = workspaceCatalog
  .filter((entry) => entry.releaseStage === "candidate")
  .map((entry) => entry.path);
export const supportedWorkspacePaths = workspaceCatalog
  .filter((entry) => entry.releaseStage === "supported")
  .map((entry) => entry.path);
export const releaseWorkspacePaths = workspaceCatalog
  .filter((entry) => entry.releaseStage !== "internal")
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

  const pnpmWorkspaceResult = spawnSync(
    "pnpm",
    ["--recursive", "list", "--depth", "-1", "--json"],
    { cwd: repoRoot, encoding: "utf8", shell: process.platform === "win32" },
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
      `${entry.path} release candidates and supported packages must be dist packages`,
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
    assert.equal(
      entry.pack,
      entry.releaseStage !== "internal",
      `${entry.path} pack eligibility must follow its release stage`,
    );
    assert.equal(
      entry.packageTest,
      entry.packageClass !== "scenario",
      `${entry.path} package-test eligibility must exclude only scenario workspaces`,
    );

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
    const workspaceDependencies = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.optionalDependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
    ]);
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
          `${entry.path} publication dependency ${dependencyName} must be candidate or supported`,
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
    if (entry.releaseTasks.includes("test:ci")) {
      assert.ok(
        Array.isArray(entry.testFromArtifacts) &&
          entry.testFromArtifacts.length > 0,
        `${entry.path} must define an artifact-backed test command`,
      );
      assert.ok(
        !entry.testFromArtifacts.join(" ").includes("test:integration"),
        `${entry.path} artifact-backed tests must exclude Docker integration`,
      );
    }
  }
};

const printLines = (lines) => stdout.write(`${lines.join("\n")}\n`);
const executeReleaseTask = (task) => {
  const eligible = workspaceCatalog.filter((entry) =>
    entry.releaseTasks.includes(task),
  );
  assert.ok(eligible.length > 0, `no workspaces declare release task '${task}'`);

  const args = [
    "turbo",
    "run",
    task,
    ...eligible.map((entry) => `--filter=./${entry.path}`),
    "--continue",
  ];
  // Several package hooks rebuild shared workspace dependencies in place.
  // Serialize output-sensitive phases until those hooks become pure consumers.
  if (task !== "lint") {
    args.push("--concurrency=1", "--ui=stream");
  }

  stdout.write(`[workspace-catalog] pnpm ${args.join(" ")}\n`);
  const result = spawnSync("pnpm", args, {
    cwd: repoRoot,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  process.exitCode = result.status ?? (result.signal ? 128 : 1);
};

const executeTypecheckFromArtifacts = () => {
  const eligible = workspaceCatalog.filter((entry) =>
    entry.releaseTasks.includes("typecheck"),
  );

  for (const entry of eligible) {
    const args = [
      "--dir",
      entry.path,
      "exec",
      "tsc",
      "-p",
      "tsconfig.json",
      "--noEmit",
    ];
    stdout.write(`[workspace-catalog] pnpm ${args.join(" ")}\n`);
    const result = spawnSync("pnpm", args, {
      cwd: repoRoot,
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    if (result.status !== 0) {
      process.exit(result.status ?? (result.signal ? 128 : 1));
    }
  }
};

const executeTestsFromArtifacts = () => {
  // Scenario workspaces are exercised by their dedicated BDD targets. Keep
  // Java/report generation out of the package-test lane while retaining their
  // manifest and typecheck coverage in this catalog.
  const eligible = workspaceCatalog.filter(
    (entry) =>
      entry.packageTest && entry.releaseTasks.includes("test:ci"),
  );

  for (const entry of eligible) {
    const args = ["--dir", entry.path, ...entry.testFromArtifacts];
    stdout.write(`[workspace-catalog] pnpm ${args.join(" ")}\n`);
    const result = spawnSync("pnpm", args, {
      cwd: repoRoot,
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    if (result.status !== 0) {
      process.exit(result.status ?? (result.signal ? 128 : 1));
    }
  }
};
const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const [command, value] = process.argv.slice(2);
  try {
    switch (command) {
      case "--json":
        stdout.write(`${JSON.stringify({ workspaces: workspaceCatalog }, null, 2)}\n`);
        break;
      case "--paths":
        printLines(workspaceCatalog.map((entry) => entry.path));
        break;
      case "--packable-paths":
        printLines(packableWorkspacePaths);
        break;
      case "--release-paths":
        printLines(releaseWorkspacePaths);
        break;
      case "--publishable-paths":
        printLines(supportedWorkspacePaths);
        break;
      case "--package-test-paths":
        printLines(packageTestWorkspacePaths);
        break;
      case "--exec-task":
        executeReleaseTask(value);
        break;
      case "--exec-typecheck-from-artifacts":
        executeTypecheckFromArtifacts();
        break;
      case "--exec-tests-from-artifacts":
        executeTestsFromArtifacts();
        break;
      case "--check":
        checkCatalog();
        stdout.write("[workspace-catalog] Catalog checks passed.\n");
        break;
      default:
        stderr.write(
          "Usage: workspace-catalog.mjs --check | --json | --paths | --packable-paths | --release-paths | --publishable-paths | --package-test-paths | --exec-task <task> | --exec-typecheck-from-artifacts | --exec-tests-from-artifacts\n",
        );
        process.exit(command === undefined ? 0 : 1);
    }
  } catch (error) {
    stderr.write(`[workspace-catalog] ${error.message}\n`);
    process.exit(1);
  }
}
