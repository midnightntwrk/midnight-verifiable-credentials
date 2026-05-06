import {
  pureCircuits,
  type RevocationRegistryState,
  type RevokedSetNonMembershipStatusProofProtocol,
  type RevokedSetStatusRequest,
} from "./managed/revocation-registry/contract/index.js";
import {
  buildRevokedSetNonMembershipInputs,
  type BuildRevokedSetNonMembershipInputsOptions,
  buildRevokedSetStatusRequest,
  type BuiltRevokedSetNonMembershipInputs,
} from "./witness-builder.js";

export type ObservedRevocationRegistryState = {
  readonly registryState: RevocationRegistryState;
  readonly observedAt: bigint;
};

export type RevocationRegistrySnapshotFreshnessPolicy = {
  readonly enforceSnapshotMaxAge: boolean;
  readonly maxSnapshotAge: bigint;
};

const assertNonNegativeUint64 = (value: bigint, label: string): void => {
  if (value < 0n) {
    throw new Error(`${label} must be >= 0`);
  }
};

export const buildObservedRevocationRegistryState = ({
  registryState,
  observedAt,
}: ObservedRevocationRegistryState): ObservedRevocationRegistryState => {
  pureCircuits.assertValidRevocationRegistryState(registryState);
  assertNonNegativeUint64(observedAt, "Observed revocation registry time");
  return {
    registryState,
    observedAt,
  };
};

export const assertObservedRevocationRegistryStateFreshEnough = ({
  observedState,
  currentTime,
  policy,
}: {
  readonly observedState: ObservedRevocationRegistryState;
  readonly currentTime: bigint;
  readonly policy: RevocationRegistrySnapshotFreshnessPolicy;
}): void => {
  buildObservedRevocationRegistryState(observedState);
  assertNonNegativeUint64(currentTime, "Current time");
  assertNonNegativeUint64(policy.maxSnapshotAge, "Snapshot max age");

  if (currentTime < observedState.observedAt) {
    throw new Error(
      "Observed revocation registry snapshot time cannot be in the future",
    );
  }

  if (policy.enforceSnapshotMaxAge) {
    const age = currentTime - observedState.observedAt;
    if (age > policy.maxSnapshotAge) {
      throw new Error(
        "Observed revocation registry snapshot exceeds the verifier max-age policy",
      );
    }
  }
};

export const buildRevokedSetStatusRequestFromObservedState = ({
  observedState,
  verifierChallengeHash,
  currentTime,
  snapshotFreshnessPolicy,
}: {
  readonly observedState: ObservedRevocationRegistryState;
  readonly verifierChallengeHash: Uint8Array;
  readonly currentTime: bigint;
  readonly snapshotFreshnessPolicy: RevocationRegistrySnapshotFreshnessPolicy;
}): RevokedSetStatusRequest => {
  assertObservedRevocationRegistryStateFreshEnough({
    observedState,
    currentTime,
    policy: snapshotFreshnessPolicy,
  });

  return buildRevokedSetStatusRequest({
    registryState: observedState.registryState,
    verifierChallengeHash,
  });
};

export const buildFreshRevokedSetNonMembershipInputs = ({
  observedState,
  verifierChallengeHash,
  currentTime,
  snapshotFreshnessPolicy,
  ...witnessOptions
}: Omit<BuildRevokedSetNonMembershipInputsOptions, "registryState"> & {
  readonly observedState: ObservedRevocationRegistryState;
  readonly currentTime: bigint;
  readonly snapshotFreshnessPolicy: RevocationRegistrySnapshotFreshnessPolicy;
}): BuiltRevokedSetNonMembershipInputs & {
  readonly observedState: ObservedRevocationRegistryState;
} => {
  const request = buildRevokedSetStatusRequestFromObservedState({
    observedState,
    verifierChallengeHash,
    currentTime,
    snapshotFreshnessPolicy,
  });
  const built = buildRevokedSetNonMembershipInputs({
    ...witnessOptions,
    registryState: observedState.registryState,
    verifierChallengeHash,
  });

  const protocol: RevokedSetNonMembershipStatusProofProtocol = {
    ...built.protocol,
    request,
  };
  pureCircuits.assertValidRevokedSetNonMembershipStatusProofProtocol(protocol);

  return {
    ...built,
    request,
    protocol,
    observedState,
  };
};
