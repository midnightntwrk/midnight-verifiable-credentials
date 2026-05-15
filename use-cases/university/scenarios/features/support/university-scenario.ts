import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

import { Ability, type UsesAbilities } from "@serenity-js/core";
import { JUBJUB_SUBGROUP_ORDER } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import {
  DeterministicUniversityPartyRuntime,
  SimulatorUniversityProofExecutionBackend,
  type CompanyRecord,
  type DiscountApplicantRecord,
  type IssuanceBatchRecord,
  type MallRecord,
  type StudentRecord,
  type UniversityProfile as ProtocolUniversityProfile,
  type UniversityPresentationTamperingMode,
  UniversityProtocolFlowRunner,
  type UniversityProtocolExerciseOptions,
  type UniversityProtocolFlowResult,
  type VerifierRequestPolicy,
} from "@midnight-ntwrk/midnight-did-university-protocol/testing";

import {
  type UniversityDiplomaClaims,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";
import {
  createUniversityDiplomaFixture,
  padText,
  type UniversityDiplomaFixture,
  type UniversityDiplomaRequestOptions,
  type UniversityDiplomaSignerOptions,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";

import {
  type ScenarioDataPaths,
  type UniversityScenarioBackendContext,
  defaultDataPaths,
  resolveScenarioRepoPath,
} from "./university-scenario-backend.js";

type UniversityProfile = ProtocolUniversityProfile & {
  readonly credentialFamilyPackage: string;
  readonly schemaId: string;
  readonly holderBindingProfile: string;
  readonly statusModel: string;
  readonly isRevocable: boolean;
  readonly graduationYear: number;
  readonly graduationMonth: number;
  readonly supportsBatchIssuance: boolean;
  readonly claimEncoding: {
    readonly stringLikeFields: string;
    readonly integerFields: string;
    readonly fieldLengths?: Record<string, number>;
  };
};

type UniversityRequestPolicyPreset = {
  readonly presetId: string;
  readonly kind: "jobApplication" | "mallDiscount";
  readonly title: string;
  readonly purpose: string;
  readonly requestPolicy: VerifierRequestPolicy;
};


type MetricSample = {
  readonly name: string;
  readonly durationMs: number;
  readonly tags?: Record<string, string | number | boolean>;
};

type IssuanceBatchMetric = {
  readonly batchId: string;
  readonly size: number;
  readonly queueWaitMs: number;
  readonly compileMs: number;
  readonly signMs: number;
  readonly deliveryMs: number;
};

type IssuanceScenarioResult = {
  readonly totalStudents: number;
  readonly batchCount: number;
  readonly acceptedRequestCount: number;
  readonly duplicateRequestCount: number;
  readonly idempotentReplayCount: number;
  readonly idempotentReplayStudentIds: readonly string[];
  readonly issuedCredentialCount: number;
  readonly partitionMatchesPlan: boolean;
  readonly metricNames: readonly string[];
  readonly batchMetrics: readonly IssuanceBatchMetric[];
  readonly credentialsPerSecond: number;
  readonly sampleRequests: ReadonlyArray<{
    readonly studentId: string;
    readonly holderDidUrl: string;
    readonly holderMethodId: string;
    readonly diplomaId: string;
    readonly awardName: string;
    readonly finalGrade: number;
  }>;
  readonly sampleIssuedCredentials: ReadonlyArray<{
    readonly studentId: string;
    readonly issuerVerificationMethodRef: string;
    readonly universityName: string;
    readonly awardName: string;
    readonly finalGrade: string;
  }>;
};

type JobApplicationScenarioResult = {
  readonly totalStudents: number;
  readonly acceptedApplications: number;
  readonly duplicateRejectedCount: number;
  readonly verificationRejectedCount: number;
  readonly protocolPhaseMs: number;
  readonly metricNames: readonly string[];
  readonly companyAcceptedCounts: Readonly<Record<string, number>>;
};

type DiscountScenarioResult = {
  readonly studentId: string;
  readonly finalGrade: number;
  readonly outcome: "accepted" | "rejected";
  readonly explanation: string;
  readonly duplicateRejectedCount: number;
  readonly verificationRejectedCount: number;
  readonly protocolPhaseMs: number;
  readonly metricNames: readonly string[];
};

type PresentationResultView = {
  readonly kind: "jobApplication" | "mallDiscount";
  readonly studentId: string;
  readonly accepted: boolean;
  readonly reason: string;
  readonly rejectionKind: "none" | "verificationFailed" | "duplicate";
};

type TranscriptEntryView = {
  readonly type: string;
  readonly from: string;
  readonly to: string;
  readonly fromDidUrl: string;
  readonly fromMethodId: string;
  readonly toDidUrl: string;
  readonly toMethodId: string;
  readonly summary: string;
  readonly messageIdHex: string;
  readonly respondsToHex: string;
  readonly dto: unknown;
};

type TranscriptThreadView = {
  readonly threadIdHex: string;
  readonly studentId: string | null;
  readonly verifierId: string | null;
  readonly entries: readonly TranscriptEntryView[];
};

type VirtualStudentAgent = {
  readonly record: StudentRecord;
  readonly signerConfig: UniversityDiplomaSignerOptions;
  issuedFixture?: UniversityDiplomaFixture;
};

type IssuanceRequest = {
  readonly student: VirtualStudentAgent;
  readonly acceptedAt: number;
};

let cachedRequestPolicyPresetCatalog:
  | Readonly<Record<string, UniversityRequestPolicyPreset>>
  | undefined;

class MetricRecorder {
  readonly samples: MetricSample[] = [];

  record<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string | number | boolean>,
  ): T {
    const startedAt = performance.now();
    try {
      return fn();
    } finally {
      this.samples.push({
        name,
        durationMs: performance.now() - startedAt,
        tags,
      });
    }
  }

  measure<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string | number | boolean>,
  ): { readonly value: T; readonly durationMs: number } {
    const startedAt = performance.now();
    const value = fn();
    const durationMs = performance.now() - startedAt;
    this.samples.push({
      name,
      durationMs,
      tags,
    });
    return { value, durationMs };
  }

  mark(
    name: string,
    tags?: Record<string, string | number | boolean>,
  ): void {
    // NOTE: `mark` records tagged events, not timed measurements. Callers
    // should keep the name distinct from `record`/`measure` samples.
    this.samples.push({
      name,
      durationMs: 0,
      tags,
    });
  }

  observe(
    name: string,
    durationMs: number,
    tags?: Record<string, string | number | boolean>,
  ): void {
    this.samples.push({
      name,
      durationMs,
      tags,
    });
  }

  names(): string[] {
    return [...new Set(this.samples.map((sample) => sample.name))].sort();
  }
}

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  BigInt(`0x${Buffer.from(bytes).toString("hex")}`);

const bytesToHex = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString("hex");

const paddedTextToString = (value: Uint8Array): string =>
  new TextDecoder().decode(value).replace(/\u0000+$/u, "");

type PartyEndpoint = {
  readonly didUrl: string;
  readonly methodId: string;
};

const readTextField = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  if (
    value instanceof Uint8Array &&
    value.every((entry) => typeof entry === "number")
  ) {
    return paddedTextToString(value);
  }
  return undefined;
};

const readBigIntField = (value: unknown): string | undefined =>
  typeof value === "bigint" ? value.toString() : undefined;

const readBooleanField = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const verificationMethodRefToString = (value: {
  readonly didContractAddress: { readonly bytes: Uint8Array };
  readonly methodId: Uint8Array;
}): string =>
  `${bytesToHex(value.didContractAddress.bytes)}:${paddedTextToString(value.methodId)}`;

const verificationMethodRefFromUnknown = (
  value: unknown,
): string | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as {
    readonly didContractAddress?: { readonly bytes?: unknown };
    readonly methodId?: unknown;
  };
  const didBytes = record.didContractAddress?.bytes;
  if (!(didBytes instanceof Uint8Array)) {
    return null;
  }
  if (!(record.methodId instanceof Uint8Array)) {
    return null;
  }
  return `${bytesToHex(didBytes)}:${paddedTextToString(record.methodId)}`;
};

const decodeUniversityClaims = (rawClaims: unknown): Record<string, string> => {
  if (!rawClaims || typeof rawClaims !== "object") {
    return {};
  }
  const claimRecord = rawClaims as Record<string, unknown>;
  const decoded: Record<string, string> = {};
  for (const [key, value] of Object.entries(claimRecord)) {
    const textValue = readTextField(value);
    if (textValue !== undefined) {
      decoded[key] = textValue;
      continue;
    }
    const numericValue = readBigIntField(value) ?? readTextField(`${value}`);
    if (numericValue !== undefined) {
      decoded[key] = numericValue;
      continue;
    }
    const boolValue = readBooleanField(value);
    if (boolValue !== undefined) {
      decoded[key] = String(boolValue);
    }
  }
  return decoded;
};

const REPORT_SAMPLE_SIZE = 3;

const scalarForLabel = (label: string): bigint => {
  const raw = bytesToBigInt(sha256(label));
  return (raw % (JUBJUB_SUBGROUP_ORDER - 1n)) + 1n;
};

const readJson = <T>(relativePath: string): T =>
  JSON.parse(readFileSync(resolveScenarioRepoPath(relativePath), "utf8")) as T;

const issuerConfigForUniversity = (
  university: UniversityProfile,
): UniversityDiplomaSignerOptions => ({
  label: university.issuerDidUrl,
  methodId: university.issuerMethodId,
  secretKey: scalarForLabel(`issuer:${university.issuerDidUrl}`),
});

const holderConfigForStudent = (
  student: StudentRecord,
): UniversityDiplomaSignerOptions => ({
  label: student.holderDidUrl,
  methodId: student.holderMethodId,
  secretKey: scalarForLabel(`holder:${student.holderDidUrl}`),
});

const encodeClaims = (
  student: StudentRecord,
): Partial<UniversityDiplomaClaims> => ({
  diplomaId: padText(student.diplomaClaimValues.diplomaId),
  studentId: padText(student.diplomaClaimValues.studentId, 16),
  graduateName: padText(student.diplomaClaimValues.graduateName),
  universityName: padText(student.diplomaClaimValues.universityName),
  facultyName: padText(student.diplomaClaimValues.facultyName),
  awardName: padText(student.diplomaClaimValues.awardName),
  honorsCode: padText(student.diplomaClaimValues.honorsCode, 16),
  graduationYear: BigInt(student.diplomaClaimValues.graduationYear),
  graduationMonth: BigInt(student.diplomaClaimValues.graduationMonth),
  finalGrade: BigInt(student.diplomaClaimValues.finalGrade),
  creditsEarned: BigInt(student.diplomaClaimValues.creditsEarned),
});

const normalizeRequestPolicy = (
  policy: VerifierRequestPolicy,
): UniversityDiplomaRequestOptions => ({
  requireDiplomaIdDisclosure: policy.requireDiplomaIdDisclosure ?? false,
  requireStudentIdDisclosure: policy.requireStudentIdDisclosure ?? false,
  requireGraduateNameDisclosure: policy.requireGraduateNameDisclosure ?? false,
  requireUniversityNameDisclosure:
    policy.requireUniversityNameDisclosure ?? false,
  requireFacultyNameDisclosure: policy.requireFacultyNameDisclosure ?? false,
  requireAwardNameDisclosure: policy.requireAwardNameDisclosure ?? false,
  requireHonorsCodeDisclosure: policy.requireHonorsCodeDisclosure ?? false,
  requireGraduationYearDisclosure:
    policy.requireGraduationYearDisclosure ?? false,
  requireGraduationMonthDisclosure:
    policy.requireGraduationMonthDisclosure ?? false,
  requireFinalGradeDisclosure: policy.requireFinalGradeDisclosure ?? false,
  requireCreditsEarnedDisclosure:
    policy.requireCreditsEarnedDisclosure ?? false,
  enforceMinimumFinalGrade: policy.enforceMinimumFinalGrade ?? false,
  minimumFinalGrade: BigInt(policy.minimumFinalGrade ?? 0),
});

const disclosureNamesForFlags = (
  flags: {
    readonly requireDiplomaIdDisclosure?: boolean;
    readonly requireStudentIdDisclosure?: boolean;
    readonly requireGraduateNameDisclosure?: boolean;
    readonly requireUniversityNameDisclosure?: boolean;
    readonly requireFacultyNameDisclosure?: boolean;
    readonly requireAwardNameDisclosure?: boolean;
    readonly requireHonorsCodeDisclosure?: boolean;
    readonly requireGraduationYearDisclosure?: boolean;
    readonly requireGraduationMonthDisclosure?: boolean;
    readonly requireFinalGradeDisclosure?: boolean;
    readonly requireCreditsEarnedDisclosure?: boolean;
  },
): string[] =>
  [
    flags.requireDiplomaIdDisclosure ? "diplomaId" : undefined,
    flags.requireStudentIdDisclosure ? "studentId" : undefined,
    flags.requireGraduateNameDisclosure ? "graduateName" : undefined,
    flags.requireUniversityNameDisclosure ? "universityName" : undefined,
    flags.requireFacultyNameDisclosure ? "facultyName" : undefined,
    flags.requireAwardNameDisclosure ? "awardName" : undefined,
    flags.requireHonorsCodeDisclosure ? "honorsCode" : undefined,
    flags.requireGraduationYearDisclosure ? "graduationYear" : undefined,
    flags.requireGraduationMonthDisclosure ? "graduationMonth" : undefined,
    flags.requireFinalGradeDisclosure ? "finalGrade" : undefined,
    flags.requireCreditsEarnedDisclosure ? "creditsEarned" : undefined,
  ].filter((value): value is string => typeof value === "string");

const disclosureNamesForPolicy = (
  policy: VerifierRequestPolicy,
): string[] => disclosureNamesForFlags(policy);

const requestPolicyPresetCatalog = (): Readonly<
  Record<string, UniversityRequestPolicyPreset>
> => {
  if (!cachedRequestPolicyPresetCatalog) {
    cachedRequestPolicyPresetCatalog = readJson<
      Record<string, UniversityRequestPolicyPreset>
    >("use-cases/university/data/request-policy-presets.json");
  }
  return cachedRequestPolicyPresetCatalog;
};

const requestPolicyPreset = (
  presetId: string,
): UniversityRequestPolicyPreset => {
  const preset = requestPolicyPresetCatalog()[presetId];
  if (!preset) {
    throw new Error(`Unknown university request-policy preset ${presetId}`);
  }
  return preset;
};

const canonicalizeJsonValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeJsonValue(entry));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entryValue]) => [key, canonicalizeJsonValue(entryValue)]),
    );
  }
  return value;
};

const canonicalJson = (value: unknown): string =>
  JSON.stringify(canonicalizeJsonValue(value));

const assertPolicyMatchesPreset = (
  presetId: string,
  requestPolicy: VerifierRequestPolicy,
  metadata: {
    readonly title: string;
    readonly purpose: string;
  },
): void => {
  const preset = requestPolicyPreset(presetId);
  const expected = canonicalJson(preset.requestPolicy);
  const actual = canonicalJson(requestPolicy);
  if (actual !== expected) {
    throw new Error(
      `Request policy ${presetId} drifted from the shared preset catalog`,
    );
  }
  if (preset.title !== metadata.title) {
    throw new Error(
      `Request preset title ${presetId} drifted from the shared preset catalog`,
    );
  }
  if (preset.purpose !== metadata.purpose) {
    throw new Error(
      `Request preset purpose ${presetId} drifted from the shared preset catalog`,
    );
  }
};

const disclosureNamesForRequest = (
  request: {
    readonly requireDiplomaIdDisclosure?: boolean;
    readonly requireStudentIdDisclosure?: boolean;
    readonly requireGraduateNameDisclosure?: boolean;
    readonly requireUniversityNameDisclosure?: boolean;
    readonly requireFacultyNameDisclosure?: boolean;
    readonly requireAwardNameDisclosure?: boolean;
    readonly requireHonorsCodeDisclosure?: boolean;
    readonly requireGraduationYearDisclosure?: boolean;
    readonly requireGraduationMonthDisclosure?: boolean;
    readonly requireFinalGradeDisclosure?: boolean;
    readonly requireCreditsEarnedDisclosure?: boolean;
  },
): string[] => disclosureNamesForFlags(request);

const average = (values: readonly number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export class UseUniversityScenario extends Ability {
  readonly #backendContext: UniversityScenarioBackendContext;
  readonly #paths: ScenarioDataPaths;
  readonly #exerciseOptions: {
    companyRequestPolicyOverrides: Record<string, Partial<VerifierRequestPolicy>>;
    duplicateIssuanceRequestStudentIds: Set<string>;
    duplicateJobApplicationSubmissionStudentIds: Set<string>;
    duplicateMallDiscountSubmissionStudentIds: Set<string>;
    jobApplicationTamperingByStudentId: Record<
      string,
      UniversityPresentationTamperingMode
    >;
  } = {
    companyRequestPolicyOverrides: {},
    duplicateIssuanceRequestStudentIds: new Set<string>(),
    duplicateJobApplicationSubmissionStudentIds: new Set<string>(),
    duplicateMallDiscountSubmissionStudentIds: new Set<string>(),
    jobApplicationTamperingByStudentId: {},
  };
  #issuanceResult: IssuanceScenarioResult | undefined;
  #jobApplicationResult: JobApplicationScenarioResult | undefined;
  #discountResult: DiscountScenarioResult | undefined;
  #protocolResult: UniversityProtocolFlowResult | undefined;
  #selectedDiscountStudentId: string | undefined;
  #partyEndpoints: ReadonlyMap<string, PartyEndpoint> | undefined;

  constructor(
    backendContext: UniversityScenarioBackendContext = {
      dataPaths: defaultDataPaths,
      metadata: {
        mode: "simulator",
        description:
          "Local deterministic simulator backend using checked-in university fixture data and in-process credential/verifier semantics.",
        usesRealDidInstances: false,
        generatedOverlayDirectory: null,
        metrics: [],
      },
      protocol: {
        partyRuntime: new DeterministicUniversityPartyRuntime(),
        proofExecutionBackend: new SimulatorUniversityProofExecutionBackend(),
      },
    },
  ) {
    super();
    this.#backendContext = backendContext;
    this.#paths = {
      ...defaultDataPaths,
      ...backendContext.dataPaths,
    };
  }

  static locally(options: {
    readonly dataPaths?: Partial<ScenarioDataPaths>;
  } = {}): UseUniversityScenario {
    return new UseUniversityScenario({
      dataPaths: {
        ...defaultDataPaths,
        ...options.dataPaths,
      },
      metadata: {
        mode: "simulator",
        description:
          "Local deterministic simulator backend using checked-in university fixture data and in-process credential/verifier semantics.",
        usesRealDidInstances: false,
        generatedOverlayDirectory: null,
        metrics: [],
      },
      protocol: {
        partyRuntime: new DeterministicUniversityPartyRuntime(),
        proofExecutionBackend: new SimulatorUniversityProofExecutionBackend(),
      },
    });
  }

  static usingBackendContext(
    context: UniversityScenarioBackendContext,
  ): UseUniversityScenario {
    return new UseUniversityScenario(context);
  }

  static from(actor: UsesAbilities): UseUniversityScenario {
    return actor.abilityTo(UseUniversityScenario);
  }

  configureCompanyRequestPolicyOverride(
    companyId: string,
    override: Partial<VerifierRequestPolicy>,
  ): void {
    this.#exerciseOptions.companyRequestPolicyOverrides[companyId] = {
      ...(this.#exerciseOptions.companyRequestPolicyOverrides[companyId] ?? {}),
      ...override,
    };
    this.#resetProtocolScenarioOutputs();
  }

  enableDuplicateJobApplicationSubmission(studentId: string): void {
    this.#exerciseOptions.duplicateJobApplicationSubmissionStudentIds.add(
      studentId,
    );
    this.#resetProtocolScenarioOutputs();
  }

  enableDuplicateIssuanceSubmission(studentId: string): void {
    this.#exerciseOptions.duplicateIssuanceRequestStudentIds.add(studentId);
    this.#issuanceResult = undefined;
  }

  enableDuplicateMallDiscountSubmission(studentId: string): void {
    this.#exerciseOptions.duplicateMallDiscountSubmissionStudentIds.add(
      studentId,
    );
    this.#resetProtocolScenarioOutputs();
  }

  configureJobApplicationTampering(
    studentId: string,
    tampering: UniversityPresentationTamperingMode,
  ): void {
    this.#exerciseOptions.jobApplicationTamperingByStudentId[studentId] =
      tampering;
    this.#resetProtocolScenarioOutputs();
  }

  selectDiscountStudent(studentId: string): void {
    if (this.#selectedDiscountStudentId === studentId) {
      return;
    }
    this.#selectedDiscountStudentId = studentId;
    this.#discountResult = undefined;
  }

  jobApplicationResultsForStudent(
    studentId: string,
  ): readonly PresentationResultView[] {
    const results = this.#protocolFlowResult().jobApplications.resultsByStudent[
      studentId
    ] ?? [];
    return results.map((result) => ({ ...result }));
  }

  discountResultsForStudent(
    studentId: string,
  ): readonly PresentationResultView[] {
    const results = this.#protocolFlowResult().discounts.resultsByStudent[
      studentId
    ] ?? [];
    return results.map((result) => ({ ...result }));
  }

  companyJobApplicationOutcomeSummary(companyId: string): {
    readonly companyId: string;
    readonly routedStudentIds: readonly string[];
    readonly acceptedCount: number;
    readonly verificationRejectedCount: number;
    readonly duplicateRejectedCount: number;
  } {
    const students = readJson<StudentRecord[]>(this.#paths.students).filter(
      (student) => student.assignedCompanyId === companyId,
    );
    const resultLists = students.flatMap((student) =>
      this.jobApplicationResultsForStudent(student.studentId),
    );
    return {
      companyId,
      routedStudentIds: students.map((student) => student.studentId),
      acceptedCount: resultLists.filter((result) => result.accepted).length,
      verificationRejectedCount: resultLists.filter(
        (result) => result.rejectionKind === "verificationFailed",
      ).length,
      duplicateRejectedCount: resultLists.filter(
        (result) => result.rejectionKind === "duplicate",
      ).length,
    };
  }

  assertEligibleStudentCount(expectedCount: number): void {
    const students = readJson<StudentRecord[]>(this.#paths.students);
    const eligibleStudents = students.filter((student) => student.graduationEligible);
    if (eligibleStudents.length !== expectedCount) {
      throw new Error(
        `Expected ${expectedCount} eligible students in ${this.#paths.students}, found ${eligibleStudents.length}`,
      );
    }
  }

  publishCompanyPolicies(): void {
    const companies = readJson<CompanyRecord[]>(this.#paths.companies);
    // NOTE: publication remains narrative-only in this local harness. This pass
    // validates that every checked-in company policy can be normalized and that
    // the checked-in JSON still matches the shared preset catalog.
    for (const company of companies) {
      void normalizeRequestPolicy(company.requestPolicy);
      assertPolicyMatchesPreset(company.requestPresetId, company.requestPolicy, {
        title: company.requestPresetTitle,
        purpose: company.requestPolicyPurpose,
      });
    }
  }

  universityIssuerSummary(): {
    readonly universityName: string;
    readonly issuerDidUrl: string;
    readonly issuerMethodId: string;
    readonly credentialFamilyPackage: string;
    readonly holderBindingProfile: string;
    readonly statusModel: string;
    readonly batchSize: number;
    readonly backend: {
      readonly mode: UniversityScenarioBackendContext["metadata"]["mode"];
      readonly usesRealDidInstances: boolean;
      readonly description: string;
      readonly generatedOverlayDirectory: string | null;
      readonly metrics: UniversityScenarioBackendContext["metadata"]["metrics"];
      readonly partyRuntime: ReturnType<
        UniversityScenarioBackendContext["protocol"]["partyRuntime"]["descriptor"]
      >;
      readonly proofExecution: ReturnType<
        UniversityScenarioBackendContext["protocol"]["proofExecutionBackend"]["descriptor"]
      >;
    };
  } {
    const university = readJson<UniversityProfile>(this.#paths.university);
    return {
      universityName: university.universityName,
      issuerDidUrl: university.issuerDidUrl,
      issuerMethodId: university.issuerMethodId,
      credentialFamilyPackage: university.credentialFamilyPackage,
      holderBindingProfile: university.holderBindingProfile,
      statusModel: university.statusModel,
      batchSize: university.batchSize,
      backend: {
        mode: this.#backendContext.metadata.mode,
        usesRealDidInstances: this.#backendContext.metadata.usesRealDidInstances,
        description: this.#backendContext.metadata.description,
        generatedOverlayDirectory:
          this.#backendContext.metadata.generatedOverlayDirectory,
        metrics: this.#backendContext.metadata.metrics,
        partyRuntime: this.#backendContext.protocol.partyRuntime.descriptor(),
        proofExecution:
          this.#backendContext.protocol.proofExecutionBackend.descriptor(),
      },
    };
  }

  graduatingClassSummary(): {
    readonly universityName: string;
    readonly eligibleStudentCount: number;
    readonly students: ReadonlyArray<{
      readonly studentId: string;
      readonly fullName: string;
      readonly assignedCompanyId: string;
      readonly finalGrade: number;
    }>;
  } {
    const university = readJson<UniversityProfile>(this.#paths.university);
    const students = readJson<StudentRecord[]>(this.#paths.students).filter(
      (student) => student.graduationEligible,
    );
    return {
      universityName: university.universityName,
      eligibleStudentCount: students.length,
      students: students.map((student) => ({
        studentId: student.studentId,
        fullName: student.fullName,
        assignedCompanyId: student.assignedCompanyId,
        finalGrade: student.diplomaClaimValues.finalGrade,
      })),
    };
  }

  issuanceBatchPlanSummary(): {
    readonly batchCount: number;
    readonly batchSizeLimit: number;
    readonly batches: ReadonlyArray<{
      readonly batchId: string;
      readonly size: number;
      readonly studentIds: readonly string[];
    }>;
  } {
    const university = readJson<UniversityProfile>(this.#paths.university);
    const issuanceBatches = readJson<IssuanceBatchRecord[]>(
      this.#paths.issuanceBatches,
    );
    return {
      batchCount: issuanceBatches.length,
      batchSizeLimit: university.batchSize,
      batches: issuanceBatches.map((batch) => ({
        batchId: batch.batchId,
        size: batch.size,
        studentIds: batch.studentIds,
      })),
    };
  }

  companyRosterSummary(): {
    readonly companyNames: readonly string[];
    readonly policies: ReadonlyArray<{
      readonly companyId: string;
      readonly companyName: string;
      readonly requestPresetId: string;
      readonly requestPresetTitle: string;
      readonly requestPolicyPurpose: string;
      readonly disclosures: readonly string[];
      readonly enforceMinimumFinalGrade: boolean;
      readonly minimumFinalGrade: number | null;
    }>;
  } {
    const companies = readJson<CompanyRecord[]>(this.#paths.companies);
    for (const company of companies) {
      assertPolicyMatchesPreset(company.requestPresetId, company.requestPolicy, {
        title: company.requestPresetTitle,
        purpose: company.requestPolicyPurpose,
      });
    }
    return {
      companyNames: companies.map((company) => company.companyName),
      policies: companies.map((company) => ({
        companyId: company.companyId,
        companyName: company.companyName,
        requestPresetId: company.requestPresetId,
        requestPresetTitle: company.requestPresetTitle,
        requestPolicyPurpose: company.requestPolicyPurpose,
        disclosures: disclosureNamesForPolicy(company.requestPolicy),
        enforceMinimumFinalGrade:
          company.requestPolicy.enforceMinimumFinalGrade ?? false,
        minimumFinalGrade: company.requestPolicy.minimumFinalGrade ?? null,
      })),
    };
  }

  mallPolicySummary(): {
    readonly mallName: string;
    readonly requestPresetId: string;
    readonly requestPresetTitle: string;
    readonly requestPolicyPurpose: string;
    readonly disclosures: readonly string[];
    readonly enforceMinimumFinalGrade: boolean;
    readonly minimumFinalGrade: number | null;
  } {
    const mall = readJson<MallRecord>(this.#paths.mall);
    assertPolicyMatchesPreset(mall.requestPresetId, mall.requestPolicy, {
      title: mall.requestPresetTitle,
      purpose: mall.requestPolicyPurpose,
    });
    return {
      mallName: mall.mallName,
      requestPresetId: mall.requestPresetId,
      requestPresetTitle: mall.requestPresetTitle,
      requestPolicyPurpose: mall.requestPolicyPurpose,
      disclosures: disclosureNamesForPolicy(mall.requestPolicy),
      enforceMinimumFinalGrade:
        mall.requestPolicy.enforceMinimumFinalGrade ?? false,
      minimumFinalGrade: mall.requestPolicy.minimumFinalGrade ?? null,
    };
  }

  selectedDiscountApplicantSummary(): {
    readonly studentId: string;
    readonly fullName: string;
    readonly finalGrade: number;
    readonly fixtureExpectedDiscountEligibility: boolean;
  } {
    if (!this.#selectedDiscountStudentId) {
      throw new Error("No discount applicant selected");
    }

    const discountApplicants = readJson<DiscountApplicantRecord[]>(
      this.#paths.discountApplicants,
    );
    const applicant = discountApplicants.find(
      (record) => record.studentId === this.#selectedDiscountStudentId,
    );
    if (!applicant) {
      throw new Error(`Unknown discount applicant ${this.#selectedDiscountStudentId}`);
    }

    return {
      studentId: applicant.studentId,
      fullName: applicant.fullName,
      finalGrade: applicant.finalGrade,
      fixtureExpectedDiscountEligibility: applicant.expectedDiscountEligibility,
    };
  }

  issuanceExecutionSummary(): {
    readonly totalStudents: number;
    readonly duplicateRequestCount: number;
    readonly idempotentReplayCount: number;
    readonly idempotentReplayStudentIds: readonly string[];
    readonly sampleRequests: IssuanceScenarioResult["sampleRequests"];
    readonly sampleIssuedCredentials: IssuanceScenarioResult["sampleIssuedCredentials"];
    readonly batchMetrics: readonly IssuanceBatchMetric[];
  } {
    const result = this.issuanceResult();
    return {
      totalStudents: result.totalStudents,
      duplicateRequestCount: result.duplicateRequestCount,
      idempotentReplayCount: result.idempotentReplayCount,
      idempotentReplayStudentIds: result.idempotentReplayStudentIds,
      sampleRequests: result.sampleRequests,
      sampleIssuedCredentials: result.sampleIssuedCredentials,
      batchMetrics: result.batchMetrics,
    };
  }

  issuanceTranscriptSummary(): {
    readonly totalThreads: number;
    readonly omittedThreadCount: number;
    readonly representativeThreads: readonly TranscriptThreadView[];
  } {
    const threadViews = this.#transcriptThreadsForPhase("issuance");
    return {
      totalThreads: threadViews.length,
      omittedThreadCount: Math.max(0, threadViews.length - 1),
      representativeThreads: threadViews.slice(0, 1),
    };
  }

  jobApplicationTranscriptSummary(): {
    readonly totalThreads: number;
    readonly omittedThreadCount: number;
    readonly representativeThreads: readonly TranscriptThreadView[];
  } {
    const students = readJson<StudentRecord[]>(this.#paths.students);
    const companies = readJson<CompanyRecord[]>(this.#paths.companies);
    const threadViews = this.#transcriptThreadsForPhase("jobApplications");
    const representativeThreads = companies.flatMap((company) => {
      const representativeStudent = students.find(
        (student) => student.assignedCompanyId === company.companyId,
      );
      if (!representativeStudent) {
        return [];
      }
      const thread = threadViews.find(
        (candidate) =>
          candidate.studentId === representativeStudent.studentId &&
          candidate.verifierId === company.companyId,
      );
      if (!thread) {
        return [];
      }
      return [thread];
    });
    return {
      totalThreads: threadViews.length,
      omittedThreadCount: threadViews.length - representativeThreads.length,
      representativeThreads,
    };
  }

  discountTranscriptSummary(): {
    readonly totalThreads: number;
    readonly selectedStudentId: string;
    readonly representativeThread: TranscriptThreadView;
  } {
    if (!this.#selectedDiscountStudentId) {
      throw new Error("No discount applicant selected");
    }
    const threadViews = this.#transcriptThreadsForPhase("discounts");
    const representativeThread = threadViews.find(
      (candidate) => candidate.studentId === this.#selectedDiscountStudentId,
    );
    if (!representativeThread) {
      throw new Error(
        `Missing discount transcript thread for ${this.#selectedDiscountStudentId}`,
      );
    }
    return {
      totalThreads: threadViews.length,
      selectedStudentId: this.#selectedDiscountStudentId,
      representativeThread,
    };
  }

  #exerciseOptionsSnapshot(): UniversityProtocolExerciseOptions {
    return {
      companyRequestPolicyOverrides: Object.fromEntries(
        Object.entries(this.#exerciseOptions.companyRequestPolicyOverrides),
      ),
      duplicateIssuanceRequestStudentIds: [
        ...this.#exerciseOptions.duplicateIssuanceRequestStudentIds,
      ],
      duplicateJobApplicationSubmissionStudentIds: [
        ...this.#exerciseOptions.duplicateJobApplicationSubmissionStudentIds,
      ],
      duplicateMallDiscountSubmissionStudentIds: [
        ...this.#exerciseOptions.duplicateMallDiscountSubmissionStudentIds,
      ],
      jobApplicationTamperingByStudentId: Object.fromEntries(
        Object.entries(this.#exerciseOptions.jobApplicationTamperingByStudentId),
      ),
    };
  }

  #resetProtocolScenarioOutputs(): void {
    this.#protocolResult = undefined;
    this.#jobApplicationResult = undefined;
    this.#discountResult = undefined;
    this.#partyEndpoints = undefined;
  }

  #protocolFlowResult(): UniversityProtocolFlowResult {
    if (!this.#protocolResult) {
      this.#backendContext.protocol.proofExecutionBackend.resetMetrics();
      this.#protocolResult = new UniversityProtocolFlowRunner({
        dataPaths: this.#paths,
        exerciseOptions: this.#exerciseOptionsSnapshot(),
        partyRuntime: this.#backendContext.protocol.partyRuntime,
        proofExecutionBackend: this.#backendContext.protocol.proofExecutionBackend,
      }).runAll();
    }
    return this.#protocolResult;
  }

  #partyEndpointFor(partyId: string): PartyEndpoint {
    if (!this.#partyEndpoints) {
      const parties = this.#backendContext.protocol.partyRuntime.listParties();
      this.#partyEndpoints = new Map(
        parties.map((party) => [
          party.partyId,
          {
            didUrl: party.didUrl,
            methodId: party.methodId,
          },
        ]),
      );
    }
    return (
      this.#partyEndpoints.get(partyId) ?? {
        didUrl: "unresolved",
        methodId: "unresolved",
      }
    );
  }

  #transcriptThreadsForPhase(
    phase: "issuance" | "jobApplications" | "discounts",
  ): TranscriptThreadView[] {
    const result = this.#protocolFlowResult();
    const messagesForPhase =
      phase === "issuance"
        ? result.issuance.messages
        : phase === "jobApplications"
          ? result.jobApplications.messages
          : result.discounts.messages;
    const messageById = new Map(
      messagesForPhase.map((message) => [
        bytesToHex(message.envelope.messageId),
        message,
      ]),
    );
    const grouped = new Map<string, TranscriptThreadView>();

    for (const entry of result.transcript.filter(
      (candidate) => candidate.phase === phase,
    )) {
      const message = messageById.get(entry.messageIdHex);
      const dto = message ? this.#transcriptDtoForMessage(message) : null;
      const fromEndpoint = this.#partyEndpointFor(entry.from);
      const toEndpoint = this.#partyEndpointFor(entry.to);
      const existing = grouped.get(entry.threadIdHex);
      const studentId =
        dto && typeof dto === "object" && dto !== null && "studentId" in dto
          ? String(dto.studentId)
          : existing?.studentId ?? null;
      const verifierId =
        dto && typeof dto === "object" && dto !== null && "verifierId" in dto
          ? String(dto.verifierId)
          : existing?.verifierId ?? null;
      const nextEntry: TranscriptEntryView = {
        type: entry.type,
        from: entry.from,
        to: entry.to,
        fromDidUrl: fromEndpoint.didUrl,
        fromMethodId: fromEndpoint.methodId,
        toDidUrl: toEndpoint.didUrl,
        toMethodId: toEndpoint.methodId,
        summary: entry.summary,
        messageIdHex: entry.messageIdHex,
        respondsToHex: entry.respondsToHex,
        dto,
      };

      if (existing) {
        grouped.set(entry.threadIdHex, {
          ...existing,
          studentId,
          verifierId,
          entries: [...existing.entries, nextEntry],
        });
      } else {
        grouped.set(entry.threadIdHex, {
          threadIdHex: entry.threadIdHex,
          studentId,
          verifierId,
          entries: [nextEntry],
        });
      }
    }

    return [...grouped.values()];
  }

  #transcriptDtoForMessage(
    message: UniversityProtocolFlowResult["issuance"]["messages"][number],
  ): unknown {
    switch (message.type) {
      case "issuance:request": {
        const body = message.body as {
          readonly studentId: string;
          readonly holderDidUrl: string;
          readonly holderMethodId: string;
          readonly claimValues: {
            readonly diplomaId: string;
            readonly awardName: string;
            readonly finalGrade: number;
            readonly studentId?: string;
            readonly creditsEarned?: number;
          };
        };
        return {
          studentId: body.studentId,
          holderDidUrl: body.holderDidUrl,
          holderMethodId: body.holderMethodId,
          claimValues: {
            diplomaId: body.claimValues.diplomaId,
            awardName: body.claimValues.awardName,
            finalGrade: body.claimValues.finalGrade,
            creditsEarned: body.claimValues.creditsEarned,
            studentIdClaim: body.claimValues.studentId,
          },
        };
      }
      case "issuance:result": {
        const body = message.body as {
          readonly studentId: string;
          readonly issuedAt: bigint;
          readonly credential: {
            readonly issuerVerificationMethodRef: {
              readonly didContractAddress: { readonly bytes: Uint8Array };
              readonly methodId: Uint8Array;
            };
            readonly claims: {
              readonly universityName: Uint8Array;
              readonly awardName: Uint8Array;
              readonly finalGrade: bigint;
              readonly diplomaId?: Uint8Array;
              readonly studentId?: Uint8Array;
              readonly graduateName?: Uint8Array;
              readonly facultyName?: Uint8Array;
              readonly honorsCode?: Uint8Array;
              readonly graduationYear?: bigint;
              readonly graduationMonth?: bigint;
              readonly creditsEarned?: bigint;
            };
          };
        };
        return {
          studentId: body.studentId,
          issuedAt: body.issuedAt.toString(),
          issuanceCredential: {
            issuerVerificationMethodRef: verificationMethodRefToString(
              body.credential.issuerVerificationMethodRef,
            ),
            claims: decodeUniversityClaims(body.credential.claims),
          },
        };
      }
      case "presentation:request": {
        const body = message.body as {
          readonly kind: "jobApplication" | "mallDiscount";
          readonly studentId: string;
          readonly verifierId: string;
          readonly requestedRole?: string;
          readonly request: {
            readonly requireDiplomaIdDisclosure?: boolean;
            readonly requireStudentIdDisclosure?: boolean;
            readonly requireGraduateNameDisclosure?: boolean;
            readonly requireUniversityNameDisclosure?: boolean;
            readonly requireFacultyNameDisclosure?: boolean;
            readonly requireAwardNameDisclosure?: boolean;
            readonly requireHonorsCodeDisclosure?: boolean;
            readonly requireGraduationYearDisclosure?: boolean;
            readonly requireGraduationMonthDisclosure?: boolean;
            readonly requireFinalGradeDisclosure?: boolean;
            readonly requireCreditsEarnedDisclosure?: boolean;
            readonly enforceMinimumFinalGrade: boolean;
            readonly minimumFinalGrade: bigint;
            readonly verifierChallengeHash: Uint8Array;
          };
        };
        return {
          kind: body.kind,
          studentId: body.studentId,
          verifierId: body.verifierId,
          requestedRole: body.requestedRole ?? null,
          disclosures: disclosureNamesForRequest(body.request),
          enforceMinimumFinalGrade: body.request.enforceMinimumFinalGrade,
          minimumFinalGrade: Number(body.request.minimumFinalGrade),
          verifierChallengeHashHex: bytesToHex(
            body.request.verifierChallengeHash,
          ),
        };
      }
      case "presentation:submission": {
        const body = message.body as {
          readonly kind: "jobApplication" | "mallDiscount";
          readonly studentId: string;
          readonly request: {
            readonly requireDiplomaIdDisclosure?: boolean;
            readonly requireStudentIdDisclosure?: boolean;
            readonly requireGraduateNameDisclosure?: boolean;
            readonly requireUniversityNameDisclosure?: boolean;
            readonly requireFacultyNameDisclosure?: boolean;
            readonly requireAwardNameDisclosure?: boolean;
            readonly requireHonorsCodeDisclosure?: boolean;
            readonly requireGraduationYearDisclosure?: boolean;
            readonly requireGraduationMonthDisclosure?: boolean;
            readonly requireFinalGradeDisclosure?: boolean;
            readonly requireCreditsEarnedDisclosure?: boolean;
            readonly verifierChallengeHash: Uint8Array;
          };
          readonly credential: {
            readonly issuerVerificationMethodRef: {
              readonly didContractAddress: { readonly bytes: Uint8Array };
              readonly methodId: Uint8Array;
            };
            readonly claims: {
              readonly diplomaId: Uint8Array;
              readonly studentId: Uint8Array;
              readonly graduateName: Uint8Array;
              readonly universityName: Uint8Array;
              readonly facultyName: Uint8Array;
              readonly awardName: Uint8Array;
              readonly honorsCode: Uint8Array;
              readonly graduationYear: bigint;
              readonly graduationMonth: bigint;
              readonly finalGrade: bigint;
              readonly creditsEarned: bigint;
            };
          };
          readonly presentation: {
            readonly holderBinding: {
              readonly holderVerificationMethodRef: {
                readonly didContractAddress: { readonly bytes: Uint8Array };
                readonly methodId: Uint8Array;
              };
            };
          };
          readonly presentationProof: {
            readonly signerVerificationMethodRef: {
              readonly didContractAddress: { readonly bytes: Uint8Array };
              readonly methodId: Uint8Array;
            };
          };
        };
        const presentationMethod = verificationMethodRefFromUnknown(
          body.presentation.holderBinding.holderVerificationMethodRef,
        );
        const proofSignerMethod = verificationMethodRefFromUnknown(
          body.presentationProof.signerVerificationMethodRef,
        );
        return {
          kind: body.kind,
          studentId: body.studentId,
          disclosures: disclosureNamesForRequest(body.request),
          issuerVerificationMethodRef: verificationMethodRefToString(
            body.credential.issuerVerificationMethodRef,
          ),
          presentedClaims: decodeUniversityClaims(body.credential.claims),
          holderBindingVerificationMethodRef: presentationMethod,
          presentationProofSignerVerificationMethodRef: proofSignerMethod,
          verifierChallengeHashHex: bytesToHex(
            body.request.verifierChallengeHash,
          ),
        };
      }
      case "presentation:result": {
        const body = message.body as {
          readonly kind: "jobApplication" | "mallDiscount";
          readonly studentId: string;
          readonly accepted: boolean;
          readonly reason: string;
          readonly rejectionKind:
            | "none"
            | "verificationFailed"
            | "duplicate";
        };
        return {
          kind: body.kind,
          studentId: body.studentId,
          accepted: body.accepted,
          reason: body.reason,
          rejectionKind: body.rejectionKind,
        };
      }
      default:
        throw new Error(
          `Unsupported protocol transcript message type ${String(message)}`,
        );
    }
  }

  async runBatchIssuance(): Promise<void> {
    const metrics = new MetricRecorder();
    for (const sample of this.#backendContext.metadata.metrics) {
      metrics.observe(sample.name, sample.durationMs, sample.tags);
    }
    const university = metrics.record(
      "issuer_did_bootstrap_ms",
      () => readJson<UniversityProfile>(this.#paths.university),
      { actor: "university" },
    );
    const students = readJson<StudentRecord[]>(this.#paths.students);
    const issuanceBatches = readJson<IssuanceBatchRecord[]>(
      this.#paths.issuanceBatches,
    );

    const studentAgents = metrics.record(
      "student_did_bootstrap_ms",
      (): VirtualStudentAgent[] =>
        students.map((record) => ({
          record,
          signerConfig: holderConfigForStudent(record),
        })),
      { actorCount: students.length },
    );

    metrics.record(
      "virtual_agent_key_load_ms",
      () => {
        issuerConfigForUniversity(university);
        for (const student of studentAgents) {
          void student.signerConfig.secretKey;
        }
      },
      { actorCount: studentAgents.length + 1 },
    );

    const submittedRequests: IssuanceRequest[] = [];
    const rosterByStudentId = new Map(students.map((student) => [student.studentId, student]));

    const submitIssuanceRequest = (studentAgent: VirtualStudentAgent): void => {
      const issuanceRequest = metrics.record(
        "issuance_request_build_ms",
        () => ({
          studentId: studentAgent.record.studentId,
          holderDidUrl: studentAgent.record.holderDidUrl,
          holderMethodId: studentAgent.record.holderMethodId,
          claimValues: studentAgent.record.diplomaClaimValues,
        }),
        { studentId: studentAgent.record.studentId },
      );

      metrics.record(
        "issuance_request_validation_ms",
        () => {
          const rosterEntry = rosterByStudentId.get(issuanceRequest.studentId);
          if (!rosterEntry) {
            throw new Error(`Unknown student ${issuanceRequest.studentId}`);
          }
          if (!rosterEntry.graduationEligible) {
            throw new Error(`Student ${issuanceRequest.studentId} is not graduation eligible`);
          }
          if (rosterEntry.holderMethodId !== issuanceRequest.holderMethodId) {
            throw new Error(`Holder method mismatch for ${issuanceRequest.studentId}`);
          }
          if (rosterEntry.diplomaClaimValues.diplomaId !== issuanceRequest.claimValues.diplomaId) {
            throw new Error(`Diploma payload mismatch for ${issuanceRequest.studentId}`);
          }
        },
        { studentId: studentAgent.record.studentId },
      );

      submittedRequests.push({
        student: studentAgent,
        acceptedAt: performance.now(),
      });
    };

    for (const studentAgent of studentAgents) {
      submitIssuanceRequest(studentAgent);
      if (
        this.#exerciseOptions.duplicateIssuanceRequestStudentIds.has(
          studentAgent.record.studentId,
        )
      ) {
        submitIssuanceRequest(studentAgent);
      }
    }

    const acceptedByStudentId = new Map<string, IssuanceRequest>();
    const idempotentReplayStudentIds = new Set<string>();
    let duplicateRequestCount = 0;
    for (const request of submittedRequests) {
      const studentId = request.student.record.studentId;
      if (acceptedByStudentId.has(studentId)) {
        duplicateRequestCount += 1;
        idempotentReplayStudentIds.add(studentId);
        continue;
      }
      acceptedByStudentId.set(studentId, request);
    }
    const acceptedRequests = [...acceptedByStudentId.values()];
    const plannedIds = issuanceBatches.flatMap((batch) => [...batch.studentIds]);
    const uniqueIds = new Set(plannedIds);
    const partitionMatchesPlan =
      uniqueIds.size === students.length &&
      plannedIds.length === students.length &&
      issuanceBatches.every((batch) => batch.size === batch.studentIds.length) &&
      issuanceBatches.every((batch) => batch.size <= university.batchSize) &&
      [...uniqueIds].every((studentId) => acceptedByStudentId.has(studentId));

    const issuerConfig = issuerConfigForUniversity(university);
    const batchMetrics: IssuanceBatchMetric[] = [];
    const issuanceStartedAt = performance.now();

    for (const [batchIndex, batch] of issuanceBatches.entries()) {
      const batchRequests = batch.studentIds.map((studentId) => {
        const request = acceptedByStudentId.get(studentId);
        if (!request) {
          throw new Error(`Missing accepted issuance request for ${studentId}`);
        }
        return request;
      });

      const batchStartedAt = performance.now();
      const queueWaitMs = average(
        batchRequests.map((request) => batchStartedAt - request.acceptedAt),
      );

      const { value: batchFixtures, durationMs: compileDurationMs } = metrics.measure(
        "issuance_batch_compile_ms",
        (): Array<{ student: VirtualStudentAgent; fixture: UniversityDiplomaFixture }> =>
          batchRequests.map((request) => {
            const fixture = createUniversityDiplomaFixture({
              issuerConfig,
              holderConfig: request.student.signerConfig,
              claimOverrides: encodeClaims(request.student.record),
              verifierChallengeHash: sha256(
                `issuance-batch:${batch.batchId}:${request.student.record.studentId}`,
              ),
              issuedAt: 40_000n + BigInt(batchIndex),
              credentialProofCreatedAt: 50_000n + BigInt(batchIndex),
              presentationProofCreatedAt: 60_000n + BigInt(batchIndex),
            });
            return { student: request.student, fixture };
          }),
        { batchId: batch.batchId, size: batch.size },
      );
      metrics.observe("issuance_batch_queue_wait_ms", queueWaitMs, {
        batchId: batch.batchId,
        size: batch.size,
      });
      metrics.mark("issuance_batch_size", {
        batchId: batch.batchId,
        size: batch.size,
      });

      const { durationMs: signDurationMs } = metrics.measure(
        "issuance_batch_sign_ms",
        () => {
          for (const { fixture } of batchFixtures) {
            void fixture.credentialProof;
          }
        },
        { batchId: batch.batchId, size: batch.size },
      );

      const { durationMs: deliveryDurationMs } = metrics.measure(
        "issuance_batch_delivery_ms",
        () => {
          for (const { student, fixture } of batchFixtures) {
            student.issuedFixture = fixture;
          }
        },
        { batchId: batch.batchId, size: batch.size },
      );

      batchMetrics.push({
        batchId: batch.batchId,
        size: batch.size,
        queueWaitMs,
        compileMs: compileDurationMs,
        signMs: signDurationMs,
        deliveryMs: deliveryDurationMs,
      });
    }

    const totalDurationMs = performance.now() - issuanceStartedAt;
    metrics.mark("issuance_total_students", {
      totalStudents: students.length,
    });
    metrics.mark("issuance_duplicate_request_count", {
      duplicateRequestCount,
    });
    metrics.mark("issuance_idempotent_replay_count", {
      idempotentReplayCount: idempotentReplayStudentIds.size,
    });
    metrics.mark("issuance_credentials_per_second", {
      credentialsPerSecond:
        totalDurationMs > 0
          ? acceptedRequests.length / (totalDurationMs / 1000)
          : acceptedRequests.length,
    });
    this.#issuanceResult = {
      totalStudents: students.length,
      batchCount: issuanceBatches.length,
      acceptedRequestCount: acceptedRequests.length,
      duplicateRequestCount,
      idempotentReplayCount: idempotentReplayStudentIds.size,
      idempotentReplayStudentIds: [...idempotentReplayStudentIds].sort(),
      issuedCredentialCount: studentAgents.filter((student) => student.issuedFixture).length,
      partitionMatchesPlan,
      metricNames: metrics.names(),
      batchMetrics,
      credentialsPerSecond:
        totalDurationMs > 0
          ? acceptedRequests.length / (totalDurationMs / 1000)
          : acceptedRequests.length,
      sampleRequests: acceptedRequests.slice(0, REPORT_SAMPLE_SIZE).map((request) => ({
        studentId: request.student.record.studentId,
        holderDidUrl: request.student.record.holderDidUrl,
        holderMethodId: request.student.record.holderMethodId,
        diplomaId: request.student.record.diplomaClaimValues.diplomaId,
        awardName: request.student.record.diplomaClaimValues.awardName,
        finalGrade: request.student.record.diplomaClaimValues.finalGrade,
      })),
      sampleIssuedCredentials: studentAgents
        .filter((student) => student.issuedFixture)
        .slice(0, REPORT_SAMPLE_SIZE)
        .map((student) => ({
          studentId: student.record.studentId,
          issuerVerificationMethodRef: verificationMethodRefToString(
            student.issuedFixture!.credential.issuerVerificationMethodRef,
          ),
          universityName: paddedTextToString(
            student.issuedFixture!.credential.claims.universityName,
          ),
          awardName: paddedTextToString(
            student.issuedFixture!.credential.claims.awardName,
          ),
          finalGrade:
            student.issuedFixture!.credential.claims.finalGrade.toString(),
        })),
    };
  }

  async runJobApplications(): Promise<void> {
    const metrics = new MetricRecorder();
    for (const sample of this.#backendContext.metadata.metrics) {
      metrics.observe(sample.name, sample.durationMs, sample.tags);
    }
    const students = readJson<StudentRecord[]>(this.#paths.students);
    const companies = metrics.record(
      "company_did_bootstrap_ms",
      () => readJson<CompanyRecord[]>(this.#paths.companies),
      { actorCount: 3 },
    );
    const protocolResult = this.#protocolFlowResult();
    for (const sample of this.#backendContext.protocol.proofExecutionBackend.snapshotMetrics()) {
      metrics.observe(sample.name, sample.durationMs, sample.tags);
    }
    metrics.observe("job_protocol_phase_ms", protocolResult.metrics.jobApplicationsMs, {
      studentCount: students.length,
      companyCount: companies.length,
    });
    metrics.mark("job_request_count", {
      companyCount: companies.length,
      requestCount: protocolResult.jobApplications.requestCount,
    });
    metrics.mark("job_presentation_submission_count", {
      submissionCount: protocolResult.jobApplications.submissionCount,
    });
    metrics.mark("job_verification_result_count", {
      resultCount: protocolResult.jobApplications.resultCount,
      acceptedCount: protocolResult.jobApplications.acceptedCount,
    });
    metrics.mark("job_duplicate_rejection_count", {
      duplicateRejectedCount:
        protocolResult.jobApplications.duplicateRejectedCount,
    });
    metrics.mark("job_verification_rejection_count", {
      verificationRejectedCount:
        protocolResult.jobApplications.verificationRejectedCount,
    });
    metrics.mark("job_application_acceptance_rate", {
      acceptedApplications: protocolResult.jobApplications.acceptedCount,
      totalStudents: students.length,
      rate:
        students.length > 0
          ? protocolResult.jobApplications.acceptedCount / students.length
          : 0,
    });
    metrics.mark("job_applications_per_second", {
      applicationsPerSecond:
        protocolResult.metrics.jobApplicationsMs > 0
          ? protocolResult.jobApplications.acceptedCount /
            (protocolResult.metrics.jobApplicationsMs / 1000)
          : protocolResult.jobApplications.acceptedCount,
    });
    this.#jobApplicationResult = {
      totalStudents: students.length,
      acceptedApplications: protocolResult.jobApplications.acceptedCount,
      duplicateRejectedCount:
        protocolResult.jobApplications.duplicateRejectedCount,
      verificationRejectedCount:
        protocolResult.jobApplications.verificationRejectedCount,
      protocolPhaseMs: protocolResult.metrics.jobApplicationsMs,
      metricNames: metrics.names(),
      companyAcceptedCounts:
        protocolResult.jobApplications.companyAcceptedCounts,
    };
  }

  async runDiscountFlow(): Promise<void> {
    const metrics = new MetricRecorder();
    for (const sample of this.#backendContext.metadata.metrics) {
      metrics.observe(sample.name, sample.durationMs, sample.tags);
    }
    const mall = metrics.record(
      "mall_did_bootstrap_ms",
      () => readJson<MallRecord>(this.#paths.mall),
      { actor: "mall" },
    );
    const discountApplicants = readJson<DiscountApplicantRecord[]>(
      this.#paths.discountApplicants,
    );
    const students = readJson<StudentRecord[]>(this.#paths.students);

    if (!this.#selectedDiscountStudentId) {
      throw new Error("No discount applicant selected");
    }

    const applicant = discountApplicants.find(
      (record) => record.studentId === this.#selectedDiscountStudentId,
    );
    if (!applicant) {
      throw new Error(`Unknown discount applicant ${this.#selectedDiscountStudentId}`);
    }

    const student = students.find(
      (record) => record.studentId === this.#selectedDiscountStudentId,
    );
    if (!student) {
      throw new Error(`Unknown student ${this.#selectedDiscountStudentId}`);
    }

    const protocolResult = this.#protocolFlowResult();
    for (const sample of this.#backendContext.protocol.proofExecutionBackend.snapshotMetrics()) {
      metrics.observe(sample.name, sample.durationMs, sample.tags);
    }
    metrics.observe("discount_protocol_phase_ms", protocolResult.metrics.discountsMs, {
      mallId: mall.mallId,
      selectedStudentId: student.studentId,
    });
    const studentResult = protocolResult.discounts.resultsByStudent[
      student.studentId
    ]?.at(0);
    if (!studentResult) {
      throw new Error(
        `Missing mall discount result for ${student.studentId} in protocol flow`,
      );
    }

    const outcome = studentResult.accepted ? "accepted" : "rejected";
    const explanation =
      outcome === "accepted" ? applicant.explanation : studentResult.reason;

    metrics.mark("discount_acceptance_rate", {
      accepted: outcome === "accepted",
    });
    metrics.mark("discount_request_count", {
      mallId: mall.mallId,
      requestCount: protocolResult.discounts.requestCount,
    });
    metrics.mark("discount_presentation_submission_count", {
      submissionCount: protocolResult.discounts.submissionCount,
    });
    metrics.mark("discount_verification_result_count", {
      resultCount: protocolResult.discounts.resultCount,
    });
    metrics.mark("discount_duplicate_rejection_count", {
      duplicateRejectedCount: protocolResult.discounts.duplicateRejectedCount,
    });
    metrics.mark("discount_verification_rejection_count", {
      verificationRejectedCount:
        protocolResult.discounts.verificationRejectedCount,
    });
    metrics.mark("discount_rejection_reason_count", {
      explanation,
      outcome,
    });

    this.#discountResult = {
      studentId: student.studentId,
      finalGrade: student.diplomaClaimValues.finalGrade,
      outcome,
      explanation,
      duplicateRejectedCount:
        protocolResult.discounts.duplicateRejectedCount,
      verificationRejectedCount:
        protocolResult.discounts.verificationRejectedCount,
      protocolPhaseMs: protocolResult.metrics.discountsMs,
      metricNames: metrics.names(),
    };
  }

  issuanceResult(): IssuanceScenarioResult {
    if (!this.#issuanceResult) {
      throw new Error("University issuance scenario has not been executed yet");
    }
    return this.#issuanceResult;
  }

  jobApplicationResult(): JobApplicationScenarioResult {
    if (!this.#jobApplicationResult) {
      throw new Error("University job-application scenario has not been executed yet");
    }
    return this.#jobApplicationResult;
  }

  discountResult(): DiscountScenarioResult {
    if (!this.#discountResult) {
      throw new Error("University discount scenario has not been executed yet");
    }
    return this.#discountResult;
  }
}
