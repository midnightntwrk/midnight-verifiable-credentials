import { Buffer } from "node:buffer";

import { convertFieldToBytes } from "@midnight-ntwrk/compact-runtime";

import {
  ledger,
  pureCircuits,
  type RevocationRegistryState,
  type RevokedSetStatusRequest,
} from "./managed/revocation-registry/contract/index.js";
import {
  StatusHelperError,
  statusVerificationErrorCodes,
} from "./status-errors.js";
import {
  buildLiveStatusWitness,
  type BuildLiveStatusWitnessOptions,
  buildRevokedSetNonMembershipInputs,
  type BuildRevokedSetNonMembershipInputsOptions,
  buildRevokedSetStatusRequest,
  type BuiltLiveStatusWitness,
  type BuiltRevokedSetNonMembershipInputs,
} from "./witness-builder.js";

export type ObservedRevocationRegistryState = {
  readonly registryState: RevocationRegistryState;
  readonly observedAt: bigint;
};

export type RevocationRegistryContractState = Parameters<typeof ledger>[0];

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

export type BuildFreshRevokedSetNonMembershipInputsFromContractStateOptions =
  Omit<
    BuildFreshRevokedSetNonMembershipInputsOptions,
    "observedState" | "revokedStatusHandles"
  > & {
    readonly state: RevocationRegistryContractState;
    readonly observedAt: bigint;
  };

export type BuildLiveStatusWitnessFromContractStateOptions = Omit<
  BuildLiveStatusWitnessOptions,
  "revokedStatusHandles"
> & {
  readonly state: RevocationRegistryContractState;
};

const assertNonNegative = (value: bigint, label: string): void => {
  if (value < 0n) {
    throw new Error(`${label} must be >= 0`);
  }
};

const toHex = (value: Uint8Array): string => Buffer.from(value).toString("hex");

const revokedRootBytes = (
  currentLedger: ReturnType<typeof ledger>,
): Uint8Array =>
  convertFieldToBytes(
    32,
    currentLedger.revokedStatusHandles.root().field,
    "revocation registry root",
  );

export const readCurrentRevocationRegistryStateFromContractState = ({
  state,
}: {
  readonly state: RevocationRegistryContractState;
}): RevocationRegistryState => {
  const currentLedger = ledger(state);
  const registryState = {
    registryId: currentLedger.registryId,
    revokedRoot: revokedRootBytes(currentLedger),
    registryVersion: currentLedger.version,
  };
  pureCircuits.assertValidRevocationRegistryState(registryState);
  return registryState;
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

export const buildObservedRevocationRegistryStateFromContractState = ({
  state,
  observedAt,
}: {
  readonly state: RevocationRegistryContractState;
  readonly observedAt: bigint;
}): ObservedRevocationRegistryState =>
  buildObservedRevocationRegistryState({
    registryState: readCurrentRevocationRegistryStateFromContractState({
      state,
    }),
    observedAt,
  });

export const assertStatusHandleNotRevokedInContractState = ({
  state,
  statusHandle,
}: {
  readonly state: RevocationRegistryContractState;
  readonly statusHandle: Uint8Array;
}): void => {
  const currentLedger = ledger(state);
  const match =
    currentLedger.revokedStatusHandles.findPathForLeaf(statusHandle);
  if (match) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.revoked,
      message: `Status handle ${toHex(statusHandle)} is already present in the live revocation registry state`,
    });
  }
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
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.staleRegistryState,
      message:
        "Observed revocation registry snapshot time cannot be in the future",
    });
  }

  if (policy.enforceSnapshotMaxAge) {
    const age = currentTime - observedState.observedAt;
    if (age > policy.maxSnapshotAge) {
      throw new StatusHelperError({
        code: statusVerificationErrorCodes.staleRegistryState,
        message:
          "Observed revocation registry snapshot exceeds the verifier max-age policy",
      });
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

export const assertObservedRevocationRegistryVersionAtLeast = ({
  observedState,
  minimumRegistryVersion,
}: {
  readonly observedState: ObservedRevocationRegistryState;
  readonly minimumRegistryVersion: bigint;
}): void => {
  buildObservedRevocationRegistryState(observedState);
  assertNonNegative(minimumRegistryVersion, "Minimum registry version");
  if (observedState.registryState.registryVersion < minimumRegistryVersion) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.staleRegistryState,
      message:
        "Observed revocation registry snapshot version is older than the required minimum",
    });
  }
};

export const assertRevocationRegistryVersionAtLeast = ({
  registryState,
  minimumRegistryVersion,
}: {
  readonly registryState: RevocationRegistryState;
  readonly minimumRegistryVersion: bigint;
}): void => {
  pureCircuits.assertValidRevocationRegistryState(registryState);
  assertNonNegative(minimumRegistryVersion, "Minimum registry version");
  if (registryState.registryVersion < minimumRegistryVersion) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.staleRegistryState,
      message:
        "Revocation registry state version is older than the required minimum",
    });
  }
};

export const buildFreshRevokedSetNonMembershipInputs = ({
  observedState,
  verifierChallengeHash,
  currentTime,
  snapshotFreshnessPolicy,
  ...witnessOptions
}: BuildFreshRevokedSetNonMembershipInputsOptions): BuiltFreshRevokedSetNonMembershipInputs => {
  buildObservedRevocationRegistryState(observedState);
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

export const buildFreshRevokedSetNonMembershipInputsFromContractState = ({
  state,
  observedAt,
  ...options
}: BuildFreshRevokedSetNonMembershipInputsFromContractStateOptions): BuiltFreshRevokedSetNonMembershipInputs => {
  // Both the observed snapshot and the revoked-handle check are derived from the
  // same live contract state value passed into this helper.
  const built = buildFreshRevokedSetNonMembershipInputs({
    ...options,
    observedState: buildObservedRevocationRegistryStateFromContractState({
      state,
      observedAt,
    }),
  });

  assertStatusHandleNotRevokedInContractState({
    state,
    statusHandle: built.statusHandle,
  });

  return built;
};

export const buildLiveStatusWitnessFromContractState = ({
  state,
  ...options
}: BuildLiveStatusWitnessFromContractStateOptions): BuiltLiveStatusWitness => {
  // The live contract-state path supersedes caller-supplied revoked handle
  // snapshots and rejects directly against the current registry state.
  const built = buildLiveStatusWitness(options);
  assertStatusHandleNotRevokedInContractState({
    state,
    statusHandle: built.statusHandle,
  });
  return built;
};
