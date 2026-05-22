import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  type UniversityDiplomaClaimCommitments,
  type UniversityDiplomaProductionCredential,
} from "../managed/university-diploma-credential/contract/index.js";
import {
  createUniversityDiplomaFixture,
  createUniversityDiplomaProductionClaimOpenings,
  createUniversityDiplomaProductionClaimProfile,
  createUniversityDiplomaProductionCredentialFixture,
  padText,
  UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
  UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY,
  UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
  UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS,
  UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE,
  UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS,
  type UniversityDiplomaDirectClaimField,
  type UniversityDiplomaProductionCommitmentCandidate,
  type UniversityDiplomaProductionCommitmentField,
  type UniversityDiplomaProductionPublicClaimField,
} from "../testing.js";

type ProductionPartitionField =
  | UniversityDiplomaProductionPublicClaimField
  | UniversityDiplomaProductionCommitmentCandidate;
type MissingPartitionedDirectClaims = Exclude<
  UniversityDiplomaDirectClaimField,
  ProductionPartitionField
>;
type ExtraPartitionedDirectClaims = Exclude<
  ProductionPartitionField,
  UniversityDiplomaDirectClaimField
>;
type MissingCommitmentFields = Exclude<
  keyof UniversityDiplomaClaimCommitments,
  UniversityDiplomaProductionCommitmentField
>;
type ExtraCommitmentFields = Exclude<
  UniversityDiplomaProductionCommitmentField,
  keyof UniversityDiplomaClaimCommitments
>;
type ProductionCredentialPublicClaimKeys =
  keyof UniversityDiplomaProductionCredential["claims"];
type ProductionCredentialCommitmentKeys =
  keyof UniversityDiplomaProductionCredential["claimCommitments"];

const directClaimPartitionCoverage: MissingPartitionedDirectClaims extends never
  ? ExtraPartitionedDirectClaims extends never
    ? true
    : never
  : never = true;

const commitmentFieldCoverage: MissingCommitmentFields extends never
  ? ExtraCommitmentFields extends never
    ? true
    : never
  : never = true;

const keysOf = (value: object): readonly string[] => Object.keys(value).sort();

describe("university diploma production commitment profile", () => {
  it("partitions every direct prototype claim into public claims or commitments", () => {
    expect(directClaimPartitionCoverage).toBe(true);
    expect(commitmentFieldCoverage).toBe(true);
    expect(
      [
        ...UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS,
        ...UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
      ].sort(),
    ).toEqual([...UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS].sort());
  });

  it("keeps only low-sensitivity routing fields in the production public profile", () => {
    const fixture = createUniversityDiplomaFixture();
    const profile = createUniversityDiplomaProductionClaimProfile(
      fixture.claims,
    );

    expect(keysOf(profile.publicClaims)).toEqual([
      "awardName",
      "graduationYear",
      "universityName",
    ]);

    for (const privateField of UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES) {
      expect(Object.hasOwn(profile.publicClaims, privateField)).toBe(false);
    }
  });

  it("builds commitments that open to each sensitive diploma value", () => {
    const fixture = createUniversityDiplomaFixture();
    const openings =
      createUniversityDiplomaProductionClaimOpenings("student-1");
    const profile = createUniversityDiplomaProductionClaimProfile(
      fixture.claims,
      openings,
    );

    expect(profile.claimCommitments.diplomaIdCommitment).toEqual(
      pureCircuits.universityDiplomaIdCommitment(
        fixture.claims.diplomaId,
        openings.diplomaIdOpening,
      ),
    );
    expect(profile.claimCommitments.studentIdCommitment).toEqual(
      pureCircuits.universityDiplomaStudentIdCommitment(
        fixture.claims.studentId,
        openings.studentIdOpening,
      ),
    );
    expect(profile.claimCommitments.graduateNameCommitment).toEqual(
      pureCircuits.universityDiplomaGraduateNameCommitment(
        fixture.claims.graduateName,
        openings.graduateNameOpening,
      ),
    );
    expect(profile.claimCommitments.facultyNameCommitment).toEqual(
      pureCircuits.universityDiplomaFacultyNameCommitment(
        fixture.claims.facultyName,
        openings.facultyNameOpening,
      ),
    );
    expect(profile.claimCommitments.honorsCodeCommitment).toEqual(
      pureCircuits.universityDiplomaHonorsCodeCommitment(
        fixture.claims.honorsCode,
        openings.honorsCodeOpening,
      ),
    );
    expect(profile.claimCommitments.graduationMonthCommitment).toEqual(
      pureCircuits.universityDiplomaGraduationMonthCommitment(
        fixture.claims.graduationMonth,
        openings.graduationMonthOpening,
      ),
    );
    expect(profile.claimCommitments.finalGradeCommitment).toEqual(
      pureCircuits.universityDiplomaFinalGradeCommitment(
        fixture.claims.finalGrade,
        openings.finalGradeOpening,
      ),
    );
    expect(profile.claimCommitments.creditsEarnedCommitment).toEqual(
      pureCircuits.universityDiplomaCreditsEarnedCommitment(
        fixture.claims.creditsEarned,
        openings.creditsEarnedOpening,
      ),
    );
  });

  it("domain-separates the production claim root from the direct prototype root", () => {
    const fixture = createUniversityDiplomaFixture();
    const profile = createUniversityDiplomaProductionClaimProfile(
      fixture.claims,
    );

    expect(profile.claimRoot).toEqual(
      pureCircuits.universityDiplomaProductionClaimRoot(
        profile.publicClaims,
        profile.claimCommitments,
      ),
    );
    expect(profile.claimRoot).not.toEqual(fixture.credential.claimRoot);
  });

  it("changes the production claim root when a committed value changes", () => {
    const openings = createUniversityDiplomaProductionClaimOpenings("stable");
    const baseline = createUniversityDiplomaFixture();
    const changedGrade = createUniversityDiplomaFixture({
      claimOverrides: { finalGrade: baseline.claims.finalGrade - 1n },
    });

    const baselineProfile = createUniversityDiplomaProductionClaimProfile(
      baseline.claims,
      openings,
    );
    const changedProfile = createUniversityDiplomaProductionClaimProfile(
      changedGrade.claims,
      openings,
    );

    expect(changedProfile.publicClaims).toEqual(baselineProfile.publicClaims);
    expect(changedProfile.claimCommitments.finalGradeCommitment).not.toEqual(
      baselineProfile.claimCommitments.finalGradeCommitment,
    );
    expect(changedProfile.claimRoot).not.toEqual(baselineProfile.claimRoot);
  });

  it("changes a commitment when the opening changes and the value stays the same", () => {
    const fixture = createUniversityDiplomaFixture();
    const firstProfile = createUniversityDiplomaProductionClaimProfile(
      fixture.claims,
      createUniversityDiplomaProductionClaimOpenings("first"),
    );
    const secondProfile = createUniversityDiplomaProductionClaimProfile(
      fixture.claims,
      createUniversityDiplomaProductionClaimOpenings("second"),
    );

    expect(secondProfile.publicClaims).toEqual(firstProfile.publicClaims);
    expect(secondProfile.claimCommitments.finalGradeCommitment).not.toEqual(
      firstProfile.claimCommitments.finalGradeCommitment,
    );
    expect(secondProfile.claimRoot).not.toEqual(firstProfile.claimRoot);
  });

  it("changes the production claim root when a public routing claim changes", () => {
    const openings = createUniversityDiplomaProductionClaimOpenings("stable");
    const baseline = createUniversityDiplomaFixture();
    const changedUniversity = createUniversityDiplomaFixture({
      claimOverrides: {
        universityName: padText("Other University"),
      },
    });

    const baselineProfile = createUniversityDiplomaProductionClaimProfile(
      baseline.claims,
      openings,
    );
    const changedProfile = createUniversityDiplomaProductionClaimProfile(
      changedUniversity.claims,
      openings,
    );

    expect(changedProfile.claimCommitments).toEqual(
      baselineProfile.claimCommitments,
    );
    expect(changedProfile.publicClaims.universityName).not.toEqual(
      baselineProfile.publicClaims.universityName,
    );
    expect(changedProfile.claimRoot).not.toEqual(baselineProfile.claimRoot);
  });

  it("publishes the profile split through the privacy-boundary metadata", () => {
    expect(UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY.productionTarget).toBe(
      UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE,
    );
    expect(
      UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE.productionPublicClaimFields,
    ).toBe(UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS);
    expect(
      UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE.productionCommitmentFields,
    ).toBe(UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS);
  });

  it("creates an additive v2 credential alias with public claims and claim commitments split", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();

    expect(keysOf(fixture.credential.claims)).toEqual([
      "awardName",
      "graduationYear",
      "universityName",
    ] satisfies ProductionCredentialPublicClaimKeys[]);
    expect(keysOf(fixture.credential.claimCommitments)).toEqual(
      [
        ...UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS,
      ].sort() satisfies ProductionCredentialCommitmentKeys[],
    );
    expect(fixture.credential.claims).toEqual(fixture.profile.publicClaims);
    expect(fixture.credential.claimCommitments).toEqual(
      fixture.profile.claimCommitments,
    );
    expect(fixture.credential.claimRoot).toEqual(fixture.profile.claimRoot);
    expect(fixture.credential.schema.schemaId).toEqual(
      padText("uni-diploma:v2"),
    );
    expect(fixture.credential.schema.majorVersion).toBe(2n);
  });

  it("validates the v2 production credential proof against the committed profile root", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionCredential(
        fixture.credential,
        fixture.credentialProof,
      ),
    ).not.toThrow();
  });

  it("rejects v1 schema references through the v2 production credential validator", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionCredential(
        {
          ...fixture.credential,
          schema: {
            ...fixture.credential.schema,
            schemaId: padText("uni-diploma:v1"),
            majorVersion: 1n,
          },
        },
        fixture.credentialProof,
      ),
    ).toThrow(/University-diploma production schema id mismatch/);
  });

  it("rejects production credentials when public claims drift from the signed claim root", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionCredential(
        {
          ...fixture.credential,
          claims: {
            ...fixture.credential.claims,
            universityName: padText("Other University"),
          },
        },
        fixture.credentialProof,
      ),
    ).toThrow(/Credential claim root mismatch/);
  });

  it("rejects production credentials when commitments drift from the signed claim root", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();
    const changedCommitments = {
      ...fixture.credential.claimCommitments,
      finalGradeCommitment: pureCircuits.universityDiplomaFinalGradeCommitment(
        fixture.sourceClaims.finalGrade - 1n,
        fixture.profile.openings.finalGradeOpening,
      ),
    };

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionCredential(
        {
          ...fixture.credential,
          claimCommitments: changedCommitments,
        },
        fixture.credentialProof,
      ),
    ).toThrow(/Credential claim root mismatch/);
  });
});
