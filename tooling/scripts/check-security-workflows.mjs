#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
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

const assertExternalActionPinned = (action, location) => {
  if (typeof action !== "string" || action.startsWith("./")) {
    return;
  }
  if (action.startsWith("docker://")) {
    if (!/@sha256:[0-9a-f]{64}$/u.test(action)) {
      errors.push(`${location} must pin ${action} to a sha256 image digest`);
    }
    return;
  }

  const separatorIndex = action.lastIndexOf("@");
  const reference =
    separatorIndex === -1 ? "" : action.slice(separatorIndex + 1);
  if (!/^[0-9a-f]{40}$/u.test(reference)) {
    errors.push(`${location} must pin ${action} to a full commit SHA`);
  }
};

const assertExternalActionsPinned = (workflow, relativePath) => {
  for (const [jobName, job] of Object.entries(workflow.jobs ?? {})) {
    assertExternalActionPinned(job.uses, `${relativePath} job ${jobName}`);
    for (const step of job.steps ?? []) {
      assertExternalActionPinned(
        step.uses,
        `${relativePath} job ${jobName} step ${step.name ?? "<unnamed>"}`,
      );
    }
  }
};

const assertCheckoutsDoNotPersistCredentials = (workflow, relativePath) => {
  for (const [jobName, job] of Object.entries(workflow.jobs ?? {})) {
    for (const step of job.steps ?? []) {
      if (
        typeof step.uses === "string" &&
        step.uses.startsWith("actions/checkout@") &&
        step.with?.["persist-credentials"] !== false
      ) {
        errors.push(
          `${relativePath} job ${jobName} checkout must set persist-credentials: false`,
        );
      }
    }
  }
};

const workflowDirectory = ".github/workflows";
for (const fileName of readdirSync(path.join(repoRoot, workflowDirectory))) {
  if (!/\.ya?ml$/u.test(fileName)) {
    continue;
  }
  const relativePath = `${workflowDirectory}/${fileName}`;
  const workflow = readYaml(relativePath);
  assertExternalActionsPinned(workflow, relativePath);
  assertCheckoutsDoNotPersistCredentials(workflow, relativePath);
}

const actionsDirectory = ".github/actions";
for (const actionName of readdirSync(path.join(repoRoot, actionsDirectory))) {
  const relativePath = `${actionsDirectory}/${actionName}/action.yml`;
  const action = readYaml(relativePath);
  for (const step of action.runs?.steps ?? []) {
    assertExternalActionPinned(
      step.uses,
      `${relativePath} step ${step.name ?? "<unnamed>"}`,
    );
  }
}

const scanPath = ".github/workflows/scan.yaml";
const scan = readYaml(scanPath);
assertBranches(scan, "push", scanPath);
assertBranches(scan, "pull_request", scanPath);
if (scan.jobs?.build?.permissions?.["security-events"] !== "write") {
  errors.push(`${scanPath} scan job must grant security-events: write`);
}

const dependencyReviewPath = ".github/workflows/dependency-review.yml";
const dependencyReview = readYaml(dependencyReviewPath);
assertBranches(dependencyReview, "pull_request", dependencyReviewPath);
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

const publishPath = ".github/workflows/publish.yml";
const publish = readYaml(publishPath);
const publishEvents = publish.on ?? {};
if (!publishEvents.workflow_dispatch) {
  errors.push(`${publishPath} must be manually dispatchable`);
}
for (const forbiddenEvent of ["push", "pull_request", "schedule"]) {
  if (publishEvents[forbiddenEvent] !== undefined) {
    errors.push(
      `${publishPath} must not enable automatic ${forbiddenEvent} publication`,
    );
  }
}
for (const input of ["channel", "version", "rc_index"]) {
  if (publishEvents.workflow_dispatch?.inputs?.[input] === undefined) {
    errors.push(`${publishPath} must declare workflow_dispatch input ${input}`);
  }
}
const publishJob = publish.jobs?.publish;
if (publish.permissions?.contents !== "read") {
  errors.push(`${publishPath} top-level contents permission must be read`);
}
if (
  publishJob?.permissions?.contents !== "read" ||
  publishJob?.permissions?.["id-token"] !== "write"
) {
  errors.push(
    `${publishPath} publish job must grant only read contents and write id-token`,
  );
}
if (publishJob?.environment !== "npmjs") {
  errors.push(`${publishPath} publish job must use the npmjs environment`);
}
const publishStep = publishJob?.steps?.find(
  (step) => step.run === "./tooling/scripts/publish-npm-packages.sh",
);
const npmTokenSteps =
  publishJob?.steps?.filter(
    (step) => step.env?.NODE_AUTH_TOKEN !== undefined,
  ) ?? [];
if (
  !publishStep ||
  npmTokenSteps.length !== 1 ||
  npmTokenSteps[0] !== publishStep ||
  publishStep.env?.NODE_AUTH_TOKEN !==
    "${{ secrets.MIDNIGHTCI_NPMJS_TOKEN }}"
) {
  errors.push(
    `${publishPath} must pass the scoped npmjs token only to the publish step`,
  );
}
const publishScript = readFileSync(
  path.join(repoRoot, "tooling/scripts/publish-npm-packages.sh"),
  "utf8",
);
for (const requiredToken of [
  "--provenance",
  "--publishable-paths",
  "tooling/artifacts/npm",
]) {
  if (!publishScript.includes(requiredToken)) {
    errors.push(
      `tooling/scripts/publish-npm-packages.sh must contain ${requiredToken}`,
    );
  }
}
const releaseStateScript = readFileSync(
  path.join(repoRoot, "tooling/scripts/npm-release-state.mjs"),
  "utf8",
);
for (const requiredToken of ["--snapshot", "--verify", "latest"]) {
  if (!releaseStateScript.includes(requiredToken)) {
    errors.push(
      `tooling/scripts/npm-release-state.mjs must contain ${requiredToken}`,
    );
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[check-security-workflows] ${error}`);
  }
  process.exit(1);
}

console.log(
  "Security workflow contract is valid: branch coverage, public dependency review, Dependabot, immutable action refs, checkout credential hygiene, and manual provenance publication.",
);
