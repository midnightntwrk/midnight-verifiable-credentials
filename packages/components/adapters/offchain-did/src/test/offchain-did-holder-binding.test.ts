import { Buffer } from "node:buffer";

import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import {
  createLongFormOffchainMidnightDIDString,
  CurveType,
  KeyType,
} from "@midnight-ntwrk/midnight-did-domain";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  createLongFormOffchainDIDUrlForJubjubHolder,
  createOffchainDIDHolderBindingFromDidUrl,
  createOffchainMidnightHolderBindingFromDidUrl,
  createPortableOffchainDIDUrlForJubjubHolder,
  hashOffchainDIDMethodId,
  normalizeOffchainDIDMethodReference,
} from "../offchain-did-holder-binding.js";

setNetworkId("undeployed");

const encodeBytes32 = (byte: number): string => {
  const bytes = new Uint8Array(32);
  bytes[31] = byte;
  return Buffer.from(bytes).toString("base64url");
};

const didUrlWithMethod = ({
  publicKeyJwk,
  authentication = true,
}: {
  readonly publicKeyJwk: {
    readonly kty: KeyType;
    readonly crv: CurveType;
    readonly x: string;
    readonly y?: string;
  };
  readonly authentication?: boolean;
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

const HAPPY_DID_URL = didUrlWithMethod({
  publicKeyJwk: {
    kty: KeyType.EC,
    crv: CurveType.Jubjub,
    x: encodeBytes32(1),
    y: encodeBytes32(2),
  },
});
const GOLDEN_HAPPY_DID_URL = [
  "did:midnight:offchain:410f42705ae02b609d9746f99800cb195d87d6b52d33de081a07807501fcb68f:T",
  "U9EMQAAAC0AAAABAQAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAA0jaG9sZGVyLWtleS0xAAAAAQEAAAArQUFBQUFBQ",
  "UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRQAAACtBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ",
  "UFBQUFBQUFBQUFBQUFBQUFJAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
].join("");
const NON_JUBJUB_DID_URL = didUrlWithMethod({
  publicKeyJwk: {
    kty: KeyType.OKP,
    crv: CurveType.Ed25519,
    x: encodeBytes32(1),
  },
});
const NON_AUTH_DID_URL = didUrlWithMethod({
  authentication: false,
  publicKeyJwk: {
    kty: KeyType.EC,
    crv: CurveType.Jubjub,
    x: encodeBytes32(1),
    y: encodeBytes32(2),
  },
});

describe("credentials-offchain-did", () => {
  it("keeps the canonical long-form offchain DID fixture stable", () => {
    expect(HAPPY_DID_URL).toEqual(GOLDEN_HAPPY_DID_URL);
  });

  it("derives a holder binding from a long-form offchain DID URL", () => {
    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDidUrl: HAPPY_DID_URL,
    });

    expect(resolved.did.startsWith("did:midnight:offchain:")).toEqual(true);
    expect(resolved.method.id).toEqual("#holder-key-1");
    expect(Array.from(resolved.binding.holderMethodId)).toEqual(
      Array.from(hashOffchainDIDMethodId("#holder-key-1")),
    );
    expect(resolved.binding.holderPublicKey).toEqual({
      x: 1n,
      y: 2n,
    });
    expect(resolved.binding.holderDidStateHash).toHaveLength(32);
  });

  it("accepts an explicit absolute DID URL method reference", () => {
    const did = HAPPY_DID_URL.split("?", 1)[0]!;
    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDidUrl: HAPPY_DID_URL,
      holderMethodId: `${did}#holder-key-1`,
    });

    expect(resolved.method.id).toEqual("#holder-key-1");
  });

  it("bootstraps a long-form offchain DID URL from a Jubjub key and derives the VC holder binding", () => {
    const holder = ecMulGenerator(222222221n);
    const longFormDidUrl = createLongFormOffchainDIDUrlForJubjubHolder({
      publicKey: holder,
    });

    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDidUrl,
    });

    expect(resolved.did).toEqual(longFormDidUrl.split("?", 1)[0]);
    expect(resolved.binding.holderPublicKey).toEqual(holder);
  });

  it("rejects Jubjub coordinates that do not fit in 32 bytes", () => {
    expect(() =>
      createPortableOffchainDIDUrlForJubjubHolder({
        publicKey: {
          x: 1n << 256n,
          y: 2n,
        },
      }),
    ).toThrow(/must fit in 32 bytes/);
  });

  it("rejects negative Jubjub coordinates", () => {
    expect(() =>
      createPortableOffchainDIDUrlForJubjubHolder({
        publicKey: {
          x: -1n,
          y: 2n,
        },
      }),
    ).toThrow(/must be non-negative/);
  });

  it("normalizes canonical DID method references", () => {
    expect(
      normalizeOffchainDIDMethodReference(
        "holder-key-1",
        "did:midnight:offchain:abc",
      ),
    ).toEqual("#holder-key-1");
    expect(
      normalizeOffchainDIDMethodReference(
        "did:midnight:offchain:abc#holder-key-1",
        "did:midnight:offchain:abc",
      ),
    ).toEqual("#holder-key-1");
  });

  it("rejects malformed multiple-fragment DID references", () => {
    expect(() =>
      normalizeOffchainDIDMethodReference(
        "did:midnight:offchain:abc#holder-key-1#extra",
        "did:midnight:offchain:abc",
      ),
    ).toThrow(/only one fragment separator/);
  });

  it("rejects a non-Jubjub method", () => {
    expect(() =>
      createOffchainDIDHolderBindingFromDidUrl({
        longFormDidUrl: NON_JUBJUB_DID_URL,
      }),
    ).toThrow(/exactly one Jubjub authentication method/);
  });

  it("rejects a method that is not marked for authentication", () => {
    expect(() =>
      createOffchainDIDHolderBindingFromDidUrl({
        longFormDidUrl: NON_AUTH_DID_URL,
        holderMethodId: "#holder-key-1",
      }),
    ).toThrow(/not marked for authentication/);
  });

  it("keeps the historical long-form DID URL helper alias working during migration", () => {
    const holder = ecMulGenerator(222222221n);

    expect(
      createPortableOffchainDIDUrlForJubjubHolder({
        publicKey: holder,
      }),
    ).toEqual(
      createLongFormOffchainDIDUrlForJubjubHolder({
        publicKey: holder,
      }),
    );
  });

  it("keeps the historical create alias working during migration", () => {
    const resolved = createOffchainMidnightHolderBindingFromDidUrl({
      portableDidUrl: HAPPY_DID_URL,
    });

    expect(resolved.method.id).toEqual("#holder-key-1");
  });

  it("rejects JavaScript callers that omit or mix DID URL inputs", () => {
    expect(() =>
      createOffchainDIDHolderBindingFromDidUrl(
        {} as Parameters<typeof createOffchainDIDHolderBindingFromDidUrl>[0],
      ),
    ).toThrow(/exactly one of longFormDidUrl or portableDidUrl/);

    expect(() =>
      createOffchainDIDHolderBindingFromDidUrl({
        longFormDidUrl: HAPPY_DID_URL,
        portableDidUrl: HAPPY_DID_URL,
      } as unknown as Parameters<
        typeof createOffchainDIDHolderBindingFromDidUrl
      >[0]),
    ).toThrow(/exactly one of longFormDidUrl or portableDidUrl/);
  });
});
