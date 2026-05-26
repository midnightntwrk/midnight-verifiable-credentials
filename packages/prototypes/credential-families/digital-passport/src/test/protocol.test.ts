import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/digital-passport-credential/contract/index.js";
import { createDigitalPassportProtocolFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("digital-passport credential: protocol layer", () => {
  it("maps a protocol verification request into the concrete presentation request shape", () => {
    const fixture = createDigitalPassportProtocolFixture();

    const request = pureCircuits.digitalPassportPresentationRequestFromProtocol(
      fixture.verificationRequest,
    );

    expect(request).toEqual(fixture.presentationRequest);
  });

  it("accepts a concrete issuance flow aligned to the generic protocol thread model", () => {
    const fixture = createDigitalPassportProtocolFixture();

    expect(() =>
      pureCircuits.assertDigitalPassportIssuanceRequestMatchesOffer(
        fixture.issuanceOffer,
        fixture.issuanceRequest,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertDigitalPassportIssuanceResultMatchesRequest(
        fixture.issuanceRequest,
        fixture.issuanceResult,
      ),
    ).not.toThrow();
  });

  it("rejects an issuance result when the issuance challenge no longer matches the request", () => {
    const fixture = createDigitalPassportProtocolFixture();
    const tamperedResult = {
      ...fixture.issuanceResult,
      body: {
        ...fixture.issuanceResult.body,
        issuanceChallengeHash: new Uint8Array(32).fill(3),
      },
    };

    expect(() =>
      pureCircuits.assertDigitalPassportIssuanceResultMatchesRequest(
        fixture.issuanceRequest,
        tamperedResult,
      ),
    ).toThrow(
      /Digital-passport issuance result challenge must match the request challenge|Digital-passport issuance result challenge must match the issuer proof challenge/,
    );
  });

  it("accepts a concrete verification submission aligned to the generic verification protocol", () => {
    const fixture = createDigitalPassportProtocolFixture();

    expect(() =>
      pureCircuits.assertDigitalPassportVerificationSubmissionMatchesRequest(
        fixture.verificationRequest,
        fixture.verificationSubmission,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertDigitalPassportVerificationResultMatchesSubmission(
        fixture.verificationSubmission,
        fixture.verificationResult,
      ),
    ).not.toThrow();
  });

  it("rejects a verification submission when the protocol challenge diverges from the request", () => {
    const fixture = createDigitalPassportProtocolFixture();
    const tamperedRequest = {
      ...fixture.verificationRequest,
      verifierChallengeHash: new Uint8Array(32).fill(9),
    };

    expect(() =>
      pureCircuits.assertDigitalPassportVerificationSubmissionMatchesRequest(
        tamperedRequest,
        fixture.verificationSubmission,
      ),
    ).toThrow(
      /Presentation submission challenge does not match the request challenge/,
    );
  });
});
