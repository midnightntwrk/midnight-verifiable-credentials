import type { CredentialFamilyDefinition } from "@midnight-ntwrk/credential-model";

export type Sha256Digest = `sha256:${string}`;
export type ProofBytes = Uint8Array;

export interface ProofJob<TInput = unknown> {
  readonly formatVersion: 1;
  readonly id: string;
  readonly version: string;
  readonly familyId: string;
  readonly circuitId: string;
  readonly proofManifestDigest: Sha256Digest;
  readonly input: TInput;
}

export interface ProofResult<TProof = ProofBytes> {
  readonly formatVersion: 1;
  readonly jobId: string;
  readonly proofManifestDigest: Sha256Digest;
  readonly proof: TProof;
}

export interface ProofVerificationResult {
  readonly formatVersion: 1;
  readonly jobId: string;
  readonly proofManifestDigest: Sha256Digest;
  readonly valid: boolean;
  readonly reason?: string;
}

export interface ProofProvider<
  TJob extends ProofJob = ProofJob,
  TResult extends ProofResult = ProofResult,
> {
  prove(job: TJob): Promise<TResult>;
}

export interface ProofVerifier<
  TJob extends ProofJob = ProofJob,
  TResult extends ProofResult = ProofResult,
> {
  verify(job: TJob, result: TResult): Promise<ProofVerificationResult>;
}

export interface ResolvedProofArtifact {
  readonly manifestDigest: Sha256Digest;
  readonly artifactId: string;
  readonly bytes: Uint8Array;
  readonly sha256: Sha256Digest;
}

export interface ArtifactResolver {
  resolveManifest(manifestDigest: Sha256Digest): Promise<BuildManifest>;
  resolveArtifact(
    manifestDigest: Sha256Digest,
    artifactId: string,
  ): Promise<ResolvedProofArtifact>;
}

export type ProofArtifactRole =
  | "prover-key"
  | "verifier-key"
  | "circuit"
  | "managed-code"
  | "metadata";

export interface ProofArtifactDescriptor {
  readonly id: string;
  readonly role: ProofArtifactRole;
  readonly mediaType: string;
  readonly path: string;
  readonly bytes: number;
  readonly sha256: Sha256Digest;
}

export interface ProofCircuitDescriptor {
  readonly id: string;
  readonly version: string;
  readonly parameters: Readonly<Record<string, string | number | boolean>>;
  readonly artifactIds: readonly string[];
}

export interface ProofManifest {
  readonly formatVersion: 1;
  readonly manifestKind: "proof";
  readonly manifestDigest: Sha256Digest;
  readonly id: string;
  readonly version: string;
  readonly familyId: string;
  readonly circuitId: string;
  readonly proofSystem: string;
  readonly proofFormat: string;
  readonly publicInputEncoding: string;
  readonly artifactIds: readonly string[];
}

export interface ProofBuildToolchain {
  readonly compactCompiler?: string;
  readonly runtime?: string;
  readonly generator?: string;
  readonly [tool: string]: string | undefined;
}

export interface ProofBuildManifest {
  readonly formatVersion: 1;
  readonly manifestKind: "build";
  readonly manifestDigest: Sha256Digest;
  readonly productId: string;
  readonly packageName: string;
  readonly schemaId: string;
  readonly contractId: string;
  readonly sourceCommit: string;
  readonly cleanTree: true;
  readonly toolchain: ProofBuildToolchain;
  readonly circuits: readonly ProofCircuitDescriptor[];
  readonly proofs: readonly ProofManifest[];
  readonly artifacts: readonly ProofArtifactDescriptor[];
  readonly lockfileDigest: Sha256Digest;
  readonly sbomReference?: string;
  readonly provenanceReference?: string;
}

/** Alias used by artifact consumers that call the build record an artifact manifest. */
export type BuildManifest = ProofBuildManifest;

export interface DeploymentReference {
  readonly id: string;
  readonly digest: Sha256Digest;
}

export interface DeploymentSupportWindow {
  readonly notBefore: string;
  readonly notAfter?: string;
}

export interface DeploymentManifestSignature {
  readonly algorithm: string;
  readonly keyId: string;
  readonly value: string;
}

export interface ProofDeploymentManifest {
  readonly formatVersion: 1;
  readonly manifestKind: "deployment";
  readonly deploymentManifestDigest: Sha256Digest;
  readonly buildManifestDigest: Sha256Digest;
  readonly networkId: string;
  readonly chainId: string;
  readonly contractAddress: string;
  readonly deploymentTransaction: string;
  readonly constructorDigest: Sha256Digest;
  readonly acceptedReferences: readonly DeploymentReference[];
  readonly governanceOwner: string;
  readonly supportWindow: DeploymentSupportWindow;
  readonly predecessor?: Sha256Digest;
  readonly successor?: Sha256Digest;
  readonly deprecation?: string;
  readonly revocation?: string;
  readonly signature: DeploymentManifestSignature;
}

/** Short name for callers that use the manifest kind as the primary concept. */
export type DeploymentManifest = ProofDeploymentManifest;

/** Keeps the model dependency visible to declaration consumers without coupling proof execution to a family. */
export type ProofFamily = CredentialFamilyDefinition<unknown, unknown>;
