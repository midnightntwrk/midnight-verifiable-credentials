import { describe, expect, it } from "vitest";

import {
  InMemoryProtocolStateStore,
  readRetainedProtocolState,
  type RetainedProtocolState,
  writeRetainedProtocolState,
} from "../../agents/protocol-state-store.js";

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
});
