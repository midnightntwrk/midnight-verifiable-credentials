import { describe, expect, it } from "vitest";

import {
  createUniversityDiplomaFixture,
  UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
  UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY,
  UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
} from "../testing/credential-fixtures.js";

describe("university-diploma privacy boundary", () => {
  it("keeps all academic facts as direct credential claims in the current prototype", () => {
    const fixture = createUniversityDiplomaFixture({
      disclosure: {
        revealDiplomaId: false,
        revealStudentId: false,
        revealFacultyName: false,
        revealHonorsCode: false,
        revealFinalGrade: false,
      },
      request: {
        requireDiplomaIdDisclosure: false,
        requireStudentIdDisclosure: false,
        requireFacultyNameDisclosure: false,
        requireHonorsCodeDisclosure: false,
        requireFinalGradeDisclosure: false,
      },
    });

    expect(UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS).toHaveLength(11);
    expect(fixture.credential.claimCommitments).toEqual({});
    expect(fixture.presentation.disclosed.revealStudentId).toBe(false);
    expect(fixture.presentation.disclosed.studentId).toEqual(
      new Uint8Array(16),
    );
    expect(fixture.credential.claims.studentId).toEqual(
      fixture.claims.studentId,
    );
    expect(fixture.presentation.disclosed.revealFinalGrade).toBe(false);
    expect(fixture.presentation.disclosed.finalGrade).toBe(0n);
    expect(fixture.credential.claims.finalGrade).toBe(
      fixture.claims.finalGrade,
    );
  });

  it("documents that reveal flags are request policy gates, not credential-body secrecy", () => {
    expect(UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY).toMatchObject({
      profile: "direct-claim-prototype",
      claimCommitmentModel: "none",
      directClaimFields: UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
      productionCommitmentCandidates:
        UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
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
      "finalGrade",
    ]);
  });
});
