import { sha256 } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import { describe, expect, it } from "vitest";

import type {
  AgentProfile,
  StoredIssuedCredential,
  StudentRecord,
  UniversityFixtureData,
} from "../testing.js";
import {
  DeterministicUniversityPartyRuntime,
  loadUniversityFixtureData,
  ProofServerContractUniversityProofExecutionBackend,
  RecordingUniversityProofServerAdapter,
} from "../testing.js";

type ProofServerHarness = {
  readonly fixture: UniversityFixtureData;
  readonly runtime: DeterministicUniversityPartyRuntime;
  readonly adapter: RecordingUniversityProofServerAdapter;
  readonly backend: ProofServerContractUniversityProofExecutionBackend;
};

type IssuedDiplomaHarness = {
  readonly issuerProfile: AgentProfile;
  readonly holderProfile: AgentProfile;
  readonly stored: StoredIssuedCredential;
};

const createProofServerHarness = (): ProofServerHarness => {
  const fixture = loadUniversityFixtureData();
  const runtime = new DeterministicUniversityPartyRuntime();
  const adapter = new RecordingUniversityProofServerAdapter();
  const backend = new ProofServerContractUniversityProofExecutionBackend({
    adapter,
  });

  return {
    fixture,
    runtime,
    adapter,
    backend,
  };
};

const issueDiploma = (
  harness: ProofServerHarness,
  student: StudentRecord,
  challengeLabel: string,
): IssuedDiplomaHarness => {
  const issuerProfile = harness.runtime.issuerProfileForUniversity(
    harness.fixture.university,
  );
  const holderProfile = harness.runtime.studentProfileForStudent(student);
  const stored = harness.backend.issueDiplomaCredential({
    issuerProfile,
    issuerRuntime: harness.runtime,
    holderProfile,
    holderRuntime: harness.runtime,
    student,
    issuanceChallengeHash: sha256(
      `proof-server-${challengeLabel}-issue:${student.studentId}`,
    ),
    issuedAt: 40_000n,
    credentialProofCreatedAt: 50_000n,
    presentationProofCreatedAt: 60_000n,
  });

  return {
    issuerProfile,
    holderProfile,
    stored,
  };
};

describe("university proof-server backend contract", () => {
  it("records deterministic proof-server exchanges for issuance, presentation, and verification", () => {
    const harness = createProofServerHarness();
    const { adapter, backend, fixture, runtime } = harness;
    const student = fixture.students[0]!;
    const company = fixture.companies.find(
      (candidate) => candidate.companyId === student.assignedCompanyId,
    )!;

    const { holderProfile, issuerProfile, stored } = issueDiploma(
      harness,
      student,
      "job-success",
    );
    const request = backend.buildJobApplicationRequest({
      issuerVerificationMethodRef:
        stored.credential.issuerVerificationMethodRef,
      verifierChallengeHash: sha256(
        `proof-server-job:${company.companyId}:${student.studentId}`,
      ),
      requestPolicy: company.requestPolicy,
    });
    const submission = backend.buildPresentationSubmission({
      kind: "jobApplication",
      issuerProfile,
      issuerRuntime: runtime,
      holderProfile,
      holderRuntime: runtime,
      student,
      storedCredential: stored,
      request,
    });

    expect(() => backend.verifyJobApplication({ submission })).not.toThrow();

    const exchanges = adapter.snapshotExchanges();
    expect(exchanges.map((exchange) => exchange.operationId)).toEqual([
      "university-proof-server-call-000001",
      "university-proof-server-call-000002",
      "university-proof-server-call-000003",
      "university-proof-server-call-000004",
    ]);
    expect(exchanges.map((exchange) => exchange.request.operationKind)).toEqual(
      [
        "issueDiplomaCredential",
        "buildJobApplicationRequest",
        "buildPresentationSubmission",
        "verifyJobApplication",
      ],
    );
    expect(
      exchanges.every((exchange) => exchange.result.status === "succeeded"),
    ).toBe(true);
    expect(exchanges[0]!.request).toMatchObject({
      operationKind: "issueDiplomaCredential",
      issuer: {
        partyId: fixture.university.universityId,
        didUrl: fixture.university.issuerDidUrl,
        runtimeMode: "deterministic",
      },
      holder: {
        partyId: student.studentId,
        didUrl: student.holderDidUrl,
        runtimeMode: "deterministic",
      },
      studentId: student.studentId,
      diplomaId: student.diplomaClaimValues.diplomaId,
    });
    expect(exchanges[1]!.request).toMatchObject({
      operationKind: "buildJobApplicationRequest",
      requestPolicy: company.requestPolicy,
    });
    expect(exchanges[2]!.request).toMatchObject({
      operationKind: "buildPresentationSubmission",
      presentationKind: "jobApplication",
      studentId: student.studentId,
    });
    expect(exchanges[3]!.request).toMatchObject({
      operationKind: "verifyJobApplication",
      applicantRef: submission.applicantRef,
    });
    if (
      exchanges[0]!.result.status !== "succeeded" ||
      exchanges[0]!.result.response.operationKind !==
        "issueDiplomaCredential" ||
      exchanges[2]!.request.operationKind !== "buildPresentationSubmission"
    ) {
      throw new Error(
        "Expected successful issuance and presentation exchanges",
      );
    }
    expect(
      exchanges[0]!.result.response.credential.issuanceChallengeHashHex,
    ).toBe(exchanges[2]!.request.credential.issuanceChallengeHashHex);
    expect(backend.descriptor()).toMatchObject({
      mode: "proof-server-contract",
      usesRealProofInfrastructure: false,
      usesRemoteProofServerContract: true,
    });
    expect(backend.snapshotMetrics().map((metric) => metric.name)).toEqual(
      expect.arrayContaining([
        "proof_issue_diploma_ms",
        "proof_build_job_request_ms",
        "proof_build_presentation_submission_ms",
        "proof_verify_job_application_ms",
        "proof_server_contract_exchange_ms",
      ]),
    );

    const mutableSnapshot = exchanges as unknown as Array<{
      request: { holder: { partyId: string }; studentId: string };
    }>;
    mutableSnapshot[0]!.request.studentId = "STU-MUTATED";
    mutableSnapshot[0]!.request.holder.partyId = "holder-mutated";
    expect(adapter.snapshotExchanges()[0]!.request).toMatchObject({
      holder: {
        partyId: student.studentId,
      },
      studentId: student.studentId,
    });
  });

  it("records mall-discount request, presentation, and verification exchanges", () => {
    const harness = createProofServerHarness();
    const { adapter, backend, fixture, runtime } = harness;
    const applicant = fixture.discountApplicants.find(
      (candidate) => candidate.expectedDiscountEligibility,
    )!;
    const student = fixture.students.find(
      (candidate) => candidate.studentId === applicant.studentId,
    )!;
    const { holderProfile, issuerProfile, stored } = issueDiploma(
      harness,
      student,
      "mall-success",
    );

    const request = backend.buildMallDiscountRequest({
      issuerVerificationMethodRef:
        stored.credential.issuerVerificationMethodRef,
      verifierChallengeHash: sha256(
        `proof-server-mall:${fixture.mall.mallId}:${student.studentId}`,
      ),
      minimumFinalGrade: BigInt(
        fixture.mall.requestPolicy.minimumFinalGrade ?? 91,
      ),
    });
    const submission = backend.buildPresentationSubmission({
      kind: "mallDiscount",
      issuerProfile,
      issuerRuntime: runtime,
      holderProfile,
      holderRuntime: runtime,
      student,
      storedCredential: stored,
      request,
    });

    expect(() => backend.verifyMallDiscount({ submission })).not.toThrow();

    const exchanges = adapter.snapshotExchanges();
    expect(exchanges.map((exchange) => exchange.request.operationKind)).toEqual(
      [
        "issueDiplomaCredential",
        "buildMallDiscountRequest",
        "buildPresentationSubmission",
        "verifyMallDiscount",
      ],
    );
    expect(exchanges[1]!.request).toMatchObject({
      operationKind: "buildMallDiscountRequest",
      minimumFinalGrade: "91",
    });
    // #267: the mall predicate request is reveal-nothing — no disclosed
    // fields; the grade threshold is proven against the commitment.
    expect(exchanges[1]!.result).toMatchObject({
      status: "succeeded",
      response: {
        operationKind: "buildMallDiscountRequest",
        request: {
          disclosedFields: [],
          enforceMinimumFinalGrade: true,
          minimumFinalGrade: "91",
        },
      },
    });
    expect(exchanges[2]!.request).toMatchObject({
      operationKind: "buildPresentationSubmission",
      presentationKind: "mallDiscount",
      request: {
        disclosedFields: [],
        enforceMinimumFinalGrade: true,
      },
      studentId: student.studentId,
    });
    expect(exchanges[3]!.request).toMatchObject({
      operationKind: "verifyMallDiscount",
      request: {
        disclosedFields: [],
        minimumFinalGrade: "91",
      },
      applicantRef: submission.applicantRef,
    });
    expect(backend.snapshotMetrics().map((metric) => metric.name)).toEqual(
      expect.arrayContaining([
        "proof_build_mall_request_ms",
        "proof_verify_mall_discount_ms",
        "proof_server_contract_exchange_ms",
      ]),
    );
  });

  it("records overrides, tampering metadata, and direct recorder resets", () => {
    const harness = createProofServerHarness();
    const { adapter, backend, fixture, runtime } = harness;
    const student = fixture.students[0]!;
    const company = fixture.companies.find(
      (candidate) => candidate.companyId === student.assignedCompanyId,
    )!;
    const { holderProfile, issuerProfile, stored } = issueDiploma(
      harness,
      student,
      "override-tampering",
    );
    const requestPolicyOverrides = {
      minimumFinalGrade: 80n,
      requireFacultyNameDisclosure: true,
    };

    const request = backend.buildJobApplicationRequest({
      issuerVerificationMethodRef:
        stored.credential.issuerVerificationMethodRef,
      verifierChallengeHash: sha256(
        `proof-server-overrides:${company.companyId}:${student.studentId}`,
      ),
      requestPolicy: company.requestPolicy,
      requestPolicyOverrides,
    });
    requestPolicyOverrides.minimumFinalGrade = 99n;
    requestPolicyOverrides.requireFacultyNameDisclosure = false;

    backend.buildPresentationSubmission({
      kind: "jobApplication",
      issuerProfile,
      issuerRuntime: runtime,
      holderProfile,
      holderRuntime: runtime,
      request,
      storedCredential: stored,
      student,
      tampering: "requestChallenge",
    });

    const exchanges = adapter.snapshotExchanges();
    expect(exchanges[1]!.request).toMatchObject({
      operationKind: "buildJobApplicationRequest",
      requestPolicyOverrides: {
        minimumFinalGrade: "80",
        requireFacultyNameDisclosure: true,
      },
    });
    expect(JSON.parse(JSON.stringify(exchanges))[1].request).toMatchObject({
      requestPolicyOverrides: {
        minimumFinalGrade: "80",
      },
    });
    expect(exchanges[1]!.result).toMatchObject({
      status: "succeeded",
      response: {
        request: {
          disclosedFields: expect.arrayContaining(["facultyName"]),
        },
      },
    });
    expect(exchanges[2]!.request).toMatchObject({
      operationKind: "buildPresentationSubmission",
      tampering: "requestChallenge",
    });

    adapter.resetExchanges();

    expect(adapter.snapshotExchanges()).toEqual([]);
  });

  it("resets recorded exchanges, metrics, and deterministic operation ordinals", () => {
    const harness = createProofServerHarness();
    const { adapter, backend, fixture } = harness;
    const student = fixture.students[0]!;

    issueDiploma(harness, student, "reset-before");
    expect(adapter.snapshotExchanges()).toHaveLength(1);
    expect(backend.snapshotMetrics().map((metric) => metric.name)).toEqual(
      expect.arrayContaining([
        "proof_issue_diploma_ms",
        "proof_server_contract_exchange_ms",
      ]),
    );

    backend.resetMetrics();

    expect(adapter.snapshotExchanges()).toEqual([]);
    expect(backend.snapshotMetrics()).toEqual([]);

    issueDiploma(harness, student, "reset-after");
    expect(
      adapter.snapshotExchanges().map((exchange) => exchange.operationId),
    ).toEqual(["university-proof-server-call-000001"]);
  });

  it("records failed verification exchanges before rethrowing delegate errors", () => {
    const harness = createProofServerHarness();
    const { adapter, backend, fixture, runtime } = harness;
    const student = fixture.students[0]!;
    const company = fixture.companies.find(
      (candidate) => candidate.companyId === student.assignedCompanyId,
    )!;
    const { holderProfile, issuerProfile, stored } = issueDiploma(
      harness,
      student,
      "failure",
    );
    const request = backend.buildJobApplicationRequest({
      issuerVerificationMethodRef:
        stored.credential.issuerVerificationMethodRef,
      verifierChallengeHash: sha256(
        `proof-server-failure-job:${company.companyId}:${student.studentId}`,
      ),
      requestPolicy: company.requestPolicy,
    });
    const submission = backend.buildPresentationSubmission({
      kind: "jobApplication",
      issuerProfile,
      issuerRuntime: runtime,
      holderProfile,
      holderRuntime: runtime,
      student,
      storedCredential: stored,
      request,
    });

    expect(() =>
      backend.verifyJobApplication({
        submission: {
          ...submission,
          credential: {
            ...submission.credential,
            claimRoot: new Uint8Array(32).fill(7),
          },
        },
      }),
    ).toThrow(/failed assert/);

    const failedExchange = adapter.snapshotExchanges().at(-1)!;
    expect(failedExchange.request.operationKind).toBe("verifyJobApplication");
    expect(failedExchange.result).toMatchObject({
      status: "failed",
      errorMessage: expect.stringMatching(/failed assert/),
    });
    expect(
      backend
        .snapshotMetrics()
        .filter((metric) => metric.name === "proof_server_contract_exchange_ms")
        .at(-1)?.tags,
    ).toMatchObject({
      backendMode: "proof-server-contract",
      operationKind: "verifyJobApplication",
      status: "failed",
    });
  });
});
