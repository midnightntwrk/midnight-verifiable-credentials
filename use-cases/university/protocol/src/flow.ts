import { performance } from "node:perf_hooks";

import { MessageBus } from "@midnight-ntwrk/midnight-did-credentials-protocol";

import {
  UniversityCompanyVerifierAgent,
  UniversityIssuerProtocolAgent,
  UniversityMallVerifierAgent,
  UniversityStudentAgent,
} from "./flow-agents.js";
import {
  resultBodiesByStudent,
  type UniversityIssuanceResultMessage,
  type UniversityPresentationRequestMessage,
  type UniversityPresentationResultMessage,
  type UniversityPresentationSubmissionMessage,
} from "./flow-messages.js";
import type {
  CompanyRecord,
  DiscountApplicantRecord,
  IssuanceBatchRecord,
  MallRecord,
  StudentRecord,
  UniversityPresentationTamperingMode,
  UniversityProfile,
  UniversityProtocolDataPaths,
  UniversityProtocolExerciseOptions,
  UniversityProtocolFlowResult,
  UniversityProtocolMessage,
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
import { UniversityTranscriptRecorder } from "./transcript-recorder.js";

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
  readonly transport?: MessageBus;
};

type IssuanceFlowExecutionResult = {
  readonly issuedStudentIds: readonly string[];
  readonly duplicateRequestCount: number;
  readonly idempotentReplayCount: number;
  readonly idempotentReplayStudentIds: readonly string[];
};

const countMessages = (
  messages: readonly UniversityProtocolMessage[],
  type: UniversityProtocolMessage["type"],
): number => messages.filter((message) => message.type === type).length;

const sumCompanyAgentCounts = (
  agents: Iterable<UniversityCompanyVerifierAgent>,
  selector: (agent: UniversityCompanyVerifierAgent) => number,
): number => {
  let sum = 0;
  for (const agent of agents) {
    sum += selector(agent);
  }
  return sum;
};

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
  readonly bus: MessageBus;
  readonly transcript = new UniversityTranscriptRecorder();
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
        options?.exerciseOptions?.duplicateJobApplicationSubmissionStudentIds ??
        [],
      duplicateMallDiscountSubmissionStudentIds:
        options?.exerciseOptions?.duplicateMallDiscountSubmissionStudentIds ??
        [],
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
    this.bus = options?.transport ?? new MessageBus();

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
    this.studentAgents = this.buildStudentAgents();
    this.companyAgents = this.buildCompanyAgents();
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

    return this.buildResult({
      issuanceResult,
      issuanceMs,
      jobApplicationsMs,
      discountsMs,
      totalMs,
    });
  }

  private buildStudentAgents(): Map<string, UniversityStudentAgent> {
    return new Map(
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
  }

  private buildCompanyAgents(): Map<string, UniversityCompanyVerifierAgent> {
    return new Map(
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
          this.exerciseOptions.companyRequestPolicyOverrides?.[
            company.companyId
          ],
        ),
      ]),
    );
  }

  private buildResult(input: {
    readonly issuanceResult: IssuanceFlowExecutionResult;
    readonly issuanceMs: number;
    readonly jobApplicationsMs: number;
    readonly discountsMs: number;
    readonly totalMs: number;
  }): UniversityProtocolFlowResult {
    const companyAcceptedCounts = Object.fromEntries(
      [...this.companyAgents.entries()].map(([companyId, agent]) => [
        companyId,
        agent.acceptedCount,
      ]),
    );
    const companyAcceptedCount = Object.values(companyAcceptedCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
    const companyDuplicateRejectedCount = sumCompanyAgentCounts(
      this.companyAgents.values(),
      (agent) => agent.duplicateRejectedCount,
    );
    const companyVerificationRejectedCount = sumCompanyAgentCounts(
      this.companyAgents.values(),
      (agent) => agent.verificationRejectedCount,
    );
    const jobResultsByStudent = resultBodiesByStudent(
      this.jobMessages,
      "jobApplication",
    );
    const discountResultsByStudent = resultBodiesByStudent(
      this.discountMessages,
      "mallDiscount",
    );

    return {
      metrics: {
        issuanceMs: input.issuanceMs,
        jobApplicationsMs: input.jobApplicationsMs,
        discountsMs: input.discountsMs,
        totalMs: input.totalMs,
      },
      issuance: this.buildIssuanceResult(input.issuanceResult),
      jobApplications: {
        requestCount: countMessages(this.jobMessages, "presentation:request"),
        submissionCount: countMessages(
          this.jobMessages,
          "presentation:submission",
        ),
        resultCount: countMessages(this.jobMessages, "presentation:result"),
        acceptedCount: companyAcceptedCount,
        rejectedCount:
          companyDuplicateRejectedCount + companyVerificationRejectedCount,
        duplicateRejectedCount: companyDuplicateRejectedCount,
        verificationRejectedCount: companyVerificationRejectedCount,
        companyAcceptedCounts,
        resultsByStudent: jobResultsByStudent,
        messages: this.jobMessages,
      },
      discounts: this.buildDiscountResult(discountResultsByStudent),
      transcript: this.transcript.entries,
    };
  }

  private buildIssuanceResult(
    issuanceResult: IssuanceFlowExecutionResult,
  ): UniversityProtocolFlowResult["issuance"] {
    return {
      requestCount: countMessages(this.issuanceMessages, "issuance:request"),
      resultCount: countMessages(this.issuanceMessages, "issuance:result"),
      batchCount: this.issuanceBatches.length,
      duplicateRequestCount: issuanceResult.duplicateRequestCount,
      idempotentReplayCount: issuanceResult.idempotentReplayCount,
      idempotentReplayStudentIds: issuanceResult.idempotentReplayStudentIds,
      issuedStudentIds: issuanceResult.issuedStudentIds,
      messages: this.issuanceMessages,
    };
  }

  private buildDiscountResult(
    discountResultsByStudent: UniversityProtocolFlowResult["discounts"]["resultsByStudent"],
  ): UniversityProtocolFlowResult["discounts"] {
    const discountOutcomes = Object.fromEntries(
      this.discountApplicants.map((applicant) => {
        const discountResults = discountResultsByStudent[applicant.studentId];
        const firstResult = discountResults?.at(0);
        // The first result is the canonical business decision; duplicate
        // rejections emitted by the protocol guard must not overwrite it.
        return [
          applicant.studentId,
          firstResult?.accepted ? "accepted" : "rejected",
        ] as const;
      }),
    );

    return {
      requestCount: countMessages(
        this.discountMessages,
        "presentation:request",
      ),
      submissionCount: countMessages(
        this.discountMessages,
        "presentation:submission",
      ),
      resultCount: countMessages(this.discountMessages, "presentation:result"),
      acceptedCount: this.mallAgent.acceptedCount,
      rejectedCount:
        this.mallAgent.duplicateRejectedCount +
        this.mallAgent.verificationRejectedCount,
      duplicateRejectedCount: this.mallAgent.duplicateRejectedCount,
      verificationRejectedCount: this.mallAgent.verificationRejectedCount,
      outcomes: discountOutcomes,
      resultsByStudent: discountResultsByStudent,
      messages: this.discountMessages,
    };
  }

  private runIssuance(): IssuanceFlowExecutionResult {
    for (const student of this.studentAgents.values()) {
      student.sendIssuanceRequest(
        this.bus,
        this.issuer.profile.partyId,
        this.transcript,
        this.issuanceMessages,
      );
      if (
        this.duplicateIssuanceRequestStudentIds.has(student.record.studentId)
      ) {
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
      const result = this.bus.receive(studentId) as
        | UniversityIssuanceResultMessage
        | undefined;
      if (!result) {
        throw new Error(`Missing issuance result delivery for ${studentId}`);
      }
      this.requireStudentAgent(studentId).receiveIssuanceResult(result);
    }

    return issuanceResult;
  }

  private runJobApplications(): void {
    this.sendJobApplicationRequests();
    this.sendJobApplicationSubmissions();
    this.processJobApplicationSubmissions();
    this.deliverJobApplicationResults();
  }

  private sendJobApplicationRequests(): void {
    for (const student of this.studentAgents.values()) {
      const issued = student.storedIssuedCredential;
      if (!issued) {
        throw new Error(
          `Student ${student.record.studentId} has no issued credential`,
        );
      }
      const companyAgent = this.companyAgents.get(
        student.record.assignedCompanyId,
      );
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
  }

  private sendJobApplicationSubmissions(): void {
    for (const student of this.studentAgents.values()) {
      const request = this.bus.receive(student.profile.partyId) as
        | UniversityPresentationRequestMessage
        | undefined;
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
      if (
        this.duplicateJobApplicationSubmissionStudentIds.has(
          student.record.studentId,
        )
      ) {
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
  }

  private processJobApplicationSubmissions(): void {
    for (const companyAgent of this.companyAgents.values()) {
      const submissions = this.bus.drain(
        companyAgent.profile.partyId,
      ) as Array<UniversityPresentationSubmissionMessage>;
      for (const submission of submissions) {
        companyAgent.receiveSubmissionAndSendResult(
          this.bus,
          submission,
          this.transcript,
          this.jobMessages,
        );
      }
    }
  }

  private deliverJobApplicationResults(): void {
    for (const student of this.studentAgents.values()) {
      const results = this.bus.drain(
        student.profile.partyId,
      ) as Array<UniversityPresentationResultMessage>;
      if (results.length === 0) {
        throw new Error(
          `Missing job application result for ${student.record.studentId}`,
        );
      }
      for (const result of results) {
        student.receivePresentationResult(result);
      }
    }
  }

  private runDiscounts(): void {
    this.sendDiscountRequests();
    this.sendDiscountSubmissions();
    this.processDiscountSubmissions();
    this.deliverDiscountResults();
  }

  private sendDiscountRequests(): void {
    for (const applicant of this.discountApplicants) {
      const student = this.studentAgents.get(applicant.studentId);
      if (!student?.storedIssuedCredential) {
        throw new Error(
          `Missing issued student for discount applicant ${applicant.studentId}`,
        );
      }
      this.mallAgent.sendRequest(
        this.bus,
        student,
        student.storedIssuedCredential.credential.issuerVerificationMethodRef,
        this.transcript,
        this.discountMessages,
      );
    }
  }

  private sendDiscountSubmissions(): void {
    for (const applicant of this.discountApplicants) {
      const student = this.requireStudentAgent(applicant.studentId);
      const request = this.bus.receive(student.profile.partyId) as
        | UniversityPresentationRequestMessage
        | undefined;
      if (!request) {
        throw new Error(
          `Missing discount request for ${student.record.studentId}`,
        );
      }
      student.receivePresentationRequestAndSendSubmission(
        this.bus,
        request,
        this.issuer.profile,
        this.transcript,
        this.discountMessages,
      );
      if (
        this.duplicateMallDiscountSubmissionStudentIds.has(
          student.record.studentId,
        )
      ) {
        student.receivePresentationRequestAndSendSubmission(
          this.bus,
          request,
          this.issuer.profile,
          this.transcript,
          this.discountMessages,
        );
      }
    }
  }

  private processDiscountSubmissions(): void {
    const submissions = this.bus.drain(
      this.mallAgent.profile.partyId,
    ) as Array<UniversityPresentationSubmissionMessage>;
    for (const submission of submissions) {
      this.mallAgent.receiveSubmissionAndSendResult(
        this.bus,
        submission,
        this.transcript,
        this.discountMessages,
      );
    }
  }

  private deliverDiscountResults(): void {
    for (const applicant of this.discountApplicants) {
      const student = this.requireStudentAgent(applicant.studentId);
      const results = this.bus.drain(
        student.profile.partyId,
      ) as Array<UniversityPresentationResultMessage>;
      if (results.length === 0) {
        throw new Error(
          `Missing discount result for ${student.record.studentId}`,
        );
      }
      for (const result of results) {
        student.receivePresentationResult(result);
      }
    }
  }

  private requireStudentAgent(studentId: string): UniversityStudentAgent {
    const student = this.studentAgents.get(studentId);
    if (!student) {
      throw new Error(`Missing student agent ${studentId}`);
    }
    return student;
  }
}
