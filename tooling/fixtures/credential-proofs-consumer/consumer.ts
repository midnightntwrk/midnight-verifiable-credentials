import { defineBuildManifest, type ProofProvider } from "@midnight-ntwrk/credential-proofs";

const digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
const manifest = defineBuildManifest({
  formatVersion: 1,
  manifestKind: "build",
  manifestDigest: digest,
  productId: "external-product",
  packageName: "@external/family",
  schemaId: "urn:external:family",
  contractId: "external-contract",
  sourceCommit: "external-commit",
  cleanTree: true,
  toolchain: { generator: "0.1.0" },
  circuits: [],
  proofs: [],
  artifacts: [],
  lockfileDigest: digest,
});
const provider: ProofProvider = { prove: async (job) => ({ formatVersion: 1, jobId: job.id, proofManifestDigest: job.proofManifestDigest, proof: new Uint8Array() }) };
void provider;
void manifest;
