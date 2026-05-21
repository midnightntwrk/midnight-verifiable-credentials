import { performance } from "node:perf_hooks";

import { MessageBus } from "@midnight-ntwrk/midnight-did-credentials-protocol";

import {
  UniversityCompanyVerifierAgent,
  UniversityIssuerProtocolAgent,
  UniversityMallVerifierAgent,
  UniversityStudentAgent,
} from "./flow-agents.js";
import {
  type UniversityIssuanceResultMessage,
  type UniversityPresentationRequestMessage,
  type UniversityPresentationResultMessage,
  type UniversityPresentationSubmissionMessage,
} from "./flow-messages.js";
import {
  buildUniversityProtocolFlowResult,
  type IssuanceFlowExecutionResult,
} from "./flow-result-builder.js";
import type {
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
} from "./model.js";
import { defaultDataPaths } from "./model.js";
import {
  assertUniversityProtocolCheckpointCompatible,
  defaultUniversityProtocolRestartPoints,
  InMemoryUniversityProtocolCheckpointStore,
  queuedMessageCount,
  type UniversityProtocolCheckpoint,
  universityProtocolCheckpointSchemaId,
  universityProtocolCheckpointSchemaVersion,
  type UniversityProtocolCheckpointStore,
  type UniversityProtocolCheckpointSummary,
  type UniversityProtocolRestartPoint,
  type UniversityProtocolRestartSimulationOptions,
  type UniversityProtocolRestartSimulationResult,
} from "./persistence.js";
import {
  decodeUniversityProtocolTransportValue,
  encodeUniversityProtocolTransportValue,
  SerializedUniversityProtocolTransport,
  type SerializedUniversityProtocolTransportCheckpoint,
} from "./process-transport.js";
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
export type {
  UniversityProtocolCheckpoint,
  UniversityProtocolCheckpointStore,
  UniversityProtocolCheckpointSummary,
  UniversityProtocolRestartPoint,
  UniversityProtocolRestartSimulationOptions,
  UniversityProtocolRestartSimulationResult,
} from "./persistence.js";

export type UniversityProtocolFlowRunnerOptions = {
  readonly dataPaths?: Partial<UniversityProtocolDataPaths>;
  readonly exerciseOptions?: UniversityProtocolExerciseOptions;
  readonly partyRuntime?: UniversityPartyRuntime;
  readonly proofExecutionBackend?: UniversityProofExecutionBackend;
  readonly transport?: MessageBus;
};

type UniversityProtocolRunnerCheckpointState = {
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

const asCheckpointState = (
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
  private checkpointSequence = 0;

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

  runAllWithRestartSimulation(
    options: UniversityProtocolRestartSimulationOptions = {},
  ): UniversityProtocolRestartSimulationResult<UniversityProtocolFlowResult> {
    const restartPoints = new Set(
      options.restartPoints ?? defaultUniversityProtocolRestartPoints,
    );
    const checkpointStore =
      options.checkpointStore ?? new InMemoryUniversityProtocolCheckpointStore();
    const checkpoints: UniversityProtocolCheckpointSummary[] = [];
    // The restart lane always uses the serialized transport so even an empty
    // restart plan still exercises process-boundary DTO encoding semantics.
    let runner = this.withSerializedTransportForRestart();

    const totalStartedAt = performance.now();
    const issuanceStartedAt = performance.now();
    runner.sendIssuanceRequests();
    runner = runner.restartIfRequested(
      "afterIssuanceRequests",
      restartPoints,
      checkpointStore,
      checkpoints,
    );
    const issuanceResult = runner.processIssuanceBatches();
    runner.deliverIssuanceResults(issuanceResult.issuedStudentIds);
    const issuanceMs = performance.now() - issuanceStartedAt;

    const jobApplicationsStartedAt = performance.now();
    runner.sendJobApplicationRequests();
    runner = runner.restartIfRequested(
      "afterJobApplicationRequests",
      restartPoints,
      checkpointStore,
      checkpoints,
    );
    runner.sendJobApplicationSubmissions();
    runner.processJobApplicationSubmissions();
    runner.deliverJobApplicationResults();
    const jobApplicationsMs = performance.now() - jobApplicationsStartedAt;

    const discountsStartedAt = performance.now();
    runner.sendDiscountRequests();
    runner = runner.restartIfRequested(
      "afterMallDiscountRequests",
      restartPoints,
      checkpointStore,
      checkpoints,
    );
    runner.sendDiscountSubmissions();
    runner.processDiscountSubmissions();
    runner.deliverDiscountResults();
    const discountsMs = performance.now() - discountsStartedAt;
    const totalMs = performance.now() - totalStartedAt;

    return {
      result: runner.buildResult({
        issuanceResult,
        issuanceMs,
        jobApplicationsMs,
        discountsMs,
        totalMs,
      }),
      checkpoints,
    };
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
    return buildUniversityProtocolFlowResult({
      issuanceResult: input.issuanceResult,
      issuanceMs: input.issuanceMs,
      jobApplicationsMs: input.jobApplicationsMs,
      discountsMs: input.discountsMs,
      totalMs: input.totalMs,
      issuanceBatches: this.issuanceBatches,
      discountApplicants: this.discountApplicants,
      issuanceMessages: this.issuanceMessages,
      jobMessages: this.jobMessages,
      discountMessages: this.discountMessages,
      companyAgents: this.companyAgents,
      mallAgent: this.mallAgent,
      transcriptEntries: this.transcript.entries,
    });
  }

  private withSerializedTransportForRestart(): UniversityProtocolFlowRunner {
    if (this.bus instanceof SerializedUniversityProtocolTransport) {
      return this;
    }
    return new UniversityProtocolFlowRunner(
      this.optionsForRestart(new SerializedUniversityProtocolTransport()),
    );
  }

  private optionsForRestart(
    transport: SerializedUniversityProtocolTransport,
  ): UniversityProtocolFlowRunnerOptions {
    // Restarts reuse deterministic runtime/proof backend instances so the
    // resumed transcript remains byte-for-byte comparable with the baseline.
    return {
      dataPaths: this.dataPaths,
      exerciseOptions: this.exerciseOptions,
      partyRuntime: this.partyRuntime,
      proofExecutionBackend: this.proofExecutionBackend,
      transport,
    };
  }

  private restartIfRequested(
    restartPoint: UniversityProtocolRestartPoint,
    restartPoints: ReadonlySet<UniversityProtocolRestartPoint>,
    checkpointStore: UniversityProtocolCheckpointStore,
    checkpoints: UniversityProtocolCheckpointSummary[],
  ): UniversityProtocolFlowRunner {
    if (!restartPoints.has(restartPoint)) {
      return this;
    }
    const checkpoint = this.buildCheckpoint(restartPoint);
    checkpointStore.save(checkpoint);
    checkpoints.push(this.summarizeCheckpoint(checkpoint));
    const restoredCheckpoint = checkpointStore.load(checkpoint.checkpointId);
    if (!restoredCheckpoint) {
      throw new Error(`Missing persisted checkpoint ${checkpoint.checkpointId}`);
    }
    return this.restoreFromCheckpoint(restoredCheckpoint);
  }

  private buildCheckpoint(
    restartPoint: UniversityProtocolRestartPoint,
  ): UniversityProtocolCheckpoint {
    const checkpointSequence = this.checkpointSequence;
    this.checkpointSequence += 1;
    return {
      schemaId: universityProtocolCheckpointSchemaId,
      schemaVersion: universityProtocolCheckpointSchemaVersion,
      compatibility: {
        minimumReaderVersion: universityProtocolCheckpointSchemaVersion,
        maximumReaderVersion: universityProtocolCheckpointSchemaVersion,
      },
      checkpointId: [
        checkpointSequence,
        restartPoint,
        this.transcript.entries.length,
        this.issuanceMessages.length,
        this.jobMessages.length,
        this.discountMessages.length,
      ].join(":"),
      restartPoint,
      encodedState: encodeUniversityProtocolTransportValue(
        this.snapshotCheckpointState(),
      ),
    };
  }

  private snapshotCheckpointState(): UniversityProtocolRunnerCheckpointState {
    if (!(this.bus instanceof SerializedUniversityProtocolTransport)) {
      throw new Error(
        "University protocol restart simulation requires a serialized transport",
      );
    }
    return {
      transport: this.bus.checkpoint(),
      checkpointSequence: this.checkpointSequence,
      transcript: [...this.transcript.entries],
      messages: {
        issuance: [...this.issuanceMessages],
        jobApplications: [...this.jobMessages],
        discounts: [...this.discountMessages],
      },
      students: [...this.studentAgents.values()].map((student) => ({
        studentId: student.record.studentId,
        ...(student.storedIssuedCredential
          ? { storedIssuedCredential: student.storedIssuedCredential }
          : {}),
        receivedResults: [...student.receivedResults],
      })),
      companies: [...this.companyAgents.values()].map((company) => ({
        companyId: company.company.companyId,
        processedThreadIds: [...company.processedThreadIds].sort(),
        acceptedCount: company.acceptedCount,
        duplicateRejectedCount: company.duplicateRejectedCount,
        verificationRejectedCount: company.verificationRejectedCount,
      })),
      mall: {
        processedThreadIds: [...this.mallAgent.processedThreadIds].sort(),
        acceptedCount: this.mallAgent.acceptedCount,
        duplicateRejectedCount: this.mallAgent.duplicateRejectedCount,
        verificationRejectedCount: this.mallAgent.verificationRejectedCount,
      },
    };
  }

  private restoreFromCheckpoint(
    checkpoint: UniversityProtocolCheckpoint,
  ): UniversityProtocolFlowRunner {
    assertUniversityProtocolCheckpointCompatible(checkpoint);
    const decodedState = decodeUniversityProtocolTransportValue(
      checkpoint.encodedState,
    );
    const state = asCheckpointState(decodedState);
    const restored = new UniversityProtocolFlowRunner(
      this.optionsForRestart(
        SerializedUniversityProtocolTransport.fromCheckpoint(state.transport),
      ),
    );
    restored.restoreCheckpointState(state);
    return restored;
  }

  private restoreCheckpointState(
    state: UniversityProtocolRunnerCheckpointState,
  ): void {
    if (
      this.transcript.entries.length > 0 ||
      this.issuanceMessages.length > 0 ||
      this.jobMessages.length > 0 ||
      this.discountMessages.length > 0
    ) {
      throw new Error(
        "Cannot restore university protocol checkpoint into a non-empty runner",
      );
    }
    this.checkpointSequence = state.checkpointSequence;
    this.transcript.entries.push(...state.transcript);
    this.issuanceMessages.push(...state.messages.issuance);
    this.jobMessages.push(...state.messages.jobApplications);
    this.discountMessages.push(...state.messages.discounts);

    for (const studentState of state.students) {
      const student = this.requireStudentAgent(studentState.studentId);
      student.storedIssuedCredential = studentState.storedIssuedCredential;
      student.receivedResults.splice(
        0,
        student.receivedResults.length,
        ...studentState.receivedResults,
      );
    }

    for (const companyState of state.companies) {
      const company = this.companyAgents.get(companyState.companyId);
      if (!company) {
        throw new Error(`Missing company agent ${companyState.companyId}`);
      }
      company.processedThreadIds.clear();
      for (const threadId of companyState.processedThreadIds) {
        company.processedThreadIds.add(threadId);
      }
      company.acceptedCount = companyState.acceptedCount;
      company.duplicateRejectedCount = companyState.duplicateRejectedCount;
      company.verificationRejectedCount = companyState.verificationRejectedCount;
    }

    this.mallAgent.processedThreadIds.clear();
    for (const threadId of state.mall.processedThreadIds) {
      this.mallAgent.processedThreadIds.add(threadId);
    }
    this.mallAgent.acceptedCount = state.mall.acceptedCount;
    this.mallAgent.duplicateRejectedCount = state.mall.duplicateRejectedCount;
    this.mallAgent.verificationRejectedCount =
      state.mall.verificationRejectedCount;
  }

  private summarizeCheckpoint(
    checkpoint: UniversityProtocolCheckpoint,
  ): UniversityProtocolCheckpointSummary {
    const decodedState = decodeUniversityProtocolTransportValue(
      checkpoint.encodedState,
    );
    const state = asCheckpointState(decodedState);
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
  }

  private runIssuance(): IssuanceFlowExecutionResult {
    this.sendIssuanceRequests();
    const issuanceResult = this.processIssuanceBatches();
    this.deliverIssuanceResults(issuanceResult.issuedStudentIds);
    return issuanceResult;
  }

  private sendIssuanceRequests(): void {
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
  }

  private processIssuanceBatches(): IssuanceFlowExecutionResult {
    return this.issuer.processIssuanceBatches(
      this.bus,
      this.studentAgents,
      this.issuanceBatches,
      this.transcript,
      this.issuanceMessages,
    );
  }

  private deliverIssuanceResults(
    issuedStudentIds: readonly string[],
  ): void {
    for (const studentId of issuedStudentIds) {
      const result = this.bus.receive(studentId) as
        | UniversityIssuanceResultMessage
        | undefined;
      if (!result) {
        throw new Error(`Missing issuance result delivery for ${studentId}`);
      }
      this.requireStudentAgent(studentId).receiveIssuanceResult(result);
    }
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
