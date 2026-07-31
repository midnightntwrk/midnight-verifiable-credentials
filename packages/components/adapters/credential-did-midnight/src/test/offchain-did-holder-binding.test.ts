import { Buffer } from "node:buffer";

import {
  createLongFormOffchainMidnightDIDString,
  CurveType,
  KeyType,
} from "@midnight-ntwrk/midnight-did-domain";
import { describe, expect, it } from "vitest";

import {
  createLongFormOffchainDIDUrlForJubjubHolder,
  createOffchainDIDHolderBindingFromDidUrl,
  hashOffchainDIDMethodId,
  normalizeOffchainDIDMethodReference,
} from "../offchain-did-holder-binding.js";

const encodeBytes32 = (byte: number): string => {
  const bytes = new Uint8Array(32);
  bytes[31] = byte;
  return Buffer.from(bytes).toString("base64url");
};

const didUrlWithMethod = ({
  authentication = true,
  publicKeyJwk,
}: {
  readonly authentication?: boolean;
  readonly publicKeyJwk: {
    readonly kty: KeyType;
    readonly crv: CurveType;
    readonly x: string;
    readonly y?: string;
  };
}): string =>
  createLongFormOffchainMidnightDIDString({
    version: 1,
    alsoKnownAs: [],
    verificationMethod: [
      {
        id: "#holder-key-1",
        publicKeyJwk,
        relationships: {
          authentication,
          assertionMethod: false,
          keyAgreement: false,
          capabilityInvocation: false,
          capabilityDelegation: false,
        },
      },
    ],
    service: [],
  });

const happyDidUrl = didUrlWithMethod({
  publicKeyJwk: {
    kty: KeyType.EC,
    crv: CurveType.Jubjub,
    x: encodeBytes32(1),
    y: encodeBytes32(2),
  },
});

const nonJubjubDidUrl = didUrlWithMethod({
  publicKeyJwk: {
    kty: KeyType.OKP,
    crv: CurveType.Ed25519,
    x: encodeBytes32(1),
  },
});

const nonAuthDidUrl = didUrlWithMethod({
  authentication: false,
  publicKeyJwk: {
    kty: KeyType.EC,
    crv: CurveType.Jubjub,
    x: encodeBytes32(1),
    y: encodeBytes32(2),
  },
});

describe("credential-did-midnight", () => {
  it("derives an offchain DID holder binding without owning signing keys", () => {
    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDidUrl: happyDidUrl,
    });

    expect(resolved.did.startsWith("did:midnight:offchain:")).toBe(true);
    expect(resolved.method.id).toBe("#holder-key-1");
    expect(Array.from(resolved.binding.holderMethodId)).toEqual(
      Array.from(hashOffchainDIDMethodId("#holder-key-1")),
    );
    expect(resolved.binding.holderPublicKey).toEqual({ x: 1n, y: 2n });
    expect(resolved.binding.holderDidStateHash).toHaveLength(32);
  });

  it("accepts an absolute DID URL method reference", () => {
    const did = happyDidUrl.split("?", 1)[0]!;
    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDidUrl: happyDidUrl,
      holderMethodId: `${did}#holder-key-1`,
    });

    expect(resolved.method.id).toBe("#holder-key-1");
  });

  it("creates a long-form DID URL from an injected public Jubjub key", () => {
    const longFormDidUrl = createLongFormOffchainDIDUrlForJubjubHolder({
      publicKey: { x: 1n, y: 2n },
    });
    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDidUrl,
    });

    expect(resolved.binding.holderPublicKey).toEqual({ x: 1n, y: 2n });
  });

  it("rejects out-of-range public coordinates", () => {
    expect(() =>
      createLongFormOffchainDIDUrlForJubjubHolder({
        publicKey: { x: 1n << 256n, y: 2n },
      }),
    ).toThrow(/must fit in 32 bytes/);
    expect(() =>
      createLongFormOffchainDIDUrlForJubjubHolder({
        publicKey: { x: -1n, y: 2n },
      }),
    ).toThrow(/must be non-negative/);
  });

  it("normalizes and validates method references", () => {
    expect(
      normalizeOffchainDIDMethodReference(
        "holder-key-1",
        "did:midnight:offchain:abc",
      ),
    ).toBe("#holder-key-1");
    expect(() =>
      normalizeOffchainDIDMethodReference("", "did:midnight:offchain:abc"),
    ).toThrow(/must not be empty/);
    expect(() =>
      normalizeOffchainDIDMethodReference(
        "did:midnight:offchain:abc#holder-key-1#extra",
        "did:midnight:offchain:abc",
      ),
    ).toThrow(/only one fragment separator/);
  });

  it("rejects non-Jubjub and non-authentication methods", () => {
    expect(() =>
      createOffchainDIDHolderBindingFromDidUrl({
        longFormDidUrl: nonJubjubDidUrl,
      }),
    ).toThrow(/exactly one Jubjub authentication method/);
    expect(() =>
      createOffchainDIDHolderBindingFromDidUrl({
        longFormDidUrl: nonAuthDidUrl,
        holderMethodId: "#holder-key-1",
      }),
    ).toThrow(/not marked for authentication/);
  });
});
