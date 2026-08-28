import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  confirmActionableFailure,
  confirmCurrentHeadFailure,
  encodeFailureName,
  enrichActionsRunAttempts,
  formatFailureNames,
  observeChecks,
  pruneSeenFailureKeys,
  updateSeenFailureKeys,
  type CheckObservation,
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

  it("does not suppress ambiguous same-named cross-run cancellations", () => {
    assert.equal(
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
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/41/job/2",
            status: "COMPLETED",
            conclusion: "CANCELLED",
            startedAt: "2026-08-24T10:01:00.000Z",
          },
          {
            name: "scan",
            workflowName: "Scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/3",
            status: "COMPLETED",
            conclusion: "SUCCESS",
            startedAt: "2026-08-24T10:05:00.000Z",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("requires complete status and the expected repository for cross-run suppression", () => {
    for (const [detailsUrl, status] of [
      ["https://github.com/other/repository/actions/runs/42/job/2", "COMPLETED"],
      ["https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/2", null],
    ] as const) {
      assert.equal(
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
              detailsUrl,
              status,
              conclusion: "SUCCESS",
              startedAt: "2026-08-24T10:05:00.000Z",
            },
          ],
        }).kind,
        "failed",
      );
    }
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

  it("uses a later stable-provider success to resolve an earlier same-head failure", () => {
    assert.deepEqual(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
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

  it("preserves a newer cancellation while an older same-lineage attempt is pending", () => {
    assert.equal(
      observeChecks({
        headRefOid: "current-head",
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 1,
            status: "IN_PROGRESS",
            conclusion: null,
          },
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 2,
            status: "COMPLETED",
            conclusion: "CANCELLED",
          },
        ],
      }).kind,
      "failed",
    );
  });

  it("keeps an older cancellation non-actionable while a newer same-lineage attempt is pending", () => {
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
            conclusion: "CANCELLED",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 2,
            status: "IN_PROGRESS",
            conclusion: null,
          },
        ],
      }).kind,
      "unknown",
    );
  });

  it("lets the latest completed success settle older failures and pending attempts", () => {
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
            status: "IN_PROGRESS",
            conclusion: null,
          },
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 3,
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
        ],
      }).kind,
      "green",
    );
  });

  it("lets the latest completed success settle older cancellations and pending attempts", () => {
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
            conclusion: "CANCELLED",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 2,
            status: "IN_PROGRESS",
            conclusion: null,
          },
          {
            name: "scan",
            workflowName: "PR scan",
            actionsRunId: "42",
            actionsRunAttempt: 3,
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
        ],
      }).kind,
      "green",
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

describe("enrichActionsRunAttempts", () => {
  const rerunChecks = () => ({
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
  });

  it("enriches a one-to-one rerun lineage with validated attempts", async () => {
    const jobs = new Map([
      ["1", { id: 1, name: "scan", run_id: 42, run_attempt: 1 }],
      ["2", { id: 2, name: "scan", run_id: 42, run_attempt: 2 }],
    ]);
    const enriched = await enrichActionsRunAttempts(rerunChecks(), async (jobId) => jobs.get(jobId));

    assert.deepEqual(
      enriched.statusCheckRollup?.map((check) => [check.actionsRunId, check.actionsRunAttempt]),
      [["42", 1], ["42", 2]],
    );
    assert.equal(observeChecks(enriched).kind, "green");
  });

  it("refuses to coalesce distinct same-named jobs from one attempt", async () => {
    const jobs = new Map([
      ["1", { id: 1, name: "scan", run_id: 42, run_attempt: 1 }],
      ["2", { id: 2, name: "scan", run_id: 42, run_attempt: 1 }],
    ]);
    const enriched = await enrichActionsRunAttempts(rerunChecks(), async (jobId) => jobs.get(jobId));

    assert.deepEqual(
      enriched.statusCheckRollup?.map((check) => [check.actionsRunId, check.actionsRunAttempt]),
      [[undefined, undefined], [undefined, undefined]],
    );
    assert.equal(observeChecks(enriched).kind, "failed");
  });

  it("fails closed on mismatched job metadata or unavailable lookups", async () => {
    const mismatched = await enrichActionsRunAttempts(rerunChecks(), async (jobId) =>
      jobId === "1" ? { id: 999, name: "scan", run_id: 42, run_attempt: 1 } : undefined,
    );

    assert.equal(observeChecks(mismatched).kind, "failed");
    assert.equal(mismatched.statusCheckRollup?.some((check) => check.actionsRunAttempt !== undefined), false);
  });

  it("fails closed when Actions job names do not match the rollup check", async () => {
    const jobs = new Map([
      ["1", { id: 1, name: "unrelated", run_id: 42, run_attempt: 1 }],
      ["2", { id: 2, name: "scan", run_id: 42, run_attempt: 2 }],
    ]);
    const enriched = await enrichActionsRunAttempts(rerunChecks(), async (jobId) => jobs.get(jobId));

    assert.equal(observeChecks(enriched).kind, "failed");
    assert.equal(enriched.statusCheckRollup?.some((check) => check.actionsRunAttempt !== undefined), false);
  });

  it("treats a rejected lookup as unavailable metadata instead of aborting", async () => {
    const enriched = await enrichActionsRunAttempts(rerunChecks(), async () => {
      throw new Error("lookup failed");
    });

    assert.equal(observeChecks(enriched).kind, "failed");
    assert.equal(enriched.statusCheckRollup?.some((check) => check.actionsRunAttempt !== undefined), false);
  });

  it("enforces lookup and batching bounds without hanging", async () => {
    for (const limits of [{ maxLookups: 1 }, { batchSize: 0 }, { batchSize: -1 }, { maxLookups: -1 }]) {
      let lookupCount = 0;
      const enriched = await enrichActionsRunAttempts(
        rerunChecks(),
        async () => {
          lookupCount += 1;
          return undefined;
        },
        limits,
      );

      assert.equal(lookupCount, 0);
      assert.equal(observeChecks(enriched).kind, "failed");
    }
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

describe("confirmCurrentHeadFailure", () => {
  const initial: Extract<CheckObservation, { kind: "failed" }> = {
    kind: "failed",
    failures: ["scan"],
    headSha: "current-head",
  };
  const confirmation: CheckObservation = {
    kind: "failed",
    failures: ["scan"],
    headSha: "current-head",
  };

  it("keeps a stable freshly confirmed current-head failure actionable", () => {
    assert.deepEqual(confirmCurrentHeadFailure(initial, confirmation, "current-head"), {
      kind: "actionable",
      failures: ["scan"],
      headSha: "current-head",
    });
  });

  it("fails closed when the final head read is missing", () => {
    assert.deepEqual(confirmCurrentHeadFailure(initial, confirmation, undefined), {
      kind: "unknown",
      reason: "unable to confirm the final current head",
    });
  });

  it("rejects a failure after the final head read changes", () => {
    assert.deepEqual(confirmCurrentHeadFailure(initial, confirmation, "new-head"), {
      kind: "superseded",
      headSha: "new-head",
    });
  });
});

describe("updateSeenFailureKeys", () => {
  it("clears a resolved PR/head so a later failure can become new again", () => {
    const failureKey = "483:current-head";
    assert.deepEqual(updateSeenFailureKeys([], failureKey, true), [failureKey]);
    assert.deepEqual(updateSeenFailureKeys([failureKey], failureKey, false), []);
    assert.deepEqual(updateSeenFailureKeys([], failureKey, true), [failureKey]);
  });

  it("prunes superseded heads without changing other PRs or the current head", () => {
    assert.deepEqual(
      pruneSeenFailureKeys(
        [
          "482:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "483:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          "483:cccccccccccccccccccccccccccccccccccccccc",
        ],
        483,
        "cccccccccccccccccccccccccccccccccccccccc",
      ),
      [
        "482:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "483:cccccccccccccccccccccccccccccccccccccccc",
      ],
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
