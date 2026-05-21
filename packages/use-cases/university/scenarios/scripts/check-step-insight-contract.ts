import { strict as assert } from "node:assert";

import {
  buildStepInsightReport,
  serializeStepInsightReport,
  UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION,
} from "../features/support/university-step-insight.ts";

const report = buildStepInsightReport("Contract check step insight", {
  request:
    "Build a reusable BDD step insight payload\nwith human-readable intent first.",
  response:
    "The report keeps request, response, checks, and DTO fields in a stable order.",
  checks: [
    "The schema id is explicit.",
    "BigInt DTO fields are rendered as decimal strings\nfor JSON report consumers.",
    "The serialized report remains compact JSON, not escaped multi-line prose.",
  ],
  dto: {
    studentId: "STU-0001",
    claimRoot: 123456789n,
    nested: [{ amount: 42n, note: "line one\nline two" }],
    nullable: null,
  },
});

assert.equal(report.schemaVersion, UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION);
assert.equal(report.title, "Contract check step insight");
assert.equal(
  report.request,
  "Build a reusable BDD step insight payload with human-readable intent first.",
);
assert.equal(
  report.checks[1],
  "BigInt DTO fields are rendered as decimal strings for JSON report consumers.",
);
assert.equal((report.dto as { claimRoot: string }).claimRoot, "123456789");
assert.deepEqual(
  (report.dto as {
    nested: Array<{ amount: string; note: string }>;
  }).nested,
  [{ amount: "42", note: "line one line two" }],
);
assert.equal((report.dto as { nullable: null }).nullable, null);

const serialized = serializeStepInsightReport(report);
assert.equal(serialized.includes("\\n"), false);
assert.equal(JSON.parse(serialized).schemaVersion, report.schemaVersion);
