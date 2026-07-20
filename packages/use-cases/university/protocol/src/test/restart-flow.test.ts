import { resetEnvelopeCounter } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  assertUniversityProtocolCheckpointCompatible,
  defaultUniversityProtocolRestartPoints,
  InMemoryUniversityProtocolCheckpointStore,
  SerializedUniversityProtocolTransport,
  universityProtocolCheckpointSchemaId,
  type UniversityProtocolCheckpointStore,
  UniversityProtocolFlowRunner,
} from "../testing.js";

const fixedProtocolTime = new Date("2030-06-01T00:00:00.000Z");

type ComparableResult = Omit<
  ReturnType<UniversityProtocolFlowRunner["runAll"]>,
  "metrics"
>;

const comparable = (
  result: ReturnType<UniversityProtocolFlowRunner["runAll"]>,
): ComparableResult => ({
  // Wall-clock metrics are intentionally excluded from restart equivalence; the
  // restart path performs checkpoint encode/decode work that changes timings.
  issuance: result.issuance,
  jobApplications: result.jobApplications,
  discounts: result.discounts,
  transcript: result.transcript,
});

const runBaseline = (): ComparableResult => {
  resetEnvelopeCounter();
  vi.setSystemTime(fixedProtocolTime);
  return comparable(new UniversityProtocolFlowRunner().runAll());
};

describe("university protocol restart persistence", () => {
  beforeEach(() => {
    setNetworkId("undeployed");
    vi.useFakeTimers();
    vi.setSystemTime(fixedProtocolTime);
  });

  afterEach(() => {
    vi.useRealTimers();
    resetEnvelopeCounter();
  });

  it("restores persisted in-flight threads across issuance and presentation restart points", () => {
    const baseline = runBaseline();
    const checkpointStore = new InMemoryUniversityProtocolCheckpointStore();
    resetEnvelopeCounter();
    vi.setSystemTime(fixedProtocolTime);

    const restarted = new UniversityProtocolFlowRunner().runAllWithRestartSimulation(
      {
        checkpointStore,
        restartPoints: defaultUniversityProtocolRestartPoints,
      },
    );

    expect(comparable(restarted.result)).toEqual(baseline);
    expect(restarted.checkpoints.map((checkpoint) => checkpoint.restartPoint)).toEqual(
      defaultUniversityProtocolRestartPoints,
    );
    expect(restarted.checkpoints[0]).toMatchObject({
      restartPoint: "afterIssuanceRequests",
      queuedMessageCount: 10,
      transcriptEntries: 10,
      messageCounts: {
        issuance: 10,
        jobApplications: 0,
        discounts: 0,
      },
    });
    expect(restarted.checkpoints[1]).toMatchObject({
      restartPoint: "afterJobApplicationRequests",
      queuedMessageCount: 10,
      messageCounts: {
        issuance: 20,
        jobApplications: 10,
        discounts: 0,
      },
    });
    expect(restarted.checkpoints[2]).toMatchObject({
      restartPoint: "afterMallDiscountRequests",
      queuedMessageCount: 5,
      messageCounts: {
        issuance: 20,
        jobApplications: 30,
        discounts: 5,
      },
    });
    expect(checkpointStore.list()).toHaveLength(3);
    expect(checkpointStore.serializedRecords()[0]).toContain(
      universityProtocolCheckpointSchemaId,
    );
    expect(checkpointStore.serializedRecords()[0]).toContain(
      "__midnightUniversityProtocolTransportType",
    );
    expect(
      restarted.checkpoints.map((checkpoint) => checkpoint.transportFrameCount),
    ).toEqual([10, 30, 55]);
    expect(restarted.checkpoints.map((checkpoint) => checkpoint.checkpointId)).toEqual([
      "0:afterIssuanceRequests:10:10:0:0",
      "1:afterJobApplicationRequests:30:20:10:0",
      "2:afterMallDiscountRequests:55:20:30:5",
    ]);
  });

  it("supports a partial restart plan", () => {
    const baseline = runBaseline();
    resetEnvelopeCounter();
    vi.setSystemTime(fixedProtocolTime);

    const restarted = new UniversityProtocolFlowRunner().runAllWithRestartSimulation(
      {
        restartPoints: ["afterJobApplicationRequests"],
      },
    );

    expect(comparable(restarted.result)).toEqual(baseline);
    expect(restarted.checkpoints.map((checkpoint) => checkpoint.restartPoint)).toEqual([
      "afterJobApplicationRequests",
    ]);
  });

  it("can run without restart points while preserving an already serialized transport", () => {
    const baseline = runBaseline();
    const transport = new SerializedUniversityProtocolTransport();
    resetEnvelopeCounter();
    vi.setSystemTime(fixedProtocolTime);

    const restarted = new UniversityProtocolFlowRunner({
      transport,
    }).runAllWithRestartSimulation({ restartPoints: [] });

    expect(comparable(restarted.result)).toEqual(baseline);
    expect(restarted.checkpoints).toHaveLength(0);
    expect(transport.totalPayloadBytes()).toBeGreaterThan(0);
  });

  it("rejects incompatible checkpoint envelopes before restore", () => {
    const checkpointStore = new InMemoryUniversityProtocolCheckpointStore();
    resetEnvelopeCounter();
    vi.setSystemTime(fixedProtocolTime);

    new UniversityProtocolFlowRunner().runAllWithRestartSimulation({
      checkpointStore,
      restartPoints: ["afterIssuanceRequests"],
    });
    const [checkpoint] = checkpointStore.list();
    if (!checkpoint) {
      throw new Error("Expected restart simulation to persist a checkpoint");
    }

    expect(() =>
      assertUniversityProtocolCheckpointCompatible({
        ...checkpoint,
        schemaId: "wrong" as typeof checkpoint.schemaId,
      }),
    ).toThrow(/Unsupported university protocol checkpoint schema id/u);
    expect(() =>
      assertUniversityProtocolCheckpointCompatible({
        ...checkpoint,
        // A pre-#267 v1 checkpoint predates claimOpenings/applicantRef and
        // must be rejected cleanly instead of failing deep inside the flow.
        schemaVersion: 1 as typeof checkpoint.schemaVersion,
      }),
    ).toThrow(/Unsupported university protocol checkpoint schema version/u);
    expect(() =>
      assertUniversityProtocolCheckpointCompatible({
        ...checkpoint,
        compatibility: {
          minimumReaderVersion: 3 as typeof checkpoint.compatibility.minimumReaderVersion,
          maximumReaderVersion: 3 as typeof checkpoint.compatibility.maximumReaderVersion,
        },
      }),
    ).toThrow(/Unsupported university protocol checkpoint schema version/u);
  });

  it("fails fast when the checkpoint store cannot reload a saved checkpoint", () => {
    const missingStore: UniversityProtocolCheckpointStore = {
      save: () => undefined,
      load: () => undefined,
      list: () => [],
    };

    expect(() =>
      new UniversityProtocolFlowRunner().runAllWithRestartSimulation({
        checkpointStore: missingStore,
        restartPoints: ["afterIssuanceRequests"],
      }),
    ).toThrow(/Missing persisted checkpoint/u);
  });

  it("rejects malformed decoded checkpoint state", () => {
    const backingStore = new InMemoryUniversityProtocolCheckpointStore();
    const tamperedStore: UniversityProtocolCheckpointStore = {
      save: (checkpoint) => {
        backingStore.save({
          ...checkpoint,
          encodedState: null,
        });
      },
      load: (checkpointId) => backingStore.load(checkpointId),
      list: () => backingStore.list(),
    };

    expect(() =>
      new UniversityProtocolFlowRunner().runAllWithRestartSimulation({
        checkpointStore: tamperedStore,
        restartPoints: ["afterIssuanceRequests"],
      }),
    ).toThrow(/Malformed university protocol checkpoint state/u);
  });
});
