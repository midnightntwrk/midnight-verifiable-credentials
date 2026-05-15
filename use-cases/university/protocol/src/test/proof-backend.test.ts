import { sha256 } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import { describe, expect, it } from "vitest";

import {
  SimulatorUniversityProofExecutionBackend,
  StandaloneHybridUniversityProofExecutionBackend,
} from "../proof-backend.js";
import { DeterministicUniversityPartyRuntime, loadUniversityFixtureData } from "../runtime.js";

describe("university simulator proof backend", () => {
  it("issues a diploma and verifies a company presentation through the backend seam", () => {
    const fixture = loadUniversityFixtureData();
    const runtime = new DeterministicUniversityPartyRuntime();
    const backend = new SimulatorUniversityProofExecutionBackend();
    const student = fixture.students[0]!;
    const company = fixture.companies.find(
      (candidate) => candidate.companyId === student.assignedCompanyId,
    )!;

    const issuerProfile = runtime.issuerProfileForUniversity(fixture.university);
    const holderProfile = runtime.studentProfileForStudent(student);
    const stored = backend.issueDiplomaCredential({
      issuerProfile,
      issuerRuntime: runtime,
      holderProfile,
      holderRuntime: runtime,
      student,
      issuanceChallengeHash: sha256(`test-issuance:${student.studentId}`),
      issuedAt: 40_000n,
      credentialProofCreatedAt: 50_000n,
      presentationProofCreatedAt: 60_000n,
    });

    const request = backend.buildJobApplicationRequest({
      issuerVerificationMethodRef: stored.credential.issuerVerificationMethodRef,
      verifierChallengeHash: sha256(`test-job:${company.companyId}:${student.studentId}`),
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
    expect(backend.descriptor().mode).toBe("simulator");
    expect(backend.snapshotMetrics().map((sample) => sample.name)).toEqual(
      expect.arrayContaining([
        "proof_issue_diploma_ms",
        "proof_build_job_request_ms",
        "proof_build_presentation_submission_ms",
        "proof_verify_job_application_ms",
      ]),
    );
  });

  it("rejects a presentation whose body studentId does not match the credential subject", () => {
    const fixture = loadUniversityFixtureData();
    const runtime = new DeterministicUniversityPartyRuntime();
    const backend = new SimulatorUniversityProofExecutionBackend();
    const student = fixture.students[0]!;
    const company = fixture.companies.find(
      (candidate) => candidate.companyId === student.assignedCompanyId,
    )!;

    const issuerProfile = runtime.issuerProfileForUniversity(fixture.university);
    const holderProfile = runtime.studentProfileForStudent(student);
    const stored = backend.issueDiplomaCredential({
      issuerProfile,
      issuerRuntime: runtime,
      holderProfile,
      holderRuntime: runtime,
      student,
      issuanceChallengeHash: sha256(`test-issuance-mismatch:${student.studentId}`),
      issuedAt: 40_000n,
      credentialProofCreatedAt: 50_000n,
      presentationProofCreatedAt: 60_000n,
    });
    const request = backend.buildJobApplicationRequest({
      issuerVerificationMethodRef: stored.credential.issuerVerificationMethodRef,
      verifierChallengeHash: sha256(
        `test-job-mismatch:${company.companyId}:${student.studentId}`,
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
          studentId: "STU-9999",
        },
      }),
    ).toThrow(/does not match the diploma credential studentId claim/);
  });

  it("exposes a distinct standalone-hybrid descriptor while preserving current semantics", () => {
    const fixture = loadUniversityFixtureData();
    const runtime = new DeterministicUniversityPartyRuntime();
    const backend = new StandaloneHybridUniversityProofExecutionBackend();
    const student = fixture.students[0]!;
    const company = fixture.companies.find(
      (candidate) => candidate.companyId === student.assignedCompanyId,
    )!;

    const issuerProfile = runtime.issuerProfileForUniversity(fixture.university);
    const holderProfile = runtime.studentProfileForStudent(student);
    const stored = backend.issueDiplomaCredential({
      issuerProfile,
      issuerRuntime: runtime,
      holderProfile,
      holderRuntime: runtime,
      student,
      issuanceChallengeHash: sha256(`test-issuance-hybrid:${student.studentId}`),
      issuedAt: 40_000n,
      credentialProofCreatedAt: 50_000n,
      presentationProofCreatedAt: 60_000n,
    });

    const request = backend.buildJobApplicationRequest({
      issuerVerificationMethodRef: stored.credential.issuerVerificationMethodRef,
      verifierChallengeHash: sha256(
        `test-job-hybrid:${company.companyId}:${student.studentId}`,
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
    expect(backend.descriptor()).toMatchObject({
      mode: "standalone-hybrid",
      usesRealDidBindings: true,
      usesRealProofInfrastructure: false,
    });
  });
});
