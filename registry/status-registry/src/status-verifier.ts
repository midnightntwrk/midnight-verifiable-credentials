import {
  pureCircuits as credentialCircuits,
  type RegistryBoundStatusBinding,
  StatusType,
} from "@midnight-ntwrk/midnight-did-credentials";

import {
  type AuthorityAttestedStatusProofProtocol,
  pureCircuits,
  type RevocationRegistryState,
  type RevokedSetStatusRequest,
  type VerifierStatusPolicy,
} from "./managed/revocation-registry/contract/index.js";
import {
  assertObservedRevocationRegistryVersionAtLeast,
  buildFreshRevokedSetNonMembershipInputs,
  type BuildFreshRevokedSetNonMembershipInputsOptions,
  buildLiveStatusWitnessFromContractState,
  type BuiltFreshRevokedSetNonMembershipInputs,
  readCurrentRevocationRegistryStateFromContractState,
  type RevocationRegistryContractState,
} from "./registry-state-observation.js";

export const statusVerificationErrorCodes = {
  revoked: "revoked",
  staleRegistryState: "staleRegistryState",
  unknownRegistry: "unknownRegistry",
  unsupportedStatusProofMode: "unsupportedStatusProofMode",
  statusBindingMismatch: "statusBindingMismatch",
  statusRequestMismatch: "statusRequestMismatch",
  authorityMismatch: "authorityMismatch",
  attestationExpired: "attestationExpired",
  attestationTooOld: "attestationTooOld",
  futureDatedAttestation: "futureDatedAttestation",
  unclassifiedFailure: "unclassifiedFailure",
} as const;

export type StatusVerificationErrorCode =
  (typeof statusVerificationErrorCodes)[keyof typeof statusVerificationErrorCodes];

export type StatusVerificationMode =
  | "revokedSetObservedState"
  | "liveContractState"
  | "authorityAttested";

export class StatusVerificationError extends Error {
  readonly code: StatusVerificationErrorCode;
  readonly mode: StatusVerificationMode;
  constructor({
    code,
    mode,
    message,
    cause,
  }: {
    readonly code: StatusVerificationErrorCode;
    readonly mode: StatusVerificationMode;
    readonly message: string;
    readonly cause: unknown;
  }) {
    super(message, { cause });
    this.name = "StatusVerificationError";
    this.code = code;
    this.mode = mode;
  }
}

export type StatusVerificationSuccess<TDetails> = {
  readonly ok: true;
  readonly mode: StatusVerificationMode;
  readonly details: TDetails;
};

export type StatusVerificationFailure = {
  readonly ok: false;
  readonly mode: StatusVerificationMode;
  readonly error: StatusVerificationError;
};

export type StatusVerificationResult<TDetails> =
  | StatusVerificationSuccess<TDetails>
  | StatusVerificationFailure;

export type VerifierRegistryAcceptancePolicy = {
  readonly acceptedRegistryIds?: readonly Uint8Array[];
  readonly minimumRegistryVersion?: bigint;
};

export type AssertObservedRevokedSetStatusOptions =
  BuildFreshRevokedSetNonMembershipInputsOptions & {
    readonly verifierStatusPolicy: VerifierStatusPolicy;
    readonly registryAcceptancePolicy?: VerifierRegistryAcceptancePolicy;
  };

export type VerifyObservedRevokedSetStatusResult =
  StatusVerificationResult<BuiltFreshRevokedSetNonMembershipInputs>;

export type AssertLiveContractStateStatusOptions = {
  readonly credentialClaimRoot: Uint8Array;
  readonly registryRef: RegistryBoundStatusBinding["registryRef"];
  readonly issuerStatusSalt: Uint8Array;
  readonly statusHandleOpening: Uint8Array;
  readonly verifierStatusPolicy: VerifierStatusPolicy;
  readonly state: RevocationRegistryContractState;
  readonly registryAcceptancePolicy?: VerifierRegistryAcceptancePolicy;
};

export type VerifyLiveContractStateStatusResult = StatusVerificationResult<{
  readonly witness: ReturnType<typeof buildLiveStatusWitnessFromContractState>;
  readonly registryState: ReturnType<
    typeof readCurrentRevocationRegistryStateFromContractState
  >;
}>;

export type AssertAuthorityAttestedStatusOptions = {
  readonly statusBinding: RegistryBoundStatusBinding;
  readonly verifierStatusPolicy: VerifierStatusPolicy;
  readonly request: RevokedSetStatusRequest;
  readonly protocol: AuthorityAttestedStatusProofProtocol;
  readonly currentTime: bigint;
  readonly registryAcceptancePolicy?: VerifierRegistryAcceptancePolicy;
};

export type VerifyAuthorityAttestedStatusResult =
  StatusVerificationResult<AuthorityAttestedStatusProofProtocol>;

const equalBytes = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const toHex = (value: Uint8Array): string =>
  Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");

const assertRegistryAccepted = ({
  registryId,
  acceptancePolicy,
}: {
  readonly registryId: Uint8Array;
  readonly acceptancePolicy?: VerifierRegistryAcceptancePolicy;
}): void => {
  if (acceptancePolicy?.acceptedRegistryIds === undefined) {
    return;
  }
  if (acceptancePolicy.acceptedRegistryIds.length === 0) {
    throw new Error(
      "Verifier registry acceptance policy does not accept any registries",
    );
  }
  const accepted = acceptancePolicy.acceptedRegistryIds.some((candidate) =>
    equalBytes(candidate, registryId),
  );
  if (!accepted) {
    throw new Error(
      `Registry ${toHex(registryId)} is not accepted by the verifier registry policy`,
    );
  }
};

const assertRegistryVersionAccepted = ({
  registryState,
  acceptancePolicy,
}: {
  readonly registryState: RevocationRegistryState;
  readonly acceptancePolicy?: VerifierRegistryAcceptancePolicy;
}): void => {
  if (acceptancePolicy?.minimumRegistryVersion === undefined) {
    return;
  }
  assertObservedRevocationRegistryVersionAtLeast({
    observedState: {
      registryState,
      observedAt: 0n,
    },
    minimumRegistryVersion: acceptancePolicy.minimumRegistryVersion,
  });
};

const assertRegistryBoundRevocationStatusBinding = (
  statusBinding: RegistryBoundStatusBinding,
): void => {
  credentialCircuits.assertValidRegistryBoundStatusBinding(statusBinding);
  if (statusBinding.statusType !== StatusType.revocationRegistry) {
    throw new Error(
      "Registry-bound status binding does not use the revocation registry status type",
    );
  }
};

const assertLiveRegistryStateMatchesBinding = ({
  registryState,
  registryRef,
}: {
  readonly registryState: RevocationRegistryState;
  readonly registryRef: RegistryBoundStatusBinding["registryRef"];
}): void => {
  if (!equalBytes(registryState.registryId, registryRef.registryId)) {
    throw new Error(
      "Live revocation registry state does not match the status binding registry",
    );
  }
};

const classifyStatusVerificationError = (
  mode: StatusVerificationMode,
  error: unknown,
): StatusVerificationError => {
  const message = error instanceof Error ? error.message : String(error);

  const patterns: Array<[StatusVerificationErrorCode, RegExp]> = [
    [
      statusVerificationErrorCodes.unknownRegistry,
      /is not accepted by the verifier registry policy|does not accept any registries/i,
    ],
    [
      statusVerificationErrorCodes.revoked,
      /already present in the (live )?revocation registry state|already present in the revoked set snapshot/i,
    ],
    [
      statusVerificationErrorCodes.staleRegistryState,
      // The current taxonomy has no dedicated future-dated snapshot code yet,
      // so verifier-side snapshot-time failures stay under staleRegistryState.
      /snapshot exceeds the verifier max-age policy|snapshot version is older than the required minimum|snapshot time cannot be in the future/i,
    ],
    [
      statusVerificationErrorCodes.unsupportedStatusProofMode,
      /does not accept revoked-set non-membership|does not accept authority-attested status|must require status for |request a real status capability/i,
    ],
    [
      statusVerificationErrorCodes.authorityMismatch,
      /does not match the status authority/i,
    ],
    [statusVerificationErrorCodes.attestationExpired, /has expired/i],
    [
      statusVerificationErrorCodes.attestationTooOld,
      /status proof exceeds the verifier max-age policy/i,
    ],
    [
      statusVerificationErrorCodes.futureDatedAttestation,
      /proof creation time cannot be in the future|proof timestamp cannot be in the future/i,
    ],
    [
      statusVerificationErrorCodes.statusRequestMismatch,
      /registry id does not match the verifier request|revoked root does not match the verifier request|registry version does not match the verifier request|request challenge must match the verification request challenge|does not match the request/i,
    ],
    [
      statusVerificationErrorCodes.statusBindingMismatch,
      /status handle commitment|binding handle commitment|registry-bound status binding|does not use the revocation registry status type|supplied status binding|does not match the binding|binding does not match|status binding registry/i,
    ],
  ];

  const code =
    patterns.find(([, pattern]) => pattern.test(message))?.[0] ??
    statusVerificationErrorCodes.unclassifiedFailure;

  return new StatusVerificationError({
    code,
    mode,
    message,
    cause: error,
  });
};

export const assertObservedRevokedSetStatusVerifies = ({
  registryAcceptancePolicy,
  verifierStatusPolicy,
  observedState,
  ...options
}: AssertObservedRevokedSetStatusOptions): BuiltFreshRevokedSetNonMembershipInputs => {
  assertRegistryAccepted({
    registryId: observedState.registryState.registryId,
    acceptancePolicy: registryAcceptancePolicy,
  });
  assertRegistryVersionAccepted({
    registryState: observedState.registryState,
    acceptancePolicy: registryAcceptancePolicy,
  });
  const built = buildFreshRevokedSetNonMembershipInputs({
    ...options,
    observedState,
    verifierStatusPolicy,
  });
  pureCircuits.assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipStatusProofProtocol(
    verifierStatusPolicy,
    built.statusBinding,
    built.protocol,
  );
  return built;
};

export const verifyObservedRevokedSetStatus = (
  options: AssertObservedRevokedSetStatusOptions,
): VerifyObservedRevokedSetStatusResult => {
  try {
    return {
      ok: true,
      mode: "revokedSetObservedState",
      details: assertObservedRevokedSetStatusVerifies(options),
    };
  } catch (error) {
    return {
      ok: false,
      mode: "revokedSetObservedState",
      error: classifyStatusVerificationError("revokedSetObservedState", error),
    };
  }
};

export const assertLiveContractStateStatusVerifies = ({
  state,
  registryAcceptancePolicy,
  verifierStatusPolicy,
  ...options
}: AssertLiveContractStateStatusOptions): {
  readonly witness: ReturnType<typeof buildLiveStatusWitnessFromContractState>;
  readonly registryState: ReturnType<
    typeof readCurrentRevocationRegistryStateFromContractState
  >;
} => {
  const registryState = readCurrentRevocationRegistryStateFromContractState({
    state,
  });
  assertRegistryAccepted({
    registryId: registryState.registryId,
    acceptancePolicy: registryAcceptancePolicy,
  });
  assertRegistryVersionAccepted({
    registryState,
    acceptancePolicy: registryAcceptancePolicy,
  });
  assertLiveRegistryStateMatchesBinding({
    registryState,
    registryRef: options.registryRef,
  });
  const witness = buildLiveStatusWitnessFromContractState({
    state,
    ...options,
    verifierStatusPolicy,
  });
  pureCircuits.assertVerifierStatusPolicyAcceptsLiveStatusBinding(
    verifierStatusPolicy,
    witness.statusBinding,
    witness.witnessInput,
  );
  return { witness, registryState };
};

export const verifyLiveContractStateStatus = (
  options: AssertLiveContractStateStatusOptions,
): VerifyLiveContractStateStatusResult => {
  try {
    return {
      ok: true,
      mode: "liveContractState",
      details: assertLiveContractStateStatusVerifies(options),
    };
  } catch (error) {
    return {
      ok: false,
      mode: "liveContractState",
      error: classifyStatusVerificationError("liveContractState", error),
    };
  }
};

export const assertAuthorityAttestedStatusVerifies = ({
  statusBinding,
  verifierStatusPolicy,
  request,
  protocol,
  currentTime,
  registryAcceptancePolicy,
}: AssertAuthorityAttestedStatusOptions): AuthorityAttestedStatusProofProtocol => {
  assertRegistryBoundRevocationStatusBinding(statusBinding);
  assertRegistryAccepted({
    registryId: request.registryState.registryId,
    acceptancePolicy: registryAcceptancePolicy,
  });
  assertRegistryVersionAccepted({
    registryState: request.registryState,
    acceptancePolicy: registryAcceptancePolicy,
  });
  pureCircuits.assertValidAuthorityAttestedStatusProofProtocol(protocol);
  pureCircuits.assertAuthorityAttestedStatusProofMatchesRequest(
    request,
    protocol.attestation,
    currentTime,
  );
  pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusProofProtocol(
    verifierStatusPolicy,
    statusBinding,
    protocol,
    currentTime,
  );
  return protocol;
};

export const verifyAuthorityAttestedStatus = (
  options: AssertAuthorityAttestedStatusOptions,
): VerifyAuthorityAttestedStatusResult => {
  try {
    return {
      ok: true,
      mode: "authorityAttested",
      details: assertAuthorityAttestedStatusVerifies(options),
    };
  } catch (error) {
    return {
      ok: false,
      mode: "authorityAttested",
      error: classifyStatusVerificationError("authorityAttested", error),
    };
  }
};
