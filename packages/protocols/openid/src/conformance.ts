import { Buffer } from "node:buffer";
import { createHash, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

import { z } from "zod";

import {
  MidnightCredentialRequestExtensionSchema,
  MidnightDidMethodRefSchema,
  MidnightPresentationRequestExtensionSchema,
} from "./midnight.js";
import { DcqlQuerySchema, IssuanceProofBindingSchema, MIDNIGHT_OPENID_PROFILE_V1, VpRequestBindingSchema } from "./profile.js";
import { Base64UrlSchema, JsonValueSchema, NonEmptyStringSchema, PositiveIntegerSchema, UrlSchema } from "./shared.js";

export const OID4VCI_1_0_FINAL = "1.0 Final" as const;
export const OID4VCI_1_0_FINAL_SPEC =
  "https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-final.html" as const;
export const OID4VP_1_0_FINAL = "1.0 Final" as const;
export const OID4VP_1_0_FINAL_SPEC =
  "https://openid.net/specs/openid-4-verifiable-presentations-1_0-final.html" as const;

const DigestSchema = z.string().regex(/^[A-Za-z0-9_-]{16,}$/u, "Expected an unpadded digest");

const IssuanceSessionBindingSchema = z.strictObject({
  profile: z.literal(MIDNIGHT_OPENID_PROFILE_V1),
  protocol: z.literal("oid4vci"),
  protocol_version: z.literal(OID4VCI_1_0_FINAL),
  session_id: NonEmptyStringSchema,
  transcript_digest: DigestSchema,
  consent_digest: DigestSchema,
  issued_at: PositiveIntegerSchema,
  expires_at: PositiveIntegerSchema,
}).refine((binding) => binding.expires_at > binding.issued_at, {
  message: "Session expiry must be after issuance",
  path: ["expires_at"],
});

const PresentationSessionBindingSchema = z.strictObject({
  profile: z.literal(MIDNIGHT_OPENID_PROFILE_V1),
  protocol: z.literal("oid4vp"),
  protocol_version: z.literal(OID4VP_1_0_FINAL),
  session_id: NonEmptyStringSchema,
  transcript_digest: DigestSchema,
  consent_digest: DigestSchema,
  issued_at: PositiveIntegerSchema,
  expires_at: PositiveIntegerSchema,
}).refine((binding) => binding.expires_at > binding.issued_at, {
  message: "Session expiry must be after issuance",
  path: ["expires_at"],
});

export const MidnightOpenIdSessionBindingSchema = z.discriminatedUnion("protocol", [
  IssuanceSessionBindingSchema,
  PresentationSessionBindingSchema,
]);
export type MidnightOpenIdSessionBinding = z.infer<typeof MidnightOpenIdSessionBindingSchema>;

/** OID4VCI Final proof container with exactly one supported discriminator. */
export const MidnightIssuanceProofsSchema = z.union([
  z.strictObject({ jwt: z.array(NonEmptyStringSchema).min(1) }),
  z.strictObject({ attestation: z.array(NonEmptyStringSchema).min(1) }),
]);
export type MidnightIssuanceProofs = z.infer<typeof MidnightIssuanceProofsSchema>;

const CanonicalByteEncodingSchema = z.string().superRefine((value, context) => {
  if (value.startsWith("0x")) {
    if (!/^0x(?:[0-9a-f]{2})+$/u.test(value)) {
      context.addIssue({ code: "custom", message: "Expected canonical lowercase, even-length hexadecimal bytes" });
    }
    return;
  }
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) {
    context.addIssue({ code: "custom", message: "Expected canonical unpadded base64url bytes" });
    return;
  }
  const decoded = Buffer.from(value, "base64url");
  if (decoded.length === 0 || decoded.toString("base64url") !== value) {
    context.addIssue({ code: "custom", message: "Expected canonical unpadded base64url bytes" });
  }
});

const StrictHolderBindingSchema = z.discriminatedUnion("method", [
  z.strictObject({ method: z.literal("explicit_did_method"), challenge: CanonicalByteEncodingSchema, holderDidMethod: MidnightDidMethodRefSchema, verifierDomain: NonEmptyStringSchema.optional() }),
  z.strictObject({ method: z.literal("secret_commitment"), challenge: CanonicalByteEncodingSchema, secretCommitment: CanonicalByteEncodingSchema, verifierDomain: NonEmptyStringSchema.optional() }),
  z.strictObject({ method: z.literal("blinded_secret_commitment"), challenge: CanonicalByteEncodingSchema, blindedCommitment: CanonicalByteEncodingSchema, verifierDomain: NonEmptyStringSchema.optional() }),
]);
const StrictCredentialRequestExtensionSchema = MidnightCredentialRequestExtensionSchema
  .extend({ holderBinding: StrictHolderBindingSchema })
  .strict();

export const MidnightCredentialRequestProfileSchema = z.strictObject({
  credential_configuration_id: NonEmptyStringSchema,
  format: z.literal("midnight_compact_vc"),
  proofs: MidnightIssuanceProofsSchema,
  midnight: StrictCredentialRequestExtensionSchema,
  session_binding: IssuanceSessionBindingSchema,
});
export type MidnightCredentialRequestProfile = z.infer<typeof MidnightCredentialRequestProfileSchema>;

const MidnightCredentialResponseBindingShape = {
  request_digest: DigestSchema,
  session_binding: IssuanceSessionBindingSchema,
};
export const MidnightCredentialResponseProfileSchema = z.union([
  z.strictObject({
    credential: JsonValueSchema,
    ...MidnightCredentialResponseBindingShape,
  }),
  z.strictObject({
    transaction_id: NonEmptyStringSchema,
    ...MidnightCredentialResponseBindingShape,
  }),
]);
export type MidnightCredentialResponseProfile = z.infer<typeof MidnightCredentialResponseProfileSchema>;

const StrictMidnightDcqlSchema = DcqlQuerySchema.superRefine((query, context) => {
  query.credentials.forEach((credential, index) => {
    if (credential.format !== "midnight_compact_vc") {
      context.addIssue({ code: "custom", path: ["credentials", index, "format"], message: "Midnight DCQL requires midnight_compact_vc" });
    }
    if (credential.require_cryptographic_holder_binding !== true) {
      context.addIssue({ code: "custom", path: ["credentials", index, "require_cryptographic_holder_binding"], message: "Midnight DCQL requires cryptographic holder binding" });
    }
  });
});

const StrictVpRequestBindingSchema = VpRequestBindingSchema.extend({ origin: UrlSchema });

/** The strict profile uses DCQL inside OID4VP; Presentation Exchange is not an alternative selector here. */
export const MidnightVpAuthorizationRequestProfileSchema = z.strictObject({
  response_type: z.literal("vp_token"),
  response_mode: z.literal("direct_post"),
  client_id: NonEmptyStringSchema,
  response_uri: UrlSchema,
  state: NonEmptyStringSchema,
  nonce: NonEmptyStringSchema,
  dcql_query: StrictMidnightDcqlSchema,
  request_digest: DigestSchema,
  midnight: MidnightPresentationRequestExtensionSchema.strict(),
  request_binding: StrictVpRequestBindingSchema,
  session_binding: PresentationSessionBindingSchema,
});
export type MidnightVpAuthorizationRequestProfile = z.infer<typeof MidnightVpAuthorizationRequestProfileSchema>;

const DcqlVpTokenSchema = z.record(NonEmptyStringSchema, z.array(JsonValueSchema).min(1));

type DcqlVpToken = z.infer<typeof DcqlVpTokenSchema>;

const assertExactDcqlResultIds = (vpToken: DcqlVpToken, requiredIds: readonly string[]): void => {
  const required = new Set(requiredIds);
  const resultIds = Object.keys(vpToken);
  if (
    requiredIds.length === 0 ||
    required.size !== requiredIds.length ||
    requiredIds.some((id) => id.length === 0) ||
    resultIds.length !== required.size ||
    resultIds.some((id) => !required.has(id))
  ) {
    throw new Error("OID4VP vp_token does not exactly satisfy the requested DCQL query ids");
  }
};

export const MidnightVpAuthorizationResponseProfileSchema = z.strictObject({
  state: NonEmptyStringSchema,
  vp_token: DcqlVpTokenSchema,
  request_digest: DigestSchema,
  request_binding: StrictVpRequestBindingSchema,
  session_binding: PresentationSessionBindingSchema,
});
export type MidnightVpAuthorizationResponseProfile = z.infer<typeof MidnightVpAuthorizationResponseProfileSchema>;

export interface OpenIdClock {
  now(): number;
}

export interface OpenIdReplayStore {
  /** Must atomically return true only for the first consumption of a key. */
  consume(key: string, expiresAt: number): Promise<boolean> | boolean;
}

export class InMemoryOpenIdReplayStore implements OpenIdReplayStore {
  readonly #consumed = new Map<string, number>();

  consume(key: string, expiresAt: number): boolean {
    if (this.#consumed.has(key)) return false;
    this.#consumed.set(key, expiresAt);
    return true;
  }
}

export interface OpenIdConsentVerifier {
  verify(input: {
    readonly purpose: "issuance" | "presentation-request" | "presentation-response";
    readonly sessionId: string;
    readonly consentDigest: string;
  }): Promise<boolean> | boolean;
}

export interface IssuanceProofVerifier {
  verify(input: {
    readonly proofType: "jwt" | "attestation";
    readonly proof: string;
  }): Promise<z.infer<typeof IssuanceProofBindingSchema>> | z.infer<typeof IssuanceProofBindingSchema>;
}

export interface OAuthAccessTokenValidator {
  validateBearer(input: {
    readonly accessToken: string;
    readonly audience: string;
    readonly credentialConfigurationId: string;
  }): Promise<void> | void;
}

export interface MidnightProfileValidationPorts {
  readonly clock: OpenIdClock;
  readonly replay: OpenIdReplayStore;
  readonly consent: OpenIdConsentVerifier;
  readonly oauth: OAuthAccessTokenValidator;
  readonly issuanceProofs: IssuanceProofVerifier;
}

interface ExpectedSession {
  readonly sessionId: string;
  readonly transcriptDigest: string;
  readonly consentDigest: string;
  readonly issuedAt: number;
  readonly expiresAt: number;
}

const assertSession = async (
  binding: MidnightOpenIdSessionBinding,
  expected: ExpectedSession,
  purpose: Parameters<OpenIdConsentVerifier["verify"]>[0]["purpose"],
  ports: MidnightProfileValidationPorts,
): Promise<void> => {
  if (binding.session_id !== expected.sessionId) throw new Error("OpenID session binding mismatch");
  if (binding.transcript_digest !== expected.transcriptDigest) throw new Error("OpenID transcript binding mismatch");
  if (binding.consent_digest !== expected.consentDigest) throw new Error("OpenID consent binding mismatch");
  if (binding.issued_at !== expected.issuedAt || binding.expires_at !== expected.expiresAt) throw new Error("OpenID authoritative session lifetime mismatch");
  const now = ports.clock.now();
  if (binding.issued_at > now) throw new Error("OpenID session is not active yet");
  if (binding.expires_at <= now) throw new Error("OpenID session has expired");
  if (!await ports.consent.verify({ purpose, sessionId: binding.session_id, consentDigest: binding.consent_digest })) {
    throw new Error("OpenID wallet consent was not verified");
  }
};

const consumeReplay = async (
  namespace: string,
  binding: MidnightOpenIdSessionBinding,
  nonce: string,
  digest: string,
  ports: MidnightProfileValidationPorts,
): Promise<void> => {
  const key = `${namespace}:${binding.session_id}:${nonce}:${digest}`;
  if (!await ports.replay.consume(key, binding.expires_at)) throw new Error("OpenID replay detected");
};

export const validateMidnightCredentialRequest = async (input: {
  readonly request: unknown;
  readonly accessToken: string;
  readonly expected: ExpectedSession & {
    readonly audience: string;
    readonly cNonce: string;
    readonly requestDigest: string;
  };
  readonly ports: MidnightProfileValidationPorts;
}): Promise<MidnightCredentialRequestProfile> => {
  const request = MidnightCredentialRequestProfileSchema.parse(input.request);
  const proofs = "jwt" in request.proofs
    ? request.proofs.jwt.map((proof) => ({ proofType: "jwt" as const, proof }))
    : request.proofs.attestation.map((proof) => ({ proofType: "attestation" as const, proof }));
  for (const proof of proofs) {
    const binding = IssuanceProofBindingSchema.parse(await input.ports.issuanceProofs.verify(proof));
    if (binding.audience !== input.expected.audience) throw new Error("OID4VCI verified proof audience binding mismatch");
    if (binding.c_nonce !== input.expected.cNonce) throw new Error("OID4VCI verified proof c_nonce binding mismatch");
    if (binding.request_digest !== input.expected.requestDigest) throw new Error("OID4VCI verified proof request digest binding mismatch");
  }
  await input.ports.oauth.validateBearer({
    accessToken: input.accessToken,
    audience: input.expected.audience,
    credentialConfigurationId: request.credential_configuration_id,
  });
  await assertSession(request.session_binding, input.expected, "issuance", input.ports);
  await consumeReplay("oid4vci-proof", request.session_binding, input.expected.cNonce, input.expected.requestDigest, input.ports);
  return request;
};

export const validateMidnightCredentialResponse = async (input: {
  readonly response: unknown;
  readonly expected: ExpectedSession & { readonly requestDigest: string };
  readonly ports: MidnightProfileValidationPorts;
}): Promise<MidnightCredentialResponseProfile> => {
  const response = MidnightCredentialResponseProfileSchema.parse(input.response);
  if (response.request_digest !== input.expected.requestDigest) throw new Error("OID4VCI response request digest binding mismatch");
  await assertSession(response.session_binding, input.expected, "issuance", input.ports);
  await consumeReplay("oid4vci-response", response.session_binding, response.session_binding.session_id, response.request_digest, input.ports);
  return response;
};

export const validateMidnightVpRequest = async (input: {
  readonly request: unknown;
  readonly expected: ExpectedSession & {
    readonly clientId: string;
    readonly nonce: string;
    readonly requestDigest: string;
    readonly origin: string;
    readonly responseUri: string;
  };
  readonly ports: MidnightProfileValidationPorts;
}): Promise<MidnightVpAuthorizationRequestProfile> => {
  const request = MidnightVpAuthorizationRequestProfileSchema.parse(input.request);
  if (request.client_id !== input.expected.clientId || request.request_binding.client_id !== input.expected.clientId) throw new Error("OID4VP client_id binding mismatch");
  if (request.nonce !== input.expected.nonce || request.request_binding.nonce !== input.expected.nonce) throw new Error("OID4VP nonce binding mismatch");
  if (request.request_digest !== input.expected.requestDigest || request.request_binding.request_digest !== input.expected.requestDigest) throw new Error("OID4VP request digest binding mismatch");
  if (request.request_binding.origin !== input.expected.origin) throw new Error("OID4VP origin binding mismatch");
  assertExactOrigin(request.request_binding.origin, "OID4VP origin");
  if (request.response_uri !== input.expected.responseUri) throw new Error("OID4VP response_uri binding mismatch");
  assertExactHttpsUrl(request.response_uri, "OID4VP response URI");
  await assertSession(request.session_binding, input.expected, "presentation-request", input.ports);
  await consumeReplay("oid4vp-request", request.session_binding, request.nonce, request.request_digest, input.ports);
  return request;
};

export const validateMidnightVpResponse = async (input: {
  readonly response: unknown;
  readonly expected: ExpectedSession & {
    readonly state: string;
    readonly clientId: string;
    readonly nonce: string;
    readonly requestDigest: string;
    readonly origin: string;
    readonly dcqlQueryIds: readonly string[];
  };
  readonly ports: MidnightProfileValidationPorts;
}): Promise<MidnightVpAuthorizationResponseProfile> => {
  const response = MidnightVpAuthorizationResponseProfileSchema.parse(input.response);
  if (response.state !== input.expected.state) throw new Error("OID4VP state binding mismatch");
  if (response.request_digest !== input.expected.requestDigest || response.request_binding.request_digest !== input.expected.requestDigest) throw new Error("OID4VP response request digest binding mismatch");
  if (response.request_binding.client_id !== input.expected.clientId) throw new Error("OID4VP response client_id binding mismatch");
  if (response.request_binding.nonce !== input.expected.nonce) throw new Error("OID4VP response nonce binding mismatch");
  if (response.request_binding.origin !== input.expected.origin) throw new Error("OID4VP response origin binding mismatch");
  assertExactOrigin(response.request_binding.origin, "OID4VP response origin");
  assertExactDcqlResultIds(response.vp_token, input.expected.dcqlQueryIds);
  await assertSession(response.session_binding, input.expected, "presentation-response", input.ports);
  await consumeReplay("oid4vp-response", response.session_binding, response.request_binding.nonce, response.request_digest, input.ports);
  return response;
};

export interface StrictRequestObjectReference {
  readonly uri: string;
  readonly digest: string;
  readonly audience: string;
  readonly expires_at: number;
}

export interface RequestObjectHttpClient {
  /** Must connect only to approvedAddresses, disable redirects, and stop at maxBytes. */
  get(input: {
    readonly uri: string;
    readonly approvedAddresses: readonly string[];
    readonly maxBytes: number;
    readonly redirect: "error";
  }): Promise<{
    readonly status: number;
    readonly finalUrl: string;
    readonly contentType: string;
    readonly remoteAddress: string;
    readonly body: Uint8Array;
  }>;
}

export interface StrictRequestObjectVerifier {
  verify(input: {
    readonly reference: StrictRequestObjectReference;
    readonly body: Uint8Array;
    readonly contentType: string;
  }): Promise<void> | void;
}

export interface RequestObjectFetchPolicy {
  readonly audience: string;
  readonly allowedHosts: readonly string[];
  readonly now: number;
  readonly maxBytes?: number;
  readonly resolveHost: (hostname: string) => Promise<readonly string[]> | readonly string[];
}

const assertExactHttpsUrl = (value: string, label: string): URL => {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new Error(`${label} must be an HTTPS URL without credentials or fragment`);
  }
  return url;
};

const assertExactOrigin = (value: string, label: string): URL => {
  const url = assertExactHttpsUrl(value, label);
  if (url.href !== url.origin && url.href !== `${url.origin}/`) throw new Error(`${label} must not contain a path, query, or fragment`);
  return url;
};

const parseIpv4 = (address: string): number =>
  address.split(".").reduce((value, octet) => (value * 256) + Number(octet), 0) >>> 0;

const ipv4InCidr = (value: number, base: string, prefix: number): boolean => {
  const shift = 32 - prefix;
  return shift === 32 || (value >>> shift) === (parseIpv4(base) >>> shift);
};

const specialUseIpv4Cidrs = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.31.196.0", 24], ["192.52.193.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16],
  ["192.175.48.0", 24], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const;

const isGlobalIpv4 = (address: string): boolean => {
  const value = parseIpv4(address);
  return !specialUseIpv4Cidrs.some(([base, prefix]) => ipv4InCidr(value, base, prefix));
};

const ipv6Bytes = (address: string): Uint8Array => {
  let normalized = address.toLowerCase();
  const dottedIndex = normalized.lastIndexOf(":");
  if (normalized.includes(".") && dottedIndex >= 0) {
    const ipv4 = parseIpv4(normalized.slice(dottedIndex + 1));
    normalized = `${normalized.slice(0, dottedIndex)}:${(ipv4 >>> 16).toString(16)}:${(ipv4 & 0xffff).toString(16)}`;
  }
  const halves = normalized.split("::");
  if (halves.length > 2) throw new Error("Invalid IPv6 address");
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const zeroCount = 8 - left.length - right.length;
  const groups = halves.length === 2 ? [...left, ...Array<string>(zeroCount).fill("0"), ...right] : left;
  if (groups.length !== 8) throw new Error("Invalid IPv6 address");
  return Uint8Array.from(groups.flatMap((group) => {
    const value = Number.parseInt(group, 16);
    return [value >>> 8, value & 0xff];
  }));
};

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  bytes.reduce((value, byte) => (value << 8n) | BigInt(byte), 0n);

const ipv6InCidr = (value: bigint, base: string, prefix: number): boolean => {
  const shift = BigInt(128 - prefix);
  return (value >> shift) === (bytesToBigInt(ipv6Bytes(base)) >> shift);
};

const isEmbeddedIpv4 = (bytes: Uint8Array): boolean => {
  const firstTenZero = bytes.slice(0, 10).every((byte) => byte === 0);
  return firstTenZero && (
    (bytes[10] === 0xff && bytes[11] === 0xff) ||
    (bytes[10] === 0 && bytes[11] === 0)
  );
};

const isGlobalIpv6 = (address: string): boolean => {
  const bytes = ipv6Bytes(address);
  if (isEmbeddedIpv4(bytes)) {
    return isGlobalIpv4(`${bytes[12]}.${bytes[13]}.${bytes[14]}.${bytes[15]}`);
  }
  const value = bytesToBigInt(bytes);
  if (!ipv6InCidr(value, "2000::", 3)) return false;
  return ![
    ["2001::", 23],
    ["2001:db8::", 32],
    ["2002::", 16],
    ["2620:4f:8000::", 48],
    ["3fff::", 20],
  ].some(([base, prefix]) => ipv6InCidr(value, base as string, prefix as number));
};

const normalizedAddressKey = (address: string): string | null => {
  const normalized = address.replace(/^\[|\]$/gu, "").toLowerCase();
  const version = isIP(normalized);
  if (version === 4) return `v4:${parseIpv4(normalized)}`;
  if (version !== 6) return null;
  const bytes = ipv6Bytes(normalized);
  if (isEmbeddedIpv4(bytes)) return `v4:${parseIpv4(`${bytes[12]}.${bytes[13]}.${bytes[14]}.${bytes[15]}`)}`;
  return `v6:${bytesToBigInt(bytes).toString(16)}`;
};

const isPublicAddress = (address: string): boolean => {
  const normalized = address.replace(/^\[|\]$/gu, "").toLowerCase();
  const version = isIP(normalized);
  return version === 4 ? isGlobalIpv4(normalized) : version === 6 ? isGlobalIpv6(normalized) : false;
};

export const resolveAndValidateRequestObject = async (input: {
  readonly reference: StrictRequestObjectReference;
  readonly policy: RequestObjectFetchPolicy;
  readonly http: RequestObjectHttpClient;
  readonly verifier: StrictRequestObjectVerifier;
}): Promise<Uint8Array> => {
  const url = assertExactHttpsUrl(input.reference.uri, "Request object URI");
  if (input.reference.audience !== input.policy.audience) throw new Error("Request object audience binding mismatch");
  if (input.reference.expires_at <= input.policy.now) throw new Error("Request object has expired");
  if (!input.policy.allowedHosts.includes(url.hostname)) throw new Error("Request object host is not allow-listed");
  const addresses = await input.policy.resolveHost(url.hostname);
  if (addresses.length === 0 || addresses.some((address) => !isPublicAddress(address))) {
    throw new Error("Request object host must resolve only to public addresses");
  }
  const maxBytes = input.policy.maxBytes ?? 64 * 1024;
  const response = await input.http.get({
    uri: url.href,
    approvedAddresses: addresses,
    maxBytes,
    redirect: "error",
  });
  if (response.status !== 200) throw new Error(`Request object HTTP status ${response.status}`);
  if (response.finalUrl !== url.href) throw new Error("Request object redirect is forbidden");
  const approvedAddressKeys = new Set(addresses.map(normalizedAddressKey));
  if (!approvedAddressKeys.has(normalizedAddressKey(response.remoteAddress)) || !isPublicAddress(response.remoteAddress)) {
    throw new Error("Request object connection did not use an approved public address");
  }
  if (response.body.byteLength === 0 || response.body.byteLength > maxBytes) throw new Error("Request object size is outside policy");
  if (!new Set(["application/oauth-authz-req+jwt", "application/jwt"]).has(response.contentType.split(";", 1)[0].trim().toLowerCase())) {
    throw new Error("Request object content type is unsupported");
  }
  const computed = createHash("sha256").update(response.body).digest();
  if (!/^[A-Za-z0-9_-]{43}$/u.test(input.reference.digest)) throw new Error("Request object digest is malformed");
  const expected = Buffer.from(input.reference.digest, "base64url");
  if (expected.length !== 32 || expected.toString("base64url") !== input.reference.digest) throw new Error("Request object digest is malformed");
  if (!timingSafeEqual(computed, expected)) throw new Error("Request object digest mismatch");
  await input.verifier.verify({ reference: input.reference, body: response.body, contentType: response.contentType });
  return response.body;
};

export const OpenIdConformanceFixtureKindSchema = z.enum([
  "oid4vci-request",
  "oid4vci-response",
  "oid4vp-request",
  "oid4vp-response",
]);
export type OpenIdConformanceFixtureKind = z.infer<typeof OpenIdConformanceFixtureKindSchema>;

export const OpenIdConformanceFixtureSchema = z.strictObject({
  id: NonEmptyStringSchema.optional(),
  kind: OpenIdConformanceFixtureKindSchema,
  valid: z.boolean().optional(),
  value: z.unknown(),
  expectedDcqlQueryIds: z.array(NonEmptyStringSchema).min(1).optional(),
}).superRefine((fixture, context) => {
  if (fixture.kind === "oid4vp-response" && fixture.expectedDcqlQueryIds === undefined) {
    context.addIssue({ code: "custom", path: ["expectedDcqlQueryIds"], message: "OID4VP response fixtures require DCQL query ids" });
  }
  if (fixture.kind !== "oid4vp-response" && fixture.expectedDcqlQueryIds !== undefined) {
    context.addIssue({ code: "custom", path: ["expectedDcqlQueryIds"], message: "Only OID4VP response fixtures use DCQL query ids" });
  }
});
export type OpenIdConformanceFixture = z.infer<typeof OpenIdConformanceFixtureSchema>;

const PositiveFixtureDefinitionSchema = OpenIdConformanceFixtureSchema.and(z.object({
  id: NonEmptyStringSchema,
  valid: z.literal(true),
}));
const MutationSchema = z.union([
  z.strictObject({ path: z.array(z.union([NonEmptyStringSchema, z.number().int().nonnegative()])).min(1), value: z.unknown() }),
  z.strictObject({ path: z.array(z.union([NonEmptyStringSchema, z.number().int().nonnegative()])).min(1), remove: z.literal(true) }),
]);
const NegativeFixtureDefinitionSchema = z.strictObject({
  id: NonEmptyStringSchema,
  kind: OpenIdConformanceFixtureKindSchema,
  valid: z.literal(false),
  baseId: NonEmptyStringSchema,
  mutation: MutationSchema,
});

export interface MaterializedOpenIdConformanceFixture extends OpenIdConformanceFixture {
  readonly id: string;
  readonly valid: boolean;
}

const applyFixtureMutation = (baseValue: unknown, mutation: z.infer<typeof MutationSchema>): unknown => {
  const result: unknown = JSON.parse(JSON.stringify(baseValue));
  let parent: unknown = result;
  for (const segment of mutation.path.slice(0, -1)) {
    if (typeof parent !== "object" || parent === null || !(segment in parent)) throw new Error(`Fixture mutation path does not exist: ${mutation.path.join(".")}`);
    parent = (parent as Record<string | number, unknown>)[segment];
  }
  if (typeof parent !== "object" || parent === null) throw new Error(`Fixture mutation parent does not exist: ${mutation.path.join(".")}`);
  const key = mutation.path.at(-1)!;
  if ("remove" in mutation) delete (parent as Record<string | number, unknown>)[key];
  else (parent as Record<string | number, unknown>)[key] = mutation.value;
  return result;
};

export const materializeConformanceFixtures = (
  positiveDefinitions: readonly unknown[],
  negativeDefinitions: readonly unknown[],
): readonly MaterializedOpenIdConformanceFixture[] => {
  const positives = positiveDefinitions.map((definition) => PositiveFixtureDefinitionSchema.parse(definition));
  const byId = new Map(positives.map((fixture) => [fixture.id, fixture]));
  if (byId.size !== positives.length) throw new Error("Conformance fixture ids must be unique");
  for (const fixture of positives) {
    if (!evaluateConformanceFixture(fixture)) throw new Error(`${fixture.id}: negative fixtures require an otherwise conformant base`);
  }
  const negatives = negativeDefinitions.map((definition): MaterializedOpenIdConformanceFixture => {
    const negative = NegativeFixtureDefinitionSchema.parse(definition);
    const base = byId.get(negative.baseId);
    if (!base) throw new Error(`${negative.id}: unknown positive base ${negative.baseId}`);
    if (base.kind !== negative.kind) throw new Error(`${negative.id}: mutation kind does not match base`);
    return {
      id: negative.id,
      kind: negative.kind,
      valid: false,
      value: applyFixtureMutation(base.value, negative.mutation),
      ...(base.expectedDcqlQueryIds === undefined ? {} : { expectedDcqlQueryIds: base.expectedDcqlQueryIds }),
    };
  });
  if (new Set([...positives.map(({ id }) => id), ...negatives.map(({ id }) => id)]).size !== positives.length + negatives.length) {
    throw new Error("Conformance fixture ids must be unique");
  }
  return [...positives, ...negatives];
};

export const evaluateConformanceFixture = (input: unknown): boolean => {
  try {
    const fixture = OpenIdConformanceFixtureSchema.parse(input);
    if (fixture.kind === "oid4vci-request") MidnightCredentialRequestProfileSchema.parse(fixture.value);
    else if (fixture.kind === "oid4vci-response") MidnightCredentialResponseProfileSchema.parse(fixture.value);
    else if (fixture.kind === "oid4vp-request") MidnightVpAuthorizationRequestProfileSchema.parse(fixture.value);
    else {
      const response = MidnightVpAuthorizationResponseProfileSchema.parse(fixture.value);
      assertExactDcqlResultIds(response.vp_token, fixture.expectedDcqlQueryIds!);
    }
    return true;
  } catch {
    return false;
  }
};
