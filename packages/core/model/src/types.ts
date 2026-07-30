export type ClaimDisclosure =
  | "public"
  | "selective"
  | "committed"
  | "predicate-only";

export type CredentialCapabilityKind =
  | "holder-binding"
  | "status"
  | "proof"
  | "presentation";

export interface CredentialClaimDescriptor {
  readonly id: string;
  readonly path: readonly [string, ...string[]];
  readonly disclosure: ClaimDisclosure;
  readonly required: boolean;
  readonly valueType?: string;
}

export interface CredentialSchemaDescriptor {
  readonly id: string;
  readonly version: string;
  readonly credentialTypes: readonly [string, ...string[]];
  readonly claims: readonly CredentialClaimDescriptor[];
}

export interface CredentialCapabilityDescriptor {
  readonly id: string;
  readonly kind: CredentialCapabilityKind;
  readonly version?: string;
  readonly required: boolean;
}

export interface ProofArtifactRequirement {
  readonly id: string;
  readonly mediaType: string;
  readonly purpose: "prover" | "verifier" | "circuit" | "metadata";
  readonly optional?: boolean;
}

export interface CredentialPackageRequirement {
  readonly name: string;
  readonly version: string;
  readonly exports?: readonly string[];
}

export interface CredentialCompositionManifest {
  readonly formatVersion: 1;
  readonly packages: readonly CredentialPackageRequirement[];
}

export interface CredentialCodec<TCredential, TEncoded = unknown> {
  readonly mediaType: string;
  encode(credential: TCredential): TEncoded;
  decode(encoded: TEncoded): TCredential;
}

export interface PresentationCodec<TPresentation, TEncoded = unknown> {
  readonly mediaType: string;
  encode(presentation: TPresentation): TEncoded;
  decode(encoded: TEncoded): TPresentation;
}

export interface CredentialFamilyDefinition<
  TCredential,
  TPresentation,
  TEncodedCredential = unknown,
  TEncodedPresentation = unknown,
> {
  readonly id: string;
  readonly version: string;
  readonly schema: CredentialSchemaDescriptor;
  readonly capabilities: readonly CredentialCapabilityDescriptor[];
  readonly artifacts: readonly ProofArtifactRequirement[];
  readonly composition: CredentialCompositionManifest;
  readonly credentialCodec: CredentialCodec<TCredential, TEncodedCredential>;
  readonly presentationCodec: PresentationCodec<
    TPresentation,
    TEncodedPresentation
  >;
}
