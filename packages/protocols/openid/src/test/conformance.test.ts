import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import {
  InMemoryOpenIdReplayStore,
  MIDNIGHT_OPENID_PROFILE_V1,
  MidnightCredentialRequestProfileSchema,
  MidnightCredentialResponseProfileSchema,
  type MidnightProfileValidationPorts,
  MidnightVpAuthorizationRequestProfileSchema,
  MidnightVpAuthorizationResponseProfileSchema,
  OID4VCI_1_0_FINAL,
  OID4VCI_1_0_FINAL_SPEC,
  OID4VP_1_0_FINAL,
  OID4VP_1_0_FINAL_SPEC,
  resolveAndValidateRequestObject,
  validateMidnightCredentialRequest,
  validateMidnightCredentialResponse,
  validateMidnightVpRequest,
  validateMidnightVpResponse,
} from "../index.js";

const digest = (value: string): string =>
  createHash("sha256").update(value).digest("base64url");

const now = 1_800_000_000;
const transcriptDigest = digest("canonical-transcript");
const consentDigest = digest("wallet-consent");
const requestDigest = digest("request-object");
const expectedSession = {
  sessionId: "session-503",
  transcriptDigest,
  consentDigest,
  issuedAt: now - 1,
  expiresAt: now + 300,
};

const sessionBinding = (protocol: "oid4vci" | "oid4vp") => ({
  profile: MIDNIGHT_OPENID_PROFILE_V1,
  protocol,
  protocol_version:
    protocol === "oid4vci" ? OID4VCI_1_0_FINAL : OID4VP_1_0_FINAL,
  session_id: "session-503",
  transcript_digest: transcriptDigest,
  consent_digest: consentDigest,
  issued_at: now - 1,
  expires_at: now + 300,
});

const credentialRequest = () => ({
  credential_configuration_id: "age-v1",
  format: "midnight_compact_vc" as const,
  proofs: {
    jwt: ["eyJhbGciOiJFZERTQSJ9.e30.signature"],
  },
  midnight: {
    holderBinding: {
      method: "secret_commitment" as const,
      challenge: "0x1234",
      secretCommitment: "0xabcd",
    },
    requestedClaims: ["ageOver18"],
  },
  session_binding: sessionBinding("oid4vci"),
});

const vpRequest = () => ({
  response_type: "vp_token" as const,
  response_mode: "direct_post" as const,
  client_id: "did:midnight:verifier:503",
  response_uri: "https://verifier.example/callback",
  state: "callback-state-503",
  nonce: "verifier-nonce-503",
  dcql_query: {
    credentials: [
      {
        id: "age-proof",
        format: "midnight_compact_vc" as const,
        claims: [{ path: ["credentialSubject", "ageOver18"] }],
        require_cryptographic_holder_binding: true,
      },
    ],
  },
  request_digest: requestDigest,
  midnight: {
    verifierDomain: "verifier.example",
    challenge: "0xcafe",
    acceptedCredentialFamilies: ["birth-secret"],
    requireSameHolder: false,
    predicateHints: [],
  },
  request_binding: {
    client_id: "did:midnight:verifier:503",
    nonce: "verifier-nonce-503",
    request_digest: requestDigest,
    origin: "https://verifier.example",
  },
  session_binding: sessionBinding("oid4vp"),
});

const vpResponse = () => ({
  state: "callback-state-503",
  vp_token: { "age-proof": [{ profile: "opaque-canonical-family-presentation" }] },
  request_digest: requestDigest,
  request_binding: vpRequest().request_binding,
  session_binding: sessionBinding("oid4vp"),
});

const ports = (): MidnightProfileValidationPorts => ({
  clock: { now: () => now },
  replay: new InMemoryOpenIdReplayStore(),
  consent: { verify: vi.fn(() => true) },
  oauth: { validateBearer: vi.fn(() => undefined) },
  issuanceProofs: {
    verify: vi.fn(() => ({
      audience: "https://issuer.example/credential",
      c_nonce: "issuer-nonce-503",
      request_digest: requestDigest,
    })),
  },
});

describe("strict Midnight OpenID Final profile", () => {
  it("pins the exact Final specifications and identifies DCQL as OID4VP functionality", () => {
    expect({ OID4VCI_1_0_FINAL, OID4VCI_1_0_FINAL_SPEC }).toEqual({
      OID4VCI_1_0_FINAL: "1.0 Final",
      OID4VCI_1_0_FINAL_SPEC:
        "https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-final.html",
    });
    expect({ OID4VP_1_0_FINAL, OID4VP_1_0_FINAL_SPEC }).toEqual({
      OID4VP_1_0_FINAL: "1.0 Final",
      OID4VP_1_0_FINAL_SPEC:
        "https://openid.net/specs/openid-4-verifiable-presentations-1_0-final.html",
    });
    expect(MidnightVpAuthorizationRequestProfileSchema.parse(vpRequest()).dcql_query.credentials).toHaveLength(1);
  });

  it("accepts positive OID4VCI and OID4VP/DCQL lifecycles through injected OAuth/session seams", async () => {
    const validationPorts = ports();
    await expect(validateMidnightCredentialRequest({
      request: credentialRequest(),
      accessToken: "access-token-503",
      expected: {
        audience: "https://issuer.example/credential",
        cNonce: "issuer-nonce-503",
        requestDigest,
        ...expectedSession,
      },
      ports: validationPorts,
    })).resolves.toMatchObject({ format: "midnight_compact_vc" });

    await expect(validateMidnightCredentialResponse({
      response: {
        credential: { canonical_message: "opaque-family-bytes" },
        request_digest: requestDigest,
        session_binding: sessionBinding("oid4vci"),
      },
      expected: { requestDigest, ...expectedSession },
      ports: validationPorts,
    })).resolves.toMatchObject({ request_digest: requestDigest });

    await expect(validateMidnightVpRequest({
      request: vpRequest(),
      expected: {
        clientId: "did:midnight:verifier:503",
        nonce: "verifier-nonce-503",
        requestDigest,
        origin: "https://verifier.example",
        responseUri: "https://verifier.example/callback",
        ...expectedSession,
      },
      ports: validationPorts,
    })).resolves.toMatchObject({ response_type: "vp_token" });

    await expect(validateMidnightVpResponse({
      response: vpResponse(),
      expected: {
        state: "callback-state-503",
        clientId: "did:midnight:verifier:503",
        nonce: "verifier-nonce-503",
        requestDigest,
        origin: "https://verifier.example",
        dcqlQueryIds: ["age-proof"],
        ...expectedSession,
      },
      ports: validationPorts,
    })).resolves.toMatchObject({ state: "callback-state-503" });
    expect(validationPorts.oauth.validateBearer).toHaveBeenCalledOnce();
    expect(validationPorts.consent.verify).toHaveBeenCalledTimes(4);
  });

  it("rejects malformed and ambiguous proof discriminators and missing Midnight bindings", () => {
    for (const proofs of [
      { jwt: [] },
      { jwt: ["jwt"], attestation: ["also-present"] },
      { attestation: [] },
      { jwt: "not-an-array" },
      { unknown: ["proof"] },
    ]) {
      expect(() => MidnightCredentialRequestProfileSchema.parse({ ...credentialRequest(), proofs })).toThrow();
    }
    const { midnight: _midnight, ...withoutMidnight } = credentialRequest();
    expect(() => MidnightCredentialRequestProfileSchema.parse(withoutMidnight)).toThrow();
    expect(() => MidnightCredentialRequestProfileSchema.parse({
      ...credentialRequest(),
      midnight: {
        ...credentialRequest().midnight,
        holderBinding: {
          ...credentialRequest().midnight.holderBinding,
          blindedCommitment: "0xambiguous",
        },
      },
    })).toThrow();
    const { session_binding: _session, ...withoutSession } = vpRequest();
    expect(() => MidnightVpAuthorizationRequestProfileSchema.parse(withoutSession)).toThrow();
    expect(() => MidnightCredentialResponseProfileSchema.parse({
      credential: "credential",
      transaction_id: "ambiguous",
      request_digest: requestDigest,
      session_binding: sessionBinding("oid4vci"),
    })).toThrow();
  });

  it("requires canonical byte encodings for holder challenges and commitments", () => {
    for (const [field, value] of [
      ["challenge", "0x123"],
      ["challenge", "0xABCD"],
      ["challenge", "a"],
      ["secretCommitment", "0xabc"],
      ["secretCommitment", "0xABCD"],
      ["secretCommitment", "%%%"],
    ] as const) {
      const request = credentialRequest();
      request.midnight.holderBinding = {
        ...request.midnight.holderBinding,
        [field]: value,
      };
      expect(() => MidnightCredentialRequestProfileSchema.parse(request), `${field}=${value}`).toThrow();
    }

    const blinded = credentialRequest();
    blinded.midnight.holderBinding = {
      method: "blinded_secret_commitment",
      challenge: "EjQ",
      blindedCommitment: "q80",
    } as never;
    expect(MidnightCredentialRequestProfileSchema.parse(blinded).midnight.holderBinding).toEqual(blinded.midnight.holderBinding);
    for (const [field, value] of [["challenge", "0x1"], ["blindedCommitment", "0xABC0"], ["blindedCommitment", "a"]] as const) {
      expect(() => MidnightCredentialRequestProfileSchema.parse({
        ...blinded,
        midnight: { ...blinded.midnight, holderBinding: { ...blinded.midnight.holderBinding, [field]: value } },
      }), `${field}=${value}`).toThrow();
    }
  });

  it("rejects nonce, audience, origin, redirect, session, transcript, consent, expiry and replay attacks", async () => {
    const forgedProofPorts = ports();
    forgedProofPorts.issuanceProofs.verify = vi.fn(() => {
      throw new Error("signature invalid");
    });
    await expect(validateMidnightCredentialRequest({
      request: credentialRequest(),
      accessToken: "token",
      expected: { audience: "https://issuer.example/credential", cNonce: "issuer-nonce-503", requestDigest, ...expectedSession },
      ports: forgedProofPorts,
    })).rejects.toThrow(/signature invalid/);

    const mutationCases = [
      ["audience", { audience: "https://evil.example/credential" }],
      ["c_nonce", { cNonce: "substituted" }],
      ["request digest", { requestDigest: digest("substituted") }],
      ["session", { sessionId: "other-session" }],
      ["transcript", { transcriptDigest: digest("other-transcript") }],
      ["consent", { consentDigest: digest("other-consent") }],
    ] as const;
    for (const [label, expectedMutation] of mutationCases) {
      await expect(validateMidnightCredentialRequest({
        request: credentialRequest(), accessToken: "token",
        expected: {
          audience: "https://issuer.example/credential",
          cNonce: "issuer-nonce-503",
          requestDigest,
          ...expectedSession,
          ...expectedMutation,
        },
        ports: ports(),
      }), label).rejects.toThrow();
    }

    for (const expectedMutation of [
      { nonce: "substituted" },
      { origin: "https://evil.example" },
      { responseUri: "https://evil.example/callback" },
      { sessionId: "other-session" },
      { transcriptDigest: digest("other-transcript") },
      { consentDigest: digest("other-consent") },
    ]) {
      await expect(validateMidnightVpRequest({
        request: vpRequest(),
        expected: {
          clientId: "did:midnight:verifier:503", nonce: "verifier-nonce-503",
          requestDigest, origin: "https://verifier.example",
          responseUri: "https://verifier.example/callback",
          ...expectedSession, ...expectedMutation,
        },
        ports: ports(),
      })).rejects.toThrow();
    }

    const expired = credentialRequest();
    expired.session_binding.issued_at = now - 100;
    expired.session_binding.expires_at = now - 1;
    await expect(validateMidnightCredentialRequest({
      request: expired, accessToken: "token",
      expected: {
        audience: "https://issuer.example/credential",
        cNonce: "issuer-nonce-503",
        requestDigest,
        ...expectedSession,
        issuedAt: now - 100,
        expiresAt: now - 1,
      },
      ports: ports(),
    })).rejects.toThrow(/expired/);

    const extended = credentialRequest();
    extended.session_binding.expires_at = now + 30_000;
    await expect(validateMidnightCredentialRequest({
      request: extended,
      accessToken: "token",
      expected: { audience: "https://issuer.example/credential", cNonce: "issuer-nonce-503", requestDigest, ...expectedSession },
      ports: ports(),
    })).rejects.toThrow(/authoritative session lifetime/);

    const replayPorts = ports();
    const input = {
      request: credentialRequest(), accessToken: "token",
      expected: { audience: "https://issuer.example/credential", cNonce: "issuer-nonce-503", requestDigest, ...expectedSession },
      ports: replayPorts,
    };
    await validateMidnightCredentialRequest(input);
    await expect(validateMidnightCredentialRequest(input)).rejects.toThrow(/replay/i);

    await expect(validateMidnightVpResponse({
      response: { ...vpResponse(), vp_token: { "substituted-query": [{}] } },
      expected: {
        state: "callback-state-503",
        clientId: "did:midnight:verifier:503",
        nonce: "verifier-nonce-503",
        requestDigest,
        origin: "https://verifier.example",
        dcqlQueryIds: ["age-proof"],
        ...expectedSession,
      },
      ports: ports(),
    })).rejects.toThrow(/DCQL query ids/);

    const normalPorts = ports();
    const denied: MidnightProfileValidationPorts = {
      ...normalPorts,
      consent: { verify: vi.fn(() => false) },
    };
    await expect(validateMidnightVpRequest({
      request: vpRequest(),
      expected: { clientId: "did:midnight:verifier:503", nonce: "verifier-nonce-503", requestDigest, origin: "https://verifier.example", responseUri: "https://verifier.example/callback", ...expectedSession },
      ports: denied,
    })).rejects.toThrow(/consent/i);
  });

  it("rejects unsupported JARM mode, ambiguous descriptor/DCQL requests, and malformed DCQL holder binding", () => {
    expect(() => MidnightVpAuthorizationRequestProfileSchema.parse({
      ...vpRequest(),
      response_mode: "direct_post.jwt",
    })).toThrow(/direct_post/);
    expect(() => MidnightVpAuthorizationRequestProfileSchema.parse({
      ...vpRequest(),
      presentation_definition: { id: "ambiguous", input_descriptors: [{ id: "one" }] },
    })).toThrow();
    expect(() => MidnightVpAuthorizationRequestProfileSchema.parse({
      ...vpRequest(),
      dcql_query: { credentials: [{ id: "age", format: "midnight_compact_vc", require_cryptographic_holder_binding: false }] },
    })).toThrow(/holder binding/);
    expect(() => MidnightVpAuthorizationResponseProfileSchema.parse({ ...vpResponse(), state: undefined })).toThrow();
    for (const vp_token of [null, "presentation", 1, [], { "age-proof": [] }]) {
      expect(() => MidnightVpAuthorizationResponseProfileSchema.parse({ ...vpResponse(), vp_token })).toThrow();
    }
  });

  it("requires the DCQL vp_token result map to contain exactly every requested query id", async () => {
    const expected = {
      state: "callback-state-503",
      clientId: "did:midnight:verifier:503",
      nonce: "verifier-nonce-503",
      requestDigest,
      origin: "https://verifier.example",
      dcqlQueryIds: ["age-proof", "residency-proof"],
      ...expectedSession,
    };
    const valid = {
      ...vpResponse(),
      vp_token: {
        "age-proof": [{ profile: "age" }],
        "residency-proof": [{ profile: "residency" }],
      },
    };
    await expect(validateMidnightVpResponse({ response: valid, expected, ports: ports() })).resolves.toMatchObject({ vp_token: valid.vp_token });

    for (const vp_token of [
      null,
      "presentation",
      [{ profile: "array-not-map" }],
      { "unrelated-query": [{ profile: "unrelated" }] },
      { "age-proof": [{ profile: "missing-residency" }] },
      { ...valid.vp_token, extra: [{ profile: "extra" }] },
      { ...valid.vp_token, "age-proof": [] },
    ]) {
      await expect(validateMidnightVpResponse({ response: { ...valid, vp_token }, expected, ports: ports() })).rejects.toThrow();
    }
  });
});

describe("request-object HTTP and SSRF boundary", () => {
  it("accepts exact HTTPS bytes through injected HTTP and verifier seams", async () => {
    const body = new TextEncoder().encode(JSON.stringify(vpRequest()));
    const verifier = vi.fn(() => undefined);
    const get = vi.fn(async () => ({ status: 200, finalUrl: "https://verifier.example/requests/one-time-503", contentType: "application/oauth-authz-req+jwt", remoteAddress: "8.8.8.8", body }));
    await expect(resolveAndValidateRequestObject({
      reference: {
        uri: "https://verifier.example/requests/one-time-503",
        digest: createHash("sha256").update(body).digest("base64url"),
        audience: "did:midnight:wallet:503",
        expires_at: now + 60,
      },
      policy: {
        audience: "did:midnight:wallet:503",
        allowedHosts: ["verifier.example"],
        now,
        resolveHost: () => ["8.8.8.8"],
      },
      http: { get },
      verifier: { verify: verifier },
    })).resolves.toEqual(body);
    expect(verifier).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith({
      uri: "https://verifier.example/requests/one-time-503",
      approvedAddresses: ["8.8.8.8"],
      maxBytes: 65_536,
      redirect: "error",
    });
  });

  it("rejects private/link-local hosts, redirects, digest substitution, oversized and expired objects", async () => {
    const body = new TextEncoder().encode("request");
    const base = {
      reference: { uri: "https://verifier.example/request", digest: digest("request"), audience: "wallet", expires_at: now + 60 },
      policy: { audience: "wallet", allowedHosts: ["verifier.example"], now, resolveHost: () => ["8.8.8.8"] },
      http: { get: async () => ({ status: 200, finalUrl: "https://verifier.example/request", contentType: "application/oauth-authz-req+jwt", remoteAddress: "8.8.8.8", body }) },
      verifier: { verify: () => undefined },
    };
    for (const specialUseAddress of [
      "0.0.0.1", "10.0.0.1", "100.64.0.1", "127.0.0.1", "169.254.1.1",
      "172.16.0.1", "192.0.0.9", "192.0.2.1", "192.31.196.1", "192.52.193.1",
      "192.88.99.1", "192.168.0.1", "192.175.48.1", "198.18.0.1", "198.19.255.255",
      "198.51.100.1", "203.0.113.1", "224.0.0.1", "240.0.0.1",
      "::", "::1", "::ffff:10.0.0.1", "::ffff:a00:1", "::10.0.0.1",
      "64:ff9b::808:808", "64:ff9b:1::1", "100::1", "2001::1", "2001:2::1",
      "2001:3::1", "2001:4:112::1", "2001:10::1", "2001:20::1", "2001:30::1",
      "2001:0db8::1", "2002:0808:0808::1", "2620:4f:8000::1", "3fff::1", "5f00::1", "fc00::1",
      "fe80::1", "fec0::1", "ff00::1",
    ]) {
      await expect(resolveAndValidateRequestObject({
        ...base,
        policy: { ...base.policy, resolveHost: () => [specialUseAddress] },
      }), specialUseAddress).rejects.toThrow(/public/);
    }
    await expect(resolveAndValidateRequestObject({
      ...base,
      policy: { ...base.policy, resolveHost: () => ["::ffff:8.8.8.8"] },
      http: { get: async () => ({ ...(await base.http.get()), remoteAddress: "::ffff:8.8.8.8" }) },
    })).resolves.toEqual(body);
    await expect(resolveAndValidateRequestObject({ ...base, reference: { ...base.reference, uri: "https://[::1]/request" }, policy: { ...base.policy, allowedHosts: ["[::1]"], resolveHost: () => ["::1"] } })).rejects.toThrow(/public/);
    await expect(resolveAndValidateRequestObject({ ...base, http: { get: async () => ({ ...(await base.http.get()), finalUrl: "https://evil.example/request" }) } })).rejects.toThrow(/redirect/);
    await expect(resolveAndValidateRequestObject({ ...base, http: { get: async () => ({ ...(await base.http.get()), remoteAddress: "127.0.0.1" }) } })).rejects.toThrow(/approved public/);
    await expect(resolveAndValidateRequestObject({ ...base, reference: { ...base.reference, digest: digest("tampered") } })).rejects.toThrow(/digest/);
    await expect(resolveAndValidateRequestObject({ ...base, reference: { ...base.reference, digest: `${digest("request")}%%%` } })).rejects.toThrow(/malformed/);
    await expect(resolveAndValidateRequestObject({ ...base, policy: { ...base.policy, maxBytes: 3 } })).rejects.toThrow(/size/);
    await expect(resolveAndValidateRequestObject({ ...base, reference: { ...base.reference, expires_at: now - 1 } })).rejects.toThrow(/expired/);
  });
});
