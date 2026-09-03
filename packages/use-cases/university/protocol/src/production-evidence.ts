import { Buffer } from "node:buffer";

import { assertCanonicalMessage, type CanonicalMessage } from "@midnight-ntwrk/credential-exchange";
import {
  type CanonicalMessageThreadBinding,
  OpenIdCanonicalMessageAdapter,
} from "@midnight-ntwrk/midnight-did-credentials-openid";

import { UniversityProtocolFlowRunner } from "./flow.js";
import { universityProtocolMessageIdHex } from "./flow-messages.js";
import type {
  UniversityProtocolDataPaths,
  UniversityProtocolFlowResult,
  UniversityProtocolMessage,
} from "./model.js";
import {
  InMemoryUniversityProtocolCheckpointStore,
  type UniversityProtocolCheckpointStore,
  type UniversityProtocolCheckpointSummary,
} from "./persistence.js";
import {
  exerciseOptionsForProductionEvidencePolicy,
  type UniversityProductionEvidencePolicy,
} from "./production-evidence-policy.js";
import {
  encodeUniversityCanonicalJson,
  MIDNIGHT_OPENID_PROFILE_V1,
  resolveUniversityProductionEvidenceProfile,
  UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE,
} from "./production-profile.js";
import {
  SimulatorUniversityProofExecutionBackend,
  type UniversityProofExecutionBackend,
} from "./proof-backend.js";
import {
  DeterministicUniversityPartyRuntime,
  type UniversityPartyRuntime,
} from "./runtime.js";
import {
  executeUniversityVerificationV1Decision,
  type UniversityVerificationV1Decision,
} from "./verification-v1-evidence.js";

export type UniversityEvidenceStage =
  | "profile"
  | "network"
  | "process"
  | "proof"
  | "storage"
  | "key-custody"
  | "verification";

export type UniversityEvidenceAuditEvent = {
  readonly correlationId: string;
  readonly stage: UniversityEvidenceStage;
  readonly outcome: "started" | "succeeded" | "failed";
  readonly profileId: string;
  readonly policyId: string;
  readonly detail?: string;
};

export interface UniversityEvidenceAuditSink {
  record(event: UniversityEvidenceAuditEvent): void;
}

export class InMemoryUniversityEvidenceAuditSink
  implements UniversityEvidenceAuditSink
{
  readonly #events: UniversityEvidenceAuditEvent[] = [];

  record(event: UniversityEvidenceAuditEvent): void {
    this.#events.push({ ...event });
  }

  snapshot(): readonly UniversityEvidenceAuditEvent[] {
    return this.#events.map((event) => ({ ...event }));
  }
}

export interface UniversityNetworkBoundary {
  exchange(correlationId: string): void;
}

export interface UniversityProcessBoundary {
  execute<TResult>(operation: () => TResult): TResult;
}

export class SyntheticUniversityNetworkBoundary
  implements UniversityNetworkBoundary
{
  exchange(correlationId: string): void {
    // An explicit no-I/O boundary: tests replace it to prove outage behavior.
    void correlationId;
  }
}

export class InlineUniversityProcessBoundary
  implements UniversityProcessBoundary
{
  execute<TResult>(operation: () => TResult): TResult {
    return operation();
  }
}

export type UniversityProofFaultPoint = keyof Pick<
  UniversityProofExecutionBackend,
  | "issueDiplomaCredential"
  | "buildPresentationSubmission"
  | "buildJobApplicationRequest"
  | "buildMallDiscountRequest"
  | "verifyJobApplication"
  | "verifyMallDiscount"
>;

/** Test/evidence adapter; it injects failure without pretending to be remote infrastructure. */
export class FaultInjectingUniversityProofExecutionBackend
  implements UniversityProofExecutionBackend
{
  constructor(
    readonly delegate: UniversityProofExecutionBackend,
    readonly faultPoint: UniversityProofFaultPoint,
  ) {}

  descriptor(): ReturnType<UniversityProofExecutionBackend["descriptor"]> {
    return this.delegate.descriptor();
  }

  snapshotMetrics(): ReturnType<UniversityProofExecutionBackend["snapshotMetrics"]> {
    return this.delegate.snapshotMetrics();
  }

  resetMetrics(): void {
    this.delegate.resetMetrics();
  }

  private execute<T>(point: UniversityProofFaultPoint, operation: () => T): T {
    if (point === this.faultPoint) {
      throw new Error(`proof execution fault at ${point}`);
    }
    return operation();
  }

  issueDiplomaCredential(
    options: Parameters<UniversityProofExecutionBackend["issueDiplomaCredential"]>[0],
  ): ReturnType<UniversityProofExecutionBackend["issueDiplomaCredential"]> {
    return this.execute("issueDiplomaCredential", () =>
      this.delegate.issueDiplomaCredential(options),
    );
  }

  buildPresentationSubmission(
    options: Parameters<UniversityProofExecutionBackend["buildPresentationSubmission"]>[0],
  ): ReturnType<UniversityProofExecutionBackend["buildPresentationSubmission"]> {
    return this.execute("buildPresentationSubmission", () =>
      this.delegate.buildPresentationSubmission(options),
    );
  }

  buildJobApplicationRequest(
    options: Parameters<UniversityProofExecutionBackend["buildJobApplicationRequest"]>[0],
  ): ReturnType<UniversityProofExecutionBackend["buildJobApplicationRequest"]> {
    return this.execute("buildJobApplicationRequest", () =>
      this.delegate.buildJobApplicationRequest(options),
    );
  }

  buildMallDiscountRequest(
    options: Parameters<UniversityProofExecutionBackend["buildMallDiscountRequest"]>[0],
  ): ReturnType<UniversityProofExecutionBackend["buildMallDiscountRequest"]> {
    return this.execute("buildMallDiscountRequest", () =>
      this.delegate.buildMallDiscountRequest(options),
    );
  }

  verifyJobApplication(
    options: Parameters<UniversityProofExecutionBackend["verifyJobApplication"]>[0],
  ): void {
    this.execute("verifyJobApplication", () =>
      this.delegate.verifyJobApplication(options),
    );
  }

  verifyMallDiscount(
    options: Parameters<UniversityProofExecutionBackend["verifyMallDiscount"]>[0],
  ): void {
    this.execute("verifyMallDiscount", () =>
      this.delegate.verifyMallDiscount(options),
    );
  }
}

export type UniversityProductionEvidenceRunnerPorts = {
  readonly network?: UniversityNetworkBoundary;
  readonly process?: UniversityProcessBoundary;
  readonly proofExecutionBackend?: UniversityProofExecutionBackend;
  readonly checkpointStore?: UniversityProtocolCheckpointStore;
  readonly partyRuntime?: UniversityPartyRuntime;
  readonly audit?: UniversityEvidenceAuditSink;
};

export type UniversityProductionEvidenceRunOptions = {
  readonly correlationId: string;
  readonly policy: UniversityProductionEvidencePolicy;
  readonly dataPaths?: Partial<UniversityProtocolDataPaths>;
};

export type UniversityProductionEvidence = {
  readonly qualification: "production-shaped-evidence-only";
  readonly productionApproved: false;
  readonly correlationId: string;
  readonly profile: { readonly id: string; readonly version: string };
  readonly openIdProfile: typeof MIDNIGHT_OPENID_PROFILE_V1;
  readonly checkpoints: readonly UniversityProtocolCheckpointSummary[];
  readonly flow: UniversityProtocolFlowResult;
  readonly publicSurfaceMessages: readonly CanonicalMessage[];
  readonly verificationV1Decisions: readonly UniversityVerificationV1Decision[];
};

const stageForError = (error: unknown): UniversityEvidenceStage => {
  const message = error instanceof Error ? error.message : String(error);
  if (/proof execution/i.test(message)) return "proof";
  if (/storage|checkpoint/i.test(message)) return "storage";
  if (/custody|signing material/i.test(message)) return "key-custody";
  return "process";
};

const canonicalKindFor = (
  message: UniversityProtocolMessage,
): CanonicalMessage["kind"] => {
  switch (message.type) {
    case "issuance:request":
      return "issuance-request";
    case "issuance:result":
      return "credential";
    case "presentation:request":
      return "presentation-request";
    case "presentation:submission":
      return "presentation";
    default:
      throw new Error(`University result message ${message.type} is not a canonical evidence payload`);
  }
};

const publicSurfaceMessages = (
  flow: UniversityProtocolFlowResult,
): readonly CanonicalMessage[] => {
  const messages = [
    flow.issuance.messages.find((message) => message.type === "issuance:request"),
    flow.issuance.messages.find((message) => message.type === "issuance:result"),
    flow.jobApplications.messages.find(
      (message) => message.type === "presentation:request",
    ),
    flow.jobApplications.messages.find(
      (message) => message.type === "presentation:submission",
    ),
  ];
  if (messages.some((message) => message === undefined)) {
    throw new Error("University evidence flow is missing a canonical lifecycle message");
  }

  const adapter = new OpenIdCanonicalMessageAdapter();
  return messages.map((message) => {
    const required = message as UniversityProtocolMessage;
    const canonical: CanonicalMessage = {
      familyId: "prototype.university-diploma",
      familyVersion: "0.1.0",
      schemaId: "urn:midnight:prototype:university-diploma",
      schemaVersion: "1.0.0",
      kind: canonicalKindFor(required),
      mediaType: "application/vnd.midnight.university-evidence+json",
      payload: Buffer.from(encodeUniversityCanonicalJson(required.body), "utf8"),
    };
    assertCanonicalMessage(canonical, canonical, canonical.kind);
    const threading: CanonicalMessageThreadBinding = {
      messageId: universityProtocolMessageIdHex(required.envelope.messageId),
      threadId: universityProtocolMessageIdHex(required.envelope.threadId),
      ...(required.envelope.respondsToMessageId.every((byte) => byte === 0)
        ? {}
        : {
            respondsToMessageId: universityProtocolMessageIdHex(
              required.envelope.respondsToMessageId,
            ),
          }),
    };
    const roundTrip = adapter.unwrap(adapter.wrap(canonical, threading));
    assertCanonicalMessage(roundTrip.message, canonical, canonical.kind);
    return roundTrip.message as CanonicalMessage;
  });
};

const verificationDecisions = (
  flow: UniversityProtocolFlowResult,
): readonly UniversityVerificationV1Decision[] => {
  const issuance = flow.issuance.messages.filter(
    (message) => message.type === "issuance:result",
  );
  const phases = [flow.jobApplications.messages, flow.discounts.messages];
  return phases.flatMap((messages) =>
    messages
      .filter((message) => message.type === "presentation:result")
      .map((result) => {
        const threadId = universityProtocolMessageIdHex(result.envelope.threadId);
        const request = messages.find(
          (message) =>
            message.type === "presentation:request" &&
            universityProtocolMessageIdHex(message.envelope.threadId) === threadId,
        );
        const submission = messages.find(
          (message) =>
            message.type === "presentation:submission" &&
            universityProtocolMessageIdHex(message.envelope.threadId) === threadId,
        );
        const issued = issuance.find(
          (message) => message.body.studentId === result.body.studentId,
        );
        if (
          !request ||
          request.type !== "presentation:request" ||
          !submission ||
          submission.type !== "presentation:submission" ||
          !issued ||
          issued.type !== "issuance:result"
        ) {
          throw new Error(
            `University Verification V1 inputs are incomplete for thread ${threadId}`,
          );
        }
        return executeUniversityVerificationV1Decision({
          profile: UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE,
          issuance: issued,
          request,
          submission,
          result,
        });
      }),
  );
};

export class UniversityProductionEvidenceRunner {
  readonly network: UniversityNetworkBoundary;
  readonly process: UniversityProcessBoundary;
  readonly proofExecutionBackend: UniversityProofExecutionBackend;
  readonly checkpointStore: UniversityProtocolCheckpointStore;
  readonly partyRuntime: UniversityPartyRuntime;
  readonly audit: UniversityEvidenceAuditSink;

  constructor(ports: UniversityProductionEvidenceRunnerPorts = {}) {
    this.network = ports.network ?? new SyntheticUniversityNetworkBoundary();
    this.process = ports.process ?? new InlineUniversityProcessBoundary();
    this.proofExecutionBackend =
      ports.proofExecutionBackend ?? new SimulatorUniversityProofExecutionBackend();
    this.checkpointStore =
      ports.checkpointStore ?? new InMemoryUniversityProtocolCheckpointStore();
    this.partyRuntime =
      ports.partyRuntime ?? new DeterministicUniversityPartyRuntime();
    this.audit = ports.audit ?? new InMemoryUniversityEvidenceAuditSink();
  }

  run(options: UniversityProductionEvidenceRunOptions): UniversityProductionEvidence {
    if (options.correlationId.trim().length === 0) {
      throw new Error("University evidence correlation id must be non-empty");
    }
    const common = {
      correlationId: options.correlationId,
      profileId: "profile.use-case.university-production-evidence",
      policyId: options.policy.id,
    } as const;
    this.audit.record({ ...common, stage: "profile", outcome: "started" });
    const resolved = resolveUniversityProductionEvidenceProfile();
    this.audit.record({ ...common, stage: "profile", outcome: "succeeded" });

    try {
      this.audit.record({ ...common, stage: "network", outcome: "started" });
      this.network.exchange(options.correlationId);
      this.audit.record({ ...common, stage: "network", outcome: "succeeded" });
    } catch (error) {
      this.audit.record({
        ...common,
        stage: "network",
        outcome: "failed",
        detail: error instanceof Error ? error.message : "network failure",
      });
      throw error;
    }

    try {
      this.audit.record({ ...common, stage: "process", outcome: "started" });
      const restart = this.process.execute(() =>
        new UniversityProtocolFlowRunner({
          dataPaths: options.dataPaths,
          exerciseOptions: exerciseOptionsForProductionEvidencePolicy(options.policy),
          partyRuntime: this.partyRuntime,
          proofExecutionBackend: this.proofExecutionBackend,
        }).runAllWithRestartSimulation({
          restartPoints: options.policy.restartPoints,
          checkpointStore: this.checkpointStore,
        }),
      );
      this.audit.record({ ...common, stage: "process", outcome: "succeeded" });
      const messages = publicSurfaceMessages(restart.result);
      const decisions = verificationDecisions(restart.result);
      const invalidCount = decisions.filter(
        (decision) => decision.result.proofStatus !== "valid",
      ).length;
      this.audit.record({
        ...common,
        stage: "verification",
        outcome: invalidCount === 0 ? "succeeded" : "failed",
        detail: `${decisions.length} decisions; ${invalidCount} invalid`,
      });
      return {
        qualification: "production-shaped-evidence-only",
        productionApproved: false,
        correlationId: options.correlationId,
        profile: resolved.profile,
        openIdProfile: MIDNIGHT_OPENID_PROFILE_V1,
        checkpoints: restart.checkpoints,
        flow: restart.result,
        publicSurfaceMessages: messages,
        verificationV1Decisions: decisions,
      };
    } catch (error) {
      this.audit.record({
        ...common,
        stage: stageForError(error),
        outcome: "failed",
        detail: error instanceof Error ? error.message : "execution failure",
      });
      throw error;
    }
  }
}
