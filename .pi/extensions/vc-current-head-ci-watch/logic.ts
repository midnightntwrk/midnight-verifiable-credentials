const MAX_FAILURE_NAMES_IN_MESSAGE = 20;
const MAX_FAILURE_NAME_CODE_POINTS = 120;

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
  if (normalize(check.conclusion ?? check.state) !== "CANCELLED") return false;
  const identity = crossRunCancellationIdentity(check);
  const cancelledRunId = actionsRunId(check);
  const cancelledStartedAt = startedTime(check);
  if (!identity || !cancelledRunId || cancelledStartedAt === undefined) return false;
  return checks.some((candidate) => {
    const status = normalize(candidate.status);
    const conclusion = normalize(candidate.conclusion ?? candidate.state);
    return (
      (!status || status === "COMPLETED") &&
      conclusion === "SUCCESS" &&
      crossRunCancellationIdentity(candidate) === identity &&
      actionsRunId(candidate) !== undefined &&
      actionsRunId(candidate) !== cancelledRunId &&
      startedTime(candidate) !== undefined &&
      startedTime(candidate)! > cancelledStartedAt
    );
  });
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
  if (!workflowName || !name || !detailsUrl) return undefined;
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
    const match = url.pathname.match(/^\/[^/]+\/[^/]+\/actions\/runs\/(\d+)\/job\/(\d+)\/?$/u);
    if (url.hostname.toLowerCase() !== "github.com" || !match) return undefined;
    return { runId: match[1]!, jobId: match[2]! };
  } catch {
    return undefined;
  }
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
    const couldBeLaterRerun = pendingOrUnknownOrders.some(
      (startedAt) => startedAt === undefined || latestFailure === undefined || startedAt > latestFailure,
    );
    if (couldBeLaterRerun) return "unknown";

    // A non-cancel failure is resolved only by a strictly later attempt in the
    // same Actions run/logical-job lineage. Missing or tied run-attempt values
    // remain fail-closed.
    const latestSuccess = latestTime(successes, RESOLVING_SUCCESS_CONCLUSIONS);
    if (latestFailure !== undefined && latestSuccess !== undefined && latestSuccess > latestFailure) {
      return "green";
    }
    return "failed";
  }

  if (pendingOrUnknownOrders.length > 0) return "unknown";

  // A provider job can leave a cancelled attempt beside an actual success on a
  // later rerun of the same lineage. That exact-head success makes only the
  // older cancellation non-actionable.
  const latestCancellation = latestTime(cancellations, new Set(["CANCELLED"]));
  const latestSuccess = latestTime(successes, RESOLVING_SUCCESS_CONCLUSIONS);
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
