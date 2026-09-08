#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { workspaceCatalog } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ledgerPath = path.join(
  repoRoot,
  "docs/architecture/credential-family-migration-ledger.v1.json",
);
const migrationPrefixes = [
  "packages/prototypes/credential-families/",
  "packages/use-cases/",
];
const outcomes = new Set(["graduate", "reduce-to-fixture", "remove"]);

// Keep deleted workspaces visible as simple historical rows.
export const migrationInventory = Object.freeze([
  ["packages/prototypes/credential-families/birth", "@midnight-ntwrk/midnight-did-credentials-birth"],
  ["packages/prototypes/credential-families/birth-secret", "@midnight-ntwrk/midnight-did-credentials-birth-secret"],
  ["packages/prototypes/credential-families/digital-passport", "@midnight-ntwrk/midnight-did-credentials-digital-passport"],
  ["packages/prototypes/credential-families/dummy-claims", "@midnight-ntwrk/midnight-did-credentials-dummy-claims"],
  ["packages/prototypes/credential-families/hello-family", "@midnight-ntwrk/midnight-did-credentials-hello-family"],
  ["packages/prototypes/credential-families/mixed-claims", "@midnight-ntwrk/midnight-did-credentials-mixed-claims"],
  ["packages/prototypes/credential-families/university-diploma", "@midnight-ntwrk/midnight-did-credentials-university-diploma"],
  ["packages/use-cases/age-gate/contract", "@midnight-ntwrk/midnight-did-credentials-demo-contract"],
  ["packages/use-cases/age-gate/scenarios", "vc-bdd-scenarios"],
  ["packages/use-cases/bdd-support", "@midnight-ntwrk/midnight-did-credentials-bdd-support"],
  ["packages/use-cases/hello-verifier/contract", "@midnight-ntwrk/midnight-did-hello-verifier-contract"],
  ["packages/use-cases/status-openid/evidence", "@midnight-ntwrk/status-openid-production-evidence"],
  ["packages/use-cases/university/contract", "@midnight-ntwrk/midnight-did-university-verifier-contract"],
  ["packages/use-cases/university/protocol", "@midnight-ntwrk/midnight-did-university-protocol"],
  ["packages/use-cases/university/reporting", "@midnight-ntwrk/midnight-did-university-reporting"],
  ["packages/use-cases/university/scenarios", "vc-university-bdd-scenarios"],
]);

const inventoryByPath = new Map(migrationInventory);
const migrationCatalogPaths = (catalog) =>
  catalog
    .map(({ path: workspacePath }) => workspacePath)
    .filter((workspacePath) =>
      migrationPrefixes.some((prefix) => workspacePath.startsWith(prefix)),
    );

export const validateMigrationLedger = (
  ledger,
  { root = repoRoot, catalog = workspaceCatalog, pathExists = existsSync } = {},
) => {
  const errors = [];
  const hasText = (value) => typeof value === "string" && value.trim() !== "";
  const listed = new Map();
  const active = new Set();

  if (ledger?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!Array.isArray(ledger?.entries)) return [...errors, "entries must be an array"];

  for (const entry of ledger.entries) {
    if (!hasText(entry.id)) errors.push("entry id must be non-empty");
    if (!outcomes.has(entry.outcome)) errors.push(`${entry.id} has an invalid outcome`);
    if (!hasText(entry.accountableOwner)) errors.push(`${entry.id} needs an owner`);
    if (!hasText(entry.capabilityHypothesis)) errors.push(`${entry.id} needs a capability hypothesis`);
    if (!Array.isArray(entry.knownLimitations) || entry.knownLimitations.length === 0) {
      errors.push(`${entry.id} needs known limitations`);
    }
    if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) {
      errors.push(`${entry.id} needs evidence links`);
    }
    if (!hasText(entry.exitCriterion)) errors.push(`${entry.id} needs an exit criterion`);
    if (!/^https:\/\/github\.com\/midnightntwrk\/midnight-verifiable-credentials\/issues\/\d+$/.test(entry.implementationIssue ?? "")) {
      errors.push(`${entry.id} needs a repository implementation issue`);
    }
    if (
      entry.outcome === "graduate" &&
      entry.targetRepository !== null &&
      !/^https:\/\/github\.com\/midnightntwrk\/[a-z0-9-]+$/.test(entry.targetRepository)
    ) {
      errors.push(`${entry.id} needs a Midnight destination repository`);
    }
    if (entry.outcome !== "graduate" && entry.targetRepository !== null) {
      errors.push(`${entry.id} must not name a destination repository`);
    }

    for (const workspace of entry.workspaces ?? []) {
      if (listed.has(workspace.path)) errors.push(`duplicate workspace: ${workspace.path}`);
      listed.set(workspace.path, workspace.packageName);
      if (inventoryByPath.get(workspace.path) !== workspace.packageName) {
        errors.push(`package name drifted for ${workspace.path}`);
      }

      const state = workspace.migrationState ?? "active";
      const workspacePath = path.resolve(root, workspace.path ?? "");
      if (state === "active") {
        active.add(workspace.path);
        if (!pathExists(path.join(workspacePath, "package.json"))) {
          errors.push(`active workspace is missing: ${workspace.path}`);
        }
      } else if (state === "removed") {
        if (pathExists(workspacePath)) errors.push(`removed workspace still exists: ${workspace.path}`);
      } else {
        errors.push(`invalid migration state for ${workspace.path}`);
      }
    }
  }

  for (const [workspacePath] of migrationInventory) {
    if (!listed.has(workspacePath)) errors.push(`missing workspace: ${workspacePath}`);
  }
  for (const workspacePath of listed.keys()) {
    if (!inventoryByPath.has(workspacePath)) errors.push(`unknown workspace: ${workspacePath}`);
  }

  const catalogPaths = new Set(migrationCatalogPaths(catalog));
  for (const workspacePath of catalogPaths) {
    if (!active.has(workspacePath)) errors.push(`catalog workspace is not active: ${workspacePath}`);
  }
  for (const workspacePath of active) {
    if (!catalogPaths.has(workspacePath)) errors.push(`active workspace is absent from catalog: ${workspacePath}`);
  }

  if (ledger.entries.filter(({ outcome }) => outcome === "reduce-to-fixture").length > 1) {
    errors.push("at most one entry may reduce to a synthetic fixture");
  }

  return errors;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
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
