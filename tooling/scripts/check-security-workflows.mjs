#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "yaml";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const errors = [];

const readYaml = (relativePath) =>
  parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));

const requiredBranches = ["develop", "main", "release/**"];

const assertBranches = (workflow, eventName, relativePath) => {
  const branches = workflow.on?.[eventName]?.branches;
  if (!Array.isArray(branches)) {
    errors.push(`${relativePath} must declare on.${eventName}.branches`);
    return;
  }
  for (const branch of requiredBranches) {
    if (!branches.includes(branch)) {
      errors.push(`${relativePath} on.${eventName} must include ${branch}`);
    }
  }
};

const assertExternalActionsPinned = (workflow, relativePath) => {
  for (const [jobName, job] of Object.entries(workflow.jobs ?? {})) {
    for (const step of job.steps ?? []) {
      const action = step.uses;
      if (typeof action !== "string" || action.startsWith("./")) {
        continue;
      }
      const separatorIndex = action.lastIndexOf("@");
      const reference =
        separatorIndex === -1 ? "" : action.slice(separatorIndex + 1);
      if (!/^[0-9a-f]{40}$/u.test(reference)) {
        errors.push(
          `${relativePath} job ${jobName} must pin ${action} to a full commit SHA`,
        );
      }
    }
  }
};

const scanPath = ".github/workflows/scan.yaml";
const scan = readYaml(scanPath);
assertBranches(scan, "push", scanPath);
assertBranches(scan, "pull_request", scanPath);
assertExternalActionsPinned(scan, scanPath);
if (scan.jobs?.build?.permissions?.["security-events"] !== "write") {
  errors.push(`${scanPath} scan job must grant security-events: write`);
}

const dependencyReviewPath = ".github/workflows/dependency-review.yml";
const dependencyReview = readYaml(dependencyReviewPath);
assertBranches(dependencyReview, "pull_request", dependencyReviewPath);
assertExternalActionsPinned(dependencyReview, dependencyReviewPath);

if (
  dependencyReview.jobs?.["dependency-review"]?.if !==
  "github.event.repository.private == false"
) {
  errors.push(
    `${dependencyReviewPath} must activate dependency review when the repository is public`,
  );
}

const dependencyReviewStep =
  dependencyReview.jobs?.["dependency-review"]?.steps?.find(
    (step) =>
      typeof step.uses === "string" &&
      step.uses.startsWith("actions/dependency-review-action@"),
  );
if (!dependencyReviewStep) {
  errors.push(`${dependencyReviewPath} must run dependency-review-action`);
} else {
  if (dependencyReviewStep.with?.["fail-on-severity"] !== "high") {
    errors.push(`${dependencyReviewPath} must fail on high vulnerabilities`);
  }
  if (
    dependencyReviewStep.with?.["fail-on-scopes"] !==
    "runtime, development, unknown"
  ) {
    errors.push(`${dependencyReviewPath} must review every dependency scope`);
  }
}

const dependabotPath = ".github/dependabot.yml";
const dependabot = readYaml(dependabotPath);
const updates = Array.isArray(dependabot.updates) ? dependabot.updates : [];
for (const ecosystem of ["github-actions", "npm"]) {
  const update = updates.find(
    (candidate) =>
      candidate?.["package-ecosystem"] === ecosystem &&
      candidate?.directory === "/",
  );
  if (!update) {
    errors.push(`${dependabotPath} must update root ${ecosystem} dependencies`);
    continue;
  }
  if (!update.schedule?.interval) {
    errors.push(`${dependabotPath} ${ecosystem} updates need a schedule`);
  }
  if (update["target-branch"] !== "develop") {
    errors.push(`${dependabotPath} ${ecosystem} updates must target develop`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[check-security-workflows] ${error}`);
  }
  process.exit(1);
}

console.log(
  "Security workflow contract is valid: branch coverage, public dependency review, Dependabot, and immutable action refs.",
);
