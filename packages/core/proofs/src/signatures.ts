import { CredentialProofsError } from "./errors.js";
import {
  base64UrlDecode,
  base64UrlEncode,
  computeBuildManifestDigest,
  computeDeploymentManifestDigest,
  isEd25519Signature,
  MANIFEST_SIGNATURE_ALGORITHM,
  serializeDeploymentManifest,
} from "./serialization.js";
import type {
  BuildManifest,
  DeploymentManifest,
  DeploymentManifestSignature,
  Sha256Digest,
} from "./types.js";
import {
  assertBuildManifest,
  assertDeploymentManifest,
  defineBuildManifest,
  defineDeploymentManifest,
} from "./validation.js";

export interface ManifestSigningKey {
  readonly keyId: string;
  readonly privateKey: CryptoKey;
}

export interface DeploymentManifestVerificationOptions {
  readonly publicKey: CryptoKey;
  readonly buildManifest?: BuildManifest;
  readonly expectedBuildManifestDigest?: Sha256Digest;
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
    ["networkId", options.expectedNetworkId, manifest.networkId],
    ["chainId", options.expectedChainId, manifest.chainId],
    ["contractAddress", options.expectedContractAddress, manifest.contractAddress],
  ];
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
    true,
    ["sign", "verify"],
  ) as Promise<CryptoKeyPair>;

export const createDeploymentManifestSignature = async (
  manifest: DeploymentManifest,
  signer: ManifestSigningKey,
): Promise<DeploymentManifestSignature> => {
  assertKeyId(signer.keyId);
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

export const assertBuildManifestIntegrity = async (manifest: BuildManifest): Promise<void> => {
  assertBuildManifest(manifest);
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
  assertKey(options.publicKey, "verify");
  assertSignature(manifest.signature);
  const valid = await globalThis.crypto.subtle.verify(
    MANIFEST_SIGNATURE_ALGORITHM,
    options.publicKey,
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
