#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  buildConeScriptCommand,
  ciBuildConeByName,
  ciBuildConeNames,
  ownerForOutputPath,
  outputOwnersForCone,
} from "./ci-build-cone-catalog.mjs";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const coneScript = path.join(
  repoRoot,
  "tooling/scripts/ci-build-output-groups.sh",
);
const packageJson = JSON.parse(
  readFileSync(path.join(repoRoot, "package.json"), "utf8"),
);
const workflowDir = path.join(repoRoot, ".github/workflows");
// Cone wiring checks are intentionally pinned to the primary CI workflow;
// root-script existence is checked across every workflow below.
const workflowText = readFileSync(path.join(workflowDir, "ci.yml"), "utf8");
const managedArtifactCatalogText = readFileSync(
  path.join(repoRoot, "tooling/scripts/managed-artifact-catalog.mjs"),
  "utf8",
);
const errors = [];

const quoteForBash = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const yamlWordScalarPattern = (value) => `(["']?)${escapeRegExp(value)}\\b\\1`;

const workflowFiles = readdirSync(workflowDir)
  .filter((entry) => /\.(?:ya?ml)$/u.test(entry))
  .sort();

const tokenizeCommandTail = (tail) =>
  tail
    .trim()
    .split(/\s+/u)
    .map((token) => token.replace(/^['"]|['"]$/gu, ""))
    .filter(Boolean);

const npmScriptReferencesFromWorkflowText = (text) => {
  const references = [];

  for (const match of text.matchAll(
    /\bnpm\s+(?:run|run-script)\s+([^\n|&;\\)<>]+)/gu,
  )) {
    const tokens = tokenizeCommandTail(match[1]);
    const workspaceScoped = tokens.some(
      (token) =>
        token === "-w" ||
        token === "--workspace" ||
        token.startsWith("-w=") ||
        token.startsWith("--workspace="),
    );

    while (tokens.length > 0) {
      const token = tokens[0];

      if (token === "--") {
        tokens.shift();
        break;
      }

      if (token === "-w" || token === "--workspace") {
        tokens.shift();
        tokens.shift();
        continue;
      }

      if (token.startsWith("-w=") || token.startsWith("--workspace=")) {
        tokens.shift();
        continue;
      }

      if (token === "--silent" || token === "--if-present") {
        tokens.shift();
        continue;
      }

      if (token.startsWith("-")) {
        tokens.shift();
        continue;
      }

      break;
    }

    const scriptName = tokens[0];
    if (
      scriptName &&
      !scriptName.startsWith("$") &&
      !scriptName.includes("${{")
    ) {
      references.push({ scriptName, workspaceScoped });
    }
  }

  return references.sort((left, right) =>
    left.scriptName.localeCompare(right.scriptName),
  );
};

const assertWorkflowNpmScriptsExist = () => {
  for (const workflowFile of workflowFiles) {
    const relativeWorkflowPath = `.github/workflows/${workflowFile}`;
    const text = readFileSync(path.join(workflowDir, workflowFile), "utf8");
    const referencedScripts = npmScriptReferencesFromWorkflowText(text);

    for (const { scriptName, workspaceScoped } of referencedScripts) {
      if (workspaceScoped) {
        continue;
      }

      if (!packageJson.scripts?.[scriptName]) {
        errors.push(
          `${relativeWorkflowPath} references missing root package script: ${scriptName}`,
        );
      }
    }
  }
};

const assertNpmScriptReferenceParser = () => {
  const references = npmScriptReferencesFromWorkflowText(`
    run: npm run lint
    run: npm run -w @midnight/example build
    run: npm run test:ci -w packages/example
    run: npm run \${{ matrix.script }}
  `);
  const rootScripts = references
    .filter((reference) => !reference.workspaceScoped)
    .map((reference) => reference.scriptName);
  const workspaceScripts = references
    .filter((reference) => reference.workspaceScoped)
    .map((reference) => reference.scriptName)
    .sort();

  if (references.length !== 3) {
    errors.push(
      "workflow npm-script parser should ignore dynamic script tokens",
    );
  }
  if (rootScripts.length !== 1 || rootScripts[0] !== "lint") {
    errors.push(
      "workflow npm-script parser should keep only root-scoped root scripts",
    );
  }
  if (
    workspaceScripts.length !== 2 ||
    workspaceScripts[0] !== "build" ||
    workspaceScripts[1] !== "test:ci"
  ) {
    errors.push(
      "workflow npm-script parser should identify workspace-scoped scripts",
    );
  }
};

const assertWorkflowUsesChangeClassifierCatalog = () => {
  if (!workflowText.includes("ci-change-classification-catalog.mjs")) {
    errors.push(
      "CI workflow must delegate change classification to tooling/scripts/ci-change-classification-catalog.mjs",
    );
  }

  if (/\b[a-z0-9_]+_patterns=\(/u.test(workflowText)) {
    errors.push(
      "CI workflow must not keep inline change-classification pattern arrays",
    );
  }

  if (!packageJson.scripts?.["check:ci-change-classification"]) {
    errors.push("Missing root package script: check:ci-change-classification");
  }

  if (
    !packageJson.scripts?.["ci:lint"]?.includes(
      "npm run check:ci-change-classification",
    )
  ) {
    errors.push("ci:lint must run check:ci-change-classification");
  }
};

const assertWorkflowUsesLocalSetupActions = () => {
  const requiredActionPaths = [
    ".github/actions/setup-node-npm/action.yml",
    ".github/actions/restore-compact-toolchain/action.yml",
  ];

  for (const actionPath of requiredActionPaths) {
    if (!existsSync(path.join(repoRoot, actionPath))) {
      errors.push(`Missing reusable CI setup action: ${actionPath}`);
    }
  }

  for (const actionRef of [
    "./.github/actions/setup-node-npm",
    "./.github/actions/restore-compact-toolchain",
  ]) {
    if (!workflowText.includes(actionRef)) {
      errors.push(`CI workflow must use reusable setup action: ${actionRef}`);
    }
  }

  if (/uses:\s+actions\/setup-node@v4/u.test(workflowText)) {
    errors.push(
      "CI workflow must use ./.github/actions/setup-node-npm instead of direct actions/setup-node@v4 steps",
    );
  }

  if (/uses:\s+actions\/cache@v4/u.test(workflowText)) {
    errors.push(
      "CI workflow must use ./.github/actions/setup-node-npm for Turbo cache restoration",
    );
  }

  if (/compact update\s+"\$COMPACT_COMPILER_VERSION"/u.test(workflowText)) {
    errors.push(
      "CI workflow must restore/activate Compact through ./.github/actions/restore-compact-toolchain",
    );
  }
};

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
    const context =
      argument === undefined ? functionName : `${functionName} '${argument}'`;
    errors.push(
      `Failed to read shell cone list from ${context}${stderr ? `: ${stderr}` : ""}`,
    );
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
    const duplicates = actual.filter(
      (value, index) => actual.indexOf(value) !== index,
    );
    errors.push(
      `${label} lists duplicate values: ${[...new Set(duplicates)].join(", ")}`,
    );
  }
};

const groups = readShellList("ci_build_output_groups");
assertNpmScriptReferenceParser();
assertWorkflowNpmScriptsExist();
assertWorkflowUsesChangeClassifierCatalog();
assertWorkflowUsesLocalSetupActions();
const managedArtifactConeImport = managedArtifactCatalogText.match(
  /import\s+\{(?<imports>[\s\S]*?)\}\s+from\s+["']\.\/ci-build-cone-catalog\.mjs["']/u,
);
if (
  !managedArtifactConeImport ||
  !/\boutputOwnersForCone\b/u.test(managedArtifactConeImport.groups.imports) ||
  !/\brequireCone\b/u.test(managedArtifactConeImport.groups.imports)
) {
  errors.push(
    "managed-artifact-catalog.mjs must import outputOwnersForCone and requireCone from ci-build-cone-catalog.mjs",
  );
}
failOnErrors();
assertSameSet({
  actual: groups,
  expected: ciBuildConeNames,
  label: "Shell CI build cone groups",
});
failOnErrors();

const groupSet = new Set(groups);
// Script names and workspace paths contain ci-build-* tokens that are not
// artifact/cache group names; keep this allowlist explicit so new tokens are
// reviewed instead of silently ignored.
const allowedNonGroupWorkflowReferences = new Set([
  "inputs",
  "output-groups",
  "outputs",
]);
const coneOutputOwnersByGroup = new Map();
const coneOutputOwnerSet = new Set();

for (const group of groups) {
  const outputOwners = [
    ...new Set(
      readShellList("ci_build_output_paths", group).map(ownerForOutputPath),
    ),
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
  const expectedScript = buildConeScriptCommand(group);
  const cone = ciBuildConeByName.get(group);
  const expectedOwners = cone ? outputOwnersForCone(cone) : [];

  if (!script) {
    errors.push(`Missing root package script: ${scriptName}`);
    continue;
  }

  if (script !== expectedScript) {
    errors.push(
      `Root package script '${scriptName}' must be '${expectedScript}'`,
    );
  }

  assertSameSet({
    actual: [
      ...new Set(
        readShellList("ci_build_output_paths", group).map(ownerForOutputPath),
      ),
    ],
    expected: expectedOwners,
    label: `CI build cone '${group}' shell output owners`,
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
      pattern: new RegExp(
        `hash-ci-build-inputs\\.sh\\s+${escapedGroup}\\b`,
        "u",
      ),
    },
    {
      label: `output-path emission for '${group}'`,
      pattern: new RegExp(
        `emit_group_output\\s+${escapeRegExp(workflowOutputKey)}\\s+${escapedGroup}\\b`,
        "u",
      ),
    },
    {
      label: `cache verification for '${group}'`,
      pattern: new RegExp(
        `verify-ci-build-outputs\\.sh\\s+${escapedGroup}\\b`,
        "u",
      ),
    },
    {
      label: `build command for '${group}'`,
      pattern: new RegExp(`npm\\s+run\\s+build:cone:${escapedGroup}\\b`, "u"),
    },
    {
      label: `artifact upload for '${group}'`,
      pattern: new RegExp(
        `name:\\s+${yamlWordScalarPattern(`ci-build-${group}`)}`,
        "u",
      ),
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
    errors.push(
      `Workflow references unknown CI build cone artifact/cache group: ${referencedGroup}`,
    );
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

console.log(
  `[check-ci-workflow-cones] Verified ${groups.length} CI workflow cone contracts.`,
);
