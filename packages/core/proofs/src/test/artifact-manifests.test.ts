import { describe, expect, it } from "vitest";

import {
  type ArtifactResolver,
  assertArtifactBytes,
  assertBuildManifestIntegrity,
  assertDeploymentManifestIntegrity,
  type BuildManifest,
  CANONICALIZATION_PROFILE,
  canonicalize,
  computeSha256Digest,
  createBuildManifest,
  createDeploymentManifest,
  createDeploymentManifestSignature,
  createProofManifest,
  type DeploymentManifest,
  generateManifestSigningKeyPair,
  type ManifestSigningKey,
  resolveVerifiedArtifact,
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

    await assertDeploymentManifestIntegrity(manifest, { publicKey: keyPair.publicKey, expectedKeyId: "release-key-1", buildManifest: build, at: "2026-06-01T00:00:00Z" });
    expect(await verifyDeploymentManifest(manifest, {
      keyResolver: (keyId) => keyId === "release-key-1" ? keyPair.publicKey : undefined,
      expectedKeyId: "release-key-1",
      buildManifest: build,
    })).toBe(true);
  });

  it("keeps generated signing keys non-extractable and binds signer ids", async () => {
    const build = await createBuildManifest(buildInput);
    const keyPair = await generateManifestSigningKeyPair();
    const manifest = await createDeploymentManifest(deploymentInput(build.manifestDigest), {
      keyId: "release-key-1",
      privateKey: keyPair.privateKey,
    });
    expect(keyPair.privateKey.extractable).toBe(false);
    await expect(globalThis.crypto.subtle.exportKey("raw", keyPair.privateKey)).rejects.toThrow();
    await expect(createDeploymentManifestSignature(manifest, {
      keyId: "other-key",
      privateKey: keyPair.privateKey,
    })).rejects.toThrow(/signer key id/u);
    await expect(assertDeploymentManifestIntegrity(manifest, {
      publicKey: keyPair.publicKey,
      expectedKeyId: "other-key",
    })).rejects.toThrow(/trusted key/u);
    await expect(assertDeploymentManifestIntegrity(manifest, {
      keyResolver: () => undefined,
    })).rejects.toThrow(/trusted verification key/u);
  });

  it("uses the named canonicalization profile and rejects sparse arrays", () => {
    expect(CANONICALIZATION_PROFILE).toBe("canonical-json-v1");
    expect(canonicalize({
      z: [{ b: 2, a: { d: false, c: true } }, { nested: { y: 1, x: 0 } }],
      a: { z: [2, 1], b: "x" },
    })).toBe('{"a":{"b":"x","z":[2,1]},"z":[{"a":{"c":true,"d":false},"b":2},{"nested":{"x":0,"y":1}}]}');
    const sparse: unknown[] = [];
    sparse.length = 1;
    expect(() => canonicalize(sparse)).toThrow(/sparse array hole/u);
  });

  it("verifies nested proof-manifest digests during async build integrity checks", async () => {
    const proof = await createProofManifest({
      formatVersion: 1,
      manifestKind: "proof",
      id: "check-proof",
      version: "1.0.0",
      familyId: "example",
      circuitId: "check",
      proofSystem: "example",
      proofFormat: "bytes",
      publicInputEncoding: "canonical-json",
      artifactIds: ["check-zkir"],
    });
    const build = await createBuildManifest({ ...buildInput, proofs: [proof] });
    await assertBuildManifestIntegrity(build);
    await expect(assertBuildManifestIntegrity({
      ...build,
      proofs: [{ ...proof, proofFormat: "tampered" }],
    })).rejects.toThrow(/build\.proofs\[0\]\.manifestDigest/u);
  });

  it("resolves only artifacts matching an intact manifest descriptor", async () => {
    const bytes = new TextEncoder().encode("zk!");
    const artifact = { ...buildInput.artifacts[0], bytes: bytes.byteLength, sha256: await computeSha256Digest(bytes) };
    const build = await createBuildManifest({ ...buildInput, artifacts: [artifact] });
    const resolver: ArtifactResolver = {
      resolveManifest: async () => build,
      resolveArtifact: async () => ({ manifestDigest: build.manifestDigest, artifactId: artifact.id, bytes, sha256: artifact.sha256 }),
    };
    await expect(resolveVerifiedArtifact(resolver, build.manifestDigest, artifact.id)).resolves.toEqual(bytes);
    await expect(resolveVerifiedArtifact(resolver, "sha256:" + "b".repeat(64) as Sha256Digest, artifact.id)).rejects.toThrow(/different manifest/u);
    await expect(resolveVerifiedArtifact({
      ...resolver,
      resolveArtifact: async () => ({ manifestDigest: build.manifestDigest, artifactId: artifact.id, bytes: new TextEncoder().encode("bad"), sha256: artifact.sha256 }),
    }, build.manifestDigest, artifact.id)).rejects.toThrow(/digest/u);
    await expect(resolveVerifiedArtifact({
      ...resolver,
      resolveArtifact: async () => ({ manifestDigest: build.manifestDigest, artifactId: "wrong-id", bytes, sha256: artifact.sha256 }),
    }, build.manifestDigest, artifact.id)).rejects.toThrow(/descriptor/u);
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
