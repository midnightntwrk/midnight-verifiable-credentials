import {
  compareArtifactAuthorityParityV1,
  computeArtifactAuthorityBindingDigestV1,
  createArtifactAuthorityTranscriptV1,
  type ArtifactAuthorityPolicyV1,
  type ArtifactAuthorityVerificationResultV1,
} from "@midnight-ntwrk/credential-proofs/artifact-authority";

const digest = (value: string) => `sha256:${value.repeat(64)}` as const;
const policy: ArtifactAuthorityPolicyV1 = {
  formatVersion: 1,
  profile: { id: "consumer.profile", version: "1.0.0" },
  circuit: { id: "consumer.verify", version: "1.0.0" },
  artifact: {
    id: "consumer-verifier-key",
    version: "1.0.0",
    role: "verifier-key",
    mediaType: "application/vnd.consumer.verifier-key",
    buildManifestDigest: digest("a"),
    deploymentManifestDigest: digest("b"),
    bytes: 4096,
    sha256: digest("c"),
    signerKeyId: "consumer-release-key-1",
  },
  deployment: {
    id: "consumer-verifier@1",
    version: "1.0.0",
    identity: "urn:consumer:verifier:1",
    networkId: "testnet",
    chainId: "chain-1",
    contractAddress: "contract-1",
  },
  authorityEvidenceDigest: digest("d"),
  freshness: { observedAt: "2026-09-02T00:00:00Z", maxReceiptAgeSeconds: 300 },
  receipt: { id: "receipt-1", allowedAuthorities: ["local-process", "ledger-local"] },
};
const bindingDigest = await computeArtifactAuthorityBindingDigestV1(policy);
const local: ArtifactAuthorityVerificationResultV1 = {
  formatVersion: 1,
  status: "valid",
  classification: "valid",
  accepted: true,
  authority: "local-process",
  transcript: createArtifactAuthorityTranscriptV1(policy),
  bindingDigest,
  reasonCodes: [],
};
const parity = compareArtifactAuthorityParityV1([
  { pathId: "local", result: local },
  { pathId: "ledger", result: { ...local, authority: "ledger-local" } },
]);
if (
  parity.status !== "equivalent" ||
  parity.paths[0].authority !== "local-process" ||
  parity.paths[1].authority !== "ledger-local"
) {
  throw new Error("packed artifact authority parity contract drifted");
}
console.log("[credential-artifact-authority-consumer] OK");
