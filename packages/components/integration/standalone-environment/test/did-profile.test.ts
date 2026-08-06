import {
  ecMulGenerator,
  jubjubPointX,
  jubjubPointY,
} from "@midnight-ntwrk/compact-runtime";
import { getMidnightNetwork } from "@midnight-ntwrk/midnight-did-api";
import {
  createVerificationMethod,
  decodeBase64UrlBytes32,
  VerificationMethodType,
} from "@midnight-ntwrk/midnight-did-domain";
import { describe, expect, it } from "vitest";

import { createJubjubPublicKeyJwk } from "../src/did-profile.js";

const decodeBigEndianUnsigned = (bytes: Uint8Array): bigint => {
  let result = 0n;
  for (const byte of bytes) {
    result = (result << 8n) + BigInt(byte);
  }
  return result;
};

describe("standalone DID profile", () => {
  it("loads the Midnight DID API with the resolved Midnight JS utility cohort", () => {
    expect(getMidnightNetwork).toBeTypeOf("function");
  });

  it("encodes Jubjub public keys as canonical 32-byte publicKeyJwk coordinates", () => {
    const publicKey = ecMulGenerator(222222221n);
    const publicKeyJwk = createJubjubPublicKeyJwk(publicKey);

    const x = decodeBase64UrlBytes32(publicKeyJwk.x, "publicKeyJwk.x");
    const y = decodeBase64UrlBytes32(publicKeyJwk.y, "publicKeyJwk.y");

    expect(publicKeyJwk.x).toHaveLength(43);
    expect(publicKeyJwk.y).toHaveLength(43);
    expect(decodeBigEndianUnsigned(x)).toBe(jubjubPointX(publicKey));
    expect(decodeBigEndianUnsigned(y)).toBe(jubjubPointY(publicKey));

    expect(() =>
      createVerificationMethod({
        id: "did:example:standalone#issuer-key-1",
        type: VerificationMethodType.JsonWebKey,
        controller: "did:example:standalone",
        publicKeyJwk,
      }),
    ).not.toThrow();
  });
});
