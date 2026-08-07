import { describe, expect, it } from "vitest";

import {
  assertArtifactBytes,
  assertBuildManifestIntegrity,
  assertDeploymentManifestIntegrity,
  type BuildManifest,
  computeSha256Digest,
  createBuildManifest,
  createDeploymentManifest,
  type DeploymentManifest,
  generateManifestSigningKeyPair,
  type ManifestSigningKey,
  type Sha256Digest,
  verifyDeploymentManifest,
} from "../index.js";

const digest = "sha256:" + "a".repeat(64) as Sha256Digest;

const buildInput: Omit<BuildManifest, "manifestDigest"> = {
  formatVersion: 1,
  manifestKind: "build",
  productId: "example-product",
  packageName: "@example/contract",
  schemaId: "urn:example:contract",
  contractId: "contract-v1",
  sourceCommit: "0123456789abcdef0123456789abcdef01234567",
  cleanTree: true,
  toolchain: { compactCompiler: "0.30.0", runtime: "0.15.0", generator: "1.0.0" },
  circuits: [{ id: "check", version: "1.0.0", parameters: { threshold: 18 }, artifactIds: ["check-zkir"] }],
  proofs: [],
  artifacts: [{ id: "check-zkir", role: "circuit", mediaType: "application/octet-stream", path: "zkir/check.bzkir", bytes: 3, sha256: digest }],
  lockfileDigest: digest,
};

const deploymentInput = (buildManifestDigest: Sha256Digest): Omit<DeploymentManifest, "deploymentManifestDigest" | "signature"> => ({
  formatVersion: 1,
  manifestKind: "deployment",
  buildManifestDigest,
  networkId: "testnet",
  chainId: "chain-1",
  contractAddress: "contract-1",
  deploymentTransaction: "tx-1",
  constructorDigest: digest,
  acceptedReferences: [{ id: "status-policy", digest }],
  governanceOwner: "governance-key",
  supportWindow: { notBefore: "2026-01-01T00:00:00Z", notAfter: "2027-01-01T00:00:00Z" },
});

describe("artifact manifest integrity", () => {
  it("has stable canonical bytes and a reproducible build digest", async () => {
    const first = await createBuildManifest(buildInput);
    const second = await createBuildManifest({ ...buildInput, artifacts: [...buildInput.artifacts] });
    expect(first.manifestDigest).toBe(second.manifestDigest);
    await assertBuildManifestIntegrity(first);
    expect(first.manifestDigest).toMatch(/^sha256:[0-9a-f]{64}$/u);
  });

  it("signs and verifies the deployment binding with Ed25519", async () => {
    const build = await createBuildManifest(buildInput);
    const keyPair = await generateManifestSigningKeyPair();
    const manifest = await createDeploymentManifest(deploymentInput(build.manifestDigest), {
      keyId: "release-key-1",
      privateKey: keyPair.privateKey,
    } satisfies ManifestSigningKey);

    await assertDeploymentManifestIntegrity(manifest, { publicKey: keyPair.publicKey, buildManifest: build, at: "2026-06-01T00:00:00Z" });
    expect(await verifyDeploymentManifest(manifest, { publicKey: keyPair.publicKey, buildManifest: build })).toBe(true);
  });

  it("fails closed for tampering, wrong digests, wrong keys, and stale bindings", async () => {
    const build = await createBuildManifest(buildInput);
    const keyPair = await generateManifestSigningKeyPair();
    const otherKeyPair = await generateManifestSigningKeyPair();
    const manifest = await createDeploymentManifest(deploymentInput(build.manifestDigest), { keyId: "release-key-1", privateKey: keyPair.privateKey });

    await expect(assertDeploymentManifestIntegrity({ ...manifest, networkId: "mainnet" }, { publicKey: keyPair.publicKey })).rejects.toThrow(/Digest|signature/u);
    await expect(assertDeploymentManifestIntegrity({ ...manifest, signature: { ...manifest.signature, keyId: "other-key" } }, { publicKey: keyPair.publicKey })).rejects.toThrow(/Digest|signature/u);
    await expect(assertDeploymentManifestIntegrity({ ...manifest, deploymentManifestDigest: digest }, { publicKey: keyPair.publicKey })).rejects.toThrow(/Digest/u);
    await expect(assertDeploymentManifestIntegrity(manifest, { publicKey: otherKeyPair.publicKey })).rejects.toThrow(/signature|key/u);
    await expect(assertDeploymentManifestIntegrity(manifest, { publicKey: keyPair.publicKey, expectedBuildManifestDigest: digest })).rejects.toThrow(/deployment/u);
    await expect(assertDeploymentManifestIntegrity(manifest, { publicKey: keyPair.publicKey, at: "2028-01-01T00:00:00Z" })).rejects.toThrow(/active|support/u);
  });

  it("checks artifact bytes by declared size and digest", async () => {
    const bytes = new TextEncoder().encode("zk!");
    const artifact = { bytes: 3, sha256: await computeSha256Digest(bytes) };
    await expect(assertArtifactBytes(artifact, bytes)).resolves.toBeUndefined();
    await expect(assertArtifactBytes(artifact, new TextEncoder().encode("bad"))).rejects.toThrow(/digest/u);
  });
});
