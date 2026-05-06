import { Buffer } from "node:buffer";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deserialize, serialize } from "node:v8";

import { describe, expect, it } from "vitest";

import { FileSystemProtocolStateByteStore } from "../../adapters/file-protocol-state-store.js";
import {
  createCodecBackedProtocolStateStore,
  InMemoryProtocolStateByteStore,
  InMemoryProtocolStateStore,
  type ProtocolStateCodecResolver,
  type ProtocolStateCollection,
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

  it("retains no finalized outcomes when the configured capacity is zero", () => {
    const store = new InMemoryProtocolStateStore();
    const collection = store.collection<RetainedProtocolState<{ id: string }>>(
      "test:max-finalized-zero",
    );

    writeRetainedProtocolState(
      collection,
      "message-1",
      { id: "one" },
      100n,
      { maxFinalizedOutcomes: 0 },
    );

    expect(readRetainedProtocolState(collection, "message-1", 100n)).toBeUndefined();
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

  it("skips collection scans when finalized retention capacity is zero", () => {
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

    expect(scanned).toEqual(false);
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
