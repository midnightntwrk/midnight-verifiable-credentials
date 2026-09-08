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
  assert.ok(
    errors.some((error) => error.includes("lacks an assigned accountable owner")),
  );
  assert.ok(
    errors.some((error) => error.includes("lacks immutable destination evidence")),
  );
});

test("a resolved ledger can transition to approved", () => {
  const approved = clone();
  approved.status = "approved";
  for (const entry of approved.entries) {
    entry.approval.vcMaintainers = "approved";
    entry.blockers = [];
    if (entry.accountableOwner.includes("unassigned")) {
      entry.accountableOwner = "@midnightntwrk/credential-owner";
    }
    if (entry.outcome === "graduate") {
      entry.approval.productOwner = "approved";
      entry.targetRepository ??=
        "https://github.com/midnightntwrk/midnight-credential-university";
      entry.destinationEvidence = [
        {
          repository: entry.targetRepository,
          revision: "0123456789abcdef0123456789abcdef01234567",
          validationChecks: [
            `${entry.targetRepository}/actions/runs/123456789`,
          ],
        },
      ];
    }
  }
  assert.deepEqual(validateMigrationLedger(approved), []);
});

test("approved ledgers require an actionable owner reference", () => {
  const approved = clone();
  approved.status = "approved";
  for (const entry of approved.entries) {
    entry.accountableOwner = "@midnightntwrk/credential-owner";
    entry.approval.vcMaintainers = "approved";
    entry.blockers = [];
    if (entry.outcome === "graduate") {
      entry.approval.productOwner = "approved";
      entry.targetRepository ??=
        "https://github.com/midnightntwrk/midnight-credential-university";
      entry.destinationEvidence = [
        {
          repository: entry.targetRepository,
          revision: "0123456789abcdef0123456789abcdef01234567",
          validationChecks: [
            `${entry.targetRepository}/actions/runs/123456789`,
          ],
        },
      ];
    }
  }
  approved.entries[0].accountableOwner = "none";
  assert.ok(
    validateMigrationLedger(approved).some((error) =>
      error.includes("lacks an assigned accountable owner"),
    ),
  );
});

test("entries can be approved incrementally while the ledger remains proposed", () => {
  const incremental = clone();
  const entry = incremental.entries.find(({ id }) => id === "birth-family");
  entry.approval.vcMaintainers = "approved";
  entry.blockers = [];
  assert.deepEqual(validateMigrationLedger(incremental), []);
});

test("graduation evidence is immutable and bound to the destination", () => {
  const missing = clone();
  const missingEntry = missing.entries.find(
    ({ id }) => id === "digital-passport-family",
  );
  missingEntry.approval.vcMaintainers = "approved";
  missingEntry.approval.productOwner = "approved";
  missingEntry.blockers = [];
  assert.ok(
    validateMigrationLedger(missing).some((error) =>
      error.includes("blockers must be a non-empty array"),
    ),
  );

  const invalid = clone();
  const entry = invalid.entries.find(
    ({ id }) => id === "digital-passport-family",
  );
  entry.destinationEvidence = [
    {
      repository: "https://github.com/midnightntwrk/not-the-target",
      revision: "0000000000000000000000000000000000000000",
      validationChecks: ["https://github.com/"],
    },
  ];
  const errors = validateMigrationLedger(invalid);
  assert.ok(errors.some((error) => error.includes("must equal targetRepository")));
  assert.ok(errors.some((error) => error.includes("full Git commit SHA")));
  assert.ok(
    errors.some((error) =>
      error.includes("must contain destination GitHub Actions run URLs"),
    ),
  );
});

test("repository evidence paths cannot escape the checkout", () => {
  const invalid = clone();
  invalid.entries[0].evidence = ["../package.json"];
  assert.ok(
    validateMigrationLedger(invalid).some((error) =>
      error.includes("must stay within the repository"),
    ),
  );

  invalid.entries[0].evidence = [
    "packages/prototypes/credential-families/birth/package.json",
  ];
  invalid.entries[0].workspaces[0].path = "../midnight-did";
  assert.ok(
    validateMigrationLedger(invalid).some((error) =>
      error.includes("workspace must stay within the repository"),
    ),
  );
});
