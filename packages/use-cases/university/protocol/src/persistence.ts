import type {
  EncodedUniversityProtocolTransportValue,
  SerializedUniversityProtocolTransportCheckpoint,
} from "./process-transport.js";

export const universityProtocolCheckpointSchemaId =
  "midnight.university.protocol.checkpoint";

export const universityProtocolCheckpointSchemaVersion = 1;

export type UniversityProtocolRestartPoint =
  | "afterIssuanceRequests"
  | "afterJobApplicationRequests"
  | "afterMallDiscountRequests";

export const defaultUniversityProtocolRestartPoints: readonly UniversityProtocolRestartPoint[] =
  [
    "afterIssuanceRequests",
    "afterJobApplicationRequests",
    "afterMallDiscountRequests",
  ];

export type UniversityProtocolCheckpoint = {
  readonly schemaId: typeof universityProtocolCheckpointSchemaId;
  readonly schemaVersion: typeof universityProtocolCheckpointSchemaVersion;
  readonly compatibility: {
    readonly minimumReaderVersion: typeof universityProtocolCheckpointSchemaVersion;
    readonly maximumReaderVersion: typeof universityProtocolCheckpointSchemaVersion;
  };
  readonly checkpointId: string;
  readonly restartPoint: UniversityProtocolRestartPoint;
  readonly encodedState: EncodedUniversityProtocolTransportValue;
};

export type UniversityProtocolCheckpointSummary = {
  readonly checkpointId: string;
  readonly restartPoint: UniversityProtocolRestartPoint;
  readonly queuedMessageCount: number;
  readonly transportFrameCount: number;
  readonly transcriptEntries: number;
  readonly messageCounts: {
    readonly issuance: number;
    readonly jobApplications: number;
    readonly discounts: number;
  };
};

export type UniversityProtocolCheckpointStore = {
  save(checkpoint: UniversityProtocolCheckpoint): void;
  load(checkpointId: string): UniversityProtocolCheckpoint | undefined;
  list(): readonly UniversityProtocolCheckpoint[];
};

export type UniversityProtocolRestartSimulationOptions = {
  readonly restartPoints?: readonly UniversityProtocolRestartPoint[];
  readonly checkpointStore?: UniversityProtocolCheckpointStore;
};

export type UniversityProtocolRestartSimulationResult<TResult> = {
  readonly result: TResult;
  readonly checkpoints: readonly UniversityProtocolCheckpointSummary[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const restartPoints = new Set<UniversityProtocolRestartPoint>(
  defaultUniversityProtocolRestartPoints,
);

export const queuedMessageCount = (
  checkpoint: SerializedUniversityProtocolTransportCheckpoint,
): number =>
  checkpoint.queues.reduce(
    (sum, queue) => sum + queue.payloads.length,
    0,
  );

export const assertUniversityProtocolCheckpointCompatible = (
  checkpoint: UniversityProtocolCheckpoint,
): void => {
  if (
    !isRecord(checkpoint) ||
    typeof checkpoint.checkpointId !== "string" ||
    !restartPoints.has(checkpoint.restartPoint) ||
    checkpoint.encodedState === undefined ||
    !isRecord(checkpoint.compatibility)
  ) {
    throw new Error("Malformed university protocol checkpoint");
  }
  if (checkpoint.schemaId !== universityProtocolCheckpointSchemaId) {
    throw new Error("Unsupported university protocol checkpoint schema id");
  }
  if (
    checkpoint.schemaVersion !== universityProtocolCheckpointSchemaVersion ||
    checkpoint.compatibility.minimumReaderVersion >
      universityProtocolCheckpointSchemaVersion ||
    checkpoint.compatibility.maximumReaderVersion <
      universityProtocolCheckpointSchemaVersion
  ) {
    throw new Error("Unsupported university protocol checkpoint schema version");
  }
};

export class InMemoryUniversityProtocolCheckpointStore
  implements UniversityProtocolCheckpointStore
{
  readonly #records = new Map<string, string>();

  save(checkpoint: UniversityProtocolCheckpoint): void {
    this.#records.set(checkpoint.checkpointId, JSON.stringify(checkpoint));
  }

  load(checkpointId: string): UniversityProtocolCheckpoint | undefined {
    const record = this.#records.get(checkpointId);
    const checkpoint = record
      ? (JSON.parse(record) as UniversityProtocolCheckpoint)
      : undefined;
    if (checkpoint) {
      assertUniversityProtocolCheckpointCompatible(checkpoint);
    }
    return checkpoint;
  }

  list(): readonly UniversityProtocolCheckpoint[] {
    return [...this.#records.values()].map((record) => {
      const checkpoint = JSON.parse(record) as UniversityProtocolCheckpoint;
      assertUniversityProtocolCheckpointCompatible(checkpoint);
      return checkpoint;
    });
  }

  /** @internal Test helper for proving checkpoints really round-trip as JSON. */
  serializedRecords(): readonly string[] {
    return [...this.#records.values()];
  }
}
