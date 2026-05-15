import { performance } from "node:perf_hooks";

import {
  createEnvelope,
  MessageBus,
  sha256,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";
import type { UniversityDiplomaCredential } from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";

import type {
  AgentProfile,
  CompanyRecord,
  DiscountApplicantRecord,
  IssuanceBatchRecord,
  MallRecord,
  StoredIssuedCredential,
  StudentRecord,
  UniversityPresentationResultBody,
  UniversityPresentationTamperingMode,
  UniversityProfile,
  UniversityProtocolDataPaths,
  UniversityProtocolExerciseOptions,
  UniversityProtocolFlowResult,
  UniversityProtocolMessage,
  UniversityProtocolTranscriptEntry,
  VerifierRequestPolicyOverride,
} from "./model.js";
import { defaultDataPaths } from "./model.js";
import {
  SimulatorUniversityProofExecutionBackend,
  type UniversityProofExecutionBackend,
} from "./proof-backend.js";
import {
  DeterministicUniversityPartyRuntime,
  loadUniversityFixtureData,
  type UniversityPartyRuntime,
} from "./runtime.js";

export type {
  UniversityPresentationTamperingMode,
  UniversityProtocolDataPaths,
  UniversityProtocolExerciseOptions,
  UniversityProtocolFlowResult,
  UniversityProtocolTranscriptEntry,
} from "./model.js";

export type UniversityProtocolFlowRunnerOptions = {
  readonly dataPaths?: Partial<UniversityProtocolDataPaths>;
  readonly exerciseOptions?: UniversityProtocolExerciseOptions;
  readonly partyRuntime?: UniversityPartyRuntime;
  readonly proofExecutionBackend?: UniversityProofExecutionBackend;
};

const hex = (value: Uint8Array): string => Buffer.from(value).toString("hex");

type UniversityIssuanceRequestMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "issuance:request" }
>;
type UniversityIssuanceResultMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "issuance:result" }
>;
type UniversityPresentationRequestMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "presentation:request" }
>;
type UniversityPresentationSubmissionMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "presentation:submission" }
>;
type UniversityPresentationResultMessage = Extract<
  UniversityProtocolMessage,
  { readonly type: "presentation:result" }
>;

const isPresentationResultMessage = (
  message: UniversityProtocolMessage,
): message is UniversityPresentationResultMessage =>
  message.type === "presentation:result";

const resultBodiesByStudent = (
  messages: readonly UniversityProtocolMessage[],
  kind: UniversityPresentationResultBody["kind"],
): Readonly<Record<string, readonly UniversityPresentationResultBody[]>> => {
  const grouped = new Map<string, UniversityPresentationResultBody[]>();
  for (const message of messages) {
    if (!isPresentationResultMessage(message) || message.body.kind !== kind) {
      continue;
    }
    const existing = grouped.get(message.body.studentId);
    if (existing) {
      existing.push(message.body);
    } else {
      grouped.set(message.body.studentId, [message.body]);
    }
  }
  return Object.fromEntries(grouped.entries());
};

class TranscriptRecorder {
  readonly entries: UniversityProtocolTranscriptEntry[] = [];

  record(
    phase: UniversityProtocolTranscriptEntry["phase"],
    message: UniversityProtocolMessage,
    summary: string,
  ): void {
    this.entries.push({
      phase,
      type: message.type,
      from: message.from,
      to: message.to,
      threadIdHex: hex(message.envelope.threadId),
      messageIdHex: hex(message.envelope.messageId),
      respondsToHex: hex(message.envelope.respondsToMessageId),
      summary,
    });
  }
}

class UniversityStudentAgent {
  storedIssuedCredential: StoredIssuedCredential | undefined;
  readonly receivedResults: UniversityPresentationResultBody[] = [];

  constructor(
    readonly record: StudentRecord,
    readonly profile: AgentProfile,
    readonly partyRuntime: UniversityPartyRuntime,
    readonly proofBackend: UniversityProofExecutionBackend,
  ) {}

  sendIssuanceRequest(
    bus: MessageBus,
    issuerPartyId: string,
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    const message: UniversityIssuanceRequestMessage = {
      type: "issuance:request",
      from: this.profile.partyId,
      to: issuerPartyId,
      envelope: createEnvelope(
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
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
    tampering?: UniversityPresentationTamperingMode,
  ): void {
    if (!this.storedIssuedCredential) {
      throw new Error(`Student ${this.record.studentId} has no issued diploma credential`);
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
      envelope: createEnvelope(
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

class UniversityIssuerProtocolAgent {
  constructor(
    readonly university: UniversityProfile,
    readonly profile: AgentProfile,
    readonly partyRuntime: UniversityPartyRuntime,
    readonly proofBackend: UniversityProofExecutionBackend,
  ) {}

  processIssuanceBatches(
    bus: MessageBus,
    studentsById: ReadonlyMap<string, UniversityStudentAgent>,
    batches: readonly IssuanceBatchRecord[],
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): {
    readonly issuedStudentIds: readonly string[];
    readonly duplicateRequestCount: number;
    readonly idempotentReplayCount: number;
    readonly idempotentReplayStudentIds: readonly string[];
  } {
    const drained = bus.drain(this.profile.partyId) as Array<UniversityIssuanceRequestMessage>;
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
          envelope: createEnvelope(
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

class UniversityCompanyVerifierAgent {
  readonly processedThreadIds = new Set<string>();
  acceptedCount = 0;
  duplicateRejectedCount = 0;
  verificationRejectedCount = 0;

  constructor(
    readonly company: CompanyRecord,
    readonly profile: AgentProfile,
    readonly proofBackend: UniversityProofExecutionBackend,
    readonly requestPolicyOverrides?: VerifierRequestPolicyOverride,
  ) {}

  sendRequest(
    bus: MessageBus,
    student: UniversityStudentAgent,
    issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"],
    transcript: TranscriptRecorder,
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
      envelope: createEnvelope(
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

    bus.send(message);
    messages.push(message);
    transcript.record(
      "jobApplications",
      message,
      `Company ${this.company.companyId} requested a diploma presentation from ${student.record.studentId}`,
    );
  }

  receiveSubmissionAndSendResult(
    bus: MessageBus,
    message: UniversityPresentationSubmissionMessage,
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    let accepted = true;
    let reason = "job application accepted";
    let rejectionKind: UniversityPresentationResultBody["rejectionKind"] = "none";
    const threadIdHex = hex(message.envelope.threadId);

    if (this.processedThreadIds.has(threadIdHex)) {
      accepted = false;
      reason = `duplicate job application submission for thread ${threadIdHex}`;
      rejectionKind = "duplicate";
      this.duplicateRejectedCount += 1;
    } else {
      this.processedThreadIds.add(threadIdHex);
      try {
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
      envelope: createEnvelope(
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

class UniversityMallVerifierAgent {
  readonly processedThreadIds = new Set<string>();
  acceptedCount = 0;
  duplicateRejectedCount = 0;
  verificationRejectedCount = 0;

  constructor(
    readonly mall: MallRecord,
    readonly profile: AgentProfile,
    readonly proofBackend: UniversityProofExecutionBackend,
  ) {}

  sendRequest(
    bus: MessageBus,
    student: UniversityStudentAgent,
    issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"],
    transcript: TranscriptRecorder,
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
      envelope: createEnvelope(
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

    bus.send(message);
    messages.push(message);
    transcript.record(
      "discounts",
      message,
      `Mall ${this.mall.mallId} requested a diploma presentation from ${student.record.studentId}`,
    );
  }

  receiveSubmissionAndSendResult(
    bus: MessageBus,
    message: UniversityPresentationSubmissionMessage,
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    let accepted = true;
    let reason = "mall discount accepted";
    let rejectionKind: UniversityPresentationResultBody["rejectionKind"] = "none";
    const threadIdHex = hex(message.envelope.threadId);

    if (this.processedThreadIds.has(threadIdHex)) {
      accepted = false;
      reason = `duplicate mall discount submission for thread ${threadIdHex}`;
      rejectionKind = "duplicate";
      this.duplicateRejectedCount += 1;
    } else {
      this.processedThreadIds.add(threadIdHex);
      try {
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
      envelope: createEnvelope(
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

export class UniversityProtocolFlowRunner {
  readonly dataPaths: UniversityProtocolDataPaths;
  readonly exerciseOptions: UniversityProtocolExerciseOptions;
  readonly partyRuntime: UniversityPartyRuntime;
  readonly proofExecutionBackend: UniversityProofExecutionBackend;
  readonly duplicateIssuanceRequestStudentIds: ReadonlySet<string>;
  readonly duplicateJobApplicationSubmissionStudentIds: ReadonlySet<string>;
  readonly duplicateMallDiscountSubmissionStudentIds: ReadonlySet<string>;
  readonly jobApplicationTamperingByStudentId: Readonly<
    Record<string, UniversityPresentationTamperingMode>
  >;
  readonly university: UniversityProfile;
  readonly students: StudentRecord[];
  readonly companies: CompanyRecord[];
  readonly mall: MallRecord;
  readonly issuanceBatches: IssuanceBatchRecord[];
  readonly discountApplicants: DiscountApplicantRecord[];
  readonly bus = new MessageBus();
  readonly transcript = new TranscriptRecorder();
  readonly issuanceMessages: UniversityProtocolMessage[] = [];
  readonly jobMessages: UniversityProtocolMessage[] = [];
  readonly discountMessages: UniversityProtocolMessage[] = [];
  readonly issuer: UniversityIssuerProtocolAgent;
  readonly studentAgents: Map<string, UniversityStudentAgent>;
  readonly companyAgents: Map<string, UniversityCompanyVerifierAgent>;
  readonly mallAgent: UniversityMallVerifierAgent;

  constructor(options?: UniversityProtocolFlowRunnerOptions) {
    this.dataPaths = {
      ...defaultDataPaths,
      ...options?.dataPaths,
    };
    this.exerciseOptions = {
      companyRequestPolicyOverrides:
        options?.exerciseOptions?.companyRequestPolicyOverrides ?? {},
      duplicateIssuanceRequestStudentIds:
        options?.exerciseOptions?.duplicateIssuanceRequestStudentIds ?? [],
      duplicateJobApplicationSubmissionStudentIds:
        options?.exerciseOptions?.duplicateJobApplicationSubmissionStudentIds ?? [],
      duplicateMallDiscountSubmissionStudentIds:
        options?.exerciseOptions?.duplicateMallDiscountSubmissionStudentIds ?? [],
      jobApplicationTamperingByStudentId:
        options?.exerciseOptions?.jobApplicationTamperingByStudentId ?? {},
    };
    this.duplicateIssuanceRequestStudentIds = new Set(
      this.exerciseOptions.duplicateIssuanceRequestStudentIds ?? [],
    );
    this.duplicateJobApplicationSubmissionStudentIds = new Set(
      this.exerciseOptions.duplicateJobApplicationSubmissionStudentIds ?? [],
    );
    this.duplicateMallDiscountSubmissionStudentIds = new Set(
      this.exerciseOptions.duplicateMallDiscountSubmissionStudentIds ?? [],
    );
    this.jobApplicationTamperingByStudentId = Object.freeze({
      ...(this.exerciseOptions.jobApplicationTamperingByStudentId ?? {}),
    });
    this.partyRuntime =
      options?.partyRuntime ?? new DeterministicUniversityPartyRuntime();
    this.proofExecutionBackend =
      options?.proofExecutionBackend ??
      new SimulatorUniversityProofExecutionBackend();
    const fixtureData = loadUniversityFixtureData(this.dataPaths);
    this.university = fixtureData.university;
    this.students = [...fixtureData.students];
    this.companies = [...fixtureData.companies];
    this.mall = fixtureData.mall;
    this.issuanceBatches = [...fixtureData.issuanceBatches];
    this.discountApplicants = [...fixtureData.discountApplicants];
    this.issuer = new UniversityIssuerProtocolAgent(
      this.university,
      this.partyRuntime.issuerProfileForUniversity(this.university),
      this.partyRuntime,
      this.proofExecutionBackend,
    );
    this.studentAgents = new Map(
      this.students.map((student) => [
        student.studentId,
        new UniversityStudentAgent(
          student,
          this.partyRuntime.studentProfileForStudent(student),
          this.partyRuntime,
          this.proofExecutionBackend,
        ),
      ]),
    );
    this.companyAgents = new Map(
      this.companies.map((company) => [
        company.companyId,
        new UniversityCompanyVerifierAgent(
          company,
          this.partyRuntime.verifierProfile(
            company.companyId,
            company.verifierDidUrl,
            company.verifierMethodId,
          ),
          this.proofExecutionBackend,
          this.exerciseOptions.companyRequestPolicyOverrides?.[company.companyId],
        ),
      ]),
    );
    this.mallAgent = new UniversityMallVerifierAgent(
      this.mall,
      this.partyRuntime.verifierProfile(
        this.mall.mallId,
        this.mall.verifierDidUrl,
        this.mall.verifierMethodId,
      ),
      this.proofExecutionBackend,
    );
  }

  runAll(): UniversityProtocolFlowResult {
    const totalStartedAt = performance.now();
    const issuanceStartedAt = performance.now();
    const issuanceResult = this.runIssuance();
    const issuanceMs = performance.now() - issuanceStartedAt;
    const jobApplicationsStartedAt = performance.now();
    this.runJobApplications();
    const jobApplicationsMs = performance.now() - jobApplicationsStartedAt;
    const discountsStartedAt = performance.now();
    this.runDiscounts();
    const discountsMs = performance.now() - discountsStartedAt;
    const totalMs = performance.now() - totalStartedAt;

    const companyAcceptedCounts = Object.fromEntries(
      [...this.companyAgents.entries()].map(([companyId, agent]) => [companyId, agent.acceptedCount]),
    );
    const companyDuplicateRejectedCount = [...this.companyAgents.values()].reduce(
      (sum, agent) => sum + agent.duplicateRejectedCount,
      0,
    );
    const companyVerificationRejectedCount = [...this.companyAgents.values()].reduce(
      (sum, agent) => sum + agent.verificationRejectedCount,
      0,
    );
    const jobResultsByStudent = resultBodiesByStudent(
      this.jobMessages,
      "jobApplication",
    );
    const discountResultsByStudent = resultBodiesByStudent(
      this.discountMessages,
      "mallDiscount",
    );
    const discountOutcomes = Object.fromEntries(
      this.discountApplicants.map((applicant) => {
        const discountResults = discountResultsByStudent[applicant.studentId];
        const firstResult = discountResults?.at(0);
        // The first result is the canonical business decision; any later result
        // for the same thread is necessarily a duplicate rejection emitted by
        // the protocol guard and must not overwrite the original outcome.
        return [applicant.studentId, firstResult?.accepted ? "accepted" : "rejected"] as const;
      }),
    );

    return {
      metrics: {
        issuanceMs,
        jobApplicationsMs,
        discountsMs,
        totalMs,
      },
      issuance: {
        requestCount: this.issuanceMessages.filter((message) => message.type === "issuance:request").length,
        resultCount: this.issuanceMessages.filter((message) => message.type === "issuance:result").length,
        batchCount: this.issuanceBatches.length,
        duplicateRequestCount: issuanceResult.duplicateRequestCount,
        idempotentReplayCount: issuanceResult.idempotentReplayCount,
        idempotentReplayStudentIds: issuanceResult.idempotentReplayStudentIds,
        issuedStudentIds: issuanceResult.issuedStudentIds,
        messages: this.issuanceMessages,
      },
      jobApplications: {
        requestCount: this.jobMessages.filter((message) => message.type === "presentation:request").length,
        submissionCount: this.jobMessages.filter((message) => message.type === "presentation:submission").length,
        resultCount: this.jobMessages.filter((message) => message.type === "presentation:result").length,
        acceptedCount: Object.values(companyAcceptedCounts).reduce((sum, count) => sum + count, 0),
        rejectedCount: companyDuplicateRejectedCount + companyVerificationRejectedCount,
        duplicateRejectedCount: companyDuplicateRejectedCount,
        verificationRejectedCount: companyVerificationRejectedCount,
        companyAcceptedCounts,
        resultsByStudent: jobResultsByStudent,
        messages: this.jobMessages,
      },
      discounts: {
        requestCount: this.discountMessages.filter((message) => message.type === "presentation:request").length,
        submissionCount: this.discountMessages.filter((message) => message.type === "presentation:submission").length,
        resultCount: this.discountMessages.filter((message) => message.type === "presentation:result").length,
        acceptedCount: this.mallAgent.acceptedCount,
        rejectedCount:
          this.mallAgent.duplicateRejectedCount +
          this.mallAgent.verificationRejectedCount,
        duplicateRejectedCount: this.mallAgent.duplicateRejectedCount,
        verificationRejectedCount: this.mallAgent.verificationRejectedCount,
        outcomes: discountOutcomes,
        resultsByStudent: discountResultsByStudent,
        messages: this.discountMessages,
      },
      transcript: this.transcript.entries,
    };
  }

  private runIssuance(): {
    readonly issuedStudentIds: readonly string[];
    readonly duplicateRequestCount: number;
    readonly idempotentReplayCount: number;
    readonly idempotentReplayStudentIds: readonly string[];
  } {
    for (const student of this.studentAgents.values()) {
      student.sendIssuanceRequest(
        this.bus,
        this.issuer.profile.partyId,
        this.transcript,
        this.issuanceMessages,
      );
      if (this.duplicateIssuanceRequestStudentIds.has(student.record.studentId)) {
        student.sendIssuanceRequest(
          this.bus,
          this.issuer.profile.partyId,
          this.transcript,
          this.issuanceMessages,
        );
      }
    }

    const issuanceResult = this.issuer.processIssuanceBatches(
      this.bus,
      this.studentAgents,
      this.issuanceBatches,
      this.transcript,
      this.issuanceMessages,
    );

    for (const studentId of issuanceResult.issuedStudentIds) {
      const result = this.bus.receive(studentId) as UniversityIssuanceResultMessage | undefined;
      if (!result) {
        throw new Error(`Missing issuance result delivery for ${studentId}`);
      }
      this.studentAgents.get(studentId)!.receiveIssuanceResult(result);
    }

    return issuanceResult;
  }

  private runJobApplications(): void {
    for (const student of this.studentAgents.values()) {
      const issued = student.storedIssuedCredential;
      if (!issued) {
        throw new Error(`Student ${student.record.studentId} has no issued credential`);
      }
      const companyAgent = this.companyAgents.get(student.record.assignedCompanyId);
      if (!companyAgent) {
        throw new Error(`Missing company ${student.record.assignedCompanyId}`);
      }

      companyAgent.sendRequest(
        this.bus,
        student,
        issued.credential.issuerVerificationMethodRef,
        this.transcript,
        this.jobMessages,
      );
    }

    for (const student of this.studentAgents.values()) {
      const request = this.bus.receive(student.profile.partyId) as UniversityPresentationRequestMessage | undefined;
      if (!request) {
        throw new Error(`Missing job request for ${student.record.studentId}`);
      }
      student.receivePresentationRequestAndSendSubmission(
        this.bus,
        request,
        this.issuer.profile,
        this.transcript,
        this.jobMessages,
        this.jobApplicationTamperingByStudentId[student.record.studentId],
      );
      if (this.duplicateJobApplicationSubmissionStudentIds.has(student.record.studentId)) {
        student.receivePresentationRequestAndSendSubmission(
          this.bus,
          request,
          this.issuer.profile,
          this.transcript,
          this.jobMessages,
          this.jobApplicationTamperingByStudentId[student.record.studentId],
        );
      }
    }

    for (const companyAgent of this.companyAgents.values()) {
      const submissions = this.bus.drain(companyAgent.profile.partyId) as Array<UniversityPresentationSubmissionMessage>;
      for (const submission of submissions) {
        companyAgent.receiveSubmissionAndSendResult(
          this.bus,
          submission,
          this.transcript,
          this.jobMessages,
        );
      }
    }

    for (const student of this.studentAgents.values()) {
      const results = this.bus.drain(student.profile.partyId) as Array<
        UniversityPresentationResultMessage
      >;
      if (results.length === 0) {
        throw new Error(`Missing job application result for ${student.record.studentId}`);
      }
      for (const result of results) {
        student.receivePresentationResult(result);
      }
    }
  }

  private runDiscounts(): void {
    for (const applicant of this.discountApplicants) {
      const student = this.studentAgents.get(applicant.studentId);
      if (!student || !student.storedIssuedCredential) {
        throw new Error(`Missing issued student for discount applicant ${applicant.studentId}`);
      }
      this.mallAgent.sendRequest(
        this.bus,
        student,
        student.storedIssuedCredential.credential.issuerVerificationMethodRef,
        this.transcript,
        this.discountMessages,
      );
    }

    for (const applicant of this.discountApplicants) {
      const student = this.studentAgents.get(applicant.studentId)!;
      const request = this.bus.receive(student.profile.partyId) as UniversityPresentationRequestMessage | undefined;
      if (!request) {
        throw new Error(`Missing discount request for ${student.record.studentId}`);
      }
      student.receivePresentationRequestAndSendSubmission(
        this.bus,
        request,
        this.issuer.profile,
        this.transcript,
        this.discountMessages,
      );
      if (this.duplicateMallDiscountSubmissionStudentIds.has(student.record.studentId)) {
        student.receivePresentationRequestAndSendSubmission(
          this.bus,
          request,
          this.issuer.profile,
          this.transcript,
          this.discountMessages,
        );
      }
    }

    const submissions = this.bus.drain(this.mallAgent.profile.partyId) as Array<UniversityPresentationSubmissionMessage>;
    for (const submission of submissions) {
      this.mallAgent.receiveSubmissionAndSendResult(
        this.bus,
        submission,
        this.transcript,
        this.discountMessages,
      );
    }

    for (const applicant of this.discountApplicants) {
      const student = this.studentAgents.get(applicant.studentId)!;
      const results = this.bus.drain(student.profile.partyId) as Array<
        UniversityPresentationResultMessage
      >;
      if (results.length === 0) {
        throw new Error(`Missing discount result for ${student.record.studentId}`);
      }
      for (const result of results) {
        student.receivePresentationResult(result);
      }
    }
  }
}
