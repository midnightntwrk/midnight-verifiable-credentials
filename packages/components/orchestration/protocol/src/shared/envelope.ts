import {
  type ProtocolMessageEnvelope,
  pureCircuits as genericPureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";

import { sha256 } from "./crypto.js";

let envelopeCounter = 0;

export const createEnvelope = (
  label: string,
  threadLabel: string,
  initial: boolean,
  respondsTo?: Uint8Array,
  threadId?: Uint8Array,
  options: {
    readonly createdAtMs?: bigint;
    readonly expiresAtMs?: bigint;
  } = {},
): ProtocolMessageEnvelope => {
  const seq = envelopeCounter++;
  const createdAt = options.createdAtMs ?? BigInt(Date.now());
  return {
    version: 1n,
    messageId: sha256(`protocol:message:${label}:${seq}`),
    threadId: threadId ?? sha256(`protocol:thread:${threadLabel}:${seq}`),
    initialMessage: initial,
    respondsToMessageId:
      respondsTo ?? genericPureCircuits.noProtocolResponseReference(),
    createdAt,
    hasExpiresAt: options.expiresAtMs !== undefined,
    expiresAt: options.expiresAtMs ?? 0n,
  };
};

/** Reset the envelope counter — for test isolation only. */
export const resetEnvelopeCounter = (): void => {
  envelopeCounter = 0;
};
