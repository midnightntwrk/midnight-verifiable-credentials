import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import {
  type Proof,
  pureCircuits as genericPureCircuits,
  type VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";

import {
  pureCircuits,
  type UniversityDiplomaClaimCommitments,
  type UniversityDiplomaClaims,
  type UniversityDiplomaCredential,
  type UniversityDiplomaPresentation,
  type UniversityDiplomaPresentationRequest,
  type UniversityDiplomaProductionPublicClaims,
} from "../managed/university-diploma-credential/contract/index.js";

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

export type UniversityDiplomaPrivacyBoundary = {
  readonly profile: "direct-claim-prototype";
  readonly claimCommitmentModel: "none";
  readonly directClaimFields: readonly UniversityDiplomaDirectClaimField[];
  readonly productionPublicClaimFields: readonly UniversityDiplomaProductionPublicClaimField[];
  readonly productionCommitmentCandidates: readonly UniversityDiplomaProductionCommitmentCandidate[];
  readonly productionCommitmentFields: readonly UniversityDiplomaProductionCommitmentField[];
  readonly statement: string;
};

export const UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY: UniversityDiplomaPrivacyBoundary =
  {
    profile: "direct-claim-prototype",
    claimCommitmentModel: "none",
    directClaimFields: UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
    productionPublicClaimFields:
      UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS,
    productionCommitmentCandidates:
      UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
    productionCommitmentFields: UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS,
    statement:
      "University diploma reveal flags authorize presentation use only; they do not hide raw direct claims from a party that receives the credential body.",
  };

// WARNING: deterministic fixture material only. Fixed signer keys and nonce
// salts here are for tests and local compiler probes, not production flows.
// Reusing this nonce pattern in real Schnorr signing would leak the secret key.
const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

type Signer = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

type ProofContext = "issuance" | "presentation";

export type UniversityDiplomaSignerOptions = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly methodId?: string;
};

export type UniversityDiplomaDisclosureOptions = {
  readonly revealDiplomaId?: boolean;
  readonly revealStudentId?: boolean;
  readonly revealGraduateName?: boolean;
  readonly revealUniversityName?: boolean;
  readonly revealFacultyName?: boolean;
  readonly revealAwardName?: boolean;
  readonly revealHonorsCode?: boolean;
  readonly revealGraduationYear?: boolean;
  readonly revealGraduationMonth?: boolean;
  readonly revealFinalGrade?: boolean;
  readonly revealCreditsEarned?: boolean;
};

export type UniversityDiplomaRequestOptions = {
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
  readonly minimumFinalGrade?: bigint;
};

export type UniversityDiplomaFixture = {
  readonly issuer: Signer;
  readonly holder: Signer;
  readonly claims: UniversityDiplomaClaims;
  readonly credential: UniversityDiplomaCredential;
  readonly credentialProof: Proof;
  readonly presentationRequest: UniversityDiplomaPresentationRequest;
  readonly presentation: UniversityDiplomaPresentation;
  readonly presentationProof: Proof;
};

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

export type UniversityDiplomaProductionClaimOpenings = {
  readonly diplomaIdOpening: Uint8Array;
  readonly studentIdOpening: Uint8Array;
  readonly graduateNameOpening: Uint8Array;
  readonly facultyNameOpening: Uint8Array;
  readonly honorsCodeOpening: Uint8Array;
  readonly graduationMonthOpening: Uint8Array;
  readonly finalGradeOpening: Uint8Array;
  readonly creditsEarnedOpening: Uint8Array;
};

export type UniversityDiplomaProductionClaimProfile = {
  readonly publicClaims: UniversityDiplomaProductionPublicClaims;
  readonly claimCommitments: UniversityDiplomaClaimCommitments;
  readonly openings: UniversityDiplomaProductionClaimOpenings;
  readonly claimRoot: Uint8Array;
};

/**
 * Creates deterministic fixture-only openings for production-profile tests.
 *
 * Do not use this helper for real issuance. Real holders must generate
 * high-entropy openings and domain-separate them per claim field.
 */
export const createUniversityDiplomaProductionClaimOpenings = (
  seed = "fixture",
): UniversityDiplomaProductionClaimOpenings => ({
  diplomaIdOpening: sha256(`university-diploma:${seed}:diploma-id`),
  studentIdOpening: sha256(`university-diploma:${seed}:student-id`),
  graduateNameOpening: sha256(`university-diploma:${seed}:graduate-name`),
  facultyNameOpening: sha256(`university-diploma:${seed}:faculty-name`),
  honorsCodeOpening: sha256(`university-diploma:${seed}:honors-code`),
  graduationMonthOpening: sha256(`university-diploma:${seed}:graduation-month`),
  finalGradeOpening: sha256(`university-diploma:${seed}:final-grade`),
  creditsEarnedOpening: sha256(`university-diploma:${seed}:credits-earned`),
});

export const createUniversityDiplomaProductionPublicClaims = (
  claims: UniversityDiplomaClaims,
): UniversityDiplomaProductionPublicClaims => ({
  universityName: claims.universityName,
  awardName: claims.awardName,
  graduationYear: claims.graduationYear,
});

export const createUniversityDiplomaClaimCommitments = (
  claims: UniversityDiplomaClaims,
  openings: UniversityDiplomaProductionClaimOpenings,
): UniversityDiplomaClaimCommitments => ({
  diplomaIdCommitment: pureCircuits.universityDiplomaIdCommitment(
    claims.diplomaId,
    openings.diplomaIdOpening,
  ),
  studentIdCommitment: pureCircuits.universityDiplomaStudentIdCommitment(
    claims.studentId,
    openings.studentIdOpening,
  ),
  graduateNameCommitment: pureCircuits.universityDiplomaGraduateNameCommitment(
    claims.graduateName,
    openings.graduateNameOpening,
  ),
  facultyNameCommitment: pureCircuits.universityDiplomaFacultyNameCommitment(
    claims.facultyName,
    openings.facultyNameOpening,
  ),
  honorsCodeCommitment: pureCircuits.universityDiplomaHonorsCodeCommitment(
    claims.honorsCode,
    openings.honorsCodeOpening,
  ),
  graduationMonthCommitment:
    pureCircuits.universityDiplomaGraduationMonthCommitment(
      claims.graduationMonth,
      openings.graduationMonthOpening,
    ),
  finalGradeCommitment: pureCircuits.universityDiplomaFinalGradeCommitment(
    claims.finalGrade,
    openings.finalGradeOpening,
  ),
  creditsEarnedCommitment:
    pureCircuits.universityDiplomaCreditsEarnedCommitment(
      claims.creditsEarned,
      openings.creditsEarnedOpening,
    ),
});

export const createUniversityDiplomaProductionClaimProfile = (
  claims: UniversityDiplomaClaims,
  openings = createUniversityDiplomaProductionClaimOpenings(),
): UniversityDiplomaProductionClaimProfile => {
  const publicClaims = createUniversityDiplomaProductionPublicClaims(claims);
  const claimCommitments = createUniversityDiplomaClaimCommitments(
    claims,
    openings,
  );

  return {
    publicClaims,
    claimCommitments,
    openings,
    claimRoot: pureCircuits.universityDiplomaProductionClaimRoot(
      publicClaims,
      claimCommitments,
    ),
  };
};

export const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > length) {
    throw new Error(
      `Text value exceeds ${length}-byte fixture padding limit: got ${bytes.length} bytes`,
    );
  }
  if (bytes.length === length) {
    return bytes;
  }
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

const mod = (value: bigint): bigint => {
  const reduced = value % JUBJUB_SUBGROUP_ORDER;
  return reduced >= 0n ? reduced : reduced + JUBJUB_SUBGROUP_ORDER;
};

const contractAddress = (label: string): { bytes: Uint8Array } => ({
  bytes: sha256(`contract:${label}`),
});

const createSigner = (
  label: string,
  secretKey: bigint,
  methodId = `#${label}-key-1`,
): Signer => ({
  label,
  secretKey,
  publicKey: ecMulGenerator(secretKey),
  verificationMethodRef: {
    didContractAddress: contractAddress(label),
    methodId: padText(methodId),
  },
});

const deriveProofChallenge = (
  bodyRoot: Uint8Array,
  proof: Proof,
  context: ProofContext,
): bigint =>
  context === "issuance"
    ? genericPureCircuits.issuanceProofChallenge(bodyRoot, proof)
    : genericPureCircuits.presentationProofChallenge(bodyRoot, proof);

const signProof = ({
  bodyRoot,
  context,
  signer,
  createdAt,
  challengeHash,
}: {
  readonly bodyRoot: Uint8Array;
  readonly context: ProofContext;
  readonly signer: Signer;
  readonly createdAt: bigint;
  readonly challengeHash: Uint8Array;
}): Proof => {
  const nonceScalar =
    context === "issuance" ? 29n + signer.secretKey : 31n + signer.secretKey;
  const proof: Proof = {
    signerVerificationMethodRef: signer.verificationMethodRef,
    createdAt,
    challengeHash,
    publicKey: signer.publicKey,
    signature: {
      r: ecMulGenerator(nonceScalar),
      s: 0n,
    },
  };
  const challenge = deriveProofChallenge(bodyRoot, proof, context);
  return {
    ...proof,
    signature: {
      r: proof.signature.r,
      s: mod(nonceScalar + challenge * signer.secretKey),
    },
  };
};

const createUniversityDiplomaClaims = (
  overrides: Partial<UniversityDiplomaClaims> = {},
): UniversityDiplomaClaims => ({
  diplomaId: padText("DIP-2030-0001"),
  studentId: padText("STU-0001", 16),
  graduateName: padText("Ada Student 0001"),
  universityName: padText("Example University"),
  facultyName: padText("Engineering"),
  awardName: padText("BSc Computer Science"),
  honorsCode: padText("distinction", 16),
  graduationYear: 2030n,
  graduationMonth: 6n,
  finalGrade: 94n,
  creditsEarned: 180n,
  ...overrides,
});

const createRequest = ({
  schema,
  issuerVerificationMethodRef,
  verifierChallengeHash,
  request,
}: {
  readonly schema: UniversityDiplomaCredential["schema"];
  readonly issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"];
  readonly verifierChallengeHash: Uint8Array;
  readonly request: UniversityDiplomaRequestOptions;
}): UniversityDiplomaPresentationRequest => ({
  version: 1n,
  schema,
  issuerVerificationMethodRef,
  requireDiplomaIdDisclosure: request.requireDiplomaIdDisclosure ?? false,
  requireStudentIdDisclosure: request.requireStudentIdDisclosure ?? false,
  requireGraduateNameDisclosure: request.requireGraduateNameDisclosure ?? true,
  requireUniversityNameDisclosure:
    request.requireUniversityNameDisclosure ?? true,
  requireFacultyNameDisclosure: request.requireFacultyNameDisclosure ?? false,
  requireAwardNameDisclosure: request.requireAwardNameDisclosure ?? true,
  requireHonorsCodeDisclosure: request.requireHonorsCodeDisclosure ?? false,
  requireGraduationYearDisclosure:
    request.requireGraduationYearDisclosure ?? true,
  requireGraduationMonthDisclosure:
    request.requireGraduationMonthDisclosure ?? false,
  requireFinalGradeDisclosure: request.requireFinalGradeDisclosure ?? true,
  requireCreditsEarnedDisclosure:
    request.requireCreditsEarnedDisclosure ?? false,
  enforceMinimumFinalGrade: request.enforceMinimumFinalGrade ?? false,
  minimumFinalGrade: request.minimumFinalGrade ?? 0n,
  verifierChallengeHash,
});

const createDisclosurePayload = ({
  claims,
  disclosure,
}: {
  readonly claims: UniversityDiplomaClaims;
  readonly disclosure: UniversityDiplomaDisclosureOptions;
}) => {
  const revealDiplomaId = disclosure.revealDiplomaId ?? false;
  const revealStudentId = disclosure.revealStudentId ?? false;
  const revealGraduateName = disclosure.revealGraduateName ?? true;
  const revealUniversityName = disclosure.revealUniversityName ?? true;
  const revealFacultyName = disclosure.revealFacultyName ?? false;
  const revealAwardName = disclosure.revealAwardName ?? true;
  const revealHonorsCode = disclosure.revealHonorsCode ?? false;
  const revealGraduationYear = disclosure.revealGraduationYear ?? true;
  const revealGraduationMonth = disclosure.revealGraduationMonth ?? false;
  const revealFinalGrade = disclosure.revealFinalGrade ?? true;
  const revealCreditsEarned = disclosure.revealCreditsEarned ?? false;

  return {
    revealDiplomaId,
    diplomaId: revealDiplomaId ? claims.diplomaId : new Uint8Array(32),
    revealStudentId,
    studentId: revealStudentId ? claims.studentId : new Uint8Array(16),
    revealGraduateName,
    graduateName: revealGraduateName ? claims.graduateName : new Uint8Array(32),
    revealUniversityName,
    universityName: revealUniversityName
      ? claims.universityName
      : new Uint8Array(32),
    revealFacultyName,
    facultyName: revealFacultyName ? claims.facultyName : new Uint8Array(32),
    revealAwardName,
    awardName: revealAwardName ? claims.awardName : new Uint8Array(32),
    revealHonorsCode,
    honorsCode: revealHonorsCode ? claims.honorsCode : new Uint8Array(16),
    revealGraduationYear,
    graduationYear: revealGraduationYear ? claims.graduationYear : 0n,
    revealGraduationMonth,
    graduationMonth: revealGraduationMonth ? claims.graduationMonth : 0n,
    revealFinalGrade,
    finalGrade: revealFinalGrade ? claims.finalGrade : 0n,
    revealCreditsEarned,
    creditsEarned: revealCreditsEarned ? claims.creditsEarned : 0n,
  };
};

export const createUniversityDiplomaFixture = ({
  verifierChallengeHash = sha256("challenge:university-diploma"),
  issuanceChallengeHash = sha256("challenge:university-diploma:issuance"),
  disclosure = {},
  disclosedOverrides = {},
  request = {},
  claimOverrides = {},
  issuerConfig,
  holderConfig,
  issuedAt = 40_000n,
  credentialProofCreatedAt = 40_001n,
  presentationProofCreatedAt = 40_002n,
}: {
  readonly verifierChallengeHash?: Uint8Array;
  readonly issuanceChallengeHash?: Uint8Array;
  readonly disclosure?: UniversityDiplomaDisclosureOptions;
  readonly disclosedOverrides?: Partial<
    UniversityDiplomaPresentation["disclosed"]
  >;
  readonly request?: UniversityDiplomaRequestOptions;
  readonly claimOverrides?: Partial<UniversityDiplomaClaims>;
  readonly issuerConfig?: UniversityDiplomaSignerOptions;
  readonly holderConfig?: UniversityDiplomaSignerOptions;
  readonly issuedAt?: bigint;
  readonly credentialProofCreatedAt?: bigint;
  readonly presentationProofCreatedAt?: bigint;
} = {}): UniversityDiplomaFixture => {
  const issuer = issuerConfig
    ? createSigner(
        issuerConfig.label,
        issuerConfig.secretKey,
        issuerConfig.methodId,
      )
    : createSigner("university-issuer", 141414141n);
  const holder = holderConfig
    ? createSigner(
        holderConfig.label,
        holderConfig.secretKey,
        holderConfig.methodId,
      )
    : createSigner("university-student-holder", 282828282n);
  const claims = createUniversityDiplomaClaims(claimOverrides);

  const credential: UniversityDiplomaCredential = {
    version: 1n,
    schema: {
      packageId: padText("midnight:vc:uni-diploma"),
      schemaId: padText("uni-diploma:v1"),
      majorVersion: 1n,
      minorVersion: 0n,
    },
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: holder.verificationMethodRef,
    },
    statusBinding: {},
    issuedAt,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimCommitments: {},
    claimRoot: pureCircuits.universityDiplomaClaimRoot(claims),
  };

  const credentialProof = signProof({
    bodyRoot: pureCircuits.universityDiplomaCredentialBodyRoot(credential),
    context: "issuance",
    signer: issuer,
    createdAt: credentialProofCreatedAt,
    challengeHash: issuanceChallengeHash,
  });

  const presentationRequest = createRequest({
    schema: credential.schema,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    verifierChallengeHash,
    request,
  });

  const disclosed = {
    ...createDisclosurePayload({ claims, disclosure }),
    ...disclosedOverrides,
  };

  const presentation: UniversityDiplomaPresentation = {
    version: 1n,
    schema: credential.schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    holderBinding: credential.holderBinding,
    disclosed,
  };

  const presentationProof = signProof({
    bodyRoot: pureCircuits.universityDiplomaPresentationBodyRoot(presentation),
    context: "presentation",
    signer: holder,
    createdAt: presentationProofCreatedAt,
    challengeHash: verifierChallengeHash,
  });

  return {
    issuer,
    holder,
    claims,
    credential,
    credentialProof,
    presentationRequest,
    presentation,
    presentationProof,
  };
};
