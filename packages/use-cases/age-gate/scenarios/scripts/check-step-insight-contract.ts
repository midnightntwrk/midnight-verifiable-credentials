import { strict as assert } from "node:assert";

import {
  AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION,
  buildAgeGateStepInsightReport,
  serializeAgeGateStepInsightReport,
} from "../features/support/age-gate-step-insight.ts";

const report = buildAgeGateStepInsightReport("Contract check step insight", {
  request:
    "Record an age-gate BDD step insight\nwith human-readable intent first.",
  response:
    "The report keeps request, response, checks, and DTO fields in a stable order.",
  checks: [
    "The schema id is explicit.",
    "BigInt counters, byte arrays, and failure codes are JSON-safe.",
    "The serialized report remains compact JSON, not escaped multi-line prose.",
  ],
  dto: {
    issuedCredentialCount: 1n,
    credentialRoot: new Uint8Array([0, 1, 2, 255]),
    nested: [{ note: "line one\nline two", accepted: true }],
    nullable: null,
  },
});

assert.equal(report.schemaVersion, AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION);
assert.equal(report.title, "Contract check step insight");
assert.equal(
  report.request,
  "Record an age-gate BDD step insight with human-readable intent first.",
);
assert.equal(
  (report.dto as { issuedCredentialCount: string }).issuedCredentialCount,
  "1",
);
assert.equal((report.dto as { credentialRoot: string }).credentialRoot, "000102ff");
assert.deepEqual(
  (report.dto as { nested: Array<{ note: string; accepted: boolean }> })
    .nested,
  [{ note: "line one line two", accepted: true }],
);
assert.equal((report.dto as { nullable: null }).nullable, null);

const serialized = serializeAgeGateStepInsightReport(report);
assert.equal(serialized.includes("\\n"), false);
assert.equal(JSON.parse(serialized).schemaVersion, report.schemaVersion);
