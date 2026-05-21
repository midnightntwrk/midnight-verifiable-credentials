#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

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

assertIncludes(
  workflowText,
  "name: bdd-summary-artifacts",
  ".github/workflows/ci.yml",
);
assertIncludes(
  workflowText,
  "if: always()",
  ".github/workflows/ci.yml BDD summary upload",
);
assertIncludes(
  workflowText,
  "uses: actions/upload-artifact@v4",
  ".github/workflows/ci.yml BDD summary upload",
);
assertIncludes(
  workflowText,
  "retention-days: 14",
  ".github/workflows/ci.yml BDD summary upload",
);

for (const artifactPath of summaryArtifactPaths) {
  assertIncludes(
    workflowText,
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
