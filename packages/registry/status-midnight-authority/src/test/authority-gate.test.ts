import type {
  AuthorityActorKeyRequirementV1,
  AuthorityEvidencePolicyV1,
  DidMethodEvidenceProviderV1,
  DidMethodEvidenceV1,
  Sha256Digest,
  TrustAuthorizationEvidenceProviderV1,
  TrustAuthorizationEvidenceV1,
} from "@midnight-ntwrk/credential-proofs";
import {
  computeStatusRegistryAuthorizationDigestV1,
  InMemoryStatusRegistryContractV1,
  type StatusRegistryAuthorizationRequestV1,
  type StatusRegistryBindingV1,
} from "@midnight-ntwrk/credential-status-midnight-contract";
import { describe, expect, it } from "vitest";

import {
  attachStatusAuthoritySignatureV1,
  bindStatusAuthorityEvidenceV1,
  createStatusRegistryAuthorityGateV1,
  type StatusAuthoritySignatureV1,
  type StatusDelegateGrantEvidenceV1,
} from "../index.js";

const digest = (character: string) => `sha256:${character.repeat(64)}` as Sha256Digest;
const binding: StatusRegistryBindingV1 = {
  formatVersion: 1,
  network: "midnight:testnet",
  namespace: "issuer:family:1:revoked-set",
  registryId: "registry:fixture:1",
  deployment: "contract:fixture@1",
};
const controller = {
  did: "did:midnight:testnet:controller",
  methodId: "did:midnight:testnet:controller#invoke-2",
  keyFingerprint: digest("1"),
  relationship: "capabilityInvocation" as const,
};
const delegate = {
  did: "did:midnight:testnet:delegate",
  methodId: "did:midnight:testnet:delegate#invoke-2",
  keyFingerprint: digest("2"),
  relationship: "capabilityInvocation" as const,
};

const actor = (role: AuthorityActorKeyRequirementV1["role"], subject = role === "status" ? controller : {
  did: `did:midnight:testnet:${role}`,
  methodId: `did:midnight:testnet:${role}#key-2`,
  keyFingerprint: digest(role === "issuer" ? "3" : role === "holder" ? "4" : "5"),
  relationship: role === "issuer" ? "assertionMethod" as const : "authentication" as const,
}): AuthorityActorKeyRequirementV1 => ({
  role,
  ...subject,
  stateVersion: "2",
  trustEpoch: "2026-09",
});

const policy = (status = controller): AuthorityEvidencePolicyV1 => ({
  formatVersion: 1,
  profile: { id: "fixture.status-authority", version: "1.0.0" },
  did: {
    method: "did:midnight",
    issuerRelationship: "assertionMethod",
    network: binding.network,
    versionEvidence: "did-ledger-state-version-v1",
  },
  trust: { scope: "status:mutation", epochEvidence: "trust-registry-epoch-v1" },
  providers: {
    did: { requirementId: "did", role: "did-resolver", providerId: "fixture.did", providerVersion: "1.0.0", instanceId: "did:testnet" },
    trust: { requirementId: "trust", role: "trust-resolver", providerId: "fixture.trust", providerVersion: "1.0.0", instanceId: "trust:testnet" },
  },
  actors: [actor("issuer"), actor("holder"), actor("verifier"), actor("status", status)],
});

const didEvidence = (requirement: AuthorityActorKeyRequirementV1): DidMethodEvidenceV1 => ({
  formatVersion: 1,
  evidenceId: `did:${requirement.role}:2`,
  authenticated: true,
  observedAt: "2026-09-02T00:00:00.000Z",
  did: requirement.did,
  method: "did:midnight",
  methodId: requirement.methodId,
  keyFingerprint: requirement.keyFingerprint,
  relationships: [requirement.relationship],
  network: binding.network,
  stateVersion: requirement.stateVersion,
  versionEvidence: "did-ledger-state-version-v1",
  lifecycle: { status: "active", activatedAtStateVersion: "2" },
});
const trustEvidence = (requirement: AuthorityActorKeyRequirementV1): TrustAuthorizationEvidenceV1 => ({
  formatVersion: 1,
  evidenceId: `trust:${requirement.role}:2026-09`,
  authenticated: true,
  observedAt: "2026-09-02T00:00:01.000Z",
  subjectDid: requirement.did,
  methodId: requirement.methodId,
  keyFingerprint: requirement.keyFingerprint,
  network: binding.network,
  scope: "status:mutation",
  epoch: requirement.trustEpoch,
  epochEvidence: "trust-registry-epoch-v1",
  status: "active",
});
const didProvider: DidMethodEvidenceProviderV1 = { resolve: async ({ actor: requirement }) => didEvidence(requirement) };
const trustProvider: TrustAuthorizationEvidenceProviderV1 = { resolve: async ({ actor: requirement }) => trustEvidence(requirement) };
const acceptedPolicy = () => {
  const { actors: _actors, ...bindingPolicy } = policy(controller);
  return bindingPolicy;
};

const evidenceContext = {
  proofDigest: digest("a"),
  credentialDigest: digest("b"),
  presentationDigest: digest("c"),
};
const request = (
  operation: "initialize" | "revoke",
  operator = operation === "initialize" ? controller : delegate,
): StatusRegistryAuthorizationRequestV1 => ({
  formatVersion: 1,
  operation,
  binding,
  nonce: operation === "initialize" ? "init-1" : "mutation-1",
  authorityGeneration: operation === "initialize" ? 0 : 1,
  expectedRegistryVersion: operation === "initialize" ? 0 : 1,
  operator,
  statusHandleDigest: operation === "initialize" ? null : digest("d"),
  issuedAt: 100,
  expiresAt: 200,
  authorityPolicyDigest: digest("0"),
  authorityEvidence: null,
});

const grant = (overrides: Partial<StatusDelegateGrantEvidenceV1> = {}): StatusDelegateGrantEvidenceV1 => ({
  formatVersion: 1,
  evidenceId: "delegate-grant:1",
  authenticated: true,
  status: "active",
  controllerDid: controller.did,
  delegateDid: delegate.did,
  delegateMethodId: delegate.methodId,
  delegateKeyFingerprint: delegate.keyFingerprint,
  relationship: "capabilityInvocation",
  namespace: binding.namespace,
  registryId: binding.registryId,
  deployment: binding.deployment,
  authorityGeneration: 1,
  scopes: ["revoke"],
  notBefore: 100,
  expiresAt: 200,
  grantDigest: digest("e"),
  ...overrides,
});

const signatureVerifier = { verify: async () => true };
const trustedTimeVerifier = {
  verify: async () => ({
    status: "valid" as const,
    accepted: true,
    authoritative: true,
    authority: "ledger-local" as const,
    trustedTime: 150,
    reasonCodes: [],
    evidenceDigest: digest("6"),
    anchorDigest: digest("7"),
    authorityTranscriptDigest: null,
    checkpoint: null,
  }),
};
const authorizedRequest = (
  unsigned: StatusRegistryAuthorizationRequestV1,
  evidencePolicy: AuthorityEvidencePolicyV1,
): StatusRegistryAuthorizationRequestV1 => {
  const bound = bindStatusAuthorityEvidenceV1(
    unsigned,
    evidencePolicy,
    evidenceContext,
    {} as never,
  );
  const signature: StatusAuthoritySignatureV1 = {
    formatVersion: 1,
    signer: bound.operator,
    payloadDigest: computeStatusRegistryAuthorizationDigestV1(bound),
    signature: new Uint8Array([1, 2, 3]),
  };
  return attachStatusAuthoritySignatureV1(bound, signature);
};

const initializedContract = async (grantEvidence = grant()) => {
  const authorizationGate = createStatusRegistryAuthorityGateV1({
    controllerDid: controller.did,
    policy: acceptedPolicy(),
    didProvider,
    trustProvider,
    trustedTimeVerifier,
    signatureVerifier,
    delegateGrantProvider: { resolve: async () => grantEvidence },
  });
  const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate });
  await contract.initialize(authorizedRequest(request("initialize"), policy(controller)));
  return contract;
};

describe("#494-backed status authority gate", () => {
  it("requires a verified operator signature over the exact authorization digest", async () => {
    const gateInput = {
      controllerDid: controller.did,
      policy: acceptedPolicy(),
      didProvider,
      trustProvider,
      trustedTimeVerifier,
      delegateGrantProvider: { resolve: async () => undefined },
    };
    const unsignedContract = new InMemoryStatusRegistryContractV1({
      binding,
      authorizationGate: createStatusRegistryAuthorityGateV1({ ...gateInput, signatureVerifier }),
    });
    const unsigned = bindStatusAuthorityEvidenceV1(request("initialize"), policy(controller), evidenceContext);
    await expect(unsignedContract.initialize(unsigned)).resolves.toMatchObject({
      status: "rejected",
      receipt: { reasonCodes: ["AUTHORIZATION_SIGNATURE_MISSING"] },
    });

    const invalidContract = new InMemoryStatusRegistryContractV1({
      binding,
      authorizationGate: createStatusRegistryAuthorityGateV1({
        ...gateInput,
        signatureVerifier: { verify: async () => false },
      }),
    });
    await expect(
      invalidContract.initialize(authorizedRequest(request("initialize"), policy(controller))),
    ).resolves.toMatchObject({
      status: "rejected",
      receipt: { reasonCodes: ["AUTHORIZATION_SIGNATURE_INVALID"] },
    });
  });

  it.each([
    ["indeterminate", false, "AUTHORITY_TIME_UNAVAILABLE"],
    ["invalid", false, "AUTHORITY_TIME_INVALID"],
  ] as const)("fails %s trusted-time evidence closed", async (status, authoritative, reason) => {
    const authorizationGate = createStatusRegistryAuthorityGateV1({
      controllerDid: controller.did,
      policy: acceptedPolicy(),
      didProvider,
      trustProvider,
      trustedTimeVerifier: {
        verify: async () => ({
          ...(await trustedTimeVerifier.verify()),
          status,
          accepted: false,
          authoritative,
          authority: "local-process",
          trustedTime: null,
          reasonCodes: ["TRUSTED_TIME_EVIDENCE_UNAVAILABLE"],
        }),
      },
      signatureVerifier,
      delegateGrantProvider: { resolve: async () => undefined },
    });
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate });
    await expect(
      contract.initialize(authorizedRequest(request("initialize"), policy(controller))),
    ).resolves.toMatchObject({
      status: status === "indeterminate" ? "indeterminate" : "rejected",
      receipt: { reasonCodes: expect.arrayContaining([reason]) },
    });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 1.5])(
    "rejects malformed trusted time %s from an injected verifier",
    async (trustedTime) => {
      const authorizationGate = createStatusRegistryAuthorityGateV1({
        controllerDid: controller.did,
        policy: acceptedPolicy(),
        didProvider,
        trustProvider,
        trustedTimeVerifier: {
          verify: async () => ({
            ...(await trustedTimeVerifier.verify()),
            trustedTime,
          }),
        },
        signatureVerifier,
        delegateGrantProvider: { resolve: async () => undefined },
      });
      const contract = new InMemoryStatusRegistryContractV1({
        binding,
        authorizationGate,
      });
      await expect(
        contract.initialize(
          authorizedRequest(request("initialize"), policy(controller)),
        ),
      ).resolves.toMatchObject({
        status: "rejected",
        receipt: { reasonCodes: ["AUTHORITY_TIME_INVALID"] },
      });
      expect(contract.readState().initialized).toBe(false);
    },
  );

  it("commits the trusted-time replay checkpoint before accepting a write and fails closed when persistence is unavailable", async () => {
    let committed = 0;
    const checkpoint = {
      sequenceKeyDigest: digest("8"),
      sourcePolicyDigest: digest("9"),
      sequence: 1,
      time: 150,
      evidenceDigest: digest("6"),
    };
    const gateFor = (commit: () => Promise<void>) =>
      createStatusRegistryAuthorityGateV1({
        controllerDid: controller.did,
        policy: acceptedPolicy(),
        didProvider,
        trustProvider,
        trustedTimeVerifier: {
          verify: async () => ({
            ...(await trustedTimeVerifier.verify()),
            checkpoint,
          }),
          commit,
        },
        signatureVerifier,
        delegateGrantProvider: { resolve: async () => undefined },
      });

    const acceptedContract = new InMemoryStatusRegistryContractV1({
      binding,
      authorizationGate: gateFor(async () => {
        committed += 1;
      }),
    });
    await expect(
      acceptedContract.initialize(
        authorizedRequest(request("initialize"), policy(controller)),
      ),
    ).resolves.toMatchObject({ status: "accepted" });
    expect(committed).toBe(1);

    const unavailableContract = new InMemoryStatusRegistryContractV1({
      binding,
      authorizationGate: gateFor(async () => {
        throw new Error("checkpoint store unavailable");
      }),
    });
    await expect(
      unavailableContract.initialize(
        authorizedRequest(request("initialize"), policy(controller)),
      ),
    ).resolves.toMatchObject({
      status: "indeterminate",
      receipt: { reasonCodes: ["AUTHORITY_TIME_CHECKPOINT_UNAVAILABLE"] },
    });
    expect(unavailableContract.readState().initialized).toBe(false);
  });

  it("rejects an accepted authority policy for a different registry network", async () => {
    const otherNetworkPolicy: AuthorityEvidencePolicyV1 = {
      ...policy(controller),
      did: { ...policy(controller).did, network: "midnight:othernet" },
    };
    const { actors: _actors, ...otherNetworkBinding } = otherNetworkPolicy;
    const authorizationGate = createStatusRegistryAuthorityGateV1({
      controllerDid: controller.did,
      policy: otherNetworkBinding,
      didProvider,
      trustProvider,
      trustedTimeVerifier,
      signatureVerifier,
      delegateGrantProvider: { resolve: async () => undefined },
    });
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate });
    await expect(
      contract.initialize(authorizedRequest(request("initialize"), otherNetworkPolicy)),
    ).resolves.toMatchObject({
      status: "rejected",
      receipt: { reasonCodes: ["AUTHORITY_NETWORK_MISMATCH"] },
    });
  });

  it("rejects unavailable or invalid controller evidence for initialization", async () => {
    const unavailableGate = createStatusRegistryAuthorityGateV1({
      controllerDid: controller.did,
      policy: acceptedPolicy(),
      didProvider: { resolve: async () => undefined },
      trustProvider,
      trustedTimeVerifier,
      signatureVerifier,
      delegateGrantProvider: { resolve: async () => undefined },
    });
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate: unavailableGate });
    const outcome = await contract.initialize(authorizedRequest(request("initialize"), policy(controller)));
    expect(outcome).toMatchObject({ status: "indeterminate", receipt: { reasonCodes: expect.arrayContaining(["AUTHORITY_EVIDENCE_UNAVAILABLE"]) } });
    expect(contract.readState().initialized).toBe(false);
  });

  it("rejects a caller-selected initialization controller even with otherwise valid DID/trust evidence", async () => {
    const attacker = {
      did: "did:midnight:testnet:attacker",
      methodId: "did:midnight:testnet:attacker#invoke-1",
      keyFingerprint: digest("9"),
      relationship: "capabilityInvocation" as const,
    };
    const authorizationGate = createStatusRegistryAuthorityGateV1({
      controllerDid: controller.did,
      policy: acceptedPolicy(),
      didProvider,
      trustProvider,
      trustedTimeVerifier,
      signatureVerifier,
      delegateGrantProvider: { resolve: async () => undefined },
    });
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate });
    const outcome = await contract.initialize(
      authorizedRequest(request("initialize", attacker), policy(attacker)),
    );
    expect(outcome).toMatchObject({ status: "rejected", receipt: { reasonCodes: ["INITIAL_CONTROLLER_MISMATCH"] } });
    expect(contract.readState().initialized).toBe(false);
  });

  it.each([
    ["wrong scope", { scopes: ["attest"] }],
    ["not yet valid", { notBefore: 151 }],
    ["expired", { expiresAt: 149 }],
    ["revoked", { status: "revoked" }],
    ["stale generation", { authorityGeneration: 0 }],
    ["cross namespace", { namespace: "issuer:other:1:revoked-set" }],
    ["cross deployment", { deployment: "contract:other@1" }],
    ["malformed not-before", { notBefore: Number.NaN }],
    ["malformed expiry", { expiresAt: Number.POSITIVE_INFINITY }],
  ] as const)("rejects delegate evidence with %s", async (_label, override) => {
    const contract = await initializedContract(grant(override as Partial<StatusDelegateGrantEvidenceV1>));
    const outcome = await contract.revoke(authorizedRequest(request("revoke"), policy(delegate)));
    expect(outcome.status).toBe("rejected");
    expect(contract.readState()).toMatchObject({ registryVersion: 1, revokedStatusHandleCount: 0, acceptedAuthorizationCount: 1 });
  });

  it("accepts an exact active revoke delegate and binds both evidence transcripts in the receipt", async () => {
    const contract = await initializedContract();
    const outcome = await contract.revoke(authorizedRequest(request("revoke"), policy(delegate)));
    expect(outcome).toMatchObject({
      status: "accepted",
      receipt: {
        result: "revoked",
        delegateGrantDigest: digest("e"),
        authorityTranscriptDigest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
      },
    });
  });
});
