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
  writeFileSync,
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
const tarballMode = args.length === 2 && args[0] === "--tarballs";
const registryMode =
  args.length === 4 &&
  args[0] === "--registry" &&
  args[2] === "--version";
if (!tarballMode && !registryMode) {
  fail(
    "Usage: test-release-package-consumers.mjs --tarballs <directory> | --registry <url> --version <version>",
  );
}

const tarballDirectory = tarballMode
  ? path.resolve(repoRoot, args[1])
  : undefined;
const registry = registryMode ? args[1] : undefined;
const expectedVersion = registryMode ? args[3] : undefined;
if (tarballDirectory !== undefined && !existsSync(tarballDirectory)) {
  fail(`${args[1]} tarball directory is missing`);
}
if (
  registry !== undefined &&
  (new URL(registry).protocol !== "https:" ||
    !/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u.test(
      expectedVersion,
    ))
) {
  fail("registry mode requires an HTTPS registry and semantic version");
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
const scriptChecks = [
  ["node", "test:node", "Node ESM"],
  ["typescript", "typecheck", "strict TypeScript"],
  ["legacy-typescript", "typecheck:legacy", "legacy TypeScript resolution"],
  ["browser", "bundle", "browser bundle"],
  ["browser", "test:bundle", "bundled execution"],
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

  const tarballPath =
    tarballDirectory === undefined
      ? undefined
      : path.join(tarballDirectory, tarballName(sourcePackageJson));
  if (tarballPath !== undefined) {
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
    if (tarballPath !== undefined) {
      mkdirSync(path.join(consumerRoot, "vendor"));
      copyFileSync(
        tarballPath,
        path.join(consumerRoot, "vendor", "candidate.tgz"),
      );
    } else {
      fixturePackageJson.dependencies[sourcePackageJson.name] = expectedVersion;
      writeFileSync(
        path.join(consumerRoot, "package.json"),
        `${JSON.stringify(fixturePackageJson, null, 2)}\n`,
      );
      writeFileSync(
        path.join(consumerRoot, ".npmrc"),
        `registry=${registry}\n`,
      );
    }

    run(
      "pnpm",
      [
        "install",
        "--lockfile-only",
        "--ignore-scripts",
        "--no-frozen-lockfile",
        "--prefer-offline",
        "--strict-peer-dependencies",
        ...(registry === undefined ? [] : ["--registry", registry]),
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
        tarballPath !== undefined &&
        (locator === "file:./vendor/candidate.tgz" ||
          locator === "file:vendor/candidate.tgz")
      ) {
        continue;
      }
      fail(`consumer lockfile contains forbidden local locator ${locator}`);
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
        ...(registry === undefined ? [] : ["--registry", registry]),
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
    const installedPackageJson = JSON.parse(
      readFileSync(path.join(installedPackageRoot, "package.json"), "utf8"),
    );
    if (
      expectedVersion !== undefined &&
      installedPackageJson.version !== expectedVersion
    ) {
      fail(
        `${sourcePackageJson.name} resolved ${installedPackageJson.version} instead of ${expectedVersion}`,
      );
    }
    for (const lifecycleHook of installLifecycleHooks) {
      if (installedPackageJson.scripts?.[lifecycleHook] !== undefined) {
        fail(
          `${sourcePackageJson.name} install contains forbidden ${lifecycleHook} hook`,
        );
      }
    }

    for (const [check, script, label] of scriptChecks) {
      if (!releasePackage.consumerChecks.includes(check)) {
        continue;
      }
      run(
        "pnpm",
        ["run", script],
        consumerRoot,
        `${sourcePackageJson.name}: ${label}`,
      );
    }
    if (releasePackage.consumerChecks.includes("compact")) {
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
    }

    console.log(
      `[test-release-package-consumers] ${sourcePackageJson.name} passed all clean-consumer checks.`,
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
