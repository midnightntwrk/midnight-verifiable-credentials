import type {
  ProtocolMessage,
  ProtocolMessageType,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";
import type {
  Proof,
  UniversityDiplomaClaims,
  UniversityDiplomaProductionCredential,
  UniversityDiplomaProductionPresentation,
  UniversityDiplomaProductionPresentationRequest,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";
import type { UniversityDiplomaProductionClaimOpenings } from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";

export type UniversityProfile = {
  readonly universityId: string;
  readonly universityName: string;
  readonly issuerDidUrl: string;
  readonly issuerMethodId: string;
  readonly batchSize: number;
};

export type VerifierRequestPolicy = {
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

export type CompanyRecord = {
  readonly companyId: string;
  readonly companyName: string;
  readonly verifierDidUrl: string;
  readonly verifierMethodId: string;
  readonly hiringStream: string;
  readonly requestPresetId: string;
  readonly requestPresetTitle: string;
  readonly requestPolicyPurpose: string;
  readonly requestPolicy: VerifierRequestPolicy;
};

export type MallRecord = {
  readonly mallId: string;
  readonly mallName: string;
  readonly verifierDidUrl: string;
  readonly verifierMethodId: string;
  readonly offerId: string;
  readonly requestPresetId: string;
  readonly requestPresetTitle: string;
  readonly requestPolicyPurpose: string;
  readonly requestPolicy: VerifierRequestPolicy;
};

export type StudentClaimValues = {
  readonly diplomaId: string;
  readonly studentId: string;
  readonly graduateName: string;
  readonly universityName: string;
  readonly facultyName: string;
  readonly awardName: string;
  readonly honorsCode: string;
  readonly graduationYear: number;
  readonly graduationMonth: number;
  readonly finalGrade: number;
  readonly creditsEarned: number;
};

export type StudentRecord = {
  readonly studentId: string;
  readonly fullName: string;
  readonly holderDidUrl: string;
  readonly holderMethodId: string;
  readonly graduationEligible: boolean;
  readonly assignedCompanyId: string;
  readonly requestedJobRole: string;
  readonly diplomaClaimValues: StudentClaimValues;
};

export type IssuanceBatchRecord = {
  readonly batchId: string;
  readonly studentIds: readonly string[];
  readonly size: number;
};

export type DiscountApplicantRecord = {
  readonly studentId: string;
  readonly fullName: string;
  readonly finalGrade: number;
  readonly expectedDiscountEligibility: boolean;
  readonly explanation: string;
};

export type AgentProfile = {
  readonly partyId: string;
  readonly didUrl: string;
  readonly methodId: string;
  readonly secretKey: bigint;
};

export type StoredIssuedCredential = {
  readonly credential: UniversityDiplomaProductionCredential;
  readonly credentialProof: Proof;
  // HOLDER-PRIVATE: per-field commitment openings transferred on the private
  // issuance channel. Only policy-selected (value, opening) pairs may ever be
  // copied into a presentation disclosure; the set itself never enters a
  // presentation:submission message.
  readonly claimOpenings: UniversityDiplomaProductionClaimOpenings;
  readonly issuedAt: bigint;
  readonly credentialProofCreatedAt: bigint;
  readonly presentationProofCreatedAt: bigint;
  readonly issuanceChallengeHash: Uint8Array;
};

export type UniversityIssuanceRequestBody = {
  readonly studentId: string;
  readonly holderDidUrl: string;
  readonly holderMethodId: string;
  readonly claimValues: StudentClaimValues;
};

export type UniversityIssuanceResultBody = {
  readonly studentId: string;
  readonly credential: UniversityDiplomaProductionCredential;
  readonly credentialProof: Proof;
  // Issuer -> holder on the private issuance channel: the openings the holder
  // needs to selectively open its committed claims later.
  readonly claimOpenings: UniversityDiplomaProductionClaimOpenings;
  readonly issuedAt: bigint;
  readonly credentialProofCreatedAt: bigint;
  readonly presentationProofCreatedAt: bigint;
  readonly issuanceChallengeHash: Uint8Array;
};

export type UniversityPresentationRequestBody = {
  readonly kind: "jobApplication" | "mallDiscount";
  readonly studentId: string;
  readonly request: UniversityDiplomaProductionPresentationRequest;
  readonly requestedRole?: string;
  readonly verifierId: string;
};

// #267 FIX: the submission body carries NO hidden claim plaintext.
// - `credential` is the production commitment-backed credential: three public
//   routing claims plus eight salted commitments.
// - `presentation.disclosed` carries (value, opening) pairs ONLY for fields
//   the request required; all other slots are zeroed.
// - The transport-level `studentId` correlation field is gone: studentId is a
//   hidden claim, so the body exposes only `applicantRef`, the salted
//   studentId commitment (hex). The commitment hides the value without the
//   opening, but it is reused verbatim across verifiers and requests, so it is
//   a stable pseudonym: colluding verifiers can link the same applicant across
//   contexts. A per-presentation blinded reference is the production answer.
export type UniversityPresentationSubmissionBody = {
  readonly kind: "jobApplication" | "mallDiscount";
  readonly applicantRef: string;
  readonly credential: UniversityDiplomaProductionCredential;
  readonly credentialProof: Proof;
  readonly request: UniversityDiplomaProductionPresentationRequest;
  readonly presentation: UniversityDiplomaProductionPresentation;
  readonly presentationProof: Proof;
};

export type UniversityPresentationResultBody = {
  readonly kind: "jobApplication" | "mallDiscount";
  readonly studentId: string;
  readonly accepted: boolean;
  readonly reason: string;
  readonly rejectionKind: "none" | "verificationFailed" | "duplicate";
};

export type UniversityPresentationTamperingMode =
  | "credentialClaimRoot"
  | "requestChallenge"
  | "issuerVerificationMethodRef"
  | "holderBindingDidContractAddress"
  | "holderBindingMethodRef"
  | "proofSignerDidContractAddress"
  | "proofSignerMethodRef";

export type VerifierRequestPolicyOverride = Omit<
  Partial<VerifierRequestPolicy>,
  "minimumFinalGrade"
> & {
  readonly minimumFinalGrade?: number | bigint;
};

type UniversityTypedProtocolMessage<
  TType extends ProtocolMessageType,
  TBody,
> = Omit<ProtocolMessage<TBody>, "type" | "body"> & {
  readonly type: TType;
  readonly body: TBody;
};

export type UniversityProtocolMessage =
  | UniversityTypedProtocolMessage<"issuance:request", UniversityIssuanceRequestBody>
  | UniversityTypedProtocolMessage<"issuance:result", UniversityIssuanceResultBody>
  | UniversityTypedProtocolMessage<
      "presentation:request",
      UniversityPresentationRequestBody
    >
  | UniversityTypedProtocolMessage<
      "presentation:submission",
      UniversityPresentationSubmissionBody
    >
  | UniversityTypedProtocolMessage<
      "presentation:result",
      UniversityPresentationResultBody
    >;

export type UniversityProtocolTranscriptEntry = {
  readonly phase: "issuance" | "jobApplications" | "discounts";
  readonly type: UniversityProtocolMessage["type"];
  readonly from: string;
  readonly to: string;
  readonly threadIdHex: string;
  readonly messageIdHex: string;
  readonly respondsToHex: string;
  readonly summary: string;
};

export type UniversityProtocolFlowResult = {
  readonly metrics: {
    readonly issuanceMs: number;
    readonly jobApplicationsMs: number;
    readonly discountsMs: number;
    readonly totalMs: number;
  };
  readonly issuance: {
    readonly requestCount: number;
    readonly resultCount: number;
    readonly batchCount: number;
    readonly duplicateRequestCount: number;
    readonly idempotentReplayCount: number;
    readonly idempotentReplayStudentIds: readonly string[];
    readonly issuedStudentIds: readonly string[];
    readonly messages: readonly UniversityProtocolMessage[];
  };
  readonly jobApplications: {
    readonly requestCount: number;
    readonly submissionCount: number;
    readonly resultCount: number;
    readonly acceptedCount: number;
    readonly rejectedCount: number;
    readonly duplicateRejectedCount: number;
    readonly verificationRejectedCount: number;
    readonly companyAcceptedCounts: Readonly<Record<string, number>>;
    readonly resultsByStudent: Readonly<
      Record<string, readonly UniversityPresentationResultBody[]>
    >;
    readonly messages: readonly UniversityProtocolMessage[];
  };
  readonly discounts: {
    readonly requestCount: number;
    readonly submissionCount: number;
    readonly resultCount: number;
    readonly acceptedCount: number;
    readonly rejectedCount: number;
    readonly duplicateRejectedCount: number;
    readonly verificationRejectedCount: number;
    readonly outcomes: Readonly<Record<string, "accepted" | "rejected">>;
    readonly resultsByStudent: Readonly<
      Record<string, readonly UniversityPresentationResultBody[]>
    >;
    readonly messages: readonly UniversityProtocolMessage[];
  };
  readonly transcript: readonly UniversityProtocolTranscriptEntry[];
};

export type UniversityProtocolDataPaths = {
  readonly university: string;
  readonly students: string;
  readonly companies: string;
  readonly mall: string;
  readonly issuanceBatches: string;
  readonly discountApplicants: string;
};

export type UniversityProtocolExerciseOptions = {
  readonly companyRequestPolicyOverrides?: Readonly<
    Record<string, VerifierRequestPolicyOverride>
  >;
  readonly duplicateIssuanceRequestStudentIds?: readonly string[];
  readonly duplicateJobApplicationSubmissionStudentIds?: readonly string[];
  readonly duplicateMallDiscountSubmissionStudentIds?: readonly string[];
  readonly jobApplicationTamperingByStudentId?: Readonly<
    Record<string, UniversityPresentationTamperingMode>
  >;
};

export type UniversityFixtureData = {
  readonly university: UniversityProfile;
  readonly students: readonly StudentRecord[];
  readonly companies: readonly CompanyRecord[];
  readonly mall: MallRecord;
  readonly issuanceBatches: readonly IssuanceBatchRecord[];
  readonly discountApplicants: readonly DiscountApplicantRecord[];
};

export const defaultDataPaths = {
  university: "packages/use-cases/university/data/university.json",
  students: "packages/use-cases/university/data/students.json",
  companies: "packages/use-cases/university/data/companies.json",
  mall: "packages/use-cases/university/data/mall.json",
  issuanceBatches: "packages/use-cases/university/data/issuance-batches.json",
  discountApplicants: "packages/use-cases/university/data/discount-applicants.json",
} satisfies UniversityProtocolDataPaths;

export type EncodedUniversityClaims = Partial<UniversityDiplomaClaims>;
