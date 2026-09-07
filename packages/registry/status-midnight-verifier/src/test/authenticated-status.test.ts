import { readFileSync } from "node:fs";

import type {
  AuthorityEvidencePolicyV1,
  AuthorityVerificationContextV1,
} from "@midnight-ntwrk/credential-proofs";
import {
  computeStatusMerkleLeafV1,
  computeStatusRecordDigestV1,
  computeStatusRegistryRootV1,
  type StatusRegistryBindingV1,
  type StatusRegistryStateV1,
} from "@midnight-ntwrk/credential-status-midnight-contract";
import { describe, expect, it } from "vitest";

import {
  type AuthenticatedRootStatusEvidenceV1,
  type AuthenticatedRootStatusPolicyV1,
  type CanonicalStatusVerificationTranscriptV1,
  computeStatusMerkleProofDigestV1,
  createSha256StatusProofVerifierV1,
  createStatusRootAuthorityVerifierV1,
  type StatusMerkleProofV1,
  type StatusRootAuthorityVerifierV1,
  type StatusRootFreshnessVerifierV1,
  verifyAuthenticatedRootStatusV1,
  verifySameContractStatusV1,
} from "../index.js";

const digest = (character: string) => `sha256:${character.repeat(64)}` as const;
const sharedVector = JSON.parse(readFileSync(new URL("../../test-vectors/authenticated-status-v1.json", import.meta.url), "utf8")) as {
  readonly leaves: readonly ReturnType<typeof digest>[];
  readonly root: ReturnType<typeof digest>;
  readonly subject: ReturnType<typeof digest>;
  readonly proof: StatusMerkleProofV1;
  readonly proofDigest: ReturnType<typeof digest>;
  readonly policy: AuthenticatedRootStatusPolicyV1;
  readonly evidence: AuthenticatedRootStatusEvidenceV1;
  readonly statusStatementDigest: ReturnType<typeof digest>;
  readonly providerOutputs: {
    readonly authorityTranscriptDigest: ReturnType<typeof digest>;
    readonly freshnessAnchorDigest: ReturnType<typeof digest>;
  };
  readonly expectedTranscript: CanonicalStatusVerificationTranscriptV1;
  readonly expectedTranscriptDigest: ReturnType<typeof digest>;
  readonly requiredNegativeMutations: readonly string[];
};
const binding: StatusRegistryBindingV1 = {
  formatVersion: 1,
  network: "midnight:testnet",
  namespace: "issuer:family:1:revoked-set",
  registryId: "registry:1",
  deployment: "contract:1",
};
const activeLeaf = digest("2");
const revokedLeaf = digest("8");
const root = computeStatusRegistryRootV1([activeLeaf, revokedLeaf]);

const state = (revoked: readonly typeof activeLeaf[] = [revokedLeaf]): StatusRegistryStateV1 => ({
  formatVersion: 1,
  binding,
  initialized: true,
  controllerDid: "did:midnight:testnet:status",
  authorityGeneration: 1,
  registryVersion: 2,
  revokedStatusHandleCount: revoked.length,
  revokedRoot: computeStatusRegistryRootV1(revoked),
  acceptedAuthorizationCount: 2,
  auditSequence: 2,
  auditCommitment: digest("a"),
  revokedStatusHandleDigests: revoked,
});

const authorityPolicy = (): AuthorityEvidencePolicyV1 => ({
  formatVersion: 1,
  profile: { id: "ledger-attested-v1", version: "1" },
  did: {
    method: "midnight",
    issuerRelationship: "assertionMethod",
    network: binding.network,
    versionEvidence: "ledger-state",
  },
  trust: { scope: "vc-status", epochEvidence: "ledger-state" },
  providers: {
    did: { requirementId: "did", role: "did-resolver", providerId: "did", providerVersion: "1", instanceId: "did:1" },
    trust: { requirementId: "trust", role: "trust-resolver", providerId: "trust", providerVersion: "1", instanceId: "trust:1" },
  },
  actors: ["issuer", "holder", "verifier", "status"].map((role, index) => ({
    role: role as "issuer" | "holder" | "verifier" | "status",
    did: role === "status" ? "did:midnight:testnet:status" : `did:midnight:testnet:${role}`,
    methodId: role === "status" ? "did:midnight:testnet:status#status-1" : `did:midnight:testnet:${role}#key-1`,
    keyFingerprint: digest(String(index + 1)),
    relationship: role === "status" ? "capabilityInvocation" : "assertionMethod",
    stateVersion: "10",
    trustEpoch: "20",
  })),
});

const acceptedAuthorityPolicyDigest = computeStatusRecordDigestV1(authorityPolicy());

const lowerMembership = {
  formatVersion: 1 as const,
  leaf: activeLeaf,
  leafIndex: 0,
  treeSize: 2,
  siblings: [computeStatusMerkleLeafV1(revokedLeaf)],
};
const upperMembership = {
  formatVersion: 1 as const,
  leaf: revokedLeaf,
  leafIndex: 1,
  treeSize: 2,
  siblings: [computeStatusMerkleLeafV1(activeLeaf)],
};
const nonMembershipProof = {
  formatVersion: 1 as const,
  kind: "non-membership" as const,
  treeSize: 2,
  lower: lowerMembership,
  upper: upperMembership,
};

const statement = {
  formatVersion: 1 as const,
  profile: "ledger-attested-v1" as const,
  privacy: "public" as const,
  binding,
  root,
  registryVersion: 2,
  result: "not-revoked" as const,
  leaf: digest("5"),
  credentialBindingDigest: digest("b"),
  presentationBindingDigest: digest("c"),
  challengeDigest: digest("d"),
  freshnessPolicyDigest: digest("e"),
  observedAt: 100,
  expiresAt: 200,
  authorityPolicyDigest: acceptedAuthorityPolicyDigest,
};
const proofDigest = computeStatusMerkleProofDigestV1(nonMembershipProof);
const requestDigest = computeStatusRecordDigestV1({
  domain: "midnight:vc:authenticated-status-statement:v1",
  ...statement,
  proofDigest,
});
const context: AuthorityVerificationContextV1 = {
  proofDigest,
  credentialDigest: statement.credentialBindingDigest,
  presentationDigest: statement.presentationBindingDigest,
  requestDigest,
};
const evidence = (overrides: Partial<AuthenticatedRootStatusEvidenceV1> = {}): AuthenticatedRootStatusEvidenceV1 => ({
  ...statement,
  proof: nonMembershipProof,
  proofDigest,
  authority: { policy: authorityPolicy(), context },
  freshnessEvidence: { checkpoint: "ledger:100" },
  ...overrides,
});

const rebind = (candidate: AuthenticatedRootStatusEvidenceV1): AuthenticatedRootStatusEvidenceV1 => {
  const nextProofDigest = computeStatusMerkleProofDigestV1(candidate.proof);
  const next = { ...candidate, proofDigest: nextProofDigest };
  const nextRequestDigest = computeStatusRecordDigestV1({
    domain: "midnight:vc:authenticated-status-statement:v1",
    formatVersion: next.formatVersion,
    profile: next.profile,
    privacy: next.privacy,
    binding: next.binding,
    root: next.root,
    registryVersion: next.registryVersion,
    result: next.result,
    leaf: next.leaf,
    credentialBindingDigest: next.credentialBindingDigest,
    presentationBindingDigest: next.presentationBindingDigest,
    challengeDigest: next.challengeDigest,
    freshnessPolicyDigest: next.freshnessPolicyDigest,
    observedAt: next.observedAt,
    expiresAt: next.expiresAt,
    proofDigest: next.proofDigest,
    authorityPolicyDigest: computeStatusRecordDigestV1(next.authority.policy),
  });
  return {
    ...next,
    authority: {
      ...next.authority,
      context: {
        ...next.authority.context,
        proofDigest: next.proofDigest,
        credentialDigest: next.credentialBindingDigest,
        presentationDigest: next.presentationBindingDigest,
        requestDigest: nextRequestDigest,
      },
    },
  };
};

const authorityVerifier = (status: "valid" | "invalid" | "indeterminate" = "valid"): StatusRootAuthorityVerifierV1 => ({
  verify: async ({ evidence: authority }) => ({
    formatVersion: 1,
    status,
    decisionStatus: status === "valid" ? "approved" : "notEvaluated",
    accepted: status === "valid",
    reasonCodes: status === "indeterminate" ? ["status:DID_EVIDENCE_UNAVAILABLE"] : status === "invalid" ? ["status:DID_KEY_MISMATCH"] : [],
    transcript: {
      formatVersion: 1,
      domain: "midnight:vc:authority-evidence:v1",
      profile: authority.policy.profile,
      policy: {
        did: authority.policy.did,
        trust: authority.policy.trust,
        providers: authority.policy.providers,
      },
      context: authority.context,
      actors: [],
    },
    transcriptDigest: digest(status === "valid" ? "9" : "7"),
  }),
});
const freshnessVerifier = (status: "valid" | "invalid" | "indeterminate" = "valid"): StatusRootFreshnessVerifierV1 => ({
  verify: async () => ({ status, anchorDigest: status === "valid" ? digest("6") : null }),
});

const policy = {
  profile: "ledger-attested-v1" as const,
  mode: "external-nonmembership" as const,
  binding,
  acceptedRoot: root,
  acceptedRegistryVersion: 2,
  acceptedAuthority: {
    did: "did:midnight:testnet:status",
    methodId: "did:midnight:testnet:status#status-1",
    keyFingerprint: digest("4"),
    relationship: "capabilityInvocation" as const,
  },
  acceptedAuthorityPolicyDigest,
  acceptedLeaf: statement.leaf,
  acceptedCredentialBindingDigest: statement.credentialBindingDigest,
  acceptedPresentationBindingDigest: statement.presentationBindingDigest,
  acceptedChallengeDigest: statement.challengeDigest,
  freshnessPolicyDigest: digest("e"),
};

const verify = (candidate: AuthenticatedRootStatusEvidenceV1 | null, overrides: Record<string, unknown> = {}) => verifyAuthenticatedRootStatusV1({
  policy,
  evidence: candidate,
  proofVerifier: createSha256StatusProofVerifierV1(),
  authorityVerifier: authorityVerifier(),
  freshnessVerifier: freshnessVerifier(),
  ...overrides,
});

const cloneEvidence = (): AuthenticatedRootStatusEvidenceV1 => globalThis.structuredClone(evidence());

// Shared root-bound vectors are intentionally data-driven so another runtime can
// consume the same statement/proof mutations without redefining semantics.
describe("authenticated-root status proof verification", () => {
  it("keeps the exported cross-runtime vector stable", async () => {
    expect(computeStatusRegistryRootV1(sharedVector.leaves)).toBe(sharedVector.root);
    expect(computeStatusMerkleProofDigestV1(sharedVector.proof)).toBe(sharedVector.proofDigest);
    expect(await createSha256StatusProofVerifierV1().verify({
      root: sharedVector.root,
      leaf: sharedVector.subject,
      result: "not-revoked",
      proof: sharedVector.proof,
    })).toBe(true);
    expect(computeStatusRecordDigestV1({
      domain: "midnight:vc:authenticated-status-statement:v1",
      formatVersion: sharedVector.evidence.formatVersion,
      profile: sharedVector.evidence.profile,
      privacy: sharedVector.evidence.privacy,
      binding: sharedVector.evidence.binding,
      root: sharedVector.evidence.root,
      registryVersion: sharedVector.evidence.registryVersion,
      result: sharedVector.evidence.result,
      leaf: sharedVector.evidence.leaf,
      credentialBindingDigest: sharedVector.evidence.credentialBindingDigest,
      presentationBindingDigest: sharedVector.evidence.presentationBindingDigest,
      challengeDigest: sharedVector.evidence.challengeDigest,
      freshnessPolicyDigest: sharedVector.evidence.freshnessPolicyDigest,
      observedAt: sharedVector.evidence.observedAt,
      expiresAt: sharedVector.evidence.expiresAt,
      proofDigest: sharedVector.evidence.proofDigest,
      authorityPolicyDigest: computeStatusRecordDigestV1(sharedVector.evidence.authority.policy),
    })).toBe(sharedVector.statusStatementDigest);
    expect(sharedVector.evidence.authority.context).toMatchObject({
      requestDigest: sharedVector.statusStatementDigest,
      proofDigest: sharedVector.proofDigest,
      credentialDigest: sharedVector.evidence.credentialBindingDigest,
      presentationDigest: sharedVector.evidence.presentationBindingDigest,
    });
    expect(computeStatusRecordDigestV1(sharedVector.expectedTranscript)).toBe(sharedVector.expectedTranscriptDigest);
    await expect(verifyAuthenticatedRootStatusV1({
      policy: sharedVector.policy,
      evidence: sharedVector.evidence,
      proofVerifier: createSha256StatusProofVerifierV1(),
      authorityVerifier: authorityVerifier(),
      freshnessVerifier: freshnessVerifier(),
    })).resolves.toMatchObject({
      status: "valid",
      reasonCodes: [],
      transcript: sharedVector.expectedTranscript,
      transcriptDigest: sharedVector.expectedTranscriptDigest,
    });
    expect(sharedVector.requiredNegativeMutations).toEqual(expect.arrayContaining([
      "network", "namespace", "registryId", "deployment", "root", "registryVersion", "authority", "leaf", "witness", "freshness", "profile",
    ]));
  });

  it("rejects unknown proof variants and malformed proof subjects", async () => {
    const proofVerifier = createSha256StatusProofVerifierV1();
    expect(await proofVerifier.verify({
      root,
      leaf: statement.leaf,
      result: "not-revoked",
      proof: { ...nonMembershipProof, kind: "bogus" } as unknown as StatusMerkleProofV1,
    })).toBe(false);
    expect(await proofVerifier.verify({
      root,
      leaf: "not-a-digest" as ReturnType<typeof digest>,
      result: "not-revoked",
      proof: nonMembershipProof,
    })).toBe(false);
  });

  it("accepts a cryptographically verified non-membership proof and rejects verified membership as revoked", async () => {
    await expect(verify(evidence())).resolves.toMatchObject({ status: "valid", outcome: { verdict: "valid", state: "active" } });

    const membershipProof = { formatVersion: 1 as const, kind: "membership" as const, membership: lowerMembership };
    const revoked = rebind(evidence({
      result: "revoked",
      leaf: activeLeaf,
      proof: membershipProof,
    }));
    await expect(verify(revoked, {
      policy: { ...policy, acceptedLeaf: activeLeaf },
    })).resolves.toMatchObject({ status: "invalid", reasonCodes: ["STATUS_REVOKED"], outcome: { verdict: "invalid", code: "revoked" } });
  });

  it.each([
    {
      label: "empty",
      leaf: digest("5"),
      leaves: [],
      proof: { formatVersion: 1 as const, kind: "non-membership" as const, treeSize: 0, lower: null, upper: null },
    },
    {
      label: "left boundary",
      leaf: digest("1"),
      leaves: [activeLeaf],
      proof: { formatVersion: 1 as const, kind: "non-membership" as const, treeSize: 1, lower: null, upper: { formatVersion: 1 as const, leaf: activeLeaf, leafIndex: 0, treeSize: 1, siblings: [] } },
    },
    {
      label: "right boundary",
      leaf: digest("f"),
      leaves: [revokedLeaf],
      proof: { formatVersion: 1 as const, kind: "non-membership" as const, treeSize: 1, lower: { formatVersion: 1 as const, leaf: revokedLeaf, leafIndex: 0, treeSize: 1, siblings: [] }, upper: null },
    },
  ])("accepts $label authenticated non-membership", async ({ leaf, leaves, proof }) => {
    const acceptedRoot = computeStatusRegistryRootV1(leaves);
    const candidate = rebind(evidence({ root: acceptedRoot, leaf, proof }));
    await expect(verifyAuthenticatedRootStatusV1({
      policy: { ...policy, acceptedRoot, acceptedLeaf: leaf },
      evidence: candidate,
      proofVerifier: createSha256StatusProofVerifierV1(),
      authorityVerifier: authorityVerifier(),
      freshnessVerifier: freshnessVerifier(),
    })).resolves.toMatchObject({ status: "valid" });
  });

  it.each([
    ["profile", "offchain-public-v1", "PROFILE_MISMATCH"],
    ["root", digest("f"), "ROOT_MISMATCH"],
    ["registryVersion", 3, "REGISTRY_VERSION_MISMATCH"],
    ["leaf", digest("1"), "STATUS_SUBJECT_MISMATCH"],
    ["proofDigest", digest("0"), "PROOF_DIGEST_MISMATCH"],
    ["freshnessPolicyDigest", digest("0"), "FRESHNESS_POLICY_MISMATCH"],
  ] as const)("rejects a mutated %s binding", async (field, value, reason) => {
    const candidate = cloneEvidence() as unknown as Record<string, unknown>;
    candidate[field] = value;
    await expect(verify(candidate as unknown as AuthenticatedRootStatusEvidenceV1)).resolves.toMatchObject({ status: "invalid", reasonCodes: [reason] });
  });

  it.each([
    ["network", "midnight:mainnet", "NETWORK_MISMATCH"],
    ["namespace", "attacker", "NAMESPACE_MISMATCH"],
    ["registryId", "registry:attacker", "REGISTRY_MISMATCH"],
    ["deployment", "contract:attacker", "DEPLOYMENT_MISMATCH"],
  ] as const)("rejects wrong %s", async (field, value, reason) => {
    const candidate = cloneEvidence();
    (candidate.binding as unknown as Record<string, unknown>)[field] = value;
    await expect(verify(candidate)).resolves.toMatchObject({ status: "invalid", reasonCodes: [reason] });
  });

  it("binds the proof subject and request digests to verifier-trusted policy inputs", async () => {
    for (const [candidate, reason] of [
      [rebind(evidence({ leaf: digest("6") })), "STATUS_SUBJECT_MISMATCH"],
      [rebind(evidence({ credentialBindingDigest: digest("1") })), "CREDENTIAL_BINDING_MISMATCH"],
      [rebind(evidence({ presentationBindingDigest: digest("1") })), "PRESENTATION_BINDING_MISMATCH"],
      [rebind(evidence({ challengeDigest: digest("1") })), "CHALLENGE_MISMATCH"],
    ] as const) {
      await expect(verify(candidate)).resolves.toMatchObject({
        status: "invalid",
        reasonCodes: [reason],
        outcome: { verdict: "invalid", code: "statusRequestMismatch" },
      });
    }
  });

  it("adapts #494 DID and trust evidence providers without importing mutation authority", async () => {
    const verifier = createStatusRootAuthorityVerifierV1({
      didProvider: {
        resolve: async ({ actor, policy: requestedPolicy }) => ({
          formatVersion: 1,
          evidenceId: `did:${actor.role}`,
          authenticated: true,
          observedAt: "2026-09-02T10:00:00.000Z",
          did: actor.did,
          method: requestedPolicy.did.method,
          methodId: actor.methodId,
          keyFingerprint: actor.keyFingerprint,
          relationships: [actor.relationship],
          network: requestedPolicy.did.network,
          stateVersion: actor.stateVersion,
          versionEvidence: requestedPolicy.did.versionEvidence,
          lifecycle: { status: "active", activatedAtStateVersion: actor.stateVersion },
        }),
      },
      trustProvider: {
        resolve: async ({ actor, policy: requestedPolicy }) => ({
          formatVersion: 1,
          evidenceId: `trust:${actor.role}`,
          authenticated: true,
          observedAt: "2026-09-02T10:00:00.000Z",
          subjectDid: actor.did,
          methodId: actor.methodId,
          keyFingerprint: actor.keyFingerprint,
          network: requestedPolicy.did.network,
          scope: requestedPolicy.trust.scope,
          epoch: actor.trustEpoch,
          epochEvidence: requestedPolicy.trust.epochEvidence,
          status: "active",
        }),
      },
    });
    await expect(verifier.verify({ evidence: evidence().authority })).resolves.toMatchObject({
      accepted: true,
      status: "valid",
      reasonCodes: [],
    });
  });

  it("fails closed for omitted, unavailable, stale, forged, malformed, and wrong-authority evidence", async () => {
    await expect(verify(null)).resolves.toMatchObject({ status: "indeterminate", reasonCodes: ["STATUS_PROOF_UNAVAILABLE"] });
    await expect(verify(evidence(), { authorityVerifier: authorityVerifier("indeterminate") })).resolves.toMatchObject({ status: "indeterminate", reasonCodes: ["ROOT_AUTHORITY_UNAVAILABLE"] });
    await expect(verify(evidence(), { freshnessVerifier: freshnessVerifier("indeterminate") })).resolves.toMatchObject({ status: "indeterminate", reasonCodes: ["FRESHNESS_EVIDENCE_UNAVAILABLE"] });
    await expect(verify(evidence(), { freshnessVerifier: freshnessVerifier("invalid") })).resolves.toMatchObject({ status: "invalid", reasonCodes: ["STALE_ROOT"] });
    await expect(verify(evidence(), { authorityVerifier: authorityVerifier("invalid") })).resolves.toMatchObject({ status: "invalid", reasonCodes: ["ROOT_AUTHORITY_INVALID"], outcome: { verdict: "invalid", code: "authorityMismatch" } });

    const baseAuthority = cloneEvidence().authority;
    const wrongAuthority = evidence({
      authority: {
        ...baseAuthority,
        policy: {
          ...baseAuthority.policy,
          actors: baseAuthority.policy.actors.map((actor) => actor.role === "status" ? { ...actor, did: "did:midnight:testnet:attacker" } : actor),
        },
      },
    });
    await expect(verify(wrongAuthority)).resolves.toMatchObject({ status: "invalid", reasonCodes: ["ROOT_AUTHORITY_POLICY_MISMATCH"] });
    await expect(verifyAuthenticatedRootStatusV1({
      policy: {
        ...policy,
        acceptedAuthority: { ...policy.acceptedAuthority, did: "did:midnight:testnet:attacker" },
      },
      evidence: evidence(),
      proofVerifier: createSha256StatusProofVerifierV1(),
      authorityVerifier: authorityVerifier(),
      freshnessVerifier: freshnessVerifier(),
    })).resolves.toMatchObject({ status: "invalid", reasonCodes: ["ROOT_AUTHORITY_MISMATCH"] });

    const downgradedAuthorityPolicy = cloneEvidence();
    (downgradedAuthorityPolicy.authority.policy.profile as { version: string }).version = "downgraded";
    await expect(verify(downgradedAuthorityPolicy)).resolves.toMatchObject({
      status: "invalid",
      reasonCodes: ["ROOT_AUTHORITY_POLICY_MISMATCH"],
    });

    const forged = rebind(evidence({ proof: { ...nonMembershipProof, upper: { ...upperMembership, siblings: [digest("0")] } } }));
    await expect(verify(forged)).resolves.toMatchObject({ status: "invalid", reasonCodes: ["STATUS_PROOF_INVALID"] });

    const malformed = rebind(evidence({ proof: { ...nonMembershipProof, lower: { ...lowerMembership, leafIndex: -1 } } }));
    await expect(verify(malformed)).resolves.toMatchObject({ status: "invalid", reasonCodes: ["STATUS_PROOF_INVALID"] });
  });
});

describe("same-contract status verification and privacy", () => {
  it("uses one exact contract state for active and revoked results", () => {
    expect(verifySameContractStatusV1({
      profile: "ledger-local-v1",
      binding,
      state: state(),
      statusHandleDigest: activeLeaf,
      expectedAuthorityDid: "did:midnight:testnet:status",
      privacy: { mode: "public" },
      freshnessPolicyDigest: digest("e"),
    })).toMatchObject({ status: "valid", outcome: { verdict: "valid", state: "active" }, transcript: { root: computeStatusRegistryRootV1([revokedLeaf]), registryVersion: 2 } });
    expect(verifySameContractStatusV1({
      profile: "ledger-local-v1",
      binding,
      state: state([activeLeaf]),
      statusHandleDigest: activeLeaf,
      expectedAuthorityDid: "did:midnight:testnet:status",
      privacy: { mode: "public" },
      freshnessPolicyDigest: digest("e"),
    })).toMatchObject({ status: "invalid", reasonCodes: ["STATUS_REVOKED"] });
  });

  it("binds private status to challenge scope without exposing stable holder material", () => {
    const result = verifySameContractStatusV1({
      profile: "ledger-local-v1",
      binding,
      state: state(),
      statusHandleDigest: activeLeaf,
      expectedAuthorityDid: "did:midnight:testnet:status",
      privacy: {
        mode: "private",
        challengeDigest: digest("d"),
        credentialBindingDigest: digest("b"),
        presentationBindingDigest: digest("c"),
      },
      freshnessPolicyDigest: digest("e"),
    });
    expect(result.status).toBe("valid");
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(activeLeaf);
    expect(serialized).not.toMatch(/statusHandle|holderDid|credentialRoot|commitment/iu);
  });

  it("maps unavailable state and request mismatches onto canonical outcomes", async () => {
    await expect(verify(evidence({ root: digest("f") }))).resolves.toMatchObject({
      status: "invalid",
      reasonCodes: ["ROOT_MISMATCH"],
      outcome: { verdict: "invalid", code: "statusRequestMismatch" },
    });
    expect(verifySameContractStatusV1({
      profile: "ledger-local-v1",
      binding,
      state: { ...state(), initialized: false },
      statusHandleDigest: activeLeaf,
      expectedAuthorityDid: "did:midnight:testnet:status",
      privacy: { mode: "public" },
      freshnessPolicyDigest: digest("e"),
    })).toMatchObject({
      status: "indeterminate",
      reasonCodes: ["STATUS_STATE_UNAVAILABLE"],
      outcome: { verdict: "indeterminate", code: "statusStateUnavailable" },
    });
  });

  it("rejects stale/tampered state, wrong deployment/authority/profile, and private external proofs", async () => {
    const tampered = state();
    const invalidState = { ...tampered, revokedRoot: digest("0") };
    expect(verifySameContractStatusV1({ profile: "ledger-local-v1", binding, state: invalidState, statusHandleDigest: activeLeaf, expectedAuthorityDid: "did:midnight:testnet:status", privacy: { mode: "public" }, freshnessPolicyDigest: digest("e") })).toMatchObject({ status: "invalid", reasonCodes: ["ROOT_MISMATCH"] });
    expect(verifySameContractStatusV1({ profile: "ledger-attested-v1", binding, state: state(), statusHandleDigest: activeLeaf, expectedAuthorityDid: "did:midnight:testnet:status", privacy: { mode: "public" }, freshnessPolicyDigest: digest("e") })).toMatchObject({ status: "invalid", reasonCodes: ["PROFILE_MISMATCH"] });
    const duplicateState = { ...state([activeLeaf]), revokedStatusHandleCount: 2, revokedStatusHandleDigests: [activeLeaf, activeLeaf] };
    expect(() => verifySameContractStatusV1({ profile: "ledger-local-v1", binding, state: duplicateState, statusHandleDigest: activeLeaf, expectedAuthorityDid: "did:midnight:testnet:status", privacy: { mode: "public" }, freshnessPolicyDigest: digest("e") })).not.toThrow();
    expect(verifySameContractStatusV1({ profile: "ledger-local-v1", binding, state: duplicateState, statusHandleDigest: activeLeaf, expectedAuthorityDid: "did:midnight:testnet:status", privacy: { mode: "public" }, freshnessPolicyDigest: digest("e") })).toMatchObject({ status: "invalid", reasonCodes: ["MALFORMED_STATUS_EVIDENCE"] });

    const privateEvidence = rebind(evidence({ privacy: "private" }));
    const unavailable = await verify(privateEvidence);
    expect(unavailable).toMatchObject({
      status: "indeterminate",
      reasonCodes: ["PRIVATE_STATUS_PROOF_UNAVAILABLE"],
      outcome: { verdict: "indeterminate", code: "statusProofUnavailable" },
      transcript: { privacy: "private", result: "not-evaluated" },
    });
    expect(JSON.stringify(unavailable)).not.toContain(privateEvidence.leaf);
    expect(JSON.stringify(unavailable)).not.toContain(privateEvidence.proofDigest);
    expect({
      status: unavailable.status,
      reasons: unavailable.reasonCodes,
      outcome: unavailable.outcome,
      transcript: unavailable.transcript,
    }).toMatchInlineSnapshot(`
      {
        "outcome": {
          "code": "statusProofUnavailable",
          "verdict": "indeterminate",
        },
        "reasons": [
          "PRIVATE_STATUS_PROOF_UNAVAILABLE",
        ],
        "status": "indeterminate",
        "transcript": {
          "authorityPolicyDigest": "sha256:54c1a96d08b73c2691f19f3b3af04f40b550342633319dbebafaa55717e841ae",
          "authorityTranscriptDigest": null,
          "binding": {
            "deployment": "contract:1",
            "formatVersion": 1,
            "namespace": "issuer:family:1:revoked-set",
            "network": "midnight:testnet",
            "registryId": "registry:1",
          },
          "domain": "midnight:vc:authenticated-status-verification:v1",
          "formatVersion": 1,
          "freshnessAnchorDigest": null,
          "freshnessPolicyDigest": "sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          "mode": "external-nonmembership",
          "privacy": "private",
          "profile": "ledger-attested-v1",
          "proofDigest": "sha256:84251113cd996572479cf1020905eac3c1aebccf91b4a99010106011c5ae65dd",
          "registryVersion": 2,
          "result": "not-evaluated",
          "root": "sha256:30935dd771a07e15dcef3b74a1207e4a865e54afdb9f24cdfd7d9eec71a98354",
          "subjectDigest": "sha256:d148082b224cd580e22a6f7d267b2f67dab903a8023c555ce6504bb87a1fe1c5",
        },
      }
    `);
  });

  it("uses an injected private root-bound proof adapter without retaining handle or witness correlators", async () => {
    const privateEvidence = rebind(evidence({ privacy: "private" }));
    const verified = await verify(privateEvidence, {
      privateProofVerifier: { verify: async () => true },
    });

    expect(verified).toMatchObject({
      status: "valid",
      reasonCodes: [],
      outcome: { verdict: "valid", state: "active" },
      transcript: { privacy: "private", result: "not-revoked" },
    });
    expect(verified.transcript.proofDigest).not.toBe(privateEvidence.proofDigest);
    const retained = JSON.stringify(verified);
    expect(retained).not.toContain(privateEvidence.leaf);
    expect(retained).not.toContain(privateEvidence.proofDigest);
    expect(retained).not.toMatch(/statusHandle|credentialRoot|opening|siblings|leafIndex/iu);
    expect({
      status: verified.status,
      reasons: verified.reasonCodes,
      transcriptKeys: Object.keys(verified.transcript).sort(),
      outcome: verified.outcome,
    }).toMatchInlineSnapshot(`
      {
        "outcome": {
          "evidence": {
            "transcriptDigest": "sha256:172f7b98564aa514cdffbff1ee04f39f8aa9a8cd1b82d8290d0849b9494bd89d",
          },
          "state": "active",
          "verdict": "valid",
        },
        "reasons": [],
        "status": "valid",
        "transcriptKeys": [
          "authorityPolicyDigest",
          "authorityTranscriptDigest",
          "binding",
          "domain",
          "formatVersion",
          "freshnessAnchorDigest",
          "freshnessPolicyDigest",
          "mode",
          "privacy",
          "profile",
          "proofDigest",
          "registryVersion",
          "result",
          "root",
          "subjectDigest",
        ],
      }
    `);
  });
});
