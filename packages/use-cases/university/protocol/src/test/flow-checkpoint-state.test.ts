import { describe, expect, it } from "vitest";

import {
  asUniversityProtocolRunnerCheckpointState,
  summarizeUniversityProtocolCheckpoint,
} from "../flow-checkpoint-state.js";
import {
  type UniversityProtocolCheckpoint,
  universityProtocolCheckpointSchemaId,
  universityProtocolCheckpointSchemaVersion,
} from "../persistence.js";
import { encodeUniversityProtocolTransportValue } from "../process-transport.js";

const makeCheckpoint = (
  state: Record<string, unknown>,
): UniversityProtocolCheckpoint => ({
  schemaId: universityProtocolCheckpointSchemaId,
  schemaVersion: universityProtocolCheckpointSchemaVersion,
  compatibility: {
    minimumReaderVersion: universityProtocolCheckpointSchemaVersion,
    maximumReaderVersion: universityProtocolCheckpointSchemaVersion,
  },
  checkpointId: "checkpoint-1",
  restartPoint: "afterIssuanceRequests",
  encodedState: encodeUniversityProtocolTransportValue(state),
});

const baseTransport = {
  queues: [{ partyId: "student-1", payloads: ["queued-message"] }],
  frames: [
    {
      sequence: 0,
      type: "issuance:request",
      from: "student-1",
      to: "issuer-1",
      messageIdHex: "01",
      threadIdHex: "02",
      respondsToHex: "00",
      payloadBytes: 128,
    },
  ],
};

describe("university protocol checkpoint state helpers", () => {
  it("summarizes queued transport, transcript, and message counts", () => {
    const checkpoint = makeCheckpoint({
      transport: baseTransport,
      checkpointSequence: 1,
      transcript: [{ summary: "issuance request" }],
      messages: {
        issuance: [{ type: "issuance:request" }],
        jobApplications: [
          { type: "presentation:request" },
          { type: "presentation:submission" },
        ],
        discounts: [{ type: "presentation:result" }],
      },
      students: [],
      companies: [],
      mall: {
        processedThreadIds: [],
        acceptedCount: 0,
        duplicateRejectedCount: 0,
        verificationRejectedCount: 0,
      },
    });

    expect(summarizeUniversityProtocolCheckpoint(checkpoint)).toEqual({
      checkpointId: "checkpoint-1",
      restartPoint: "afterIssuanceRequests",
      queuedMessageCount: 1,
      transportFrameCount: 1,
      transcriptEntries: 1,
      messageCounts: {
        issuance: 1,
        jobApplications: 2,
        discounts: 1,
      },
    });
  });

  it("rejects malformed checkpoint state before restore", () => {
    const checkpoint = makeCheckpoint({
      transport: baseTransport,
      checkpointSequence: 1,
      transcript: [],
      messages: {
        issuance: [],
        jobApplications: [],
      },
      students: [],
      companies: [],
      mall: {
        processedThreadIds: [],
        acceptedCount: 0,
        duplicateRejectedCount: 0,
        verificationRejectedCount: 0,
      },
    });

    expect(() =>
      asUniversityProtocolRunnerCheckpointState(checkpoint.encodedState),
    ).toThrow("Malformed university protocol checkpoint state");
  });
});
