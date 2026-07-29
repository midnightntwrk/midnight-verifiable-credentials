#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { supportedWorkspacePaths } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const stableVersionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;

export const requireStableVersion = (value, label = "version") => {
  if (!stableVersionPattern.test(value ?? "")) {
    throw new Error(`${label} must be a stable semantic version like 1.2.3`);
  }
  return value;
};

const gitShortSha = () => {
  const value =
    process.env.GITHUB_SHA ??
    execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
  return value
    .slice(0, 12)
    .replace(/[^0-9a-z]/giu, "")
    .toLowerCase();
};

export const computeReleaseVersion = ({
  baseVersion,
  channel,
  rcIndex,
  runNumber = process.env.GITHUB_RUN_NUMBER,
  shortSha = gitShortSha(),
}) => {
  requireStableVersion(baseVersion, "base version");

  switch (channel) {
    case "snapshot": {
      const snapshotRun = runNumber ?? Date.now().toString();
      if (!/^[0-9A-Za-z._-]+$/u.test(snapshotRun)) {
        throw new Error("snapshot run number contains unsupported characters");
      }
      return {
        channel,
        version: `${baseVersion}-snapshot.${snapshotRun}.${shortSha}`,
        npmTag: "snapshot",
      };
    }
    case "rc":
      if (!/^[1-9]\d*$/u.test(rcIndex ?? "")) {
        throw new Error("rc index must be a positive integer");
      }
      return {
        channel,
        version: `${baseVersion}-rc${rcIndex}`,
        npmTag: "rc",
      };
    case "release":
      return {
        channel,
        version: baseVersion,
        npmTag: "latest",
      };
    default:
      throw new Error(
        `channel must be snapshot, rc, or release; received ${channel}`,
      );
  }
};

const parseArgs = (args) => {
  const options = { dryRun: false, json: false };
  for (let index = 0; index < args.length; index += 1) {
    switch (args[index]) {
      case "--channel":
        options.channel = args[++index];
        break;
      case "--version":
        options.version = args[++index];
        break;
      case "--rc-index":
        options.rcIndex = args[++index];
        break;
      case "--github-output":
        options.githubOutput = args[++index];
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--json":
        options.json = true;
        break;
      default:
        throw new Error(`unknown argument: ${args[index]}`);
    }
  }
  return options;
};

const readJson = (relativePath) =>
  JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));

const writeJson = (relativePath, value) => {
  writeFileSync(
    path.join(repoRoot, relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
  );
};

const writeGitHubOutput = (outputPath, values) => {
  if (outputPath === undefined) {
    return;
  }
  appendFileSync(
    outputPath,
    `${Object.entries(values)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")}\n`,
  );
};

export const prepareReleaseVersion = (options) => {
  if (supportedWorkspacePaths.length === 0) {
    throw new Error("workspace catalog has no supported packages");
  }

  const rootPackage = readJson("package.json");
  const baseVersion = requireStableVersion(
    options.version ?? rootPackage.version,
    "version",
  );
  const release = computeReleaseVersion({
    baseVersion,
    channel: options.channel,
    rcIndex: options.rcIndex,
  });

  for (const workspacePath of supportedWorkspacePaths) {
    const manifestPath = path.join(workspacePath, "package.json");
    const packageJson = readJson(manifestPath);
    if (packageJson.version !== baseVersion) {
      throw new Error(
        `${manifestPath} version ${packageJson.version} does not match base ${baseVersion}`,
      );
    }
    if (packageJson.private === true) {
      throw new Error(`${manifestPath} is private and cannot be published`);
    }
    if (!options.dryRun) {
      packageJson.version = release.version;
      writeJson(manifestPath, packageJson);
    }
  }

  const result = {
    ...release,
    baseVersion,
    packageCount: supportedWorkspacePaths.length,
  };
  writeGitHubOutput(options.githubOutput, {
    channel: result.channel,
    base_version: result.baseVersion,
    version: result.version,
    npm_tag: result.npmTag,
    package_count: result.packageCount,
  });
  return result;
};

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = prepareReleaseVersion(options);
    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      process.stdout.write(
        `[prepare-release-version] ${result.channel} version ${result.version} for ${result.packageCount} package(s), npm tag ${result.npmTag}\n`,
      );
    }
  } catch (error) {
    process.stderr.write(`[prepare-release-version] ${error.message}\n`);
    process.exit(1);
  }
}
