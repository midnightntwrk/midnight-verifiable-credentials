import { defineProofJob } from "@midnight-ntwrk/credential-proofs";

const digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const job = defineProofJob({ formatVersion: 1, id: "browser-job", version: "0.1.0", familyId: "browser.family", circuitId: "browser-circuit", proofManifestDigest: digest, input: null });
if (!job) throw new Error("browser proof import failed");
