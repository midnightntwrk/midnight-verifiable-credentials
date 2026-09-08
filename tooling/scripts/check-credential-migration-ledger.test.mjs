import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateMigrationLedger } from "./check-credential-migration-ledger.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ledger = JSON.parse(
  readFileSync(
    path.join(repoRoot, "docs/architecture/credential-family-migration-ledger.v1.json"),
    "utf8",
  ),
);
const clone = () => structuredClone(ledger);

test("current migration ledger covers the catalog", () => {
  assert.deepEqual(validateMigrationLedger(ledger), []);
});

test("missing and duplicate workspaces fail closed", () => {
  const missing = clone();
  missing.entries[0].workspaces = [];
  assert.ok(
    validateMigrationLedger(missing).some((error) =>
      error.startsWith("missing workspace:"),
    ),
  );

  const duplicate = clone();
  duplicate.entries[1].workspaces.push(duplicate.entries[0].workspaces[0]);
  assert.ok(
    validateMigrationLedger(duplicate).some((error) =>
      error.startsWith("duplicate workspace:"),
    ),
  );
});

test("invalid or incomplete lifecycle decisions fail closed", () => {
  const invalidOutcome = clone();
  invalidOutcome.entries[0].outcome = "retain";
  assert.ok(
    validateMigrationLedger(invalidOutcome).some((error) =>
      error.includes("outcome is invalid"),
    ),
  );

  const unresolvedGraduate = clone();
  const graduate = unresolvedGraduate.entries.find(
    (entry) => entry.id === "university-diploma-family",
  );
  graduate.blockers = ["Owner approval is required."];
  assert.ok(
    validateMigrationLedger(unresolvedGraduate).some((error) =>
      error.includes("graduate destination is unresolved"),
    ),
  );
});

test("approved ledgers cannot retain pending approvals or blockers", () => {
  const approved = clone();
  approved.status = "approved";
  const errors = validateMigrationLedger(approved);
  assert.ok(
    errors.some((error) => error.includes("lacks VC maintainer approval")),
  );
  assert.ok(
    errors.some((error) => error.includes("cannot be approved with blockers")),
  );
});
