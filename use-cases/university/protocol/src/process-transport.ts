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

const hasOwn = (
  value: Record<string, EncodedTransportValue>,
  key: string,
): boolean => Object.prototype.hasOwnProperty.call(value, key);

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
      const bigintValue = assertStringField(value, "value", "bigint");
      if (!/^-?\d+$/u.test(bigintValue)) {
        throw new TypeError(
          "Malformed university protocol transport bigint value",
        );
      }
      return BigInt(bigintValue);
    }
    if (tag === "bytes") {
      return new Uint8Array(
        Buffer.from(assertStringField(value, "value", "bytes"), "base64"),
      );
    }
    if (tag === "undefined") {
      if (hasOwn(value, "value")) {
        throw new TypeError(
          "Malformed university protocol transport undefined value",
        );
      }
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
  decodeUniversityProtocolTransportValue(
    JSON.parse(payload) as EncodedTransportValue,
  ) as UniversityProtocolMessage;

/**
 * MessageBus-compatible transport that forces every university protocol message
 * through a JSON serialization boundary before delivery. It is intentionally
 * still in-process; the value is catching DTO shapes that would not survive a
 * real issuer/student/verifier process boundary.
 */
export class SerializedUniversityProtocolTransport extends MessageBus {
  readonly #queues = new Map<PartyId, string[]>();
  readonly #frames: UniversityProtocolTransportFrame[] = [];

  override send(message: ProtocolMessage): void {
    const typedMessage = message as UniversityProtocolMessage;
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
