#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { workspaceCatalog } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const fail = (message) => {
  throw new Error(`[test-release-package-consumers] ${message}`);
};

const isWithin = (parent, child) => {
  const relative = path.relative(parent, child);
  return (
    relative !== "" &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== ".."
  );
};

const tarballName = (packageJson) =>
  `${packageJson.name.slice(1).replace("/", "-")}-${packageJson.version}.tgz`;

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== "--tarballs") {
  fail("Usage: test-release-package-consumers.mjs --tarballs <directory>");
}

const tarballDirectory = path.resolve(repoRoot, args[1]);
if (!existsSync(tarballDirectory)) {
  fail(`${args[1]} tarball directory is missing`);
}

const environment = { ...process.env };
delete environment.COMPACT_PATH;
delete environment.NODE_PATH;
delete environment.npm_config_workspace;
delete environment.NPM_CONFIG_WORKSPACE;
const installLifecycleHooks = [
  "preinstall",
  "install",
  "postinstall",
  "prepare",
];

const run = (command, commandArgs, cwd, label) => {
  console.log(`[test-release-package-consumers] ${label}`);
  execFileSync(command, commandArgs, {
    cwd,
    env: environment,
    stdio: "inherit",
  });
};

const releasePackages = workspaceCatalog.filter(
  (entry) => entry.releaseStage !== "internal",
);
if (releasePackages.length === 0) {
  fail("workspace catalog has no candidate or supported release packages");
}

for (const releasePackage of releasePackages) {
  if (typeof releasePackage.consumerFixture !== "string") {
    fail(`${releasePackage.path} has no clean-consumer fixture`);
  }

  const sourcePackageJson = JSON.parse(
    readFileSync(
      path.join(repoRoot, releasePackage.path, "package.json"),
      "utf8",
    ),
  );
  const fixtureRoot = path.resolve(repoRoot, releasePackage.consumerFixture);
  if (!isWithin(repoRoot, fixtureRoot)) {
    fail(
      `${releasePackage.path} consumer fixture must stay inside the repository`,
    );
  }
  const fixturePackageJson = JSON.parse(
    readFileSync(path.join(fixtureRoot, "package.json"), "utf8"),
  );
  const fixtureRuntimeDependencies = Object.keys(
    fixturePackageJson.dependencies ?? {},
  );
  if (
    fixtureRuntimeDependencies.length !== 1 ||
    fixturePackageJson.dependencies?.[sourcePackageJson.name] !==
    "file:./vendor/candidate.tgz"
  ) {
    fail(
      `${releasePackage.consumerFixture} must install only ${sourcePackageJson.name} from the copied tarball`,
    );
  }

  const tarballPath = path.join(
    tarballDirectory,
    tarballName(sourcePackageJson),
  );
  if (!existsSync(tarballPath)) {
    fail(`${path.relative(repoRoot, tarballPath)} is missing`);
  }
  const packedPackageJson = JSON.parse(
    execFileSync("tar", ["-xOf", tarballPath, "package/package.json"], {
      encoding: "utf8",
    }),
  );
  for (const lifecycleHook of installLifecycleHooks) {
    if (packedPackageJson.scripts?.[lifecycleHook] !== undefined) {
      fail(
        `${sourcePackageJson.name} tarball must not run ${lifecycleHook} during install`,
      );
    }
  }

  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-release-consumer-"),
  );
  const realTemporaryRoot = realpathSync(temporaryRoot);
  const consumerRoot = path.join(temporaryRoot, "project");
  try {
    if (isWithin(repoRoot, temporaryRoot)) {
      fail("temporary consumer must live outside the repository");
    }
    cpSync(fixtureRoot, consumerRoot, { recursive: true });
    mkdirSync(path.join(consumerRoot, "vendor"));
    copyFileSync(
      tarballPath,
      path.join(consumerRoot, "vendor", "candidate.tgz"),
    );

    run(
      "pnpm",
      [
        "install",
        "--lockfile-only",
        "--ignore-scripts",
        "--no-frozen-lockfile",
        "--prefer-offline",
        "--strict-peer-dependencies",
      ],
      consumerRoot,
      `${sourcePackageJson.name}: scripts-disabled dependency resolution`,
    );

    const lockfile = readFileSync(
      path.join(consumerRoot, "pnpm-lock.yaml"),
      "utf8",
    );
    const localLocators = lockfile.match(
      /(?:file|link|workspace):[^\s,'"}\]]+/gu,
    ) ?? [];
    for (const locator of localLocators) {
      if (
        locator !== "file:./vendor/candidate.tgz" &&
        locator !== "file:vendor/candidate.tgz"
      ) {
        fail(`consumer lockfile contains forbidden local locator ${locator}`);
      }
    }
    if (lockfile.includes(repoRoot)) {
      fail("consumer lockfile contains the repository path");
    }

    run(
      "pnpm",
      [
        "install",
        "--frozen-lockfile",
        "--prefer-offline",
        "--strict-peer-dependencies",
      ],
      consumerRoot,
      `${sourcePackageJson.name}: isolated install`,
    );

    const installedPackageRoot = realpathSync(
      path.join(
        consumerRoot,
        "node_modules",
        ...sourcePackageJson.name.split("/"),
      ),
    );
    if (!isWithin(realTemporaryRoot, installedPackageRoot)) {
      fail(`${sourcePackageJson.name} resolved outside the temporary consumer`);
    }

    for (const [script, label] of [
      ["test:node", "Node ESM"],
      ["typecheck", "strict TypeScript"],
      ["typecheck:legacy", "legacy TypeScript resolution"],
      ["bundle", "browser bundle"],
      ["test:bundle", "bundled execution"],
    ]) {
      run(
        "pnpm",
        ["run", script],
        consumerRoot,
        `${sourcePackageJson.name}: ${label}`,
      );
    }
    run(
      "compact",
      [
        "compile",
        "+0.30.0",
        "--skip-zk",
        "--compact-path",
        path.join(installedPackageRoot, "dist"),
        path.join(consumerRoot, "consumer.compact"),
        path.join(consumerRoot, "compact-output"),
      ],
      consumerRoot,
      `${sourcePackageJson.name}: Compact package resolution`,
    );

    console.log(
      `[test-release-package-consumers] ${sourcePackageJson.name} passed all clean-consumer checks.`,
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
