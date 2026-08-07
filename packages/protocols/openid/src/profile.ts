import { z } from "zod";

import {
  decodeCompactValue,
  type EncodedCompactValue,
} from "./compact-value-codec.js";
import {
  Base64UrlSchema,
  JsonObjectSchema,
  NonEmptyStringSchema,
  PositiveIntegerSchema,
  UriSchema,
  UrlSchema,
} from "./shared.js";

/**
 * Incubating, transport-neutral profile boundary. This is deliberately not a
 * claim of complete OID4VCI/OID4VP conformance.
 */
export const MIDNIGHT_OPENID_PROFILE_V1 =
  "org.midnight.credentials.openid.v1" as const;

export const OpenIdCredentialFormatSchema = z.enum([
  "midnight_compact_vc",
  "jwt_vc_json",
  "jwt_vc_json-ld",
  "ldp_vc",
  "mso_mdoc",
]);
export type OpenIdCredentialFormat = z.infer<
  typeof OpenIdCredentialFormatSchema
>;

export const DcqlClaimSchema = z
  .strictObject({
    path: z.array(NonEmptyStringSchema).min(1),
    id: NonEmptyStringSchema.optional(),
    values: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).min(1).optional(),
  })
  .refine((claim) => claim.values === undefined || claim.values.length > 0, {
    message: "DCQL claim values must not be empty",
  });
export type DcqlClaim = z.infer<typeof DcqlClaimSchema>;

export const DcqlCredentialQuerySchema = z.strictObject({
  id: NonEmptyStringSchema,
  format: OpenIdCredentialFormatSchema,
  meta: JsonObjectSchema.optional(),
  claims: z.array(DcqlClaimSchema).min(1).optional(),
  require_cryptographic_holder_binding: z.boolean().optional(),
});
export type DcqlCredentialQuery = z.infer<typeof DcqlCredentialQuerySchema>;

export const DcqlCredentialSetSchema = z.strictObject({
  options: z.array(z.array(NonEmptyStringSchema).min(1)).min(1),
  required: z.boolean().optional(),
});
export type DcqlCredentialSet = z.infer<typeof DcqlCredentialSetSchema>;

export const DcqlQuerySchema = z
  .strictObject({
    credentials: z.array(DcqlCredentialQuerySchema).min(1),
    credential_sets: z.array(DcqlCredentialSetSchema).min(1).optional(),
  })
  .superRefine((query, context) => {
    const ids = query.credentials.map((credential) => credential.id);
    const definedIds = ids.filter((id): id is string => id !== undefined);
    if (new Set(definedIds).size !== definedIds.length) {
      context.addIssue({
        code: "custom",
        path: ["credentials"],
        message: "DCQL credential query ids must be unique",
      });
    }
    if (query.credential_sets) {
      const known = new Set(definedIds);
      query.credential_sets.forEach((set, index) => {
        const seenAlternatives = new Set<string>();
        set.options.forEach((alternative, alternativeIndex) => {
          const key = alternative.join("\u0000");
          if (seenAlternatives.has(key)) {
            context.addIssue({
              code: "custom",
              path: ["credential_sets", index, "options", alternativeIndex],
              message: "DCQL credential set alternatives must be unique",
            });
          }
          seenAlternatives.add(key);
          if (new Set(alternative).size !== alternative.length) {
            context.addIssue({
              code: "custom",
              path: ["credential_sets", index, "options", alternativeIndex],
              message: "DCQL credential set alternatives must not repeat query ids",
            });
          }
          if (alternative.some((id) => !known.has(id))) {
            context.addIssue({
              code: "custom",
              path: ["credential_sets", index, "options", alternativeIndex],
              message: "DCQL credential set references an unknown query id",
            });
          }
        });
      });
    }
  });
export type DcqlQuery = z.infer<typeof DcqlQuerySchema>;

export const AuthorizationDetailsSchema = z
  .strictObject({
    type: z.literal("openid_credential"),
    credential_configuration_id: NonEmptyStringSchema.optional(),
    credential_identifiers: z.array(NonEmptyStringSchema).min(1).optional(),
    locations: z.array(UrlSchema).min(1).optional(),
    format: OpenIdCredentialFormatSchema.optional(),
  })
  .refine(
    (details) =>
      (details.credential_configuration_id !== undefined) !==
      (details.credential_identifiers !== undefined),
    {
      message:
        "Authorization details require exactly one configuration id or identifier list",
      path: ["credential_configuration_id"],
    },
  );
export type AuthorizationDetails = z.infer<typeof AuthorizationDetailsSchema>;

export const IssuanceProofBindingSchema = z.strictObject({
  audience: UrlSchema,
  c_nonce: NonEmptyStringSchema,
  c_nonce_expires_in: PositiveIntegerSchema.optional(),
  request_digest: Base64UrlSchema,
});
export type IssuanceProofBinding = z.infer<typeof IssuanceProofBindingSchema>;

export const VpRequestBindingSchema = z.strictObject({
  client_id: NonEmptyStringSchema,
  nonce: NonEmptyStringSchema,
  request_digest: Base64UrlSchema,
  origin: UriSchema.optional(),
});
export type VpRequestBinding = z.infer<typeof VpRequestBindingSchema>;

export const assertVpRequestBinding = (input: {
  readonly binding: VpRequestBinding;
  readonly clientId: string;
  readonly nonce: string;
  readonly requestDigest: string;
  readonly origin?: string;
}): void => {
  if (input.binding.client_id !== input.clientId) {
    throw new Error("VP request client_id binding mismatch");
  }
  if (input.binding.nonce !== input.nonce) {
    throw new Error("VP request nonce binding mismatch");
  }
  if (input.binding.request_digest !== input.requestDigest) {
    throw new Error("VP request digest binding mismatch");
  }
  if (input.binding.origin !== input.origin) {
    throw new Error("VP request origin binding mismatch");
  }
};

export const CanonicalCompactMessageBindingSchema = z.strictObject({
  format: z.enum(["midnight_compact_vc", "midnight_compact_vp"]),
  payload: z.strictObject({
    encoding: z.literal("compact-value-v1.base64url"),
    payload: Base64UrlSchema,
  }),
  message_id: NonEmptyStringSchema,
  thread_id: NonEmptyStringSchema,
  responds_to_message_id: NonEmptyStringSchema.optional(),
});
export type CanonicalCompactMessageBinding = z.infer<
  typeof CanonicalCompactMessageBindingSchema
>;

export const RequestObjectReferenceSchema = z.strictObject({
  uri: UrlSchema,
  digest: Base64UrlSchema,
  audience: NonEmptyStringSchema,
  expires_at: PositiveIntegerSchema.optional(),
});
export type RequestObjectReference = z.infer<typeof RequestObjectReferenceSchema>;

export interface RequestObjectResolver {
  resolve(reference: RequestObjectReference): Promise<unknown> | unknown;
}

export interface RequestObjectVerifier {
  verify(input: {
    readonly reference: RequestObjectReference;
    readonly requestObject: unknown;
  }): Promise<void> | void;
}

export const CredentialFormatSelectionSchema = z
  .strictObject({
    requested: z.array(OpenIdCredentialFormatSchema).min(1),
    selected: OpenIdCredentialFormatSchema,
  })
  .refine((selection) => selection.requested.includes(selection.selected), {
    message: "Selected credential format was not requested",
    path: ["selected"],
  });
export type CredentialFormatSelection = z.infer<
  typeof CredentialFormatSelectionSchema
>;

export const DeferredCredentialResponseSchema = z.strictObject({
  transaction_id: NonEmptyStringSchema,
  notification_id: NonEmptyStringSchema.optional(),
  c_nonce: NonEmptyStringSchema.optional(),
  c_nonce_expires_in: PositiveIntegerSchema.optional(),
});
export type DeferredCredentialResponse = z.infer<
  typeof DeferredCredentialResponseSchema
>;

export const ProtocolErrorCodeSchema = z.enum([
  "invalid_request",
  "invalid_or_missing_proof",
  "invalid_or_missing_scope",
  "unsupported_credential_format",
  "unsupported_proof_type",
  "invalid_transaction_id",
  "issuance_pending",
  "invalid_presentation",
  "invalid_request_uri",
]);
export type ProtocolErrorCode = z.infer<typeof ProtocolErrorCodeSchema>;

export const DeferredCredentialStatusSchema = z.strictObject({
  transaction_id: NonEmptyStringSchema,
  status: z.enum(["pending", "ready", "failed", "expired"]),
  credential: z.unknown().optional(),
  credentials: z.array(z.unknown()).min(1).optional(),
  error: ProtocolErrorCodeSchema.optional(),
  expires_at: PositiveIntegerSchema.optional(),
}).superRefine((status, context) => {
  if (status.status === "ready" && status.credential === undefined && status.credentials === undefined) {
    context.addIssue({ code: "custom", path: ["credential"], message: "Ready deferred status requires credentials" });
  }
  if (status.status === "failed" && status.error === undefined) {
    context.addIssue({ code: "custom", path: ["error"], message: "Failed deferred status requires an error" });
  }
  if (status.status !== "ready" && (status.credential !== undefined || status.credentials !== undefined)) {
    context.addIssue({ code: "custom", path: ["status"], message: "Only ready deferred status may contain credentials" });
  }
});

export const ProtocolErrorSchema = z.strictObject({
  error: ProtocolErrorCodeSchema,
  error_description: NonEmptyStringSchema.optional(),
  error_uri: UrlSchema.optional(),
  c_nonce: NonEmptyStringSchema.optional(),
  c_nonce_expires_in: PositiveIntegerSchema.optional(),
});
export type ProtocolError = z.infer<typeof ProtocolErrorSchema>;

export const createDcqlQuery = (input: DcqlQuery): DcqlQuery =>
  DcqlQuerySchema.parse(input);

export const createCanonicalCompactMessageBinding = (input: {
  readonly format: CanonicalCompactMessageBinding["format"];
  readonly payload: EncodedCompactValue;
  readonly messageId: string;
  readonly threadId: string;
  readonly respondsToMessageId?: string;
}): CanonicalCompactMessageBinding => {
  decodeCompactValue(input.payload);
  return CanonicalCompactMessageBindingSchema.parse({
    format: input.format,
    payload: input.payload,
    message_id: input.messageId,
    thread_id: input.threadId,
    responds_to_message_id: input.respondsToMessageId,
  });
};

export const assertCanonicalThreadBinding = (input: {
  readonly message: CanonicalCompactMessageBinding;
  readonly expectedThreadId: string;
  readonly expectedResponseTo?: string;
}): void => {
  if (input.message.thread_id !== input.expectedThreadId) {
    throw new Error("Compact message thread_id does not match the expected thread");
  }
  if (input.expectedResponseTo !== undefined && input.message.responds_to_message_id !== input.expectedResponseTo) {
    throw new Error("Compact message responds_to_message_id does not match the expected message");
  }
};

export const createCredentialOfferReferenceUri = (input: {
  readonly issuerOrigin: string;
  readonly reference: string;
}): string => {
  const issuer = new URL(input.issuerOrigin);
  if (issuer.protocol !== "https:" || issuer.username || issuer.password) {
    throw new Error("Issuer origin must be an HTTPS origin without credentials");
  }
  const reference = new URL(input.reference);
  if (reference.protocol !== "https:" || reference.username || reference.password) {
    throw new Error("Credential offer reference must be an HTTPS URL without credentials");
  }
  if (input.reference.length > 512 || /[\r\n]/u.test(input.reference)) {
    throw new Error("Credential offer reference must be short and opaque");
  }
  const url = new URL("openid-credential-offer://");
  url.searchParams.set("credential_offer_uri", input.reference);
  url.searchParams.set("issuer_origin", issuer.origin);
  return url.toString();
};

export const parseCredentialOfferReferenceUri = (uri: string): {
  readonly issuerOrigin: string;
  readonly reference: string;
} => {
  const parsed = new URL(uri);
  if (
    parsed.protocol !== "openid-credential-offer:" ||
    parsed.host ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "" ||
    parsed.hash
  ) {
    throw new Error("Credential offer reference URI has an invalid outer authority");
  }
  const queryKeys = [...parsed.searchParams.keys()];
  const expectedKeys = ["credential_offer_uri", "issuer_origin"];
  if (
    queryKeys.length !== expectedKeys.length ||
    queryKeys.some((key) => !expectedKeys.includes(key)) ||
    new Set(queryKeys).size !== expectedKeys.length
  ) {
    throw new Error("Credential offer reference URI contains unexpected query parameters");
  }
  const reference = parsed.searchParams.get("credential_offer_uri");
  const issuerOrigin = parsed.searchParams.get("issuer_origin");
  if (!reference || !issuerOrigin) throw new Error("Credential offer reference URI is incomplete");
  const issuer = new URL(issuerOrigin);
  if (issuer.protocol !== "https:" || issuer.username || issuer.password) {
    throw new Error("Credential offer issuer origin must be HTTPS without credentials");
  }
  const referenceUrl = new URL(reference);
  if (referenceUrl.protocol !== "https:" || referenceUrl.username || referenceUrl.password) {
    throw new Error("Credential offer reference must be an HTTPS URL without credentials");
  }
  if (reference.length > 512 || /[\r\n]/u.test(reference)) throw new Error("Credential offer reference must be short and opaque");
  return { issuerOrigin: issuer.origin, reference };
};

export const mapDcqlToCanonicalCompactFormat = (
  query: DcqlCredentialQuery,
): "midnight_compact_vc" => {
  if (query.format !== "midnight_compact_vc") {
    throw new Error(`Unsupported Midnight canonical mapping for format "${query.format}"`);
  }
  return query.format;
};
