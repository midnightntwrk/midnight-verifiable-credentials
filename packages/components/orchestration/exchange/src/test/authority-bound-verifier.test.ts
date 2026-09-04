import type {
  CredentialFamilyProfileV1,
  ResolvedCredentialCompositionV1,
} from "@midnight-ntwrk/credential-model";
import {
  createAuthorityEvidencePolicyV1,
  type DidMethodEvidenceProviderV1,
  type Sha256Digest,
  type TrustAuthorizationEvidenceProviderV1,
} from "@midnight-ntwrk/credential-proofs";
import { describe, expect, it, vi } from "vitest";

import {
  AuthorityBoundVerifierAgent,
  type CanonicalMessage,
  type InjectedCredentialFamilyAdapter,
} from "../index.js";

const message = <TKind extends CanonicalMessage["kind"]>(
  kind: TKind,
  payload: string,
): CanonicalMessage<TKind> => ({
  familyId: "fixture.family",
  familyVersion: "1",
  schemaId: "fixture.schema",
  schemaVersion: "1",
  kind,
  mediaType: "application/fixture+json",
  payload: new TextEncoder().encode(payload),
});

const presentation = message("presentation", "canonical-vp");
const request = message("presentation-request", "canonical-request");

const actors = (["issuer", "holder", "verifier", "status"] as const).map(
  (role, index) => ({
    role,
    did: `did:midnight:testnet:${role}`,
    methodId: `did:midnight:testnet:${role}#key`,
    keyFingerprint: `sha256:${String(index + 1).repeat(64)}` as Sha256Digest,
    relationship: role === "status" ? "capabilityInvocation" : "authentication",
    stateVersion: "9",
    trustEpoch: "44",
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
        instanceId: "did-runtime",
      },
      {
        requirementId: "trust",
        role: "trust-resolver",
        providerId: "trust-provider",
        providerVersion: "1",
        instanceId: "trust-runtime",
      },
    ],
  } as unknown as ResolvedCredentialCompositionV1,
  actors,
});

const didProvider: DidMethodEvidenceProviderV1 = {
  resolve: async ({ actor, policy: selected }) => ({
    formatVersion: 1,
    evidenceId: `did:${actor.role}:9`,
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
    lifecycle: { status: "active", activatedAtStateVersion: "9" },
  }),
};

const trustProvider: TrustAuthorizationEvidenceProviderV1 = {
  resolve: async ({ actor, policy: selected }) => ({
    formatVersion: 1,
    evidenceId: `trust:${actor.role}:44`,
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

const adapter = (): InjectedCredentialFamilyAdapter => ({
  family: {
    id: "fixture.family",
    version: "1",
    schema: { id: "fixture.schema", version: "1" },
  },
  issuance: {
    createOffer: () => message("issuance-offer", "offer"),
    createRequest: () => message("issuance-request", "request"),
    issue: () => message("credential", "credential"),
    accept: (credential) => credential,
  },
  presentation: {
    createRequest: () => request,
    present: () => presentation,
  },
  verification: {
    verify: vi.fn(() => ({ valid: true, canonicalPresentation: presentation })),
  },
});

describe("authority-bound VC/VP runtime verifier", () => {
  it("binds canonical VC/VP bytes and keeps private holder witnesses out of providers and results", async () => {
    const selectedAdapter = adapter();
    const providerRequest = vi.fn(didProvider.resolve);
    const verifier = new AuthorityBoundVerifierAgent(selectedAdapter, {
      policy,
      didProvider: { resolve: providerRequest },
      trustProvider,
    });

    const result = await verifier.verify(
      presentation,
      request,
      {
        proofDigest: `sha256:${"a".repeat(64)}`,
        credentialDigest: `sha256:${"b".repeat(64)}`,
      },
      { privateHolderWitness: "holder-only-secret" },
    );

    expect(result).toMatchObject({
      valid: true,
      authority: {
        status: "valid",
        decisionStatus: "approved",
        accepted: true,
      },
    });
    expect(providerRequest).toHaveBeenCalledTimes(4);
    for (const [providerInput] of providerRequest.mock.calls) {
      expect(providerInput).not.toHaveProperty("privateHolderWitness");
      expect(providerInput.policy).not.toHaveProperty("actors");
    }
    expect(JSON.stringify(result)).not.toContain("holder-only-secret");
    expect(result.authority?.transcript.context.presentationDigest).toMatch(
      /^sha256:[0-9a-f]{64}$/u,
    );
    expect(result.authority?.transcript.context.requestDigest).toMatch(
      /^sha256:[0-9a-f]{64}$/u,
    );
  });

  it("changes the authority transcript when canonical presentation bytes change", async () => {
    const verifier = new AuthorityBoundVerifierAgent(adapter(), {
      policy,
      didProvider,
      trustProvider,
    });
    const first = await verifier.verify(presentation, request, {
      proofDigest: `sha256:${"a".repeat(64)}`,
      credentialDigest: `sha256:${"b".repeat(64)}`,
    });
    const mutatedPresentation = message("presentation", "canonical-vp-mutated");
    const mutatedAdapter = adapter();
    mutatedAdapter.verification.verify = () => ({
      valid: true,
      canonicalPresentation: mutatedPresentation,
    });
    const second = await new AuthorityBoundVerifierAgent(mutatedAdapter, {
      policy,
      didProvider,
      trustProvider,
    }).verify(mutatedPresentation, request, {
      proofDigest: `sha256:${"a".repeat(64)}`,
      credentialDigest: `sha256:${"b".repeat(64)}`,
    });

    expect(first.authority?.transcriptDigest).not.toBe(
      second.authority?.transcriptDigest,
    );
  });

  it("does not let authority evidence upgrade a family verification failure", async () => {
    const selectedAdapter = adapter();
    selectedAdapter.verification.verify = () => ({
      valid: false,
      canonicalPresentation: presentation,
      reason: "proof invalid",
    });
    const providerRequest = vi.fn(didProvider.resolve);
    const result = await new AuthorityBoundVerifierAgent(selectedAdapter, {
      policy,
      didProvider: { resolve: providerRequest },
      trustProvider,
    }).verify(presentation, request, {
      proofDigest: `sha256:${"a".repeat(64)}`,
      credentialDigest: `sha256:${"b".repeat(64)}`,
    });

    expect(result).toMatchObject({ valid: false, authority: null });
    expect(providerRequest).not.toHaveBeenCalled();
  });
});
