import {
  AuthorityBoundVerifierAgent,
  type CanonicalMessage,
  type InjectedCredentialFamilyAdapter,
} from "@midnight-ntwrk/credential-exchange";
import type { AuthorityBoundProofVerificationResultV1 } from "@midnight-ntwrk/credential-proofs/authority-bound-verifier";
import {
  createAuthorityEvidencePolicyV1,
  type DidMethodEvidenceProviderV1,
  type TrustAuthorizationEvidenceProviderV1,
} from "@midnight-ntwrk/credential-proofs/authority-evidence";
import type { Sha256Digest } from "@midnight-ntwrk/credential-proofs";

const message = <TKind extends CanonicalMessage["kind"]>(
  kind: TKind,
  payload: string,
): CanonicalMessage<TKind> => ({
  familyId: "consumer.family",
  familyVersion: "1",
  schemaId: "consumer.schema",
  schemaVersion: "1",
  kind,
  mediaType: "application/consumer+json",
  payload: new TextEncoder().encode(payload),
});

const presentation = message("presentation", "canonical-presentation");
const request = message("presentation-request", "canonical-request");
const roles = ["issuer", "holder", "verifier", "status"] as const;
const actors = roles.map((role, index) => ({
  role,
  did: `did:midnight:testnet:${role}`,
  methodId: `did:midnight:testnet:${role}#key-2`,
  keyFingerprint: `sha256:${String(index + 1).repeat(64)}` as Sha256Digest,
  relationship: role === "status" ? "capabilityInvocation" : "authentication",
  stateVersion: "2",
  trustEpoch: "7",
}));
const policy = createAuthorityEvidencePolicyV1({
  profile: {
    id: "consumer.profile",
    version: "1",
    semantics: {
      did: {
        method: "did:midnight",
        relationship: "authentication",
        network: "midnight:testnet",
        versionEvidence: "ledger-state-v1",
      },
      trust: { scope: "consumer", epochEvidence: "registry-epoch-v1" },
    },
    requirements: {
      providers: [
        { id: "did", role: "did-resolver" },
        { id: "trust", role: "trust-resolver" },
      ],
    },
  },
  composition: {
    formatVersion: 1,
    profile: { id: "consumer.profile", version: "1" },
    providers: [
      {
        requirementId: "did",
        role: "did-resolver",
        providerId: "consumer.did",
        providerVersion: "1",
        instanceId: "did:testnet",
      },
      {
        requirementId: "trust",
        role: "trust-resolver",
        providerId: "consumer.trust",
        providerVersion: "1",
        instanceId: "trust:testnet",
      },
    ],
  },
  actors,
});

const providerRequests: unknown[] = [];
const didProvider: DidMethodEvidenceProviderV1 = {
  resolve: async (providerRequest) => {
    providerRequests.push(providerRequest);
    const { actor, policy: selected } = providerRequest;
    return {
      formatVersion: 1,
      evidenceId: `did:${actor.role}:2`,
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
      lifecycle: { status: "active", activatedAtStateVersion: "2" },
    };
  },
};
const trustProvider: TrustAuthorizationEvidenceProviderV1 = {
  resolve: async (providerRequest) => {
    providerRequests.push(providerRequest);
    const { actor, policy: selected } = providerRequest;
    return {
      formatVersion: 1,
      evidenceId: `trust:${actor.role}:7`,
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
    };
  },
};
const adapter: InjectedCredentialFamilyAdapter = {
  family: {
    id: "consumer.family",
    version: "1",
    schema: { id: "consumer.schema", version: "1" },
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
    verify: () => ({ valid: true, canonicalPresentation: presentation }),
  },
};

const secret = "private-holder-witness";
const result = await new AuthorityBoundVerifierAgent(adapter, {
  policy,
  didProvider,
  trustProvider,
}).verify(
  presentation,
  request,
  {
    proofDigest: `sha256:${"a".repeat(64)}`,
    credentialDigest: `sha256:${"b".repeat(64)}`,
  },
  { privateHolderWitness: secret },
);
if (!result.valid || result.authority?.status !== "valid") {
  throw new Error("packed authority-bound verifier rejected valid evidence");
}
if (
  JSON.stringify(providerRequests).includes(secret) ||
  JSON.stringify(result).includes(secret)
) {
  throw new Error("packed authority-bound verifier exposed a holder witness");
}
const packagedProofAdapterType: AuthorityBoundProofVerificationResultV1 | null =
  null;
void packagedProofAdapterType;
console.log("[credential-authority-consumer] OK");
