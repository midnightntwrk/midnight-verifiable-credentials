import { pureCircuits as helloFamilyPureCircuits } from "@midnight-ntwrk/midnight-did-credentials-hello-family/managed/hello-family-credential/contract/index.js";
import { pureCircuits as helloFamilyOffchainPureCircuits } from "@midnight-ntwrk/midnight-did-credentials-hello-family/managed/hello-family-offchain-credential/contract/index.js";
import {
  createHelloFamilyFixture,
  createHelloFamilyOffchainDidFixture,
} from "@midnight-ntwrk/midnight-did-credentials-hello-family/testing";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  HelloVerifierOffchainSimulator,
  HelloVerifierSimulator,
} from "../testing.js";

setNetworkId("undeployed");

describe("hello-verifier contract", () => {
  it("verifies a minimal hello-family presentation against a starter request", () => {
    const fixture = createHelloFamilyFixture();
    const simulator = new HelloVerifierSimulator();
    const request = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      false,
    );

    simulator.verifyHelloFamilyPresentationForHelloVerifier(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
    );

    const state = simulator.getLedger();
    expect(state.successfulVerificationCount).toEqual(1n);
    expect(state.lastVerifiedCredentialRoot).toEqual(
      helloFamilyPureCircuits.helloFamilyCredentialBodyRoot(fixture.credential),
    );
    expect(state.lastVerifiedRequestChallenge).toEqual(
      fixture.presentationRequest.verifierChallengeHash,
    );
    expect(state.lastVerifiedBooleanValue).toEqual(
      fixture.credential.claims.booleanValue,
    );
    expect(state.lastVerifiedBigUnsignedValue).toEqual(
      fixture.credential.claims.bigUnsignedValue,
    );
    expect(state.lastVerifiedBytesValue).toEqual(new Uint8Array(32));
  });

  it("records bytes when the verifier requests and receives that disclosure", () => {
    const fixture = createHelloFamilyFixture({ revealBytesValue: true });
    const simulator = new HelloVerifierSimulator();
    const request = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      true,
    );

    simulator.verifyHelloFamilyPresentationForHelloVerifier(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
    );

    expect(simulator.getLedger().lastVerifiedBytesValue).toEqual(
      fixture.credential.claims.bytesValue,
    );
  });

  it("rejects a presentation that omits a required bytes disclosure", () => {
    const fixture = createHelloFamilyFixture();
    const simulator = new HelloVerifierSimulator();
    const stricterRequest = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      true,
    );

    expect(() =>
      simulator.verifyHelloFamilyPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        stricterRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Hello-family request requires bytes disclosure/);
  });

  it("rejects direct requests that disable mandatory boolean disclosure", () => {
    const fixture = createHelloFamilyFixture();
    const simulator = new HelloVerifierSimulator();
    const invalidRequest = {
      ...fixture.presentationRequest,
      requireBooleanValueDisclosure: false,
    };

    expect(() =>
      simulator.verifyHelloFamilyPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        invalidRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Hello-verifier starter requires boolean disclosure/);
  });

  it("rejects direct requests that disable mandatory big-unsigned disclosure", () => {
    const fixture = createHelloFamilyFixture();
    const simulator = new HelloVerifierSimulator();
    const invalidRequest = {
      ...fixture.presentationRequest,
      requireBigUnsignedValueDisclosure: false,
    };

    expect(() =>
      simulator.verifyHelloFamilyPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        invalidRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Hello-verifier starter requires big-unsigned disclosure/);
  });

  it("rejects a presentation proof bound to a different verifier challenge", () => {
    const fixture = createHelloFamilyFixture();
    const simulator = new HelloVerifierSimulator();
    const mismatchedRequest = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      new Uint8Array(32).fill(9),
      false,
    );

    expect(() =>
      simulator.verifyHelloFamilyPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        mismatchedRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /Hello-family presentation proof challenge does not match the request/,
    );
  });
});

describe("hello-verifier offchain DID smoke path", () => {
  it("verifies an offchain-DID-backed hello-family presentation", () => {
    const fixture = createHelloFamilyOffchainDidFixture({
      revealBytesValue: true,
    });
    const simulator = new HelloVerifierOffchainSimulator();
    const request = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      true,
    );

    simulator.verifyHelloFamilyOffchainPresentationForHelloVerifier(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
    );

    const state = simulator.getLedger();
    expect(state.successfulVerificationCount).toEqual(1n);
    expect(state.lastVerifiedCredentialRoot).toEqual(
      helloFamilyOffchainPureCircuits.helloFamilyOffchainCredentialBodyRoot(
        fixture.credential,
      ),
    );
    expect(state.lastVerifiedRequestChallenge).toEqual(
      fixture.presentationRequest.verifierChallengeHash,
    );
    expect(state.lastVerifiedBooleanValue).toEqual(
      fixture.credential.claims.booleanValue,
    );
    expect(state.lastVerifiedBigUnsignedValue).toEqual(
      fixture.credential.claims.bigUnsignedValue,
    );
    expect(state.lastVerifiedBytesValue).toEqual(
      fixture.credential.claims.bytesValue,
    );
    expect(fixture.portableDidUrl.startsWith("did:midnight:offchain:")).toBe(
      true,
    );
  });

  it("rejects an offchain presentation whose holder binding no longer matches the DID-derived credential binding", () => {
    const fixture = createHelloFamilyOffchainDidFixture();
    const simulator = new HelloVerifierOffchainSimulator();
    const request = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      false,
    );

    expect(() =>
      simulator.verifyHelloFamilyOffchainPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        request,
        {
          ...fixture.presentation,
          holderBinding: {
            ...fixture.presentation.holderBinding,
            holderDidStateHash: new Uint8Array(32).fill(4),
          },
        },
        fixture.presentationProof,
      ),
    ).toThrow(
      /Offchain Midnight holder state hash does not match the credential holder binding/,
    );
    expect(simulator.getLedger().successfulVerificationCount).toEqual(0n);
  });

  it("rejects direct offchain requests that disable mandatory boolean disclosure", () => {
    const fixture = createHelloFamilyOffchainDidFixture();
    const simulator = new HelloVerifierOffchainSimulator();
    const invalidRequest = {
      ...fixture.presentationRequest,
      requireBooleanValueDisclosure: false,
    };

    expect(() =>
      simulator.verifyHelloFamilyOffchainPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        invalidRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Hello-verifier starter requires boolean disclosure/);
  });

  it("rejects direct offchain requests that disable mandatory big-unsigned disclosure", () => {
    const fixture = createHelloFamilyOffchainDidFixture();
    const simulator = new HelloVerifierOffchainSimulator();
    const invalidRequest = {
      ...fixture.presentationRequest,
      requireBigUnsignedValueDisclosure: false,
    };

    expect(() =>
      simulator.verifyHelloFamilyOffchainPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        invalidRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Hello-verifier starter requires big-unsigned disclosure/);
  });

  it("rejects an offchain presentation proof bound to a different verifier challenge", () => {
    const fixture = createHelloFamilyOffchainDidFixture();
    const simulator = new HelloVerifierOffchainSimulator();
    const mismatchedRequest = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      new Uint8Array(32).fill(9),
      false,
    );

    expect(() =>
      simulator.verifyHelloFamilyOffchainPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        mismatchedRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /Hello-family presentation proof challenge does not match the request/,
    );
    expect(simulator.getLedger().successfulVerificationCount).toEqual(0n);
  });
});
