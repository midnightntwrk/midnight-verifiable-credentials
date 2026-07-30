// Backwards compatibility: existing fixture consumers import these metadata
// constants from ./testing. New protocol/reporting code should import the
// narrower public package surface at ./privacy-profile instead.
export {
  UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
  UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY,
  UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
  UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS,
  UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE,
  UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS,
  type UniversityDiplomaDirectClaimField,
  type UniversityDiplomaPrivacyBoundary,
  type UniversityDiplomaProductionCommitmentCandidate,
  type UniversityDiplomaProductionCommitmentField,
  type UniversityDiplomaProductionProfile,
  type UniversityDiplomaProductionPublicClaimField,
} from "./privacy-profile.js";
export {
  createUniversityDiplomaClaimCommitments,
  createUniversityDiplomaFixture,
  createUniversityDiplomaProductionClaimOpenings,
  createUniversityDiplomaProductionClaimProfile,
  createUniversityDiplomaProductionCredentialFixture,
  createUniversityDiplomaProductionCreditsEarnedPredicateWitness,
  createUniversityDiplomaProductionFinalGradePredicateWitness,
  createUniversityDiplomaProductionPresentationFixture,
  createUniversityDiplomaProductionPublicClaims,
  padText,
  type UniversityDiplomaDisclosureOptions,
  type UniversityDiplomaFixture,
  type UniversityDiplomaProductionClaimOpenings,
  type UniversityDiplomaProductionClaimProfile,
  type UniversityDiplomaProductionCredentialFixture,
  type UniversityDiplomaProductionPresentationFixture,
  type UniversityDiplomaRequestOptions,
  type UniversityDiplomaSignerOptions,
} from "./testing/credential-fixtures.js";
