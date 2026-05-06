import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  createOffchainDIDHolderBindingFromDidUrl,
  createOffchainMidnightHolderBindingFromDidUrl,
  hashOffchainDIDMethodId,
  normalizeOffchainDIDMethodReference,
} from "../offchain-did-holder-binding.js";

setNetworkId("undeployed");

const HAPPY_DID_URL =
  "did:midnight:offchain:0f48bc69bc2a23585f421256c6028dd9d731936658cba20409298d32f03be9ba?state=TU9EMQAAAC0AAAABAQAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAA0jaG9sZGVyLWtleS0xAAAAAQEAAAACQVEAAAACQWcAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const NON_JUBJUB_DID_URL =
  "did:midnight:offchain:7504b09f89e228b168119f0db74229a41aaa586a456531622849f14f6f9e297e?state=TU9EMQAAAC0AAAABAQAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAA0jaG9sZGVyLWtleS0xAAAAAQIAAAACQVEAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const NON_AUTH_DID_URL =
  "did:midnight:offchain:36a4e7ace1d95d4519cba44ae8cbaa08fd41c89052cffb91ecfef2658289b3be?state=TU9EMQAAAC0AAAABAQAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAA0jaG9sZGVyLWtleS0xAAAAAQEAAAACQVEAAAACQWcAAAABAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

describe("credentials-offchain-did", () => {
  it("derives a holder binding from a portable offchain DID URL", () => {
    const resolved = createOffchainDIDHolderBindingFromDidUrl({
      portableDidUrl: HAPPY_DID_URL,
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
      portableDidUrl: HAPPY_DID_URL,
      holderMethodId: `${did}#holder-key-1`,
    });

    expect(resolved.method.id).toEqual("#holder-key-1");
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
        portableDidUrl: NON_JUBJUB_DID_URL,
      }),
    ).toThrow(/exactly one Jubjub authentication method/);
  });

  it("rejects a method that is not marked for authentication", () => {
    expect(() =>
      createOffchainDIDHolderBindingFromDidUrl({
        portableDidUrl: NON_AUTH_DID_URL,
        holderMethodId: "#holder-key-1",
      }),
    ).toThrow(/not marked for authentication/);
  });

  it("keeps the historical create alias working during migration", () => {
    const resolved = createOffchainMidnightHolderBindingFromDidUrl({
      portableDidUrl: HAPPY_DID_URL,
    });

    expect(resolved.method.id).toEqual("#holder-key-1");
  });
});
