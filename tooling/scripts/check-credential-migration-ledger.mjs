#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { workspaceCatalog } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const ledgerPath = path.join(
  repoRoot,
  "docs/architecture/credential-family-migration-ledger.v1.json",
);
const migrationPrefixes = [
  "packages/prototypes/credential-families/",
  "packages/use-cases/",
];
const outcomes = new Set(["graduate", "reduce-to-fixture", "remove"]);
const approvalStates = new Set(["approved", "pending", "not-required"]);

export const migrationWorkspacePaths = (catalog = workspaceCatalog) =>
  catalog
    .map(({ path: workspacePath }) => workspacePath)
    .filter((workspacePath) =>
      migrationPrefixes.some((prefix) => workspacePath.startsWith(prefix)),
    )
    .sort();

export const validateMigrationLedger = (
  ledger,
  { root = repoRoot, catalog = workspaceCatalog } = {},
) => {
  const errors = [];
  const requireText = (value, label) => {
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`${label} must be non-empty`);
    }
  };
  const requireList = (value, label, allowEmpty = false) => {
    if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
      errors.push(
        `${label} must be ${allowEmpty ? "an array" : "a non-empty array"}`,
      );
    }
  };

  if (ledger?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (ledger?.status !== "proposed" && ledger?.status !== "approved") {
    errors.push("status must be proposed or approved");
  }
  requireText(ledger?.authority, "authority");
  requireText(ledger?.targetMilestone, "targetMilestone");
  requireList(ledger?.entries, "entries");

  const listed = [];
  const ids = new Set();
  for (const [index, entry] of (ledger?.entries ?? []).entries()) {
    const label = `entries[${index}]`;
    requireText(entry.id, `${label}.id`);
    if (ids.has(entry.id)) errors.push(`${label}.id duplicates ${entry.id}`);
    ids.add(entry.id);
    requireList(entry.workspaces, `${label}.workspaces`);
    requireText(entry.accountableOwner, `${label}.accountableOwner`);
    requireText(entry.capabilityHypothesis, `${label}.capabilityHypothesis`);
    requireList(entry.supportedProfiles, `${label}.supportedProfiles`, true);
    requireList(entry.knownLimitations, `${label}.knownLimitations`);
    requireList(entry.evidence, `${label}.evidence`);
    requireText(entry.exitCriterion, `${label}.exitCriterion`);
    requireText(entry.implementationIssue, `${label}.implementationIssue`);
    if (
      typeof entry.implementationIssue === "string" &&
      !/^https:\/\/github\.com\/midnightntwrk\/midnight-verifiable-credentials\/issues\/\d+$/.test(
        entry.implementationIssue,
      )
    ) {
      errors.push(`${label}.implementationIssue must link a repository issue`);
    }
    if (!outcomes.has(entry.outcome)) errors.push(`${label}.outcome is invalid`);

    for (const state of [
      entry.approval?.vcMaintainers,
      entry.approval?.productOwner,
    ]) {
      if (!approvalStates.has(state)) {
        errors.push(`${label}.approval contains an invalid state`);
      }
    }
    requireList(entry.blockers, `${label}.blockers`, ledger?.status === "approved");

    if (entry.outcome === "graduate" && entry.targetRepository === null) {
      if (!(entry.blockers ?? []).some((blocker) => /repository/i.test(blocker))) {
        errors.push(`${label} must record why its graduate destination is unresolved`);
      }
    } else if (entry.outcome === "graduate") {
      requireText(entry.targetRepository, `${label}.targetRepository`);
      if (
        typeof entry.targetRepository === "string" &&
        !/^https:\/\/github\.com\/midnightntwrk\/[a-z0-9-]+$/.test(
          entry.targetRepository,
        )
      ) {
        errors.push(`${label}.targetRepository must link a Midnight repository`);
      }
    } else if (entry.targetRepository !== null) {
      errors.push(`${label}.targetRepository must be null for ${entry.outcome}`);
    }

    for (const evidencePath of entry.evidence ?? []) {
      requireText(evidencePath, `${label}.evidence[]`);
      if (typeof evidencePath === "string" && !existsSync(path.join(root, evidencePath))) {
        errors.push(`${label}.evidence does not exist: ${evidencePath}`);
      }
    }

    for (const workspace of entry.workspaces ?? []) {
      requireText(workspace.path, `${label}.workspaces[].path`);
      requireText(workspace.packageName, `${label}.workspaces[].packageName`);
      if (typeof workspace.path !== "string") continue;
      listed.push(workspace.path);
      const manifestPath = path.join(root, workspace.path, "package.json");
      if (!existsSync(manifestPath)) {
        errors.push(`${label} workspace manifest does not exist: ${workspace.path}`);
        continue;
      }
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (manifest.name !== workspace.packageName) {
        errors.push(`${label} package name drifted for ${workspace.path}`);
      }
    }
  }

  const duplicates = listed.filter(
    (item, index) => listed.indexOf(item) !== index,
  );
  for (const duplicate of [...new Set(duplicates)].sort()) {
    errors.push(`duplicate workspace: ${duplicate}`);
  }

  const expected = migrationWorkspacePaths(catalog);
  const actual = [...new Set(listed)].sort();
  for (const missing of expected.filter((item) => !actual.includes(item))) {
    errors.push(`missing workspace: ${missing}`);
  }
  for (const extra of actual.filter((item) => !expected.includes(item))) {
    errors.push(`unknown workspace: ${extra}`);
  }

  if (ledger?.status === "approved") {
    for (const entry of ledger.entries ?? []) {
      if (entry.approval?.vcMaintainers !== "approved") {
        errors.push(`${entry.id} lacks VC maintainer approval`);
      }
      if (
        entry.outcome === "graduate" &&
        entry.approval?.productOwner !== "approved"
      ) {
        errors.push(`${entry.id} lacks product-owner approval`);
      }
      if ((entry.blockers ?? []).length > 0) {
        errors.push(`${entry.id} cannot be approved with blockers`);
      }
    }
  }

  return errors;
};

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  try {
    const ledger = JSON.parse(readFileSync(ledgerPath, "utf8"));
    const errors = validateMigrationLedger(ledger);
    if (errors.length > 0) {
      process.stderr.write(`${errors.map((error) => `- ${error}`).join("\n")}\n`);
      process.exit(1);
    }
    process.stdout.write("[credential-migration-ledger] Ledger checks passed.\n");
  } catch (error) {
    process.stderr.write(`[credential-migration-ledger] ${error.message}\n`);
    process.exit(1);
  }
}
