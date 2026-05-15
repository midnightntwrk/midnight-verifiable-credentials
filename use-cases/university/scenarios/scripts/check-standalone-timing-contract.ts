import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { TelemetryStandaloneHybridUniversityProofExecutionBackend } from "../features/support/university-scenario-backend.ts";
import {
  buildStandaloneTimingSummary,
  renderStandaloneTimingMarkdown,
  standaloneTimingArtifactFiles,
  writeStandaloneTimingArtifacts,
} from "../features/support/university-scenario-telemetry.ts";

class TestTelemetryProofBackend extends TelemetryStandaloneHybridUniversityProofExecutionBackend {
  recordMetric(
    name: string,
    tags?: Record<string, string | number | boolean>,
  ): void {
    this.measure(name, () => undefined, tags);
  }
}

const proofBackend = new TestTelemetryProofBackend();
proofBackend.recordMetric("proof_build_job_request_ms", { phase: "first" });
assert.deepEqual(
  proofBackend.snapshotMetrics().map((metric) => metric.name),
  ["proof_build_job_request_ms"],
);
proofBackend.resetMetrics();
assert.deepEqual(proofBackend.snapshotMetrics(), []);
proofBackend.recordMetric("proof_verify_job_application_ms", {
  phase: "second",
});
const cumulativeProofMetrics = proofBackend.snapshotCumulativeMetrics();
assert.deepEqual(
  cumulativeProofMetrics.map((metric) => metric.name),
  ["proof_build_job_request_ms", "proof_verify_job_application_ms"],
);
assert.equal(cumulativeProofMetrics[0]?.tags?.phase, "first");
assert.equal(cumulativeProofMetrics[1]?.tags?.phase, "second");

const summary = buildStandaloneTimingSummary({
  generatedAtIso: "2030-01-01T00:00:00.000Z",
  overlayDataDirectory:
    "use-cases/university/scenarios/target/standalone-hybrid-data",
  artifactTargetDir: "tmp/test-standalone-timing",
  backendMetrics: [
    { name: "standalone_environment_start_ms", durationMs: 10 },
    { name: "standalone_wallet_sync_ms", durationMs: 20 },
    {
      name: "standalone_student_did_provision_ms",
      durationMs: 30,
      tags: { actorCount: 10 },
    },
    { name: "standalone_company_did_provision_ms", durationMs: 15 },
    { name: "standalone_unknown_did_provision_ms", durationMs: 99 },
    { name: "standalone_overlay_generation_ms", durationMs: 5 },
    { name: "standalone_environment_shutdown_ms", durationMs: 2 },
  ],
  proofBackendMetrics: [
    { name: "proof_issue_diploma_ms", durationMs: 40 },
    { name: "proof_build_job_request_ms", durationMs: 6 },
    { name: "proof_build_mall_request_ms", durationMs: 4 },
    { name: "proof_build_presentation_submission_ms", durationMs: 12 },
    { name: "proof_verify_job_application_ms", durationMs: 8 },
    { name: "proof_verify_mall_discount_ms", durationMs: 3 },
  ],
});

assert.equal(summary.schemaVersion, "midnight-university-standalone-timing.v1");
assert.deepEqual(
  summary.artifactRetention.files,
  standaloneTimingArtifactFiles,
);
assert.equal(summary.phaseTotalsMs.environmentStart, 10);
assert.equal(summary.phaseTotalsMs.walletSync, 20);
assert.equal(summary.phaseTotalsMs.didProvision, 45);
assert.equal(summary.phaseTotalsMs.overlayGeneration, 5);
assert.equal(summary.phaseTotalsMs.environmentShutdown, 2);
assert.equal(summary.phaseTotalsMs.proofIssuance, 40);
assert.equal(summary.phaseTotalsMs.proofRequestBuild, 10);
assert.equal(summary.phaseTotalsMs.proofPresentationBuild, 12);
assert.equal(summary.phaseTotalsMs.proofVerification, 11);
assert.equal(summary.metricCounts.standalone_environment_start_ms, 1);
assert.equal(summary.metricCounts.standalone_student_did_provision_ms, 1);
assert.equal(summary.metricCounts.proof_issue_diploma_ms, 1);
assert.equal(summary.metricCounts.proof_build_job_request_ms, 1);
assert.equal(summary.backendMetrics[2]?.tags?.actorCount, 10);
assert.deepEqual(summary.unclassifiedMetricNames, [
  "standalone_unknown_did_provision_ms",
]);

const markdown = renderStandaloneTimingMarkdown(summary);
assert.match(markdown, /^# University Standalone Timing Summary/m);
assert.match(markdown, /\| DID provisioning \| 45\.000 \|/m);
assert.match(markdown, /\| proof request build \| 10\.000 \|/m);
assert.match(markdown, /\| proof presentation build \| 12\.000 \|/m);
assert.match(markdown, /\| proof_verify_job_application_ms \| 1 \| 8\.000 \|/m);
assert.match(markdown, /- standalone_unknown_did_provision_ms/m);

const emptySummary = buildStandaloneTimingSummary({
  generatedAtIso: "2030-01-01T00:00:01.000Z",
  overlayDataDirectory: "empty-overlay",
  artifactTargetDir: "tmp/empty-standalone-timing",
  backendMetrics: [],
  proofBackendMetrics: [],
});
assert.deepEqual(emptySummary.metricCounts, {});
assert.deepEqual(emptySummary.metricTotalsMs, {});
assert.deepEqual(emptySummary.unclassifiedMetricNames, []);
assert.equal(emptySummary.phaseTotalsMs.didProvision, 0);
assert.match(
  renderStandaloneTimingMarkdown(emptySummary),
  /\| DID provisioning \| 0\.000 \|/m,
);

const targetDir = mkdtempSync(path.join(tmpdir(), "university-standalone-"));
try {
  writeStandaloneTimingArtifacts(targetDir, summary);
  assert.match(
    readFileSync(path.join(targetDir, "summary.json"), "utf8"),
    /midnight-university-standalone-timing\.v1/,
  );
  assert.match(
    readFileSync(path.join(targetDir, "summary.md"), "utf8"),
    /University Standalone Timing Summary/,
  );
} finally {
  rmSync(targetDir, { recursive: true, force: true });
}

console.log("University standalone timing contract passed.");
