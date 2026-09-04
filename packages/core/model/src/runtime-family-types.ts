import type {
  CapabilityProviderCatalogV1,
  CredentialDeploymentAssemblyV1,
  CredentialFamilyProfileV1,
  CredentialFamilyReference,
  ResolvedCredentialCompositionV1,
} from "./composition-types.js";
import type { CredentialFamilyDefinition } from "./types.js";

export interface RuntimeCredentialFamilyArtifactIdentity {
  readonly id: string;
  readonly digestAlgorithm: "sha256";
  readonly digest: string;
}

export interface RuntimeCredentialFamilyPackageIdentity {
  readonly name: string;
  readonly version: string;
  readonly exportPath: string;
}

export interface RuntimeCredentialFamilyPublicSurfaceV1<TSurface = unknown> {
  readonly formatVersion: 1;
  readonly family: CredentialFamilyReference;
  readonly profile: { readonly id: string; readonly version: string };
  readonly package: RuntimeCredentialFamilyPackageIdentity;
  readonly artifact: RuntimeCredentialFamilyArtifactIdentity;
  readonly value: TSurface;
}

/**
 * Authentication bytes are scheme-neutral. Deployments choose the signature,
 * transparency-log, or registry-attestation scheme and its trust roots.
 */
export interface RuntimeCredentialFamilyAuthenticationEvidence {
  readonly scheme: string;
  readonly authority: string;
  readonly keyId: string;
  readonly signature: string;
}

export interface RuntimeCredentialFamilyRecordV1<TSurface = unknown> {
  readonly formatVersion: 1;
  readonly family: CredentialFamilyDefinition<unknown, unknown, unknown, unknown>;
  readonly profile: CredentialFamilyProfileV1;
  readonly assembly: CredentialDeploymentAssemblyV1;
  readonly catalog: CapabilityProviderCatalogV1;
  readonly publicSurface: RuntimeCredentialFamilyPublicSurfaceV1<TSurface>;
  readonly authentication: RuntimeCredentialFamilyAuthenticationEvidence;
}

/** A registry supplies data only; it does not become a trust root by itself. */
export interface RuntimeCredentialFamilyRegistryV1 {
  readonly formatVersion: 1;
  readonly id: string;
  readonly version: string;
  resolve(reference: CredentialFamilyReference): Promise<unknown | undefined>;
}

export interface RuntimeCredentialFamilyAuthenticatedMetadataV1 {
  readonly formatVersion: 1;
  readonly family: CredentialFamilyReference;
  readonly compositionInput: {
    readonly family: Pick<
      CredentialFamilyDefinition<unknown, unknown, unknown, unknown>,
      "id" | "version" | "schema" | "capabilities" | "artifacts" | "composition"
    >;
    readonly profile: CredentialFamilyProfileV1;
    readonly assembly: CredentialDeploymentAssemblyV1;
    readonly catalog: CapabilityProviderCatalogV1;
  };
  readonly composition: ResolvedCredentialCompositionV1;
  readonly publicSurface: Omit<
    RuntimeCredentialFamilyPublicSurfaceV1,
    "value"
  >;
}

export type RuntimeCredentialFamilyTrustDecision =
  | { readonly trusted: true }
  | { readonly trusted: false; readonly reason: string };

export interface RuntimeCredentialFamilyTrustVerifier {
  verify(input: {
    readonly registry: { readonly id: string; readonly version: string };
    readonly metadata: RuntimeCredentialFamilyAuthenticatedMetadataV1;
    readonly authentication: RuntimeCredentialFamilyAuthenticationEvidence;
    readonly surface: unknown;
  }): Promise<RuntimeCredentialFamilyTrustDecision>;
}

export type RuntimeCredentialFamilyUnsupportedCode =
  | "INVALID_REFERENCE"
  | "UNKNOWN_FAMILY"
  | "REGISTRY_UNAVAILABLE"
  | "UNSUPPORTED_REGISTRY_VERSION"
  | "INVALID_REGISTRY_RESPONSE"
  | "VERSION_MISMATCH"
  | "INCOMPATIBLE_FAMILY"
  | "ARTIFACT_IDENTITY_MISMATCH"
  | "UNTRUSTED_FAMILY";

export interface RuntimeCredentialFamilyUnsupported {
  readonly status: "unsupported";
  readonly code: RuntimeCredentialFamilyUnsupportedCode;
  readonly reference: CredentialFamilyReference;
  readonly registryId?: string;
  readonly diagnostic: string;
}

export interface ResolvedRuntimeCredentialFamily<TSurface> {
  readonly status: "resolved";
  readonly reference: CredentialFamilyReference;
  readonly registry: { readonly id: string; readonly version: string };
  readonly composition: ResolvedCredentialCompositionV1;
  readonly publicSurface: Omit<
    RuntimeCredentialFamilyPublicSurfaceV1<TSurface>,
    "value"
  >;
  readonly authentication: RuntimeCredentialFamilyAuthenticationEvidence;
  readonly surface: TSurface;
}

export type RuntimeCredentialFamilyResolution<TSurface> =
  | ResolvedRuntimeCredentialFamily<TSurface>
  | RuntimeCredentialFamilyUnsupported;

export interface ResolveRuntimeCredentialFamilyInput<TSurface> {
  readonly reference: CredentialFamilyReference;
  readonly registries: readonly RuntimeCredentialFamilyRegistryV1[];
  readonly trustVerifier: RuntimeCredentialFamilyTrustVerifier;
  readonly validateSurface: (value: unknown) => value is TSurface;
}
