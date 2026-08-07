import { CompactTypeBytes } from "@midnight-ntwrk/compact-runtime";
import { describe, expect, it } from "vitest";

import {
  createCredentialIssuerMetadata,
  createCredentialRequest,
  createCredentialResponse,
  createPreAuthorizedCredentialOffer,
  createPreAuthorizedTokenRequest,
  CredentialResponseSchema,
  encodeCompactPayload,
  legacyCredentialOfferUri,
  parseLegacyCredentialOfferUri,
  PreAuthorizedCodeGrantType,
} from "../index.js";

const bytes32 = new CompactTypeBytes(32);
const createBytes = (seed: number): Uint8Array =>
  Uint8Array.from({ length: 32 }, (_, index) => (seed + index) % 256);

const holderBinding = {
  method: "blinded_secret_commitment" as const,
  challenge: "0x1234abcd",
  blindedCommitment: "0xabcd1234",
  verifierDomain: "issuer.example",
};

const credentialResponseCompileTimeChecks = (): void => {
  createCredentialResponse({ credential: "credential-1", notification_id: "notification-1" });
  createCredentialResponse({ credentials: ["credential-1"], c_nonce: "nonce-1" });
  createCredentialResponse({ transaction_id: "transaction-1", notification_id: "notification-1" });
  createCredentialResponse({ error: "invalid_request" });
  // @ts-expect-error Immediate responses cannot include a protocol error.
  createCredentialResponse({ credential: "credential-1", error: "invalid_request" });
  // @ts-expect-error Immediate responses cannot include deferred transaction identifiers.
  createCredentialResponse({ credential: "credential-1", transaction_id: "transaction-1" });
  // @ts-expect-error Deferred responses cannot include immediate credentials.
  createCredentialResponse({ transaction_id: "transaction-1", credential: "credential-1" });
};
void credentialResponseCompileTimeChecks;

describe("OID4VCI-inspired Midnight credential schemas", () => {
  it("models pre-authorized issuance without tying the holder to a DID URL", () => {
    const metadata = createCredentialIssuerMetadata({
      credential_issuer: "https://issuer.example",
      credential_endpoint: "https://issuer.example/credentials",
      token_endpoint: "https://issuer.example/token",
      credential_configurations_supported: {
        passport_proxy_v1: {
          format: "midnight_compact_vc",
          scope: "passport_proxy",
          cryptographic_binding_methods_supported: [
            "blinded_secret_commitment",
          ],
          proof_types_supported: {
            jwt: {
              proof_signing_alg_values_supported: ["ES256", "EdDSA"],
            },
          },
          display: [{ name: "Midnight Passport Proxy" }],
        },
      },
    });

    const offer = createPreAuthorizedCredentialOffer({
      credentialIssuer: metadata.credential_issuer,
      credentialConfigurationIds: ["passport_proxy_v1"],
      preAuthorizedCode: "preauth-passport-1",
      txCode: { input_mode: "numeric", length: 6 },
    });
    const tokenRequest = createPreAuthorizedTokenRequest({
      offer,
      txCode: "123456",
    });
    const request = createCredentialRequest({
      credential_configuration_id: "passport_proxy_v1",
      format: "midnight_compact_vc",
      midnight: {
        holderBinding,
        requestedClaims: ["ageOver18", "countryCode"],
      },
    });
    const response = createCredentialResponse({
      credential: {
        format: "midnight_compact_vc",
        credentialFamily: "passport-secret",
        schemaId: "passport-proxy:v1",
        schemaVersion: "1.0",
        credential: encodeCompactPayload(bytes32, createBytes(1)),
        credentialProof: encodeCompactPayload(bytes32, createBytes(2)),
        holderBinding,
      },
      c_nonce: "issuer-c-nonce-1",
      c_nonce_expires_in: 300,
    });

    expect(offer.grants?.[PreAuthorizedCodeGrantType]?.["pre-authorized_code"])
      .toBe("preauth-passport-1");
    expect(tokenRequest.grant_type).toBe(PreAuthorizedCodeGrantType);
    expect(request.midnight?.holderBinding.method).toBe(
      "blinded_secret_commitment",
    );
    expect(response).toMatchObject({
      credential: {
        format: "midnight_compact_vc",
        credentialFamily: "passport-secret",
      },
    });
  });

  it("round-trips a credential offer URI", () => {
    const offer = createPreAuthorizedCredentialOffer({
      credentialIssuer: "https://issuer.example",
      credentialConfigurationIds: ["compliance_screening_v1"],
      preAuthorizedCode: "preauth-compliance-1",
    });

    const uri = legacyCredentialOfferUri({
      issuerOrigin: "https://issuer.example",
      offer,
    });

    expect(parseLegacyCredentialOfferUri(uri)).toEqual(offer);
  });

  it("accepts immediate credential notifications and rejects ambiguous responses", () => {
    const response = createCredentialResponse({
      credential: { id: "credential-1" },
      notification_id: "notification-1",
    });
    expect(response).toMatchObject({ notification_id: "notification-1" });
    expect(() => CredentialResponseSchema.parse({})).toThrow();
    expect(() => CredentialResponseSchema.parse({
      credential: { id: "credential-1" },
      credentials: [{ id: "credential-2" }],
    })).toThrow();
    expect(() => CredentialResponseSchema.parse({
      credential: { id: "credential-1" },
      error: "invalid_request",
    })).toThrow();
  });

  it("rejects empty credential configuration lists", () => {
    expect(() =>
      createPreAuthorizedCredentialOffer({
        credentialIssuer: "https://issuer.example",
        credentialConfigurationIds: [],
        preAuthorizedCode: "preauth-empty",
      }),
    ).toThrow();
  });
});
