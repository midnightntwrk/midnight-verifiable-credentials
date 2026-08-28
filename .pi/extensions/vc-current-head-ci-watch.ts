import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

import {
  confirmActionableFailure,
  confirmCurrentHeadFailure,
  enrichActionsRunAttempts,
  formatFailureNames,
  observeChecks,
  type ActionsJob,
  type PullRequestChecks,
} from "./vc-current-head-ci-watch/logic.ts";

const REPOSITORY = "midnightntwrk/midnight-verifiable-credentials";
const WATCH_INTERVAL_MS = 5 * 60 * 1000;
const STATUS_KEY = "vc-current-head-ci-watch";
const STATE_ENTRY_TYPE = "vc-current-head-ci-watch-state";
const MAX_OPEN_PULL_REQUESTS = 1_000;

type PullRequest = { number: number };

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

        const loadActionsJob = (jobId: string) => ghJson<ActionsJob>(pi, [
          "api",
          `repos/${REPOSITORY}/actions/jobs/${jobId}`,
        ], controller.signal);
        const enrichedPayload = await enrichActionsRunAttempts(payload, loadActionsJob);
        const observation = observeChecks(enrichedPayload);
        if (observation.kind === "unknown") {
          waitingCount += 1;
          continue;
        }
        if (observation.kind === "green") continue;

        // Re-read immediately before notifying. A delayed first rollup can
        // belong to a superseded head, and a duplicate/rerun may already have
        // made the initially observed failure non-actionable.
        const confirmationPayload = await ghJson<PullRequestChecks>(pi, [
          "pr",
          "view",
          String(pr.number),
          "--repo",
          REPOSITORY,
          "--json",
          "headRefOid,statusCheckRollup",
        ], controller.signal);
        if (!confirmationPayload) {
          waitingCount += 1;
          continue;
        }
        const confirmedChecks = await enrichActionsRunAttempts(confirmationPayload, loadActionsJob);
        const confirmation = confirmActionableFailure(observation, observeChecks(confirmedChecks));
        if (confirmation.kind !== "actionable") {
          if (confirmation.kind === "unknown") waitingCount += 1;
          continue;
        }

        const finalHead = await ghJson<{ headRefOid?: string | null }>(pi, [
          "pr",
          "view",
          String(pr.number),
          "--repo",
          REPOSITORY,
          "--json",
          "headRefOid",
        ], controller.signal);
        const finalConfirmation = confirmCurrentHeadFailure(
          observation,
          observeChecks(confirmedChecks),
          finalHead?.headRefOid,
        );
        if (finalConfirmation.kind !== "actionable") {
          waitingCount += 1;
          continue;
        }

        failedCount += 1;
        const failureKey = `${pr.number}:${finalConfirmation.headSha}`;
        if (seenFailures.has(failureKey)) continue;

        if (!sessionActive) return;
        seenFailures.add(failureKey);
        pi.appendEntry(STATE_ENTRY_TYPE, { seenFailedHeads: [...seenFailures].sort() });
        const failureNames = formatFailureNames(finalConfirmation.failures);
        pi.sendUserMessage(
          `[vc-ci-watch] Current-head CI failed on PR #${pr.number} (${finalConfirmation.headSha.slice(0, 12)}). ` +
            `Untrusted failure names (Unicode code points): ${failureNames}. ` +
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
