import { sha256 } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import { describe, expect, it } from "vitest";

import {
  SimulatorUniversityProofExecutionBackend,
  StandaloneHybridUniversityProofExecutionBackend,
  unsafeReferenceDeterministicUniversityClaimOpeningsSource,
} from "../proof-backend.js";
import {
  DeterministicUniversityPartyRuntime,
  loadUniversityFixtureData,
  PreloadedUniversityPartyRuntime,
  type UniversityPartyRuntime,
} from "../runtime.js";

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

  it("rejects a presentation whose credential claim commitments were tampered", () => {
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
          credential: {
            ...submission.credential,
            claimCommitments: {
              ...submission.credential.claimCommitments,
              studentIdCommitment: new Uint8Array(32).fill(9),
            },
          },
        },
      }),
    ).toThrow();
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

  it("uses deterministic claim openings only for the fixture runtime", () => {
    const fixture = loadUniversityFixtureData();
    const student = fixture.students[0]!;
    const hex = (value: Uint8Array): string => Buffer.from(value).toString("hex");

    const issueWith = (
      runtime: UniversityPartyRuntime,
      backend = new SimulatorUniversityProofExecutionBackend(),
    ) =>
      backend.issueDiplomaCredential({
        issuerProfile: runtime.issuerProfileForUniversity(fixture.university),
        issuerRuntime: runtime,
        holderProfile: runtime.studentProfileForStudent(student),
        holderRuntime: runtime,
        student,
        issuanceChallengeHash: sha256(`test-openings:${student.studentId}`),
        issuedAt: 40_000n,
        credentialProofCreatedAt: 50_000n,
        presentationProofCreatedAt: 60_000n,
      });

    const provisionedRuntime = (): PreloadedUniversityPartyRuntime => {
      const seedRuntime = new DeterministicUniversityPartyRuntime();
      seedRuntime.issuerProfileForUniversity(fixture.university);
      seedRuntime.studentProfileForStudent(student);
      return new PreloadedUniversityPartyRuntime(
        seedRuntime.listParties().map((party) => ({
          ...party,
          source: "standalone-provisioned" as const,
        })),
      );
    };

    const deterministicFirst = issueWith(new DeterministicUniversityPartyRuntime());
    const deterministicSecond = issueWith(new DeterministicUniversityPartyRuntime());
    expect(
      hex(deterministicFirst.credential.claimCommitments.studentIdCommitment),
    ).toBe(hex(deterministicSecond.credential.claimCommitments.studentIdCommitment));

    const provisionedFirst = issueWith(provisionedRuntime());
    const provisionedSecond = issueWith(provisionedRuntime());
    expect(
      hex(provisionedFirst.credential.claimCommitments.studentIdCommitment),
    ).not.toBe(hex(provisionedSecond.credential.claimCommitments.studentIdCommitment));
    expect(
      hex(provisionedFirst.credential.claimCommitments.studentIdCommitment),
    ).not.toBe(hex(deterministicFirst.credential.claimCommitments.studentIdCommitment));

    const optedIn = issueWith(
      provisionedRuntime(),
      new SimulatorUniversityProofExecutionBackend({
        claimOpeningsSource:
          unsafeReferenceDeterministicUniversityClaimOpeningsSource,
      }),
    );
    expect(hex(optedIn.credential.claimCommitments.studentIdCommitment)).toBe(
      hex(deterministicFirst.credential.claimCommitments.studentIdCommitment),
    );
  });
});
