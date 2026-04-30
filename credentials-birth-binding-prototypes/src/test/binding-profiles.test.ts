import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/birth-binding-prototypes/contract/index.js";
import {
  createBlindedSecretBirthPrototypeFixture,
  createExplicitBirthPrototypeFixture,
  createJubjubBirthPrototypeFixture,
  createOffchainBirthPrototypeFixture,
  createSecretBirthPrototypeFixture,
} from "./credential-fixtures.js";

setNetworkId("undeployed");

describe("birth binding prototypes", () => {
  it("supports explicit DID holder binding over birth claims", () => {
    const fixture = createExplicitBirthPrototypeFixture();
    expect(() =>
      pureCircuits.assertBirthExplicitPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertBirthExplicitPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        {
          ...fixture.presentation,
          holderBinding: {
            holderVerificationMethodRef: fixture.issuer.verificationMethodRef,
          },
        },
        fixture.presentationProof,
      ),
    ).toThrow(
      /Presentation holder contract does not match credential holder binding/,
    );
  });

  it("supports Jubjub holder binding over birth claims", () => {
    const fixture = createJubjubBirthPrototypeFixture();
    expect(() =>
      pureCircuits.assertBirthJubjubPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertBirthJubjubPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        {
          ...fixture.presentationProof,
          publicKey: fixture.issuer.publicKey,
        },
      ),
    ).toThrow(
      /Presentation proof public key must match the Jubjub holder binding/,
    );
  });

  it("supports offchain Midnight DID binding over birth claims", () => {
    const fixture = createOffchainBirthPrototypeFixture();
    expect(() =>
      pureCircuits.assertBirthOffchainPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertBirthOffchainPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        {
          ...fixture.presentation,
          holderBinding: {
            ...fixture.presentation.holderBinding,
            holderMethodId: new Uint8Array(32).fill(9),
          },
        },
        fixture.presentationProof,
      ),
    ).toThrow(
      /Offchain Midnight holder method id does not match the credential holder binding/,
    );
  });

  it("supports secret holder binding over birth claims", () => {
    const fixture = createSecretBirthPrototypeFixture();
    expect(() =>
      pureCircuits.assertBirthSecretPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertBirthSecretPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        new Uint8Array(32).fill(3),
        fixture.witness.holderSecretOpening,
      ),
    ).toThrow(
      /Holder secret witness does not match the holder-binding commitment/,
    );
  });

  it("supports blinded secret holder binding over birth claims", () => {
    const fixture = createBlindedSecretBirthPrototypeFixture();
    expect(() =>
      pureCircuits.assertBirthBlindedSecretPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertBirthBlindedSecretPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        new Uint8Array(32).fill(4),
      ),
    ).toThrow(
      /Blinded holder commitment does not match the hidden holder secret witness/,
    );
  });

  it("enforces verifier request challenges across public-key presentation profiles", () => {
    const explicit = createExplicitBirthPrototypeFixture();
    const mismatchedRequest = {
      ...explicit.presentationRequest,
      verifierChallengeHash: new Uint8Array(32).fill(6),
    };

    expect(() =>
      pureCircuits.assertBirthExplicitPresentationSatisfiesRequest(
        explicit.credential,
        explicit.credentialProof,
        mismatchedRequest,
        explicit.presentation,
        explicit.presentationProof,
      ),
    ).toThrow(
      /Presentation proof challenge does not match the request challenge/,
    );
  });
});
