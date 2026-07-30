#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
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
const npmCommand = process.env.NPM_COMMAND ?? "npm";

const parseArgs = (args) => {
  const options = {
    registry: "https://registry.npmjs.org/",
  };
  for (let index = 0; index < args.length; index += 1) {
    switch (args[index]) {
      case "--snapshot":
        options.mode = "snapshot";
        break;
      case "--verify":
        options.mode = "verify";
        break;
      case "--output":
        options.output = args[++index];
        break;
      case "--input":
        options.input = args[++index];
        break;
      case "--registry":
        options.registry = args[++index];
        break;
      case "--version":
        options.version = args[++index];
        break;
      case "--tag":
        options.tag = args[++index];
        break;
      default:
        throw new Error(`unknown argument: ${args[index]}`);
    }
  }
  return options;
};

const packageNames = supportedWorkspacePaths.map((workspacePath) => {
  const packageJson = JSON.parse(
    readFileSync(path.join(repoRoot, workspacePath, "package.json"), "utf8"),
  );
  return packageJson.name;
});

const readDistTags = (packageName, registry) => {
  try {
    const output = execFileSync(
      npmCommand,
      ["view", packageName, "dist-tags", "--json", "--registry", registry],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
    return output.length === 0 ? {} : JSON.parse(output);
  } catch (error) {
    const stderr = String(error.stderr ?? "");
    if (/(?:E404|404 Not Found)/u.test(stderr)) {
      return {};
    }
    throw new Error(`npm view failed for ${packageName}: ${stderr.trim()}`);
  }
};

const options = parseArgs(process.argv.slice(2));
if (new URL(options.registry).protocol !== "https:") {
  throw new Error("--registry must use HTTPS");
}
if (packageNames.length === 0) {
  throw new Error("workspace catalog has no supported packages");
}

if (options.mode === "snapshot") {
  if (options.output === undefined) {
    throw new Error("--snapshot requires --output");
  }
  const outputPath = path.resolve(repoRoot, options.output);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  const state = {
    schemaVersion: "midnight-vc-npm-release-state.v1",
    registry: options.registry,
    packages: Object.fromEntries(
      packageNames.map((packageName) => [
        packageName,
        { distTags: readDistTags(packageName, options.registry) },
      ]),
    ),
  };
  writeFileSync(outputPath, `${JSON.stringify(state, null, 2)}\n`);
  process.stdout.write(
    `[npm-release-state] Saved ${packageNames.length} package state(s).\n`,
  );
} else if (options.mode === "verify") {
  if (
    options.input === undefined ||
    options.version === undefined ||
    options.tag === undefined
  ) {
    throw new Error("--verify requires --input, --version, and --tag");
  }
  const state = JSON.parse(
    readFileSync(path.resolve(repoRoot, options.input), "utf8"),
  );
  if (
    state.schemaVersion !== "midnight-vc-npm-release-state.v1" ||
    state.registry !== options.registry
  ) {
    throw new Error("release-state input has an incompatible schema or registry");
  }

  for (const packageName of packageNames) {
    const previous = state.packages?.[packageName]?.distTags;
    if (previous === undefined) {
      throw new Error(`release-state input is missing ${packageName}`);
    }
    const current = readDistTags(packageName, options.registry);
    if (current[options.tag] !== options.version) {
      throw new Error(
        `${packageName} tag ${options.tag} resolves to ${current[options.tag] ?? "<absent>"} instead of ${options.version}`,
      );
    }
    if (options.tag !== "latest") {
      if (current.latest === options.version) {
        throw new Error(
          `${packageName} prerelease unexpectedly changed latest to ${options.version}`,
        );
      }
      if (current.latest !== previous.latest) {
        throw new Error(
          `${packageName} latest changed from ${previous.latest ?? "<absent>"} to ${current.latest ?? "<absent>"}`,
        );
      }
    }
  }
  process.stdout.write(
    `[npm-release-state] Verified ${packageNames.length} package tag state(s).\n`,
  );
} else {
  throw new Error("use exactly one of --snapshot or --verify");
}
