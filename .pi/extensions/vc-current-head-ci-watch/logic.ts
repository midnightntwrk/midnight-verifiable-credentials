const MAX_FAILURE_NAMES_IN_MESSAGE = 20;
const MAX_FAILURE_NAME_CODE_POINTS = 120;
const DEFAULT_MAX_ACTIONS_JOB_LOOKUPS = 100;
const DEFAULT_ACTIONS_JOB_LOOKUP_BATCH_SIZE = 10;
const EXPECTED_ACTIONS_REPOSITORY = "midnightntwrk/midnight-verifiable-credentials";
const CROSS_TRIGGER_CANCELLATION_IDENTITIES = new Set([JSON.stringify(["Scan", "scan"])]);

const FAILED_CONCLUSIONS = new Set([
  "ACTION_REQUIRED",
  "CANCELLED",
  "ERROR",
  "FAILURE",
  "FAILED",
  "STALE",
  "STARTUP_FAILURE",
  "TIMED_OUT",
]);
const COMPLETED_SUCCESS_CONCLUSIONS = new Set(["NEUTRAL", "SKIPPED", "SUCCESS"]);
const RESOLVING_SUCCESS_CONCLUSIONS = new Set(["SUCCESS"]);

export type StatusCheck = {
  actionsRunAttempt?: number;
  actionsRunId?: string;
  completedAt?: string | null;
  conclusion?: string | null;
  detailsUrl?: string | null;
  context?: string | null;
  name?: string | null;
  startedAt?: string | null;
  state?: string | null;
  status?: string | null;
  workflowName?: string | null;
};

export type PullRequestChecks = {
  headRefOid?: string | null;
  statusCheckRollup?: StatusCheck[] | null;
};

export type ActionsJob = {
  id?: number;
  name?: string;
  run_attempt?: number;
  run_id?: number;
};

export type ActionsJobLoader = (jobId: string) => Promise<ActionsJob | undefined>;

export type CheckObservation =
  | { kind: "failed"; failures: string[]; headSha: string }
  | { kind: "green"; headSha: string }
  | { kind: "unknown"; reason: string; headSha?: string };

export type FailureConfirmation =
  | { kind: "actionable"; failures: string[]; headSha: string }
  | { kind: "resolved"; headSha: string }
  | { kind: "superseded"; headSha: string }
  | { kind: "unknown"; reason: string; headSha?: string };

type CompletedAttempt = {
  conclusion: string;
  order?: number;
};

function normalize(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().toUpperCase() : undefined;
}

function checkName(check: StatusCheck): string {
  return check.name?.trim() || check.context?.trim() || "unnamed check";
}

function crossRunCancellationIdentity(check: StatusCheck): string | undefined {
  const workflowName = check.workflowName?.trim();
  const name = check.name?.trim();
  return workflowName && name ? JSON.stringify([workflowName, name]) : undefined;
}

function actionsRunId(check: StatusCheck): string | undefined {
  return check.actionsRunId?.trim() || githubActionsJobReference(check)?.runId;
}

function shouldSuppressCrossRunCancellation(check: StatusCheck, checks: StatusCheck[]): boolean {
  if (normalize(check.status) !== "COMPLETED") return false;
  if (normalize(check.conclusion ?? check.state) !== "CANCELLED") return false;
  const identity = crossRunCancellationIdentity(check);
  if (!identity || !CROSS_TRIGGER_CANCELLATION_IDENTITIES.has(identity)) return false;

  // Cross-trigger suppression is intentionally limited to the one known
  // repository workflow/check pair and an unambiguous cancelled/success pair.
  // Anything broader remains fail-closed because display names alone do not
  // prove that multiple same-named jobs share a logical identity.
  const peers = checks.filter((candidate) => crossRunCancellationIdentity(candidate) === identity);
  if (peers.length !== 2) return false;
  const candidate = peers.find((peer) => peer !== check);
  if (!candidate || normalize(candidate.status) !== "COMPLETED") return false;
  if (normalize(candidate.conclusion ?? candidate.state) !== "SUCCESS") return false;

  const cancelledReference = githubActionsJobReference(check);
  const successfulReference = githubActionsJobReference(candidate);
  const cancelledStartedAt = startedTime(check);
  const successfulStartedAt = startedTime(candidate);
  return (
    cancelledReference !== undefined &&
    successfulReference !== undefined &&
    actionsRunId(check) === cancelledReference.runId &&
    actionsRunId(candidate) === successfulReference.runId &&
    successfulReference.runId !== cancelledReference.runId &&
    cancelledStartedAt !== undefined &&
    successfulStartedAt !== undefined &&
    successfulStartedAt > cancelledStartedAt
  );
}

function isGithubActionsJobUrl(detailsUrl: string): boolean {
  try {
    const url = new URL(detailsUrl);
    return (
      url.hostname.toLowerCase() === "github.com" &&
      /^\/[^/]+\/[^/]+\/actions\/runs\/\d+\/job\/\d+\/?$/u.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function checkIdentity(check: StatusCheck): string | undefined {
  const workflowName = check.workflowName?.trim();
  const name = check.name?.trim();
  const runId = check.actionsRunId?.trim();
  const runAttempt = check.actionsRunAttempt;
  if (workflowName && name && runId && Number.isInteger(runAttempt) && runAttempt! >= 1) {
    return JSON.stringify(["actions-run", runId, workflowName, name]);
  }
  const detailsUrl = check.detailsUrl?.trim();
  if (!workflowName || !name || !detailsUrl || isGithubActionsJobUrl(detailsUrl)) return undefined;
  try {
    return JSON.stringify(["exact-url", new URL(detailsUrl).href, workflowName, name]);
  } catch {
    return undefined;
  }
}

export function githubActionsJobReference(
  check: StatusCheck,
): { jobId: string; runId: string } | undefined {
  const detailsUrl = check.detailsUrl?.trim();
  if (!detailsUrl) return undefined;
  try {
    const url = new URL(detailsUrl);
    const match = url.pathname.match(
      new RegExp(`^/${EXPECTED_ACTIONS_REPOSITORY}/actions/runs/(\\d+)/job/(\\d+)/?$`, "u"),
    );
    if (url.hostname.toLowerCase() !== "github.com" || !match) return undefined;
    return { runId: match[1]!, jobId: match[2]! };
  } catch {
    return undefined;
  }
}

export async function enrichActionsRunAttempts(
  payload: PullRequestChecks,
  loadJob: ActionsJobLoader,
  limits: { batchSize?: number; maxLookups?: number } = {},
): Promise<PullRequestChecks> {
  const checks = payload.statusCheckRollup;
  if (!Array.isArray(checks)) return payload;

  const duplicateGroups = new Map<string, Array<{ check: StatusCheck; jobId: string; runId: string }>>();
  for (const check of checks) {
    const reference = githubActionsJobReference(check);
    const workflowName = check.workflowName?.trim();
    const name = check.name?.trim();
    if (!reference || !workflowName || !name) continue;
    const key = JSON.stringify([reference.runId, workflowName, name]);
    const group = duplicateGroups.get(key);
    const candidate = { check, ...reference };
    if (group) group.push(candidate);
    else duplicateGroups.set(key, [candidate]);
  }

  const groups = [...duplicateGroups.values()].filter((group) => group.length > 1);
  const jobIds = [...new Set(groups.flatMap((group) => group.map((candidate) => candidate.jobId)))];
  const maxLookups = limits.maxLookups ?? DEFAULT_MAX_ACTIONS_JOB_LOOKUPS;
  if (!Number.isInteger(maxLookups) || maxLookups < 0) return payload;
  if (jobIds.length === 0 || jobIds.length > maxLookups) return payload;

  const jobs = new Map<string, ActionsJob>();
  const batchSize = limits.batchSize ?? DEFAULT_ACTIONS_JOB_LOOKUP_BATCH_SIZE;
  if (!Number.isInteger(batchSize) || batchSize < 1) return payload;
  for (let index = 0; index < jobIds.length; index += batchSize) {
    const batch = jobIds.slice(index, index + batchSize);
    const results = await Promise.all(batch.map(async (jobId) => ({
      jobId,
      job: await loadJob(jobId).catch(() => undefined),
    })));
    for (const { jobId, job } of results) {
      if (job) jobs.set(jobId, job);
    }
  }

  const enriched = new Map<StatusCheck, { runAttempt: number; runId: string }>();
  for (const group of groups) {
    const validated = group.map((candidate) => {
      const job = jobs.get(candidate.jobId);
      if (
        !job ||
        String(job.id) !== candidate.jobId ||
        String(job.run_id) !== candidate.runId ||
        job.name?.trim() !== candidate.check.name?.trim() ||
        !Number.isInteger(job.run_attempt) ||
        job.run_attempt! < 1
      ) return undefined;
      return { candidate, runAttempt: job.run_attempt! };
    });
    if (validated.some((candidate) => candidate === undefined)) continue;

    // Distinct same-named jobs in one workflow attempt are not a proven rerun
    // lineage. Refuse to coalesce the whole group when attempt identity is not
    // one-to-one, so one job's success cannot hide another job's failure.
    const runAttempts = validated.map((candidate) => candidate!.runAttempt);
    if (new Set(runAttempts).size !== runAttempts.length) continue;
    for (const candidate of validated) {
      enriched.set(candidate!.candidate.check, {
        runAttempt: candidate!.runAttempt,
        runId: candidate!.candidate.runId,
      });
    }
  }

  return {
    ...payload,
    statusCheckRollup: checks.map((check) => {
      const enrichment = enriched.get(check);
      return enrichment
        ? { ...check, actionsRunId: enrichment.runId, actionsRunAttempt: enrichment.runAttempt }
        : check;
    }),
  };
}

function startedTime(check: StatusCheck): number | undefined {
  const startedAt = check.startedAt?.trim();
  if (!startedAt) return undefined;
  const parsed = Date.parse(startedAt);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function attemptOrder(check: StatusCheck): number | undefined {
  if (Number.isInteger(check.actionsRunAttempt) && check.actionsRunAttempt! >= 1) {
    return check.actionsRunAttempt;
  }
  return startedTime(check);
}

function latestTime(attempts: CompletedAttempt[], conclusions: Set<string>): number | undefined {
  const times = attempts
    .filter((attempt) => conclusions.has(attempt.conclusion))
    .map((attempt) => attempt.order)
    .filter((value): value is number => value !== undefined);
  return times.length > 0 ? Math.max(...times) : undefined;
}

function groupOutcome(checks: StatusCheck[]): "failed" | "green" | "unknown" {
  const completed: CompletedAttempt[] = [];
  const pendingOrUnknownOrders: Array<number | undefined> = [];

  for (const check of checks) {
    const status = normalize(check.status);
    const conclusion = normalize(check.conclusion ?? check.state);
    if (
      (status && status !== "COMPLETED") ||
      !conclusion ||
      (!FAILED_CONCLUSIONS.has(conclusion) && !COMPLETED_SUCCESS_CONCLUSIONS.has(conclusion))
    ) {
      pendingOrUnknownOrders.push(attemptOrder(check));
      continue;
    }
    completed.push({ conclusion, order: attemptOrder(check) });
  }

  const successes = completed.filter((attempt) => RESOLVING_SUCCESS_CONCLUSIONS.has(attempt.conclusion));
  const cancellations = completed.filter((attempt) => attempt.conclusion === "CANCELLED");
  const otherFailures = completed.filter(
    (attempt) => FAILED_CONCLUSIONS.has(attempt.conclusion) && attempt.conclusion !== "CANCELLED",
  );

  if (otherFailures.length > 0) {
    const allFailures = [...otherFailures, ...cancellations];
    const latestFailure = latestTime(allFailures, FAILED_CONCLUSIONS);
    if (allFailures.some((attempt) => attempt.order === undefined)) return "failed";

    // Pending attempts older than the latest completed evidence cannot change
    // that evidence. Only an unorderable or newer pending attempt keeps the
    // lineage unsettled.
    const latestSuccess = latestTime(successes, RESOLVING_SUCCESS_CONCLUSIONS);
    const latestCompleted = Math.max(latestFailure ?? -Infinity, latestSuccess ?? -Infinity);
    const couldBeLaterRerun = pendingOrUnknownOrders.some(
      (order) => order === undefined || order > latestCompleted,
    );
    if (couldBeLaterRerun) return "unknown";

    // A non-cancel failure is resolved only by a strictly later attempt in the
    // same Actions run/logical-job lineage. Missing or tied run-attempt values
    // remain fail-closed.
    if (latestFailure !== undefined && latestSuccess !== undefined && latestSuccess > latestFailure) {
      return "green";
    }
    return "failed";
  }

  const latestCancellation = latestTime(cancellations, new Set(["CANCELLED"]));
  const latestSuccess = latestTime(successes, RESOLVING_SUCCESS_CONCLUSIONS);
  const latestCompleted = Math.max(latestCancellation ?? -Infinity, latestSuccess ?? -Infinity);
  const couldBeLaterCancellationRerun = pendingOrUnknownOrders.some(
    (order) => order === undefined || order > latestCompleted,
  );
  if (couldBeLaterCancellationRerun) return "unknown";

  // A provider job can leave a cancelled attempt beside an actual success on a
  // later rerun of the same lineage. That exact-head success makes only the
  // older cancellation non-actionable.
  if (
    cancellations.length > 0 &&
    !cancellations.some((attempt) => attempt.order === undefined) &&
    latestCancellation !== undefined &&
    latestSuccess !== undefined &&
    latestSuccess > latestCancellation
  ) return "green";
  if (cancellations.length > 0) return "failed";
  return completed.length > 0 ? "green" : "unknown";
}

export function updateSeenFailureKeys(
  seenFailureKeys: Iterable<string>,
  failureKey: string,
  active: boolean,
): string[] {
  const next = new Set(seenFailureKeys);
  if (active) next.add(failureKey);
  else next.delete(failureKey);
  return [...next].sort();
}

export function pruneSeenFailureKeys(
  seenFailureKeys: Iterable<string>,
  prNumber: number,
  currentHeadSha: string,
): string[] {
  const prefix = `${prNumber}:`;
  const currentKey = `${prefix}${currentHeadSha}`;
  return [...new Set(seenFailureKeys)]
    .filter((key) => !key.startsWith(prefix) || key === currentKey)
    .sort();
}

export function encodeFailureName(name: string): string {
  const codePoints = [...name];
  const encoded = codePoints
    .slice(0, MAX_FAILURE_NAME_CODE_POINTS)
    .map((character) => `U+${character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`)
    .join(" ");
  return codePoints.length > MAX_FAILURE_NAME_CODE_POINTS ? `${encoded} (truncated)` : encoded;
}

export function formatFailureNames(failures: string[]): string {
  const failureNames = failures
    .slice(0, MAX_FAILURE_NAMES_IN_MESSAGE)
    .map(encodeFailureName)
    .join("; ");
  const omittedFailureCount = failures.length - MAX_FAILURE_NAMES_IN_MESSAGE;
  const failureSuffix = omittedFailureCount > 0 ? `; ${omittedFailureCount} additional failure name(s)` : "";
  return `${failureNames}${failureSuffix}`;
}

export function observeChecks(payload: PullRequestChecks): CheckObservation {
  const headSha = payload.headRefOid?.trim();
  const checks = payload.statusCheckRollup;
  if (!headSha || !Array.isArray(checks) || checks.length === 0) {
    return { kind: "unknown", reason: "awaiting a current-head check rollup", ...(headSha ? { headSha } : {}) };
  }

  const actionableChecks = checks.filter((check) => !shouldSuppressCrossRunCancellation(check, checks));
  const groups = new Map<string, StatusCheck[]>();
  for (const [index, check] of actionableChecks.entries()) {
    const identity = checkIdentity(check) ?? `untrusted-provider:${index}`;
    const group = groups.get(identity);
    if (group) group.push(check);
    else groups.set(identity, [check]);
  }

  const failures: string[] = [];
  let hasPendingOrUnknown = false;
  for (const group of groups.values()) {
    const outcome = groupOutcome(group);
    if (outcome === "failed") failures.push(checkName(group[0]!));
    if (outcome === "unknown") hasPendingOrUnknown = true;
  }

  if (failures.length > 0) {
    return { kind: "failed", failures: [...new Set(failures)].sort(), headSha };
  }
  if (hasPendingOrUnknown) {
    return { kind: "unknown", reason: "current-head checks are pending or unknown", headSha };
  }
  return { kind: "green", headSha };
}

export function confirmActionableFailure(
  initial: Extract<CheckObservation, { kind: "failed" }>,
  confirmation: CheckObservation,
): FailureConfirmation {
  if (confirmation.headSha && confirmation.headSha !== initial.headSha) {
    if (confirmation.kind === "failed") {
      return {
        kind: "actionable",
        failures: confirmation.failures,
        headSha: confirmation.headSha,
      };
    }
    if (confirmation.kind === "unknown") return confirmation;
    return { kind: "superseded", headSha: confirmation.headSha };
  }
  if (confirmation.kind === "unknown") return confirmation;
  if (confirmation.kind === "green") return { kind: "resolved", headSha: confirmation.headSha };
  return {
    kind: "actionable",
    failures: confirmation.failures,
    headSha: confirmation.headSha,
  };
}

export function confirmCurrentHeadFailure(
  initial: Extract<CheckObservation, { kind: "failed" }>,
  confirmation: CheckObservation,
  finalHeadSha: string | null | undefined,
): FailureConfirmation {
  const candidate = confirmActionableFailure(initial, confirmation);
  if (candidate.kind !== "actionable") return candidate;
  const finalHead = finalHeadSha?.trim();
  if (!finalHead) return { kind: "unknown", reason: "unable to confirm the final current head" };
  if (finalHead !== candidate.headSha) return { kind: "superseded", headSha: finalHead };
  return candidate;
}
