import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  confirmActionableFailure,
  encodeFailureName,
  formatFailureNames,
  observeChecks,
} from "./logic.ts";

describe("observeChecks", () => {
  it("reports a real current-head failure", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [{ name: "build", status: "COMPLETED", conclusion: "FAILURE" }],
      }),
      { kind: "failed", failures: ["build"], headSha: "current-head" },
    );
  });

  it("keeps pending and unknown checks non-actionable", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [{ name: "build", status: "IN_PROGRESS", conclusion: null }],
      }),
      {
        kind: "unknown",
        reason: "current-head checks are pending or unknown",
        headSha: "current-head",
      },
    );
  });

  it("treats a cancelled duplicate as non-actionable when the same exact-head check succeeded", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            actionsRunId: "42",
            actionsRunAttempt: 1,
            status: "COMPLETED",
            conclusion: "CANCELLED",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/2",
            actionsRunId: "42",
            actionsRunAttempt: 2,
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
        ],
      }),
      { kind: "green", headSha: "current-head" },
    );
  });

  it("suppresses a cancelled cross-trigger Actions run when the exact-head peer run succeeded", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "Scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/41/job/1",
            status: "COMPLETED",
            conclusion: "CANCELLED",
            startedAt: "2026-08-24T10:00:00.000Z",
          },
          {
            name: "scan",
            workflowName: "Scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "SUCCESS",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }),
      { kind: "green", headSha: "current-head" },
    );
  });

  it("does not suppress a newer cross-run cancellation behind an older success", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "Scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/41/job/1",
            status: "COMPLETED",
            conclusion: "SUCCESS",
            startedAt: "2026-08-24T10:00:00.000Z",
          },
          {
            name: "scan",
            workflowName: "Scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "CANCELLED",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("uses a later successful rerun to resolve an earlier same-head failure", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "FAILURE",
            startedAt: "2026-08-24T10:00:00.000Z",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "SUCCESS",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }),
      { kind: "green", headSha: "current-head" },
    );
  });

  it("uses enriched run attempts to resolve a rerun with a different Actions job URL", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            actionsRunId: "42",
            actionsRunAttempt: 1,
            status: "COMPLETED",
            conclusion: "FAILURE",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/2",
            actionsRunId: "42",
            actionsRunAttempt: 2,
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
        ],
      }),
      { kind: "green", headSha: "current-head" },
    );
  });

  it("does not let an older success hide the latest cancelled attempt", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 1,
            status: "COMPLETED",
            conclusion: "FAILURE",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 2,
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 3,
            status: "COMPLETED",
            conclusion: "CANCELLED",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("fails closed when any grouped failure lacks comparable attempt ordering", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://example.com/stable-scan",
            status: "COMPLETED",
            conclusion: "FAILURE",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://example.com/stable-scan",
            status: "COMPLETED",
            conclusion: "FAILURE",
            startedAt: "2026-08-24T10:00:00.000Z",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://example.com/stable-scan",
            status: "COMPLETED",
            conclusion: "SUCCESS",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("still fails closed when a failure is newer than a prior success", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "SUCCESS",
            startedAt: "2026-08-24T10:00:00.000Z",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "FAILURE",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }),
      { kind: "failed", failures: ["scan"], headSha: "current-head" },
    );
  });

  it("does not let a later skipped attempt clear a real failure", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "FAILURE",
            startedAt: "2026-08-24T10:00:00.000Z",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "SKIPPED",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("does not coalesce equal names without provider identity", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          { name: "security", status: "COMPLETED", conclusion: "FAILURE" },
          { name: "security", status: "COMPLETED", conclusion: "SUCCESS" },
        ],
      }).kind,
      "failed",
    );
  });

  it("does not let a separate workflow run clear a PR run failure", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "lint",
            workflowName: "CI",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/41/job/1",
            status: "COMPLETED",
            conclusion: "FAILURE",
            startedAt: "2026-08-24T10:00:00.000Z",
          },
          {
            name: "lint",
            workflowName: "CI",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "SUCCESS",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("does not let a distinct same-named job clear a failure", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "FAILURE",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/2",
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("preserves a newer failure while an older same-lineage attempt is pending", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "IN_PROGRESS",
            conclusion: null,
            startedAt: "2026-08-24T10:00:00.000Z",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "FAILURE",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("does not let an older overlapping attempt that finishes later clear a newer failure", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "SUCCESS",
            startedAt: "2026-08-24T10:00:00.000Z",
            completedAt: "2026-08-24T10:10:00.000Z",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "FAILURE",
            startedAt: "2026-08-24T10:05:00.000Z",
            completedAt: "2026-08-24T10:06:00.000Z",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("keeps delimiter-shaped workflow and check labels as distinct identities", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            workflowName: "alpha",
            name: "beta:name:gamma",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "FAILURE",
          },
          {
            workflowName: "alpha:name:beta",
            name: "gamma",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/2",
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
        ],
      }),
      { kind: "failed", failures: ["beta:name:gamma"], headSha: "current-head" },
    );
  });
});

describe("confirmActionableFailure", () => {
  it("rejects a delayed failure after a fresh read confirms a green superseding head", () => {
    assert.deepEqual(
      confirmActionableFailure(
        { kind: "failed", failures: ["scan"], headSha: "old-head" },
        { kind: "green", headSha: "new-head" },
      ),
      { kind: "superseded", headSha: "new-head" },
    );
  });

  it("makes a fresh failure on a superseding head actionable immediately", () => {
    assert.deepEqual(
      confirmActionableFailure(
        { kind: "failed", failures: ["scan"], headSha: "old-head" },
        { kind: "failed", failures: ["build"], headSha: "new-head" },
      ),
      { kind: "actionable", failures: ["build"], headSha: "new-head" },
    );
  });

  it("keeps a freshly confirmed current-head failure actionable", () => {
    assert.deepEqual(
      confirmActionableFailure(
        { kind: "failed", failures: ["scan"], headSha: "current-head" },
        { kind: "failed", failures: ["scan"], headSha: "current-head" },
      ),
      { kind: "actionable", failures: ["scan"], headSha: "current-head" },
    );
  });
});

describe("encodeFailureName", () => {
  it("encodes untrusted Unicode names as bounded code points", () => {
    assert.equal(encodeFailureName("é😀"), "U+00E9 U+1F600");
    const encoded = encodeFailureName("x".repeat(121));
    assert.match(encoded, /\(truncated\)$/);
    assert.equal(encoded.match(/U\+0078/g)?.length, 120);
  });

  it("bounds the number of encoded failure names", () => {
    const formatted = formatFailureNames(Array.from({ length: 21 }, (_, index) => `check-${index}`));
    assert.match(formatted, /; 1 additional failure name\(s\)$/);
    assert.doesNotMatch(formatted, /U\+0032 U\+0030/u);
  });
});
