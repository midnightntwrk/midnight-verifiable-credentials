import {
  pureCircuits as universityDiplomaPureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";
import {
  createUniversityDiplomaFixture,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";
import { describe, expect, it } from "vitest";

import { UniversityVerifierSimulator } from "../testing.js";

const buildJobApplicationFixture = (options?: {
  requireDiplomaIdDisclosure?: boolean;
  requireStudentIdDisclosure?: boolean;
  requireFacultyNameDisclosure?: boolean;
  requireHonorsCodeDisclosure?: boolean;
  requireGraduationMonthDisclosure?: boolean;
  requireFinalGradeDisclosure?: boolean;
  requireCreditsEarnedDisclosure?: boolean;
}) => {
  const baseFixture = createUniversityDiplomaFixture();
  const simulator = new UniversityVerifierSimulator();
  // Default to final-grade disclosure on the positive path so the original
  // employer verification semantics stay locked unless a test opts out.
  const request = simulator.universityJobApplicationRequest(
    baseFixture.credential.issuerVerificationMethodRef,
    baseFixture.presentationRequest.verifierChallengeHash,
    {
      requireDiplomaIdDisclosure: options?.requireDiplomaIdDisclosure ?? false,
      requireStudentIdDisclosure: options?.requireStudentIdDisclosure ?? false,
      requireFacultyNameDisclosure: options?.requireFacultyNameDisclosure ?? false,
      requireHonorsCodeDisclosure: options?.requireHonorsCodeDisclosure ?? false,
      requireGraduationMonthDisclosure:
        options?.requireGraduationMonthDisclosure ?? false,
      requireFinalGradeDisclosure: options?.requireFinalGradeDisclosure ?? true,
      requireCreditsEarnedDisclosure:
        options?.requireCreditsEarnedDisclosure ?? false,
    },
  );

  const fixture = createUniversityDiplomaFixture({
    verifierChallengeHash: request.verifierChallengeHash,
    request: {
      requireDiplomaIdDisclosure: request.requireDiplomaIdDisclosure,
      requireStudentIdDisclosure: request.requireStudentIdDisclosure,
      requireGraduateNameDisclosure: request.requireGraduateNameDisclosure,
      requireUniversityNameDisclosure: request.requireUniversityNameDisclosure,
      requireFacultyNameDisclosure: request.requireFacultyNameDisclosure,
      requireAwardNameDisclosure: request.requireAwardNameDisclosure,
      requireHonorsCodeDisclosure: request.requireHonorsCodeDisclosure,
      requireGraduationYearDisclosure: request.requireGraduationYearDisclosure,
      requireGraduationMonthDisclosure: request.requireGraduationMonthDisclosure,
      requireFinalGradeDisclosure: request.requireFinalGradeDisclosure,
      requireCreditsEarnedDisclosure: request.requireCreditsEarnedDisclosure,
      enforceMinimumFinalGrade: request.enforceMinimumFinalGrade,
      minimumFinalGrade: request.minimumFinalGrade,
    },
    disclosure: {
      revealGraduateName: true,
      revealUniversityName: true,
      revealDiplomaId: options?.requireDiplomaIdDisclosure ?? false,
      revealStudentId: options?.requireStudentIdDisclosure ?? false,
      revealFacultyName: options?.requireFacultyNameDisclosure ?? false,
      revealAwardName: true,
      revealHonorsCode: options?.requireHonorsCodeDisclosure ?? false,
      revealGraduationYear: true,
      revealGraduationMonth: options?.requireGraduationMonthDisclosure ?? false,
      revealFinalGrade: options?.requireFinalGradeDisclosure ?? true,
      revealCreditsEarned: options?.requireCreditsEarnedDisclosure ?? false,
    },
  });

  return { simulator, request, fixture };
};

const buildDiscountFixture = (minimumFinalGrade: bigint, finalGrade = 94n) => {
  const baseFixture = createUniversityDiplomaFixture({
    claimOverrides: { finalGrade },
  });
  const simulator = new UniversityVerifierSimulator();
  const request = simulator.universityMallDiscountRequest(
    baseFixture.credential.issuerVerificationMethodRef,
    baseFixture.presentationRequest.verifierChallengeHash,
    minimumFinalGrade,
  );

  const fixture = createUniversityDiplomaFixture({
    verifierChallengeHash: request.verifierChallengeHash,
    claimOverrides: { finalGrade },
    request: {
      requireDiplomaIdDisclosure: request.requireDiplomaIdDisclosure,
      requireStudentIdDisclosure: request.requireStudentIdDisclosure,
      requireGraduateNameDisclosure: request.requireGraduateNameDisclosure,
      requireUniversityNameDisclosure: request.requireUniversityNameDisclosure,
      requireFacultyNameDisclosure: request.requireFacultyNameDisclosure,
      requireAwardNameDisclosure: request.requireAwardNameDisclosure,
      requireHonorsCodeDisclosure: request.requireHonorsCodeDisclosure,
      requireGraduationYearDisclosure: request.requireGraduationYearDisclosure,
      requireGraduationMonthDisclosure: request.requireGraduationMonthDisclosure,
      requireFinalGradeDisclosure: request.requireFinalGradeDisclosure,
      requireCreditsEarnedDisclosure: request.requireCreditsEarnedDisclosure,
      enforceMinimumFinalGrade: request.enforceMinimumFinalGrade,
      minimumFinalGrade: request.minimumFinalGrade,
    },
    disclosure: {
      revealUniversityName: true,
      revealFinalGrade: true,
    },
  });

  return { simulator, request, fixture };
};

describe("university verifier contract", () => {
  it("rejects a discount request threshold above 100", () => {
    const baseFixture = createUniversityDiplomaFixture();
    const simulator = new UniversityVerifierSimulator();

    expect(() =>
      simulator.universityMallDiscountRequest(
        baseFixture.credential.issuerVerificationMethodRef,
        baseFixture.presentationRequest.verifierChallengeHash,
        101n,
      ),
    ).toThrow(/threshold must be <= 100/);
  });

  it("verifies a university diploma for a job application", () => {
    const { simulator, request, fixture } = buildJobApplicationFixture({
      requireFacultyNameDisclosure: true,
      requireCreditsEarnedDisclosure: true,
    });

    simulator.verifyUniversityDiplomaForJobApplication(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
    );

    const state = simulator.getLedger();
    expect(state.successfulJobApplicationVerificationCount).toEqual(1n);
    expect(state.successfulDiscountVerificationCount).toEqual(0n);
    expect(state.lastVerifiedCredentialRoot).toEqual(
      universityDiplomaPureCircuits.universityDiplomaCredentialBodyRoot(
        fixture.credential,
      ),
    );
    expect(state.lastVerifiedRequestChallenge).toEqual(
      request.verifierChallengeHash,
    );
    expect(state.lastVerifiedGraduateName).toEqual(
      fixture.credential.claims.graduateName,
    );
    expect(state.lastVerifiedUniversityName).toEqual(
      fixture.credential.claims.universityName,
    );
    expect(state.lastVerifiedAwardName).toEqual(
      fixture.credential.claims.awardName,
    );
    expect(state.lastVerifiedGraduationYear).toEqual(
      fixture.credential.claims.graduationYear,
    );
    expect(state.lastVerifiedFinalGrade).toEqual(
      fixture.credential.claims.finalGrade,
    );
    expect(state.lastVerifiedVerifierKind).toEqual(1n);
  });

  it("rejects a job application request that enforces a minimum grade", () => {
    const { simulator, fixture } = buildJobApplicationFixture();
    const invalidRequest = {
      ...fixture.presentationRequest,
      enforceMinimumFinalGrade: true,
      minimumFinalGrade: 91n,
    };

    expect(() =>
      simulator.verifyUniversityDiplomaForJobApplication(
        fixture.credential,
        fixture.credentialProof,
        invalidRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/must not enforce a minimum grade/);
  });

  it("verifies a company policy that does not require final-grade disclosure", () => {
    const { simulator, request, fixture } = buildJobApplicationFixture({
      requireHonorsCodeDisclosure: true,
      requireFinalGradeDisclosure: false,
    });

    simulator.verifyUniversityDiplomaForJobApplication(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
    );

    const state = simulator.getLedger();
    expect(state.successfulJobApplicationVerificationCount).toEqual(1n);
    expect(state.lastVerifiedFinalGrade).toEqual(0n);
  });

  it("rejects a discount request when the student's grade is below the threshold", () => {
    const { simulator, request, fixture } = buildDiscountFixture(91n, 90n);

    expect(() =>
      simulator.verifyUniversityDiplomaForMallDiscount(
        fixture.credential,
        fixture.credentialProof,
        request,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/disclosed final grade is below the verifier minimum/);
  });

  it("verifies a discount request and records the accepted threshold", () => {
    const { simulator, request, fixture } = buildDiscountFixture(91n, 98n);

    simulator.verifyUniversityDiplomaForMallDiscount(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
    );

    const state = simulator.getLedger();
    expect(state.successfulJobApplicationVerificationCount).toEqual(0n);
    expect(state.successfulDiscountVerificationCount).toEqual(1n);
    expect(state.lastVerifiedRequestChallenge).toEqual(
      request.verifierChallengeHash,
    );
    expect(state.lastVerifiedUniversityName).toEqual(
      fixture.credential.claims.universityName,
    );
    expect(state.lastVerifiedFinalGrade).toEqual(0n);
    expect(state.lastVerifiedDiscountThreshold).toEqual(91n);
    expect(state.lastVerifiedVerifierKind).toEqual(2n);
  });

  it("rejects a mall request that does not require final-grade disclosure", () => {
    const { simulator, fixture } = buildDiscountFixture(91n, 98n);
    const invalidRequest = {
      ...fixture.presentationRequest,
      requireFinalGradeDisclosure: false,
    };

    expect(() =>
      simulator.verifyUniversityDiplomaForMallDiscount(
        fixture.credential,
        fixture.credentialProof,
        invalidRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/requires final-grade disclosure/);
  });

  it("rejects a mall request that does not enforce a minimum grade", () => {
    const { simulator, fixture } = buildDiscountFixture(91n, 98n);
    const invalidRequest = {
      ...fixture.presentationRequest,
      enforceMinimumFinalGrade: false,
    };

    expect(() =>
      simulator.verifyUniversityDiplomaForMallDiscount(
        fixture.credential,
        fixture.credentialProof,
        invalidRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/must enforce a minimum grade/);
  });
});
