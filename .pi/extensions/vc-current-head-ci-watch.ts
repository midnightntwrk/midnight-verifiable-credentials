import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

import {
  confirmActionableFailure,
  confirmCurrentHeadFailure,
  enrichActionsRunAttempts,
  formatFailureNames,
  observeChecks,
  pruneSeenFailureKeys,
  pruneSeenFailureKeysForOpenPullRequests,
  reconcileRestoredFailureKeys,
  updateSeenFailureKeys,
  type ActionsJob,
  type PullRequestChecks,
} from "./vc-current-head-ci-watch/logic.ts";

const REPOSITORY = "midnightntwrk/midnight-verifiable-credentials";
const WATCH_INTERVAL_MS = 5 * 60 * 1000;
const STATUS_KEY = "vc-current-head-ci-watch";
const STATE_ENTRY_TYPE = "vc-current-head-ci-watch-state";
const MAX_OPEN_PULL_REQUESTS = 100;
const MAX_ACTIONS_JOB_LOOKUPS_PER_OBSERVATION = 100;
const MAX_SEEN_FAILURE_KEYS = MAX_OPEN_PULL_REQUESTS;
const MAX_RESTORE_BRANCH_ENTRIES = 1_000;
const MAX_RAW_RESTORED_FAILURE_KEYS = 1_000;

type PullRequest = { number: number };
type IntervalHandle = unknown;

export type WatcherDependencies = {
  clearInterval: (handle: IntervalHandle) => void;
  createAbortController: () => AbortController;
  runDetached: (task: Promise<void>) => void;
  setInterval: (handler: () => void, intervalMs: number) => IntervalHandle;
};

const DEFAULT_DEPENDENCIES: WatcherDependencies = {
  clearInterval: (handle) => clearInterval(handle as ReturnType<typeof setInterval>),
  createAbortController: () => new AbortController(),
  runDetached: (task) => void task,
  setInterval: (handler, intervalMs) => setInterval(handler, intervalMs),
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

function newestRestoredFailureSnapshot(ctx: ExtensionContext):
  | { kind: "found"; snapshot: unknown }
  | { kind: "invalid"; reason: string }
  | { kind: "none" } {
  const branch = ctx.sessionManager.getBranch();
  const firstIndex = Math.max(0, branch.length - MAX_RESTORE_BRANCH_ENTRIES);
  for (let index = branch.length - 1; index >= firstIndex; index -= 1) {
    const candidate = branch[index] as unknown as {
      customType?: unknown;
      data?: unknown;
      type?: unknown;
    };
    if (candidate.type !== "custom" || candidate.customType !== STATE_ENTRY_TYPE) continue;
    const data = candidate.data as { seenFailedHeads?: unknown } | undefined;
    const snapshot = data?.seenFailedHeads;
    if (!Array.isArray(snapshot)) return { kind: "invalid", reason: "newest saved state is malformed" };
    if (snapshot.length > MAX_RAW_RESTORED_FAILURE_KEYS) {
      return { kind: "invalid", reason: "newest saved state exceeds the raw key bound" };
    }
    return { kind: "found", snapshot };
  }
  return branch.length > MAX_RESTORE_BRANCH_ENTRIES
    ? { kind: "invalid", reason: "newest saved state is outside the branch scan bound" }
    : { kind: "none" };
}

export function registerVcCurrentHeadCiWatch(
  pi: ExtensionAPI,
  dependencies: Partial<WatcherDependencies> = {},
) {
  const deps: WatcherDependencies = { ...DEFAULT_DEPENDENCIES, ...dependencies };
  let timer: IntervalHandle | undefined;
  let running = false;
  let sessionActive = false;
  let restorePending = true;
  let observationController: AbortController | undefined;
  const seenFailures = new Set<string>();

  const setStatus = (ctx: ExtensionContext, message: string) => {
    if (!sessionActive) return;
    ctx.ui.setStatus(STATUS_KEY, `VC PR CI watch: ${message}`);
  };

  const persistSeenFailures = (next: string[], force = false): boolean => {
    if (next.length > MAX_SEEN_FAILURE_KEYS) {
      throw new RangeError(`seen failure state exceeds the ${MAX_SEEN_FAILURE_KEYS} key bound`);
    }
    if (!force && next.length === seenFailures.size && next.every((key) => seenFailures.has(key))) return false;
    // Persist before mutating in-memory dedupe state. A failed append must not
    // make a later notification look delivered or durably recorded.
    pi.appendEntry(STATE_ENTRY_TYPE, { seenFailedHeads: next });
    seenFailures.clear();
    for (const key of next) seenFailures.add(key);
    return true;
  };

  const setFailureActive = (failureKey: string, active: boolean): boolean =>
    persistSeenFailures(updateSeenFailureKeys(seenFailures, failureKey, active));

  const pruneStaleFailures = (prNumber: number, currentHeadSha: string): void => {
    persistSeenFailures(pruneSeenFailureKeys(seenFailures, prNumber, currentHeadSha));
  };

  const observe = async (ctx: ExtensionContext) => {
    if (!sessionActive || running) return;
    running = true;
    const controller = deps.createAbortController();
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
        persistSeenFailures([], restorePending);
        restorePending = false;
        setStatus(ctx, "no open PRs authored by @me");
        return;
      }

      const initialPayloads = new Map<number, PullRequestChecks>();
      if (restorePending) {
        const currentFailureKeys: string[] = [];
        for (const pr of prs) {
          const payload = await ghJson<PullRequestChecks>(pi, [
            "pr",
            "view",
            String(pr.number),
            "--repo",
            REPOSITORY,
            "--json",
            "headRefOid,statusCheckRollup",
          ], controller.signal);
          const headSha = payload?.headRefOid?.trim();
          if (!payload || !headSha || !/^[0-9a-f]{40}$/iu.test(headSha)) {
            setStatus(ctx, "unable to reconcile saved failures with exact current heads; retrying");
            return;
          }
          initialPayloads.set(pr.number, payload);
          currentFailureKeys.push(`${pr.number}:${headSha}`);
        }

        const restored = newestRestoredFailureSnapshot(ctx);
        if (restored.kind === "invalid") {
          setStatus(ctx, `${restored.reason}; retrying`);
          return;
        }
        try {
          persistSeenFailures(
            reconcileRestoredFailureKeys(
              restored.kind === "found" ? restored.snapshot : [],
              currentFailureKeys,
              MAX_SEEN_FAILURE_KEYS,
            ),
            true,
          );
          restorePending = false;
        } catch {
          setStatus(ctx, "newest saved state contains malformed failure keys; retrying");
          return;
        }
      }

      persistSeenFailures(
        pruneSeenFailureKeysForOpenPullRequests(seenFailures, prs.map((pr) => pr.number)),
      );

      let failedCount = 0;
      let waitingCount = 0;
      let remainingActionsJobLookups = MAX_ACTIONS_JOB_LOOKUPS_PER_OBSERVATION;
      const actionsJobCache = new Map<string, Promise<ActionsJob | undefined>>();
      const loadActionsJob = (jobId: string): Promise<ActionsJob | undefined> => {
        const cached = actionsJobCache.get(jobId);
        if (cached) return cached;
        if (remainingActionsJobLookups < 1) return Promise.resolve(undefined);
        remainingActionsJobLookups -= 1;
        const request = ghJson<ActionsJob>(pi, [
          "api",
          `repos/${REPOSITORY}/actions/jobs/${jobId}`,
        ], controller.signal);
        actionsJobCache.set(jobId, request);
        return request;
      };

      for (const pr of prs) {
        if (!sessionActive) return;
        const payload = initialPayloads.get(pr.number) ?? await ghJson<PullRequestChecks>(pi, [
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
        const observedHead = payload.headRefOid?.trim();
        if (observedHead) pruneStaleFailures(pr.number, observedHead);

        const enrichedPayload = await enrichActionsRunAttempts(payload, loadActionsJob);
        const observation = observeChecks(enrichedPayload);
        if (observation.kind === "unknown") {
          waitingCount += 1;
          continue;
        }
        if (observation.kind === "green") {
          setFailureActive(`${pr.number}:${observation.headSha}`, false);
          continue;
        }

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
          else setFailureActive(`${pr.number}:${observation.headSha}`, false);
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

        if (!sessionActive) return;
        pruneStaleFailures(pr.number, finalConfirmation.headSha);
        const failureKey = `${pr.number}:${finalConfirmation.headSha}`;
        if (seenFailures.has(failureKey)) continue;
        const failureNames = formatFailureNames(finalConfirmation.failures);
        // Queue delivery before recording the key. If delivery fails, the key
        // remains unseen; if persistence then fails, in-memory state also
        // remains unseen and a later observation safely retries the prompt.
        pi.sendUserMessage(
          `[vc-ci-watch] Current-head CI failed on PR #${pr.number} (${finalConfirmation.headSha.slice(0, 12)}). ` +
            `Untrusted failure names (Unicode code points): ${failureNames}. ` +
            `continue dev loop on PR ${pr.number}`,
          { deliverAs: "followUp" },
        );
        setFailureActive(failureKey, true);
        failedCount += 1;
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
    setStatus(ctx, "starting (5-minute interval)");
    deps.runDetached(observe(ctx));
    timer = deps.setInterval(() => deps.runDetached(observe(ctx)), WATCH_INTERVAL_MS);
  });

  pi.on("session_shutdown", (_event, ctx) => {
    if (!sessionActive) return;
    sessionActive = false;
    observationController?.abort();
    observationController = undefined;
    if (timer) deps.clearInterval(timer);
    timer = undefined;
    ctx.ui.setStatus(STATUS_KEY, undefined);
  });
}

export default function (pi: ExtensionAPI) {
  registerVcCurrentHeadCiWatch(pi);
}
