import { FileSystemProtocolStateByteStore } from "../adapters/file-protocol-state-store.js";
import { createStableJsonProtocolStateStore } from "../adapters/json-protocol-state-codec.js";
import type { ProtocolStateStore } from "../agents/protocol-state-store.js";
import {
  NodeCryptoRandomnessSource,
  type ProtocolRandomnessSource,
} from "../agents/randomness.js";

export { NodeCryptoRandomnessSource } from "../agents/randomness.js";

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
