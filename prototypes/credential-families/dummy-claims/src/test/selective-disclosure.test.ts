import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/dummy-claims-credential/contract/index.js";
import { createDummyClaimsFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("dummy-claims selective disclosure", () => {
  it("verifies a presentation that discloses every currently supported claim family", () => {
    const fixture = createDummyClaimsFixture();

    expect(() =>
      pureCircuits.assertDummyClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("allows hidden direct and nested fields when the verifier request does not require them", () => {
    const fixture = createDummyClaimsFixture({
      disclosure: {
        revealByteSizedUnsignedValue: false,
        revealBytes32Value: false,
        revealFieldVector: false,
        revealNestedValue: false,
        revealNestedVector: false,
      },
      request: {
        requireByteSizedUnsignedValueDisclosure: false,
        requireBytes32ValueDisclosure: false,
        requireFieldVectorDisclosure: false,
        requireNestedValueDisclosure: false,
        requireNestedVectorDisclosure: false,
      },
    });

    expect(() =>
      pureCircuits.assertDummyClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("rejects a request that requires a hidden direct field", () => {
    const fixture = createDummyClaimsFixture({
      disclosure: {
        revealBytes32Value: false,
      },
      request: {
        requireBytes32ValueDisclosure: true,
      },
    });

    expect(() =>
      pureCircuits.assertDummyClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Dummy-claims request requires Bytes<32> disclosure/);
  });

  it("rejects a nested disclosure object that omits a required nested field", () => {
    const fixture = createDummyClaimsFixture({
      disclosure: {
        revealNestedValue: true,
        revealNestedFieldValue: false,
      },
      request: {
        requireNestedValueDisclosure: true,
      },
    });

    expect(() =>
      pureCircuits.assertDummyClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Dummy-claims nested request requires nested field disclosure/);
  });

  it("rejects a hidden nested vector when the verifier requires it", () => {
    const fixture = createDummyClaimsFixture({
      disclosure: {
        revealNestedVector: false,
      },
      request: {
        requireNestedVectorDisclosure: true,
      },
    });

    expect(() =>
      pureCircuits.assertDummyClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Dummy-claims request requires nested vector disclosure/);
  });
});
