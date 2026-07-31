import type { CredentialCapabilityDescriptor } from "@midnight-ntwrk/credential-model";

export const statusModes = {
  none: "none",
  sameContractLive: "same-contract-live",
  externalNonMembership: "external-nonmembership",
  authorityAttested: "authority-attested",
} as const;

export type StatusMode = (typeof statusModes)[keyof typeof statusModes];
export type EnabledStatusMode = Exclude<StatusMode, "none">;

/** An opaque credential-bound status location or domain. */
export type StatusReference = string | Uint8Array;
/** An opaque credential-bound status handle or commitment. */
export type StatusHandle = string | Uint8Array;

export type NoStatusBinding = {
  readonly mode: "none";
};

export type CredentialStatusBinding = {
  readonly mode: EnabledStatusMode;
  readonly statusType: string;
  readonly statusReference: StatusReference;
  readonly statusHandle: StatusHandle;
};

export type StatusBinding = NoStatusBinding | CredentialStatusBinding;

export type StatusCapabilityDescriptor = Omit<
  CredentialCapabilityDescriptor,
  "kind"
> & { readonly kind: "status" };

export const defineStatusCapability = (
  descriptor: StatusCapabilityDescriptor,
): StatusCapabilityDescriptor => ({ ...descriptor });
