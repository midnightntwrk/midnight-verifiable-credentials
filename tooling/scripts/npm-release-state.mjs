#!/usr/bin/env node
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  publicPackageExists,
  readPublicRegistryMetadata,
} from "./npm-public-metadata.mjs";
import { supportedWorkspacePaths } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const npmCommand = process.env.NPM_COMMAND ?? "npm";
const trackedChannelTags = ["latest", "rc"];

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

const parseDistTags = (packageName, output) => {
  if (output.length === 0) {
    return {};
  }
  const distTags = Object.create(null);
  for (const line of output.split("\n")) {
    const match = /^([^:\s]+):\s+(\S+)$/u.exec(line);
    if (match === null || Object.hasOwn(distTags, match[1])) {
      throw new Error(`npm returned invalid dist-tags for ${packageName}`);
    }
    distTags[match[1]] = match[2];
  }
  return Object.fromEntries(Object.entries(distTags));
};

const readRegistryMetadata = (args, packageName, registry) =>
  readPublicRegistryMetadata({
    args,
    npmCommand,
    packageName,
    registry,
  });

const readDistTags = (packageName, registry) => {
  try {
    const output = readRegistryMetadata(
      [
        "dist-tag",
        "ls",
        packageName,
      ],
      packageName,
      registry,
    );
    return parseDistTags(packageName, output);
  } catch (error) {
    if (error.stderr === undefined || error.stderr === null) {
      throw error;
    }
    const stderr = String(error.stderr ?? "");
    if (/No dist-tags found for\s/u.test(stderr)) {
      return {};
    }
    if (
      /(?:E401|E404|401 Unauthorized|404 Not Found)/u.test(stderr) &&
      !publicPackageExists({ npmCommand, packageName, registry })
    ) {
      return {};
    }
    throw new Error(
      `npm dist-tag ls failed for ${packageName}: ${stderr.trim()}`,
    );
  }
};

const normalizeDistTags = (distTags) =>
  Object.fromEntries(
    [...new Set([...trackedChannelTags, ...Object.keys(distTags)])]
      .sort()
      .map((tag) => [tag, distTags[tag] ?? null]),
  );

const requireSnapshotDistTags = (packageName, value) => {
  if (
    value === null ||
    Array.isArray(value) ||
    typeof value !== "object" ||
    trackedChannelTags.some((tag) => !Object.hasOwn(value, tag)) ||
    Object.values(value).some(
      (tagValue) => tagValue !== null && typeof tagValue !== "string",
    )
  ) {
    throw new Error(`release-state input has invalid dist-tags for ${packageName}`);
  }
  return value;
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
    schemaVersion: "midnight-vc-npm-release-state.v2",
    registry: options.registry,
    packages: Object.fromEntries(
      packageNames.map((packageName) => [
        packageName,
        {
          distTags: normalizeDistTags(
            readDistTags(packageName, options.registry),
          ),
        },
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
    state.schemaVersion !== "midnight-vc-npm-release-state.v2" ||
    state.registry !== options.registry
  ) {
    throw new Error("release-state input has an incompatible schema or registry");
  }

  for (const packageName of packageNames) {
    const previous = state.packages?.[packageName]?.distTags;
    if (previous === undefined) {
      throw new Error(`release-state input is missing ${packageName}`);
    }
    requireSnapshotDistTags(packageName, previous);
    const current = normalizeDistTags(
      readDistTags(packageName, options.registry),
    );
    if (current[options.tag] !== options.version) {
      throw new Error(
        `${packageName} tag ${options.tag} resolves to ${current[options.tag] ?? "<absent>"} instead of ${options.version}`,
      );
    }
    const nonSelectedTags = new Set([
      ...Object.keys(previous),
      ...Object.keys(current),
    ]);
    nonSelectedTags.delete(options.tag);
    for (const tag of [...nonSelectedTags].sort()) {
      const previousValue = previous[tag] ?? null;
      const currentValue = current[tag] ?? null;
      if (currentValue !== previousValue) {
        throw new Error(
          `${packageName} ${tag} changed from ${previousValue ?? "<absent>"} to ${currentValue ?? "<absent>"}`,
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
