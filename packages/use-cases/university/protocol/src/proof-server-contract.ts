import { performance } from "node:perf_hooks";

import type {
  AgentProfile,
  StoredIssuedCredential,
  StudentRecord,
  UniversityPresentationRequestBody,
  UniversityPresentationSubmissionBody,
  UniversityPresentationTamperingMode,
  VerifierRequestPolicy,
  VerifierRequestPolicyOverride,
} from "./model.js";
import {
  SimulatorUniversityProofExecutionBackend,
  type UniversityProofExecutionBackend,
  type UniversityProofExecutionBackendDescriptor,
  type UniversityProofExecutionBackendMetric,
} from "./proof-backend.js";
import type { UniversityPartyRuntime } from "./runtime.js";

export type UniversityProofServerPartyRef = {
  readonly partyId: string;
  readonly didUrl: string;
  readonly methodId: string;
  readonly runtimeMode: string;
};

export type UniversityProofServerVerificationMethodRef = {
  readonly didContractAddressHex: string;
  readonly methodId: string;
  readonly methodIdHex: string;
};

export type UniversityProofServerCredentialRef = {
  readonly studentId: string;
  readonly issuerVerificationMethodRef: UniversityProofServerVerificationMethodRef;
  readonly claimRootHex: string;
  readonly issuanceChallengeHashHex: string;
  readonly issuedAt: string;
  readonly credentialProofCreatedAt: string;
  readonly presentationProofCreatedAt: string;
};

export type UniversityProofServerProofRef = {
  readonly signerVerificationMethodRef: UniversityProofServerVerificationMethodRef;
  readonly createdAt: string;
  readonly challengeHashHex: string;
};

export type UniversityProofServerPresentationRequestSummary = {
  readonly verifierChallengeHashHex: string;
  readonly disclosedFields: readonly string[];
  readonly enforceMinimumFinalGrade: boolean;
  readonly minimumFinalGrade: string;
};

export type UniversityProofServerRequestPolicy = Omit<
  VerifierRequestPolicy,
  "minimumFinalGrade"
> & {
  readonly minimumFinalGrade?: string;
};

export type UniversityProofServerRequestPolicyOverride = Omit<
  VerifierRequestPolicyOverride,
  "minimumFinalGrade"
> & {
  readonly minimumFinalGrade?: string;
};

export type UniversityProofServerRequest =
  | {
      readonly operationKind: "issueDiplomaCredential";
      readonly issuer: UniversityProofServerPartyRef;
      readonly holder: UniversityProofServerPartyRef;
      readonly studentId: string;
      readonly diplomaId: string;
      readonly issuanceChallengeHashHex: string;
      readonly issuedAt: string;
      readonly credentialProofCreatedAt: string;
      readonly presentationProofCreatedAt: string;
    }
  | {
      readonly operationKind: "buildJobApplicationRequest";
      readonly issuerVerificationMethodRef: UniversityProofServerVerificationMethodRef;
      readonly verifierChallengeHashHex: string;
      readonly requestPolicy: UniversityProofServerRequestPolicy;
      readonly requestPolicyOverrides?: UniversityProofServerRequestPolicyOverride;
    }
  | {
      readonly operationKind: "buildMallDiscountRequest";
      readonly issuerVerificationMethodRef: UniversityProofServerVerificationMethodRef;
      readonly verifierChallengeHashHex: string;
      readonly minimumFinalGrade: string;
    }
  | {
      readonly operationKind: "buildPresentationSubmission";
      readonly presentationKind: "jobApplication" | "mallDiscount";
      readonly issuer: UniversityProofServerPartyRef;
      readonly holder: UniversityProofServerPartyRef;
      readonly studentId: string;
      readonly credential: UniversityProofServerCredentialRef;
      readonly request: UniversityProofServerPresentationRequestSummary;
      readonly tampering?: UniversityPresentationTamperingMode;
    }
  | {
      readonly operationKind: "verifyJobApplication" | "verifyMallDiscount";
      readonly studentId: string;
      readonly credential: UniversityProofServerCredentialRef;
      readonly request: UniversityProofServerPresentationRequestSummary;
      readonly credentialProof: UniversityProofServerProofRef;
      readonly presentationProof: UniversityProofServerProofRef;
    };

export type UniversityProofServerResponse =
  | {
      readonly operationKind: "issueDiplomaCredential";
      readonly credential: UniversityProofServerCredentialRef;
      readonly credentialProof: UniversityProofServerProofRef;
    }
  | {
      readonly operationKind:
        | "buildJobApplicationRequest"
        | "buildMallDiscountRequest";
      readonly request: UniversityProofServerPresentationRequestSummary;
    }
  | {
      readonly operationKind: "buildPresentationSubmission";
      readonly credential: UniversityProofServerCredentialRef;
      readonly presentationProof: UniversityProofServerProofRef;
    }
  // The contract currently records verifier acceptance only. A real
  // proof-server response can add verification metadata under a v2 schema.
  | {
      readonly operationKind: "verifyJobApplication" | "verifyMallDiscount";
      readonly accepted: true;
    };

export type UniversityProofServerExchangeResult =
  | {
      readonly status: "succeeded";
      readonly response: UniversityProofServerResponse;
    }
  | {
      readonly status: "failed";
      readonly errorMessage: string;
    };

export type UniversityProofServerExchange = {
  readonly operationId: string;
  readonly request: UniversityProofServerRequest;
  readonly result: UniversityProofServerExchangeResult;
  readonly durationMs: number;
};

export interface UniversityProofServerAdapter {
  recordExchange(exchange: UniversityProofServerExchange): void;
}

export interface UniversityProofServerExchangeRecorder extends UniversityProofServerAdapter {
  snapshotExchanges(): readonly UniversityProofServerExchange[];
  resetExchanges(): void;
}

const cloneProofServerPayload = <T>(payload: T): T =>
  globalThis.structuredClone(payload);

const cloneExchange = (
  exchange: UniversityProofServerExchange,
): UniversityProofServerExchange => cloneProofServerPayload(exchange);

const isExchangeRecorder = (
  adapter: UniversityProofServerAdapter,
): adapter is UniversityProofServerExchangeRecorder =>
  "resetExchanges" in adapter &&
  typeof (adapter as { readonly resetExchanges?: unknown }).resetExchanges ===
    "function" &&
  "snapshotExchanges" in adapter &&
  typeof (adapter as { readonly snapshotExchanges?: unknown })
    .snapshotExchanges === "function";

export class RecordingUniversityProofServerAdapter implements UniversityProofServerExchangeRecorder {
  readonly #exchanges: UniversityProofServerExchange[] = [];

  recordExchange(exchange: UniversityProofServerExchange): void {
    this.#exchanges.push(cloneExchange(exchange));
  }

  snapshotExchanges(): readonly UniversityProofServerExchange[] {
    return this.#exchanges.map((exchange) => cloneExchange(exchange));
  }

  resetExchanges(): void {
    this.#exchanges.length = 0;
  }
}

export type ProofServerContractUniversityProofExecutionBackendOptions = {
  readonly adapter?: UniversityProofServerAdapter;
  readonly delegate?: UniversityProofExecutionBackend;
};

const bytesToHex = (value: Uint8Array): string =>
  Buffer.from(value).toString("hex");

const paddedTextToString = (value: Uint8Array): string =>
  Buffer.from(value).toString("utf8").replace(/\0+$/u, "");

const methodRef = (value: {
  readonly didContractAddress: { readonly bytes: Uint8Array };
  readonly methodId: Uint8Array;
}): UniversityProofServerVerificationMethodRef => ({
  didContractAddressHex: bytesToHex(value.didContractAddress.bytes),
  methodId: paddedTextToString(value.methodId),
  methodIdHex: bytesToHex(value.methodId),
});

const partyRef = (
  profile: AgentProfile,
  runtime: UniversityPartyRuntime,
): UniversityProofServerPartyRef => ({
  partyId: profile.partyId,
  didUrl: profile.didUrl,
  methodId: profile.methodId,
  runtimeMode: runtime.descriptor().mode,
});

const credentialRef = (
  studentId: string,
  storedCredential: StoredIssuedCredential,
): UniversityProofServerCredentialRef => ({
  studentId,
  issuerVerificationMethodRef: methodRef(
    storedCredential.credential.issuerVerificationMethodRef,
  ),
  claimRootHex: bytesToHex(storedCredential.credential.claimRoot),
  issuanceChallengeHashHex: bytesToHex(storedCredential.issuanceChallengeHash),
  issuedAt: storedCredential.issuedAt.toString(),
  credentialProofCreatedAt:
    storedCredential.credentialProofCreatedAt.toString(),
  presentationProofCreatedAt:
    storedCredential.presentationProofCreatedAt.toString(),
});

const credentialRefFromSubmission = (
  submission: UniversityPresentationSubmissionBody,
): UniversityProofServerCredentialRef => ({
  studentId: submission.studentId,
  issuerVerificationMethodRef: methodRef(
    submission.credential.issuerVerificationMethodRef,
  ),
  claimRootHex: bytesToHex(submission.credential.claimRoot),
  issuanceChallengeHashHex: bytesToHex(
    submission.credentialProof.challengeHash,
  ),
  issuedAt: submission.credential.issuedAt.toString(),
  credentialProofCreatedAt: submission.credentialProof.createdAt.toString(),
  presentationProofCreatedAt: submission.presentationProof.createdAt.toString(),
});

const proofRef = (
  proof: UniversityPresentationSubmissionBody["credentialProof"],
): UniversityProofServerProofRef => ({
  signerVerificationMethodRef: methodRef(proof.signerVerificationMethodRef),
  createdAt: proof.createdAt.toString(),
  challengeHashHex: bytesToHex(proof.challengeHash),
});

type UniversityPresentationDisclosureRequestField = Extract<
  keyof UniversityPresentationRequestBody["request"],
  `require${string}Disclosure`
>;

const presentationDisclosureFields = [
  ["requireDiplomaIdDisclosure", "diplomaId"],
  ["requireStudentIdDisclosure", "studentId"],
  ["requireGraduateNameDisclosure", "graduateName"],
  ["requireUniversityNameDisclosure", "universityName"],
  ["requireFacultyNameDisclosure", "facultyName"],
  ["requireAwardNameDisclosure", "awardName"],
  ["requireHonorsCodeDisclosure", "honorsCode"],
  ["requireGraduationYearDisclosure", "graduationYear"],
  ["requireGraduationMonthDisclosure", "graduationMonth"],
  ["requireFinalGradeDisclosure", "finalGrade"],
  ["requireCreditsEarnedDisclosure", "creditsEarned"],
] as const satisfies readonly (readonly [
  UniversityPresentationDisclosureRequestField,
  string,
])[];

type ConfiguredUniversityPresentationDisclosureRequestField =
  (typeof presentationDisclosureFields)[number][0];
type MissingUniversityPresentationDisclosureRequestField = Exclude<
  UniversityPresentationDisclosureRequestField,
  ConfiguredUniversityPresentationDisclosureRequestField
>;
type UniversityPresentationDisclosureFieldCoverageGuard =
  MissingUniversityPresentationDisclosureRequestField extends never
    ? true
    : [
        "Missing university presentation disclosure request field",
        MissingUniversityPresentationDisclosureRequestField,
      ];

const universityPresentationDisclosureFieldCoverageGuard: UniversityPresentationDisclosureFieldCoverageGuard = true;
void universityPresentationDisclosureFieldCoverageGuard;

const disclosedFieldsForRequest = (
  request: UniversityPresentationRequestBody["request"],
): readonly string[] =>
  presentationDisclosureFields
    .filter(([field]) => request[field] === true)
    .map(([, claimName]) => claimName);

const requestSummary = (
  request: UniversityPresentationRequestBody["request"],
): UniversityProofServerPresentationRequestSummary => ({
  verifierChallengeHashHex: bytesToHex(request.verifierChallengeHash),
  disclosedFields: disclosedFieldsForRequest(request),
  enforceMinimumFinalGrade: request.enforceMinimumFinalGrade,
  minimumFinalGrade: request.minimumFinalGrade.toString(),
});

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const normalizePolicyValueForDto = (field: string, value: unknown): unknown =>
  typeof value === "bigint" || field === "minimumFinalGrade"
    ? String(value)
    : value;

const proofServerPolicyPayload = <TOutput>(
  policy: VerifierRequestPolicy | VerifierRequestPolicyOverride,
): TOutput =>
  cloneProofServerPayload(
    Object.fromEntries(
      Object.entries(policy).flatMap(([field, value]) =>
        value === undefined
          ? []
          : [[field, normalizePolicyValueForDto(field, value)]],
      ),
    ) as TOutput,
  );

const requestPolicyRef = (
  policy: VerifierRequestPolicy,
): UniversityProofServerRequestPolicy =>
  proofServerPolicyPayload<UniversityProofServerRequestPolicy>(policy);

const requestPolicyOverrideRef = (
  policyOverrides: VerifierRequestPolicyOverride,
): UniversityProofServerRequestPolicyOverride =>
  proofServerPolicyPayload<UniversityProofServerRequestPolicyOverride>(
    policyOverrides,
  );

export class ProofServerContractUniversityProofExecutionBackend implements UniversityProofExecutionBackend {
  readonly #adapter: UniversityProofServerAdapter;
  readonly #delegate: UniversityProofExecutionBackend;
  readonly #metrics: UniversityProofExecutionBackendMetric[] = [];
  #nextOperationOrdinal = 1;

  constructor(
    options: ProofServerContractUniversityProofExecutionBackendOptions = {},
  ) {
    this.#adapter =
      options.adapter ?? new RecordingUniversityProofServerAdapter();
    this.#delegate =
      options.delegate ?? new SimulatorUniversityProofExecutionBackend();
  }

  descriptor(): UniversityProofExecutionBackendDescriptor {
    return {
      mode: "proof-server-contract",
      description:
        "Proof-server contract backend that records deterministic remote-call DTOs while delegating current semantics to the simulator.",
      usesRealDidBindings: this.#delegate.descriptor().usesRealDidBindings,
      usesRealProofInfrastructure:
        this.#delegate.descriptor().usesRealProofInfrastructure,
      usesRemoteProofServerContract: true,
    };
  }

  snapshotMetrics(): readonly UniversityProofExecutionBackendMetric[] {
    // Delegate metrics are inner timings. The contract exchange metric is the
    // end-to-end wrapper duration, including adapter recording overhead.
    return [
      ...this.#delegate.snapshotMetrics(),
      ...this.#metrics.map((metric) => ({
        ...metric,
        tags: metric.tags ? { ...metric.tags } : undefined,
      })),
    ];
  }

  resetMetrics(): void {
    // A metrics reset starts a fresh recorded proof-server session for one test
    // or benchmark run, so exchange history and operation IDs reset together.
    this.#delegate.resetMetrics();
    this.#metrics.length = 0;
    this.#nextOperationOrdinal = 1;
    if (isExchangeRecorder(this.#adapter)) {
      this.#adapter.resetExchanges();
    }
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
    return this.recorded(
      {
        operationKind: "issueDiplomaCredential",
        issuer: partyRef(options.issuerProfile, options.issuerRuntime),
        holder: partyRef(options.holderProfile, options.holderRuntime),
        studentId: options.student.studentId,
        diplomaId: options.student.diplomaClaimValues.diplomaId,
        issuanceChallengeHashHex: bytesToHex(options.issuanceChallengeHash),
        issuedAt: options.issuedAt.toString(),
        credentialProofCreatedAt: options.credentialProofCreatedAt.toString(),
        presentationProofCreatedAt:
          options.presentationProofCreatedAt.toString(),
      },
      () => this.#delegate.issueDiplomaCredential(options),
      (storedCredential) => ({
        operationKind: "issueDiplomaCredential",
        credential: credentialRef(options.student.studentId, storedCredential),
        credentialProof: proofRef({
          ...storedCredential.credentialProof,
        }),
      }),
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
    return this.recorded(
      {
        operationKind: "buildPresentationSubmission",
        presentationKind: options.kind,
        issuer: partyRef(options.issuerProfile, options.issuerRuntime),
        holder: partyRef(options.holderProfile, options.holderRuntime),
        studentId: options.student.studentId,
        credential: credentialRef(
          options.student.studentId,
          options.storedCredential,
        ),
        request: requestSummary(options.request),
        tampering: options.tampering,
      },
      () => this.#delegate.buildPresentationSubmission(options),
      (submission) => ({
        operationKind: "buildPresentationSubmission",
        credential: credentialRefFromSubmission(submission),
        presentationProof: proofRef(submission.presentationProof),
      }),
    );
  }

  buildJobApplicationRequest(options: {
    readonly issuerVerificationMethodRef: StoredIssuedCredential["credential"]["issuerVerificationMethodRef"];
    readonly verifierChallengeHash: Uint8Array;
    readonly requestPolicy: VerifierRequestPolicy;
    readonly requestPolicyOverrides?: VerifierRequestPolicyOverride;
  }): UniversityPresentationRequestBody["request"] {
    return this.recorded(
      {
        operationKind: "buildJobApplicationRequest",
        issuerVerificationMethodRef: methodRef(
          options.issuerVerificationMethodRef,
        ),
        verifierChallengeHashHex: bytesToHex(options.verifierChallengeHash),
        requestPolicy: requestPolicyRef(options.requestPolicy),
        requestPolicyOverrides:
          options.requestPolicyOverrides === undefined
            ? undefined
            : requestPolicyOverrideRef(options.requestPolicyOverrides),
      },
      () => this.#delegate.buildJobApplicationRequest(options),
      (request) => ({
        operationKind: "buildJobApplicationRequest",
        request: requestSummary(request),
      }),
    );
  }

  buildMallDiscountRequest(options: {
    readonly issuerVerificationMethodRef: StoredIssuedCredential["credential"]["issuerVerificationMethodRef"];
    readonly verifierChallengeHash: Uint8Array;
    readonly minimumFinalGrade: bigint;
  }): UniversityPresentationRequestBody["request"] {
    return this.recorded(
      {
        operationKind: "buildMallDiscountRequest",
        issuerVerificationMethodRef: methodRef(
          options.issuerVerificationMethodRef,
        ),
        verifierChallengeHashHex: bytesToHex(options.verifierChallengeHash),
        minimumFinalGrade: options.minimumFinalGrade.toString(),
      },
      () => this.#delegate.buildMallDiscountRequest(options),
      (request) => ({
        operationKind: "buildMallDiscountRequest",
        request: requestSummary(request),
      }),
    );
  }

  verifyJobApplication(options: {
    readonly submission: UniversityPresentationSubmissionBody;
  }): void {
    this.recordedVoid(
      {
        operationKind: "verifyJobApplication",
        ...verificationRequest(options.submission),
      },
      () => this.#delegate.verifyJobApplication(options),
      {
        operationKind: "verifyJobApplication",
        accepted: true,
      },
    );
  }

  verifyMallDiscount(options: {
    readonly submission: UniversityPresentationSubmissionBody;
  }): void {
    this.recordedVoid(
      {
        operationKind: "verifyMallDiscount",
        ...verificationRequest(options.submission),
      },
      () => this.#delegate.verifyMallDiscount(options),
      {
        operationKind: "verifyMallDiscount",
        accepted: true,
      },
    );
  }

  private recorded<T>(
    request: UniversityProofServerRequest,
    fn: () => T,
    response: (value: T) => UniversityProofServerResponse,
  ): T {
    const startedAt = performance.now();
    const operationId = this.nextOperationId();
    try {
      const value = fn();
      this.emitExchange(
        operationId,
        request,
        {
          status: "succeeded",
          response: response(value),
        },
        startedAt,
      );
      return value;
    } catch (error) {
      this.emitExchange(
        operationId,
        request,
        {
          status: "failed",
          errorMessage: errorMessage(error),
        },
        startedAt,
      );
      throw error;
    }
  }

  private recordedVoid(
    request: UniversityProofServerRequest,
    fn: () => void,
    response: UniversityProofServerResponse,
  ): void {
    this.recorded(
      request,
      () => {
        fn();
        return undefined;
      },
      () => response,
    );
  }

  private nextOperationId(): string {
    // Six digits keep BDD and stress-report operation IDs lexicographically
    // sortable even when future verifier phases add more proof-server calls.
    const operationId = `university-proof-server-call-${String(
      this.#nextOperationOrdinal,
    ).padStart(6, "0")}`;
    this.#nextOperationOrdinal += 1;
    return operationId;
  }

  private emitExchange(
    operationId: string,
    request: UniversityProofServerRequest,
    result: UniversityProofServerExchangeResult,
    startedAt: number,
  ): void {
    const durationMs = performance.now() - startedAt;
    this.#adapter.recordExchange({
      operationId,
      request,
      result,
      durationMs,
    });
    this.#metrics.push({
      name: "proof_server_contract_exchange_ms",
      durationMs,
      tags: {
        backendMode: this.descriptor().mode,
        operationKind: request.operationKind,
        status: result.status,
      },
    });
  }
}

const verificationRequest = (
  submission: UniversityPresentationSubmissionBody,
): Omit<
  Extract<
    UniversityProofServerRequest,
    { readonly operationKind: "verifyJobApplication" | "verifyMallDiscount" }
  >,
  "operationKind"
> => ({
  studentId: submission.studentId,
  credential: credentialRefFromSubmission(submission),
  request: requestSummary(submission.request),
  credentialProof: proofRef(submission.credentialProof),
  presentationProof: proofRef(submission.presentationProof),
});
