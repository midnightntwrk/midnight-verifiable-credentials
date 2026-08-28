import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

import {
  registerVcCurrentHeadCiWatch,
  type WatcherDependencies,
} from "../vc-current-head-ci-watch.ts";
import type { PullRequestChecks } from "./logic.ts";

const STATE_ENTRY_TYPE = "vc-current-head-ci-watch-state";
const OLD_HEAD = "a".repeat(40);
const CURRENT_HEAD = "b".repeat(40);
const NEW_HEAD = "c".repeat(40);

type ExecResult = { code: number; stdout: string };
type Handler = (event: unknown, ctx: ExtensionContext) => unknown;
type ExecPlan = (args: string[], signal: AbortSignal) => Promise<ExecResult>;

type FakeContextOptions = {
  branch?: unknown[];
  mode?: "json" | "print" | "rpc" | "tui";
  trusted?: boolean;
};

class ExtensionHarness {
  readonly appendEvents: Array<{ customType: string; data: unknown }> = [];
  readonly eventOrder: string[] = [];
  readonly execArgs: string[][] = [];
  readonly handlers = new Map<string, Handler>();
  readonly messages: string[] = [];
  readonly statusEvents: Array<[string, string | undefined]> = [];
  readonly timers: Array<{ active: boolean; handler: () => void; intervalMs: number }> = [];

  private readonly detached: Promise<void>[] = [];
  private readonly execPlans: ExecPlan[] = [];
  private appendFailure: ((data: unknown) => boolean) | undefined;
  private sendFailuresRemaining = 0;

  readonly pi = {
    appendEntry: (customType: string, data: unknown) => {
      this.eventOrder.push(`append:${JSON.stringify(data)}`);
      if (this.appendFailure?.(data)) throw new Error("append failed");
      this.appendEvents.push({ customType, data });
    },
    exec: async (_command: string, args: string[], options: { signal: AbortSignal }) => {
      this.execArgs.push(args);
      const plan = this.execPlans.shift();
      if (!plan) throw new Error(`unexpected exec: ${args.join(" ")}`);
      return plan(args, options.signal);
    },
    on: (event: string, handler: Handler) => this.handlers.set(event, handler),
    sendUserMessage: (message: string) => {
      this.eventOrder.push("send");
      if (this.sendFailuresRemaining > 0) {
        this.sendFailuresRemaining -= 1;
        throw new Error("delivery failed");
      }
      this.messages.push(message);
    },
  } as unknown as ExtensionAPI;

  readonly dependencies: WatcherDependencies = {
    clearInterval: (handle) => {
      (handle as { active: boolean }).active = false;
    },
    createAbortController: () => new AbortController(),
    runDetached: (task) => {
      this.detached.push(task);
    },
    setInterval: (handler, intervalMs) => {
      const timer = { active: true, handler, intervalMs };
      this.timers.push(timer);
      return timer;
    },
  };

  constructor() {
    registerVcCurrentHeadCiWatch(this.pi, this.dependencies);
  }

  context(options: FakeContextOptions = {}): ExtensionContext {
    const branch = options.branch ?? [];
    return {
      isProjectTrusted: () => options.trusted ?? true,
      mode: options.mode ?? "tui",
      sessionManager: { getBranch: () => branch },
      ui: {
        setStatus: (key: string, message: string | undefined) => {
          this.statusEvents.push([key, message]);
        },
      },
    } as unknown as ExtensionContext;
  }

  failAppendWhen(predicate: (data: unknown) => boolean): void {
    this.appendFailure = predicate;
  }

  failNextSend(): void {
    this.sendFailuresRemaining += 1;
  }

  queueJson(payload: unknown): void {
    this.execPlans.push(async () => ({ code: 0, stdout: JSON.stringify(payload) }));
  }

  queuePlan(plan: ExecPlan): void {
    this.execPlans.push(plan);
  }

  async drain(): Promise<void> {
    while (this.detached.length > 0) {
      const pending = this.detached.splice(0);
      await Promise.all(pending);
    }
  }

  async start(ctx: ExtensionContext): Promise<void> {
    await this.handlers.get("session_start")?.({}, ctx);
    await this.drain();
  }

  async tick(): Promise<void> {
    const timer = this.timers.at(-1);
    assert.equal(timer?.active, true);
    timer!.handler();
    await this.drain();
  }

  async shutdown(ctx: ExtensionContext): Promise<void> {
    await this.handlers.get("session_shutdown")?.({}, ctx);
  }
}

function stateEntry(seenFailedHeads: unknown): unknown {
  return {
    type: "custom",
    customType: STATE_ENTRY_TYPE,
    data: { seenFailedHeads },
  };
}

function failurePayload(headSha = CURRENT_HEAD, name = "build"): PullRequestChecks {
  return {
    headRefOid: headSha,
    statusCheckRollup: [{ name, status: "COMPLETED", conclusion: "FAILURE" }],
  };
}

function successPayload(headSha = CURRENT_HEAD): PullRequestChecks {
  return {
    headRefOid: headSha,
    statusCheckRollup: [{ name: "build", status: "COMPLETED", conclusion: "SUCCESS" }],
  };
}

function queueOpenPr(harness: ExtensionHarness): void {
  harness.queueJson([{ number: 483 }]);
}

function queueFailureCycle(
  harness: ExtensionHarness,
  initial = failurePayload(),
  confirmation = initial,
  finalHeadSha = confirmation.headRefOid,
): void {
  queueOpenPr(harness);
  harness.queueJson(initial);
  harness.queueJson(confirmation);
  harness.queueJson({ headRefOid: finalHeadSha });
}

function persistedKeys(harness: ExtensionHarness): unknown[] {
  return harness.appendEvents.map((entry) =>
    (entry.data as { seenFailedHeads?: unknown }).seenFailedHeads,
  );
}

describe("vc-current-head-ci-watch extension handlers", () => {
  it("restores only the newest bounded snapshot, retries malformed state, and compacts legacy keys", async () => {
    const activeKey = `483:${CURRENT_HEAD}`;
    const branch = [
      stateEntry([activeKey]),
      { type: "message" },
      stateEntry("malformed"),
    ];
    const harness = new ExtensionHarness();
    const ctx = harness.context({ branch });

    queueOpenPr(harness);
    harness.queueJson(failurePayload());
    await harness.start(ctx);
    assert.deepEqual(harness.appendEvents, []);
    assert.match(harness.statusEvents.at(-1)?.[1] ?? "", /newest saved state is malformed; retrying/u);

    branch[2] = stateEntry([`999:${OLD_HEAD}`, activeKey]);
    queueFailureCycle(harness);
    await harness.tick();

    assert.deepEqual(persistedKeys(harness), [[activeKey]]);
    assert.equal(harness.messages.length, 0, "restored active failures remain deduplicated");
  });

  it("fails closed on oversized newest state and on a relevant snapshot outside the branch scan bound", async () => {
    for (const branch of [
      [stateEntry(Array.from({ length: 1_001 }, (_, index) => `${index + 1}:${OLD_HEAD}`))],
      [stateEntry([`483:${CURRENT_HEAD}`]), ...Array.from({ length: 1_000 }, () => ({ type: "message" }))],
    ]) {
      const harness = new ExtensionHarness();
      queueOpenPr(harness);
      harness.queueJson(successPayload());
      await harness.start(harness.context({ branch }));
      assert.equal(harness.appendEvents.length, 0);
      assert.match(harness.statusEvents.at(-1)?.[1] ?? "", /bound/u);
    }
  });

  it("performs exactly three ordered PR reads and rejects a final head movement", async () => {
    const harness = new ExtensionHarness();
    const ctx = harness.context();
    queueFailureCycle(
      harness,
      failurePayload(OLD_HEAD, "old-build"),
      failurePayload(CURRENT_HEAD, "new-build"),
      NEW_HEAD,
    );
    await harness.start(ctx);

    const prReads = harness.execArgs.filter((args) => args[0] === "pr" && args[1] === "view");
    assert.equal(prReads.length, 3);
    assert.deepEqual(prReads.map((args) => args.at(-1)), [
      "headRefOid,statusCheckRollup",
      "headRefOid,statusCheckRollup",
      "headRefOid",
    ]);
    assert.equal(harness.messages.length, 0);
  });

  it("handles duplicate cancellation/success and rerun enrichment without notifying", async () => {
    for (const payload of [
      {
        headRefOid: CURRENT_HEAD,
        statusCheckRollup: [
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/1",
            status: "COMPLETED",
            conclusion: "CANCELLED",
          },
          {
            name: "scan",
            workflowName: "PR scan",
            detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/2",
            status: "COMPLETED",
            conclusion: "SUCCESS",
          },
        ],
      },
      {
        headRefOid: CURRENT_HEAD,
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
      },
    ] satisfies PullRequestChecks[]) {
      const harness = new ExtensionHarness();
      queueOpenPr(harness);
      harness.queueJson(payload);
      for (const [id, attempt] of [[1, 1], [2, 2]] as const) {
        harness.queueJson({
          head_sha: CURRENT_HEAD,
          id,
          name: "scan",
          run_attempt: attempt,
          run_id: 42,
          run_url: "https://api.github.com/repos/midnightntwrk/midnight-verifiable-credentials/actions/runs/42",
          url: `https://api.github.com/repos/midnightntwrk/midnight-verifiable-credentials/actions/jobs/${id}`,
          workflow_name: "PR scan",
        });
      }
      await harness.start(harness.context());
      assert.equal(harness.messages.length, 0);
      assert.equal(harness.execArgs.filter((args) => args[0] === "api").length, 2);
    }
  });

  it("suppresses a cross-run cancellation only after both fixed-repository jobs verify", async () => {
    const harness = new ExtensionHarness();
    queueOpenPr(harness);
    harness.queueJson({
      headRefOid: CURRENT_HEAD,
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
          detailsUrl: "https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/42/job/2",
          status: "COMPLETED",
          conclusion: "SUCCESS",
          startedAt: "2026-08-24T10:05:00.000Z",
        },
      ],
    });
    for (const [id, runId] of [[1, 41], [2, 42]] as const) {
      harness.queueJson({
        head_sha: CURRENT_HEAD,
        id,
        name: "scan",
        run_attempt: 1,
        run_id: runId,
        run_url: `https://api.github.com/repos/midnightntwrk/midnight-verifiable-credentials/actions/runs/${runId}`,
        url: `https://api.github.com/repos/midnightntwrk/midnight-verifiable-credentials/actions/jobs/${id}`,
        workflow_name: "Scan",
      });
    }

    await harness.start(harness.context());
    assert.equal(harness.messages.length, 0);
    assert.equal(harness.execArgs.filter((args) => args[0] === "api").length, 2);
  });

  it("deduplicates, preserves neutral state, clears on success, and alerts after refailure", async () => {
    const harness = new ExtensionHarness();
    const ctx = harness.context();
    queueFailureCycle(harness);
    await harness.start(ctx);
    assert.equal(harness.messages.length, 1);

    queueFailureCycle(harness);
    await harness.tick();
    assert.equal(harness.messages.length, 1, "same active head is deduplicated");

    queueOpenPr(harness);
    harness.queueJson({
      headRefOid: CURRENT_HEAD,
      statusCheckRollup: [{ name: "build", status: "COMPLETED", conclusion: "NEUTRAL" }],
    });
    await harness.tick();
    assert.deepEqual(persistedKeys(harness).at(-1), [`483:${CURRENT_HEAD}`]);

    queueOpenPr(harness);
    harness.queueJson(successPayload());
    await harness.tick();
    assert.deepEqual(persistedKeys(harness).at(-1), []);

    queueFailureCycle(harness);
    await harness.tick();
    assert.equal(harness.messages.length, 2);
  });

  it("delivers before persistence and retries after delivery or persistence failure", async () => {
    for (const failureKind of ["delivery", "persistence"] as const) {
      const harness = new ExtensionHarness();
      const ctx = harness.context();
      if (failureKind === "delivery") harness.failNextSend();
      else {
        harness.failAppendWhen((data) =>
          (data as { seenFailedHeads?: unknown[] }).seenFailedHeads?.length === 1,
        );
      }

      queueFailureCycle(harness);
      await harness.start(ctx);
      assert.deepEqual(persistedKeys(harness), [[]]);

      harness.failAppendWhen(() => false);
      queueFailureCycle(harness);
      await harness.tick();
      assert.deepEqual(persistedKeys(harness).at(-1), [`483:${CURRENT_HEAD}`]);
      assert.equal(harness.messages.length, failureKind === "delivery" ? 1 : 2);

      const finalSend = harness.eventOrder.lastIndexOf("send");
      const finalAppend = harness.eventOrder.length - 1;
      assert.ok(finalSend >= 0 && finalSend < finalAppend);
    }
  });

  it("bounds Actions metadata lookups and leaves unverifiable cross-run cancellation actionable", async () => {
    const checks = Array.from({ length: 101 }, (_, index) => ({
      name: "scan",
      workflowName: "Scan",
      detailsUrl: `https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/${index + 1}/job/${index + 1}`,
      status: "COMPLETED",
      conclusion: index === 0 ? "CANCELLED" : "SUCCESS",
      startedAt: new Date(Date.UTC(2026, 7, 24, 10, index)).toISOString(),
    }));
    const payload = { headRefOid: CURRENT_HEAD, statusCheckRollup: checks };
    const harness = new ExtensionHarness();
    queueFailureCycle(harness, payload, payload);
    await harness.start(harness.context());

    assert.equal(harness.execArgs.some((args) => args[0] === "api"), false);
    assert.equal(harness.messages.length, 1);
  });

  it("aborts an in-flight observation and clears timers/status on shutdown", async () => {
    const harness = new ExtensionHarness();
    const ctx = harness.context();
    let observedSignal: AbortSignal | undefined;
    harness.queuePlan(async (_args, signal) => {
      observedSignal = signal;
      return new Promise((resolve) => {
        signal.addEventListener("abort", () => resolve({ code: 1, stdout: "" }), { once: true });
      });
    });

    await harness.handlers.get("session_start")?.({}, ctx);
    assert.equal(harness.timers[0]?.active, true);
    await harness.shutdown(ctx);
    await harness.drain();

    assert.equal(observedSignal?.aborted, true);
    assert.equal(harness.timers[0]?.active, false);
    assert.deepEqual(harness.statusEvents.at(-1), ["vc-current-head-ci-watch", undefined]);
    assert.equal(harness.messages.length, 0);
  });

  it("does not start for untrusted projects or non-TUI modes", async () => {
    for (const options of [{ trusted: false }, { mode: "json" as const }]) {
      const harness = new ExtensionHarness();
      await harness.start(harness.context(options));
      assert.equal(harness.execArgs.length, 0);
      assert.equal(harness.timers.length, 0);
      assert.equal(harness.statusEvents.length, 0);
    }
  });
});
