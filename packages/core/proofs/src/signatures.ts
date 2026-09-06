import { CredentialProofsError } from "./errors.js";
import {
  assertArtifactBytes,
  base64UrlDecode,
  base64UrlEncode,
  computeBuildManifestDigest,
  computeDeploymentManifestDigest,
  computeProofManifestDigest,
  isEd25519Signature,
  MANIFEST_SIGNATURE_ALGORITHM,
  serializeDeploymentManifest,
} from "./serialization.js";
import type {
  ArtifactResolver,
  BuildManifest,
  DeploymentManifest,
  DeploymentManifestSignature,
  ManifestKeyResolver,
  ProofManifest,
  ResolvedProofArtifact,
  Sha256Digest,
} from "./types.js";
import {
  assertBuildManifest,
  assertDeploymentManifest,
  defineBuildManifest,
  defineDeploymentManifest,
  defineProofManifest,
} from "./validation.js";

export interface ManifestSigningKey {
  readonly keyId: string;
  readonly privateKey: CryptoKey;
}

export interface DeploymentManifestVerificationOptions {
  /** A directly supplied trusted key. Prefer pairing this with expectedKeyId. */
  readonly publicKey?: CryptoKey;
  /** Binds the envelope key id to the directly supplied trusted key. */
  readonly expectedKeyId?: string;
  /** Resolves only trusted key ids; an unknown id must return undefined/null. */
  readonly keyResolver?: ManifestKeyResolver;
  readonly buildManifest?: BuildManifest;
  readonly expectedBuildManifestDigest?: Sha256Digest;
  readonly expectedDeploymentId?: string;
  readonly expectedDeploymentVersion?: string;
  readonly expectedDeploymentIdentity?: string;
  readonly expectedProfile?: { readonly id: string; readonly version: string };
  readonly expectedNetworkId?: string;
  readonly expectedChainId?: string;
  readonly expectedContractAddress?: string;
  readonly at?: string;
}

const bufferSource = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
};

const assertKey = (key: CryptoKey, usage: KeyUsage): void => {
  if (
    key === null ||
    typeof key !== "object" ||
    key.algorithm?.name !== MANIFEST_SIGNATURE_ALGORITHM ||
    key.type !== (usage === "sign" ? "private" : "public") ||
    !key.usages.includes(usage)
  ) {
    throw new CredentialProofsError(
      "INVALID_SIGNATURE_KEY",
      "deployment.signature",
      `must be an Ed25519 ${usage} key with the '${usage}' usage`,
    );
  }
};

const assertKeyId = (keyId: string): void => {
  if (typeof keyId !== "string" || keyId.length === 0 || keyId.trim() !== keyId) {
    throw new CredentialProofsError("INVALID_SIGNATURE_KEY", "deployment.signature.keyId", "must be a non-empty trimmed string");
  }
};

const assertSignature = (signature: DeploymentManifestSignature): void => {
  if (signature.algorithm !== MANIFEST_SIGNATURE_ALGORITHM || !isEd25519Signature(signature.value)) {
    throw new CredentialProofsError(
      "INVALID_SIGNATURE",
      "deployment.signature.value",
      "must be a 64-byte unpadded base64url Ed25519 signature",
    );
  }
};

const assertExpectedBinding = (
  manifest: DeploymentManifest,
  options: DeploymentManifestVerificationOptions,
): void => {
  const checks: readonly [string, string | undefined, string][] = [
    ["buildManifestDigest", options.expectedBuildManifestDigest, manifest.buildManifestDigest],
    ["deploymentId", options.expectedDeploymentId, manifest.deploymentId],
    ["deploymentVersion", options.expectedDeploymentVersion, manifest.deploymentVersion],
    ["deploymentIdentity", options.expectedDeploymentIdentity, manifest.deploymentIdentity],
    ["profile.id", options.expectedProfile?.id, manifest.profile.id],
    ["profile.version", options.expectedProfile?.version, manifest.profile.version],
    ["networkId", options.expectedNetworkId, manifest.networkId],
    ["chainId", options.expectedChainId, manifest.chainId],
    ["contractAddress", options.expectedContractAddress, manifest.contractAddress],
  ];
  if (options.expectedKeyId !== undefined) {
    assertKeyId(options.expectedKeyId);
    if (manifest.signature.keyId !== options.expectedKeyId) {
      throw new CredentialProofsError("MISMATCHED_DEPLOYMENT_BINDING", "deployment.signature.keyId", "does not match the expected trusted key");
    }
  }
  for (const [name, expected, actual] of checks) {
    if (expected !== undefined && expected !== actual) {
      throw new CredentialProofsError("MISMATCHED_DEPLOYMENT_BINDING", `deployment.${name}`, "does not match the expected deployment");
    }
  }
  if (options.buildManifest !== undefined) {
    if (manifest.buildManifestDigest !== options.buildManifest.manifestDigest) {
      throw new CredentialProofsError("MISMATCHED_DEPLOYMENT_BINDING", "deployment.buildManifestDigest", "does not identify the supplied build manifest");
    }
  }
  if (options.at !== undefined) {
    const time = Date.parse(options.at);
    const notBefore = Date.parse(manifest.supportWindow.notBefore);
    const notAfter = manifest.supportWindow.notAfter === undefined ? undefined : Date.parse(manifest.supportWindow.notAfter);
    if (Number.isNaN(time) || time < notBefore || (notAfter !== undefined && time > notAfter)) {
      throw new CredentialProofsError("STALE_DEPLOYMENT_BINDING", "deployment.supportWindow", "is not active at the requested time");
    }
  }
};

export const generateManifestSigningKeyPair = async (): Promise<CryptoKeyPair> =>
  globalThis.crypto.subtle.generateKey(
    { name: MANIFEST_SIGNATURE_ALGORITHM },
    false,
    ["sign", "verify"],
  ) as Promise<CryptoKeyPair>;

export const createDeploymentManifestSignature = async (
  manifest: DeploymentManifest,
  signer: ManifestSigningKey,
): Promise<DeploymentManifestSignature> => {
  assertKeyId(signer.keyId);
  if (manifest.signature?.keyId !== signer.keyId) {
    throw new CredentialProofsError("MISMATCHED_DEPLOYMENT_BINDING", "deployment.signature.keyId", "must match the signer key id");
  }
  assertKey(signer.privateKey, "sign");
  const value = await globalThis.crypto.subtle.sign(
    MANIFEST_SIGNATURE_ALGORITHM,
    signer.privateKey,
    bufferSource(serializeDeploymentManifest(manifest)),
  );
  return Object.freeze({
    algorithm: MANIFEST_SIGNATURE_ALGORITHM,
    keyId: signer.keyId,
    value: base64UrlEncode(new Uint8Array(value)),
  });
};

export const createProofManifest = async (
  input: Omit<ProofManifest, "manifestDigest">,
): Promise<ProofManifest> => {
  const candidate = { ...input, manifestDigest: "sha256:" + "0".repeat(64) as Sha256Digest } as ProofManifest;
  const manifestDigest = await computeProofManifestDigest(candidate);
  return defineProofManifest({ ...input, manifestDigest } as ProofManifest);
};

export const createBuildManifest = async (
  input: Omit<BuildManifest, "manifestDigest">,
): Promise<BuildManifest> => {
  const candidate = { ...input, manifestDigest: "sha256:" + "0".repeat(64) as Sha256Digest } as BuildManifest;
  assertBuildManifest(candidate);
  const manifestDigest = await computeBuildManifestDigest(candidate);
  const result = { ...input, manifestDigest } as BuildManifest;
  return defineBuildManifest(result);
};

export const createDeploymentManifest = async (
  input: Omit<DeploymentManifest, "deploymentManifestDigest" | "signature">,
  signer: ManifestSigningKey,
): Promise<DeploymentManifest> => {
  assertKeyId(signer.keyId);
  assertKey(signer.privateKey, "sign");
  const unsigned = {
    ...input,
    deploymentManifestDigest: "sha256:" + "0".repeat(64) as Sha256Digest,
    signature: {
      algorithm: MANIFEST_SIGNATURE_ALGORITHM,
      keyId: signer.keyId,
      value: base64UrlEncode(new Uint8Array(64)),
    },
  } as DeploymentManifest;
  const deploymentManifestDigest = await computeDeploymentManifestDigest(unsigned);
  const withDigest = { ...unsigned, deploymentManifestDigest };
  const signature = await createDeploymentManifestSignature(withDigest, signer);
  const result = { ...withDigest, signature } as DeploymentManifest;
  return defineDeploymentManifest(result);
};

/** Resolve one artifact only after its manifest and bytes pass all integrity checks. */
export const resolveVerifiedArtifact = async (
  resolver: ArtifactResolver,
  manifestDigest: Sha256Digest,
  artifactId: string,
): Promise<Uint8Array> => {
  const manifest = await resolver.resolveManifest(manifestDigest);
  if (manifest.manifestDigest !== manifestDigest) {
    throw new CredentialProofsError("MISMATCHED_REFERENCE", "build.manifestDigest", "resolver returned a different manifest");
  }
  await assertBuildManifestIntegrity(manifest);
  const descriptor = manifest.artifacts.find((artifact) => artifact.id === artifactId);
  if (descriptor === undefined) {
    throw new CredentialProofsError("MISMATCHED_REFERENCE", "artifact.id", "is not declared by the requested manifest");
  }
  const resolvedValue: unknown = await resolver.resolveArtifact(manifestDigest, artifactId);
  if (typeof resolvedValue !== "object" || resolvedValue === null) {
    throw new CredentialProofsError("INVALID_ARTIFACT", "artifact", "resolver must return an artifact object");
  }
  const resolved = resolvedValue as ResolvedProofArtifact;
  if (!((resolved.bytes as unknown) instanceof Uint8Array)) {
    throw new CredentialProofsError("INVALID_ARTIFACT", "artifact.bytes", "resolver must return Uint8Array bytes");
  }
  if (
    resolved.manifestDigest !== manifestDigest ||
    resolved.artifactId !== descriptor.id ||
    resolved.bytes.byteLength !== descriptor.bytes ||
    resolved.sha256 !== descriptor.sha256
  ) {
    throw new CredentialProofsError("MISMATCHED_REFERENCE", "artifact", "resolver result does not match the manifest descriptor");
  }
  await assertArtifactBytes(descriptor, resolved.bytes);
  return resolved.bytes;
};

/** Alias emphasizing that this helper returns verified bytes, not a locator. */
export const resolveArtifactBytes = resolveVerifiedArtifact;

export const assertBuildManifestIntegrity = async (manifest: BuildManifest): Promise<void> => {
  assertBuildManifest(manifest);
  for (const [index, proofManifest] of manifest.proofs.entries()) {
    const actualProofDigest = await computeProofManifestDigest(proofManifest);
    if (actualProofDigest !== proofManifest.manifestDigest) {
      throw new CredentialProofsError("WRONG_DIGEST", `build.proofs[${index}].manifestDigest`, `expected ${proofManifest.manifestDigest}, computed ${actualProofDigest}`);
    }
  }
  const actual = await computeBuildManifestDigest(manifest);
  if (actual !== manifest.manifestDigest) {
    throw new CredentialProofsError("WRONG_DIGEST", "build.manifestDigest", `expected ${manifest.manifestDigest}, computed ${actual}`);
  }
};

export const verifyBuildManifestDigest = async (manifest: BuildManifest): Promise<boolean> => {
  try {
    await assertBuildManifestIntegrity(manifest);
    return true;
  } catch {
    return false;
  }
};

export const assertDeploymentManifestIntegrity = async (
  manifest: DeploymentManifest,
  options: DeploymentManifestVerificationOptions,
): Promise<void> => {
  assertDeploymentManifest(manifest);
  const actualDigest = await computeDeploymentManifestDigest(manifest);
  if (actualDigest !== manifest.deploymentManifestDigest) {
    throw new CredentialProofsError("WRONG_DIGEST", "deployment.deploymentManifestDigest", `expected ${manifest.deploymentManifestDigest}, computed ${actualDigest}`);
  }
  if (options.buildManifest !== undefined) {
    await assertBuildManifestIntegrity(options.buildManifest);
  }
  assertExpectedBinding(manifest, options);
  if (options.expectedKeyId === undefined && options.keyResolver === undefined) {
    throw new CredentialProofsError("INVALID_SIGNATURE_KEY", "deployment.signature.keyId", "must be bound to an expected key id or resolver");
  }
  const publicKey = options.keyResolver === undefined
    ? options.publicKey
    : await options.keyResolver(manifest.signature.keyId);
  if (publicKey === undefined || publicKey === null) {
    throw new CredentialProofsError("INVALID_SIGNATURE_KEY", "deployment.signature.keyId", "does not identify a trusted verification key");
  }
  assertKey(publicKey, "verify");
  assertSignature(manifest.signature);
  const valid = await globalThis.crypto.subtle.verify(
    MANIFEST_SIGNATURE_ALGORITHM,
    publicKey,
    bufferSource(base64UrlDecode(manifest.signature.value)),
    bufferSource(serializeDeploymentManifest(manifest)),
  );
  if (!valid) throw new CredentialProofsError("INVALID_SIGNATURE", "deployment.signature", "signature verification failed");
};

export const verifyDeploymentManifest = async (
  manifest: DeploymentManifest,
  options: DeploymentManifestVerificationOptions,
): Promise<boolean> => {
  try {
    await assertDeploymentManifestIntegrity(manifest, options);
    return true;
  } catch {
    return false;
  }
};
