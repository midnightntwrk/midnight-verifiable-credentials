import type { CompactType, Value } from "@midnight-ntwrk/compact-runtime";

export const COMPACT_VALUE_ENCODING = "compact-value-v1.base64url" as const;

const MAGIC = new Uint8Array([0x4d, 0x43, 0x56, 0x31]); // MCV1
const HEADER_LENGTH = MAGIC.length + 4;
const CHUNK_LENGTH_BYTES = 4;
const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const BASE64URL_TEXT = /^[A-Za-z0-9_-]+$/u;

export type CompactValueEncoding = typeof COMPACT_VALUE_ENCODING;

export type EncodedCompactValue = {
  readonly encoding: CompactValueEncoding;
  readonly payload: string;
};

const assertUint32 = (value: number, label: string): void => {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error(`${label} must fit into uint32`);
  }
};

const writeUint32 = (
  target: Uint8Array,
  offset: number,
  value: number,
): void => {
  assertUint32(value, "uint32 value");
  target[offset] = (value >>> 24) & 0xff;
  target[offset + 1] = (value >>> 16) & 0xff;
  target[offset + 2] = (value >>> 8) & 0xff;
  target[offset + 3] = value & 0xff;
};

const readUint32 = (source: Uint8Array, offset: number): number => {
  if (offset + CHUNK_LENGTH_BYTES > source.length) {
    throw new Error("Compact value payload ended before uint32 field");
  }
  return (
    source[offset] * 0x1000000 +
    ((source[offset + 1] ?? 0) << 16) +
    ((source[offset + 2] ?? 0) << 8) +
    (source[offset + 3] ?? 0)
  );
};

const toBase64Url = (bytes: Uint8Array): string => {
  let encoded = "";
  for (let offset = 0; offset < bytes.length; offset += 3) {
    const first = bytes[offset] ?? 0;
    const second = bytes[offset + 1] ?? 0;
    const third = bytes[offset + 2] ?? 0;
    const packed = (first << 16) | (second << 8) | third;
    encoded += BASE64URL_ALPHABET[(packed >>> 18) & 0x3f];
    encoded += BASE64URL_ALPHABET[(packed >>> 12) & 0x3f];
    if (offset + 1 < bytes.length) {
      encoded += BASE64URL_ALPHABET[(packed >>> 6) & 0x3f];
    }
    if (offset + 2 < bytes.length) {
      encoded += BASE64URL_ALPHABET[packed & 0x3f];
    }
  }
  return encoded;
};

const fromBase64Url = (value: string): Uint8Array => {
  if (value.length === 0) {
    throw new Error("Compact value payload must not be empty");
  }
  if (!BASE64URL_TEXT.test(value) || value.length % 4 === 1) {
    throw new Error("Compact value payload is not valid unpadded base64url");
  }
  const decoded = new Uint8Array(Math.floor((value.length * 6) / 8));
  let accumulator = 0;
  let bitCount = 0;
  let outputOffset = 0;
  for (const character of value) {
    const index = BASE64URL_ALPHABET.indexOf(character);
    accumulator = (accumulator << 6) | index;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      decoded[outputOffset] = (accumulator >>> bitCount) & 0xff;
      outputOffset += 1;
    }
  }
  if (toBase64Url(decoded) !== value) {
    throw new Error(
      "Compact value payload is not canonical unpadded base64url",
    );
  }
  return decoded;
};

export const compactValueToBytes = (
  value: readonly Uint8Array[],
): Uint8Array => {
  assertUint32(value.length, "Compact value chunk count");
  const bodyLength = value.reduce((total, chunk) => {
    assertUint32(chunk.length, "Compact value chunk length");
    return total + CHUNK_LENGTH_BYTES + chunk.length;
  }, 0);
  const result = new Uint8Array(HEADER_LENGTH + bodyLength);
  result.set(MAGIC, 0);
  writeUint32(result, MAGIC.length, value.length);
  let offset = HEADER_LENGTH;
  for (const chunk of value) {
    writeUint32(result, offset, chunk.length);
    offset += CHUNK_LENGTH_BYTES;
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

export const compactValueFromBytes = (bytes: Uint8Array): Value => {
  if (bytes.length < HEADER_LENGTH) {
    throw new Error("Compact value payload is shorter than the header");
  }
  for (let i = 0; i < MAGIC.length; i += 1) {
    if (bytes[i] !== MAGIC[i]) {
      throw new Error("Compact value payload has an unexpected magic header");
    }
  }
  const chunkCount = readUint32(bytes, MAGIC.length);
  const chunks: Uint8Array[] = [];
  let offset = HEADER_LENGTH;
  for (let i = 0; i < chunkCount; i += 1) {
    const length = readUint32(bytes, offset);
    offset += CHUNK_LENGTH_BYTES;
    if (offset + length > bytes.length) {
      throw new Error("Compact value chunk exceeds payload length");
    }
    chunks.push(bytes.slice(offset, offset + length));
    offset += length;
  }
  if (offset !== bytes.length) {
    throw new Error("Compact value payload contains trailing bytes");
  }
  return chunks;
};

export const encodeCompactValue = (
  value: readonly Uint8Array[],
): EncodedCompactValue => ({
  encoding: COMPACT_VALUE_ENCODING,
  payload: toBase64Url(compactValueToBytes(value)),
});

export const decodeCompactValue = (encoded: EncodedCompactValue): Value => {
  if (encoded.encoding !== COMPACT_VALUE_ENCODING) {
    throw new Error(`Unsupported Compact value encoding "${encoded.encoding}"`);
  }
  return compactValueFromBytes(fromBase64Url(encoded.payload));
};

export const encodeCompactPayload = <T>(
  descriptor: CompactType<T>,
  value: T,
): EncodedCompactValue => encodeCompactValue(descriptor.toValue(value));

export const decodeCompactPayload = <T>(
  descriptor: CompactType<T>,
  encoded: EncodedCompactValue,
): T => {
  const runtimeValue = decodeCompactValue(encoded);
  const decoded = descriptor.fromValue(runtimeValue);
  if (runtimeValue.length !== 0) {
    throw new Error(
      "Compact value payload contains trailing chunks for descriptor",
    );
  }
  return decoded;
};
