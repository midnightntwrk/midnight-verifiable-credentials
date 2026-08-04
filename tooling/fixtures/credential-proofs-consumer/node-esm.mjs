import { defineProofJob } from "@midnight-ntwrk/credential-proofs";

const digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const job = defineProofJob({
  formatVersion: 1,
  id: "external-job",
  version: "0.1.0",
  familyId: "external.family",
  circuitId: "external-circuit",
  proofManifestDigest: digest,
  input: { value: 1 },
});
if (!Object.isFrozen(job) || job.id !== "external-job") throw new Error("proof job contract failed");
