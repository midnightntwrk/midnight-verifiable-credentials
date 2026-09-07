import { Buffer } from "node:buffer";

import { MIDNIGHT_OPENID_PROFILE_V1 } from "./profile.js";

export type CanonicalFamilyMessageKind =
  | "issuance-offer"
  | "issuance-request"
  | "credential"
  | "presentation-request"
  | "presentation";

/** Structural input accepted from credential-exchange without a forbidden package edge. */
export interface CanonicalFamilyMessageLike<
  TKind extends CanonicalFamilyMessageKind = CanonicalFamilyMessageKind,
> {
  readonly familyId: string;
  readonly familyVersion: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly kind: TKind;
  readonly mediaType: string;
  readonly payload: Uint8Array;
}

export interface CanonicalMessageThreadBinding {
  readonly messageId: string;
  readonly threadId: string;
  readonly respondsToMessageId?: string;
}

export interface CanonicalMessageEnvelope {
  readonly message: CanonicalFamilyMessageLike;
  readonly threading: CanonicalMessageThreadBinding;
}

export interface DelegatedPresentationVerification<TResult, TAuthorityContext, TFamilyInput> {
  verify(
    presentation: CanonicalFamilyMessageLike<"presentation">,
    request: CanonicalFamilyMessageLike<"presentation-request">,
    authorityContext: TAuthorityContext,
    familyInput?: TFamilyInput,
  ): TResult;
}

export interface OpenIdCanonicalMessageWire {
  readonly profile: typeof MIDNIGHT_OPENID_PROFILE_V1;
  readonly family_id: string;
  readonly family_version: string;
  readonly schema_id: string;
  readonly schema_version: string;
  readonly kind: CanonicalFamilyMessageKind;
  readonly media_type: string;
  readonly payload: string;
  readonly message_id: string;
  readonly thread_id: string;
  readonly responds_to_message_id?: string;
}

const wireKeys = new Set([
  "profile",
  "family_id",
  "family_version",
  "schema_id",
  "schema_version",
  "kind",
  "media_type",
  "payload",
  "message_id",
  "thread_id",
  "responds_to_message_id",
]);
const requiredWireKeys = [...wireKeys].filter((key) => key !== "responds_to_message_id");
const kinds = new Set<CanonicalFamilyMessageKind>([
  "issuance-offer",
  "issuance-request",
  "credential",
  "presentation-request",
  "presentation",
]);

function assertText(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`OpenID canonical message ${name} must be non-empty text`);
}

/**
 * A byte-preserving outer adapter. It intentionally neither parses family
 * payloads nor interprets verification/aggregate-decision results.
 */
export class OpenIdCanonicalMessageAdapter {
  wrap(message: CanonicalFamilyMessageLike, threading: CanonicalMessageThreadBinding): OpenIdCanonicalMessageWire {
    if (!(message.payload instanceof Uint8Array) || message.payload.length === 0) {
      throw new Error("Canonical family payload must contain bytes");
    }
    assertText(threading.messageId, "message_id");
    assertText(threading.threadId, "thread_id");
    if (threading.respondsToMessageId !== undefined) assertText(threading.respondsToMessageId, "responds_to_message_id");
    return {
      profile: MIDNIGHT_OPENID_PROFILE_V1,
      family_id: message.familyId,
      family_version: message.familyVersion,
      schema_id: message.schemaId,
      schema_version: message.schemaVersion,
      kind: message.kind,
      media_type: message.mediaType,
      payload: Buffer.from(message.payload).toString("base64url"),
      message_id: threading.messageId,
      thread_id: threading.threadId,
      ...(threading.respondsToMessageId === undefined ? {} : { responds_to_message_id: threading.respondsToMessageId }),
    };
  }

  unwrap(wire: OpenIdCanonicalMessageWire): CanonicalMessageEnvelope {
    if (typeof wire !== "object" || wire === null || Array.isArray(wire)) throw new Error("OpenID canonical message must be an object");
    const record = wire as unknown as Record<string, unknown>;
    if (Object.keys(record).some((key) => !wireKeys.has(key)) || requiredWireKeys.some((key) => !(key in record))) {
      throw new Error("OpenID canonical message contains unknown or missing fields");
    }
    if (record.profile !== MIDNIGHT_OPENID_PROFILE_V1) throw new Error("OpenID canonical message profile mismatch");
    const familyId = record.family_id;
    const familyVersion = record.family_version;
    const schemaId = record.schema_id;
    const schemaVersion = record.schema_version;
    const mediaType = record.media_type;
    const encodedPayload = record.payload;
    const messageId = record.message_id;
    const threadId = record.thread_id;
    const respondsToMessageId = record.responds_to_message_id;
    assertText(familyId, "family_id");
    assertText(familyVersion, "family_version");
    assertText(schemaId, "schema_id");
    assertText(schemaVersion, "schema_version");
    assertText(mediaType, "media_type");
    assertText(messageId, "message_id");
    assertText(threadId, "thread_id");
    if (respondsToMessageId !== undefined) assertText(respondsToMessageId, "responds_to_message_id");
    if (typeof record.kind !== "string" || !kinds.has(record.kind as CanonicalFamilyMessageKind)) throw new Error("OpenID canonical message kind is unsupported");
    assertText(encodedPayload, "payload");
    if (!/^[A-Za-z0-9_-]+$/u.test(encodedPayload)) throw new Error("OpenID canonical message payload must be base64url");
    const payload = Buffer.from(encodedPayload, "base64url");
    if (payload.length === 0 || payload.toString("base64url") !== encodedPayload) throw new Error("OpenID canonical message payload must be canonical base64url");
    return {
      message: {
        familyId,
        familyVersion,
        schemaId,
        schemaVersion,
        kind: record.kind as CanonicalFamilyMessageKind,
        mediaType,
        payload: Uint8Array.from(payload),
      },
      threading: {
        messageId,
        threadId,
        ...(respondsToMessageId === undefined ? {} : { respondsToMessageId }),
      },
    };
  }
}

/** Delegates canonical validity to the injected family/#499 verifier unchanged. */
export class OpenIdDelegatingVerificationAdapter<TResult, TAuthorityContext, TFamilyInput = unknown> {
  constructor(
    private readonly verification: DelegatedPresentationVerification<TResult, TAuthorityContext, TFamilyInput>,
    private readonly messages = new OpenIdCanonicalMessageAdapter(),
  ) {}

  verify(
    presentation: OpenIdCanonicalMessageWire,
    request: OpenIdCanonicalMessageWire,
    authorityContext: TAuthorityContext,
    familyInput?: TFamilyInput,
  ): TResult {
    const canonicalPresentation = this.messages.unwrap(presentation);
    const canonicalRequest = this.messages.unwrap(request);
    if (canonicalPresentation.threading.threadId !== canonicalRequest.threading.threadId || canonicalPresentation.threading.respondsToMessageId !== canonicalRequest.threading.messageId) {
      throw new Error("OpenID canonical message thread binding mismatch");
    }
    if (canonicalPresentation.message.kind !== "presentation" || canonicalRequest.message.kind !== "presentation-request") {
      throw new Error("OpenID verification requires presentation and presentation-request canonical messages");
    }
    return this.verification.verify(
      canonicalPresentation.message as CanonicalFamilyMessageLike<"presentation">,
      canonicalRequest.message as CanonicalFamilyMessageLike<"presentation-request">,
      authorityContext,
      familyInput,
    );
  }
}
