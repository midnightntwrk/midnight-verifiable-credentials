#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const coneScript = path.join(repoRoot, "tooling/scripts/ci-build-output-groups.sh");

const quoteForBash = (value) => `'${value.replaceAll("'", "'\\''")}'`;

const runGit = (args) =>
  execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });

const readShellList = (functionName, argument) => {
  const command = [
    `source ${quoteForBash(coneScript)}`,
    argument === undefined
      ? functionName
      : `${functionName} ${quoteForBash(argument)}`,
  ].join("; ");

  return execFileSync("bash", ["-c", command], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
};

const isIgnored = (relativePath) => {
  // Directory-only ignore patterns can match the placeholder form even when the
  // bare generated directory does not exist in a clean checkout.
  for (const candidate of [relativePath, `${relativePath}/.generated-contract`]) {
    try {
      execFileSync("git", ["check-ignore", "-q", candidate], {
        cwd: repoRoot,
        stdio: "ignore",
      });
      return true;
    } catch {
      // Keep checking the directory placeholder form.
    }
  }

  return false;
};

const isGeneratedOutputPath = (relativePath) =>
  relativePath.endsWith("/dist") || relativePath.endsWith("/src/managed");

const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const workspaceSet = new Set(packageJson.workspaces ?? []);
const trackedFiles = runGit(["ls-files"])
  .split(/\r?\n/u)
  .filter(Boolean);

const errors = [];
const groups = readShellList("ci_build_output_groups");
const seenGroups = new Set();
const seenOutputs = new Map();
const summary = [];

for (const group of groups) {
  if (seenGroups.has(group)) {
    errors.push(`Duplicate CI build cone group: ${group}`);
  }
  seenGroups.add(group);

  const inputPackages = readShellList("ci_build_input_packages", group);
  const outputPaths = readShellList("ci_build_output_paths", group);

  if (inputPackages.length === 0) {
    errors.push(`CI build cone '${group}' has no input packages`);
  }

  if (outputPaths.length === 0) {
    errors.push(`CI build cone '${group}' has no output paths`);
  }

  for (const packagePath of inputPackages) {
    if (path.isAbsolute(packagePath) || packagePath.includes("..")) {
      errors.push(`CI build cone '${group}' has unsafe input path: ${packagePath}`);
      continue;
    }

    if (!workspaceSet.has(packagePath)) {
      errors.push(`CI build cone '${group}' input is not a root workspace: ${packagePath}`);
    }

    if (!existsSync(path.join(repoRoot, packagePath, "package.json"))) {
      errors.push(`CI build cone '${group}' input package is missing package.json: ${packagePath}`);
    }
  }

  for (const outputPath of outputPaths) {
    if (path.isAbsolute(outputPath) || outputPath.includes("..")) {
      errors.push(`CI build cone '${group}' has unsafe output path: ${outputPath}`);
      continue;
    }

    const owner = inputPackages.find(
      (packagePath) => outputPath === packagePath || outputPath.startsWith(`${packagePath}/`),
    );

    if (!owner) {
      errors.push(`CI build cone '${group}' output is outside its input packages: ${outputPath}`);
    }

    if (!isGeneratedOutputPath(outputPath)) {
      errors.push(
        `CI build cone '${group}' output is not an allowed generated artifact directory: ${outputPath}`,
      );
    }

    const previousGroup = seenOutputs.get(outputPath);
    if (previousGroup) {
      errors.push(
        `CI build cone output '${outputPath}' is listed by both '${previousGroup}' and '${group}'`,
      );
    }
    seenOutputs.set(outputPath, group);

    if (trackedFiles.some((file) => file === outputPath || file.startsWith(`${outputPath}/`))) {
      errors.push(`CI build cone '${group}' output is tracked by git: ${outputPath}`);
    }

    if (!isIgnored(outputPath)) {
      errors.push(`CI build cone '${group}' output is not matched by .gitignore: ${outputPath}`);
    }
  }

  summary.push({
    group,
    inputPackageCount: inputPackages.length,
    outputPathCount: outputPaths.length,
  });
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[check-ci-build-cones] ${error}`);
  }
  process.exit(1);
}

for (const entry of summary) {
  console.log(
    `[check-ci-build-cones] ${entry.group}: ${entry.inputPackageCount} inputs, ${entry.outputPathCount} outputs`,
  );
}

console.log(`[check-ci-build-cones] Verified ${summary.length} CI build cone contracts.`);
