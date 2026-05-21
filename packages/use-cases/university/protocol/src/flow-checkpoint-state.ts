import type {
  StoredIssuedCredential,
  UniversityPresentationResultBody,
  UniversityProtocolFlowResult,
  UniversityProtocolMessage,
} from "./model.js";
import {
  queuedMessageCount,
  type UniversityProtocolCheckpoint,
  type UniversityProtocolCheckpointSummary,
} from "./persistence.js";
import {
  decodeUniversityProtocolTransportValue,
  type SerializedUniversityProtocolTransportCheckpoint,
} from "./process-transport.js";

export type UniversityProtocolRunnerCheckpointState = {
  readonly transport: SerializedUniversityProtocolTransportCheckpoint;
  readonly checkpointSequence: number;
  readonly transcript: UniversityProtocolFlowResult["transcript"];
  readonly messages: {
    readonly issuance: readonly UniversityProtocolMessage[];
    readonly jobApplications: readonly UniversityProtocolMessage[];
    readonly discounts: readonly UniversityProtocolMessage[];
  };
  readonly students: readonly {
    readonly studentId: string;
    readonly storedIssuedCredential?: StoredIssuedCredential;
    readonly receivedResults: readonly UniversityPresentationResultBody[];
  }[];
  readonly companies: readonly {
    readonly companyId: string;
    readonly processedThreadIds: readonly string[];
    readonly acceptedCount: number;
    readonly duplicateRejectedCount: number;
    readonly verificationRejectedCount: number;
  }[];
  readonly mall: {
    readonly processedThreadIds: readonly string[];
    readonly acceptedCount: number;
    readonly duplicateRejectedCount: number;
    readonly verificationRejectedCount: number;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asDecodedCheckpointState = (
  value: unknown,
): UniversityProtocolRunnerCheckpointState => {
  if (
    !isRecord(value) ||
    !isRecord(value.transport) ||
    typeof value.checkpointSequence !== "number" ||
    !Array.isArray(value.transcript) ||
    !isRecord(value.messages) ||
    !Array.isArray(value.messages.issuance) ||
    !Array.isArray(value.messages.jobApplications) ||
    !Array.isArray(value.messages.discounts) ||
    !Array.isArray(value.students) ||
    !Array.isArray(value.companies) ||
    !isRecord(value.mall)
  ) {
    throw new Error("Malformed university protocol checkpoint state");
  }
  return value as UniversityProtocolRunnerCheckpointState;
};

export const asUniversityProtocolRunnerCheckpointState = (
  encodedState: UniversityProtocolCheckpoint["encodedState"],
): UniversityProtocolRunnerCheckpointState =>
  asDecodedCheckpointState(
    decodeUniversityProtocolTransportValue(encodedState),
  );

export const summarizeUniversityProtocolCheckpoint = (
  checkpoint: UniversityProtocolCheckpoint,
): UniversityProtocolCheckpointSummary => {
  const state = asUniversityProtocolRunnerCheckpointState(
    checkpoint.encodedState,
  );
  return {
    checkpointId: checkpoint.checkpointId,
    restartPoint: checkpoint.restartPoint,
    queuedMessageCount: queuedMessageCount(state.transport),
    transportFrameCount: state.transport.frames.length,
    transcriptEntries: state.transcript.length,
    messageCounts: {
      issuance: state.messages.issuance.length,
      jobApplications: state.messages.jobApplications.length,
      discounts: state.messages.discounts.length,
    },
  };
};
