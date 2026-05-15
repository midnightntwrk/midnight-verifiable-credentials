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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const encodeUniversityProtocolTransportValue = (
  value: unknown,
): EncodedTransportValue => {
  if (value === null) {
    return null;
  }
  if (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
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
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        encodeUniversityProtocolTransportValue(entry),
      ]),
    );
  }
  throw new TypeError(
    `Unsupported university protocol transport value ${String(value)}`,
  );
};

export const decodeUniversityProtocolTransportValue = (
  value: EncodedTransportValue,
): unknown => {
  if (!isRecord(value)) {
    return Array.isArray(value)
      ? value.map((entry) => decodeUniversityProtocolTransportValue(entry))
      : value;
  }

  if (value[transportTypeKey] === "bigint") {
    return BigInt(value.value as string);
  }
  if (value[transportTypeKey] === "bytes") {
    return new Uint8Array(Buffer.from(value.value as string, "base64"));
  }
  if (value[transportTypeKey] === "undefined") {
    return undefined;
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
