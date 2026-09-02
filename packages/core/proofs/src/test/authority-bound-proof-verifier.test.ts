import type {
  CredentialFamilyProfileV1,
  ResolvedCredentialCompositionV1,
} from "@midnight-ntwrk/credential-model";
import { describe, expect, it, vi } from "vitest";

import {
  createAuthorityEvidencePolicyV1,
  type DidMethodEvidenceProviderV1,
  type ProofJob,
  type ProofResult,
  type ProofVerifier,
  type Sha256Digest,
  type TrustAuthorizationEvidenceProviderV1,
  verifyProofWithAuthorityV1,
} from "../index.js";

const actors = (["issuer", "holder", "verifier", "status"] as const).map(
  (role, index) => ({
    role,
    did: `did:midnight:testnet:${role}`,
    methodId: `did:midnight:testnet:${role}#key-1`,
    keyFingerprint: `sha256:${String(index + 1).repeat(64)}` as Sha256Digest,
    relationship: role === "status" ? "capabilityInvocation" : "authentication",
    stateVersion: "7",
    trustEpoch: "42",
  }),
);

const policy = createAuthorityEvidencePolicyV1({
  profile: {
    id: "fixture.profile",
    version: "1",
    semantics: {
      did: {
        method: "did:midnight",
        relationship: "authentication",
        network: "midnight:testnet",
        versionEvidence: "ledger-version-v1",
      },
      trust: { scope: "fixture", epochEvidence: "epoch-v1" },
    },
    requirements: {
      providers: [
        { id: "did", role: "did-resolver" },
        { id: "trust", role: "trust-resolver" },
      ],
    },
  } as unknown as CredentialFamilyProfileV1,
  composition: {
    formatVersion: 1,
    profile: { id: "fixture.profile", version: "1" },
    providers: [
      {
        requirementId: "did",
        role: "did-resolver",
        providerId: "did-provider",
        providerVersion: "1",
        instanceId: "did-1",
      },
      {
        requirementId: "trust",
        role: "trust-resolver",
        providerId: "trust-provider",
        providerVersion: "1",
        instanceId: "trust-1",
      },
    ],
  } as unknown as ResolvedCredentialCompositionV1,
  actors,
});

const didProvider: DidMethodEvidenceProviderV1 = {
  resolve: async ({ actor, policy: selected }) => ({
    formatVersion: 1,
    evidenceId: `did:${actor.role}:7`,
    authenticated: true,
    observedAt: "2026-09-02T00:00:00.000Z",
    did: actor.did,
    method: selected.did.method,
    methodId: actor.methodId,
    keyFingerprint: actor.keyFingerprint,
    relationships: [actor.relationship],
    network: selected.did.network,
    stateVersion: actor.stateVersion,
    versionEvidence: selected.did.versionEvidence,
    lifecycle: { status: "active", activatedAtStateVersion: "7" },
  }),
};

const trustProvider: TrustAuthorizationEvidenceProviderV1 = {
  resolve: async ({ actor, policy: selected }) => ({
    formatVersion: 1,
    evidenceId: `trust:${actor.role}:42`,
    authenticated: true,
    observedAt: "2026-09-02T00:00:00.000Z",
    subjectDid: actor.did,
    methodId: actor.methodId,
    keyFingerprint: actor.keyFingerprint,
    network: selected.did.network,
    scope: selected.trust.scope,
    epoch: actor.trustEpoch,
    epochEvidence: selected.trust.epochEvidence,
    status: "active",
  }),
};

const job: ProofJob = {
  formatVersion: 1,
  id: "proof-job",
  version: "1",
  familyId: "fixture.family",
  circuitId: "verify",
  proofManifestDigest: `sha256:${"1".repeat(64)}`,
  input: { privateWitness: "must-not-be-retained" },
};
const proof: ProofResult = {
  formatVersion: 1,
  jobId: "proof-job",
  proofManifestDigest: job.proofManifestDigest,
  proof: new Uint8Array([1, 2, 3]),
};
const context = {
  proofDigest: `sha256:${"2".repeat(64)}` as const,
  credentialDigest: `sha256:${"3".repeat(64)}` as const,
  presentationDigest: `sha256:${"4".repeat(64)}` as const,
  requestDigest: `sha256:${"5".repeat(64)}` as const,
};

describe("authority-bound proof verifier", () => {
  it("approves only after proof and authority evidence both verify", async () => {
    const verifier: ProofVerifier = {
      verify: vi.fn(async () => ({
        formatVersion: 1 as const,
        jobId: job.id,
        proofManifestDigest: job.proofManifestDigest,
        valid: true,
      })),
    };

    const result = await verifyProofWithAuthorityV1({
      verifier,
      job,
      result: proof,
      authority: { policy, context, didProvider, trustProvider },
    });

    expect(result).toMatchObject({
      formatVersion: 1,
      status: "valid",
      decisionStatus: "approved",
      accepted: true,
      proof: { valid: true },
      authority: { status: "valid", accepted: true },
    });
    expect(JSON.stringify(result)).not.toContain("must-not-be-retained");
    expect(JSON.stringify(result)).not.toContain("AQID");
  });

  it("does not query authority providers when the proof is invalid", async () => {
    const unavailableDid = vi.fn(didProvider.resolve);
    const verifier: ProofVerifier = {
      verify: async () => ({
        formatVersion: 1,
        jobId: job.id,
        proofManifestDigest: job.proofManifestDigest,
        valid: false,
        reason: "invalid proof",
      }),
    };

    const result = await verifyProofWithAuthorityV1({
      verifier,
      job,
      result: proof,
      authority: {
        policy,
        context,
        didProvider: { resolve: unavailableDid },
        trustProvider,
      },
    });

    expect(result).toMatchObject({
      status: "invalid",
      decisionStatus: "notEvaluated",
      accepted: false,
      reasonCodes: ["PROOF_INVALID"],
      authority: null,
    });
    expect(unavailableDid).not.toHaveBeenCalled();
  });
});
