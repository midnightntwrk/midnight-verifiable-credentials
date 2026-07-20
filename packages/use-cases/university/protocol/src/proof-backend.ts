import { randomBytes } from "node:crypto";
import { performance } from "node:perf_hooks";

import {
  pureCircuits as universityDiplomaPureCircuits,
  type UniversityDiplomaProductionFinalGradePredicateWitness,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";
import {
  createUniversityDiplomaProductionClaimOpenings,
  createUniversityDiplomaProductionCredentialFixture,
  createUniversityDiplomaProductionFinalGradePredicateWitness,
  createUniversityDiplomaProductionPresentationFixture,
  padText,
  type UniversityDiplomaDisclosureOptions,
  type UniversityDiplomaProductionClaimOpenings,
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

// #267 FIX: disclosure is driven strictly by what the verifier's request
// requires. Fields that are not required are NOT copied into the disclosure
// payload — they remain hidden behind their salted commitments.
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

const bytesHex = (value: Uint8Array): string =>
  Buffer.from(value).toString("hex");

const assertNeverTamperingMode = (value: never): never => {
  throw new Error(`Unsupported presentation tampering mode: ${String(value)}`);
};

export const universityApplicantRef = (
  credential: StoredIssuedCredential["credential"],
): string => bytesHex(credential.claimCommitments.studentIdCommitment);

export interface UniversityClaimOpeningsSource {
  openingsForStudent(
    student: StudentRecord,
  ): UniversityDiplomaProductionClaimOpenings;
}

const takeRandomBytes = (length: number): Uint8Array =>
  new Uint8Array(randomBytes(length));

export class NodeCryptoUniversityClaimOpeningsSource
  implements UniversityClaimOpeningsSource
{
  openingsForStudent(): UniversityDiplomaProductionClaimOpenings {
    return {
      diplomaIdOpening: takeRandomBytes(32),
      studentIdOpening: takeRandomBytes(32),
      graduateNameOpening: takeRandomBytes(32),
      facultyNameOpening: takeRandomBytes(32),
      honorsCodeOpening: takeRandomBytes(32),
      graduationMonthOpening: takeRandomBytes(32),
      finalGradeOpening: takeRandomBytes(32),
      creditsEarnedOpening: takeRandomBytes(32),
    };
  }
}

/**
 * Reference-only deterministic per-student openings. Openings derived from a
 * low-entropy studentId are brute-forceable, so this source is reserved for
 * the deterministic fixture runtime whose baselines must be reproducible.
 */
export class ReferenceDeterministicUniversityClaimOpeningsSource
  implements UniversityClaimOpeningsSource
{
  openingsForStudent(
    student: StudentRecord,
  ): UniversityDiplomaProductionClaimOpenings {
    return createUniversityDiplomaProductionClaimOpenings(
      `student:${student.studentId}`,
    );
  }
}

export const secureUniversityClaimOpeningsSource =
  new NodeCryptoUniversityClaimOpeningsSource();

export const unsafeReferenceDeterministicUniversityClaimOpeningsSource =
  new ReferenceDeterministicUniversityClaimOpeningsSource();

export type UniversityProofExecutionBackendOptions = {
  readonly claimOpeningsSource?: UniversityClaimOpeningsSource;
};

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
    default:
      return assertNeverTamperingMode(tampering);
  }
};

export type UniversityProofExecutionBackendMetric = {
  readonly name: string;
  readonly durationMs: number;
  readonly tags?: Record<string, string | number | boolean>;
};

export type UniversityProofExecutionBackendDescriptor = {
  readonly mode: "simulator" | "standalone-hybrid" | "proof-server-contract";
  readonly description: string;
  readonly usesRealDidBindings: boolean;
  readonly usesRealProofInfrastructure: boolean;
  readonly usesRemoteProofServerContract?: boolean;
};

export interface UniversityProofExecutionBackend {
  descriptor(): UniversityProofExecutionBackendDescriptor;
  snapshotMetrics(): readonly UniversityProofExecutionBackendMetric[];
  resetMetrics(): void;
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

abstract class MeasuredUniversityProofExecutionBackend
  implements UniversityProofExecutionBackend
{
  readonly verifier = new UniversityVerifierSimulator();
  readonly #metrics: UniversityProofExecutionBackendMetric[] = [];
  // HOLDER-PRIVATE proving material, keyed by request challenge + applicant
  // ref. In the simulator backend both parties run in-process; this map
  // stands in for the holder's local proving step, where predicate witnesses
  // (claim value + commitment opening) feed the ZK circuit WITHOUT ever
  // entering a protocol message. In the real contract flow these are witness
  // inputs to the holder's transaction proof and never leave the holder.
  readonly #holderPredicateWitnesses = new Map<
    string,
    UniversityDiplomaProductionFinalGradePredicateWitness
  >();
  readonly #claimOpeningsSource?: UniversityClaimOpeningsSource;

  constructor(options?: UniversityProofExecutionBackendOptions) {
    this.#claimOpeningsSource = options?.claimOpeningsSource;
  }

  abstract descriptor(): UniversityProofExecutionBackendDescriptor;

  snapshotMetrics(): readonly UniversityProofExecutionBackendMetric[] {
    return this.#metrics.map((metric) => ({
      ...metric,
      tags: metric.tags ? { ...metric.tags } : undefined,
    }));
  }

  resetMetrics(): void {
    this.#metrics.length = 0;
  }

  protected measure<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string | number | boolean>,
  ): T {
    const startedAt = performance.now();
    try {
      return fn();
    } finally {
      this.#metrics.push({
        name,
        durationMs: performance.now() - startedAt,
        tags: {
          backendMode: this.descriptor().mode,
          ...tags,
        },
      });
    }
  }

  #witnessKey(
    verifierChallengeHash: Uint8Array,
    applicantRef: string,
  ): string {
    return `${bytesHex(verifierChallengeHash)}:${applicantRef}`;
  }

  #claimOpeningsSourceFor(
    issuerRuntime: UniversityPartyRuntime,
  ): UniversityClaimOpeningsSource {
    return (
      this.#claimOpeningsSource ??
      (issuerRuntime.descriptor().mode === "deterministic"
        ? unsafeReferenceDeterministicUniversityClaimOpeningsSource
        : secureUniversityClaimOpeningsSource)
    );
  }

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
    return this.measure(
      "proof_issue_diploma_ms",
      () => {
        const openings = this.#claimOpeningsSourceFor(
          options.issuerRuntime,
        ).openingsForStudent(options.student);
        const fixture = createUniversityDiplomaProductionCredentialFixture({
          issuerConfig: options.issuerRuntime.signerOptionsFor(options.issuerProfile),
          holderConfig: options.holderRuntime.signerOptionsFor(options.holderProfile),
          claimOverrides: encodeClaims(options.student),
          openings,
          issuanceChallengeHash: options.issuanceChallengeHash,
          issuedAt: options.issuedAt,
          credentialProofCreatedAt: options.credentialProofCreatedAt,
        });

        return {
          credential: fixture.credential,
          credentialProof: fixture.credentialProof,
          claimOpenings: fixture.profile.openings,
          issuedAt: options.issuedAt,
          credentialProofCreatedAt: options.credentialProofCreatedAt,
          presentationProofCreatedAt: options.presentationProofCreatedAt,
          issuanceChallengeHash: options.issuanceChallengeHash,
        };
      },
      { studentId: options.student.studentId },
    );
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
    return this.measure(
      "proof_build_presentation_submission_ms",
      () => {
        const presentationFixture =
          createUniversityDiplomaProductionPresentationFixture({
            issuerConfig: options.issuerRuntime.signerOptionsFor(options.issuerProfile),
            holderConfig: options.holderRuntime.signerOptionsFor(options.holderProfile),
            claimOverrides: encodeClaims(options.student),
            openings: options.storedCredential.claimOpenings,
            request: requestOptionsFromRequest(options.request),
            disclosure: disclosureOptionsFromRequest(options.request),
            verifierChallengeHash: options.request.verifierChallengeHash,
            issuanceChallengeHash: options.storedCredential.issuanceChallengeHash,
            issuedAt: options.storedCredential.issuedAt,
            credentialProofCreatedAt: options.storedCredential.credentialProofCreatedAt,
            presentationProofCreatedAt: options.storedCredential.presentationProofCreatedAt,
          });

        const storedRoot =
          universityDiplomaPureCircuits.universityDiplomaProductionCredentialBodyRoot(
            options.storedCredential.credential,
          );
        const rebuiltRoot =
          universityDiplomaPureCircuits.universityDiplomaProductionCredentialBodyRoot(
            presentationFixture.credential,
          );
        if (bytesHex(storedRoot) !== bytesHex(rebuiltRoot)) {
          throw new Error(
            `Rebuilt university diploma root drift for ${options.student.studentId}`,
          );
        }

        const applicantRef = universityApplicantRef(
          options.storedCredential.credential,
        );

        if (options.kind === "mallDiscount") {
          // The predicate witness is the holder's local proving input. It is
          // deliberately kept OUT of the submission body: hidden claims cross
          // the wire only as salted commitments.
          this.#holderPredicateWitnesses.set(
            this.#witnessKey(options.request.verifierChallengeHash, applicantRef),
            createUniversityDiplomaProductionFinalGradePredicateWitness({
              claims: presentationFixture.sourceClaims,
              openings: options.storedCredential.claimOpenings,
            }),
          );
        }

        const untampered: UniversityPresentationSubmissionBody = {
          kind: options.kind,
          applicantRef,
          credential: options.storedCredential.credential,
          credentialProof: options.storedCredential.credentialProof,
          request: options.request,
          presentation: presentationFixture.presentation,
          presentationProof: presentationFixture.presentationProof,
        };

        return applyPresentationTampering(untampered, options.tampering);
      },
      {
        studentId: options.student.studentId,
        kind: options.kind,
        tampered: options.tampering !== undefined,
      },
    );
  }

  buildJobApplicationRequest(options: {
    readonly issuerVerificationMethodRef: StoredIssuedCredential["credential"]["issuerVerificationMethodRef"];
    readonly verifierChallengeHash: Uint8Array;
    readonly requestPolicy: VerifierRequestPolicy;
    readonly requestPolicyOverrides?: VerifierRequestPolicyOverride;
  }): UniversityPresentationRequestBody["request"] {
    return this.measure("proof_build_job_request_ms", () =>
      applyRequestPolicyOverrides(
        this.verifier.universityJobApplicationRequest(
          options.issuerVerificationMethodRef,
          options.verifierChallengeHash,
          {
            requireDiplomaIdDisclosure:
              options.requestPolicy.requireDiplomaIdDisclosure ?? false,
            requireStudentIdDisclosure:
              options.requestPolicy.requireStudentIdDisclosure ?? false,
            requireFacultyNameDisclosure:
              options.requestPolicy.requireFacultyNameDisclosure ?? false,
            requireHonorsCodeDisclosure:
              options.requestPolicy.requireHonorsCodeDisclosure ?? false,
            requireGraduationMonthDisclosure:
              options.requestPolicy.requireGraduationMonthDisclosure ?? false,
            requireFinalGradeDisclosure:
              options.requestPolicy.requireFinalGradeDisclosure ?? false,
            requireCreditsEarnedDisclosure:
              options.requestPolicy.requireCreditsEarnedDisclosure ?? false,
          } satisfies UniversityJobApplicationRequestOptions,
        ),
        options.requestPolicyOverrides,
      ),
    );
  }

  buildMallDiscountRequest(options: {
    readonly issuerVerificationMethodRef: StoredIssuedCredential["credential"]["issuerVerificationMethodRef"];
    readonly verifierChallengeHash: Uint8Array;
    readonly minimumFinalGrade: bigint;
  }): UniversityPresentationRequestBody["request"] {
    return this.measure("proof_build_mall_request_ms", () =>
      this.verifier.universityMallDiscountRequest(
        options.issuerVerificationMethodRef,
        options.verifierChallengeHash,
        options.minimumFinalGrade,
      ),
    );
  }

  verifyJobApplication(options: {
    readonly submission: UniversityPresentationSubmissionBody;
  }): void {
    this.measure(
      "proof_verify_job_application_ms",
      () => {
        // #267: the old transport-level studentId-vs-claims check is gone —
        // studentId is a hidden claim. Holder binding between credential and
        // presentation is enforced in-circuit.
        this.verifier.verifyUniversityDiplomaForJobApplication(
          options.submission.credential,
          options.submission.credentialProof,
          options.submission.request,
          options.submission.presentation,
          options.submission.presentationProof,
        );
      },
      { applicantRef: options.submission.applicantRef },
    );
  }

  verifyMallDiscount(options: {
    readonly submission: UniversityPresentationSubmissionBody;
  }): void {
    this.measure(
      "proof_verify_mall_discount_ms",
      () => {
        // Retrieve the holder's private proving witness for this
        // (challenge, applicant) pair. This models the holder-side proving
        // step of the reveal-nothing predicate: the witness feeds the
        // circuit, not the wire.
        const witness = this.#holderPredicateWitnesses.get(
          this.#witnessKey(
            options.submission.request.verifierChallengeHash,
            options.submission.applicantRef,
          ),
        );
        if (!witness) {
          throw new Error(
            `Missing holder predicate witness for applicant ${options.submission.applicantRef}`,
          );
        }
        this.verifier.verifyUniversityDiplomaForMallDiscount(
          options.submission.credential,
          options.submission.credentialProof,
          options.submission.request,
          options.submission.presentation,
          options.submission.presentationProof,
          witness,
        );
      },
      { applicantRef: options.submission.applicantRef },
    );
  }
}

export class SimulatorUniversityProofExecutionBackend
  extends MeasuredUniversityProofExecutionBackend
  implements UniversityProofExecutionBackend
{
  descriptor(): UniversityProofExecutionBackendDescriptor {
    return {
      mode: "simulator",
      description:
        "Local deterministic proof backend using in-process university-diploma fixtures and verifier simulator semantics.",
      usesRealDidBindings: false,
      usesRealProofInfrastructure: false,
    };
  }
}

export class StandaloneHybridUniversityProofExecutionBackend
  extends MeasuredUniversityProofExecutionBackend
  implements UniversityProofExecutionBackend
{
  descriptor(): UniversityProofExecutionBackendDescriptor {
    return {
      mode: "standalone-hybrid",
      description:
        "Hybrid proof backend: real standalone DID bindings paired with local university-diploma fixture generation and verifier simulator semantics.",
      usesRealDidBindings: true,
      usesRealProofInfrastructure: false,
    };
  }
}
