#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { supportedWorkspacePaths } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const npmCommand = process.env.NPM_COMMAND ?? "npm";
const cleanProbeEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name]) =>
      !/^(?:NODE_AUTH_TOKEN|NPM_TOKEN)$/iu.test(name) &&
      !/^NPM_CONFIG_/iu.test(name),
  ),
);

const parseArgs = (args) => {
  const options = {
    attempts: 20,
    delayMs: 15_000,
    maxDelayMs: 60_000,
    registry: "https://registry.npmjs.org/",
  };
  for (let index = 0; index < args.length; index += 1) {
    switch (args[index]) {
      case "--version":
        options.version = args[++index];
        break;
      case "--registry":
        options.registry = args[++index];
        break;
      case "--attempts":
        options.attempts = Number(args[++index]);
        break;
      case "--delay-ms":
        options.delayMs = Number(args[++index]);
        break;
      case "--max-delay-ms":
        options.maxDelayMs = Number(args[++index]);
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

const options = parseArgs(process.argv.slice(2));
if (
  !/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u.test(
    options.version ?? "",
  )
) {
  throw new Error("--version must be a semantic version");
}
if (
  new URL(options.registry).protocol !== "https:" ||
  !Number.isInteger(options.attempts) ||
  options.attempts < 1 ||
  !Number.isInteger(options.delayMs) ||
  options.delayMs < 0 ||
  !Number.isInteger(options.maxDelayMs) ||
  options.maxDelayMs < options.delayMs
) {
  throw new Error("registry and retry options are invalid");
}
if (packageNames.length === 0) {
  throw new Error("workspace catalog has no supported packages");
}

const classifyViewError = (error, packageName) => {
  const stderr = String(error.stderr ?? "");
  const errorCode = stderr.match(/\bE\d{3}\b/u)?.[0];
  if (errorCode === "E404" || /\b(?:404|not found)\b/iu.test(stderr)) {
    return {
      kind: "missing",
      packageName,
      detail: `npm view reported version not found${errorCode ? ` (${errorCode})` : ""}`,
    };
  }
  return {
    kind: "error",
    packageName,
    detail: `npm view/registry error${error.status ? ` (exit ${error.status})` : ""}${errorCode ? ` (${errorCode})` : ""}`,
  };
};

const probePackage = (packageName) => {
  try {
    const publishedVersion = execFileSync(
      npmCommand,
      [
        "view",
        `${packageName}@${options.version}`,
        "version",
        "--registry",
        options.registry,
        // Never load setup-node's auth-bearing user config for this public probe.
        "--userconfig",
        "/dev/null",
      ],
      {
        encoding: "utf8",
        env: cleanProbeEnv,
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();
    if (publishedVersion === options.version) {
      return { kind: "visible", packageName };
    }
    return {
      kind: "missing",
      packageName,
      detail: `version not visible (npm view returned ${publishedVersion || "no version"})`,
    };
  } catch (error) {
    return classifyViewError(error, packageName);
  }
};

const describeResults = (results) => {
  const missing = results
    .filter(({ kind }) => kind === "missing")
    .map(({ packageName, detail }) => `${packageName} (${detail})`);
  const errors = results
    .filter(({ kind }) => kind === "error")
    .map(({ packageName, detail }) => `${packageName} (${detail})`);
  return {
    missing,
    errors,
    summary: [
      missing.length > 0 ? `missing version: ${missing.join(", ")}` : "",
      errors.length > 0 ? `npm view/registry errors: ${errors.join(", ")}` : "",
    ].filter(Boolean),
  };
};

let results = [];
for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
  results = packageNames.map(probePackage);
  const { missing, errors, summary } = describeResults(results);

  if (missing.length === 0 && errors.length === 0) {
    process.stdout.write(
      `[wait-for-npm-packages] ${packageNames.length} package(s) visible at ${options.version}\n`,
    );
    process.exit(0);
  }
  if (attempt < options.attempts) {
    const delayMs = Math.min(
      options.maxDelayMs,
      options.delayMs * 2 ** (attempt - 1),
    );
    process.stdout.write(
      `[wait-for-npm-packages] attempt ${attempt}/${options.attempts}: ${summary.join("; ")}; retrying in ${delayMs}ms\n`,
    );
    await setTimeout(delayMs);
  }
}

const { summary } = describeResults(results);
throw new Error(
  `[wait-for-npm-packages] npm registry did not expose ${packageNames.length} package(s) at ${options.version}; ${summary.join("; ")}`,
);
