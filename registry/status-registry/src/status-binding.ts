import {
  pureCircuits,
  type RegistryBoundStatusBinding,
  type StatusRegistryRef,
  StatusType,
} from "@midnight-ntwrk/midnight-did-credentials";

export const buildRegistryBoundStatusBinding = ({
  registryRef,
  statusHandleCommitment,
}: {
  readonly registryRef: StatusRegistryRef;
  readonly statusHandleCommitment: Uint8Array;
}): RegistryBoundStatusBinding => {
  const binding = {
    statusType: StatusType.revocationRegistry,
    registryRef,
    statusHandleCommitment,
  };
  pureCircuits.assertValidRegistryBoundStatusBinding(binding);
  return binding;
};
