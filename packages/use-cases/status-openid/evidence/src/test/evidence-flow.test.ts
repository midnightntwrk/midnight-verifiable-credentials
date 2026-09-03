import { describe, expect, it } from "vitest";

import {
  InMemoryStatusOpenIdEvidenceStore,
  StatusOpenIdEvidenceRunner,
} from "../index.js";

describe("status-enabled OID4VCI/OID4VP production-shaped evidence", () => {
  it("runs request → issuance → active status → DCQL presentation → atomic Verification V1 access decision", async () => {
    const evidence = await new StatusOpenIdEvidenceRunner().run({ correlationId: "access-active", requestId: "shift-001" });
    expect(evidence).toMatchObject({
      qualification: "production-shaped-evidence-only",
      productionApproved: false,
      externalInteroperability: "not-run",
      localConformance: "passed",
      actors: {
        issuer: "Northstar Safety Board",
        holder: "Avery Chen (synthetic contractor)",
        statusOperator: "Northstar Credential Operations",
        verifier: "Harbor Plant Access Control",
      },
      openId: { oid4vci: "1.0 Final", oid4vp: "1.0 Final", dcqlQueryIds: ["active-safety-credential"] },
      status: { status: "valid", outcome: { verdict: "valid", state: "active" } },
      decision: { outcome: "access-granted", atomicMutation: "committed", replay: false },
    });
    expect(evidence.verification).toMatchObject({
      kind: "ledger-receipt", profile: "ledger-local-v1", authority: "ledger-local",
      proofStatus: "valid", decisionStatus: "approved", executionStatus: "committed",
    });
  });

  it.each([
    ["revoked", "denied", "revoked"],
    ["unavailable", "indeterminate", "statusStateUnavailable"],
    ["stale", "denied", "staleRegistryState"],
    ["future", "denied", "staleRegistryState"],
    ["forged-root", "denied", "statusRequestMismatch"],
  ] as const)("fails closed for %s status", async (statusScenario, outcome, reason) => {
    const evidence = await new StatusOpenIdEvidenceRunner().run({
      correlationId: `access-${statusScenario}`, requestId: `shift-${statusScenario}`, statusScenario,
    });
    expect(evidence.decision).toMatchObject({ outcome, reason });
    expect(evidence.verification).toBeNull();
  });

  it("restores durable replay state and makes an exact atomic decision idempotent", async () => {
    const store = new InMemoryStatusOpenIdEvidenceStore();
    const first = await new StatusOpenIdEvidenceRunner({ store }).run({ correlationId: "restart-1", requestId: "shift-restart" });
    const restarted = InMemoryStatusOpenIdEvidenceStore.fromSerialized(store.serialize());
    const replay = await restarted.commitDecision({
      decisionNullifier: first.decision.decisionNullifier!,
      transcriptDigest: first.verification!.transcriptDigest!,
      outcome: "access-granted",
    });
    expect(replay).toMatchObject({ classification: "replay", atomicMutation: "none" });
    expect(restarted.decisionCount()).toBe(1);

    const afterRestart = await new StatusOpenIdEvidenceRunner({ store: restarted }).run({
      correlationId: "restart-2",
      requestId: "shift-after-restart",
    });
    expect(afterRestart.decision).toMatchObject({ outcome: "access-granted", atomicMutation: "committed" });
    expect(restarted.decisionCount()).toBe(2);
    expect(restarted.trustedTimeCheckpoint()).toMatchObject({ sequence: 2, time: 1_800_000_000 });

    const changedTranscript = Uint8Array.from(first.verification!.transcriptDigest!);
    changedTranscript[0] ^= 0xff;
    await expect(restarted.commitDecision({
      decisionNullifier: first.decision.decisionNullifier!,
      transcriptDigest: changedTranscript,
      outcome: "access-granted",
    })).rejects.toThrow(/conflict/i);
    expect(restarted.decisionCount()).toBe(2);
  });

  it("returns the stored issuance for an exact retry and rejects same idempotency key with changed bytes", async () => {
    const store = new InMemoryStatusOpenIdEvidenceStore();
    const first = await store.commitIssuance("issuance-key", "digest-a", { credential: "one" });
    const retry = await store.commitIssuance("issuance-key", "digest-a", { credential: "one" });
    expect(first.classification).toBe("applied");
    expect(retry).toMatchObject({ classification: "replay", value: { credential: "one" } });
    await expect(store.commitIssuance("issuance-key", "digest-b", { credential: "two" })).rejects.toThrow(/conflict/i);
  });
});
