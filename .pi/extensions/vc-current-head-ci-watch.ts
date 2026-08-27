import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const REPOSITORY = "midnightntwrk/midnight-verifiable-credentials";
const WATCH_INTERVAL_MS = 5 * 60 * 1000;
const STATUS_KEY = "vc-current-head-ci-watch";
const STATE_ENTRY_TYPE = "vc-current-head-ci-watch-state";
const MAX_OPEN_PULL_REQUESTS = 1_000;
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

type PullRequest = { number: number };
type StatusCheck = {
  conclusion?: string | null;
  context?: string | null;
  name?: string | null;
  state?: string | null;
  status?: string | null;
};
type PullRequestChecks = {
  headRefOid?: string | null;
  statusCheckRollup?: StatusCheck[] | null;
};
type CheckObservation =
  | { kind: "failed"; failures: string[]; headSha: string }
  | { kind: "green"; headSha: string }
  | { kind: "unknown"; reason: string };

function normalize(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().toUpperCase() : undefined;
}

function checkName(check: StatusCheck): string {
  return check.name?.trim() || check.context?.trim() || "unnamed check";
}

function encodeFailureName(name: string): string {
  const codePoints = [...name];
  const encoded = codePoints
    .slice(0, MAX_FAILURE_NAME_CODE_POINTS)
    .map((character) => `U+${character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`)
    .join(" ");
  return codePoints.length > MAX_FAILURE_NAME_CODE_POINTS ? `${encoded} (truncated)` : encoded;
}

function observeChecks(payload: PullRequestChecks): CheckObservation {
  const headSha = payload.headRefOid?.trim();
  const checks = payload.statusCheckRollup;
  if (!headSha || !Array.isArray(checks) || checks.length === 0) {
    return { kind: "unknown", reason: "awaiting a current-head check rollup" };
  }

  const failures: string[] = [];
  let hasPendingOrUnknown = false;
  for (const check of checks) {
    const status = normalize(check.status);
    const conclusion = normalize(check.conclusion ?? check.state);
    if (status && status !== "COMPLETED") {
      hasPendingOrUnknown = true;
      continue;
    }
    if (!conclusion) {
      hasPendingOrUnknown = true;
      continue;
    }
    if (FAILED_CONCLUSIONS.has(conclusion)) {
      failures.push(checkName(check));
      continue;
    }
    if (!COMPLETED_SUCCESS_CONCLUSIONS.has(conclusion)) {
      hasPendingOrUnknown = true;
    }
  }

  if (failures.length > 0) {
    return { kind: "failed", failures: [...new Set(failures)].sort(), headSha };
  }
  if (hasPendingOrUnknown) {
    return { kind: "unknown", reason: "current-head checks are pending or unknown" };
  }
  return { kind: "green", headSha };
}

async function ghJson<T>(
  pi: ExtensionAPI,
  args: string[],
  signal: AbortSignal,
): Promise<T | undefined> {
  const result = await pi.exec("gh", args, { signal, timeout: 30_000 });
  if (result.code !== 0) return undefined;
  try {
    return JSON.parse(result.stdout) as T;
  } catch {
    return undefined;
  }
}

function restoreSeenFailures(ctx: ExtensionContext, seenFailures: Set<string>): void {
  for (const entry of ctx.sessionManager.getBranch()) {
    const candidate = entry as unknown as { customType?: unknown; data?: unknown; type?: unknown };
    if (candidate.type !== "custom" || candidate.customType !== STATE_ENTRY_TYPE) continue;
    const data = candidate.data as { seenFailedHeads?: unknown } | undefined;
    if (!Array.isArray(data?.seenFailedHeads)) continue;
    for (const key of data.seenFailedHeads) {
      if (typeof key === "string") seenFailures.add(key);
    }
  }
}

export default function (pi: ExtensionAPI) {
  let timer: ReturnType<typeof setInterval> | undefined;
  let running = false;
  let sessionActive = false;
  let observationController: AbortController | undefined;
  const seenFailures = new Set<string>();

  const setStatus = (ctx: ExtensionContext, message: string) => {
    if (!sessionActive) return;
    ctx.ui.setStatus(STATUS_KEY, `VC PR CI watch: ${message}`);
  };

  const observe = async (ctx: ExtensionContext) => {
    if (!sessionActive || running) return;
    running = true;
    const controller = new AbortController();
    observationController = controller;
    try {
      const prs = await ghJson<PullRequest[]>(pi, [
        "pr",
        "list",
        "--repo",
        REPOSITORY,
        "--author",
        "@me",
        "--state",
        "open",
        "--json",
        "number",
        "--limit",
        String(MAX_OPEN_PULL_REQUESTS),
      ], controller.signal);
      if (!prs) {
        setStatus(ctx, "unable to read authenticated PRs; retrying");
        return;
      }
      if (prs.length === 0) {
        setStatus(ctx, "no open PRs authored by @me");
        return;
      }

      let failedCount = 0;
      let waitingCount = 0;
      for (const pr of prs) {
        if (!sessionActive) return;
        const payload = await ghJson<PullRequestChecks>(pi, [
          "pr",
          "view",
          String(pr.number),
          "--repo",
          REPOSITORY,
          "--json",
          "headRefOid,statusCheckRollup",
        ], controller.signal);
        if (!payload) {
          waitingCount += 1;
          continue;
        }

        const observation = observeChecks(payload);
        if (observation.kind === "unknown") {
          waitingCount += 1;
          continue;
        }
        if (observation.kind === "green") continue;

        failedCount += 1;
        const failureKey = `${pr.number}:${observation.headSha}`;
        if (seenFailures.has(failureKey)) continue;

        if (!sessionActive) return;
        seenFailures.add(failureKey);
        pi.appendEntry(STATE_ENTRY_TYPE, { seenFailedHeads: [...seenFailures].sort() });
        const failureNames = observation.failures
          .slice(0, MAX_FAILURE_NAMES_IN_MESSAGE)
          .map(encodeFailureName)
          .join("; ");
        const omittedFailureCount = observation.failures.length - MAX_FAILURE_NAMES_IN_MESSAGE;
        const failureSuffix = omittedFailureCount > 0 ? `; ${omittedFailureCount} additional failure name(s)` : "";
        pi.sendUserMessage(
          `[vc-ci-watch] Current-head CI failed on PR #${pr.number} (${observation.headSha.slice(0, 12)}). ` +
            `Untrusted failure names (Unicode code points): ${failureNames}${failureSuffix}. ` +
            `continue dev loop on PR ${pr.number}`,
          { deliverAs: "followUp" },
        );
      }

      if (failedCount > 0) {
        setStatus(ctx, `red current head detected on ${failedCount} PR${failedCount === 1 ? "" : "s"}`);
      } else if (waitingCount > 0) {
        setStatus(ctx, `watching ${prs.length} PR${prs.length === 1 ? "" : "s"}; ${waitingCount} pending/unknown`);
      } else {
        setStatus(ctx, `watching ${prs.length} PR${prs.length === 1 ? "" : "s"}; current heads green`);
      }
    } catch {
      setStatus(ctx, "watch error; retrying");
    } finally {
      if (observationController === controller) observationController = undefined;
      running = false;
    }
  };

  pi.on("session_start", async (_event, ctx) => {
    if (ctx.mode !== "tui" || !ctx.isProjectTrusted()) return;
    sessionActive = true;
    restoreSeenFailures(ctx, seenFailures);
    setStatus(ctx, "starting (5-minute interval)");
    void observe(ctx);
    timer = setInterval(() => void observe(ctx), WATCH_INTERVAL_MS);
  });

  pi.on("session_shutdown", (_event, ctx) => {
    if (!sessionActive) return;
    sessionActive = false;
    observationController?.abort();
    observationController = undefined;
    if (timer) clearInterval(timer);
    timer = undefined;
    ctx.ui.setStatus(STATUS_KEY, undefined);
  });
}
