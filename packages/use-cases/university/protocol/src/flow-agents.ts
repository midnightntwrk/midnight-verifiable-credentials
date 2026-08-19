import type { MessageBus } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import {
  type ProtocolEnvelopeFactory,
  sha256,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";
import {
  pureCircuits as universityDiplomaPureCircuits,
  type UniversityDiplomaCredential,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";

import {
  type UniversityIssuanceRequestMessage,
  type UniversityIssuanceResultMessage,
  type UniversityPresentationRequestMessage,
  type UniversityPresentationResultMessage,
  type UniversityPresentationSubmissionMessage,
  universityProtocolMessageIdHex,
} from "./flow-messages.js";
import type {
  AgentProfile,
  CompanyRecord,
  IssuanceBatchRecord,
  MallRecord,
  StoredIssuedCredential,
  StudentRecord,
  UniversityPresentationResultBody,
  UniversityPresentationTamperingMode,
  UniversityProfile,
  UniversityProtocolMessage,
  VerifierRequestPolicyOverride,
} from "./model.js";
import type { UniversityProofExecutionBackend } from "./proof-backend.js";
import type { UniversityPartyRuntime } from "./runtime.js";
import type { UniversityTranscriptRecorder } from "./transcript-recorder.js";

/** @internal Durable verifier-side identity for an issued presentation request. */
type UniversityPresentationRequestBinding = {
  readonly threadIdHex: string;
  readonly requestMessageIdHex: string;
  readonly requestBodyRootHex: string;
  readonly verifierPartyId: string;
  readonly holderPartyId: string;
  readonly kind: "jobApplication" | "mallDiscount";
  readonly studentId: string;
};


const requestBindingFor = (
  request: UniversityPresentationRequestMessage,
): UniversityPresentationRequestBinding => ({
  threadIdHex: universityProtocolMessageIdHex(request.envelope.threadId),
  requestMessageIdHex: universityProtocolMessageIdHex(request.envelope.messageId),
  requestBodyRootHex: Buffer.from(
    universityDiplomaPureCircuits.universityDiplomaPresentationRequestBodyRoot(
      request.body.request,
    ),
  ).toString("hex"),
  verifierPartyId: request.from,
  holderPartyId: request.to,
  kind: request.body.kind,
  studentId: request.body.studentId,
});

const assertSubmissionMatchesRequestBinding = (
  submission: UniversityPresentationSubmissionMessage,
  binding: UniversityPresentationRequestBinding | undefined,
): void => {
  if (!binding) {
    throw new Error("Presentation submission does not match an issued presentation request");
  }
  if (
    submission.from !== binding.holderPartyId ||
    submission.to !== binding.verifierPartyId ||
    submission.body.kind !== binding.kind ||
    submission.body.studentId !== binding.studentId ||
    universityProtocolMessageIdHex(submission.envelope.threadId) !== binding.threadIdHex ||
    universityProtocolMessageIdHex(submission.envelope.respondsToMessageId) !==
      binding.requestMessageIdHex
  ) {
    throw new Error("Presentation submission envelope does not match original request");
  }
  const submissionRequestRoot =
    universityDiplomaPureCircuits.universityDiplomaPresentationRequestBodyRoot(
      submission.body.request,
    );
  if (
    Buffer.from(submissionRequestRoot).toString("hex") !==
    binding.requestBodyRootHex
  ) {
    throw new Error("Presentation submission request does not match original request");
  }
};
/** @internal Protocol-flow helper; not exported from the package public API. */
export class UniversityStudentAgent {
  storedIssuedCredential: StoredIssuedCredential | undefined;
  readonly receivedResults: UniversityPresentationResultBody[] = [];

  constructor(
    readonly record: StudentRecord,
    readonly profile: AgentProfile,
    readonly partyRuntime: UniversityPartyRuntime,
    readonly proofBackend: UniversityProofExecutionBackend,
    readonly createEnvelope: ProtocolEnvelopeFactory,
  ) {}

  sendIssuanceRequest(
    bus: MessageBus,
    issuerPartyId: string,
    transcript: UniversityTranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    const message: UniversityIssuanceRequestMessage = {
      type: "issuance:request",
      from: this.profile.partyId,
      to: issuerPartyId,
      envelope: this.createEnvelope(
        `university-issuance-request:${this.record.studentId}`,
        `university-issuance:${this.record.studentId}`,
        true,
      ),
      body: {
        studentId: this.record.studentId,
        holderDidUrl: this.record.holderDidUrl,
        holderMethodId: this.record.holderMethodId,
        claimValues: this.record.diplomaClaimValues,
      },
    };

    bus.send(message);
    messages.push(message);
    transcript.record(
      "issuance",
      message,
      `Student ${this.record.studentId} requested diploma issuance`,
    );
  }

  receiveIssuanceResult(message: UniversityIssuanceResultMessage): void {
    this.storedIssuedCredential = {
      credential: message.body.credential,
      credentialProof: message.body.credentialProof,
      issuedAt: message.body.issuedAt,
      credentialProofCreatedAt: message.body.credentialProofCreatedAt,
      presentationProofCreatedAt: message.body.presentationProofCreatedAt,
      issuanceChallengeHash: message.body.issuanceChallengeHash,
    };
  }

  receivePresentationRequestAndSendSubmission(
    bus: MessageBus,
    message: UniversityPresentationRequestMessage,
    issuerProfile: AgentProfile,
    transcript: UniversityTranscriptRecorder,
    messages: UniversityProtocolMessage[],
    tampering?: UniversityPresentationTamperingMode,
  ): void {
    if (!this.storedIssuedCredential) {
      throw new Error(
        `Student ${this.record.studentId} has no issued diploma credential`,
      );
    }

    const submissionBody = this.proofBackend.buildPresentationSubmission({
      kind: message.body.kind,
      issuerProfile,
      issuerRuntime: this.partyRuntime,
      holderProfile: this.profile,
      holderRuntime: this.partyRuntime,
      student: this.record,
      storedCredential: this.storedIssuedCredential,
      request: message.body.request,
      tampering,
    });

    const submission: UniversityPresentationSubmissionMessage = {
      type: "presentation:submission",
      from: this.profile.partyId,
      to: message.from,
      envelope: this.createEnvelope(
        `university-presentation-submission:${message.body.kind}:${this.record.studentId}`,
        `university-presentation:${message.body.kind}:${this.record.studentId}`,
        false,
        message.envelope.messageId,
        message.envelope.threadId,
      ),
      body: submissionBody,
    };

    bus.send(submission);
    messages.push(submission);
    transcript.record(
      message.body.kind === "jobApplication" ? "jobApplications" : "discounts",
      submission,
      tampering
        ? `Student ${this.record.studentId} submitted a tampered ${message.body.kind} presentation (${tampering})`
        : `Student ${this.record.studentId} submitted a ${message.body.kind} presentation`,
    );
  }

  receivePresentationResult(message: UniversityPresentationResultMessage): void {
    this.receivedResults.push(message.body);
  }
}

/** @internal Protocol-flow helper; not exported from the package public API. */
export class UniversityIssuerProtocolAgent {
  constructor(
    readonly university: UniversityProfile,
    readonly profile: AgentProfile,
    readonly partyRuntime: UniversityPartyRuntime,
    readonly proofBackend: UniversityProofExecutionBackend,
    readonly createEnvelope: ProtocolEnvelopeFactory,
  ) {}

  processIssuanceBatches(
    bus: MessageBus,
    studentsById: ReadonlyMap<string, UniversityStudentAgent>,
    batches: readonly IssuanceBatchRecord[],
    transcript: UniversityTranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): {
    readonly issuedStudentIds: readonly string[];
    readonly duplicateRequestCount: number;
    readonly idempotentReplayCount: number;
    readonly idempotentReplayStudentIds: readonly string[];
  } {
    const drained = bus.drain(
      this.profile.partyId,
    ) as Array<UniversityIssuanceRequestMessage>;
    const requestsByStudentId = new Map<string, UniversityIssuanceRequestMessage>();
    let duplicateRequestCount = 0;
    const idempotentReplayStudentIds = new Set<string>();
    for (const message of drained) {
      const existing = requestsByStudentId.get(message.body.studentId);
      if (existing) {
        duplicateRequestCount += 1;
        idempotentReplayStudentIds.add(message.body.studentId);
        continue;
      }
      requestsByStudentId.set(message.body.studentId, message);
    }
    const issuedStudentIds: string[] = [];

    for (const [batchIndex, batch] of batches.entries()) {
      for (const [studentOffset, studentId] of batch.studentIds.entries()) {
        const request = requestsByStudentId.get(studentId);
        const student = studentsById.get(studentId);
        if (!request || !student) {
          throw new Error(`Missing student issuance request for ${studentId}`);
        }
        if (!student.record.graduationEligible) {
          throw new Error(`Student ${studentId} is not graduation eligible`);
        }

        const batchOrdinal = batchIndex * this.university.batchSize + studentOffset;
        const issuedAt = 40_000n + BigInt(batchOrdinal);
        const credentialProofCreatedAt = 50_000n + BigInt(batchOrdinal);
        const presentationProofCreatedAt = 60_000n + BigInt(batchOrdinal);
        const issuanceChallengeHash = sha256(`university-issuance:${studentId}`);
        const result: UniversityIssuanceResultMessage = {
          type: "issuance:result",
          from: this.profile.partyId,
          to: student.profile.partyId,
          envelope: this.createEnvelope(
            `university-issuance-result:${studentId}`,
            `university-issuance:${studentId}`,
            false,
            request.envelope.messageId,
            request.envelope.threadId,
          ),
          body: {
            studentId,
            ...this.proofBackend.issueDiplomaCredential({
              issuerProfile: this.profile,
              issuerRuntime: this.partyRuntime,
              holderProfile: student.profile,
              holderRuntime: student.partyRuntime,
              student: student.record,
              issuanceChallengeHash,
              issuedAt,
              credentialProofCreatedAt,
              presentationProofCreatedAt,
            }),
          },
        };

        bus.send(result);
        messages.push(result);
        transcript.record(
          "issuance",
          result,
          `University issued diploma credential to ${studentId} in ${batch.batchId}`,
        );
        issuedStudentIds.push(studentId);
      }
    }

    return {
      issuedStudentIds,
      duplicateRequestCount,
      idempotentReplayCount: idempotentReplayStudentIds.size,
      idempotentReplayStudentIds: [...idempotentReplayStudentIds].sort(),
    };
  }
}

/** @internal Protocol-flow helper; not exported from the package public API. */
export class UniversityCompanyVerifierAgent {
  readonly processedThreadIds = new Set<string>();
  readonly presentationRequestBindings = new Map<
    string,
    UniversityPresentationRequestBinding
  >();
  acceptedCount = 0;
  duplicateRejectedCount = 0;
  verificationRejectedCount = 0;

  constructor(
    readonly company: CompanyRecord,
    readonly profile: AgentProfile,
    readonly proofBackend: UniversityProofExecutionBackend,
    readonly createEnvelope: ProtocolEnvelopeFactory,
    readonly requestPolicyOverrides?: VerifierRequestPolicyOverride,
  ) {}

  sendRequest(
    bus: MessageBus,
    student: UniversityStudentAgent,
    issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"],
    transcript: UniversityTranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    const request = this.proofBackend.buildJobApplicationRequest({
      issuerVerificationMethodRef,
      verifierChallengeHash: sha256(
        `job-application:${this.company.companyId}:${student.record.studentId}`,
      ),
      requestPolicy: this.company.requestPolicy,
      requestPolicyOverrides: this.requestPolicyOverrides,
    });

    const message: UniversityPresentationRequestMessage = {
      type: "presentation:request",
      from: this.profile.partyId,
      to: student.profile.partyId,
      envelope: this.createEnvelope(
        `job-request:${this.company.companyId}:${student.record.studentId}`,
        `job-application:${this.company.companyId}:${student.record.studentId}`,
        true,
      ),
      body: {
        kind: "jobApplication",
        studentId: student.record.studentId,
        request,
        requestedRole: student.record.requestedJobRole,
        verifierId: this.company.companyId,
      },
    };

    this.primePresentationRequestBinding(message);
    bus.send(message);
    messages.push(message);
    transcript.record(
      "jobApplications",
      message,
      `Company ${this.company.companyId} requested a diploma presentation from ${student.record.studentId}`,
    );
  }

  primePresentationRequestBinding(
    request: UniversityPresentationRequestMessage,
  ): void {
    const binding = requestBindingFor(request);
    this.presentationRequestBindings.set(binding.threadIdHex, binding);
  }

  receiveSubmissionAndSendResult(
    bus: MessageBus,
    message: UniversityPresentationSubmissionMessage,
    transcript: UniversityTranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    let accepted = true;
    let reason = "job application accepted";
    let rejectionKind: UniversityPresentationResultBody["rejectionKind"] = "none";
    const threadIdHex = universityProtocolMessageIdHex(message.envelope.threadId);

    if (this.processedThreadIds.has(threadIdHex)) {
      accepted = false;
      reason = `duplicate job application submission for thread ${threadIdHex}`;
      rejectionKind = "duplicate";
      this.duplicateRejectedCount += 1;
    } else {
      this.processedThreadIds.add(threadIdHex);
      try {
        assertSubmissionMatchesRequestBinding(
          message,
          this.presentationRequestBindings.get(threadIdHex),
        );
        this.proofBackend.verifyJobApplication({
          submission: message.body,
        });
        this.acceptedCount += 1;
      } catch (error) {
        accepted = false;
        reason = error instanceof Error ? error.message : String(error);
        rejectionKind = "verificationFailed";
        this.verificationRejectedCount += 1;
      }
    }

    const result: UniversityPresentationResultMessage = {
      type: "presentation:result",
      from: this.profile.partyId,
      to: message.from,
      envelope: this.createEnvelope(
        `job-result:${this.company.companyId}:${message.body.studentId}`,
        `job-application:${this.company.companyId}:${message.body.studentId}`,
        false,
        message.envelope.messageId,
        message.envelope.threadId,
      ),
      body: {
        kind: "jobApplication",
        studentId: message.body.studentId,
        accepted,
        reason,
        rejectionKind,
      },
    };

    bus.send(result);
    messages.push(result);
    transcript.record(
      "jobApplications",
      result,
      `Company ${this.company.companyId} returned ${accepted ? "accepted" : "rejected"} for ${message.body.studentId}`,
    );
  }
}

/** @internal Protocol-flow helper; not exported from the package public API. */
export class UniversityMallVerifierAgent {
  readonly presentationRequestBindings = new Map<
    string,
    UniversityPresentationRequestBinding
  >();
  readonly processedThreadIds = new Set<string>();
  acceptedCount = 0;
  duplicateRejectedCount = 0;
  verificationRejectedCount = 0;

  constructor(
    readonly mall: MallRecord,
    readonly profile: AgentProfile,
    readonly proofBackend: UniversityProofExecutionBackend,
    readonly createEnvelope: ProtocolEnvelopeFactory,
  ) {}

  sendRequest(
    bus: MessageBus,
    student: UniversityStudentAgent,
    issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"],
    transcript: UniversityTranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    const request = this.proofBackend.buildMallDiscountRequest({
      issuerVerificationMethodRef,
      verifierChallengeHash: sha256(
        `discount:${this.mall.mallId}:${student.record.studentId}`,
      ),
      minimumFinalGrade: BigInt(this.mall.requestPolicy.minimumFinalGrade ?? 0),
    });

    const message: UniversityPresentationRequestMessage = {
      type: "presentation:request",
      from: this.profile.partyId,
      to: student.profile.partyId,
      envelope: this.createEnvelope(
        `discount-request:${this.mall.mallId}:${student.record.studentId}`,
        `discount:${this.mall.mallId}:${student.record.studentId}`,
        true,
      ),
      body: {
        kind: "mallDiscount",
        studentId: student.record.studentId,
        request,
        verifierId: this.mall.mallId,
      },
    };

    this.primePresentationRequestBinding(message);

    bus.send(message);
    messages.push(message);
    transcript.record(
      "discounts",
      message,
      `Mall ${this.mall.mallId} requested a diploma presentation from ${student.record.studentId}`,
    );
  }

  primePresentationRequestBinding(
    request: UniversityPresentationRequestMessage,
  ): void {
    const binding = requestBindingFor(request);
    this.presentationRequestBindings.set(binding.threadIdHex, binding);
  }

  receiveSubmissionAndSendResult(
    bus: MessageBus,
    message: UniversityPresentationSubmissionMessage,
    transcript: UniversityTranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    let accepted = true;
    let reason = "mall discount accepted";
    let rejectionKind: UniversityPresentationResultBody["rejectionKind"] = "none";
    const threadIdHex = universityProtocolMessageIdHex(message.envelope.threadId);

    if (this.processedThreadIds.has(threadIdHex)) {
      accepted = false;
      reason = `duplicate mall discount submission for thread ${threadIdHex}`;
      rejectionKind = "duplicate";
      this.duplicateRejectedCount += 1;
    } else {
      this.processedThreadIds.add(threadIdHex);
      try {
        assertSubmissionMatchesRequestBinding(
          message,
          this.presentationRequestBindings.get(threadIdHex),
        );
        this.proofBackend.verifyMallDiscount({
          submission: message.body,
        });
        this.acceptedCount += 1;
      } catch (error) {
        accepted = false;
        reason = error instanceof Error ? error.message : String(error);
        rejectionKind = "verificationFailed";
        this.verificationRejectedCount += 1;
      }
    }

    const result: UniversityPresentationResultMessage = {
      type: "presentation:result",
      from: this.profile.partyId,
      to: message.from,
      envelope: this.createEnvelope(
        `discount-result:${this.mall.mallId}:${message.body.studentId}`,
        `discount:${this.mall.mallId}:${message.body.studentId}`,
        false,
        message.envelope.messageId,
        message.envelope.threadId,
      ),
      body: {
        kind: "mallDiscount",
        studentId: message.body.studentId,
        accepted,
        reason,
        rejectionKind,
      },
    };

    bus.send(result);
    messages.push(result);
    transcript.record(
      "discounts",
      result,
      `Mall ${this.mall.mallId} returned ${accepted ? "accepted" : "rejected"} for ${message.body.studentId}`,
    );
  }
}
