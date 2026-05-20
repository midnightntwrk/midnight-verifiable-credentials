import { TextEncoder } from "node:util";

import { pureCircuits as dummyClaimsPureCircuits } from "@midnight-ntwrk/midnight-did-credentials-dummy-claims/managed/dummy-claims-credential/contract/index.js";
import {
  createDummyClaimsFixture,
  type DummyClaimsFixture,
} from "@midnight-ntwrk/midnight-did-credentials-dummy-claims/testing";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { DummyClaimsVerifierSimulator } from "../testing.js";

setNetworkId("undeployed");

const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

describe("dummy-claims verifier contract", () => {
  it("starts from the documented dummy-claims verifier ledger defaults", () => {
    const simulator = new DummyClaimsVerifierSimulator();
    const state = simulator.getLedger();

    expect(state.successfulVerificationCount).toEqual(0n);
    expect(state.lastVerifiedCredentialRoot).toEqual(
      padText("dummy-claims:none"),
    );
    expect(state.lastVerifiedRequestChallenge).toEqual(
      padText("dummy-claims:no-request"),
    );
  });

  it("verifies a full-surface dummy-claims presentation", () => {
    const fixture = createDummyClaimsFixture();
    const simulator = new DummyClaimsVerifierSimulator();
    const request = simulator.dummyClaimsVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
    );

    simulator.verifyDummyClaimsPresentationForDummyClaimsVerifier(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
    );

    const state = simulator.getLedger();
    expect(state.successfulVerificationCount).toEqual(1n);
    expect(state.lastVerifiedCredentialRoot).toEqual(
      dummyClaimsPureCircuits.dummyClaimsCredentialBodyRoot(fixture.credential),
    );
    expect(state.lastVerifiedRequestChallenge).toEqual(
      fixture.presentationRequest.verifierChallengeHash,
    );
    expect(state.lastVerifiedBooleanValue).toEqual(
      fixture.credential.claims.booleanValue,
    );
    expect(state.lastVerifiedByteSizedUnsignedValue).toEqual(
      fixture.credential.claims.byteSizedUnsignedValue,
    );
    expect(state.lastVerifiedMediumUnsignedValue).toEqual(
      fixture.credential.claims.mediumUnsignedValue,
    );
    expect(state.lastVerifiedBigUnsignedValue).toEqual(
      fixture.credential.claims.bigUnsignedValue,
    );
    expect(state.lastVerifiedBytes16Value).toEqual(
      fixture.credential.claims.bytes16Value,
    );
    expect(state.lastVerifiedBytes32Value).toEqual(
      fixture.credential.claims.bytes32Value,
    );
    expect(state.lastVerifiedFieldValue).toEqual(
      fixture.credential.claims.fieldValue,
    );
    expect(state.lastVerifiedBooleanVector).toEqual(
      fixture.credential.claims.booleanVector,
    );
    expect(state.lastVerifiedUintVector).toEqual(
      fixture.credential.claims.uintVector,
    );
    expect(state.lastVerifiedBytesVector).toEqual(
      fixture.credential.claims.bytesVector,
    );
    expect(state.lastVerifiedFieldVector).toEqual(
      fixture.credential.claims.fieldVector,
    );
    expect(state.lastVerifiedNestedBooleanValue).toEqual(
      fixture.credential.claims.nestedValue.booleanValue,
    );
    expect(state.lastVerifiedNestedBigUnsignedValue).toEqual(
      fixture.credential.claims.nestedValue.bigUnsignedValue,
    );
    expect(state.lastVerifiedNestedBytesValue).toEqual(
      fixture.credential.claims.nestedValue.bytesValue,
    );
    expect(state.lastVerifiedNestedFieldValue).toEqual(
      fixture.credential.claims.nestedValue.fieldValue,
    );
    expect(state.lastVerifiedNestedVector).toEqual(
      fixture.credential.claims.nestedVector,
    );
  });

  it("rejects a presentation that omits a required direct disclosure", () => {
    const fixture = createDummyClaimsFixture({
      disclosure: { revealBytes32Value: false },
    });
    const simulator = new DummyClaimsVerifierSimulator();
    const request = simulator.dummyClaimsVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
    );

    expect(() =>
      simulator.verifyDummyClaimsPresentationForDummyClaimsVerifier(
        fixture.credential,
        fixture.credentialProof,
        request,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Dummy-claims request requires Bytes<32> disclosure/);
  });

  it("rejects a presentation that omits a required nested field disclosure", () => {
    const fixture = createDummyClaimsFixture({
      disclosure: { revealNestedFieldValue: false },
    });
    const simulator = new DummyClaimsVerifierSimulator();
    const request = simulator.dummyClaimsVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
    );

    expect(() =>
      simulator.verifyDummyClaimsPresentationForDummyClaimsVerifier(
        fixture.credential,
        fixture.credentialProof,
        request,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Dummy-claims nested request requires nested field disclosure/);
  });

  it("rejects a presentation that omits the nested vector disclosure", () => {
    const fixture = createDummyClaimsFixture({
      disclosure: { revealNestedVector: false },
    });
    const simulator = new DummyClaimsVerifierSimulator();
    const request = simulator.dummyClaimsVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
    );

    expect(() =>
      simulator.verifyDummyClaimsPresentationForDummyClaimsVerifier(
        fixture.credential,
        fixture.credentialProof,
        request,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Dummy-claims request requires nested vector disclosure/);
  });

  it("rejects a presentation proof bound to a different verifier challenge", () => {
    const fixture = createDummyClaimsFixture();
    const simulator = new DummyClaimsVerifierSimulator();
    const request = simulator.dummyClaimsVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      new Uint8Array(32).fill(7),
    );

    expect(() =>
      simulator.verifyDummyClaimsPresentationForDummyClaimsVerifier(
        fixture.credential,
        fixture.credentialProof,
        request,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /Dummy-claims presentation proof challenge does not match the request/,
    );
  });

  it.each<{
    readonly field: keyof DummyClaimsFixture["presentationRequest"];
    readonly error: RegExp;
  }>([
    {
      field: "requireBooleanValueDisclosure",
      error: /Dummy-claims verifier requires boolean disclosure/,
    },
    {
      field: "requireByteSizedUnsignedValueDisclosure",
      error: /Dummy-claims verifier requires Uint<8> disclosure/,
    },
    {
      field: "requireMediumUnsignedValueDisclosure",
      error: /Dummy-claims verifier requires Uint<64> disclosure/,
    },
    {
      field: "requireBigUnsignedValueDisclosure",
      error: /Dummy-claims verifier requires Uint<248> disclosure/,
    },
    {
      field: "requireBytes16ValueDisclosure",
      error: /Dummy-claims verifier requires Bytes<16> disclosure/,
    },
    {
      field: "requireBytes32ValueDisclosure",
      error: /Dummy-claims verifier requires Bytes<32> disclosure/,
    },
    {
      field: "requireFieldValueDisclosure",
      error: /Dummy-claims verifier requires field disclosure/,
    },
    {
      field: "requireBooleanVectorDisclosure",
      error: /Dummy-claims verifier requires Boolean vector disclosure/,
    },
    {
      field: "requireUintVectorDisclosure",
      error: /Dummy-claims verifier requires Uint vector disclosure/,
    },
    {
      field: "requireBytesVectorDisclosure",
      error: /Dummy-claims verifier requires Bytes vector disclosure/,
    },
    {
      field: "requireFieldVectorDisclosure",
      error: /Dummy-claims verifier requires field vector disclosure/,
    },
    {
      field: "requireNestedValueDisclosure",
      error: /Dummy-claims verifier requires nested disclosure/,
    },
    {
      field: "requireNestedBooleanValueDisclosure",
      error: /Dummy-claims verifier requires nested boolean disclosure/,
    },
    {
      field: "requireNestedBigUnsignedValueDisclosure",
      error: /Dummy-claims verifier requires nested bigint-like disclosure/,
    },
    {
      field: "requireNestedBytesValueDisclosure",
      error: /Dummy-claims verifier requires nested bytes disclosure/,
    },
    {
      field: "requireNestedFieldValueDisclosure",
      error: /Dummy-claims verifier requires nested field disclosure/,
    },
    {
      field: "requireNestedVectorDisclosure",
      error: /Dummy-claims verifier requires nested vector disclosure/,
    },
  ])("rejects direct requests that relax $field", ({ field, error }) => {
    const fixture = createDummyClaimsFixture();
    const simulator = new DummyClaimsVerifierSimulator();
    const invalidRequest = {
      ...fixture.presentationRequest,
      [field]: false,
    };

    expect(() =>
      simulator.verifyDummyClaimsPresentationForDummyClaimsVerifier(
        fixture.credential,
        fixture.credentialProof,
        invalidRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(error);
  });
});
