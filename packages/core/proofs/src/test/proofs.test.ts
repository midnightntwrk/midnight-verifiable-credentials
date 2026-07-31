import { describe, expect, it } from "vitest";

import {
  type BuildManifest,
  CredentialProofsError,
  defineBuildManifest,
  defineDeploymentManifest,
  defineProofJob,
  defineProofManifest,
  type DeploymentManifest,
  type ProofJob,
} from "../index.js";

const digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
const proof = defineProofManifest({
  formatVersion: 1,
  manifestKind: "proof",
  manifestDigest: digest,
  id: "employee-proof",
  version: "0.1.0",
  familyId: "example.employee",
  circuitId: "age-over-threshold",
  proofSystem: "example-proof-system",
  proofFormat: "example-proof-bytes",
  publicInputEncoding: "canonical-json",
  artifactIds: ["circuit-metadata"],
});
const build: BuildManifest = {
  formatVersion: 1,
  manifestKind: "build",
  manifestDigest: digest,
  productId: "example-product",
  packageName: "@example/employee",
  schemaId: "urn:example:employee",
  contractId: "employee-contract",
  sourceCommit: "0123456789abcdef",
  cleanTree: true,
  toolchain: { generator: "0.1.0" },
  circuits: [{ id: "age-over-threshold", version: "0.1.0", parameters: { threshold: 18 }, artifactIds: ["circuit-metadata"] }],
  proofs: [proof],
  artifacts: [{ id: "circuit-metadata", role: "metadata", mediaType: "application/json", path: "metadata/circuit.json", bytes: 10, sha256: digest }],
  lockfileDigest: digest,
};
const deployment: DeploymentManifest = {
  formatVersion: 1,
  manifestKind: "deployment",
  deploymentManifestDigest: digest,
  buildManifestDigest: digest,
  networkId: "testnet",
  chainId: "chain-1",
  contractAddress: "contract-address",
  deploymentTransaction: "tx-1",
  constructorDigest: digest,
  acceptedReferences: [{ id: "status-policy", digest }],
  governanceOwner: "governance-key",
  supportWindow: { notBefore: "2026-01-01T00:00:00Z" },
  signature: { algorithm: "example-signature", keyId: "key-1", value: "signature" },
};

describe("credential-proofs contracts", () => {
  it("validates and deeply freezes versioned contracts", () => {
    const job: ProofJob<{ threshold: number }> = defineProofJob({
      formatVersion: 1,
      id: "employee-proof-job",
      version: "0.1.0",
      familyId: "example.employee",
      circuitId: "age-over-threshold",
      proofManifestDigest: digest,
      input: { threshold: 18 },
    });
    expect(Object.isFrozen(job)).toBe(true);
    expect(Object.isFrozen(job.input)).toBe(true);
    expect(Object.isFrozen(defineBuildManifest(build).artifacts)).toBe(true);
    expect(Object.isFrozen(defineDeploymentManifest(deployment).signature)).toBe(true);
  });

  it("rejects mutable selectors and unsafe artifact paths", () => {
    expect(() => defineProofJob({ ...({} as ProofJob), formatVersion: 1, id: "job", version: "0.1.0", familyId: "family", circuitId: "circuit", proofManifestDigest: "sha256:bad", input: {} })).toThrow(CredentialProofsError);
    expect(() => defineBuildManifest({ ...build, artifacts: [{ ...build.artifacts[0], path: "../outside" }] })).toThrow(/parent traversal/);
    expect(() => defineDeploymentManifest({ ...deployment, supportWindow: { notBefore: "2026-01-01" } })).toThrow(/timestamp/);
  });
});
