#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
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

import { supportedPackages } from "./workspace-catalog.mjs";

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

const collectExportTargets = (value, targets = []) => {
  if (typeof value === "string") {
    targets.push(value);
  } else if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const nested of Object.values(value)) {
      collectExportTargets(nested, targets);
    }
  } else {
    fail("package exports must contain only strings or condition objects");
  }
  return targets;
};

const readTarballManifest = (tarballPath, sourcePackageJson) => {
  const entries = execFileSync("tar", ["-tzf", tarballPath], {
    encoding: "utf8",
  })
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean);
  const requiredEntries = [
    "package/package.json",
    "package/LICENSE",
    "package/README.md",
    "package/CHANGELOG.md",
  ];

  for (const entry of entries) {
    const allowed =
      requiredEntries.includes(entry) || entry.startsWith("package/dist/");
    if (!allowed || entry.split("/").includes("..")) {
      fail(`${path.basename(tarballPath)} contains unexpected path ${entry}`);
    }
  }
  for (const entry of requiredEntries) {
    if (!entries.includes(entry)) {
      fail(`${path.basename(tarballPath)} is missing ${entry}`);
    }
  }

  const manifest = JSON.parse(
    execFileSync("tar", ["-xOf", tarballPath, "package/package.json"], {
      encoding: "utf8",
    }),
  );
  if (
    manifest.name !== sourcePackageJson.name ||
    manifest.version !== sourcePackageJson.version
  ) {
    fail(`${path.basename(tarballPath)} has unexpected package identity`);
  }
  for (const target of collectExportTargets(manifest.exports)) {
    if (!target.startsWith("./dist/") || target.includes("*")) {
      fail(`${manifest.name} has unsupported export target ${target}`);
    }
    const entry = `package/${target.slice(2)}`;
    if (!entries.includes(entry)) {
      fail(`${manifest.name} export target ${target} is missing`);
    }
  }

  const compactExports = Object.keys(manifest.exports ?? {})
    .filter((subpath) => subpath.endsWith(".compact"))
    .sort();
  const compactEntrypoints = Object.values(
    manifest.midnight?.compactEntrypoints ?? {},
  )
    .flat()
    .sort();
  if (
    compactExports.length > 0 ||
    compactEntrypoints.length > 0
  ) {
    if (JSON.stringify(compactExports) !== JSON.stringify(compactEntrypoints)) {
      fail(`${manifest.name} Compact exports and entrypoints differ`);
    }
  }
  return manifest;
};

const args = process.argv.slice(2);
const tarballMode = args.length === 2 && args[0] === "--tarballs";
const validationMode =
  args.length === 2 && args[0] === "--validate-tarballs";
const registryMode =
  args.length === 4 &&
  args[0] === "--registry" &&
  args[2] === "--version";
if (!tarballMode && !validationMode && !registryMode) {
  fail(
    "Usage: test-release-package-consumers.mjs --tarballs <directory> | --validate-tarballs <directory> | --registry <url> --version <version>",
  );
}

const tarballDirectory = tarballMode || validationMode
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

const releasePackages = supportedPackages;
if (releasePackages.length === 0) {
  fail("workspace catalog has no supported release packages");
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
    "file:./vendor/package.tgz"
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
    const packedPackageJson = readTarballManifest(
      tarballPath,
      sourcePackageJson,
    );
    for (const lifecycleHook of installLifecycleHooks) {
      if (packedPackageJson.scripts?.[lifecycleHook] !== undefined) {
        fail(
          `${sourcePackageJson.name} tarball must not run ${lifecycleHook} during install`,
        );
      }
    }
  }
  if (validationMode) {
    continue;
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
        path.join(consumerRoot, "vendor", "package.tgz"),
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
      /(?:file|link|workspace|git(?:\+[^:]+)?|https?):[^\s,'"}\]]+/gu,
    ) ?? [];
    for (const locator of localLocators) {
      if (
        tarballPath !== undefined &&
        (locator === "file:./vendor/package.tgz" ||
          locator === "file:vendor/package.tgz")
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
    if (installedPackageJson.midnight?.compactCompilerVersion !== undefined) {
      const expectedCompiler = installedPackageJson.midnight.compactCompilerVersion;
      const expectedRuntime = installedPackageJson.midnight.compactRuntimeVersion;
      const buildManifest = JSON.parse(
        readFileSync(path.join(installedPackageRoot, "dist/compact-build.json"), "utf8"),
      );
      const runtimePackagePath = createRequire(
        path.join(installedPackageRoot, "dist/index.js"),
      ).resolve("@midnight-ntwrk/compact-runtime/package.json");
      const resolvedRuntime = JSON.parse(
        readFileSync(runtimePackagePath, "utf8"),
      ).version;
      if (buildManifest.compiler !== expectedCompiler || buildManifest.runtime?.version !== expectedRuntime) {
        fail(`${sourcePackageJson.name} generated metadata does not match pinned Compact tuple`);
      }
      if (resolvedRuntime !== expectedRuntime) {
        fail(`${sourcePackageJson.name} resolved runtime ${resolvedRuntime} instead of ${expectedRuntime}`);
      }
    }
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
    const expectedCompactEntrypoints =
      sourcePackageJson.midnight?.compactEntrypoints;
    const compactEntrypoints = installedPackageJson.midnight?.compactEntrypoints;
    if (
      expectedCompactEntrypoints !== undefined &&
      JSON.stringify(compactEntrypoints) !==
        JSON.stringify(expectedCompactEntrypoints)
    ) {
      fail(`${sourcePackageJson.name} has unexpected Compact entrypoint metadata`);
    }
    if (compactEntrypoints !== undefined) {
      if (typeof installedPackageJson.midnight?.compactCompilerVersion !== "string") {
        fail(`${sourcePackageJson.name} has no Compact compiler version`);
      }
      const standalone = compactEntrypoints.standalone;
      const composition = compactEntrypoints.composition;
      if (!Array.isArray(standalone) || !Array.isArray(composition)) {
        fail(`${sourcePackageJson.name} has invalid Compact entrypoint metadata`);
      }
      const compactExports = Object.entries(installedPackageJson.exports ?? {})
        .filter(([subpath, target]) => subpath.endsWith(".compact") && typeof target === "string")
        .map(([subpath]) => subpath);
      for (const entrypoint of [...standalone, ...composition]) {
        if (!compactExports.includes(entrypoint)) {
          fail(`${sourcePackageJson.name} metadata advertises unexported Compact entrypoint ${entrypoint}`);
        }
      }
      const compileExternal = (name, includes) => {
        const wrapper = path.join(consumerRoot, `${name}.compact`);
        const output = path.join(installedPackageRoot, ".compact-consumer", `${name}-output`);
        writeFileSync(
          wrapper,
          `pragma language_version >= 0.20;\nimport CompactStandardLibrary;\n${includes
            .map((include) => `include "${include.replace("./", "").replace(".compact", "")}";`)
            .join("\n")}\n`,
        );
        run(
          "compact",
          ["compile", `+${installedPackageJson.midnight.compactCompilerVersion}`, "--skip-zk", "--compact-path", path.join(installedPackageRoot, "dist"), wrapper, output],
          consumerRoot,
          `${sourcePackageJson.name}: external Compact ${name}`,
        );
        return realpathSync(output);
      };
      for (const [index, entrypoint] of standalone.entries()) {
        compileExternal(`compact-standalone-${index}`, [entrypoint]);
      }
      for (const [index, entrypoint] of composition.entries()) {
        compileExternal(`compact-composition-${index}`, [entrypoint]);
      }
    }

    console.log(
      `[test-release-package-consumers] ${sourcePackageJson.name} passed all clean-consumer checks.`,
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
