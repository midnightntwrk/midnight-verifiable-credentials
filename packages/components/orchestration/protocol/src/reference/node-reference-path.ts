import { randomBytes } from "node:crypto";

import { FileSystemProtocolStateByteStore } from "../adapters/file-protocol-state-store.js";
import { createStableJsonProtocolStateStore } from "../adapters/json-protocol-state-codec.js";
import type { ProtocolStateStore } from "../agents/protocol-state-store.js";
import type {
  ProtocolRandomnessContext,
  ProtocolRandomnessSource,
} from "../agents/randomness.js";
import { mod } from "../shared/crypto.js";

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  bytes.reduce((accumulator, byte) => (accumulator << 8n) + BigInt(byte), 0n);

const takeRandomBytes = (length: number): Uint8Array =>
  new Uint8Array(randomBytes(length));

export class NodeCryptoRandomnessSource implements ProtocolRandomnessSource {
  nextChallengeHash(_context: ProtocolRandomnessContext): Uint8Array {
    return takeRandomBytes(32);
  }

  nextIssuerNonce(_context: ProtocolRandomnessContext): Uint8Array {
    return takeRandomBytes(32);
  }

  nextBlindingFactor(_context: ProtocolRandomnessContext): Uint8Array {
    return takeRandomBytes(32);
  }

  nextSigningNonceScalar(_context: ProtocolRandomnessContext): bigint {
    while (true) {
      const scalar = mod(bytesToBigInt(takeRandomBytes(64)));
      if (scalar !== 0n) {
        return scalar;
      }
    }
  }
}

export const createNodeFileBackedProtocolStateStore = (
  rootDir: string,
): ProtocolStateStore =>
  createStableJsonProtocolStateStore(
    new FileSystemProtocolStateByteStore(rootDir),
  );

export const createNodeFileBackedProtocolPartyDependencies = (
  rootDir: string,
): {
  readonly randomness: ProtocolRandomnessSource;
  readonly stateStore: ProtocolStateStore;
} => ({
  randomness: new NodeCryptoRandomnessSource(),
  stateStore: createNodeFileBackedProtocolStateStore(rootDir),
});
