import {
  pureCircuits,
  type RevocationRegistryState,
} from "./managed/revocation-registry/contract/index.js";
import {
  buildFreshRevokedSetNonMembershipInputs,
  type BuildFreshRevokedSetNonMembershipInputsOptions,
  buildLiveStatusWitnessFromContractState,
  type BuildLiveStatusWitnessFromContractStateOptions,
  buildObservedRevocationRegistryState,
  type BuiltFreshRevokedSetNonMembershipInputs,
  readCurrentRevocationRegistryStateFromContractState,
} from "./registry-state-observation.js";
import {
  StatusHelperError,
  statusVerificationErrorCodes,
} from "./status-errors.js";

export type CanonicalNonMembershipMode =
  | "revokedSetObservedState"
  | "liveContractState";

export type CanonicalObservedNonMembershipBundle =
  BuiltFreshRevokedSetNonMembershipInputs & {
    readonly mode: "revokedSetObservedState";
  };

export type CanonicalLiveNonMembershipBundle = {
  readonly mode: "liveContractState";
  readonly registryState: RevocationRegistryState;
  readonly witness: ReturnType<typeof buildLiveStatusWitnessFromContractState>;
};

export type CanonicalNonMembershipBundle =
  | CanonicalObservedNonMembershipBundle
  | CanonicalLiveNonMembershipBundle;

export type BuildCanonicalObservedNonMembershipBundleOptions =
  BuildFreshRevokedSetNonMembershipInputsOptions;

export type BuildCanonicalLiveNonMembershipBundleFromContractStateOptions =
  BuildLiveStatusWitnessFromContractStateOptions;

const equalBytes = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const equalRegistryState = (
  left: RevocationRegistryState,
  right: RevocationRegistryState,
): boolean =>
  equalBytes(left.registryId, right.registryId) &&
  equalBytes(left.revokedRoot, right.revokedRoot) &&
  left.registryVersion === right.registryVersion;

const assertLiveRegistryStateMatchesBinding = ({
  registryState,
  witness,
}: {
  readonly registryState: RevocationRegistryState;
  readonly witness: ReturnType<typeof buildLiveStatusWitnessFromContractState>;
}): void => {
  if (
    !equalBytes(
      registryState.registryId,
      witness.statusBinding.registryRef.registryId,
    )
  ) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusBindingMismatch,
      message:
        "Live revocation registry state does not match the status binding registry",
    });
  }
};

const assertObservedBundleConsistency = (
  bundle: CanonicalObservedNonMembershipBundle,
): void => {
  buildObservedRevocationRegistryState(bundle.observedState);

  if (
    !equalRegistryState(
      bundle.request.registryState,
      bundle.protocol.request.registryState,
    )
  ) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusRequestMismatch,
      message:
        "Canonical observed non-membership bundle request does not match the protocol request registry state",
    });
  }
  if (
    !equalBytes(
      bundle.request.verifierChallengeHash,
      bundle.protocol.request.verifierChallengeHash,
    )
  ) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusRequestMismatch,
      message:
        "Canonical observed non-membership bundle request challenge does not match the protocol request challenge",
    });
  }
  if (
    !equalRegistryState(
      bundle.observedState.registryState,
      bundle.request.registryState,
    )
  ) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusRequestMismatch,
      message:
        "Canonical observed non-membership bundle observed state does not match the request registry state",
    });
  }
  if (
    !equalRegistryState(
      bundle.witnessInput.registryState,
      bundle.protocol.witnessInput.registryState,
    )
  ) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusRequestMismatch,
      message:
        "Canonical observed non-membership bundle witness registry state does not match the protocol witness registry state",
    });
  }
  if (!equalBytes(bundle.statusHandle, bundle.witnessInput.statusHandle)) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusBindingMismatch,
      message:
        "Canonical observed non-membership bundle status handle does not match the witness input status handle",
    });
  }
  if (
    !equalBytes(bundle.statusHandle, bundle.protocol.witnessInput.statusHandle)
  ) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusBindingMismatch,
      message:
        "Canonical observed non-membership bundle status handle does not match the protocol witness status handle",
    });
  }
  if (
    !equalBytes(
      bundle.witnessInput.statusHandleOpening,
      bundle.protocol.witnessInput.statusHandleOpening,
    )
  ) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusBindingMismatch,
      message:
        "Canonical observed non-membership bundle witness opening does not match the protocol witness opening",
    });
  }

  pureCircuits.assertValidRevokedSetNonMembershipStatusProofProtocol(
    bundle.protocol,
  );
  pureCircuits.assertRegistryBoundStatusBindingMatchesRevokedSetNonMembershipStatusProofProtocol(
    bundle.statusBinding,
    bundle.protocol,
  );
};

const assertLiveBundleConsistency = (
  bundle: CanonicalLiveNonMembershipBundle,
): void => {
  pureCircuits.assertValidRevocationRegistryState(bundle.registryState);
  if (
    !equalBytes(
      bundle.witness.statusHandle,
      bundle.witness.witnessInput.statusHandle,
    )
  ) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.statusBindingMismatch,
      message:
        "Canonical live non-membership bundle status handle does not match the witness input status handle",
    });
  }

  pureCircuits.assertLiveStatusWitnessMatchesBinding(
    bundle.witness.statusBinding,
    bundle.witness.witnessInput,
  );
  assertLiveRegistryStateMatchesBinding({
    registryState: bundle.registryState,
    witness: bundle.witness,
  });
};

export const assertCanonicalNonMembershipBundle = (
  bundle: CanonicalNonMembershipBundle,
): void => {
  if (bundle.mode === "revokedSetObservedState") {
    assertObservedBundleConsistency(bundle);
    return;
  }

  assertLiveBundleConsistency(bundle);
};

export const buildCanonicalObservedNonMembershipBundle = (
  options: BuildCanonicalObservedNonMembershipBundleOptions,
): CanonicalObservedNonMembershipBundle => {
  const bundle: CanonicalObservedNonMembershipBundle = {
    mode: "revokedSetObservedState",
    ...buildFreshRevokedSetNonMembershipInputs(options),
  };
  assertCanonicalNonMembershipBundle(bundle);
  return bundle;
};

export const buildCanonicalLiveNonMembershipBundleFromContractState = ({
  state,
  ...options
}: BuildCanonicalLiveNonMembershipBundleFromContractStateOptions): CanonicalLiveNonMembershipBundle => {
  const bundle: CanonicalLiveNonMembershipBundle = {
    mode: "liveContractState",
    registryState: readCurrentRevocationRegistryStateFromContractState({
      state,
    }),
    witness: buildLiveStatusWitnessFromContractState({
      state,
      ...options,
    }),
  };
  assertCanonicalNonMembershipBundle(bundle);
  return bundle;
};
