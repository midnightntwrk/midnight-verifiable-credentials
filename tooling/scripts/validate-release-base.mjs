#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  publicPackageExists,
  readPublicRegistryMetadata,
} from "./npm-public-metadata.mjs";
import { requireStableVersion } from "./prepare-release-version.mjs";
import { supportedWorkspacePaths } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const npmCommand = process.env.NPM_COMMAND ?? "npm";

export const compareStableVersions = (left, right) => {
  const leftParts = requireStableVersion(left, "release base")
    .split(".")
    .map(Number);
  const rightParts = requireStableVersion(right, "npm latest")
    .split(".")
    .map(Number);
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] > rightParts[index] ? 1 : -1;
    }
  }
  return 0;
};

const parseArgs = (args) => {
  const options = { registry: "https://registry.npmjs.org/" };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--channel") {
      options.channel = args[++index];
    } else if (args[index] === "--registry") {
      options.registry = args[++index];
    } else {
      throw new Error(`unknown argument: ${args[index]}`);
    }
  }
  return options;
};

const readJson = (relativePath) =>
  JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));

const readLatest = (packageName, registry) => {
  try {
    const latest = readPublicRegistryMetadata({
      args: ["view", packageName, "dist-tags.latest"],
      npmCommand,
      packageName,
      registry,
    });
    if (
      latest === "" &&
      publicPackageExists({ npmCommand, packageName, registry })
    ) {
      throw new Error(`${packageName} is published without an npm latest tag`);
    }
    return latest;
  } catch (error) {
    if (error.stderr === undefined || error.stderr === null) {
      throw error;
    }
    const stderr = String(error.stderr ?? "");
    if (
      /(?:E401|E404|401 Unauthorized|404 Not Found)/u.test(stderr) &&
      !publicPackageExists({ npmCommand, packageName, registry })
    ) {
      return "";
    }
    throw new Error(
      `npm latest lookup failed for ${packageName}: ${stderr.trim()}`,
    );
  }
};

export const validateReleaseBase = (options) => {
  const registryUrl = new URL(options.registry);
  if (
    registryUrl.protocol !== "https:" ||
    registryUrl.origin !== "https://registry.npmjs.org" ||
    registryUrl.pathname !== "/" ||
    registryUrl.search !== "" ||
    registryUrl.hash !== ""
  ) {
    throw new Error("--registry must be https://registry.npmjs.org/");
  }
  options.registry = registryUrl.href;
  if (!new Set(["rc", "release"]).has(options.channel)) {
    throw new Error("--channel must be rc or release");
  }
  const baseVersion = requireStableVersion(
    readJson("package.json").version,
    "release base",
  );

  let publishedLatestCount = 0;
  for (const workspacePath of supportedWorkspacePaths) {
    const packageName = readJson(path.join(workspacePath, "package.json")).name;
    const latest = readLatest(packageName, options.registry);
    if (latest === "") {
      process.stdout.write(
        `[validate-release-base] ${packageName} is not published; skipping latest comparison.\n`,
      );
      continue;
    }
    publishedLatestCount += 1;

    let comparison;
    try {
      comparison = compareStableVersions(baseVersion, latest);
    } catch (error) {
      throw new Error(
        `${packageName} has invalid npm latest ${latest}: ${error.message}`,
      );
    }

    if (options.channel === "rc" && comparison <= 0) {
      throw new Error(
        `${packageName} release base ${baseVersion} must be newer than npm latest ${latest}`,
      );
    }
    if (options.channel === "release" && comparison < 0) {
      throw new Error(
        `${packageName} release base ${baseVersion} must be at least npm latest ${latest}`,
      );
    }
  }
  if (publishedLatestCount === 0) {
    throw new Error("npm returned no published latest versions for the catalog");
  }
  return { baseVersion, publishedLatestCount };
};

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  try {
    const { baseVersion, publishedLatestCount } = validateReleaseBase(
      parseArgs(process.argv.slice(2)),
    );
    process.stdout.write(
      `[validate-release-base] ${baseVersion} is valid for the requested channel after comparing ${publishedLatestCount} published package(s).\n`,
    );
  } catch (error) {
    process.stderr.write(`[validate-release-base] ${error.message}\n`);
    process.exit(1);
  }
}
