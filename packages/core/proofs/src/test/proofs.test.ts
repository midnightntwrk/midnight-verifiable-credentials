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
  circuits: [{ id: "age-over-threshold", version: "0.1.0", parameters: { threshold: 18 }, metrics: { k: 12, rows: 2048 }, artifactIds: ["circuit-metadata"] }],
  proofs: [proof],
  artifacts: [{ id: "circuit-metadata", version: "0.1.0", role: "metadata", mediaType: "application/json", path: "metadata/circuit.json", bytes: 10, sha256: digest }],
  lockfileDigest: digest,
};
const deployment: DeploymentManifest = {
  formatVersion: 1,
  manifestKind: "deployment",
  deploymentManifestDigest: digest,
  deploymentId: "employee-verifier@1",
  deploymentVersion: "1.0.0",
  deploymentIdentity: "urn:example:employee-verifier:1",
  profile: { id: "employee.public", version: "1.0.0" },
  buildManifestDigest: digest,
  networkId: "testnet",
  chainId: "chain-1",
  contractAddress: "contract-address",
  deploymentTransaction: "tx-1",
  constructorDigest: digest,
  acceptedReferences: [{ id: "status-policy", digest }],
  governanceOwner: "governance-key",
  supportWindow: { notBefore: "2026-01-01T00:00:00Z" },
  signature: { algorithm: "Ed25519", keyId: "key-1", value: "A".repeat(86) },
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

  it("rejects duplicate circuit artifact references and invalid ZK artifact layouts", () => {
    expect(() => defineBuildManifest({
      ...build,
      circuits: [{ ...build.circuits[0], artifactIds: ["circuit-metadata", "circuit-metadata"] }],
    })).toThrow(/duplicates/u);
    expect(() => defineBuildManifest({
      ...build,
      artifacts: [{ ...build.artifacts[0], role: "circuit", path: "metadata/circuit.bzkir" }],
    })).toThrow(/circuit artifact layout/u);
    expect(() => defineBuildManifest({
      ...build,
      artifacts: [{ ...build.artifacts[0], role: "prover-key", path: "zkir/circuit.bzkir" }],
    })).toThrow(/prover-key artifact layout/u);
    expect(() => defineBuildManifest({
      ...build,
      artifacts: [{ ...build.artifacts[0], role: "verifier-key", path: "keys/circuit.prover" }],
    })).toThrow(/verifier-key artifact layout/u);
  });

  it("rejects non-canonical parameters, timestamps, windows, and circuit references", () => {
    expect(() => defineBuildManifest({
      ...build,
      circuits: [{ ...build.circuits[0], parameters: { threshold: Number.NaN } }],
    })).toThrow(/finite/);
    expect(() => defineDeploymentManifest({
      ...deployment,
      supportWindow: { notBefore: "2026-02-31T00:00:00Z" },
    })).toThrow(/timestamp/);
    expect(() => defineDeploymentManifest({
      ...deployment,
      supportWindow: {
        notBefore: "2026-02-02T00:00:00Z",
        notAfter: "2026-02-01T00:00:00Z",
      },
    })).toThrow(/notAfter/);
    expect(() => defineBuildManifest({
      ...build,
      proofs: [{ ...proof, circuitId: "undeclared-circuit" }],
    })).toThrow(/declared circuit/);
  });
});
