import {
  asBytes32,
  hashAnchorEvidenceReceiptV1,
  hashEvidenceBindingV1,
  verificationDomainV1,
} from "@midnight-ntwrk/midnight-did-credentials";
import { describe, expect, it, vi } from "vitest";

import {
  InMemoryStatusOpenIdAuditSink,
  InMemoryStatusOpenIdEvidenceStore,
  type StatusOpenIdEvidencePorts,
  StatusOpenIdEvidenceRunner,
} from "../index.js";

const run = (ports: StatusOpenIdEvidencePorts, id: string) =>
  new StatusOpenIdEvidenceRunner(ports).run({ correlationId: id, requestId: id });

describe("OpenID binding and deployment seams", () => {
  it.each([
    "issuance-audience",
    "issuance-nonce",
    "issuance-request-digest",
    "presentation-audience",
    "presentation-nonce",
    "origin",
    "request-digest",
    "response-uri",
    "redirect",
    "ssrf",
    "dcql",
  ] as const)("fails closed for %s substitution", async (openIdMutation) => {
    await expect(new StatusOpenIdEvidenceRunner().run({
      correlationId: `openid-${openIdMutation}`, requestId: `openid-${openIdMutation}`, openIdMutation,
    })).rejects.toThrow();
  });

  it("blocks private request-object resolution before invoking the HTTP adapter", async () => {
    const fetchRequestObject = vi.fn(async () => {
      throw new Error("HTTP adapter must not be invoked for a private address");
    });
    await expect(new StatusOpenIdEvidenceRunner({
      network: { exchange: async () => undefined, fetchRequestObject },
    }).run({
      correlationId: "openid-ssrf-preflight",
      requestId: "openid-ssrf-preflight",
      openIdMutation: "ssrf",
    })).rejects.toThrow(/public addresses/i);
    expect(fetchRequestObject).not.toHaveBeenCalled();
  });

  it("rejects presentation replay through the persistent OpenID store", async () => {
    const store = new InMemoryStatusOpenIdEvidenceStore();
    const runner = new StatusOpenIdEvidenceRunner({ store });
    const options = { correlationId: "openid-replay", requestId: "openid-replay" } as const;
    await runner.run(options);
    await expect(runner.run(options)).rejects.toThrow(/replay/i);
  });

  it.each([
    ["network", { network: { exchange: async () => { throw new Error("network unavailable"); }, fetchRequestObject: async () => { throw new Error("network unavailable"); } } }],
    ["process", { process: { execute: async () => { throw new Error("process unavailable"); } } }],
    ["proof", { proof: { verifyIssuanceProof: async () => { throw new Error("proof unavailable"); }, verifyPresentation: async () => false } }],
    ["storage", { store: Object.assign(new InMemoryStatusOpenIdEvidenceStore(), { consume: async () => { throw new Error("storage unavailable"); } }) }],
    ["key-custody", { keyCustody: { sign: async () => { throw new Error("key custody unavailable"); }, describe: () => ({ providerId: "isolated-hsm", isolated: true }) } }],
    ["status", { status: { readState: async () => { throw new Error("status unavailable"); } } }],
    ["trusted-time", { trustedTime: { verify: async () => { throw new Error("trusted time unavailable"); } } }],
  ] as const)("fails closed when the %s seam is unavailable", async (_name, ports) => {
    await expect(run(ports as StatusOpenIdEvidencePorts, `fault-${_name}`)).rejects.toThrow(/unavailable/i);
  });

  it("does not grant access for a committed policy-denied Verification V1 receipt", async () => {
    await expect(run({
      verificationExecutor: {
        submit: async (prepared) => ({
          version: 1,
          executionStatus: "committed",
          evaluation: {
            proofStatus: "valid",
            decisionStatus: "policyDenied",
            transcriptDigest: prepared.transcriptDigest,
            authorityEvidence: "ledger-local",
          },
          transcriptDigest: prepared.transcriptDigest,
          decisionNullifier: asBytes32(prepared.publicInputs.transcript.decisionNullifier),
          anchorEvidenceDigest: hashAnchorEvidenceReceiptV1({
            domain: verificationDomainV1("anchorEvidenceReceipt"),
            version: 1n,
            issuerEvidenceDigest: hashEvidenceBindingV1(prepared.publicInputs.issuerEvidence),
            trustEvidenceDigest: hashEvidenceBindingV1(prepared.publicInputs.trustEvidence),
            statusEvidenceDigest: hashEvidenceBindingV1(prepared.publicInputs.statusEvidence),
            timeEvidenceDigest: hashEvidenceBindingV1(prepared.publicInputs.timeEvidence),
            artifactEvidenceDigest: hashEvidenceBindingV1(prepared.publicInputs.artifactEvidence),
            connectorEvidenceDigest: hashEvidenceBindingV1(prepared.publicInputs.connectorEvidence),
          }),
          transactionDigest: asBytes32(new Uint8Array(32).fill(1)),
          atomicMutation: "none",
        }),
        confirmCommitted: async () => true,
      },
    }, "verification-policy-denied")).rejects.toThrow(/approved/i);
  });

  it("rejects a non-authoritative trusted-time adapter and a failing Verification V1 ledger executor", async () => {
    await expect(run({
      trustedTime: {
        verify: async () => ({
          status: "valid", accepted: true, authoritative: false, authority: "local-process",
          trustedTime: 1_800_000_000, reasonCodes: [], evidenceDigest: null,
          anchorDigest: null, authorityTranscriptDigest: null, checkpoint: null,
        }),
      },
    }, "non-authoritative-time")).rejects.toThrow(/non-authoritative/i);

    await expect(run({
      verificationExecutor: {
        submit: async () => { throw new Error("ledger executor unavailable"); },
        confirmCommitted: async () => false,
      },
    }, "verification-executor-outage")).rejects.toThrow(/committed receipt/i);
  });

  it("keeps custody keys out of state, decisions, and correlated audit events", async () => {
    const audit = new InMemoryStatusOpenIdAuditSink();
    const store = new InMemoryStatusOpenIdEvidenceStore();
    const evidence = await run({ audit, store }, "key-isolation");
    const retained = JSON.stringify({ evidence, audit: audit.snapshot(), state: store.serialize() });
    expect(retained).not.toMatch(/privateKey|secretKey|seedPhrase|keyMaterial/i);
    expect(audit.snapshot().every(({ correlationId }) => correlationId === "key-isolation")).toBe(true);
    const auditSnapshot = JSON.stringify(audit.snapshot());
    for (const sensitive of [
      "synthetic-access-token",
      "synthetic-holder-proof.jwt",
      "SAFETY-0001",
      "did:midnight:synthetic:avery-chen",
      "contractorName",
      "safetyLevel",
      "signature",
    ]) {
      expect(auditSnapshot).not.toContain(sensitive);
    }
  });
});
