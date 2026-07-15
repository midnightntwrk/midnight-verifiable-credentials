import { randomBytes } from "node:crypto";

import {
  type ProtocolMessageEnvelope,
  pureCircuits as genericPureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";

import { sha256 } from "./crypto.js";

let envelopeCounter = 0;

export type ProtocolEnvelopeIdentifierContext = {
  readonly label: string;
  readonly threadLabel: string;
  readonly sequence: number;
};

export interface ProtocolEnvelopeIdentifierSource {
  nextMessageId(context: ProtocolEnvelopeIdentifierContext): Uint8Array;
  nextThreadId(context: ProtocolEnvelopeIdentifierContext): Uint8Array;
}

export class NodeCryptoEnvelopeIdentifierSource
  implements ProtocolEnvelopeIdentifierSource
{
  nextMessageId(_context: ProtocolEnvelopeIdentifierContext): Uint8Array {
    return new Uint8Array(randomBytes(32));
  }

  nextThreadId(_context: ProtocolEnvelopeIdentifierContext): Uint8Array {
    return new Uint8Array(randomBytes(32));
  }
}

export class ReferenceDeterministicEnvelopeIdentifierSource
  implements ProtocolEnvelopeIdentifierSource
{
  nextMessageId(context: ProtocolEnvelopeIdentifierContext): Uint8Array {
    return sha256(`protocol:message:${context.label}:${context.sequence}`);
  }

  nextThreadId(context: ProtocolEnvelopeIdentifierContext): Uint8Array {
    return sha256(
      `protocol:thread:${context.threadLabel}:${context.sequence}`,
    );
  }
}

export const secureProtocolEnvelopeIdentifierSource =
  new NodeCryptoEnvelopeIdentifierSource();
export const unsafeReferenceDeterministicEnvelopeIdentifierSource =
  new ReferenceDeterministicEnvelopeIdentifierSource();

export const createEnvelope = (
  label: string,
  threadLabel: string,
  initial: boolean,
  respondsTo?: Uint8Array,
  threadId?: Uint8Array,
  options: {
    readonly createdAtMs?: bigint;
    readonly expiresAtMs?: bigint;
    readonly identifierSource?: ProtocolEnvelopeIdentifierSource;
  } = {},
): ProtocolMessageEnvelope => {
  const seq = envelopeCounter++;
  const createdAt = options.createdAtMs ?? BigInt(Date.now());
  const identifierSource =
    options.identifierSource ?? secureProtocolEnvelopeIdentifierSource;
  const identifierContext = { label, threadLabel, sequence: seq };
  return {
    version: 1n,
    messageId: identifierSource.nextMessageId(identifierContext),
    threadId:
      threadId ?? identifierSource.nextThreadId(identifierContext),
    initialMessage: initial,
    respondsToMessageId:
      respondsTo ?? genericPureCircuits.noProtocolResponseReference(),
    createdAt,
    hasExpiresAt: options.expiresAtMs !== undefined,
    expiresAt: options.expiresAtMs ?? 0n,
  };
};

export type ProtocolEnvelopeFactory = typeof createEnvelope;

/** Bind one identifier source for every envelope produced by the factory. */
export const createProtocolEnvelopeFactory = (
  identifierSource: ProtocolEnvelopeIdentifierSource =
    secureProtocolEnvelopeIdentifierSource,
): ProtocolEnvelopeFactory =>
  (label, threadLabel, initial, respondsTo, threadId, options = {}) =>
    createEnvelope(label, threadLabel, initial, respondsTo, threadId, {
      ...options,
      identifierSource,
    });

/** Reset deterministic fixture sequencing; secure identifiers remain random. */
export const resetEnvelopeCounter = (): void => {
  envelopeCounter = 0;
};
