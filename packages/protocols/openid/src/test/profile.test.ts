import { describe, expect, it } from "vitest";

import {
  assertCanonicalThreadBinding,
  assertVpRequestBinding,
  AuthorizationDetailsSchema,
  createCanonicalCompactMessageBinding,
  createCredentialOfferReferenceUri,
  createDcqlQuery,
  CredentialFormatSelectionSchema,
  DcqlQuerySchema,
  DeferredCredentialResponseSchema,
  DeferredCredentialStatusSchema,
  IssuanceProofBindingSchema,
  mapDcqlToCanonicalCompactFormat,
  parseCredentialOfferReferenceUri,
  ProtocolErrorSchema,
  RequestObjectReferenceSchema,
  VpRequestBindingSchema,
} from "../index.js";

const payload = {
  encoding: "compact-value-v1.base64url" as const,
  payload: "TUNWMQAAAAA",
};

describe("incubating Midnight OpenID profile", () => {
  it("validates a DCQL query and maps the Compact format", () => {
    const query = createDcqlQuery({
      credentials: [
        {
          id: "age-proof",
          format: "midnight_compact_vc",
          claims: [{ path: ["credentialSubject", "ageOver"] }],
          require_cryptographic_holder_binding: true,
        },
      ],
    });

    expect(mapDcqlToCanonicalCompactFormat(query.credentials[0])).toBe(
      "midnight_compact_vc",
    );
  });

  it("rejects duplicate DCQL ids and unknown credential-set references", () => {
    expect(() =>
      DcqlQuerySchema.parse({
        credentials: [
          { id: "same", format: "midnight_compact_vc" },
          { id: "same", format: "midnight_compact_vc" },
        ],
      }),
    ).toThrow(/unique/);

    expect(() =>
      DcqlQuerySchema.parse({
        credentials: [{ id: "known", format: "midnight_compact_vc" }],
        credential_sets: [{ options: [["missing"]] }],
      }),
    ).toThrow(/unknown query id/);
    expect(() =>
      DcqlQuerySchema.parse({
        credentials: [{ id: "known", format: "midnight_compact_vc" }],
        credential_sets: [{ options: ["known"] }],
      }),
    ).toThrow();
  });

  it("preserves canonical Compact payload and threading identifiers", () => {
    const message = createCanonicalCompactMessageBinding({
      format: "midnight_compact_vp",
      payload,
      messageId: "message-1",
      threadId: "thread-1",
      respondsToMessageId: "request-1",
    });

    assertCanonicalThreadBinding({
      message,
      expectedThreadId: "thread-1",
      expectedResponseTo: "request-1",
    });
    expect(message.payload).toEqual(payload);
    expect(() =>
      createCanonicalCompactMessageBinding({
        format: "midnight_compact_vp",
        payload: { ...payload, payload: "YWJjZA" },
        messageId: "message-1",
        threadId: "thread-1",
      }),
    ).toThrow(/Compact value payload/);
    expect(() =>
      assertCanonicalThreadBinding({
        message,
        expectedThreadId: "other-thread",
      }),
    ).toThrow(/thread_id/);
  });

  it("validates issuance, deferred, format, error, and request-object contracts", () => {
    expect(
      AuthorizationDetailsSchema.parse({
        type: "openid_credential",
        credential_configuration_id: "age-v1",
        format: "midnight_compact_vc",
      }).credential_configuration_id,
    ).toBe("age-v1");
    expect(() =>
      AuthorizationDetailsSchema.parse({ type: "openid_credential" }),
    ).toThrow();
    expect(() =>
      CredentialFormatSelectionSchema.parse({
        requested: ["midnight_compact_vc"],
        selected: "mso_mdoc",
      }),
    ).toThrow(/not requested/);
    expect(
      IssuanceProofBindingSchema.parse({
        audience: "https://issuer.example/token",
        c_nonce: "nonce-1",
        request_digest: "YWJjZA",
      }).audience,
    ).toBe("https://issuer.example/token");
    expect(
      DeferredCredentialResponseSchema.parse({ transaction_id: "tx-1" })
        .transaction_id,
    ).toBe("tx-1");
    expect(
      CredentialFormatSelectionSchema.parse({
        requested: ["midnight_compact_vc"],
        selected: "midnight_compact_vc",
      }).selected,
    ).toBe("midnight_compact_vc");
    expect(
      ProtocolErrorSchema.parse({ error: "issuance_pending" }).error,
    ).toBe("issuance_pending");
    expect(
      RequestObjectReferenceSchema.parse({
        uri: "https://verifier.example/request/1",
        digest: "YWJjZA",
        audience: "did:midnight:verifier:1",
      }).uri,
    ).toContain("verifier.example");
    const binding = VpRequestBindingSchema.parse({
      client_id: "did:midnight:verifier:1",
      nonce: "nonce-1",
      request_digest: "YWJjZA",
    });
    assertVpRequestBinding({
      binding,
      clientId: "did:midnight:verifier:1",
      nonce: "nonce-1",
      requestDigest: "YWJjZA",
    });
    expect(() =>
      assertVpRequestBinding({ ...{
        binding,
        clientId: "did:midnight:verifier:other",
        nonce: "nonce-1",
        requestDigest: "YWJjZA",
      } }),
    ).toThrow(/client_id/);
    const referenceUri = createCredentialOfferReferenceUri({
      issuerOrigin: "https://issuer.example",
      reference: "https://issuer.example/offers/one-time-1",
    });
    expect(referenceUri).toContain("credential_offer_uri");
    expect(parseCredentialOfferReferenceUri(referenceUri)).toEqual({
      issuerOrigin: "https://issuer.example",
      reference: "https://issuer.example/offers/one-time-1",
    });
    expect(DeferredCredentialStatusSchema.parse({
      transaction_id: "tx-1",
      status: "pending",
    }).status).toBe("pending");
  });

  it("rejects malformed references and empty profile selections", () => {
    expect(() =>
      RequestObjectReferenceSchema.parse({
        uri: "not a URL",
        digest: "YWJjZA",
        audience: "verifier",
      }),
    ).toThrow();
    expect(() =>
      CredentialFormatSelectionSchema.parse({
        requested: [],
        selected: "midnight_compact_vc",
      }),
    ).toThrow();
    const safeReferenceUri = createCredentialOfferReferenceUri({
      issuerOrigin: "https://issuer.example",
      reference: "https://issuer.example/offers/one-time-1",
    });
    for (const malformed of [
      safeReferenceUri.replace("openid-credential-offer:", "openid-credential-offer://evil"),
      `${safeReferenceUri}#fragment`,
      `${safeReferenceUri}&extra=value`,
      `${safeReferenceUri}&credential_offer=secret`,
      safeReferenceUri.replace("credential_offer_uri", "credential_offer"),
    ]) {
      expect(() => parseCredentialOfferReferenceUri(malformed)).toThrow();
    }
  });
});
