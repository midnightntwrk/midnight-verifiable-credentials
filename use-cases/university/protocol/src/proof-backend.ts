import {
  pureCircuits as universityDiplomaPureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";
import {
  createUniversityDiplomaFixture,
  padText,
  type UniversityDiplomaDisclosureOptions,
  type UniversityDiplomaRequestOptions,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";
import {
  type UniversityJobApplicationRequestOptions,
  UniversityVerifierSimulator,
} from "@midnight-ntwrk/midnight-did-university-verifier-contract/testing";

import type {
  AgentProfile,
  EncodedUniversityClaims,
  StoredIssuedCredential,
  StudentRecord,
  UniversityPresentationRequestBody,
  UniversityPresentationSubmissionBody,
  UniversityPresentationTamperingMode,
  UniversityProfile,
  VerifierRequestPolicy,
  VerifierRequestPolicyOverride,
} from "./model.js";
import type { UniversityPartyRuntime } from "./runtime.js";

const encodeClaims = (student: StudentRecord): EncodedUniversityClaims => ({
  diplomaId: padText(student.diplomaClaimValues.diplomaId),
  studentId: padText(student.diplomaClaimValues.studentId, 16),
  graduateName: padText(student.diplomaClaimValues.graduateName),
  universityName: padText(student.diplomaClaimValues.universityName),
  facultyName: padText(student.diplomaClaimValues.facultyName),
  awardName: padText(student.diplomaClaimValues.awardName),
  honorsCode: padText(student.diplomaClaimValues.honorsCode, 16),
  graduationYear: BigInt(student.diplomaClaimValues.graduationYear),
  graduationMonth: BigInt(student.diplomaClaimValues.graduationMonth),
  finalGrade: BigInt(student.diplomaClaimValues.finalGrade),
  creditsEarned: BigInt(student.diplomaClaimValues.creditsEarned),
});

const requestOptionsFromRequest = (
  request: UniversityPresentationRequestBody["request"],
): UniversityDiplomaRequestOptions => ({
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
});

const disclosureOptionsFromRequest = (
  request: UniversityPresentationRequestBody["request"],
): UniversityDiplomaDisclosureOptions => ({
  revealDiplomaId: request.requireDiplomaIdDisclosure,
  revealStudentId: request.requireStudentIdDisclosure,
  revealGraduateName: request.requireGraduateNameDisclosure,
  revealUniversityName: request.requireUniversityNameDisclosure,
  revealFacultyName: request.requireFacultyNameDisclosure,
  revealAwardName: request.requireAwardNameDisclosure,
  revealHonorsCode: request.requireHonorsCodeDisclosure,
  revealGraduationYear: request.requireGraduationYearDisclosure,
  revealGraduationMonth: request.requireGraduationMonthDisclosure,
  revealFinalGrade: request.requireFinalGradeDisclosure,
  revealCreditsEarned: request.requireCreditsEarnedDisclosure,
});

const applyRequestPolicyOverrides = (
  request: UniversityPresentationRequestBody["request"],
  overrides?: VerifierRequestPolicyOverride,
): UniversityPresentationRequestBody["request"] => {
  if (!overrides) {
    return request;
  }
  const { minimumFinalGrade, ...restOverrides } = overrides;
  return {
    ...request,
    ...restOverrides,
    minimumFinalGrade:
      minimumFinalGrade === undefined
        ? request.minimumFinalGrade
        : BigInt(minimumFinalGrade),
  };
};

const tamperedBytesLike = (value: Uint8Array, fill: number): Uint8Array =>
  new Uint8Array(value.length).fill(fill);

export const applyPresentationTampering = (
  submission: UniversityPresentationSubmissionBody,
  tampering?: UniversityPresentationTamperingMode,
): UniversityPresentationSubmissionBody => {
  switch (tampering) {
    case undefined:
      return submission;
    case "credentialClaimRoot":
      return {
        ...submission,
        credential: {
          ...submission.credential,
          claimRoot: tamperedBytesLike(submission.credential.claimRoot, 7),
        },
      };
    case "requestChallenge":
      return {
        ...submission,
        request: {
          ...submission.request,
          verifierChallengeHash: tamperedBytesLike(
            submission.request.verifierChallengeHash,
            9,
          ),
        },
      };
    case "issuerVerificationMethodRef":
      return {
        ...submission,
        credential: {
          ...submission.credential,
          issuerVerificationMethodRef: {
            ...submission.credential.issuerVerificationMethodRef,
            methodId: tamperedBytesLike(
              submission.credential.issuerVerificationMethodRef.methodId,
              5,
            ),
          },
        },
      };
    case "holderBindingDidContractAddress":
      return {
        ...submission,
        presentation: {
          ...submission.presentation,
          holderBinding: {
            ...submission.presentation.holderBinding,
            holderVerificationMethodRef: {
              ...submission.presentation.holderBinding.holderVerificationMethodRef,
              didContractAddress: {
                ...submission.presentation.holderBinding
                  .holderVerificationMethodRef.didContractAddress,
                bytes: tamperedBytesLike(
                  submission.presentation.holderBinding.holderVerificationMethodRef
                    .didContractAddress.bytes,
                  4,
                ),
              },
            },
          },
        },
      };
    case "holderBindingMethodRef":
      return {
        ...submission,
        presentation: {
          ...submission.presentation,
          holderBinding: {
            ...submission.presentation.holderBinding,
            holderVerificationMethodRef: {
              ...submission.presentation.holderBinding.holderVerificationMethodRef,
              methodId: tamperedBytesLike(
                submission.presentation.holderBinding.holderVerificationMethodRef
                  .methodId,
                6,
              ),
            },
          },
        },
      };
    case "proofSignerDidContractAddress":
      return {
        ...submission,
        presentationProof: {
          ...submission.presentationProof,
          signerVerificationMethodRef: {
            ...submission.presentationProof.signerVerificationMethodRef,
            didContractAddress: {
              ...submission.presentationProof.signerVerificationMethodRef
                .didContractAddress,
              bytes: tamperedBytesLike(
                submission.presentationProof.signerVerificationMethodRef
                  .didContractAddress.bytes,
                8,
              ),
            },
          },
        },
      };
    case "proofSignerMethodRef":
      return {
        ...submission,
        presentationProof: {
          ...submission.presentationProof,
          signerVerificationMethodRef: {
            ...submission.presentationProof.signerVerificationMethodRef,
            methodId: tamperedBytesLike(
              submission.presentationProof.signerVerificationMethodRef.methodId,
              10,
            ),
          },
        },
      };
  }
};

export interface UniversityProofExecutionBackend {
  issueDiplomaCredential(options: {
    readonly issuerProfile: AgentProfile;
    readonly issuerRuntime: UniversityPartyRuntime;
    readonly holderProfile: AgentProfile;
    readonly holderRuntime: UniversityPartyRuntime;
    readonly student: StudentRecord;
    readonly issuanceChallengeHash: Uint8Array;
    readonly issuedAt: bigint;
    readonly credentialProofCreatedAt: bigint;
    readonly presentationProofCreatedAt: bigint;
  }): StoredIssuedCredential;
  buildPresentationSubmission(options: {
    readonly kind: "jobApplication" | "mallDiscount";
    readonly issuerProfile: AgentProfile;
    readonly issuerRuntime: UniversityPartyRuntime;
    readonly holderProfile: AgentProfile;
    readonly holderRuntime: UniversityPartyRuntime;
    readonly student: StudentRecord;
    readonly storedCredential: StoredIssuedCredential;
    readonly request: UniversityPresentationRequestBody["request"];
    readonly tampering?: UniversityPresentationTamperingMode;
  }): UniversityPresentationSubmissionBody;
  buildJobApplicationRequest(options: {
    readonly issuerVerificationMethodRef: StoredIssuedCredential["credential"]["issuerVerificationMethodRef"];
    readonly verifierChallengeHash: Uint8Array;
    readonly requestPolicy: VerifierRequestPolicy;
    readonly requestPolicyOverrides?: VerifierRequestPolicyOverride;
  }): UniversityPresentationRequestBody["request"];
  buildMallDiscountRequest(options: {
    readonly issuerVerificationMethodRef: StoredIssuedCredential["credential"]["issuerVerificationMethodRef"];
    readonly verifierChallengeHash: Uint8Array;
    readonly minimumFinalGrade: bigint;
  }): UniversityPresentationRequestBody["request"];
  verifyJobApplication(options: {
    readonly submission: UniversityPresentationSubmissionBody;
  }): void;
  verifyMallDiscount(options: {
    readonly submission: UniversityPresentationSubmissionBody;
  }): void;
}

export class SimulatorUniversityProofExecutionBackend
  implements UniversityProofExecutionBackend
{
  readonly verifier = new UniversityVerifierSimulator();

  issueDiplomaCredential(options: {
    readonly issuerProfile: AgentProfile;
    readonly issuerRuntime: UniversityPartyRuntime;
    readonly holderProfile: AgentProfile;
    readonly holderRuntime: UniversityPartyRuntime;
    readonly student: StudentRecord;
    readonly issuanceChallengeHash: Uint8Array;
    readonly issuedAt: bigint;
    readonly credentialProofCreatedAt: bigint;
    readonly presentationProofCreatedAt: bigint;
  }): StoredIssuedCredential {
    const fixture = createUniversityDiplomaFixture({
      issuerConfig: options.issuerRuntime.signerOptionsFor(options.issuerProfile),
      holderConfig: options.holderRuntime.signerOptionsFor(options.holderProfile),
      claimOverrides: encodeClaims(options.student),
      issuanceChallengeHash: options.issuanceChallengeHash,
      issuedAt: options.issuedAt,
      credentialProofCreatedAt: options.credentialProofCreatedAt,
      presentationProofCreatedAt: options.presentationProofCreatedAt,
    });

    return {
      credential: fixture.credential,
      credentialProof: fixture.credentialProof,
      issuedAt: options.issuedAt,
      credentialProofCreatedAt: options.credentialProofCreatedAt,
      presentationProofCreatedAt: options.presentationProofCreatedAt,
      issuanceChallengeHash: options.issuanceChallengeHash,
    };
  }

  buildPresentationSubmission(options: {
    readonly kind: "jobApplication" | "mallDiscount";
    readonly issuerProfile: AgentProfile;
    readonly issuerRuntime: UniversityPartyRuntime;
    readonly holderProfile: AgentProfile;
    readonly holderRuntime: UniversityPartyRuntime;
    readonly student: StudentRecord;
    readonly storedCredential: StoredIssuedCredential;
    readonly request: UniversityPresentationRequestBody["request"];
    readonly tampering?: UniversityPresentationTamperingMode;
  }): UniversityPresentationSubmissionBody {
    const presentationFixture = createUniversityDiplomaFixture({
      issuerConfig: options.issuerRuntime.signerOptionsFor(options.issuerProfile),
      holderConfig: options.holderRuntime.signerOptionsFor(options.holderProfile),
      claimOverrides: encodeClaims(options.student),
      request: requestOptionsFromRequest(options.request),
      disclosure: disclosureOptionsFromRequest(options.request),
      verifierChallengeHash: options.request.verifierChallengeHash,
      issuanceChallengeHash: options.storedCredential.issuanceChallengeHash,
      issuedAt: options.storedCredential.issuedAt,
      credentialProofCreatedAt: options.storedCredential.credentialProofCreatedAt,
      presentationProofCreatedAt: options.storedCredential.presentationProofCreatedAt,
    });

    const storedRoot = universityDiplomaPureCircuits.universityDiplomaCredentialBodyRoot(
      options.storedCredential.credential,
    );
    const rebuiltRoot = universityDiplomaPureCircuits.universityDiplomaCredentialBodyRoot(
      presentationFixture.credential,
    );
    if (Buffer.from(storedRoot).toString("hex") !== Buffer.from(rebuiltRoot).toString("hex")) {
      throw new Error(
        `Rebuilt university diploma root drift for ${options.student.studentId}`,
      );
    }

    const untampered: UniversityPresentationSubmissionBody = {
      kind: options.kind,
      studentId: options.student.studentId,
      credential: options.storedCredential.credential,
      credentialProof: options.storedCredential.credentialProof,
      request: options.request,
      presentation: presentationFixture.presentation,
      presentationProof: presentationFixture.presentationProof,
    };

    return applyPresentationTampering(untampered, options.tampering);
  }

  buildJobApplicationRequest(options: {
    readonly issuerVerificationMethodRef: StoredIssuedCredential["credential"]["issuerVerificationMethodRef"];
    readonly verifierChallengeHash: Uint8Array;
    readonly requestPolicy: VerifierRequestPolicy;
    readonly requestPolicyOverrides?: VerifierRequestPolicyOverride;
  }): UniversityPresentationRequestBody["request"] {
    return applyRequestPolicyOverrides(
      this.verifier.universityJobApplicationRequest(
        options.issuerVerificationMethodRef,
        options.verifierChallengeHash,
        {
          ...options.requestPolicy,
        } satisfies UniversityJobApplicationRequestOptions,
      ),
      options.requestPolicyOverrides,
    );
  }

  buildMallDiscountRequest(options: {
    readonly issuerVerificationMethodRef: StoredIssuedCredential["credential"]["issuerVerificationMethodRef"];
    readonly verifierChallengeHash: Uint8Array;
    readonly minimumFinalGrade: bigint;
  }): UniversityPresentationRequestBody["request"] {
    return this.verifier.universityMallDiscountRequest(
      options.issuerVerificationMethodRef,
      options.verifierChallengeHash,
      options.minimumFinalGrade,
    );
  }

  verifyJobApplication(options: {
    readonly submission: UniversityPresentationSubmissionBody;
  }): void {
    this.verifier.verifyUniversityDiplomaForJobApplication(
      options.submission.credential,
      options.submission.credentialProof,
      options.submission.request,
      options.submission.presentation,
      options.submission.presentationProof,
    );
  }

  verifyMallDiscount(options: {
    readonly submission: UniversityPresentationSubmissionBody;
  }): void {
    this.verifier.verifyUniversityDiplomaForMallDiscount(
      options.submission.credential,
      options.submission.credentialProof,
      options.submission.request,
      options.submission.presentation,
      options.submission.presentationProof,
    );
  }
}
