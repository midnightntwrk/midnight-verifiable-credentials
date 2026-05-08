import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/credentials/contract/index.js";
import { createProofFixture } from "./proof-fixtures.js";

setNetworkId("undeployed");

describe("credentials core: lightweight holder bindings", () => {
  it("matches a presentation proof to a Jubjub holder binding", () => {
    const { proof } = createProofFixture();
    const binding = { holderPublicKey: proof.publicKey };

    expect(() =>
      pureCircuits.assertValidJubjubHolderBinding(binding),
    ).not.toThrow();
    expect(() =>
      pureCircuits.assertProofMatchesJubjubHolderBinding(binding, proof),
    ).not.toThrow();
    expect(() =>
      pureCircuits.assertMatchingJubjubHolderBindings(binding, binding),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertProofMatchesJubjubHolderBinding(
        { holderPublicKey: { x: 99n, y: 100n } },
        proof,
      ),
    ).toThrow(
      /Presentation proof public key must match the Jubjub holder binding/,
    );
    expect(() =>
      pureCircuits.assertValidJubjubHolderBinding({
        holderPublicKey: { x: 0n, y: 0n },
      }),
    ).toThrow(/Jubjub holder binding public key must be set/);
  });

  it("matches a presentation proof to an offchain Midnight holder binding", () => {
    const { proof } = createProofFixture();
    const binding = {
      holderDidStateHash: new Uint8Array(32).fill(7),
      holderMethodId: new Uint8Array(32).fill(8),
      holderPublicKey: proof.publicKey,
    };

    expect(() =>
      pureCircuits.assertValidOffchainMidnightHolderBinding(binding),
    ).not.toThrow();
    expect(() =>
      pureCircuits.assertProofMatchesOffchainMidnightHolderBinding(
        binding,
        proof,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertMatchingOffchainMidnightHolderBindings(binding, {
        ...binding,
        holderMethodId: new Uint8Array(32).fill(9),
      }),
    ).toThrow(
      /Offchain Midnight holder method id does not match the credential holder binding/,
    );
    expect(() =>
      pureCircuits.assertValidOffchainMidnightHolderBinding({
        ...binding,
        holderDidStateHash: new Uint8Array(32),
      }),
    ).toThrow(/Offchain Midnight holder state hash must be set/);
    expect(() =>
      pureCircuits.assertValidOffchainMidnightHolderBinding({
        ...binding,
        holderMethodId: new Uint8Array(32),
      }),
    ).toThrow(/Offchain Midnight holder method id must be set/);
  });
});
