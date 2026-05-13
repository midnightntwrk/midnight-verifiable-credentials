import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  pureCircuits as universityDiplomaPureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";
import {
  createUniversityDiplomaFixture,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";
import { describe, expect, it } from "vitest";

import {
  type UniversityJobApplicationRequestOptions,
  UniversityVerifierSimulator,
} from "../testing.js";

type VerifierRequestPolicy = {
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

type UniversityRequestPolicyPreset = {
  readonly presetId: string;
  readonly kind: "jobApplication" | "mallDiscount";
  readonly title: string;
  readonly purpose: string;
  readonly requestPolicy: VerifierRequestPolicy;
};

const presetCatalogPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "data",
  "request-policy-presets.json",
);

const resolveUniversityRequestPolicyPreset = (
  presetId: string,
): UniversityRequestPolicyPreset => {
  const presetCatalog = JSON.parse(
    readFileSync(presetCatalogPath, "utf8"),
  ) as Record<string, UniversityRequestPolicyPreset>;
  const preset = presetCatalog[presetId];
  if (!preset) {
    throw new Error(`Unknown university request-policy preset ${presetId}`);
  }
  return {
    ...preset,
    requestPolicy: { ...preset.requestPolicy },
  };
};

const northwindJobPolicy = resolveUniversityRequestPolicyPreset(
  "job-application-grade-and-award",
).requestPolicy as VerifierRequestPolicy;
const blueOceanJobPolicy = resolveUniversityRequestPolicyPreset(
  "job-application-honors-without-grade",
).requestPolicy as VerifierRequestPolicy;
const pioneerJobPolicy = resolveUniversityRequestPolicyPreset(
  "job-application-credits-and-grade",
).requestPolicy as VerifierRequestPolicy;
const mallDiscountPolicy = resolveUniversityRequestPolicyPreset(
  "mall-discount-grade-over-90",
).requestPolicy as VerifierRequestPolicy;

const assertSupportedJobApplicationPolicy = (
  presetId: string,
  policy: VerifierRequestPolicy,
): void => {
  if (policy.requireGraduateNameDisclosure !== true) {
    throw new Error(
      `Preset ${presetId} must keep requireGraduateNameDisclosure=true for the university job application circuit`,
    );
  }
  if (policy.requireUniversityNameDisclosure !== true) {
    throw new Error(
      `Preset ${presetId} must keep requireUniversityNameDisclosure=true for the university job application circuit`,
    );
  }
  if (policy.requireAwardNameDisclosure !== true) {
    throw new Error(
      `Preset ${presetId} must keep requireAwardNameDisclosure=true for the university job application circuit`,
    );
  }
  if (policy.requireGraduationYearDisclosure !== true) {
    throw new Error(
      `Preset ${presetId} must keep requireGraduationYearDisclosure=true for the university job application circuit`,
    );
  }
  if ((policy.enforceMinimumFinalGrade ?? false) !== false) {
    throw new Error(
      `Preset ${presetId} must not enforce a minimum final grade for the university job application circuit`,
    );
  }
};

const toJobApplicationRequestOptions = (
  policy: VerifierRequestPolicy,
): UniversityJobApplicationRequestOptions => ({
  requireDiplomaIdDisclosure: policy.requireDiplomaIdDisclosure ?? false,
  requireStudentIdDisclosure: policy.requireStudentIdDisclosure ?? false,
  requireFacultyNameDisclosure: policy.requireFacultyNameDisclosure ?? false,
  requireHonorsCodeDisclosure: policy.requireHonorsCodeDisclosure ?? false,
  requireGraduationMonthDisclosure:
    policy.requireGraduationMonthDisclosure ?? false,
  requireFinalGradeDisclosure: policy.requireFinalGradeDisclosure ?? false,
  requireCreditsEarnedDisclosure: policy.requireCreditsEarnedDisclosure ?? false,
});

const buildJobApplicationFixture = (
  presetId: string,
  policy: VerifierRequestPolicy,
  disclosureOverrides: {
    readonly revealDiplomaId?: boolean;
    readonly revealStudentId?: boolean;
    readonly revealFacultyName?: boolean;
    readonly revealHonorsCode?: boolean;
    readonly revealGraduationMonth?: boolean;
    readonly revealFinalGrade?: boolean;
    readonly revealCreditsEarned?: boolean;
  } = {},
) => {
  const baseFixture = createUniversityDiplomaFixture();
  const simulator = new UniversityVerifierSimulator();
  assertSupportedJobApplicationPolicy(presetId, policy);
  const request = simulator.universityJobApplicationRequest(
    baseFixture.credential.issuerVerificationMethodRef,
    baseFixture.presentationRequest.verifierChallengeHash,
    toJobApplicationRequestOptions(policy),
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
      revealDiplomaId:
        disclosureOverrides.revealDiplomaId ??
        (policy.requireDiplomaIdDisclosure ?? false),
      revealStudentId:
        disclosureOverrides.revealStudentId ??
        (policy.requireStudentIdDisclosure ?? false),
      revealFacultyName:
        disclosureOverrides.revealFacultyName ??
        (policy.requireFacultyNameDisclosure ?? false),
      revealAwardName: true,
      revealHonorsCode:
        disclosureOverrides.revealHonorsCode ??
        (policy.requireHonorsCodeDisclosure ?? false),
      revealGraduationYear: true,
      revealGraduationMonth:
        disclosureOverrides.revealGraduationMonth ??
        (policy.requireGraduationMonthDisclosure ?? false),
      revealFinalGrade:
        disclosureOverrides.revealFinalGrade ??
        (policy.requireFinalGradeDisclosure ?? false),
      revealCreditsEarned:
        disclosureOverrides.revealCreditsEarned ??
        (policy.requireCreditsEarnedDisclosure ?? false),
    },
  });

  return { simulator, request, fixture };
};

const buildDiscountFixture = (
  minimumFinalGrade: bigint,
  finalGrade = 94n,
  policy: VerifierRequestPolicy = mallDiscountPolicy,
) => {
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
      revealUniversityName: policy.requireUniversityNameDisclosure ?? false,
      revealFinalGrade: policy.requireFinalGradeDisclosure ?? false,
    },
  });

  return { simulator, request, fixture };
};

describe("university verifier contract", () => {
  it.each([
    ["job-application-grade-and-award", northwindJobPolicy],
    ["job-application-honors-without-grade", blueOceanJobPolicy],
    ["job-application-credits-and-grade", pioneerJobPolicy],
  ])("verifies the named company request preset %s", (presetId, policy) => {
    const { simulator, request, fixture } = buildJobApplicationFixture(
      presetId,
      policy,
    );

    simulator.verifyUniversityDiplomaForJobApplication(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
    );

    expect(simulator.getLedger().successfulJobApplicationVerificationCount).toEqual(1n);
  });

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
    const { simulator, request, fixture } = buildJobApplicationFixture(
      "job-application-credits-and-grade",
      pioneerJobPolicy,
    );

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
    const { simulator, fixture } = buildJobApplicationFixture(
      "job-application-grade-and-award",
      northwindJobPolicy,
    );
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
    const { simulator, request, fixture } = buildJobApplicationFixture(
      "job-application-honors-without-grade",
      blueOceanJobPolicy,
    );

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

    const state = simulator.getLedger();
    expect(state.successfulDiscountVerificationCount).toEqual(0n);
    expect(state.lastVerifiedFinalGrade).toEqual(0n);
    expect(state.lastVerifiedDiscountThreshold).toEqual(0n);
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

    const state = simulator.getLedger();
    expect(state.successfulDiscountVerificationCount).toEqual(0n);
    expect(state.lastVerifiedFinalGrade).toEqual(0n);
    expect(state.lastVerifiedDiscountThreshold).toEqual(0n);
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

    const state = simulator.getLedger();
    expect(state.successfulDiscountVerificationCount).toEqual(0n);
    expect(state.lastVerifiedFinalGrade).toEqual(0n);
    expect(state.lastVerifiedDiscountThreshold).toEqual(0n);
  });
});
