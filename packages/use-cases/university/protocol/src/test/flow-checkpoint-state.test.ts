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

const validState = () => ({
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
  students: [
    {
      studentId: "student-1",
      receivedResults: [],
    },
  ],
  companies: [
    {
      companyId: "company-1",
      processedThreadIds: [],
      acceptedCount: 0,
      duplicateRejectedCount: 0,
      verificationRejectedCount: 0,
    },
  ],
  mall: {
    processedThreadIds: [],
    acceptedCount: 0,
    duplicateRejectedCount: 0,
    verificationRejectedCount: 0,
  },
});

describe("university protocol checkpoint state helpers", () => {
  it("summarizes queued transport, transcript, and message counts", () => {
    const checkpoint = makeCheckpoint(validState());

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

  it.each([
    [
      "missing discount messages",
      () => {
        const state = validState();
        return {
          ...state,
          messages: {
            issuance: [],
            jobApplications: [],
          },
        };
      },
    ],
    [
      "malformed transport checkpoint",
      () => ({
        ...validState(),
        transport: {},
      }),
    ],
    [
      "malformed checkpoint sequence",
      () => ({
        ...validState(),
        checkpointSequence: "1",
      }),
    ],
    [
      "malformed student state",
      () => ({
        ...validState(),
        students: [{ studentId: "student-1" }],
      }),
    ],
    [
      "malformed verifier counters",
      () => ({
        ...validState(),
        mall: {
          processedThreadIds: [],
          acceptedCount: 0,
          duplicateRejectedCount: "0",
          verificationRejectedCount: 0,
        },
      }),
    ],
  ])("rejects malformed checkpoint state: %s", (_label, stateFactory) => {
    const checkpoint = makeCheckpoint(stateFactory());

    expect(() =>
      asUniversityProtocolRunnerCheckpointState(checkpoint.encodedState),
    ).toThrow("Malformed university protocol checkpoint state");
  });
});
