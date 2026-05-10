import { Buffer } from "node:buffer";

import {
  type RegistryBoundStatusBinding,
  type StatusRegistryRef,
} from "@midnight-ntwrk/midnight-did-credentials";

import {
  type LiveStatusWitnessInput,
  pureCircuits,
  type RevocationRegistryState,
  type RevokedSetNonMembershipStatusProofProtocol,
  type RevokedSetNonMembershipWitnessInput,
  type RevokedSetStatusRequest,
  type VerifierStatusPolicy,
} from "./managed/revocation-registry/contract/index.js";
import { buildRegistryBoundStatusBinding } from "./status-binding.js";
import {
  StatusHelperError,
  statusVerificationErrorCodes,
} from "./status-errors.js";

export type RevokedSetRegistrySnapshot = {
  readonly registryState: RevocationRegistryState;
  readonly revokedStatusHandles: readonly Uint8Array[];
};

export type BuildRevokedSetStatusWitnessOptions = {
  readonly credentialClaimRoot: Uint8Array;
  readonly registryRef: StatusRegistryRef;
  readonly issuerStatusSalt: Uint8Array;
  readonly statusHandleOpening: Uint8Array;
  readonly registryState: RevocationRegistryState;
  readonly verifierStatusPolicy?: VerifierStatusPolicy;
  readonly revokedStatusHandles?: readonly Uint8Array[];
};

export type BuiltRevokedSetStatusWitness = {
  readonly statusHandle: Uint8Array;
  readonly statusBinding: RegistryBoundStatusBinding;
  readonly witnessInput: RevokedSetNonMembershipWitnessInput;
};

export type BuildLiveStatusWitnessOptions = Omit<
  BuildRevokedSetStatusWitnessOptions,
  "registryState"
>;

export type BuiltLiveStatusWitness = {
  readonly statusHandle: Uint8Array;
  readonly statusBinding: RegistryBoundStatusBinding;
  readonly witnessInput: LiveStatusWitnessInput;
};

export type BuildRevokedSetNonMembershipInputsOptions =
  BuildRevokedSetStatusWitnessOptions & {
    readonly verifierChallengeHash: Uint8Array;
  };

export type BuiltRevokedSetNonMembershipInputs =
  BuiltRevokedSetStatusWitness & {
    readonly request: RevokedSetStatusRequest;
    readonly protocol: RevokedSetNonMembershipStatusProofProtocol;
  };

// Freshness of `registryState.revokedRoot` is intentionally external to this
// helper. The verifier or orchestrating application must supply an accepted
// current-enough root before calling into the proof layer.

const toHex = (value: Uint8Array): string => Buffer.from(value).toString("hex");

const equalBytes = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

export const deriveRevokedSetStatusHandle = ({
  credentialClaimRoot,
  registryId,
  issuerStatusSalt,
}: {
  readonly credentialClaimRoot: Uint8Array;
  readonly registryId: Uint8Array;
  readonly issuerStatusSalt: Uint8Array;
}): Uint8Array =>
  pureCircuits.revokedSetStatusHandle(
    credentialClaimRoot,
    registryId,
    issuerStatusSalt,
  );

export const buildRevokedSetStatusBinding = ({
  registryRef,
  statusHandle,
  statusHandleOpening,
}: {
  readonly registryRef: StatusRegistryRef;
  readonly statusHandle: Uint8Array;
  readonly statusHandleOpening: Uint8Array;
}): RegistryBoundStatusBinding =>
  buildRegistryBoundStatusBinding({
    registryRef,
    statusHandleCommitment: pureCircuits.revokedSetStatusHandleCommitment(
      statusHandle,
      statusHandleOpening,
    ),
  });

export const buildRevokedSetWitnessInput = ({
  registryState,
  statusHandle,
  statusHandleOpening,
}: {
  readonly registryState: RevocationRegistryState;
  readonly statusHandle: Uint8Array;
  readonly statusHandleOpening: Uint8Array;
}): RevokedSetNonMembershipWitnessInput => ({
  registryState,
  statusHandle,
  statusHandleOpening,
});

export const buildLiveStatusWitnessInput = ({
  statusHandle,
  statusHandleOpening,
}: {
  readonly statusHandle: Uint8Array;
  readonly statusHandleOpening: Uint8Array;
}): LiveStatusWitnessInput => ({
  statusHandle,
  statusHandleOpening,
});

export const buildRevokedSetNonMembershipStatusProofProtocol = ({
  request,
  witnessInput,
}: {
  readonly request: RevokedSetStatusRequest;
  readonly witnessInput: RevokedSetNonMembershipWitnessInput;
}): RevokedSetNonMembershipStatusProofProtocol => {
  const protocol = {
    request,
    witnessInput,
  };
  pureCircuits.assertValidRevokedSetNonMembershipStatusProofProtocol(protocol);
  return protocol;
};

export const buildRevokedSetStatusRequest = ({
  registryState,
  verifierChallengeHash,
}: {
  readonly registryState: RevocationRegistryState;
  readonly verifierChallengeHash: Uint8Array;
}): RevokedSetStatusRequest => {
  const request = {
    registryState,
    verifierChallengeHash,
  };
  pureCircuits.assertValidRevokedSetStatusRequest(request);
  return request;
};

export const assertStatusHandleNotRevoked = (
  snapshot: RevokedSetRegistrySnapshot,
  statusHandle: Uint8Array,
): void => {
  const match = snapshot.revokedStatusHandles.find((candidate) =>
    equalBytes(candidate, statusHandle),
  );
  if (match) {
    throw new StatusHelperError({
      code: statusVerificationErrorCodes.revoked,
      message: `Status handle ${toHex(statusHandle)} is already present in the revoked set snapshot`,
    });
  }
};

export const buildRevokedSetStatusWitness = ({
  credentialClaimRoot,
  registryRef,
  issuerStatusSalt,
  statusHandleOpening,
  registryState,
  verifierStatusPolicy,
  revokedStatusHandles,
}: BuildRevokedSetStatusWitnessOptions): BuiltRevokedSetStatusWitness => {
  const statusHandle = deriveRevokedSetStatusHandle({
    credentialClaimRoot,
    registryId: registryRef.registryId,
    issuerStatusSalt,
  });
  const statusBinding = buildRevokedSetStatusBinding({
    registryRef,
    statusHandle,
    statusHandleOpening,
  });
  const witnessInput = buildRevokedSetWitnessInput({
    registryState,
    statusHandle,
    statusHandleOpening,
  });

  pureCircuits.assertRevokedSetNonMembershipWitnessMatchesBinding(
    statusBinding,
    witnessInput,
  );

  if (verifierStatusPolicy) {
    pureCircuits.assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipBinding(
      verifierStatusPolicy,
      statusBinding,
      witnessInput,
    );
  }

  if (revokedStatusHandles) {
    assertStatusHandleNotRevoked(
      {
        registryState,
        revokedStatusHandles,
      },
      statusHandle,
    );
  }

  return {
    statusHandle,
    statusBinding,
    witnessInput,
  };
};

export const buildLiveStatusWitness = ({
  credentialClaimRoot,
  registryRef,
  issuerStatusSalt,
  statusHandleOpening,
  verifierStatusPolicy,
  revokedStatusHandles,
}: BuildLiveStatusWitnessOptions): BuiltLiveStatusWitness => {
  const statusHandle = deriveRevokedSetStatusHandle({
    credentialClaimRoot,
    registryId: registryRef.registryId,
    issuerStatusSalt,
  });
  const statusBinding = buildRevokedSetStatusBinding({
    registryRef,
    statusHandle,
    statusHandleOpening,
  });
  const witnessInput = buildLiveStatusWitnessInput({
    statusHandle,
    statusHandleOpening,
  });

  pureCircuits.assertLiveStatusWitnessMatchesBinding(
    statusBinding,
    witnessInput,
  );

  if (verifierStatusPolicy) {
    pureCircuits.assertVerifierStatusPolicyAcceptsLiveStatusBinding(
      verifierStatusPolicy,
      statusBinding,
      witnessInput,
    );
  }

  if (revokedStatusHandles) {
    assertStatusHandleNotRevoked(
      {
        registryState: {
          registryId: registryRef.registryId,
          revokedRoot: new Uint8Array(32).fill(1),
          registryVersion: 0n,
        },
        revokedStatusHandles,
      },
      statusHandle,
    );
  }

  return {
    statusHandle,
    statusBinding,
    witnessInput,
  };
};

export const buildRevokedSetNonMembershipInputs = ({
  verifierChallengeHash,
  ...witnessOptions
}: BuildRevokedSetNonMembershipInputsOptions): BuiltRevokedSetNonMembershipInputs => {
  const builtWitness = buildRevokedSetStatusWitness(witnessOptions);
  const request = buildRevokedSetStatusRequest({
    registryState: witnessOptions.registryState,
    verifierChallengeHash,
  });
  const protocol = buildRevokedSetNonMembershipStatusProofProtocol({
    request,
    witnessInput: builtWitness.witnessInput,
  });

  pureCircuits.assertRegistryBoundStatusBindingMatchesRevokedSetNonMembershipStatusProofProtocol(
    builtWitness.statusBinding,
    protocol,
  );

  if (witnessOptions.verifierStatusPolicy) {
    pureCircuits.assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipStatusProofProtocol(
      witnessOptions.verifierStatusPolicy,
      builtWitness.statusBinding,
      protocol,
    );
  }

  return {
    ...builtWitness,
    request,
    protocol,
  };
};
