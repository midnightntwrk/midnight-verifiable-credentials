import {
  pureCircuits,
  type RevocationRegistryState,
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

export type BuildFreshRevokedSetNonMembershipInputsOptions = Omit<
  BuildRevokedSetNonMembershipInputsOptions,
  "registryState"
> & {
  readonly observedState: ObservedRevocationRegistryState;
  readonly currentTime: bigint;
  readonly snapshotFreshnessPolicy: RevocationRegistrySnapshotFreshnessPolicy;
};

export type BuiltFreshRevokedSetNonMembershipInputs =
  BuiltRevokedSetNonMembershipInputs & {
    readonly observedState: ObservedRevocationRegistryState;
  };

const assertNonNegative = (value: bigint, label: string): void => {
  if (value < 0n) {
    throw new Error(`${label} must be >= 0`);
  }
};

export const buildObservedRevocationRegistryState = ({
  registryState,
  observedAt,
}: ObservedRevocationRegistryState): ObservedRevocationRegistryState => {
  pureCircuits.assertValidRevocationRegistryState(registryState);
  assertNonNegative(observedAt, "Observed revocation registry time");
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
  assertNonNegative(currentTime, "Current time");
  assertNonNegative(policy.maxSnapshotAge, "Snapshot max age");

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
}: BuildFreshRevokedSetNonMembershipInputsOptions): BuiltFreshRevokedSetNonMembershipInputs => {
  assertObservedRevocationRegistryStateFreshEnough({
    observedState,
    currentTime,
    policy: snapshotFreshnessPolicy,
  });
  const built = buildRevokedSetNonMembershipInputs({
    ...witnessOptions,
    registryState: observedState.registryState,
    verifierChallengeHash,
  });

  return {
    ...built,
    observedState,
  };
};
