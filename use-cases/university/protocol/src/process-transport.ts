import {
  MessageBus,
  type PartyId,
  type ProtocolMessage,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";

import { universityProtocolMessageIdHex } from "./flow-messages.js";
import type { UniversityProtocolMessage } from "./model.js";

const transportTypeKey = "__midnightUniversityProtocolTransportType";

type EncodedTransportValue =
  | null
  | boolean
  | number
  | string
  | readonly EncodedTransportValue[]
  | {
      readonly [key: string]: EncodedTransportValue;
    };

export type UniversityProtocolTransportFrame = {
  readonly sequence: number;
  readonly type: UniversityProtocolMessage["type"];
  readonly from: PartyId;
  readonly to: PartyId;
  readonly messageIdHex: string;
  readonly threadIdHex: string;
  readonly respondsToHex: string;
  readonly payloadBytes: number;
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
};

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const describeUnsupportedValue = (value: unknown): string =>
  Object.prototype.toString.call(value);

const assertStringField = (
  value: Record<string, EncodedTransportValue>,
  field: string,
  tag: string,
): string => {
  const fieldValue = value[field];
  if (typeof fieldValue !== "string") {
    throw new TypeError(
      `Malformed university protocol transport ${tag} value: expected string field "${field}"`,
    );
  }
  return fieldValue;
};

const assertExactTaggedFields = (
  value: Record<string, EncodedTransportValue>,
  tag: string,
  fields: readonly string[],
): void => {
  const actualFields = Object.keys(value).sort();
  const expectedFields = [...fields].sort();
  if (
    actualFields.length !== expectedFields.length ||
    actualFields.some((field, index) => field !== expectedFields[index])
  ) {
    throw new TypeError(
      `Malformed university protocol transport ${tag} value: unexpected tagged fields`,
    );
  }
};

const assertCanonicalBase64 = (value: string): void => {
  // The encoder emits standard Node base64, not base64url.
  if (
    !/^[A-Za-z0-9+/]*={0,2}$/u.test(value) ||
    value.length % 4 !== 0 ||
    Buffer.from(value, "base64").toString("base64") !== value
  ) {
    throw new TypeError(
      "Malformed university protocol transport bytes value: expected canonical base64",
    );
  }
};

const universityProtocolMessageTypeRecord: Record<
  UniversityProtocolMessage["type"],
  true
> = {
  "issuance:request": true,
  "issuance:result": true,
  "presentation:request": true,
  "presentation:result": true,
  "presentation:submission": true,
};

const universityProtocolMessageTypes = new Set(
  Object.keys(
    universityProtocolMessageTypeRecord,
  ) as Array<UniversityProtocolMessage["type"]>,
);

const hasUniversityProtocolMessageType = (
  value: string,
): value is UniversityProtocolMessage["type"] =>
  universityProtocolMessageTypes.has(
    value as UniversityProtocolMessage["type"],
  );

const hasProtocolEnvelopeShape = (value: unknown): boolean =>
  // `createEnvelope` always materializes `expiresAt` as a bigint; when
  // `hasExpiresAt` is false the semantic value is the zero bigint.
  isPlainRecord(value) &&
  typeof value.version === "bigint" &&
  value.messageId instanceof Uint8Array &&
  value.threadId instanceof Uint8Array &&
  typeof value.initialMessage === "boolean" &&
  value.respondsToMessageId instanceof Uint8Array &&
  typeof value.createdAt === "bigint" &&
  typeof value.hasExpiresAt === "boolean" &&
  typeof value.expiresAt === "bigint";

const requireUniversityProtocolMessage = (
  message: unknown,
): UniversityProtocolMessage => {
  if (!isPlainRecord(message)) {
    throw new TypeError(
      "Serialized university protocol transport only accepts university protocol messages with protocol envelopes",
    );
  }
  const candidate = message as ProtocolMessage;
  // This guard validates the transport envelope and university message
  // discriminator. Message bodies stay protocol-owned and are validated by the
  // receiving issuer/verifier handlers.
  if (
    typeof candidate.type !== "string" ||
    !hasUniversityProtocolMessageType(candidate.type) ||
    typeof candidate.from !== "string" ||
    typeof candidate.to !== "string" ||
    !hasProtocolEnvelopeShape(candidate.envelope)
  ) {
    throw new TypeError(
      "Serialized university protocol transport only accepts university protocol messages with protocol envelopes",
    );
  }
  return candidate as UniversityProtocolMessage;
};

export const encodeUniversityProtocolTransportValue = (
  value: unknown,
): EncodedTransportValue => {
  if (value === null) {
    return null;
  }
  if (
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(
        `Unsupported university protocol transport number ${String(value)}`,
      );
    }
    return value;
  }
  if (typeof value === "bigint") {
    return {
      [transportTypeKey]: "bigint",
      value: value.toString(),
    };
  }
  if (typeof value === "undefined") {
    return {
      [transportTypeKey]: "undefined",
    };
  }
  if (value instanceof Uint8Array) {
    return {
      [transportTypeKey]: "bytes",
      value: Buffer.from(value).toString("base64"),
    };
  }
  if (Array.isArray(value)) {
    return value.map((entry) => encodeUniversityProtocolTransportValue(entry));
  }
  if (isPlainRecord(value)) {
    if (hasOwn(value, transportTypeKey)) {
      throw new TypeError(
        `Unsupported university protocol transport value: reserved transport key "${transportTypeKey}"`,
      );
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        encodeUniversityProtocolTransportValue(entry),
      ]),
    );
  }
  throw new TypeError(
    `Unsupported university protocol transport value ${describeUnsupportedValue(value)}`,
  );
};

export const decodeUniversityProtocolTransportValue = (
  value: EncodedTransportValue,
): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => decodeUniversityProtocolTransportValue(entry));
  }
  if (!isPlainRecord(value)) {
    return value;
  }

  if (hasOwn(value, transportTypeKey)) {
    const tag = value[transportTypeKey];
    if (tag === "bigint") {
      assertExactTaggedFields(value, "bigint", [transportTypeKey, "value"]);
      const bigintValue = assertStringField(value, "value", "bigint");
      if (!/^-?\d+$/u.test(bigintValue)) {
        throw new TypeError(
          "Malformed university protocol transport bigint value",
        );
      }
      return BigInt(bigintValue);
    }
    if (tag === "bytes") {
      assertExactTaggedFields(value, "bytes", [transportTypeKey, "value"]);
      const bytesValue = assertStringField(value, "value", "bytes");
      assertCanonicalBase64(bytesValue);
      return new Uint8Array(Buffer.from(bytesValue, "base64"));
    }
    if (tag === "undefined") {
      assertExactTaggedFields(value, "undefined", [transportTypeKey]);
      return undefined;
    }
    throw new TypeError(
      `Malformed university protocol transport tag ${String(tag)}`,
    );
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      decodeUniversityProtocolTransportValue(entry),
    ]),
  );
};

const encodeMessage = (message: ProtocolMessage): string =>
  JSON.stringify(encodeUniversityProtocolTransportValue(message));

const decodeMessage = (payload: string): UniversityProtocolMessage =>
  requireUniversityProtocolMessage(
    decodeUniversityProtocolTransportValue(
      JSON.parse(payload) as EncodedTransportValue,
    ),
  );

/**
 * MessageBus-compatible transport that forces every university protocol message
 * through a JSON serialization boundary before delivery. It is intentionally
 * still in-process; the value is catching DTO shapes that would not survive a
 * real issuer/student/verifier process boundary.
 *
 * The transport is exported as a development/runtime seam for future standalone
 * harnesses. `trace()` is send-side only: receiving parties decode queued
 * payloads without appending additional receive frames.
 *
 * This class subclasses `MessageBus` only to remain injectable into existing
 * runner APIs; it overrides all stateful bus methods because the queue payloads
 * are serialized strings instead of in-memory message objects.
 */
export class SerializedUniversityProtocolTransport extends MessageBus {
  readonly #queues = new Map<PartyId, string[]>();
  readonly #frames: UniversityProtocolTransportFrame[] = [];

  override send(message: ProtocolMessage): void {
    const typedMessage = requireUniversityProtocolMessage(message);
    const payload = encodeMessage(typedMessage);
    const queue = this.#queues.get(typedMessage.to) ?? [];
    queue.push(payload);
    this.#queues.set(typedMessage.to, queue);
    this.#frames.push({
      sequence: this.#frames.length,
      type: typedMessage.type,
      from: typedMessage.from,
      to: typedMessage.to,
      messageIdHex: universityProtocolMessageIdHex(
        typedMessage.envelope.messageId,
      ),
      threadIdHex: universityProtocolMessageIdHex(
        typedMessage.envelope.threadId,
      ),
      respondsToHex: universityProtocolMessageIdHex(
        typedMessage.envelope.respondsToMessageId,
      ),
      payloadBytes: Buffer.byteLength(payload, "utf8"),
    });
  }

  override receive(party: PartyId): ProtocolMessage | undefined {
    const queue = this.#queues.get(party);
    if (!queue || queue.length === 0) {
      return undefined;
    }
    return decodeMessage(queue.shift()!);
  }

  override drain(party: PartyId): ProtocolMessage[] {
    const queue = this.#queues.get(party) ?? [];
    this.#queues.set(party, []);
    return queue.map((payload) => decodeMessage(payload));
  }

  override pending(party: PartyId): number {
    return this.#queues.get(party)?.length ?? 0;
  }

  trace(): readonly UniversityProtocolTransportFrame[] {
    return this.#frames.map((frame) => ({ ...frame }));
  }

  totalPayloadBytes(): number {
    return this.#frames.reduce((sum, frame) => sum + frame.payloadBytes, 0);
  }
}
