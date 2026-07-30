import { strict as assert } from "node:assert";

import {
  AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION,
  buildAgeGateStepInsightReport,
  serializeAgeGateStepInsightReport,
} from "../features/support/age-gate-step-insight.ts";
import {
  AGE_GATE_SCENARIO_NARRATIVE_KEYS,
  AGE_GATE_SCENARIO_NARRATIVES,
  buildAgeGateScenarioInsight,
  buildHiddenHolderScenarioInsight,
} from "../features/support/age-gate-reporting.ts";

const bytes = (length: number, fill: number) => new Uint8Array(length).fill(fill);

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

assert.deepEqual(Object.keys(AGE_GATE_SCENARIO_NARRATIVES).sort(), [
  ...AGE_GATE_SCENARIO_NARRATIVE_KEYS,
].sort());

for (const key of AGE_GATE_SCENARIO_NARRATIVE_KEYS) {
  const narrative = AGE_GATE_SCENARIO_NARRATIVES[key];
  assert.ok(narrative.taskName.startsWith("#actor runs"));
  assert.ok(narrative.interactionName.startsWith("#actor executes"));
  assert.ok(narrative.insightTitle.endsWith("step insight"));
  assert.ok(narrative.request.length > 0);
  assert.ok(narrative.response.length > 0);
  assert.ok(narrative.checks.length >= 3);
}

const ageGatePayload = buildAgeGateScenarioInsight(
  AGE_GATE_SCENARIO_NARRATIVES.birthCredentialHappyPath,
  {
    approved: true,
    claimDecision: "approved",
    issuedCredentialCount: 1n,
    verifiedPresentationCount: 1n,
    consumedAccessCapabilityCount: 1n,
    lastVerifiedCredentialRoot: bytes(32, 7),
    expectedCredentialRoot: bytes(32, 7),
    lastVerifiedRequestChallenge: bytes(32, 8),
  },
);
const ageGateDto = ageGatePayload.dto as {
  readonly credentialRootMatches: boolean;
  readonly issuedCredentialCount: bigint;
};
assert.equal(ageGateDto.credentialRootMatches, true);
assert.equal(ageGateDto.issuedCredentialCount, 1n);

const hiddenHolderPayload = buildHiddenHolderScenarioInsight(
  AGE_GATE_SCENARIO_NARRATIVES.hiddenHolderWrongAuthorityRejectedPath,
  {
    approved: false,
    claimDecision: null,
    verificationMode: null,
    issuedCredentialCount: 1n,
    verifiedPresentationCount: 0n,
    consumedAccessCapabilityCount: 0n,
    lastVerifiedStatusRegistryId: bytes(32, 1),
    expectedStatusRegistryId: bytes(32, 2),
    failureMessage: "authority mismatch",
    failureCode: "authorityMismatch",
  },
);
const hiddenHolderDto = hiddenHolderPayload.dto as {
  readonly statusRegistryMatches: boolean;
  readonly failureCode: string;
};
assert.equal(hiddenHolderDto.statusRegistryMatches, false);
assert.equal(hiddenHolderDto.failureCode, "authorityMismatch");
