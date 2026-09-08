import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateMigrationLedger } from "./check-credential-migration-ledger.mjs";
import { workspaceCatalog } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ledger = JSON.parse(
  readFileSync(
    path.join(repoRoot, "docs/architecture/credential-family-migration-ledger.v1.json"),
    "utf8",
  ),
);
const clone = () => structuredClone(ledger);

test("current ledger covers the migration catalog", () => {
  assert.deepEqual(validateMigrationLedger(ledger), []);
});

test("missing, duplicate, and unknown workspaces fail", () => {
  const invalid = clone();
  const removed = invalid.entries[0].workspaces.shift();
  invalid.entries[1].workspaces.push(invalid.entries[1].workspaces[0]);
  invalid.entries[2].workspaces.push({
    path: "packages/use-cases/not-real",
    packageName: removed.packageName,
  });

  const errors = validateMigrationLedger(invalid);
  assert.ok(errors.some((error) => error.startsWith("missing workspace:")));
  assert.ok(errors.some((error) => error.startsWith("duplicate workspace:")));
  assert.ok(errors.some((error) => error.startsWith("unknown workspace:")));
});

test("invalid lifecycle outcomes fail", () => {
  const invalid = clone();
  invalid.entries[0].outcome = "retain";
  invalid.entries[1].targetRepository = "https://github.com/example/repo";
  invalid.entries.find(({ outcome }) => outcome === "graduate").targetRepository =
    "https://example.com/repo";

  const errors = validateMigrationLedger(invalid);
  assert.ok(errors.some((error) => error.includes("invalid outcome")));
  assert.ok(errors.some((error) => error.includes("must not name")));
  assert.ok(errors.some((error) => error.includes("destination repository")));
});

test("package identities cannot drift", () => {
  const invalid = clone();
  invalid.entries[0].workspaces[0].packageName = "@midnight-ntwrk/not-the-package";
  assert.ok(
    validateMigrationLedger(invalid).some((error) =>
      error.includes("package name drifted"),
    ),
  );
});

test("a deleted workspace remains as a removed ledger row", () => {
  const workspacePath = "packages/prototypes/credential-families/birth";
  const candidate = clone();
  candidate.entries.find(({ id }) => id === "birth-family").workspaces[0]
    .migrationState = "removed";
  const catalog = workspaceCatalog.filter(({ path: item }) => item !== workspacePath);
  const removedRoot = path.join(repoRoot, workspacePath);
  const pathExists = (candidatePath) =>
    candidatePath !== removedRoot &&
    !candidatePath.startsWith(`${removedRoot}${path.sep}`) &&
    existsSync(candidatePath);

  assert.deepEqual(validateMigrationLedger(candidate, { catalog, pathExists }), []);
});

test("only one synthetic fixture is allowed", () => {
  const invalid = clone();
  invalid.entries[0].outcome = "reduce-to-fixture";
  assert.ok(
    validateMigrationLedger(invalid).some((error) =>
      error.includes("at most one entry"),
    ),
  );
});
