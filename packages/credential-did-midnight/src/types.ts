import type {
  AuthorizationState,
  AuthorizedSignerDescriptor,
  ExplicitHolderBinding,
  Proof,
  SignerRole,
  VerificationMethodRef,
  VerificationRelationship,
} from "@midnight-ntwrk/credential-compact";
import type {
  DIDDocumentMetadata,
  DIDKeyID,
  VerificationMethod,
} from "@midnight-ntwrk/midnight-did-domain";
import type { MidnightDIDString } from "@midnight-ntwrk/midnight-did-domain/midnight";

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

export type MidnightDIDResolutionDocument = {
  readonly id: MidnightDIDString;
  readonly verificationMethod?: readonly VerificationMethod[];
  readonly authentication?: readonly DIDKeyID[];
  readonly assertionMethod?: readonly DIDKeyID[];
  readonly capabilityInvocation?: readonly DIDKeyID[];
};

export type MidnightDIDResolutionResult = {
  readonly didDocument: MidnightDIDResolutionDocument;
  readonly didDocumentMetadata: Pick<
    DIDDocumentMetadata,
    "deactivated" | "versionId"
  >;
};

export interface MidnightDIDResolutionSource {
  resolveResult(
    did: MidnightDIDString,
  ): Promise<MidnightDIDResolutionResult | null>;
}

export type ResolveMidnightDIDMethodBindingOptions = {
  readonly resolver: MidnightDIDResolutionSource;
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
