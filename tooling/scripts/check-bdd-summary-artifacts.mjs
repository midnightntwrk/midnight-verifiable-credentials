#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

// This checks the CI workflow contract, not the runtime existence of artifacts.
// The BDD pipeline and upload step still own producing and retaining the files.
const workflowText = readFileSync(
  path.join(repoRoot, ".github/workflows/ci.yml"),
  "utf8",
);
const bddSupportReadme = readFileSync(
  path.join(repoRoot, "packages/use-cases/bdd-support/README.md"),
  "utf8",
);
const backlog = readFileSync(
  path.join(repoRoot, "docs/plans/repository-audit-backlog.md"),
  "utf8",
);

const summaryArtifactPaths = [
  "packages/use-cases/age-gate/scenarios/target/cucumber-report.json",
  "packages/use-cases/age-gate/scenarios/target/summary.json",
  "packages/use-cases/age-gate/scenarios/target/summary.md",
  "packages/use-cases/university/scenarios/target/cucumber-report.json",
  "packages/use-cases/university/scenarios/target/summary.json",
  "packages/use-cases/university/scenarios/target/summary.md",
];

const errors = [];

const assertIncludes = (haystack, needle, label) => {
  if (!haystack.includes(needle)) {
    errors.push(`${label} must include "${needle}"`);
  }
};

const assertMatches = (haystack, pattern, expected, label) => {
  if (!pattern.test(haystack)) {
    errors.push(`${label} must include ${expected}`);
  }
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stepBlock = (stepName) => {
  const marker = new RegExp(`^[ \\t]+- name: ${escapeRegExp(stepName)}$`, "mu");
  const match = marker.exec(workflowText);
  if (!match) {
    errors.push(`.github/workflows/ci.yml must include step "${stepName}"`);
    return "";
  }

  const start = match.index;
  const nextStep = workflowText.indexOf(
    "\n      - name:",
    start + match[0].length,
  );
  return nextStep === -1
    ? workflowText.slice(start)
    : workflowText.slice(start, nextStep);
};

const contractCheckStep = stepBlock("Check BDD summary artifact contract");
const runStep = stepBlock("Run BDD summary lanes");
const uploadStep = stepBlock("Upload BDD summary artifacts");

// This is a workflow wording tripwire, not a full YAML parser. Keep assertions
// local to the owning steps so accidental moves are still caught in CI.
assertIncludes(
  contractCheckStep,
  "pnpm run check:bdd-summary-artifacts",
  ".github/workflows/ci.yml BDD summary contract step",
);
assertIncludes(
  runStep,
  "pnpm run test:bdd:smoke",
  ".github/workflows/ci.yml BDD summary run step",
);
assertIncludes(
  runStep,
  "pnpm run test:bdd:university",
  ".github/workflows/ci.yml BDD summary run step",
);
assertIncludes(
  uploadStep,
  "name: bdd-summary-artifacts",
  ".github/workflows/ci.yml BDD summary upload",
);
assertIncludes(
  uploadStep,
  "if: always()",
  ".github/workflows/ci.yml BDD summary upload",
);
assertMatches(
  uploadStep,
  /uses:\s+actions\/upload-artifact@[0-9a-f]{40}\b/u,
  "an immutable actions/upload-artifact reference",
  ".github/workflows/ci.yml BDD summary upload",
);
assertIncludes(
  uploadStep,
  "retention-days: 14",
  ".github/workflows/ci.yml BDD summary upload",
);
assertIncludes(
  uploadStep,
  "if-no-files-found: error",
  ".github/workflows/ci.yml BDD summary upload",
);

for (const artifactPath of summaryArtifactPaths) {
  assertIncludes(
    uploadStep,
    artifactPath,
    ".github/workflows/ci.yml BDD summary upload",
  );
}

assertIncludes(
  bddSupportReadme,
  "bdd-summary-artifacts",
  "packages/use-cases/bdd-support/README.md",
);
assertIncludes(
  backlog,
  "vc-bdd-summary-ci-artifacts",
  "docs/plans/repository-audit-backlog.md",
);

if (errors.length > 0) {
  console.error("[check-bdd-summary-artifacts] BDD summary artifact drift:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `[check-bdd-summary-artifacts] Verified ${summaryArtifactPaths.length} BDD summary artifact paths.`,
);
