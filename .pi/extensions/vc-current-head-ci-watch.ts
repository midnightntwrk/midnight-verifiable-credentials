import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

import {
  confirmActionableFailure,
  formatFailureNames,
  githubActionsJobReference,
  observeChecks,
  type PullRequestChecks,
  type StatusCheck,
} from "./vc-current-head-ci-watch/logic.ts";

const REPOSITORY = "midnightntwrk/midnight-verifiable-credentials";
const WATCH_INTERVAL_MS = 5 * 60 * 1000;
const STATUS_KEY = "vc-current-head-ci-watch";
const STATE_ENTRY_TYPE = "vc-current-head-ci-watch-state";
const MAX_OPEN_PULL_REQUESTS = 1_000;
const MAX_ACTIONS_JOB_LOOKUPS = 100;
const ACTIONS_JOB_LOOKUP_BATCH_SIZE = 10;

type PullRequest = { number: number };
type ActionsJob = {
  id?: number;
  run_attempt?: number;
  run_id?: number;
};

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

async function enrichActionsRunAttempts(
  pi: ExtensionAPI,
  payload: PullRequestChecks,
  signal: AbortSignal,
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

  const candidates = [...duplicateGroups.values()].filter((group) => group.length > 1).flat();
  const jobIds = [...new Set(candidates.map((candidate) => candidate.jobId))];
  if (jobIds.length === 0) return payload;
  if (jobIds.length > MAX_ACTIONS_JOB_LOOKUPS) return payload;

  const jobs = new Map<string, ActionsJob>();
  for (let index = 0; index < jobIds.length; index += ACTIONS_JOB_LOOKUP_BATCH_SIZE) {
    const batch = jobIds.slice(index, index + ACTIONS_JOB_LOOKUP_BATCH_SIZE);
    const results = await Promise.all(batch.map(async (jobId) => ({
      jobId,
      job: await ghJson<ActionsJob>(pi, [
        "api",
        `repos/${REPOSITORY}/actions/jobs/${jobId}`,
      ], signal),
    })));
    for (const { jobId, job } of results) {
      if (job) jobs.set(jobId, job);
    }
  }

  const references = new Map(candidates.map((candidate) => [candidate.check, candidate]));
  return {
    ...payload,
    statusCheckRollup: checks.map((check) => {
      const reference = references.get(check);
      if (!reference) return check;
      const job = jobs.get(reference.jobId);
      if (
        !job ||
        String(job.id) !== reference.jobId ||
        String(job.run_id) !== reference.runId ||
        !Number.isInteger(job.run_attempt) ||
        job.run_attempt! < 1
      ) return check;
      return {
        ...check,
        actionsRunId: reference.runId,
        actionsRunAttempt: job.run_attempt,
      };
    }),
  };
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

        const enrichedPayload = await enrichActionsRunAttempts(pi, payload, controller.signal);
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
        const confirmedChecks = await enrichActionsRunAttempts(pi, confirmationPayload, controller.signal);
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
        if (finalHead?.headRefOid?.trim() !== confirmation.headSha) {
          waitingCount += 1;
          continue;
        }

        failedCount += 1;
        const failureKey = `${pr.number}:${confirmation.headSha}`;
        if (seenFailures.has(failureKey)) continue;

        if (!sessionActive) return;
        seenFailures.add(failureKey);
        pi.appendEntry(STATE_ENTRY_TYPE, { seenFailedHeads: [...seenFailures].sort() });
        const failureNames = formatFailureNames(confirmation.failures);
        pi.sendUserMessage(
          `[vc-ci-watch] Current-head CI failed on PR #${pr.number} (${confirmation.headSha.slice(0, 12)}). ` +
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
