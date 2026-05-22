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
  createUniversityDiplomaProductionPresentationFixture,
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

  it("rejects production credentials with an unset public graduation year", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionCredential(
        {
          ...fixture.credential,
          claims: {
            ...fixture.credential.claims,
            graduationYear: 0n,
          },
        },
        fixture.credentialProof,
      ),
    ).toThrow(/University-diploma production graduation year must be set/);
  });

  it("rejects production credentials with unset routing text claims", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionCredential(
        {
          ...fixture.credential,
          claims: {
            ...fixture.credential.claims,
            universityName: new Uint8Array(32),
          },
        },
        fixture.credentialProof,
      ),
    ).toThrow(/University-diploma production university name must be set/);

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionCredential(
        {
          ...fixture.credential,
          claims: {
            ...fixture.credential.claims,
            awardName: new Uint8Array(32),
          },
        },
        fixture.credentialProof,
      ),
    ).toThrow(/University-diploma production award name must be set/);
  });

  it("rejects production credentials when commitments drift from the signed claim root", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();
    const changedCommitments = {
      ...fixture.credential.claimCommitments,
      finalGradeCommitment: pureCircuits.universityDiplomaFinalGradeCommitment(
        fixture.sourceClaims.finalGrade + 1n,
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

  it("rejects production credentials when the issuer proof signature is tampered", () => {
    const fixture = createUniversityDiplomaProductionCredentialFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionCredential(
        fixture.credential,
        {
          ...fixture.credentialProof,
          signature: {
            ...fixture.credentialProof.signature,
            s: fixture.credentialProof.signature.s + 1n,
          },
        },
      ),
    ).toThrow();
  });

  it("validates production presentations by opening disclosed committed fields", () => {
    const fixture = createUniversityDiplomaProductionPresentationFixture({
      disclosure: {
        revealDiplomaId: true,
        revealGraduateName: true,
        revealFinalGrade: true,
      },
      request: {
        requireDiplomaIdDisclosure: true,
        requireGraduateNameDisclosure: true,
        requireFinalGradeDisclosure: true,
        enforceMinimumFinalGrade: true,
        minimumFinalGrade: 90n,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaProductionPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("validates a focused production minimum-grade request when the opened grade satisfies policy", () => {
    const fixture = createUniversityDiplomaProductionPresentationFixture({
      disclosure: {
        revealFinalGrade: true,
      },
      request: {
        requireGraduateNameDisclosure: false,
        requireUniversityNameDisclosure: false,
        requireAwardNameDisclosure: false,
        requireGraduationYearDisclosure: false,
        requireFinalGradeDisclosure: true,
        enforceMinimumFinalGrade: true,
        minimumFinalGrade: 80n,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaProductionPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("rejects production presentation requests whose version drifts", () => {
    const fixture = createUniversityDiplomaProductionPresentationFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionPresentationRequest({
        ...fixture.presentationRequest,
        version: 2n,
      }),
    ).toThrow(/University-diploma production request version mismatch/);
  });

  it("ignores non-zero openings for unrevealed production disclosures", () => {
    const fixture = createUniversityDiplomaProductionPresentationFixture({
      disclosure: {
        revealDiplomaId: false,
      },
      disclosedOverrides: {
        diplomaIdOpening: new Uint8Array(32).fill(7),
      },
    });

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("rejects production presentations when a committed disclosure opening is wrong", () => {
    const fixture = createUniversityDiplomaProductionPresentationFixture({
      disclosure: {
        revealFinalGrade: true,
      },
      disclosedOverrides: {
        finalGradeOpening: new Uint8Array(32).fill(9),
      },
    });

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /University-diploma production final grade disclosure commitment mismatch/,
    );
  });

  it("rejects production presentations when a public disclosure drifts from the credential", () => {
    const fixture = createUniversityDiplomaProductionPresentationFixture({
      disclosure: {
        revealAwardName: true,
      },
      disclosedOverrides: {
        awardName: padText("Other Award"),
      },
    });

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaProductionPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /University-diploma production award name disclosure does not match the credential/,
    );
  });

  it("rejects production requests when a required committed disclosure is missing", () => {
    const fixture = createUniversityDiplomaProductionPresentationFixture({
      disclosure: {
        revealDiplomaId: false,
      },
      request: {
        requireDiplomaIdDisclosure: true,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaProductionPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /University-diploma production request requires diploma id disclosure/,
    );
  });

  it("rejects production minimum-grade requests when the opened grade is below policy", () => {
    const fixture = createUniversityDiplomaProductionPresentationFixture({
      disclosure: {
        revealFinalGrade: true,
      },
      request: {
        requireFinalGradeDisclosure: true,
        enforceMinimumFinalGrade: true,
        minimumFinalGrade: 95n,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaProductionPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /University-diploma production disclosed final grade is below the verifier minimum/,
    );
  });
});
