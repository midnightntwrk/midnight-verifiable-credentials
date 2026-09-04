import type {
  ClaimDisclosure,
  CredentialFamilyDefinition,
} from "./types.js";

export type CredentialProfileDenyRule =
  | "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION"
  | "STATUS_EVIDENCE_REQUIRED"
  | "CALLER_TIME_WITH_LEDGER_AUTHORITY"
  | "ATOMIC_REPLAY_REQUIRED"
  | "DISABLED_CAPABILITY_DEPENDENCY"
  | "LEDGER_COMMIT_REQUIRED"
  | "UNTESTED_COMBINATION";

export type CredentialPackageDomain =
  | "family"
  | "compact"
  | "proof"
  | "holder-binding"
  | "status-registry"
  | "status-proof"
  | "status-authority"
  | "status-mutation"
  | "signing"
  | "did"
  | "trust"
  | "protocol"
  | "replay"
  | "session"
  | "storage"
  | "wallet"
  | "network"
  | "transport"
  | "artifact"
  | "verification"
  | "registration"
  | "anchoring";

export interface ExactCredentialPackageRequirement {
  readonly name: string;
  readonly version: string;
  readonly exports: readonly string[];
  readonly domain: CredentialPackageDomain;
}

export interface VersionedCapabilityReference {
  readonly id: string;
  readonly version: string;
}

export interface CredentialFamilyReference {
  readonly id: string;
  readonly version: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
}

export interface ProfileClaimSemantics {
  readonly claimId: string;
  readonly disclosure: ClaimDisclosure;
}

export type HolderBindingMode =
  | "explicit-did"
  | "secret"
  | "blinded-secret"
  | "offchain-did";

export interface HolderBindingProfile {
  readonly mode: HolderBindingMode;
  readonly capability: VersionedCapabilityReference;
}

export interface IssuanceProfile {
  readonly credential: "issuer-local-issuance-v1";
  readonly registration: "disabled" | "ledger-registration-v1";
  readonly anchoring: "disabled" | "ledger-anchoring-v1";
}

export interface PresentationProfile {
  readonly capability: VersionedCapabilityReference;
  readonly preparation: "holder-wallet-v1";
  readonly proofGeneration: {
    readonly capability: VersionedCapabilityReference;
    readonly witnessPolicy: "public-only" | "private-compatible";
  };
}

export type VerificationProfileId =
  | "ledger-local-v1"
  | "ledger-attested-v1"
  | "offchain-public-v1";

export type PrivateVerificationInputSource =
  | "hidden-holder"
  | "private-predicate"
  | "same-holder"
  | "private-status";

export interface VerificationProfile {
  readonly profile: VerificationProfileId;
  readonly location: "ledger" | "local-process";
  readonly authority: "ledger-local" | "ledger-attested" | "local-process";
  readonly commitState:
    | "committed"
    | "submitted"
    | "included"
    | "finalized-reverted"
    | "local-attempt"
    | "simulation"
    | "not-applicable";
  readonly privateInputSources: readonly PrivateVerificationInputSource[];
}

export interface DisabledStatusProfile {
  readonly mode: "disabled";
}

export interface EnabledStatusProfile {
  readonly mode: "ledger-local" | "authority-attested";
  readonly capability: VersionedCapabilityReference;
  readonly namespace: string;
  readonly authority: string;
  readonly rootVersion: string;
  readonly freshnessPolicy: string;
  readonly evidence:
    | "membership"
    | "non-membership"
    | "challenge-bound-attestation";
  readonly privacy: "public" | "private";
  readonly authenticated: true;
}

export type CredentialStatusProfile =
  | DisabledStatusProfile
  | EnabledStatusProfile;

export interface DidEvidenceProfile {
  readonly method: string;
  readonly relationship: string;
  readonly network: string;
  readonly versionEvidence: string;
}

export interface TrustEvidenceProfile {
  readonly scope: string;
  readonly epochEvidence: string;
}

export interface TrustedTimeProfile {
  readonly source: "none" | "ledger" | "attested" | "caller";
  readonly evidence:
    | "not-required"
    | "ledger-time"
    | "challenge-bound-attestation"
    | "caller-assertion";
  readonly freshnessPolicy: string;
}

export interface ProtectedMutationProfile {
  readonly location: "none" | "ledger";
  readonly nullifier: "none" | "contract-derived" | "caller";
  readonly consumption: "none" | "atomic" | "separate";
}

export type CredentialProtocolProfile =
  | "disabled"
  | "canonical-reference"
  | "oid4vci-1.0-final"
  | "oid4vp-1.0-final"
  | "dcql";

export interface CredentialSemanticAxesV1 {
  readonly claims: readonly ProfileClaimSemantics[];
  readonly holderBinding: HolderBindingProfile;
  readonly issuance: IssuanceProfile;
  readonly presentation: PresentationProfile;
  readonly verification: VerificationProfile;
  readonly status: CredentialStatusProfile;
  readonly did: DidEvidenceProfile;
  readonly trust: TrustEvidenceProfile;
  readonly trustedTime: TrustedTimeProfile;
  readonly mutation: ProtectedMutationProfile;
  readonly protocols: readonly CredentialProtocolProfile[];
}

export interface CompactEntrypointRequirement {
  readonly id: string;
  readonly packageName: string;
  readonly exportPath: string;
  readonly sourcePath: string;
}

export interface CircuitRequirement {
  readonly id: string;
  readonly semanticVersion: string;
  readonly entrypointId: string;
}

export interface ResolvedArtifactRequirement {
  readonly id: string;
  readonly mediaType: string;
  readonly artifactClass:
    | "prover-key"
    | "verifier-key"
    | "zkir"
    | "bzkir"
    | "circuit-metadata";
  readonly digestAlgorithm: "sha256";
  readonly trusted: true;
}

export type CredentialDeploymentRole =
  | "session"
  | "storage"
  | "key-custody"
  | "signing"
  | "did-resolver"
  | "trust-resolver"
  | "wallet"
  | "connector"
  | "network"
  | "transport"
  | "proof-executor"
  | "artifact-resolver"
  | "status-registry"
  | "status-proof"
  | "status-authority"
  | "status-mutation"
  | "replay"
  | "verification"
  | "registration"
  | "anchoring";

export interface ProviderRequirement {
  readonly id: string;
  readonly capability: VersionedCapabilityReference;
  readonly role: CredentialDeploymentRole;
}

export interface CredentialProfileRequirementsV1 {
  readonly packages: readonly ExactCredentialPackageRequirement[];
  readonly compactEntrypoints: readonly CompactEntrypointRequirement[];
  readonly circuits: readonly CircuitRequirement[];
  readonly artifacts: readonly ResolvedArtifactRequirement[];
  readonly providers: readonly ProviderRequirement[];
}

export interface ConformanceFixtureReference {
  readonly fixtureId: string;
  readonly evidenceDisposition: "tested" | "untested" | "unsupported";
  readonly evidenceIds: readonly string[];
}

export interface MaturityAssessmentReference<TValue extends string> {
  readonly subjectId: string;
  readonly value: TValue;
}

export interface CredentialProfileMaturity {
  readonly api: MaturityAssessmentReference<
    "prototype" | "reference" | "supported"
  >;
  readonly security: MaturityAssessmentReference<
    | "unassessed"
    | "design-reviewed"
    | "implementation-reviewed"
    | "independently-assured"
  >;
  readonly standards: MaturityAssessmentReference<
    "not-applicable" | "inspired" | "profile-targeted" | "conformant"
  >;
  readonly production: MaturityAssessmentReference<
    "not-assessed" | "experimental" | "candidate" | "production-approved"
  >;
}

export interface CredentialFamilyProfileV1 {
  readonly formatVersion: 1;
  readonly id: string;
  readonly version: string;
  readonly family: CredentialFamilyReference;
  readonly semantics: CredentialSemanticAxesV1;
  readonly requirements: CredentialProfileRequirementsV1;
  readonly compatibility: {
    readonly deniedRules: readonly CredentialProfileDenyRule[];
  };
  readonly conformance: ConformanceFixtureReference;
  readonly maturity: CredentialProfileMaturity;
}

export interface CapabilityProviderDescriptor {
  readonly id: string;
  readonly version: string;
  readonly roles: readonly CredentialDeploymentRole[];
  readonly capabilities: readonly VersionedCapabilityReference[];
  readonly packages: readonly ExactCredentialPackageRequirement[];
  readonly witnessPolicy: "public-only" | "private-compatible";
  readonly atomicReplay: boolean;
}

export interface CapabilityProviderCatalogV1 {
  readonly formatVersion: 1;
  readonly providers: readonly CapabilityProviderDescriptor[];
}

export interface DisabledDeploymentComponent {
  readonly state: "disabled";
}

export interface SelectedDeploymentComponent {
  readonly state: "selected";
  readonly requirementId: string;
  readonly provider: VersionedCapabilityReference;
  readonly instanceId: string;
}

export type DeploymentComponentSelection =
  | DisabledDeploymentComponent
  | SelectedDeploymentComponent;

export type CredentialDeploymentComponents = Readonly<
  Record<CredentialDeploymentRole, DeploymentComponentSelection>
>;

export interface ConcreteArtifactIdentity {
  readonly requirementId: string;
  readonly id: string;
  readonly digest: string;
}

export interface ConcreteDeploymentIdentity {
  readonly id: string;
  readonly kind: "compact-contract" | "local-service" | "network-service";
  readonly domain: CredentialPackageDomain;
  readonly identity: string;
  readonly immutableInputs: Readonly<Record<string, string>>;
}

export interface CredentialDeploymentAssemblyV1 {
  readonly formatVersion: 1;
  readonly id: string;
  readonly version: string;
  readonly profile: {
    readonly id: string;
    readonly version: string;
  };
  readonly components: CredentialDeploymentComponents;
  readonly artifacts: readonly ConcreteArtifactIdentity[];
  readonly deployments: readonly ConcreteDeploymentIdentity[];
}

export interface ResolvedProviderIdentity {
  readonly requirementId: string;
  readonly role: CredentialDeploymentRole;
  readonly providerId: string;
  readonly providerVersion: string;
  readonly instanceId: string;
}

export interface ResolvedCredentialCompositionV1 {
  readonly formatVersion: 1;
  readonly family: CredentialFamilyReference;
  readonly profile: { readonly id: string; readonly version: string };
  readonly assembly: { readonly id: string; readonly version: string };
  readonly packages: readonly ExactCredentialPackageRequirement[];
  readonly exports: readonly {
    readonly packageName: string;
    readonly exportPath: string;
  }[];
  readonly compactEntrypoints: readonly CompactEntrypointRequirement[];
  readonly circuits: readonly CircuitRequirement[];
  readonly artifacts: readonly {
    readonly requirementId: string;
    readonly requirement: ResolvedArtifactRequirement;
    readonly artifact: ConcreteArtifactIdentity;
  }[];
  readonly providers: readonly ResolvedProviderIdentity[];
  readonly deployments: readonly ConcreteDeploymentIdentity[];
  readonly conformance: ConformanceFixtureReference;
}

export interface ResolveCredentialCompositionInput {
  readonly family: CredentialFamilyDefinition<unknown, unknown, unknown, unknown>;
  readonly profile: CredentialFamilyProfileV1;
  readonly assembly: CredentialDeploymentAssemblyV1;
  readonly catalog: CapabilityProviderCatalogV1;
}
