#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execFileSync as run } from "node:child_process";
import path from "node:path";

const allowedStatuses = new Set(["measured", "not-run", "blocked"]);
const allowedCommandStatuses = new Set(["defined", "undefined"]);
const allowedReviewStatuses = new Set(["pending", "reviewed"]);
const allowedBudgetStatuses = new Set(["defined", "unset"]);
const shaPattern = /^[0-9a-f]{40}$/u;
const datePattern = /^\d{4}-\d{2}-\d{2}$/u;

const isValidDateOnly = (value) => {
  if (!datePattern.test(value ?? "")) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
};

const fail = (message) => {
  throw new Error(message);
};

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const nonEmptyString = (value, label) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${label} must be a non-empty string`);
  }
};

const finiteNonNegative = (value, label) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    fail(`${label} must be a finite non-negative number`);
  }
};

const parseArgs = (argv) => {
  const options = { root: process.cwd(), manifest: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root" || argument === "--manifest") {
      const value = argv[++index];
      if (!value || value.startsWith("-")) fail(`${argument} requires a non-flag value`);
      options[argument.slice(2)] = value;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      console.log("Usage: check-quality-evidence.mjs [--root <repo>] [--manifest <path>]");
      process.exit(0);
    }
    fail(`unknown argument: ${argument}`);
  }
  options.root = path.resolve(options.root);
  options.manifest = path.resolve(
    options.manifest ?? path.join(options.root, "docs/testing/quality-evidence.json"),
  );
  return options;
};

const gitFailureMessage = (error) => {
  const stderr = typeof error?.stderr === "string" ? error.stderr.trim() : "";
  if (stderr) return `: ${stderr}`;
  return error instanceof Error && error.message ? `: ${error.message}` : "";
};

const ensureCommitExists = (root, sha) => {
  try {
    run("git", ["-C", root, "cat-file", "-e", `${sha}^{commit}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    fail(`unable to resolve baseSha ${sha} under ${root}${gitFailureMessage(error)}`);
  }
};

const checkPushBoundary = (root, baseSha, headSha) => {
  if (baseSha === "0".repeat(40)) {
    fail("push evidence cannot use the all-zero before SHA; use workflow_dispatch for a new branch");
  }
  ensureCommitExists(root, baseSha);
  let firstPushedSha;
  try {
    firstPushedSha = run("git", ["-C", root, "rev-list", "--first-parent", "--reverse", `${baseSha}..${headSha}`], {
      encoding: "utf8",
    }).trim().split(/\r?\n/u).filter(Boolean)[0];
  } catch (error) {
    fail(`unable to determine the pushed commit range${gitFailureMessage(error)}`);
  }
  if (!firstPushedSha) {
    fail(`push evidence baseSha ${baseSha} must precede the pushed HEAD ${headSha}`);
  }
  let firstPushedParents;
  try {
    firstPushedParents = run("git", ["-C", root, "rev-list", "--parents", "-n", "1", firstPushedSha], {
      encoding: "utf8",
    }).trim().split(/\s+/u).slice(1);
  } catch (error) {
    fail(`unable to inspect the first pushed commit ${firstPushedSha}${gitFailureMessage(error)}`);
  }
  if (!firstPushedParents.includes(baseSha)) {
    fail(`push evidence baseSha ${baseSha} is not the prior tip of ${headSha}; use workflow_dispatch after a rewritten history`);
  }
};

const checkBaseSha = (root, baseRef, baseSha, eventName) => {
  if (!shaPattern.test(baseSha)) fail("baseSha must be a 40-character lowercase Git SHA");
  nonEmptyString(baseRef, "baseRef");
  let headSha;
  try {
    headSha = run("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch (error) {
    fail(`unable to resolve repository HEAD under ${root}${gitFailureMessage(error)}`);
  }
  if (!shaPattern.test(headSha)) fail("repository HEAD is not a valid Git SHA");

  const normalizedEvent = eventName ?? "local";
  const supportedEvents = new Set(["pull_request", "push", "workflow_dispatch", "local"]);
  if (!supportedEvents.has(normalizedEvent)) {
    fail(`QUALITY_EVIDENCE_CI_EVENT must be pull_request, push, workflow_dispatch, or local (received ${normalizedEvent})`);
  }

  if (normalizedEvent === "push") {
    if (!/^refs\/heads\/[A-Za-z0-9._/-]+$/u.test(baseRef)) {
      fail(`push evidence must declare the pushed branch ref as refs/heads/* (received ${baseRef})`);
    }
    const eventBeforeSha = process.env.QUALITY_EVIDENCE_PUSH_BEFORE_SHA;
    if (!shaPattern.test(eventBeforeSha ?? "") || eventBeforeSha !== baseSha) {
      fail("push evidence baseSha must equal the immutable GitHub push before SHA");
    }
    checkPushBoundary(root, baseSha, headSha);
  } else if (normalizedEvent === "workflow_dispatch") {
    if (!/^refs\/(?:heads|tags)\/[A-Za-z0-9._/-]+$/u.test(baseRef)) {
      fail(`workflow_dispatch evidence must declare the selected refs/heads/* or refs/tags/* ref (received ${baseRef})`);
    }
    let resolvedBaseSha;
    try {
      resolvedBaseSha = run("git", ["-C", root, "rev-parse", `${baseRef}^{commit}`], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    } catch (error) {
      fail(`unable to resolve workflow_dispatch baseRef ${baseRef} under ${root}${gitFailureMessage(error)}`);
    }
    if (resolvedBaseSha !== baseSha || baseSha !== headSha) {
      fail(`workflow_dispatch baseSha ${baseSha} must equal selected ref HEAD ${headSha} (resolved ${resolvedBaseSha})`);
    }
  } else if (normalizedEvent === "pull_request") {
    // The remote base ref may advance while a PR workflow is queued. Validate the
    // event SHA as an object instead of comparing it with that moving ref.
    if (!/^refs\/(?:heads\/|remotes\/origin\/)\S+$/u.test(baseRef)) {
      fail(`pull_request evidence must declare a base branch ref (received ${baseRef})`);
    }
    try {
      run("git", ["-C", root, "show-ref", "--verify", "--quiet", baseRef], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      fail(`unable to resolve baseRef ${baseRef} under ${root}; CI checkouts must include the base ref history${gitFailureMessage(error)}`);
    }
    ensureCommitExists(root, baseSha);
  } else {
    // Local validation may run after the mutable base ref has advanced beyond
    // the historical base where the catalog evidence was observed. Require the
    // ref and recorded commit to exist, then let the ancestry check below prove
    // that the catalog base remains in the current checkout history.
    try {
      run("git", ["-C", root, "rev-parse", `${baseRef}^{commit}`], {
        encoding: "utf8",
      });
    } catch (error) {
      fail(`unable to resolve baseRef ${baseRef} under ${root}; CI checkouts must include the base ref history${gitFailureMessage(error)}`);
    }
    ensureCommitExists(root, baseSha);
  }

  try {
    run("git", ["-C", root, "merge-base", "--is-ancestor", baseSha, headSha], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    fail(`baseSha ${baseSha} is stale or is not an ancestor of repository HEAD ${headSha}${gitFailureMessage(error)}`);
  }
};

const validateEvidenceRow = (row, index, baseSha, observedAt) => {
  const label = `evidence[${index}]`;
  if (!isRecord(row)) fail(`${label} must be an object`);
  nonEmptyString(row.id, `${label}.id`);
  nonEmptyString(row.category, `${label}.category`);
  if (!isRecord(row.scope)) fail(`${label}.scope must be an object`);
  nonEmptyString(row.scope.kind, `${label}.scope.kind`);
  nonEmptyString(row.scope.id, `${label}.scope.id`);
  if (!allowedStatuses.has(row.status)) {
    fail(`${label}.status must be measured, not-run, or blocked`);
  }
  if (!allowedCommandStatuses.has(row.commandStatus)) {
    fail(`${label}.commandStatus must be defined or undefined`);
  }
  if (row.commandStatus === "defined") {
    nonEmptyString(row.command, `${label}.command`);
  } else if (row.command !== null) {
    fail(`${label}.command must be null when commandStatus is undefined`);
  }
  if (row.status === "measured" && row.commandStatus !== "defined") {
    fail(`${label}.measured rows require a defined command`);
  }
  if (row.status === "measured") {
    if (!isRecord(row.evidence)) fail(`${label}.evidence must be an object when measured`);
    nonEmptyString(row.evidence.report, `${label}.evidence.report`);
    nonEmptyString(row.evidence.sha256, `${label}.evidence.sha256`);
    nonEmptyString(row.evidence.runId, `${label}.evidence.runId`);
  }
  nonEmptyString(row.owner, `${label}.owner`);
  if (!isValidDateOnly(row.observedAt ?? observedAt ?? "")) {
    fail(`${label}.observedAt must use YYYY-MM-DD`);
  }
  if (row.baseSha !== undefined && row.baseSha !== baseSha) {
    fail(`${label}.baseSha must match the manifest baseSha`);
  }

  if (!isRecord(row.metric)) fail(`${label}.metric must be an object`);
  nonEmptyString(row.metric.name, `${label}.metric.name`);
  nonEmptyString(row.metric.unit, `${label}.metric.unit`);
  if (row.status === "measured") {
    finiteNonNegative(row.metric.value, `${label}.metric.value`);
  } else if (row.metric.value !== null) {
    fail(`${label}.metric.value must be null when status is ${row.status}`);
  }
  if (row.status !== "measured") nonEmptyString(row.reason, `${label}.reason`);

  if (!isRecord(row.review)) fail(`${label}.review must be an object`);
  if (!allowedReviewStatuses.has(row.review.status)) {
    fail(`${label}.review.status must be pending or reviewed`);
  }
  nonEmptyString(row.review.reviewer, `${label}.review.reviewer`);
  if (row.review.status === "reviewed" && /^(?:unassigned|tbd|n\/?a|none|unknown|pending|todo)$/iu.test(row.review.reviewer.trim())) {
    fail(`${label}.review.reviewer must identify a reviewer when reviewed`);
  }

  if (!isRecord(row.budget)) fail(`${label}.budget must be an object`);
  if (!allowedBudgetStatuses.has(row.budget.status)) {
    fail(`${label}.budget.status must be defined or unset`);
  }
  nonEmptyString(row.budget.unit, `${label}.budget.unit`);
  if (row.budget.status === "defined") {
    finiteNonNegative(row.budget.value, `${label}.budget.value`);
  } else if (row.budget.value !== null) {
    fail(`${label}.budget.value must be null when budget is unset`);
  }
};

export const validateManifest = (manifest, root, eventName = process.env.QUALITY_EVIDENCE_CI_EVENT ?? process.env.GITHUB_EVENT_NAME ?? "local") => {
  if (!isRecord(manifest)) fail("manifest must be an object");
  if (manifest.schema !== "midnight-vc-quality-evidence") {
    fail("schema must be midnight-vc-quality-evidence");
  }
  if (manifest.version !== 1) fail("version must be 1");
  nonEmptyString(manifest.baseRef, "baseRef");
  nonEmptyString(manifest.baseSha, "baseSha");
  const ciEvent = eventName ?? "local";
  const overrideRef = process.env.QUALITY_EVIDENCE_BASE_REF;
  const overrideSha = process.env.QUALITY_EVIDENCE_BASE_SHA;
  if (ciEvent !== "local" && (!overrideRef || !overrideSha)) {
    fail("CI quality evidence requires QUALITY_EVIDENCE_BASE_REF and QUALITY_EVIDENCE_BASE_SHA");
  }
  const baseRef = overrideRef ?? manifest.baseRef;
  const effectiveBaseSha = overrideSha ?? manifest.baseSha;
  checkBaseSha(root, baseRef, effectiveBaseSha, ciEvent);
  if (!isValidDateOnly(manifest.observedAt ?? "")) {
    fail("observedAt must use YYYY-MM-DD");
  }
  if (!Array.isArray(manifest.evidence) || manifest.evidence.length === 0) {
    fail("evidence must be a non-empty array");
  }
  const ids = new Set();
  for (const [index, row] of manifest.evidence.entries()) {
    validateEvidenceRow(row, index, effectiveBaseSha, manifest.observedAt);
    if (ids.has(row.id)) fail(`duplicate evidence id: ${row.id}`);
    ids.add(row.id);
  }
  return { count: manifest.evidence.length, effectiveBaseSha };
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(options.manifest, "utf8"));
  } catch (error) {
    fail(`unable to read JSON manifest ${options.manifest}: ${error.message}`);
  }
  const { count, effectiveBaseSha } = validateManifest(manifest, options.root);
  console.log(`quality evidence valid: ${count} row(s), base ${effectiveBaseSha}`);
};

try {
  main();
} catch (error) {
  console.error(`quality evidence invalid: ${error.message}`);
  process.exitCode = 1;
}
