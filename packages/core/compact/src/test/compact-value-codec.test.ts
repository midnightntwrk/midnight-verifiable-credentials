import {
  type CompactType,
  CompactTypeBoolean,
  CompactTypeBytes,
  CompactTypeUnsignedInteger,
  type Value,
} from "@midnight-ntwrk/compact-runtime";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  COMPACT_VALUE_ENCODING,
  compactValueFromBytes,
  compactValueToBytes,
  decodeCompactPayload,
  decodeCompactValue,
  encodeCompactPayload,
  encodeCompactValue,
} from "../compact-value-codec.js";

type ExampleCredential = {
  readonly version: bigint;
  readonly claimRoot: Uint8Array;
  readonly active: boolean;
};

const uint16 = new CompactTypeUnsignedInteger(65_535n, 2);
const bytes32 = new CompactTypeBytes(32);

const exampleCredentialDescriptor: CompactType<ExampleCredential> = {
  alignment: () =>
    uint16
      .alignment()
      .concat(bytes32.alignment().concat(CompactTypeBoolean.alignment())),
  fromValue: (value: Value): ExampleCredential => ({
    version: uint16.fromValue(value),
    claimRoot: bytes32.fromValue(value),
    active: CompactTypeBoolean.fromValue(value),
  }),
  toValue: (value: ExampleCredential): Value =>
    uint16
      .toValue(value.version)
      .concat(
        bytes32
          .toValue(value.claimRoot)
          .concat(CompactTypeBoolean.toValue(value.active)),
      ),
};

const createBytes = (seed: number): Uint8Array =>
  Uint8Array.from({ length: 32 }, (_, index) => (seed + index) % 256);

const compactValueArbitrary = fc.oneof(
  fc.array(fc.uint8Array({ maxLength: 512, size: "max" }), {
    maxLength: 32,
    size: "max",
  }),
  fc.array(fc.uint8Array({ maxLength: 4, size: "max" }), {
    minLength: 256,
    maxLength: 300,
    size: "max",
  }),
);
const nonEmptyCompactValueArbitrary = fc.array(
  fc.uint8Array({ maxLength: 512, size: "max" }),
  {
    minLength: 1,
    maxLength: 16,
    size: "max",
  },
);
const bytes32WithTrailingZerosArbitrary = fc
  .tuple(
    fc.uint8Array({ maxLength: 30, size: "max" }),
    fc.integer({ min: 1, max: 255 }),
  )
  .map(([prefix, finalNonZeroByte]) => {
    const value = new Uint8Array(32);
    value.set(prefix);
    value[prefix.length] = finalNonZeroByte;
    return value;
  });
const PROPERTY_RUNS = 250;

describe("Compact value transport codec", () => {
  it("frames and unframes runtime Value chunks without JSON conversion", () => {
    const runtimeValue = [createBytes(1), createBytes(2)];

    expect(compactValueFromBytes(compactValueToBytes(runtimeValue))).toEqual(
      runtimeValue,
    );
  });

  it("base64url-encodes framed runtime Value chunks", () => {
    const encoded = encodeCompactValue([createBytes(9)]);

    expect(encoded.encoding).toBe(COMPACT_VALUE_ENCODING);
    expect(decodeCompactValue(encoded)).toEqual([createBytes(9)]);
  });

  it("round-trips typed Compact values through a descriptor", () => {
    const credential = {
      version: 1n,
      claimRoot: createBytes(10),
      active: true,
    };

    const encoded = encodeCompactPayload(
      exampleCredentialDescriptor,
      credential,
    );

    expect(decodeCompactPayload(exampleCredentialDescriptor, encoded)).toEqual(
      credential,
    );
  });

  it("rejects padded and full-width representations of a bytes32 value", () => {
    const value = new Uint8Array(32);
    value[0] = 1;

    expect(
      decodeCompactPayload(bytes32, encodeCompactPayload(bytes32, value)),
    ).toEqual(value);
    expect(() =>
      decodeCompactPayload(bytes32, encodeCompactValue([Uint8Array.of(1, 0)])),
    ).toThrow("Compact value payload is not canonical for descriptor");
    expect(() =>
      decodeCompactPayload(bytes32, encodeCompactValue([value])),
    ).toThrow("Compact value payload is not canonical for descriptor");
  });

  it("rejects a non-empty zero chunk for an all-zero bytes32 value", () => {
    const value = new Uint8Array(32);

    expect(
      decodeCompactPayload(bytes32, encodeCompactPayload(bytes32, value)),
    ).toEqual(value);
    expect(() =>
      decodeCompactPayload(bytes32, encodeCompactValue([Uint8Array.of(0)])),
    ).toThrow("Compact value payload is not canonical for descriptor");
  });

  it("fails closed when a descriptor round trip is lossy", () => {
    const lossyDescriptor: CompactType<boolean> = {
      alignment: CompactTypeBoolean.alignment,
      fromValue: (value: Value): boolean => {
        value.shift();
        return true;
      },
      toValue: (): Value => [Uint8Array.of(2)],
    };

    expect(() =>
      decodeCompactPayload(
        lossyDescriptor,
        encodeCompactValue([Uint8Array.of(1)]),
      ),
    ).toThrow("Compact value payload is not canonical for descriptor");
  });

  it("preserves descriptor encoding errors during canonicality checks", () => {
    const failingDescriptor: CompactType<boolean> = {
      alignment: CompactTypeBoolean.alignment,
      fromValue: (value: Value): boolean => {
        value.shift();
        return true;
      },
      toValue: (): Value => {
        throw new RangeError("descriptor encoding failed");
      },
    };

    expect(() =>
      decodeCompactPayload(
        failingDescriptor,
        encodeCompactValue([Uint8Array.of(1)]),
      ),
    ).toThrow("descriptor encoding failed");
  });

  it("rejects bounded descriptor-equivalent zero padding", () => {
    fc.assert(
      fc.property(bytes32WithTrailingZerosArbitrary, (value) => {
        const canonical = encodeCompactPayload(bytes32, value);
        expect(decodeCompactPayload(bytes32, canonical)).toEqual(value);

        const [canonicalChunk] = decodeCompactValue(canonical);
        expect(canonicalChunk).toBeDefined();
        expect(canonicalChunk!.length).toBeLessThan(32);
        const paddedChunk = new Uint8Array(canonicalChunk!.length + 1);
        paddedChunk.set(canonicalChunk!);
        const padded = encodeCompactValue([paddedChunk]);

        expect(decodeCompactValue(padded)).toEqual([paddedChunk]);
        expect(() => decodeCompactPayload(bytes32, padded)).toThrow(
          "Compact value payload is not canonical for descriptor",
        );
      }),
      { numRuns: PROPERTY_RUNS },
    );
  });

  it("rejects padding at the bytes32 descriptor-width boundary", () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 30, maxLength: 30 }),
        fc.integer({ min: 1, max: 255 }),
        (prefix, finalNonZeroByte) => {
          const value = new Uint8Array(32);
          value.set(prefix);
          value[30] = finalNonZeroByte;
          const canonical = encodeCompactPayload(bytes32, value);
          const [canonicalChunk] = decodeCompactValue(canonical);

          expect(canonicalChunk).toHaveLength(31);
          const fullWidthChunk = new Uint8Array(32);
          fullWidthChunk.set(canonicalChunk!);
          expect(() =>
            decodeCompactPayload(bytes32, encodeCompactValue([fullWidthChunk])),
          ).toThrow("Compact value payload is not canonical for descriptor");
        },
      ),
      { numRuns: 50 },
    );
  });

  it("rejects malformed framed payloads", () => {
    const bytes = compactValueToBytes([createBytes(1)]);
    bytes[0] = 0;

    expect(() => compactValueFromBytes(bytes)).toThrow(/magic header/);
  });

  it("rejects invalid base64url transport payloads", () => {
    expect(() =>
      decodeCompactValue({
        encoding: COMPACT_VALUE_ENCODING,
        payload: "not+base64url",
      }),
    ).toThrow(/base64url/);
  });

  it("rejects empty transport payloads with a clear validation error", () => {
    expect(() =>
      decodeCompactValue({
        encoding: COMPACT_VALUE_ENCODING,
        payload: "",
      }),
    ).toThrow("Compact value payload must not be empty");
  });

  it("round-trips bounded arbitrary runtime Value chunks", () => {
    fc.assert(
      fc.property(compactValueArbitrary, (value) => {
        expect(compactValueFromBytes(compactValueToBytes(value))).toEqual(
          value,
        );
        expect(decodeCompactValue(encodeCompactValue(value))).toEqual(value);
      }),
      { numRuns: PROPERTY_RUNS },
    );
  });

  it("rejects a truncated frame whose final chunk is empty", () => {
    const encoded = compactValueToBytes([new Uint8Array()]);

    expect(() => compactValueFromBytes(encoded.slice(0, -1))).toThrow(
      /ended before uint32 field/,
    );
  });

  it("rejects truncated and trailing bytes for arbitrary framed values", () => {
    fc.assert(
      fc.property(
        nonEmptyCompactValueArbitrary,
        fc.uint8Array({ minLength: 1, maxLength: 8 }),
        (value, trailingBytes) => {
          const encoded = compactValueToBytes(value);
          const expectedTruncationError =
            value.at(-1)!.length === 0
              ? /ended before uint32 field/
              : /chunk exceeds payload length/;
          expect(() => compactValueFromBytes(encoded.slice(0, -1))).toThrow(
            expectedTruncationError,
          );

          const withTrailingBytes = new Uint8Array(
            encoded.length + trailingBytes.length,
          );
          withTrailingBytes.set(encoded);
          withTrailingBytes.set(trailingBytes, encoded.length);
          expect(() => compactValueFromBytes(withTrailingBytes)).toThrow(
            /trailing bytes/,
          );
        },
      ),
      { numRuns: PROPERTY_RUNS },
    );
  });
});
