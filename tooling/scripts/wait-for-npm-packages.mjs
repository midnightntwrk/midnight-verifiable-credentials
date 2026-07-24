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

const parseArgs = (args) => {
  const options = {
    attempts: 10,
    delayMs: 15_000,
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
  options.delayMs < 0
) {
  throw new Error("registry and retry options are invalid");
}
if (packageNames.length === 0) {
  throw new Error("workspace catalog has no supported packages");
}

let missing = packageNames;
for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
  missing = packageNames.filter((packageName) => {
    try {
      const publishedVersion = execFileSync(
        "npm",
        [
          "view",
          `${packageName}@${options.version}`,
          "version",
          "--registry",
          options.registry,
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      ).trim();
      return publishedVersion !== options.version;
    } catch {
      return true;
    }
  });

  if (missing.length === 0) {
    process.stdout.write(
      `[wait-for-npm-packages] ${packageNames.length} package(s) visible at ${options.version}\n`,
    );
    process.exit(0);
  }
  if (attempt < options.attempts) {
    process.stdout.write(
      `[wait-for-npm-packages] attempt ${attempt}/${options.attempts}: waiting for ${missing.join(", ")}\n`,
    );
    await setTimeout(options.delayMs);
  }
}

throw new Error(
  `npm registry did not expose ${missing.join(", ")} at ${options.version}`,
);
