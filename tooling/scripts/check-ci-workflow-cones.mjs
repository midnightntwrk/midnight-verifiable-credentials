#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const coneScript = path.join(repoRoot, "tooling/scripts/ci-build-output-groups.sh");
const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const workflowText = readFileSync(path.join(repoRoot, ".github/workflows/ci.yml"), "utf8");
const errors = [];

const quoteForBash = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const yamlWordScalarPattern = (value) => `(["']?)${escapeRegExp(value)}\\b\\1`;

const readShellList = (functionName, argument) => {
  const command = [
    `source ${quoteForBash(coneScript)}`,
    argument === undefined
      ? functionName
      : `${functionName} ${quoteForBash(argument)}`,
  ].join("; ");

  try {
    return execFileSync("bash", ["-c", command], {
      cwd: repoRoot,
      encoding: "utf8",
    })
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    const stderr = error.stderr?.toString().trim();
    const context = argument === undefined ? functionName : `${functionName} '${argument}'`;
    errors.push(`Failed to read shell cone list from ${context}${stderr ? `: ${stderr}` : ""}`);
    return [];
  }
};

function failOnErrors() {
  if (errors.length === 0) {
    return;
  }

  for (const error of errors) {
    console.error(`[check-ci-workflow-cones] ${error}`);
  }
  process.exit(1);
}

const ownerForOutputPath = (outputPath) =>
  outputPath.replace(/\/(?:dist|src\/managed)$/u, "");

const parseTurboFilters = (script) =>
  [...script.matchAll(/--filter=(?:"|')?\.\/([^\s"'&;|()<>,]+)(?:"|')?/gu)].map(
    (match) => match[1],
  );

const parseDirectBuildWorkspaces = (script) =>
  [...script.matchAll(/npm\s+run\s+build\s+-w\s+\.\/([^\s"'&;|()<>,]+)/gu)].map(
    (match) => match[1],
  );

const assertSameSet = ({ actual, expected, label }) => {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);

  for (const value of expectedSet) {
    if (!actualSet.has(value)) {
      errors.push(`${label} is missing: ${value}`);
    }
  }

  for (const value of actualSet) {
    if (!expectedSet.has(value)) {
      errors.push(`${label} has unexpected value: ${value}`);
    }
  }

  if (actual.length !== actualSet.size) {
    const duplicates = actual.filter((value, index) => actual.indexOf(value) !== index);
    errors.push(`${label} lists duplicate values: ${[...new Set(duplicates)].join(", ")}`);
  }
};

const groups = readShellList("ci_build_output_groups");
failOnErrors();

const groupSet = new Set(groups);
// Script names and workspace paths contain ci-build-* tokens that are not
// artifact/cache group names; keep this allowlist explicit so new tokens are
// reviewed instead of silently ignored.
const allowedNonGroupWorkflowReferences = new Set(["inputs", "output-groups", "outputs"]);
const coneOutputOwnersByGroup = new Map();
const coneOutputOwnerSet = new Set();

for (const group of groups) {
  const outputOwners = [
    ...new Set(readShellList("ci_build_output_paths", group).map(ownerForOutputPath)),
  ];

  coneOutputOwnersByGroup.set(group, outputOwners);
  for (const owner of outputOwners) {
    coneOutputOwnerSet.add(owner);
  }
}
failOnErrors();

for (const group of groups) {
  const scriptName = `build:cone:${group}`;
  const script = packageJson.scripts?.[scriptName];
  const expectedOwners = coneOutputOwnersByGroup.get(group) ?? [];

  if (!script) {
    errors.push(`Missing root package script: ${scriptName}`);
    continue;
  }

  if (!/\bturbo\s+run\s+build\b/u.test(script)) {
    errors.push(`Root package script '${scriptName}' must run 'turbo run build'`);
  }

  assertSameSet({
    actual: parseTurboFilters(script),
    expected: expectedOwners,
    label: `Root package script '${scriptName}' Turbo filters`,
  });
}

for (const [scriptName, script] of Object.entries(packageJson.scripts ?? {})) {
  if (scriptName.startsWith("build:cone:")) {
    continue;
  }

  for (const workspacePath of parseDirectBuildWorkspaces(script)) {
    if (coneOutputOwnerSet.has(workspacePath)) {
      errors.push(
        `Root package script '${scriptName}' directly builds cone-managed workspace '${workspacePath}'; use the matching build:cone:* script`,
      );
    }
  }
}

for (const group of groups) {
  const escapedGroup = escapeRegExp(group);
  // GitHub Actions output names use underscores even when the cone group keeps
  // a hyphenated artifact/cache name.
  const workflowOutputKey = group.replaceAll("-", "_");
  const requiredPatterns = [
    {
      label: `hash command for '${group}'`,
      pattern: new RegExp(`hash-ci-build-inputs\\.sh\\s+${escapedGroup}\\b`, "u"),
    },
    {
      label: `output-path emission for '${group}'`,
      pattern: new RegExp(`emit_group_output\\s+${escapeRegExp(workflowOutputKey)}\\s+${escapedGroup}\\b`, "u"),
    },
    {
      label: `cache verification for '${group}'`,
      pattern: new RegExp(`verify-ci-build-outputs\\.sh\\s+${escapedGroup}\\b`, "u"),
    },
    {
      label: `build command for '${group}'`,
      pattern: new RegExp(`npm\\s+run\\s+build:cone:${escapedGroup}\\b`, "u"),
    },
    {
      label: `artifact upload for '${group}'`,
      pattern: new RegExp(`name:\\s+${yamlWordScalarPattern(`ci-build-${group}`)}`, "u"),
    },
    {
      label: `packed artifact path for '${group}'`,
      pattern: new RegExp(`ci-build-${escapedGroup}\\.tar\\.gz\\b`, "u"),
    },
  ];

  for (const { label, pattern } of requiredPatterns) {
    if (!pattern.test(workflowText)) {
      errors.push(`Workflow is missing ${label}`);
    }
  }
}

for (const match of workflowText.matchAll(/\bci-build-([a-z0-9-]+)\b/gu)) {
  const referencedGroup = match[1];

  if (allowedNonGroupWorkflowReferences.has(referencedGroup)) {
    continue;
  }

  if (!groupSet.has(referencedGroup)) {
    errors.push(`Workflow references unknown CI build cone artifact/cache group: ${referencedGroup}`);
  }
}

failOnErrors();

for (const group of groups) {
  const outputOwnerCount = coneOutputOwnersByGroup.get(group)?.length ?? 0;
  const ownerLabel = outputOwnerCount === 1 ? "output owner" : "output owners";
  console.log(
    `[check-ci-workflow-cones] ${group}: verified root build script and workflow wiring for ${outputOwnerCount} ${ownerLabel}`,
  );
}

console.log(`[check-ci-workflow-cones] Verified ${groups.length} CI workflow cone contracts.`);
