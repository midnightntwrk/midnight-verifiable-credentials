import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import {
  createLongFormOffchainMidnightDIDString,
  CurveType,
  KeyType,
} from "@midnight-ntwrk/midnight-did-domain";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  createLongFormOffchainDIDStringForJubjubHolder,
  createOffchainDIDHolderBindingFromDidUrl,
  createOffchainMidnightHolderBindingFromDidUrl,
  hashOffchainDIDMethodId,
  normalizeOffchainDIDMethodReference,
} from "../offchain-did-holder-binding.js";

setNetworkId("undeployed");

// Helper to encode a bigint as a 32-byte base64url string (matching the
// on-chain Jubjub coordinate encoding).
const encodeBigIntAsBase64Url = (value: bigint): string => {
  let hex = value.toString(16);
  if (hex.length > 64) {
    throw new Error("Coordinate must fit in 32 bytes");
  }
  hex = hex.padStart(64, "0");
  // Use Node.js Buffer for base64url encoding (available in Node ≥ 14).
  return Buffer.from(hex, "hex").toString("base64url");
};

const HAPPY_DID = createLongFormOffchainMidnightDIDString({
  version: 1,
  alsoKnownAs: [],
  verificationMethod: [
    {
      id: "#holder-key-1",
      publicKeyJwk: {
        kty: KeyType.EC,
        crv: CurveType.Jubjub,
        x: encodeBigIntAsBase64Url(1n),
        y: encodeBigIntAsBase64Url(2n),
      },
      relationships: {
        authentication: true,
        assertionMethod: false,
        keyAgreement: false,
        capabilityInvocation: false,
        capabilityDelegation: false,
      },
    },
  ],
  service: [],
});

const NON_JUBJUB_DID = createLongFormOffchainMidnightDIDString({
  version: 1,
  alsoKnownAs: [],
  verificationMethod: [
    {
      id: "#holder-key-1",
      publicKeyJwk: {
        kty: KeyType.EC,
        crv: CurveType.P256,
        x: encodeBigIntAsBase64Url(1n),
        y: encodeBigIntAsBase64Url(2n),
      },
      relationships: {
        authentication: true,
        assertionMethod: false,
        keyAgreement: false,
        capabilityInvocation: false,
        capabilityDelegation: false,
      },
    },
  ],
  service: [],
});

const NON_AUTH_DID = createLongFormOffchainMidnightDIDString({
  version: 1,
  alsoKnownAs: [],
  verificationMethod: [
    {
      id: "#holder-key-1",
      publicKeyJwk: {
        kty: KeyType.EC,
        crv: CurveType.Jubjub,
        x: encodeBigIntAsBase64Url(1n),
        y: encodeBigIntAsBase64Url(2n),
      },
      relationships: {
        authentication: false,
        assertionMethod: true,
        keyAgreement: false,
        capabilityInvocation: false,
        capabilityDelegation: false,
      },
    },
  ],
  service: [],
});

describe("credentials-offchain-did", () => {
  it("derives a holder binding from a long-form offchain DID", () => {
    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDid: HAPPY_DID,
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
    // Long-form DIDs embed the state after the hash, so the short-form DID
    // (used as the DID subject in the method reference) is everything before
    // the final colon-delimited state segment.
    const did = HAPPY_DID.split(":").slice(0, 4).join(":");
    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDid: HAPPY_DID,
      holderMethodId: `${did}#holder-key-1`,
    });

    expect(resolved.method.id).toEqual("#holder-key-1");
  });

  it("bootstraps a long-form offchain DID from a Jubjub key and derives the VC holder binding", () => {
    const holder = ecMulGenerator(222222221n);
    const longFormDid = createLongFormOffchainDIDStringForJubjubHolder({
      publicKey: holder,
    });

    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      longFormDid,
    });

    expect(resolved.did).toEqual(longFormDid);
    expect(resolved.binding.holderPublicKey).toEqual(holder);
  });

  it("rejects Jubjub coordinates that do not fit in 32 bytes", () => {
    expect(() =>
      createLongFormOffchainDIDStringForJubjubHolder({
        publicKey: {
          x: 1n << 256n,
          y: 2n,
        },
      }),
    ).toThrow(/must fit in 32 bytes/);
  });

  it("rejects negative Jubjub coordinates", () => {
    expect(() =>
      createLongFormOffchainDIDStringForJubjubHolder({
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
        longFormDid: NON_JUBJUB_DID,
      }),
    ).toThrow(/exactly one Jubjub authentication method/);
  });

  it("rejects a method that is not marked for authentication", () => {
    expect(() =>
      createOffchainDIDHolderBindingFromDidUrl({
        longFormDid: NON_AUTH_DID,
        holderMethodId: "#holder-key-1",
      }),
    ).toThrow(/not marked for authentication/);
  });

  it("keeps the historical create alias working during migration", () => {
    const resolved = createOffchainMidnightHolderBindingFromDidUrl({
      longFormDid: HAPPY_DID,
    });

    expect(resolved.method.id).toEqual("#holder-key-1");
  });
});