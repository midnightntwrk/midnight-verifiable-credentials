import { Buffer } from "node:buffer";

import type {
  ProtocolStateByteCollection,
  ProtocolStateByteStore,
} from "./protocol-state-store.js";

const MAX_REGISTRATION_ATTEMPTS = 8;

export type ExactByteDeliveryRegistration = "accepted" | "duplicate";

export class ProtocolMessageIdReuseError extends Error {
  readonly messageId: string;

  constructor(messageId: string) {
    super(
      `Protocol message ID "${messageId}" was already registered with different bytes.`,
    );
    this.name = "ProtocolMessageIdReuseError";
    this.messageId = messageId;
  }
}

export class AtomicProtocolStateUnavailableError extends Error {
  constructor(collectionName: string) {
    super(
      `Protocol state collection "${collectionName}" does not support atomic create-if-absent writes.`,
    );
    this.name = "AtomicProtocolStateUnavailableError";
  }
}

export class ProtocolDeliveryRegistrationContentionError extends Error {
  constructor(messageId: string, cause?: unknown) {
    super(
      `Protocol message ID "${messageId}" could not be registered after repeated concurrent state changes.`,
      cause === undefined ? undefined : { cause },
    );
    this.name = "ProtocolDeliveryRegistrationContentionError";
  }
}

const bytesEqual = (first: Uint8Array, second: Uint8Array): boolean =>
  first.byteLength === second.byteLength &&
  Buffer.compare(first, second) === 0;

/**
 * Registers transport-provided message bytes before decoding or performing
 * protocol side effects.
 *
 * The registry intentionally accepts the exact received bytes rather than a
 * parsed object or a re-serialization. This makes an exact duplicate
 * idempotent while rejecting reuse of the same message ID with any byte-level
 * difference.
 */
export class ExactByteProtocolDeliveryRegistry {
  private readonly collection: ProtocolStateByteCollection;

  constructor(
    byteStore: ProtocolStateByteStore,
    readonly collectionName: string,
  ) {
    if (collectionName.length === 0) {
      throw new TypeError("Protocol delivery collection name must not be empty.");
    }
    this.collection = byteStore.collection(collectionName);
    if (!this.collection.setIfAbsent) {
      throw new AtomicProtocolStateUnavailableError(collectionName);
    }
  }

  register(
    messageId: string,
    exactMessageBytes: Uint8Array,
  ): ExactByteDeliveryRegistration {
    if (messageId.length === 0) {
      throw new TypeError("Protocol message ID must not be empty.");
    }
    if (exactMessageBytes.byteLength === 0) {
      throw new TypeError("Protocol message bytes must not be empty.");
    }

    const bytesToRegister = new Uint8Array(exactMessageBytes);
    let lastStorageError: unknown;
    for (let attempt = 0; attempt < MAX_REGISTRATION_ATTEMPTS; attempt += 1) {
      try {
        if (this.collection.setIfAbsent!(messageId, bytesToRegister)) {
          return "accepted";
        }
      } catch (error) {
        lastStorageError = error;
      }

      const registeredBytes = this.collection.get(messageId);
      if (registeredBytes === undefined) {
        continue;
      }
      if (bytesEqual(registeredBytes, bytesToRegister)) {
        return "duplicate";
      }
      throw new ProtocolMessageIdReuseError(messageId);
    }

    throw new ProtocolDeliveryRegistrationContentionError(
      messageId,
      lastStorageError,
    );
  }
}
