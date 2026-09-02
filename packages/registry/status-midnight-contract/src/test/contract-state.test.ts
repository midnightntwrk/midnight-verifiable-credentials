import { describe, expect, it, vi } from "vitest";

import {
  computeStatusRegistryRootV1,
  emptyStatusRegistryRootV1,
  InMemoryStatusRegistryContractV1,
  type StatusRegistryAuthorizationGateV1,
  type StatusRegistryAuthorizationRequestV1,
  type StatusRegistryBindingV1,
  type StatusRegistryGateDecisionV1,
} from "../index.js";

const digest = (character: string) => `sha256:${character.repeat(64)}` as const;
const binding: StatusRegistryBindingV1 = {
  formatVersion: 1,
  network: "midnight:testnet",
  namespace: "issuer:family:1:revoked-set",
  registryId: "registry:fixture:1",
  deployment: "contract:fixture@1",
};
const controller = {
  did: "did:midnight:testnet:controller",
  methodId: "did:midnight:testnet:controller#invoke-1",
  keyFingerprint: digest("1"),
  relationship: "capabilityInvocation" as const,
};

const gate = (
  decide: (request: StatusRegistryAuthorizationRequestV1) => StatusRegistryGateDecisionV1 = () => ({
    status: "valid",
    accepted: true,
    reasonCodes: [],
    transcriptDigest: digest("a"),
    delegateGrantDigest: null,
  }),
): StatusRegistryAuthorizationGateV1 => ({ authorize: async ({ request }) => decide(request) });

const initialization = (overrides: Partial<StatusRegistryAuthorizationRequestV1> = {}): StatusRegistryAuthorizationRequestV1 => ({
  formatVersion: 1,
  operation: "initialize",
  binding,
  nonce: "init-1",
  authorityGeneration: 0,
  expectedRegistryVersion: 0,
  operator: controller,
  statusHandleDigest: null,
  issuedAt: 100,
  expiresAt: 200,
  authorityPolicyDigest: digest("b"),
  authorityEvidence: {},
  ...overrides,
});

const mutation = (overrides: Partial<StatusRegistryAuthorizationRequestV1> = {}): StatusRegistryAuthorizationRequestV1 => ({
  formatVersion: 1,
  operation: "revoke",
  binding,
  nonce: "mutate-1",
  authorityGeneration: 1,
  expectedRegistryVersion: 1,
  operator: controller,
  statusHandleDigest: digest("f"),
  issuedAt: 110,
  expiresAt: 210,
  authorityPolicyDigest: digest("b"),
  authorityEvidence: {},
  ...overrides,
});

describe("status registry contract state v1", () => {
  it("commits a domain-separated authenticated root to empty, singleton, and ordered sets", () => {
    expect(computeStatusRegistryRootV1([])).toBe(emptyStatusRegistryRootV1);
    expect(computeStatusRegistryRootV1([digest("f")])).not.toBe(digest("f"));
    expect(computeStatusRegistryRootV1([digest("1"), digest("f")])).toBe(
      computeStatusRegistryRootV1([digest("f"), digest("1")]),
    );
    expect(() => computeStatusRegistryRootV1([digest("f"), digest("f")])).toThrow(/unique/u);
  });

  it("rejects unauthorized initialization and mutation without changing state", async () => {
    const contract = new InMemoryStatusRegistryContractV1({
      binding,
      authorizationGate: gate(() => ({
        status: "invalid",
        accepted: false,
        reasonCodes: ["AUTHORITY_EVIDENCE_INVALID"],
        transcriptDigest: digest("c"),
        delegateGrantDigest: null,
      })),
    });

    const init = await contract.initialize(initialization());
    expect(init).toMatchObject({ status: "rejected", replay: false, receipt: { result: "rejected", reasonCodes: ["AUTHORITY_EVIDENCE_INVALID"] } });
    expect(contract.readState()).toMatchObject({ initialized: false, registryVersion: 0, auditSequence: 0 });

    const revoke = await contract.revoke(mutation());
    expect(revoke).toMatchObject({ status: "rejected", receipt: { reasonCodes: ["REGISTRY_NOT_INITIALIZED"] } });
    expect(contract.readState()).toMatchObject({ initialized: false, revokedStatusHandleCount: 0 });
  });

  it("binds namespace and deployment before invoking authority evidence", async () => {
    let gateCalls = 0;
    const contract = new InMemoryStatusRegistryContractV1({
      binding,
      authorizationGate: gate(() => {
        gateCalls += 1;
        return { status: "valid", accepted: true, reasonCodes: [], transcriptDigest: digest("a"), delegateGrantDigest: null };
      }),
    });

    const wrongNamespace = await contract.initialize(initialization({ binding: { ...binding, namespace: "attacker" } }));
    const wrongDeployment = await contract.initialize(initialization({ binding: { ...binding, deployment: "contract:attacker@1" } }));
    expect(wrongNamespace.receipt.reasonCodes).toContain("NAMESPACE_MISMATCH");
    expect(wrongDeployment.receipt.reasonCodes).toContain("DEPLOYMENT_MISMATCH");
    expect(gateCalls).toBe(0);
  });

  it("returns the immutable receipt for exact replay and rejects same-nonce different bytes", async () => {
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate: gate() });
    const first = await contract.initialize(initialization());
    const replay = await contract.initialize(initialization());
    const conflict = await contract.initialize(initialization({ authorityPolicyDigest: digest("d") }));

    expect(first).toMatchObject({ status: "accepted", replay: false, receipt: { result: "initialized", resultingRegistryVersion: 1 } });
    expect(replay).toEqual({ ...first, replay: true });
    expect(conflict).toMatchObject({ status: "rejected", replay: false, receipt: { result: "rejected", reasonCodes: ["NONCE_CONFLICT"] } });
    expect(contract.readState()).toMatchObject({ initialized: true, registryVersion: 1, auditSequence: 1, acceptedAuthorizationCount: 1 });
  });

  it("rejects cross-operation replay before consulting stored receipts", async () => {
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate: gate() });
    const initRequest = initialization();
    await contract.initialize(initRequest);
    const revokeViaInitialize = await contract.revoke(initRequest);
    expect(revokeViaInitialize).toMatchObject({
      status: "rejected",
      replay: false,
      receipt: { reasonCodes: ["OPERATION_MISMATCH"] },
    });

    const revokeRequest = mutation();
    await contract.revoke(revokeRequest);
    const initializeViaRevoke = await contract.initialize(revokeRequest);
    expect(initializeViaRevoke).toMatchObject({
      status: "rejected",
      replay: false,
      receipt: { reasonCodes: ["OPERATION_MISMATCH"] },
    });
  });

  it("snapshots mutable caller requests before asynchronous authorization", async () => {
    let releaseMutation: (() => void) | undefined;
    const authorizationGate: StatusRegistryAuthorizationGateV1 = {
      authorize: async ({ request }) => {
        if (request.operation === "revoke") {
          await new Promise<void>((resolve) => { releaseMutation = resolve; });
        }
        return {
          status: "valid",
          accepted: true,
          reasonCodes: [],
          transcriptDigest: digest("a"),
          delegateGrantDigest: null,
        };
      },
    };
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate });
    const initRequest = initialization({ operator: { ...controller } });
    const initializing = contract.initialize(initRequest);
    (initRequest.operator as { did: string }).did = "did:midnight:testnet:attacker";
    await initializing;
    expect(contract.readState().controllerDid).toBe(controller.did);

    const revokeRequest = mutation();
    const revoking = contract.revoke(revokeRequest);
    await vi.waitFor(() => expect(releaseMutation).toBeTypeOf("function"));
    (revokeRequest as { statusHandleDigest: string }).statusHandleDigest = digest("e");
    releaseMutation?.();
    await revoking;
    expect(contract.readState().revokedStatusHandleDigests).toEqual([digest("f")]);
  });

  it("serializes concurrent duplicate and competing mutations at one expected version", async () => {
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate: gate() });
    await contract.initialize(initialization());

    const [duplicateA, duplicateB] = await Promise.all([
      contract.revoke(mutation()),
      contract.revoke(mutation()),
    ]);
    expect([duplicateA.replay, duplicateB.replay].sort()).toEqual([false, true]);
    expect(duplicateA.receipt.authorizationDigest).toBe(duplicateB.receipt.authorizationDigest);

    const [competitorA, competitorB] = await Promise.all([
      contract.revoke(mutation({ nonce: "race-a", expectedRegistryVersion: 2, statusHandleDigest: digest("2") })),
      contract.revoke(mutation({ nonce: "race-b", expectedRegistryVersion: 2, statusHandleDigest: digest("3") })),
    ]);
    expect([competitorA.status, competitorB.status].sort()).toEqual(["accepted", "rejected"]);
    expect([competitorA, competitorB].find(({ status }) => status === "rejected")?.receipt.reasonCodes).toContain("REGISTRY_VERSION_MISMATCH");
    expect(contract.readState()).toMatchObject({ registryVersion: 3, revokedStatusHandleCount: 2, acceptedAuthorizationCount: 3 });
  });

  it("audits fresh already-revoked authorization without exposing the status handle", async () => {
    const contract = new InMemoryStatusRegistryContractV1({ binding, authorizationGate: gate() });
    await contract.initialize(initialization());
    await contract.revoke(mutation());
    const duplicateHandle = await contract.revoke(mutation({ nonce: "mutate-2", expectedRegistryVersion: 2 }));

    expect(duplicateHandle).toMatchObject({ status: "accepted", receipt: { result: "already-revoked", resultingRegistryVersion: 2, resultingRevokedRoot: computeStatusRegistryRootV1([digest("f")]) } });
    const serialized = JSON.stringify(duplicateHandle.receipt);
    expect(serialized).not.toContain(digest("f"));
    expect(serialized).not.toContain("statusHandle");
    expect(contract.readState()).toMatchObject({ registryVersion: 2, revokedStatusHandleCount: 1, auditSequence: 3, acceptedAuthorizationCount: 3 });
  });
});
