import type { UniversityDiplomaClaimCommitments } from "./managed/university-diploma-credential/contract/index.js";

export const UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS = [
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
] as const;

export type UniversityDiplomaDirectClaimField =
  (typeof UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS)[number];

export const UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS = [
  "universityName",
  "awardName",
  "graduationYear",
] as const satisfies readonly UniversityDiplomaDirectClaimField[];

export type UniversityDiplomaProductionPublicClaimField =
  (typeof UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS)[number];

// Treat changes to this list as a deliberate privacy-boundary change. Update
// the package README, migration plan, and downstream report wording together.
export const UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES = [
  "diplomaId",
  "studentId",
  "graduateName",
  "facultyName",
  "honorsCode",
  "graduationMonth",
  "finalGrade",
  "creditsEarned",
] as const satisfies readonly UniversityDiplomaDirectClaimField[];

export type UniversityDiplomaProductionCommitmentCandidate =
  (typeof UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES)[number];

// These fields stay committed in the production profile and are opened only to
// prove verifier predicates, not to disclose their raw values.
export const UNIVERSITY_DIPLOMA_PRODUCTION_PREDICATE_ONLY_FIELDS = [
  "finalGrade",
  "creditsEarned",
] as const satisfies readonly UniversityDiplomaProductionCommitmentCandidate[];

export type UniversityDiplomaProductionPredicateOnlyField =
  (typeof UNIVERSITY_DIPLOMA_PRODUCTION_PREDICATE_ONLY_FIELDS)[number];

export const UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS = [
  "diplomaIdCommitment",
  "studentIdCommitment",
  "graduateNameCommitment",
  "facultyNameCommitment",
  "honorsCodeCommitment",
  "graduationMonthCommitment",
  "finalGradeCommitment",
  "creditsEarnedCommitment",
] as const satisfies readonly (keyof UniversityDiplomaClaimCommitments)[];

export type UniversityDiplomaProductionCommitmentField =
  (typeof UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS)[number];

export type UniversityDiplomaProductionProfile = {
  readonly profile: "production-commitment-v2";
  readonly productionPublicClaimFields: readonly UniversityDiplomaProductionPublicClaimField[];
  readonly productionCommitmentCandidates: readonly UniversityDiplomaProductionCommitmentCandidate[];
  readonly productionCommitmentFields: readonly UniversityDiplomaProductionCommitmentField[];
  readonly predicateOnlyFields: readonly UniversityDiplomaProductionPredicateOnlyField[];
  readonly openingPolicy: string;
  readonly statement: string;
};

export const UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE: UniversityDiplomaProductionProfile =
  {
    profile: "production-commitment-v2",
    productionPublicClaimFields:
      UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS,
    productionCommitmentCandidates:
      UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
    productionCommitmentFields: UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS,
    predicateOnlyFields: UNIVERSITY_DIPLOMA_PRODUCTION_PREDICATE_ONLY_FIELDS,
    openingPolicy:
      "Production issuance must use high-entropy field-domain-separated openings; deterministic fixture openings are only for tests.",
    statement:
      "The production profile keeps routing facts public and moves stable identifiers plus sensitive academic facts into claim commitments.",
  };

export type UniversityDiplomaPrivacyBoundary = {
  readonly profile: "production-commitment-v2";
  readonly claimCommitmentModel: "salted-per-field-persistent-commit";
  readonly directClaimFields: readonly UniversityDiplomaDirectClaimField[];
  readonly productionTarget: UniversityDiplomaProductionProfile;
  readonly statement: string;
};

// #267 FIX: the presented university credential family is now the
// commitment-backed production profile. Reveal flags select which committed
// claims are opened (value + opening) for a verifier; unopened claims cross
// the wire only as salted persistentCommit outputs.
export const UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY: UniversityDiplomaPrivacyBoundary =
  {
    profile: "production-commitment-v2",
    claimCommitmentModel: "salted-per-field-persistent-commit",
    directClaimFields: UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
    productionTarget: UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE,
    statement:
      "The presented university credential carries public routing claims plus salted per-field commitments; hidden claims exist on the wire only as commitments, opened selectively per verifier policy or proven via predicates.",
  };
