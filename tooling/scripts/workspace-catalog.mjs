#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { stderr, stdout } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const supportedPackages = [
  {
    path: "packages/core/model",
    consumerFixture: "tooling/fixtures/credential-model-consumer",
    consumerChecks: ["node", "typescript", "browser"],
  },
  {
    path: "packages/core/compact",
    consumerFixture: "tooling/fixtures/credential-compact-consumer",
    consumerChecks: ["node", "typescript", "compact"],
  },
];

export const privateWorkspacePaths = ["examples/core-composition"];
const allowedConsumerChecks = new Set([
  "node",
  "typescript",
  "browser",
  "compact",
]);
export const supportedWorkspacePaths = supportedPackages.map(
  ({ path: packagePath }) => packagePath,
);
export const workspacePaths = [
  ...supportedWorkspacePaths,
  ...privateWorkspacePaths,
];
export const releasePackageFiles = () => [
  "dist/**",
  "README.md",
  "CHANGELOG.md",
  "package.json",
];

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const readPackage = (workspacePath) =>
  JSON.parse(
    readFileSync(path.join(repoRoot, workspacePath, "package.json"), "utf8"),
  );

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

const checkCatalog = () => {
  const invocation = pnpmInvocation([
    "--recursive",
    "list",
    "--depth",
    "-1",
    "--json",
  ]);
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    0,
    `pnpm workspace enumeration failed: ${result.stderr}`,
  );

  const pnpmPaths = JSON.parse(result.stdout)
    .map(({ path: workspacePath }) =>
      path.relative(repoRoot, workspacePath).split(path.sep).join("/"),
    )
    .filter(Boolean)
    .sort();
  assert.deepEqual(
    pnpmPaths,
    [...workspacePaths].sort(),
    "workspace catalog must match pnpm-workspace.yaml",
  );
  assert.equal(
    new Set(workspacePaths).size,
    workspacePaths.length,
    "workspace paths must be unique",
  );

  const packages = workspacePaths.map((workspacePath) => [
    workspacePath,
    readPackage(workspacePath),
  ]);
  assert.equal(
    new Set(packages.map(([, packageJson]) => packageJson.name)).size,
    packages.length,
    "workspace package names must be unique",
  );

  for (const [workspacePath, packageJson] of packages) {
    assert.equal(
      packageJson.license,
      "Apache-2.0",
      `${workspacePath} must declare the repository license`,
    );
    assert.equal(packageJson.type, "module", `${workspacePath} must be ESM`);
  }

  for (const {
    path: packagePath,
    consumerFixture,
    consumerChecks,
  } of supportedPackages) {
    const packageJson = readPackage(packagePath);
    assert.equal(packageJson.private, false, `${packagePath} must be public`);
    assert.ok(
      existsSync(path.join(repoRoot, consumerFixture, "package.json")),
      `${packagePath} consumer fixture must include package.json`,
    );
    assert.ok(
      consumerChecks.length > 0 &&
        consumerChecks.every((check) => allowedConsumerChecks.has(check)),
      `${packagePath} must declare known consumer checks`,
    );
    for (const task of ["lint", "typecheck", "build", "test", "prepack"]) {
      assert.ok(
        packageJson.scripts?.[task],
        `${packagePath} is missing '${task}'`,
      );
      assert.ok(
        !packageJson.scripts[task].includes("test:integration"),
        `${packagePath} '${task}' must not invoke Docker integration`,
      );
    }
  }

  for (const packagePath of privateWorkspacePaths) {
    const packageJson = readPackage(packagePath);
    assert.equal(packageJson.private, true, `${packagePath} must remain private`);
    assert.equal(
      packageJson.publishConfig,
      undefined,
      `${packagePath} must not define publishConfig`,
    );
    assert.equal(
      packageJson.scripts?.prepack,
      undefined,
      `${packagePath} must not prepack`,
    );
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
