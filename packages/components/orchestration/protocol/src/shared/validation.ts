/**
 * Lightweight runtime validation for protocol message bodies.
 *
 * These guards check that a message body has the expected shape before
 * casting. They do NOT perform deep schema validation — they verify that
 * key discriminating fields exist and the message type matches expectations.
 */

import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import type { ProtocolMessage, ProtocolMessageType } from "../transport/types.js";

const equalBytes = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const equivalent = (left: unknown, right: unknown): boolean => {
  if (left === right) {
    return true;
  }
  if (typeof left !== typeof right || left == null || right == null) {
    return false;
  }
  if (left instanceof Uint8Array && right instanceof Uint8Array) {
    return equalBytes(left, right);
  }
  if (typeof left !== "object" || typeof right !== "object") {
    return false;
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => equivalent(value, right[index]))
    );
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key, index) =>
        key === rightKeys[index] &&
        equivalent(leftRecord[key], rightRecord[key]),
    )
  );
};

/**
 * Checks that the envelope carried by a transport wrapper is the same
 * envelope carried by the generated protocol body. Correlation must not be
 * reconstructed from a parsed wrapper after these two values diverge.
 */
export function assertProtocolMessageEnvelopeAlignment(
  message: ProtocolMessage,
): void {
  const body = message.body as { readonly envelope?: unknown };
  if (!body || typeof body !== "object" || body.envelope == null) {
    throw new Error("Protocol message body is missing its envelope");
  }
  if (!equivalent(message.envelope, body.envelope)) {
    throw new Error(
      "Protocol message envelope does not match the envelope in its body",
    );
  }
}

/** Compare parsed values for protocol correlation and replay checks. */
export function protocolValuesEquivalent(left: unknown, right: unknown): boolean {
  return equivalent(left, right);
}

/** Compare parsed messages for the reference exact-message replay rule. */
export function protocolMessagesEquivalent(
  left: ProtocolMessage,
  right: ProtocolMessage,
): boolean {
  return equivalent(left, right);
}

const canonicalValue = (value: unknown): string => {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "bigint") return `bigint:${value.toString(10)}`;
  if (typeof value === "string") return `string:${JSON.stringify(value)}`;
  if (typeof value === "number") return `number:${value}`;
  if (typeof value === "boolean") return `boolean:${value}`;
  if (value instanceof Uint8Array) {
    return `bytes:${Buffer.from(value).toString("hex")}`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalValue).join(",")}]`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalValue(record[key])}`)
      .join(",")}}`;
  }
  return `${typeof value}:${String(value)}`;
};

/**
 * Digest signed by a protocol sender. Authentication is excluded to avoid a
 * self-reference; every routing field, envelope field, and body field remains
 * covered by the signature.
 */
export function protocolMessageAuthenticationDigest(
  message: ProtocolMessage,
): Uint8Array {
  const { authentication: _authentication, ...unsignedMessage } = message;
  return new Uint8Array(
    createHash("sha256")
      .update(canonicalValue(unsignedMessage), "utf8")
      .digest(),
  );
}

/** A bounded replay identity that does not retain the request payload. */
export function protocolMessageDigest(message: ProtocolMessage): Uint8Array {
  return new Uint8Array(
    createHash("sha256").update(canonicalValue(message), "utf8").digest(),
  );
}

export function assertMessageType(
  message: ProtocolMessage,
  expectedType: ProtocolMessageType,
): void {
  if (message.type !== expectedType) {
    throw new Error(
      `Expected message type "${expectedType}", got "${message.type}"`,
    );
  }
}

export function assertBodyHasFields(
  message: ProtocolMessage,
  fields: readonly string[],
): void {
  const body = message.body as Record<string, unknown>;
  if (body == null || typeof body !== "object") {
    throw new Error("Message body is null or not an object");
  }
  for (const field of fields) {
    if (!(field in body)) {
      throw new Error(
        `Message body (type="${message.type}") is missing required field "${field}"`,
      );
    }
  }
}
