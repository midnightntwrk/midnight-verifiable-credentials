import { Buffer } from "node:buffer";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deserialize, serialize } from "node:v8";

import { describe, expect, it } from "vitest";

import { FileSystemProtocolStateByteStore } from "../../adapters/file-protocol-state-store.js";
import { createStableJsonProtocolStateStore } from "../../adapters/json-protocol-state-codec.js";
import {
  atomicallyTransitionProtocolSession,
  cancelProtocolSession,
  claimProtocolResultOnce,
  claimRetainedProtocolStateAtMostOnce,
  createCodecBackedProtocolStateStore,
  InMemoryProtocolStateByteStore,
  InMemoryProtocolStateStore,
  type ProtocolResultClaim,
  type ProtocolStateCodecResolver,
  type ProtocolStateCollection,
  type ProtocolTerminalSession,
  pruneExpiredRetainedProtocolState,
  readRetainedProtocolState,
  recoverAppendOnlyOrdinalCount,
  type RetainedProtocolState,
  writeRetainedProtocolState,
} from "../../agents/protocol-state-store.js";

const v8CodecResolver: ProtocolStateCodecResolver = {
  getCodec<T>() {
    return {
      encode: (value: T) => serialize(value),
      decode: (encodedValue: Uint8Array) =>
        deserialize(Buffer.from(encodedValue)) as T,
    };
  },
};

describe("ProtocolStateStore terminal-session contract", () => {
  it("allows exactly one terminal transition and makes cancellation deterministic", () => {
    const store = new InMemoryProtocolStateStore();
    const sessions = store.collection<ProtocolTerminalSession<string>>(
      "test:sessions",
    );

    expect(
      atomicallyTransitionProtocolSession(
        sessions,
        "session-1",
        { state: "finalized", result: "approved", finalizedAtMs: 10n },
        "test:sessions",
      ),
    ).toEqual({
      status: "committed",
      session: { state: "finalized", result: "approved", finalizedAtMs: 10n },
    });
    expect(
      cancelProtocolSession(sessions, "session-1", "caller-aborted", 11n),
    ).toEqual({
      status: "already-terminal",
      session: { state: "finalized", result: "approved", finalizedAtMs: 10n },
    });
    expect(
      atomicallyTransitionProtocolSession(sessions, "session-1", {
        state: "finalized",
        result: "different",
        finalizedAtMs: 12n,
      }),
    ).toEqual({
      status: "already-terminal",
      session: { state: "finalized", result: "approved", finalizedAtMs: 10n },
    });
  });

  it("claims a finalized result once, including retries by the same consumer", () => {
    const store = new InMemoryProtocolStateStore();
    const outcomes = store.collection<RetainedProtocolState<string>>(
      "test:outcomes",
    );
    const claims = store.collection<ProtocolResultClaim>("test:claims");
    writeRetainedProtocolState(outcomes, "session-1", "approved", 100n, {});

    expect(
      claimRetainedProtocolStateAtMostOnce(
        outcomes,
        claims,
        "session-1",
        100n,
        "consumer-a",
        "test:claims",
      ),
    ).toBe("approved");
    expect(
      claimRetainedProtocolStateAtMostOnce(
        outcomes,
        claims,
        "session-1",
        100n,
        "consumer-a",
        "test:claims",
      ),
    ).toBeUndefined();
    expect(
      claimProtocolResultOnce(claims, "session-1", "consumer-b", 101n),
    ).toBe("already-claimed");

    writeRetainedProtocolState(
      outcomes,
      "session-expired",
      "expired",
      100n,
      { finalizedOutcomeTtlMs: 10n },
    );
    expect(
      claimRetainedProtocolStateAtMostOnce(
        outcomes,
        claims,
        "session-expired",
        111n,
        "consumer-a",
        "test:claims",
      ),
    ).toBeUndefined();
    expect(claims.has("session-expired")).toBe(false);
  });

  it("has one terminal winner across concurrent in-memory callers", async () => {
    const store = new InMemoryProtocolStateStore();
    const attempts = await Promise.all(
      Array.from({ length: 32 }, (_, index) =>
        Promise.resolve().then(() =>
          atomicallyTransitionProtocolSession(
            store.collection<ProtocolTerminalSession<string>>("test:races"),
            "session-1",
            {
              state: "finalized",
              result: `result-${index}`,
              finalizedAtMs: BigInt(index),
            },
            "test:races",
          ),
        ),
      ),
    );

    expect(attempts.filter(({ status }) => status === "committed")).toHaveLength(
      1,
    );
    expect(
      new Set(
        attempts
          .map(({ session }) =>
            session.state === "finalized" ? session.result : undefined,
          )
          .filter((result): result is string => result !== undefined),
      ).size,
    ).toBe(1);
  });

  it("fails closed when a collection cannot provide atomic creation", () => {
    const collection: ProtocolStateCollection<ProtocolTerminalSession<string>> = {
      get: () => undefined,
      set: () => undefined,
      delete: () => false,
      has: () => false,
      entries: function* () {},
    };

    expect(() =>
      atomicallyTransitionProtocolSession(
        collection,
        "session-1",
        { state: "cancelled", reason: "caller-aborted", cancelledAtMs: 1n },
        "weak-store",
      ),
    ).toThrow(/weak-store.*atomic/i);
  });

  it("retains a terminal transition and one-time claim across file-store recreation", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-protocol-terminal-"));

    try {
      const createStore = () =>
        createStableJsonProtocolStateStore(
          new FileSystemProtocolStateByteStore(rootDir),
        );
      const sessions = createStore().collection<ProtocolTerminalSession<string>>(
        "test:file-sessions",
      );
      const claims = createStore().collection<ProtocolResultClaim>(
        "test:file-claims",
      );
      atomicallyTransitionProtocolSession(sessions, "session-1", {
        state: "cancelled",
        reason: "caller-aborted",
        cancelledAtMs: 20n,
      });
      const outcomes = createStore().collection<RetainedProtocolState<string>>(
        "test:file-outcomes",
      );
      writeRetainedProtocolState(outcomes, "session-2", "approved", 20n, {});
      expect(
        claimProtocolResultOnce(claims, "session-2", "consumer-a", 21n),
      ).toBe("claimed");

      const recreated = createStore();
      expect(
        recreated
          .collection<ProtocolTerminalSession<string>>("test:file-sessions")
          .get("session-1"),
      ).toEqual({
        state: "cancelled",
        reason: "caller-aborted",
        cancelledAtMs: 20n,
      });
      expect(
        claimProtocolResultOnce(
          recreated.collection<ProtocolResultClaim>("test:file-claims"),
          "session-2",
          "consumer-a",
          22n,
        ),
      ).toBe("already-claimed");
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });
});

describe("ProtocolStateStore retention helpers", () => {
  it("evicts retained state after the ttl window expires", () => {
    const store = new InMemoryProtocolStateStore();
    const collection = store.collection<RetainedProtocolState<{ ok: true }>>(
      "test:retained",
    );

    writeRetainedProtocolState(
      collection,
      "message-1",
      { ok: true },
      100n,
      { finalizedOutcomeTtlMs: 10n },
    );

    expect(readRetainedProtocolState(collection, "message-1", 109n)).toEqual({
      ok: true,
    });
    expect(readRetainedProtocolState(collection, "message-1", 111n)).toBeUndefined();
  });

  it("evicts the oldest retained states when the max finalized outcome budget is exceeded", () => {
    const store = new InMemoryProtocolStateStore();
    const collection = store.collection<RetainedProtocolState<{ id: string }>>(
      "test:max-finalized",
    );

    writeRetainedProtocolState(
      collection,
      "message-1",
      { id: "one" },
      100n,
      { maxFinalizedOutcomes: 2 },
    );
    writeRetainedProtocolState(
      collection,
      "message-2",
      { id: "two" },
      101n,
      { maxFinalizedOutcomes: 2 },
    );
    writeRetainedProtocolState(
      collection,
      "message-3",
      { id: "three" },
      102n,
      { maxFinalizedOutcomes: 2 },
    );

    expect(readRetainedProtocolState(collection, "message-1", 102n)).toBeUndefined();
    expect(readRetainedProtocolState(collection, "message-2", 102n)).toEqual({
      id: "two",
    });
    expect(readRetainedProtocolState(collection, "message-3", 102n)).toEqual({
      id: "three",
    });
  });

  it("keeps the just-written finalized outcome when timestamps tie and capacity remains positive", () => {
    const store = new InMemoryProtocolStateStore();
    const collection = store.collection<RetainedProtocolState<{ id: string }>>(
      "test:max-finalized-tie",
    );

    writeRetainedProtocolState(
      collection,
      "message-b",
      { id: "older" },
      100n,
      { maxFinalizedOutcomes: 1 },
    );
    writeRetainedProtocolState(
      collection,
      "message-a",
      { id: "newer" },
      100n,
      { maxFinalizedOutcomes: 1 },
    );

    expect(readRetainedProtocolState(collection, "message-b", 100n)).toBeUndefined();
    expect(readRetainedProtocolState(collection, "message-a", 100n)).toEqual({
      id: "newer",
    });
  });

  it("clears all finalized outcomes when the configured capacity is zero", () => {
    const store = new InMemoryProtocolStateStore();
    const collection = store.collection<RetainedProtocolState<{ id: string }>>(
      "test:max-finalized-zero",
    );

    writeRetainedProtocolState(
      collection,
      "message-1",
      { id: "one" },
      100n,
      {},
    );
    writeRetainedProtocolState(
      collection,
      "message-2",
      { id: "two" },
      101n,
      {},
    );
    writeRetainedProtocolState(
      collection,
      "message-3",
      { id: "three" },
      102n,
      { maxFinalizedOutcomes: 0 },
    );

    expect(Array.from(collection.entries())).toEqual([]);
  });

  it("rejects invalid finalized-outcome retention caps", () => {
    const store = new InMemoryProtocolStateStore();
    const collection = store.collection<RetainedProtocolState<string>>(
      "test:max-finalized-invalid",
    );

    for (const maxFinalizedOutcomes of [-1, 1.5, Number.NaN, Infinity]) {
      expect(() =>
        writeRetainedProtocolState(
          collection,
          "message-1",
          "value",
          100n,
          { maxFinalizedOutcomes },
        ),
      ).toThrow(/maxFinalizedOutcomes.*finite.*non-negative integer/i);
    }
  });

  it("keeps terminal and retained records isolated from post-commit mutation", () => {
    const store = new InMemoryProtocolStateStore();
    const sessions = store.collection<
      ProtocolTerminalSession<{ approved: boolean }>
    >("test:immutable-sessions");
    const result = { approved: true };
    const committed = atomicallyTransitionProtocolSession(
      sessions,
      "session-1",
      {
        state: "finalized",
        result,
        finalizedAtMs: 100n,
      },
      "test:immutable-sessions",
    );
    result.approved = false;

    expect(committed.status).toBe("committed");
    if (committed.status === "committed") {
      const session = committed.session;
      if (session.state === "finalized") {
        expect(Object.isFrozen(session)).toBe(true);
        expect(Object.isFrozen(session.result)).toBe(true);
        expect(() => {
          (session.result as { approved: boolean }).approved = false;
        }).toThrow();
      }
    }
    expect(sessions.get("session-1")).toEqual({
      state: "finalized",
      result: { approved: true },
      finalizedAtMs: 100n,
    });

    const claims = store.collection<ProtocolResultClaim>(
      "test:immutable-claims",
    );
    expect(claimProtocolResultOnce(claims, "session-1", "consumer-a", 101n)).toBe(
      "claimed",
    );
    const claim = claims.get("session-1");
    expect(Object.isFrozen(claim)).toBe(true);
    expect(() => {
      if (claim) {
        (claim as { claimant: string }).claimant = "consumer-b";
      }
    }).toThrow();
    expect(claims.get("session-1")).toEqual({
      claimant: "consumer-a",
      claimedAtMs: 101n,
    });

    const outcomes = store.collection<
      RetainedProtocolState<{ approved: boolean }>
    >("test:immutable-outcomes");
    writeRetainedProtocolState(
      outcomes,
      "session-2",
      { approved: true },
      100n,
      {},
    );
    const retained = readRetainedProtocolState(outcomes, "session-2", 100n);
    expect(Object.isFrozen(retained)).toBe(true);
    expect(() => {
      if (retained) {
        retained.approved = false;
      }
    }).toThrow();
    expect(readRetainedProtocolState(outcomes, "session-2", 100n)).toEqual({
      approved: true,
    });
  });

  it("prunes expired retained state from a snapshot before deleting entries", () => {
    const backing = new Map<string, RetainedProtocolState<{ id: string }>>([
      [
        "message-1",
        {
          value: { id: "one" },
          storedAtMs: 100n,
          expiresAtMs: 101n,
        },
      ],
      [
        "message-2",
        {
          value: { id: "two" },
          storedAtMs: 100n,
          expiresAtMs: 101n,
        },
      ],
    ]);

    let iterating = false;
    const collection: ProtocolStateCollection<RetainedProtocolState<{ id: string }>> =
      {
        get: (key) => backing.get(key),
        set: (key, value) => {
          backing.set(key, value);
        },
        delete: (key) => {
          if (iterating) {
            throw new Error("delete during iteration");
          }
          return backing.delete(key);
        },
        has: (key) => backing.has(key),
        entries: function* () {
          iterating = true;
          try {
            for (const entry of backing.entries()) {
              yield entry;
            }
          } finally {
            iterating = false;
          }
        },
      };

    expect(() =>
      pruneExpiredRetainedProtocolState(collection, 102n),
    ).not.toThrow();
    expect(Array.from(backing.keys())).toEqual([]);
  });

  it("uses batch deletion when the collection exposes deleteMany", () => {
    const deletedKeyBatches: string[][] = [];
    const collection: ProtocolStateCollection<RetainedProtocolState<{ id: string }>> =
      {
        get: () => undefined,
        set: () => undefined,
        delete: () => {
          throw new Error("expected deleteMany to be used");
        },
        deleteMany: (keys) => {
          deletedKeyBatches.push([...keys]);
          return keys.length;
        },
        has: () => false,
        entries: function* () {
          yield [
            "message-1",
            {
              value: { id: "one" },
              storedAtMs: 100n,
              expiresAtMs: 101n,
            },
          ];
          yield [
            "message-2",
            {
              value: { id: "two" },
              storedAtMs: 100n,
            },
          ];
          yield [
            "message-3",
            {
              value: { id: "three" },
              storedAtMs: 100n,
              expiresAtMs: 100n,
            },
          ];
        },
      };

    pruneExpiredRetainedProtocolState(collection, 102n);
    expect(deletedKeyBatches).toEqual([["message-1", "message-3"]]);
  });

  it("scans and clears collection entries when finalized retention capacity is zero", () => {
    let scanned = false;
    const backing = new Map<string, RetainedProtocolState<{ id: string }>>();
    const collection: ProtocolStateCollection<RetainedProtocolState<{ id: string }>> =
      {
        get: (key) => backing.get(key),
        set: (key, value) => {
          backing.set(key, value);
        },
        delete: (key) => backing.delete(key),
        has: (key) => backing.has(key),
        entries: function* () {
          scanned = true;
          yield* backing.entries();
        },
      };

    writeRetainedProtocolState(
      collection,
      "message-1",
      { id: "one" },
      100n,
      { maxFinalizedOutcomes: 0 },
    );

    expect(scanned).toEqual(true);
    expect(backing.size).toEqual(0);
  });

  it("round-trips typed values through a codec-backed byte store", () => {
    const store = createCodecBackedProtocolStateStore(
      new InMemoryProtocolStateByteStore(),
      v8CodecResolver,
    );
    const collection = store.collection<{
      id: string;
      payload: Uint8Array;
      expiresAt: bigint;
    }>("test:codec-backed");

    const value = {
      id: "message-1",
      payload: new Uint8Array([1, 2, 3, 4]),
      expiresAt: 123n,
    };

    collection.set("message-1", value);

    expect(collection.get("message-1")).toEqual(value);
    expect(Array.from(collection.entries())).toEqual([["message-1", value]]);
  });

  it("persists codec-backed values across file-backed store recreation", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-protocol-state-"));

    try {
      const createCollection = (): ProtocolStateCollection<{
        id: string;
        payload: Uint8Array;
        expiresAt: bigint;
      }> =>
        createCodecBackedProtocolStateStore(
          new FileSystemProtocolStateByteStore(rootDir),
          v8CodecResolver,
        ).collection("test:file-backed");

      const value = {
        id: "message-1",
        payload: new Uint8Array([9, 8, 7]),
        expiresAt: 999n,
      };

      createCollection().set("message-1", value);

      const recreatedCollection = createCollection();
      expect(recreatedCollection.get("message-1")).toEqual(value);
      expect(Array.from(recreatedCollection.entries())).toEqual([
        ["message-1", value],
      ]);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("round-trips typed values through the stable JSON codec store", () => {
    const store = createStableJsonProtocolStateStore(
      new InMemoryProtocolStateByteStore(),
    );
    const collection = store.collection<{
      id: string;
      payload: Uint8Array;
      expiresAt: bigint;
      nested: { readonly thresholds: readonly bigint[] };
    }>("test:stable-json");

    const value = {
      id: "message-1",
      payload: new Uint8Array([4, 5, 6, 7]),
      expiresAt: 456n,
      nested: { thresholds: [18n, 21n] as const },
    };

    collection.set("message-1", value);

    expect(collection.get("message-1")).toEqual(value);
    expect(Array.from(collection.entries())).toEqual([["message-1", value]]);
  });

  it("persists stable JSON codec values across file-backed store recreation", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-protocol-json-state-"));

    try {
      const createCollection = (): ProtocolStateCollection<{
        id: string;
        payload: Uint8Array;
        expiresAt: bigint;
      }> =>
        createStableJsonProtocolStateStore(
          new FileSystemProtocolStateByteStore(rootDir),
        ).collection("test:stable-json:file-backed");

      const value = {
        id: "message-1",
        payload: new Uint8Array([7, 8, 9]),
        expiresAt: 777n,
      };

      createCollection().set("message-1", value);

      const recreatedCollection = createCollection();
      expect(recreatedCollection.get("message-1")).toEqual(value);
      expect(Array.from(recreatedCollection.entries())).toEqual([
        ["message-1", value],
      ]);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("recovers append-only ordinal counts when metadata lags behind stored keys", () => {
    const store = new InMemoryProtocolStateStore();
    const metadata = store.collection<number>("test:metadata");
    const values = store.collection<{ id: string }>("test:values");

    values.set("0", { id: "one" });
    values.set("2", { id: "three" });
    metadata.set("count", 1);

    expect(
      recoverAppendOnlyOrdinalCount(metadata, "count", values),
    ).toEqual(3);
    expect(metadata.get("count")).toEqual(3);
  });

  it("prefers maxOrdinalKey when the collection provides one", () => {
    const metadata = new InMemoryProtocolStateStore().collection<number>(
      "test:metadata-ordinal-hint",
    );
    let scanned = false;
    const values: ProtocolStateCollection<{ id: string }> = {
      get: () => undefined,
      set: () => undefined,
      delete: () => false,
      has: () => false,
      maxOrdinalKey: () => 4,
      entries: function* () {
        scanned = true;
        yield ["0", { id: "unexpected" }];
      },
    };

    metadata.set("count", 1);

    expect(recoverAppendOnlyOrdinalCount(metadata, "count", values)).toEqual(5);
    expect(metadata.get("count")).toEqual(5);
    expect(scanned).toEqual(false);
  });

  it("leaves append-only ordinal metadata unchanged when it is already current", () => {
    const store = new InMemoryProtocolStateStore();
    const metadata = store.collection<number>("test:metadata-current");
    const values = store.collection<{ id: string }>("test:values-current");

    values.set("0", { id: "one" });
    metadata.set("count", 1);

    expect(
      recoverAppendOnlyOrdinalCount(metadata, "count", values),
    ).toEqual(1);
    expect(metadata.get("count")).toEqual(1);
  });

  it("recovers append-only ordinals through codec-backed file stores", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-protocol-state-ordinal-"));

    try {
      const store = createCodecBackedProtocolStateStore(
        new FileSystemProtocolStateByteStore(rootDir),
        v8CodecResolver,
      );
      const metadata = store.collection<number>("test:file-metadata");
      const values = store.collection<{ id: string }>("test:file-values");

      values.set("0", { id: "one" });
      values.set("3", { id: "four" });
      metadata.set("count", 1);

      expect(recoverAppendOnlyOrdinalCount(metadata, "count", values)).toEqual(
        4,
      );
      expect(metadata.get("count")).toEqual(4);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });
});
