import { defineProofJob } from "@midnight-ntwrk/credential-proofs";
import {
  computeArtifactAuthorityBindingDigestV1,
  type ArtifactAuthorityPolicyV1,
} from "@midnight-ntwrk/credential-proofs/artifact-authority";

const digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const job = defineProofJob({ formatVersion: 1, id: "browser-job", version: "0.1.0", familyId: "browser.family", circuitId: "browser-circuit", proofManifestDigest: digest, input: null });
if (!job) throw new Error("browser proof import failed");

const policy: ArtifactAuthorityPolicyV1 = {
  formatVersion: 1,
  profile: { id: "browser.profile", version: "1.0.0" },
  circuit: { id: "browser-circuit", version: "1.0.0" },
  artifact: {
    id: "browser-artifact",
    version: "1.0.0",
    role: "metadata",
    mediaType: "application/json",
    buildManifestDigest: digest,
    deploymentManifestDigest: digest,
    bytes: 1,
    sha256: digest,
    signerKeyId: "browser-key",
  },
  deployment: {
    id: "browser-deployment",
    version: "1.0.0",
    identity: "urn:browser:deployment:1",
    networkId: "browser-network",
    chainId: "browser-chain",
    contractAddress: "browser-contract",
  },
  authorityEvidenceDigest: digest,
  freshness: { observedAt: "2026-01-01T00:00:00Z", maxReceiptAgeSeconds: 60 },
  receipt: { id: "browser-receipt", allowedAuthorities: ["local-process"] },
};
if (!(await computeArtifactAuthorityBindingDigestV1(policy)).startsWith("sha256:")) {
  throw new Error("browser artifact authority digest failed");
}
