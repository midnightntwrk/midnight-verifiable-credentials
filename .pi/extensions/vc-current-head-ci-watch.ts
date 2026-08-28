import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

import {
  confirmActionableFailure,
  confirmCurrentHeadFailure,
  enrichActionsRunAttempts,
  observeChecks,
  pruneSeenFailureKeys,
  pruneSeenFailureKeysForOpenPullRequests,
  reconcileRestoredFailureKeys,
  type ActionsJob,
  type PullRequestChecks,
} from "./vc-current-head-ci-watch/logic.ts";

const REPOSITORY = "midnightntwrk/midnight-verifiable-credentials";
const WATCH_INTERVAL_MS = 5 * 60 * 1000;
const STATUS_KEY = "vc-current-head-ci-watch";
const STATE_ENTRY_TYPE = "vc-current-head-ci-watch-state";
const MAX_OPEN_PULL_REQUESTS = 100;
const MAX_ACTIONS_JOB_LOOKUPS_PER_OBSERVATION = 100;
const MAX_FAILURE_KEYS = MAX_OPEN_PULL_REQUESTS;
const MAX_RESTORE_BRANCH_ENTRIES = 1_000;
const MAX_RAW_RESTORED_FAILURE_KEYS = 1_000;
const MAX_NOTIFICATION_SEND_ATTEMPTS_PER_SESSION = 3;
const FAILURE_KEY_PATTERN = /^(\d+):([0-9a-f]{40})$/iu;

type PullRequest = { number: number };
type IntervalHandle = unknown;
type PendingNotification = {
  failureKey: string;
  markerOccurrencesBeforeSend: number;
};

type RestoredWatcherState = {
  pendingNotifications: unknown;
  seenFailedHeads: unknown;
};

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

function newestRestoredWatcherState(ctx: ExtensionContext):
  | { kind: "found"; snapshot: RestoredWatcherState }
  | { kind: "invalid"; reason: string }
  | { kind: "none" }
  | { kind: "outside_tail" } {
  const branch = ctx.sessionManager.getBranch();
  const firstIndex = Math.max(0, branch.length - MAX_RESTORE_BRANCH_ENTRIES);
  for (let index = branch.length - 1; index >= firstIndex; index -= 1) {
    const candidate = branch[index] as unknown as {
      customType?: unknown;
      data?: unknown;
      type?: unknown;
    };
    if (candidate.type !== "custom" || candidate.customType !== STATE_ENTRY_TYPE) continue;
    const data = candidate.data as {
      pendingFailedHeads?: unknown;
      pendingNotifications?: unknown;
      seenFailedHeads?: unknown;
    } | undefined;
    if (!Array.isArray(data?.seenFailedHeads)) {
      return { kind: "invalid", reason: "newest saved state is malformed" };
    }
    const hasPendingNotifications = Object.hasOwn(data, "pendingNotifications");
    const pendingNotifications = hasPendingNotifications
      ? data.pendingNotifications
      : Array.isArray(data.pendingFailedHeads)
        ? data.pendingFailedHeads.map((failureKey) => ({ failureKey, markerOccurrencesBeforeSend: 0 }))
        : [];
    if (!Array.isArray(pendingNotifications)) {
      return { kind: "invalid", reason: "newest saved outbox is malformed" };
    }
    if (
      data.seenFailedHeads.length > MAX_RAW_RESTORED_FAILURE_KEYS ||
      pendingNotifications.length > MAX_RAW_RESTORED_FAILURE_KEYS
    ) {
      return { kind: "invalid", reason: "newest saved state exceeds the raw key bound" };
    }
    return {
      kind: "found",
      snapshot: { seenFailedHeads: data.seenFailedHeads, pendingNotifications },
    };
  }
  return branch.length > MAX_RESTORE_BRANCH_ENTRIES ? { kind: "outside_tail" } : { kind: "none" };
}

function watcherMessageForFailure(failureKey: string): string | undefined {
  const match = failureKey.match(FAILURE_KEY_PATTERN);
  if (!match) return undefined;
  const prNumber = Number(match[1]);
  const expectedHeadSha = match[2]!.toLowerCase();
  if (!Number.isSafeInteger(prNumber) || prNumber < 1) return undefined;
  return (
    `[vc-ci-watch pr=${prNumber} head=${expectedHeadSha}] ` +
    `Current-head CI failed on PR #${prNumber}. ` +
    `Before taking any action, confirm from the canonical pull request that PR #${prNumber} ` +
    `still has the exact expected head SHA ${expectedHeadSha}; stop if it differs. ` +
    `Continue dev loop on PR ${prNumber}.`
  );
}

function exactUserMessage(entry: unknown): string | undefined {
  const candidate = entry as {
    message?: { content?: unknown; role?: unknown };
    type?: unknown;
  };
  if (candidate.type !== "message" || candidate.message?.role !== "user") return undefined;
  const content = candidate.message.content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content) || content.length !== 1) return undefined;
  const block = content[0] as { text?: unknown; type?: unknown };
  return block.type === "text" && typeof block.text === "string" ? block.text : undefined;
}

function branchWatcherMessageCount(ctx: ExtensionContext, failureKey: string): number {
  const expectedMessage = watcherMessageForFailure(failureKey);
  if (!expectedMessage) return 0;
  const branch = ctx.sessionManager.getBranch();
  const firstIndex = Math.max(0, branch.length - MAX_RESTORE_BRANCH_ENTRIES);
  let count = 0;
  for (let index = branch.length - 1; index >= firstIndex; index -= 1) {
    if (exactUserMessage(branch[index]) === expectedMessage) count += 1;
  }
  return count;
}

function reconcileRestoredPendingNotifications(
  snapshot: unknown,
  currentFailureKeys: Iterable<string>,
): PendingNotification[] {
  if (!Array.isArray(snapshot)) throw new TypeError("restored outbox is malformed");
  const current = new Set(currentFailureKeys);
  const restored = new Map<string, number>();
  for (const item of snapshot) {
    const candidate = item as Partial<PendingNotification>;
    if (
      typeof candidate.failureKey !== "string" ||
      !FAILURE_KEY_PATTERN.test(candidate.failureKey) ||
      !Number.isInteger(candidate.markerOccurrencesBeforeSend) ||
      candidate.markerOccurrencesBeforeSend! < 0 ||
      candidate.markerOccurrencesBeforeSend! > MAX_RESTORE_BRANCH_ENTRIES
    ) {
      throw new TypeError("restored outbox is malformed");
    }
    if (current.has(candidate.failureKey)) {
      restored.set(candidate.failureKey, candidate.markerOccurrencesBeforeSend!);
    }
  }
  return [...restored.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([failureKey, markerOccurrencesBeforeSend]) => ({
      failureKey,
      markerOccurrencesBeforeSend,
    }));
}

export function registerVcCurrentHeadCiWatch(
  pi: ExtensionAPI,
  dependencies: Partial<WatcherDependencies> = {},
) {
  const deps: WatcherDependencies = { ...DEFAULT_DEPENDENCIES, ...dependencies };
  let timer: IntervalHandle | undefined;
  let runningGeneration: number | undefined;
  let sessionActive = false;
  let sessionGeneration = 0;
  let restorePending = true;
  let observationController: AbortController | undefined;
  const seenFailures = new Set<string>();
  const pendingFailures = new Map<string, number>();
  const sendAttempts = new Map<string, number>();

  const isCurrentSession = (generation: number): boolean =>
    sessionActive && generation === sessionGeneration;

  const setStatus = (ctx: ExtensionContext, message: string) => {
    if (!sessionActive) return;
    ctx.ui.setStatus(STATUS_KEY, `VC PR CI watch: ${message}`);
  };

  const persistState = (
    nextSeen: string[],
    nextPending: PendingNotification[],
    force = false,
  ): boolean => {
    if (nextSeen.length > MAX_FAILURE_KEYS || nextPending.length > MAX_FAILURE_KEYS) {
      throw new RangeError(`watcher state exceeds the ${MAX_FAILURE_KEYS} key bound`);
    }
    const seenUnchanged = nextSeen.length === seenFailures.size &&
      nextSeen.every((key) => seenFailures.has(key));
    const pendingUnchanged = nextPending.length === pendingFailures.size &&
      nextPending.every((item) =>
        pendingFailures.get(item.failureKey) === item.markerOccurrencesBeforeSend);
    if (!force && seenUnchanged && pendingUnchanged) return false;

    // appendEntry is the only durable acknowledgement. Mutate memory only
    // after the complete seen+outbox snapshot is appended successfully.
    pi.appendEntry(STATE_ENTRY_TYPE, {
      version: 3,
      seenFailedHeads: nextSeen,
      pendingNotifications: nextPending,
    });
    seenFailures.clear();
    pendingFailures.clear();
    for (const key of nextSeen) seenFailures.add(key);
    for (const item of nextPending) {
      pendingFailures.set(item.failureKey, item.markerOccurrencesBeforeSend);
    }
    return true;
  };

  const pendingSnapshot = (): PendingNotification[] => [...pendingFailures.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([failureKey, markerOccurrencesBeforeSend]) => ({
      failureKey,
      markerOccurrencesBeforeSend,
    }));

  const clearFailure = (failureKey: string): boolean => persistState(
    [...seenFailures].filter((key) => key !== failureKey).sort(),
    pendingSnapshot().filter((item) => item.failureKey !== failureKey),
  );

  const addPendingFailure = (ctx: ExtensionContext, failureKey: string): boolean => persistState(
    [...seenFailures].sort(),
    [
      ...pendingSnapshot(),
      {
        failureKey,
        markerOccurrencesBeforeSend: branchWatcherMessageCount(ctx, failureKey),
      },
    ].sort((left, right) => left.failureKey.localeCompare(right.failureKey)),
  );

  const pruneStaleFailures = (prNumber: number, currentHeadSha: string): void => {
    const pendingKeys = pruneSeenFailureKeys(pendingFailures.keys(), prNumber, currentHeadSha);
    const retainedPending = new Set(pendingKeys);
    persistState(
      pruneSeenFailureKeys(seenFailures, prNumber, currentHeadSha),
      pendingSnapshot().filter((item) => retainedPending.has(item.failureKey)),
    );
  };

  const confirmPendingMarkers = (ctx: ExtensionContext): number => {
    const confirmed = pendingSnapshot().filter((item) =>
      branchWatcherMessageCount(ctx, item.failureKey) > item.markerOccurrencesBeforeSend);
    if (confirmed.length === 0) return 0;
    const confirmedKeys = confirmed.map((item) => item.failureKey);
    const confirmedSet = new Set(confirmedKeys);
    persistState(
      [...new Set([...seenFailures, ...confirmedKeys])].sort(),
      pendingSnapshot().filter((item) => !confirmedSet.has(item.failureKey)),
    );
    for (const key of confirmedKeys) sendAttempts.delete(key);
    return confirmed.length;
  };

  const observe = async (ctx: ExtensionContext, generation: number) => {
    if (!isCurrentSession(generation) || runningGeneration === generation) return;
    runningGeneration = generation;
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
      if (!isCurrentSession(generation)) return;
      if (!prs) {
        setStatus(ctx, "unable to read authenticated PRs; retrying");
        return;
      }
      const prNumbers = prs.map((pr) => pr.number);
      if (
        prs.length > MAX_OPEN_PULL_REQUESTS ||
        prNumbers.some((number) => !Number.isSafeInteger(number) || number < 1) ||
        new Set(prNumbers).size !== prNumbers.length
      ) {
        setStatus(ctx, "authenticated PR list is malformed or exceeds bounds; retrying");
        return;
      }
      if (prs.length === 0) {
        persistState([], [], restorePending);
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
          if (!isCurrentSession(generation)) return;
          const headSha = payload?.headRefOid?.trim();
          if (!payload || !headSha || !/^[0-9a-f]{40}$/iu.test(headSha)) {
            setStatus(ctx, "unable to reconcile saved failures with exact current heads; retrying");
            return;
          }
          initialPayloads.set(pr.number, payload);
          currentFailureKeys.push(`${pr.number}:${headSha.toLowerCase()}`);
        }

        const restored = newestRestoredWatcherState(ctx);
        if (restored.kind === "invalid") {
          setStatus(ctx, `${restored.reason}; retrying`);
          return;
        }
        try {
          if (restored.kind === "outside_tail") {
            // The prior acknowledgement state is unavailable inside the bounded
            // branch tail. Conservatively suppress each current PR/head until
            // a real green observation clears it, then allow a later failure.
            persistState([...currentFailureKeys].sort(), [], true);
          } else {
            const snapshot = restored.kind === "found"
              ? restored.snapshot
              : { seenFailedHeads: [], pendingNotifications: [] };
            persistState(
              reconcileRestoredFailureKeys(
                snapshot.seenFailedHeads,
                currentFailureKeys,
                MAX_FAILURE_KEYS,
              ),
              reconcileRestoredPendingNotifications(
                snapshot.pendingNotifications,
                currentFailureKeys,
              ),
              true,
            );
          }
          restorePending = false;
          confirmPendingMarkers(ctx);
        } catch {
          setStatus(ctx, "newest saved state contains malformed failure keys; retrying");
          return;
        }
      } else {
        confirmPendingMarkers(ctx);
      }

      const openPendingKeys = new Set(pruneSeenFailureKeysForOpenPullRequests(
        pendingFailures.keys(),
        prs.map((pr) => pr.number),
      ));
      persistState(
        pruneSeenFailureKeysForOpenPullRequests(seenFailures, prs.map((pr) => pr.number)),
        pendingSnapshot().filter((item) => openPendingKeys.has(item.failureKey)),
      );

      let failedCount = 0;
      let waitingCount = 0;
      const dispatchCandidates = new Map<string, {
        failures: string[];
        headSha: string;
        prNumber: number;
      }>();
      let remainingActionsJobLookups = MAX_ACTIONS_JOB_LOOKUPS_PER_OBSERVATION;
      let finalEnrichmentActive = false;
      let finalEnrichmentWithinBudget = true;
      const actionsJobCache = new Map<string, Promise<ActionsJob | undefined>>();
      const loadActionsJob = (jobId: string): Promise<ActionsJob | undefined> => {
        const cached = actionsJobCache.get(jobId);
        if (cached) return cached;
        if (remainingActionsJobLookups < 1) {
          if (finalEnrichmentActive) finalEnrichmentWithinBudget = false;
          return Promise.resolve(undefined);
        }
        remainingActionsJobLookups -= 1;
        const request = ghJson<ActionsJob>(pi, [
          "api",
          `repos/${REPOSITORY}/actions/jobs/${jobId}`,
        ], controller.signal);
        actionsJobCache.set(jobId, request);
        return request;
      };

      for (const pr of prs) {
        if (!isCurrentSession(generation)) return;
        const payload = initialPayloads.get(pr.number) ?? await ghJson<PullRequestChecks>(pi, [
          "pr",
          "view",
          String(pr.number),
          "--repo",
          REPOSITORY,
          "--json",
          "headRefOid,statusCheckRollup",
        ], controller.signal);
        if (!isCurrentSession(generation)) return;
        if (!payload) {
          waitingCount += 1;
          continue;
        }
        const observedHead = payload.headRefOid?.trim().toLowerCase();
        if (observedHead) pruneStaleFailures(pr.number, observedHead);

        const enrichedPayload = await enrichActionsRunAttempts(payload, loadActionsJob);
        if (!isCurrentSession(generation)) return;
        const observation = observeChecks(enrichedPayload);
        if (observation.kind === "unknown") {
          waitingCount += 1;
          continue;
        }
        if (observation.kind === "green") {
          clearFailure(`${pr.number}:${observation.headSha.toLowerCase()}`);
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
        if (!isCurrentSession(generation)) return;
        if (!confirmationPayload) {
          waitingCount += 1;
          continue;
        }
        const confirmedChecks = await enrichActionsRunAttempts(confirmationPayload, loadActionsJob);
        if (!isCurrentSession(generation)) return;
        const confirmation = confirmActionableFailure(observation, observeChecks(confirmedChecks));
        if (confirmation.kind !== "actionable") {
          if (confirmation.kind === "unknown") waitingCount += 1;
          else clearFailure(`${pr.number}:${observation.headSha.toLowerCase()}`);
          continue;
        }

        if (!/^[0-9a-f]{40}$/iu.test(confirmation.headSha)) {
          waitingCount += 1;
          continue;
        }

        pruneStaleFailures(pr.number, confirmation.headSha.toLowerCase());
        const failureKey = `${pr.number}:${confirmation.headSha.toLowerCase()}`;
        failedCount += 1;
        if (seenFailures.has(failureKey)) continue;

        // Every actionable red head enters the durable outbox, but one
        // observation may dispatch at most one model-triggering message.
        if (!pendingFailures.has(failureKey)) addPendingFailure(ctx, failureKey);
        confirmPendingMarkers(ctx);
        if (seenFailures.has(failureKey)) continue;
        if ((sendAttempts.get(failureKey) ?? 0) >= MAX_NOTIFICATION_SEND_ATTEMPTS_PER_SESSION) {
          continue;
        }
        dispatchCandidates.set(failureKey, {
          failures: confirmation.failures,
          headSha: confirmation.headSha,
          prNumber: pr.number,
        });
      }

      const selected = [...dispatchCandidates.entries()]
        .sort(([left], [right]) => left.localeCompare(right))[0];
      if (selected && isCurrentSession(generation)) {
        const [failureKey, candidate] = selected;
        // The final pre-send read includes the complete rollup and repeats
        // authoritative Actions enrichment. This is the dispatch boundary:
        // a same-head successful rerun suppresses the queued notification.
        const finalPayload = await ghJson<PullRequestChecks>(pi, [
          "pr",
          "view",
          String(candidate.prNumber),
          "--repo",
          REPOSITORY,
          "--json",
          "headRefOid,statusCheckRollup",
        ], controller.signal);
        if (!isCurrentSession(generation)) return;
        if (!finalPayload) {
          failedCount -= 1;
          waitingCount += 1;
        } else {
          finalEnrichmentActive = true;
          finalEnrichmentWithinBudget = true;
          const finalChecks = await enrichActionsRunAttempts(finalPayload, loadActionsJob);
          finalEnrichmentActive = false;
          if (!isCurrentSession(generation)) return;
          if (!finalEnrichmentWithinBudget) {
            failedCount -= 1;
            waitingCount += 1;
          } else {
            const finalConfirmation = confirmCurrentHeadFailure(
              { kind: "failed", failures: candidate.failures, headSha: candidate.headSha },
              observeChecks(finalChecks),
              finalChecks.headRefOid,
            );
            if (finalConfirmation.kind !== "actionable") {
              failedCount -= 1;
              waitingCount += 1;
              const finalHead = finalChecks.headRefOid?.trim().toLowerCase();
              if (finalHead && /^[0-9a-f]{40}$/iu.test(finalHead)) {
                pruneStaleFailures(candidate.prNumber, finalHead);
              }
              if (finalConfirmation.kind === "resolved") clearFailure(failureKey);
            } else if (/^[0-9a-f]{40}$/iu.test(finalConfirmation.headSha)) {
              const finalFailureKey = `${candidate.prNumber}:${finalConfirmation.headSha.toLowerCase()}`;
              if (finalFailureKey === failureKey && pendingFailures.has(failureKey)) {
                const attempts = sendAttempts.get(failureKey) ?? 0;
                const message = watcherMessageForFailure(failureKey);
                if (
                  attempts < MAX_NOTIFICATION_SEND_ATTEMPTS_PER_SESSION &&
                  message &&
                  isCurrentSession(generation)
                ) {
                  // The outbox append happened above. The void send is only
                  // acknowledged after its exact branch marker is observable.
                  sendAttempts.set(failureKey, attempts + 1);
                  pi.sendUserMessage(message, { deliverAs: "followUp" });
                  confirmPendingMarkers(ctx);
                }
              }
            } else {
              failedCount -= 1;
              waitingCount += 1;
            }
          }
        }
      }

      if (failedCount > 0) {
        setStatus(ctx, `red current head detected on ${failedCount} PR${failedCount === 1 ? "" : "s"}`);
      } else if (waitingCount > 0) {
        setStatus(ctx, `watching ${prs.length} PR${prs.length === 1 ? "" : "s"}; ${waitingCount} pending/unknown`);
      } else {
        setStatus(ctx, `watching ${prs.length} PR${prs.length === 1 ? "" : "s"}; current heads green`);
      }
    } catch {
      if (isCurrentSession(generation)) setStatus(ctx, "watch error; retrying");
    } finally {
      if (observationController === controller) observationController = undefined;
      if (runningGeneration === generation) runningGeneration = undefined;
    }
  };

  pi.on("message_end", (_event, ctx) => {
    if (!sessionActive) return;
    confirmPendingMarkers(ctx);
  });

  pi.on("session_start", async (_event, ctx) => {
    if (ctx.mode !== "tui" || !ctx.isProjectTrusted()) return;
    sessionGeneration += 1;
    const generation = sessionGeneration;
    sessionActive = true;
    restorePending = true;
    sendAttempts.clear();
    setStatus(ctx, "starting (5-minute interval)");
    deps.runDetached(observe(ctx, generation));
    timer = deps.setInterval(() => deps.runDetached(observe(ctx, generation)), WATCH_INTERVAL_MS);
  });

  pi.on("session_shutdown", (_event, ctx) => {
    if (!sessionActive) return;
    sessionActive = false;
    sessionGeneration += 1;
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
