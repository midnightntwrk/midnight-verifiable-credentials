import { Buffer } from "node:buffer";

import {
  createCodecBackedProtocolStateStore,
  type ProtocolStateByteStore,
  type ProtocolStateCodec,
  type ProtocolStateCodecResolver,
  type ProtocolStateStore,
} from "../agents/protocol-state-store.js";

const BIGINT_TAG = "__midnightVcBigInt";
const BYTES_TAG = "__midnightVcBytes";

const isTaggedRecord = (
  value: unknown,
  tag: string,
): value is Record<string, string> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.keys(value).length === 1 &&
  tag in value &&
  typeof (value as Record<string, unknown>)[tag] === "string";

const stableJsonReplacer = (_key: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return { [BIGINT_TAG]: value.toString(10) };
  }
  if (value instanceof Uint8Array) {
    return { [BYTES_TAG]: Buffer.from(value).toString("base64") };
  }
  return value;
};

const stableJsonReviver = (_key: string, value: unknown): unknown => {
  if (isTaggedRecord(value, BIGINT_TAG)) {
    return BigInt(value[BIGINT_TAG]);
  }
  if (isTaggedRecord(value, BYTES_TAG)) {
    return new Uint8Array(Buffer.from(value[BYTES_TAG], "base64"));
  }
  return value;
};

// NOTE: "stable" here means restart-safe for this tagged codec pair. It does
// not claim canonical cross-writer JSON bytes. Protocol state values are
// expected to stay within plain objects/arrays plus scalar fields, `bigint`,
// and `Uint8Array`.
export const stableJsonProtocolStateCodec: ProtocolStateCodec<unknown> = {
  encode(value) {
    return Buffer.from(JSON.stringify(value, stableJsonReplacer), "utf8");
  },
  decode(encodedValue) {
    return JSON.parse(
      Buffer.from(encodedValue).toString("utf8"),
      stableJsonReviver,
    );
  },
};

export class StableJsonProtocolStateCodecResolver
  implements ProtocolStateCodecResolver
{
  getCodec<T>(): ProtocolStateCodec<T> {
    return stableJsonProtocolStateCodec as ProtocolStateCodec<T>;
  }
}

export const stableJsonProtocolStateCodecResolver =
  new StableJsonProtocolStateCodecResolver();

export const createStableJsonProtocolStateStore = (
  byteStore: ProtocolStateByteStore,
): ProtocolStateStore =>
  createCodecBackedProtocolStateStore(
    byteStore,
    stableJsonProtocolStateCodecResolver,
  );
