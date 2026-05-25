import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/passport-kyc-credential/contract/index.js";
import { createPassportKycProtocolFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("passport-kyc credential: protocol layer", () => {
  it("maps a protocol verification request into the concrete presentation request shape", () => {
    const fixture = createPassportKycProtocolFixture();

    const request = pureCircuits.passportKycPresentationRequestFromProtocol(
      fixture.verificationRequest,
    );

    expect(request).toEqual(fixture.presentationRequest);
  });

  it("accepts a concrete issuance flow aligned to the generic protocol thread model", () => {
    const fixture = createPassportKycProtocolFixture();

    expect(() =>
      pureCircuits.assertPassportKycIssuanceRequestMatchesOffer(
        fixture.issuanceOffer,
        fixture.issuanceRequest,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertPassportKycIssuanceResultMatchesRequest(
        fixture.issuanceRequest,
        fixture.issuanceResult,
      ),
    ).not.toThrow();
  });

  it("rejects an issuance result when the issuance challenge no longer matches the request", () => {
    const fixture = createPassportKycProtocolFixture();
    const tamperedResult = {
      ...fixture.issuanceResult,
      body: {
        ...fixture.issuanceResult.body,
        issuanceChallengeHash: new Uint8Array(32).fill(3),
      },
    };

    expect(() =>
      pureCircuits.assertPassportKycIssuanceResultMatchesRequest(
        fixture.issuanceRequest,
        tamperedResult,
      ),
    ).toThrow(
      /Passport-KYC issuance result challenge must match the request challenge|Passport-KYC issuance result challenge must match the issuer proof challenge/,
    );
  });

  it("accepts a concrete verification submission aligned to the generic verification protocol", () => {
    const fixture = createPassportKycProtocolFixture();

    expect(() =>
      pureCircuits.assertPassportKycVerificationSubmissionMatchesRequest(
        fixture.verificationRequest,
        fixture.verificationSubmission,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertPassportKycVerificationResultMatchesSubmission(
        fixture.verificationSubmission,
        fixture.verificationResult,
      ),
    ).not.toThrow();
  });

  it("rejects a verification submission when the protocol challenge diverges from the request", () => {
    const fixture = createPassportKycProtocolFixture();
    const tamperedRequest = {
      ...fixture.verificationRequest,
      verifierChallengeHash: new Uint8Array(32).fill(9),
    };

    expect(() =>
      pureCircuits.assertPassportKycVerificationSubmissionMatchesRequest(
        tamperedRequest,
        fixture.verificationSubmission,
      ),
    ).toThrow(
      /Presentation submission challenge does not match the request challenge/,
    );
  });
});
