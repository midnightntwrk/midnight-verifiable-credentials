import { describe, expect, it, vi } from "vitest";

import {
  type CanonicalFamilyMessageLike,
  OpenIdCanonicalMessageAdapter,
  OpenIdDelegatingVerificationAdapter,
} from "../index.js";

const canonical = <TKind extends CanonicalFamilyMessageLike["kind"]>(
  kind: TKind,
  bytes: readonly number[],
): CanonicalFamilyMessageLike<TKind> => ({
  familyId: "family-503",
  familyVersion: "1.0.0",
  schemaId: "schema-503",
  schemaVersion: "1.0.0",
  kind,
  mediaType: "application/midnight-compact",
  payload: Uint8Array.from(bytes),
});

describe("OpenID canonical family message adapter", () => {
  it("round-trips canonical #499/#502 family bytes and identities exactly", () => {
    const adapter = new OpenIdCanonicalMessageAdapter();
    const presentation = canonical("presentation", [0, 1, 2, 127, 128, 255]);
    const threading = { messageId: "presentation-1", threadId: "thread-1", respondsToMessageId: "request-1" };
    const wire = adapter.wrap(presentation, threading);

    expect(wire.profile).toBe("org.midnight.credentials.openid.v1");
    expect(adapter.unwrap(wire)).toEqual({ message: presentation, threading });
    expect([...adapter.unwrap(wire).message.payload]).toEqual([0, 1, 2, 127, 128, 255]);
  });

  it("forwards authorityContext and familyInput as distinct AuthorityBoundVerifierAgent-shaped arguments", async () => {
    const request = canonical("presentation-request", [10, 11]);
    const presentation = canonical("presentation", [20, 21]);
    const aggregateResult = {
      valid: false,
      familyValid: true,
      reason: "aggregateDecisionDenied",
      canonicalPresentation: presentation,
      authority: { accepted: false, reasonCodes: ["trustUnauthorized"] },
      aggregate: { decisionSetDigest: "opaque-502-result" },
    };
    type AuthorityBoundVerifierAgentShape = {
      verify(
        presented: CanonicalFamilyMessageLike<"presentation">,
        requested: CanonicalFamilyMessageLike<"presentation-request">,
        authorityContext: { proofDigest: string; credentialDigest: string },
        familyInput?: { privateWitness: string },
      ): Promise<typeof aggregateResult>;
    };
    const verify = vi.fn(async () => aggregateResult);
    const authorityBoundVerifierAgent = { verify } satisfies AuthorityBoundVerifierAgentShape;
    const adapter = new OpenIdCanonicalMessageAdapter();
    const delegating = new OpenIdDelegatingVerificationAdapter(authorityBoundVerifierAgent, adapter);
    const authorityContext = { proofDigest: "proof-499", credentialDigest: "credential-499" };
    const familyInput = { privateWitness: "never inspected by OpenID" };

    const result = await delegating.verify(
      adapter.wrap(presentation, { messageId: "presentation-1", threadId: "thread-1", respondsToMessageId: "request-1" }),
      adapter.wrap(request, { messageId: "request-1", threadId: "thread-1" }),
      authorityContext,
      familyInput,
    );

    expect(result).toBe(aggregateResult);
    expect(verify).toHaveBeenCalledWith(presentation, request, authorityContext, familyInput);
  });

  it("rejects malformed or ambiguous wire payloads", () => {
    const adapter = new OpenIdCanonicalMessageAdapter();
    const wire = adapter.wrap(canonical("presentation", [1, 2, 3]), { messageId: "presentation-1", threadId: "thread-1", respondsToMessageId: "request-1" });
    expect(() => adapter.unwrap({ ...wire, payload: "%%%" })).toThrow(/base64url/);
    expect(() => adapter.unwrap({ ...wire, kind: "credential", extra: true } as never)).toThrow();
    const delegating = new OpenIdDelegatingVerificationAdapter({ verify: vi.fn() }, adapter);
    expect(() => delegating.verify(
      wire,
      adapter.wrap(canonical("presentation-request", [4]), { messageId: "other-request", threadId: "other-thread" }),
      {},
    )).toThrow(/thread binding/);
  });
});
