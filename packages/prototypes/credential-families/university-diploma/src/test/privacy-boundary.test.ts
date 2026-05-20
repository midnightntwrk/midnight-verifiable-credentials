import { describe, expect, it } from "vitest";

import type {
  UniversityDiplomaClaims,
  UniversityDiplomaPresentation,
} from "../managed/university-diploma-credential/contract/index.js";
import {
  createUniversityDiplomaFixture,
  UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
  UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY,
  UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
  type UniversityDiplomaDirectClaimField,
} from "../testing/credential-fixtures.js";

type MissingDirectClaimFields = Exclude<
  keyof UniversityDiplomaClaims,
  UniversityDiplomaDirectClaimField
>;
type ExtraDirectClaimFields = Exclude<
  UniversityDiplomaDirectClaimField,
  keyof UniversityDiplomaClaims
>;
type DirectClaimFieldCoverage = MissingDirectClaimFields extends never
  ? ExtraDirectClaimFields extends never
    ? true
    : never
  : never;

const directClaimFieldCoverage: DirectClaimFieldCoverage = true;

const hiddenDisclosureExpectations = [
  ["diplomaId", "revealDiplomaId", new Uint8Array(32)],
  ["studentId", "revealStudentId", new Uint8Array(16)],
  ["graduateName", "revealGraduateName", new Uint8Array(32)],
  ["universityName", "revealUniversityName", new Uint8Array(32)],
  ["facultyName", "revealFacultyName", new Uint8Array(32)],
  ["awardName", "revealAwardName", new Uint8Array(32)],
  ["honorsCode", "revealHonorsCode", new Uint8Array(16)],
  ["graduationYear", "revealGraduationYear", 0n],
  ["graduationMonth", "revealGraduationMonth", 0n],
  ["finalGrade", "revealFinalGrade", 0n],
  ["creditsEarned", "revealCreditsEarned", 0n],
] as const satisfies readonly (readonly [
  UniversityDiplomaDirectClaimField,
  keyof UniversityDiplomaPresentation["disclosed"],
  unknown,
])[];

describe("university-diploma privacy boundary", () => {
  it("keeps all academic facts as direct credential claims in the current prototype", () => {
    const fixture = createUniversityDiplomaFixture({
      disclosure: {
        revealDiplomaId: false,
        revealStudentId: false,
        revealGraduateName: false,
        revealUniversityName: false,
        revealFacultyName: false,
        revealAwardName: false,
        revealHonorsCode: false,
        revealGraduationYear: false,
        revealGraduationMonth: false,
        revealFinalGrade: false,
        revealCreditsEarned: false,
      },
      request: {
        requireDiplomaIdDisclosure: false,
        requireStudentIdDisclosure: false,
        requireGraduateNameDisclosure: false,
        requireUniversityNameDisclosure: false,
        requireFacultyNameDisclosure: false,
        requireAwardNameDisclosure: false,
        requireHonorsCodeDisclosure: false,
        requireGraduationYearDisclosure: false,
        requireGraduationMonthDisclosure: false,
        requireFinalGradeDisclosure: false,
        requireCreditsEarnedDisclosure: false,
      },
    });

    expect(UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS).toEqual([
      "diplomaId",
      "studentId",
      "graduateName",
      "universityName",
      "facultyName",
      "awardName",
      "honorsCode",
      "graduationYear",
      "graduationMonth",
      "finalGrade",
      "creditsEarned",
    ]);
    expect(directClaimFieldCoverage).toBe(true);
    expect(fixture.credential.claimCommitments).toEqual({});
    for (const field of UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS) {
      expect(fixture.credential.claims[field]).toEqual(fixture.claims[field]);
    }
    for (const [
      field,
      revealField,
      hiddenValue,
    ] of hiddenDisclosureExpectations) {
      expect(fixture.presentation.disclosed[revealField]).toBe(false);
      expect(fixture.presentation.disclosed[field]).toEqual(hiddenValue);
    }
  });

  it("documents that reveal flags are request policy gates, not credential-body secrecy", () => {
    expect(UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY).toMatchObject({
      profile: "direct-claim-prototype",
      claimCommitmentModel: "none",
      directClaimFields: UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
      productionTarget: {
        profile: "production-commitment-v2",
        productionCommitmentCandidates:
          UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
      },
    });
    expect(UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY.statement).toContain(
      "do not hide raw direct claims",
    );
    expect(UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES).toEqual([
      "diplomaId",
      "studentId",
      "graduateName",
      "facultyName",
      "honorsCode",
      "graduationMonth",
      "finalGrade",
      "creditsEarned",
    ]);
  });
});
