import { resetEnvelopeCounter } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  defaultUniversityProtocolRestartPoints,
  InMemoryUniversityProtocolCheckpointStore,
  universityProtocolCheckpointSchemaId,
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
    expect(checkpointStore.serializedRecords()[0]).not.toContain("12345678901234567890n");
  });
});
