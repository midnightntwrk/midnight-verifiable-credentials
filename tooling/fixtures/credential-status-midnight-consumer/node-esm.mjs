import { readFileSync } from "node:fs";

import {
  computeStatusRecordDigestV1,
  emptyStatusRegistryRootV1,
  InMemoryStatusRegistryContractV1,
} from "@midnight-ntwrk/credential-status-midnight-contract";
import {
  createSha256StatusProofVerifierV1,
  deriveStatusHandleDigestV1,
  verifyAuthenticatedRootStatusV1,
} from "@midnight-ntwrk/credential-status-midnight-verifier";
import { createStatusRegistryAuthorityGateV1 } from "@midnight-ntwrk/credential-status-midnight-authority";

if (typeof InMemoryStatusRegistryContractV1 !== "function") throw new Error("contract export missing");
if (!deriveStatusHandleDigestV1(new Uint8Array([1])).startsWith("sha256:")) throw new Error("verifier export missing");
const proofVerifier = createSha256StatusProofVerifierV1();
const emptyProofAccepted = await proofVerifier.verify({
  root: emptyStatusRegistryRootV1,
  leaf: `sha256:${"1".repeat(64)}`,
  result: "not-revoked",
  proof: { formatVersion: 1, kind: "non-membership", treeSize: 0, lower: null, upper: null },
});
if (!emptyProofAccepted) throw new Error("authenticated status proof export missing");
const vector = JSON.parse(readFileSync(new URL(import.meta.resolve("@midnight-ntwrk/credential-status-midnight-verifier/test-vectors/authenticated-status-v1.json")), "utf8"));
if (!await proofVerifier.verify({ root: vector.root, leaf: vector.subject, result: "not-revoked", proof: vector.proof })) {
  throw new Error("packed authenticated status vector failed");
}
const verified = await verifyAuthenticatedRootStatusV1({
  policy: vector.policy,
  evidence: vector.evidence,
  proofVerifier,
  authorityVerifier: {
    verify: async () => ({
      formatVersion: 1,
      status: "valid",
      decisionStatus: "approved",
      accepted: true,
      reasonCodes: [],
      transcript: {},
      transcriptDigest: vector.providerOutputs.authorityTranscriptDigest,
    }),
  },
  freshnessVerifier: {
    verify: async () => ({
      status: "valid",
      anchorDigest: vector.providerOutputs.freshnessAnchorDigest,
    }),
  },
});
if (
  verified.transcriptDigest !== vector.expectedTranscriptDigest ||
  computeStatusRecordDigestV1(vector.expectedTranscript) !== vector.expectedTranscriptDigest
) {
  throw new Error("packed authenticated status canonical digest drifted");
}
if (typeof createStatusRegistryAuthorityGateV1 !== "function") throw new Error("authority export missing");
console.log("status-midnight clean Node consumer passed");
