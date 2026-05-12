import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Ability, type UsesAbilities } from "@serenity-js/core";
import {
  UniversityProtocolFlowRunner,
  type UniversityProtocolFlowResult,
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

type UniversityProfile = {
  readonly universityId: string;
  readonly universityName: string;
  readonly issuerDidUrl: string;
  readonly issuerMethodId: string;
  readonly credentialFamilyPackage: string;
  readonly schemaId: string;
  readonly holderBindingProfile: string;
  readonly statusModel: string;
  readonly isRevocable: boolean;
  readonly graduationYear: number;
  readonly graduationMonth: number;
  readonly supportsBatchIssuance: boolean;
  readonly batchSize: number;
  readonly claimEncoding: {
    readonly stringLikeFields: string;
    readonly integerFields: string;
    readonly fieldLengths?: Record<string, number>;
  };
};

type CompanyRequestPolicy = {
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
  readonly enforceMinimumFinalGrade?: boolean;
  readonly minimumFinalGrade?: number;
};

type CompanyRecord = {
  readonly companyId: string;
  readonly companyName: string;
  readonly verifierDidUrl: string;
  readonly verifierMethodId: string;
  readonly hiringStream: string;
  readonly requestPolicy: CompanyRequestPolicy;
};

type MallRecord = {
  readonly mallId: string;
  readonly mallName: string;
  readonly verifierDidUrl: string;
  readonly verifierMethodId: string;
  readonly offerId: string;
  readonly requestPolicy: CompanyRequestPolicy;
};

type StudentClaimValues = {
  readonly diplomaId: string;
  readonly studentId: string;
  readonly graduateName: string;
  readonly universityName: string;
  readonly facultyName: string;
  readonly awardName: string;
  readonly honorsCode: string;
  readonly graduationYear: number;
  readonly graduationMonth: number;
  readonly finalGrade: number;
  readonly creditsEarned: number;
};

type StudentRecord = {
  readonly studentId: string;
  readonly fullName: string;
  readonly holderDidUrl: string;
  readonly holderMethodId: string;
  readonly graduationEligible: boolean;
  readonly assignedCompanyId: string;
  readonly requestedJobRole: string;
  readonly diplomaClaimValues: StudentClaimValues;
};

type IssuanceBatchRecord = {
  readonly batchId: string;
  readonly studentIds: readonly string[];
  readonly size: number;
};

type DiscountApplicantRecord = {
  readonly studentId: string;
  readonly fullName: string;
  readonly finalGrade: number;
  readonly expectedDiscountEligibility: boolean;
  readonly explanation: string;
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
  readonly issuedCredentialCount: number;
  readonly partitionMatchesPlan: boolean;
  readonly metricNames: readonly string[];
  readonly batchMetrics: readonly IssuanceBatchMetric[];
  readonly credentialsPerSecond: number;
};

type JobApplicationScenarioResult = {
  readonly totalStudents: number;
  readonly acceptedApplications: number;
  readonly metricNames: readonly string[];
  readonly companyAcceptedCounts: Readonly<Record<string, number>>;
};

type DiscountScenarioResult = {
  readonly studentId: string;
  readonly finalGrade: number;
  readonly outcome: "accepted" | "rejected";
  readonly explanation: string;
  readonly metricNames: readonly string[];
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

type ScenarioDataPaths = {
  university: string;
  students: string;
  companies: string;
  mall: string;
  issuanceBatches: string;
  discountApplicants: string;
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
  "..",
);

const defaultDataPaths = {
  university: "use-cases/university/data/university.json",
  students: "use-cases/university/data/students.json",
  companies: "use-cases/university/data/companies.json",
  mall: "use-cases/university/data/mall.json",
  issuanceBatches: "use-cases/university/data/issuance-batches.json",
  discountApplicants: "use-cases/university/data/discount-applicants.json",
} satisfies ScenarioDataPaths;

const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

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

  names(): string[] {
    return [...new Set(this.samples.map((sample) => sample.name))].sort();
  }
}

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  BigInt(`0x${Buffer.from(bytes).toString("hex")}`);

const scalarForLabel = (label: string): bigint => {
  const raw = bytesToBigInt(sha256(label));
  return (raw % (JUBJUB_SUBGROUP_ORDER - 1n)) + 1n;
};

const resolveRepoPath = (relativePath: string): string =>
  path.resolve(repoRoot, relativePath);

const readJson = <T>(relativePath: string): T =>
  JSON.parse(readFileSync(resolveRepoPath(relativePath), "utf8")) as T;

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
  policy: CompanyRequestPolicy,
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

const average = (values: readonly number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export class UseUniversityScenario extends Ability {
  #paths: ScenarioDataPaths = { ...defaultDataPaths };
  #issuanceResult: IssuanceScenarioResult | undefined;
  #jobApplicationResult: JobApplicationScenarioResult | undefined;
  #discountResult: DiscountScenarioResult | undefined;
  #protocolResult: UniversityProtocolFlowResult | undefined;
  #selectedDiscountStudentId: string | undefined;

  constructor() {
    super();
  }

  static locally(): UseUniversityScenario {
    return new UseUniversityScenario();
  }

  static from(actor: UsesAbilities): UseUniversityScenario {
    return actor.abilityTo(UseUniversityScenario);
  }

  setUniversityPath(relativePath: string): void {
    this.#paths.university = relativePath;
    this.#invalidateProtocolResult();
  }

  setStudentsPath(relativePath: string): void {
    this.#paths.students = relativePath;
    this.#invalidateProtocolResult();
  }

  setCompaniesPath(relativePath: string): void {
    this.#paths.companies = relativePath;
    this.#invalidateProtocolResult();
  }

  setMallPath(relativePath: string): void {
    this.#paths.mall = relativePath;
    this.#invalidateProtocolResult();
  }

  setIssuanceBatchesPath(relativePath: string): void {
    this.#paths.issuanceBatches = relativePath;
    this.#invalidateProtocolResult();
  }

  setDiscountApplicantsPath(relativePath: string): void {
    this.#paths.discountApplicants = relativePath;
    this.#invalidateProtocolResult();
  }

  selectDiscountStudent(studentId: string): void {
    this.#selectedDiscountStudentId = studentId;
  }

  assertStudentCount(expectedCount: number): void {
    const students = readJson<StudentRecord[]>(this.#paths.students);
    if (students.length !== expectedCount) {
      throw new Error(
        `Expected ${expectedCount} students in ${this.#paths.students}, found ${students.length}`,
      );
    }
  }

  publishCompanyPolicies(): void {
    const companies = readJson<CompanyRecord[]>(this.#paths.companies);
    // NOTE: publication remains narrative-only in this local harness. This pass
    // validates that every checked-in company policy can be normalized.
    for (const company of companies) {
      void normalizeRequestPolicy(company.requestPolicy);
    }
  }

  #invalidateProtocolResult(): void {
    this.#protocolResult = undefined;
    this.#jobApplicationResult = undefined;
    this.#discountResult = undefined;
  }

  #protocolFlowResult(): UniversityProtocolFlowResult {
    if (!this.#protocolResult) {
      this.#protocolResult = new UniversityProtocolFlowRunner({
        dataPaths: this.#paths,
      }).runAll();
    }
    return this.#protocolResult;
  }

  async runBatchIssuance(): Promise<void> {
    const metrics = new MetricRecorder();
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

    const acceptedRequests: IssuanceRequest[] = [];
    const rosterByStudentId = new Map(students.map((student) => [student.studentId, student]));

    for (const studentAgent of studentAgents) {
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

      acceptedRequests.push({
        student: studentAgent,
        acceptedAt: performance.now(),
      });
    }

    const acceptedByStudentId = new Map(
      acceptedRequests.map((request) => [request.student.record.studentId, request]),
    );
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
      metrics.mark("issuance_batch_queue_wait_ms", {
        batchId: batch.batchId,
        size: batch.size,
        queueWaitMs,
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
      issuedCredentialCount: studentAgents.filter((student) => student.issuedFixture).length,
      partitionMatchesPlan,
      metricNames: metrics.names(),
      batchMetrics,
      credentialsPerSecond:
        totalDurationMs > 0
          ? acceptedRequests.length / (totalDurationMs / 1000)
          : acceptedRequests.length,
    };
  }

  async runJobApplications(): Promise<void> {
    const metrics = new MetricRecorder();
    const students = readJson<StudentRecord[]>(this.#paths.students);
    const companies = metrics.record(
      "company_did_bootstrap_ms",
      () => readJson<CompanyRecord[]>(this.#paths.companies),
      { actorCount: 3 },
    );
    const { value: protocolResult, durationMs: totalDurationMs } = metrics.measure(
      "job_protocol_flow_ms",
      () => this.#protocolFlowResult(),
      { studentCount: students.length, companyCount: companies.length },
    );
    metrics.mark("job_request_publish_ms", {
      companyCount: companies.length,
      requestCount: protocolResult.jobApplications.requestCount,
    });
    metrics.mark("presentation_build_ms", {
      submissionCount: protocolResult.jobApplications.submissionCount,
    });
    metrics.mark("job_application_submit_ms", {
      submissionCount: protocolResult.jobApplications.submissionCount,
    });
    metrics.mark("company_verification_ms", {
      resultCount: protocolResult.jobApplications.resultCount,
      acceptedCount: protocolResult.jobApplications.acceptedCount,
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
        totalDurationMs > 0
          ? protocolResult.jobApplications.acceptedCount /
            (totalDurationMs / 1000)
          : protocolResult.jobApplications.acceptedCount,
    });
    this.#jobApplicationResult = {
      totalStudents: students.length,
      acceptedApplications: protocolResult.jobApplications.acceptedCount,
      metricNames: metrics.names(),
      companyAcceptedCounts:
        protocolResult.jobApplications.companyAcceptedCounts,
    };
  }

  async runDiscountFlow(): Promise<void> {
    const metrics = new MetricRecorder();
    const mall = readJson<MallRecord>(this.#paths.mall);
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

    const { value: protocolResult, durationMs: totalDurationMs } = metrics.measure(
      "discount_protocol_flow_ms",
      () => this.#protocolFlowResult(),
      { mallId: mall.mallId },
    );
    const studentResult = protocolResult.discounts.messages
      .flatMap((message) => {
        if (message.type !== "presentation:result") {
          return [];
        }
        const body = message.body as Partial<{
          readonly kind: "mallDiscount";
          readonly studentId: string;
          readonly accepted: boolean;
          readonly reason: string;
        }>;
        if (
          body.kind !== "mallDiscount" ||
          body.studentId !== student.studentId ||
          typeof body.accepted !== "boolean" ||
          typeof body.reason !== "string"
        ) {
          return [];
        }
        return [
          {
            kind: "mallDiscount" as const,
            studentId: body.studentId,
            accepted: body.accepted,
            reason: body.reason,
          },
        ];
      })
      .at(-1);
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
    metrics.mark("discount_request_publish_ms", {
      mallId: mall.mallId,
      requestCount: protocolResult.discounts.requestCount,
    });
    metrics.mark("discount_presentation_build_ms", {
      submissionCount: protocolResult.discounts.submissionCount,
    });
    metrics.mark("discount_verification_ms", {
      resultCount: protocolResult.discounts.resultCount,
      applicationsPerSecond:
        totalDurationMs > 0
          ? protocolResult.discounts.resultCount / (totalDurationMs / 1000)
          : protocolResult.discounts.resultCount,
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
