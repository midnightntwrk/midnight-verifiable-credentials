import type {
  AuthorizationState,
  AuthorizedSignerDescriptor,
  ExplicitHolderBinding,
  Proof,
  SignerRole,
  VerificationMethodRef,
  VerificationRelationship,
} from "@midnight-ntwrk/credential-compact";
import type { MidnightDIDResolverInterface } from "@midnight-ntwrk/midnight-did";
import type { MidnightDIDString } from "@midnight-ntwrk/midnight-did/midnight";

export type MidnightDIDVerificationRelationship =
  | "assertionMethod"
  | "authentication"
  | "capabilityInvocation";

export type MidnightDIDMethodBinding = {
  readonly verificationMethodRef: VerificationMethodRef;
  readonly publicKey: Proof["publicKey"];
  readonly didStateVersion: bigint;
  readonly verificationRelationship: VerificationRelationship;
};

export type MidnightDIDHolderBinding = {
  readonly explicitBinding: ExplicitHolderBinding;
  readonly methodBinding: MidnightDIDMethodBinding;
};

export type ResolveMidnightDIDMethodBindingOptions = {
  readonly resolver: Pick<MidnightDIDResolverInterface, "resolveResult">;
  readonly did: MidnightDIDString;
  readonly verificationMethodId: string;
  readonly relationship: MidnightDIDVerificationRelationship;
};

export type CreateMidnightDIDSignerDescriptorOptions = {
  readonly authorizationId: Uint8Array;
  readonly decisionSequence: bigint;
  readonly state: AuthorizationState;
  readonly role: SignerRole;
  readonly scopeCommitment: Uint8Array;
  readonly policyCommitment: Uint8Array;
};

export type MidnightDIDSignerDescriptor = AuthorizedSignerDescriptor;
