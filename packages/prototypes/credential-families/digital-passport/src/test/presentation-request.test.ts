import { readFileSync } from "node:fs";
import path from "node:path";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/digital-passport-credential/contract/index.js";
import {
  createDigitalPassportFixture,
  createSigner,
  signProof,
} from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

const modelSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "digital-passport-credential",
    "model.compact",
  ),
  "utf8",
);

describe("digital-passport presentation request", () => {
  it("keeps an explicit verifier challenge in the request shape", () => {
    expect(modelSource).toContain("verifierChallengeHash");
  });

  it("includes per-field disclosure requirements in the request shape", () => {
    expect(modelSource).toContain("requireFirstNameDisclosure");
    expect(modelSource).toContain("requireLastNameDisclosure");
    expect(modelSource).toContain("requireAgeOverThreshold");
  });

  it("includes age threshold fields in the request shape", () => {
    expect(modelSource).toContain("requestedAgeThresholdYears");
  });

  it("rejects a presentation request with an empty verifier challenge", () => {
    const fixture = createDigitalPassportFixture();
    const emptyChallengeRequest = {
      ...fixture.presentationRequest,
      verifierChallengeHash: new Uint8Array(32),
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportPresentationRequest(
        emptyChallengeRequest,
      ),
    ).toThrow(/Digital-passport verifier challenge must be set/);
  });

  it("rejects a presentation request with a zero age threshold when age is required", () => {
    const fixture = createDigitalPassportFixture();
    const invalidRequest = {
      ...fixture.presentationRequest,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears: 0n,
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportPresentationRequest(
        invalidRequest,
      ),
    ).toThrow(/Requested age threshold must be positive/);
  });

  it("rejects a presentation request with a nonzero age threshold when age is not required", () => {
    const fixture = createDigitalPassportFixture();
    const invalidRequest = {
      ...fixture.presentationRequest,
      requireAgeOverThreshold: false,
      requestedAgeThresholdYears: 18n,
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportPresentationRequest(
        invalidRequest,
      ),
    ).toThrow(/Requested age threshold must be zero when disabled/);
  });

  it("accepts a valid presentation request", () => {
    const fixture = createDigitalPassportFixture();

    expect(() =>
      pureCircuits.assertValidDigitalPassportPresentationRequest(
        fixture.presentationRequest,
      ),
    ).not.toThrow();
  });

  it("enforces a verifier-defined presentation request against a valid presentation", () => {
    const fixture = createDigitalPassportFixture();

    expect(() =>
      pureCircuits.assertDigitalPassportPresentationSatisfiesRequest(
        fixture.credential,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("rejects when a required field disclosure is not presented", () => {
    const fixture = createDigitalPassportFixture();
    const stricterRequest = {
      ...fixture.presentationRequest,
      requireFirstNameDisclosure: true,
    };

    expect(() =>
      pureCircuits.assertDigitalPassportPresentationSatisfiesRequest(
        fixture.credential,
        stricterRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Presentation request requires the first-name disclosure/);
  });

  it("rejects when the verifier challenge does not match the presentation proof", () => {
    const fixture = createDigitalPassportFixture();
    const mismatchedChallengeRequest = {
      ...fixture.presentationRequest,
      verifierChallengeHash: new Uint8Array(32).fill(9),
    };

    expect(() =>
      pureCircuits.assertDigitalPassportPresentationSatisfiesRequest(
        fixture.credential,
        mismatchedChallengeRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /Presentation proof challenge does not match the request challenge/,
    );
  });

  it("rejects a presentation with a disclosure opening that does not match the credential commitment", () => {
    const fixture = createDigitalPassportFixture();
    const mismatchedPresentation = {
      ...fixture.presentation,
      disclosed: {
        ...fixture.presentation.disclosed,
        revealLastName: true,
        lastNameOpening: new Uint8Array(32).fill(2),
      },
    };
    const mismatchedPresentationProof = signProof({
      bodyRoot: pureCircuits.digitalPassportPresentationBodyRoot(
        mismatchedPresentation,
      ),
      context: "presentation",
      signer: fixture.holder,
      createdAt: fixture.presentationProof.createdAt + 1n,
      challengeHash: fixture.presentationProof.challengeHash,
      nonceScalar: 29n,
    });

    expect(() =>
      pureCircuits.assertValidDigitalPassportPresentation(
        fixture.credential,
        fixture.credentialProof,
        mismatchedPresentation,
        mismatchedPresentationProof,
      ),
    ).toThrow(
      /Presentation last-name disclosure does not match the credential/,
    );
  });

  it("rejects a presentation where the disclosed age threshold does not match the requested threshold", () => {
    const fixture = createDigitalPassportFixture();
    const mismatchedThresholdPresentation = {
      ...fixture.presentation,
      disclosed: {
        ...fixture.presentation.disclosed,
        ageThresholdYears: 21n,
      },
    };
    const mismatchedThresholdProof = signProof({
      bodyRoot: pureCircuits.digitalPassportPresentationBodyRoot(
        mismatchedThresholdPresentation,
      ),
      context: "presentation",
      signer: fixture.holder,
      createdAt: fixture.presentationProof.createdAt + 1n,
      challengeHash: fixture.presentationProof.challengeHash,
      nonceScalar: 31n,
    });

    expect(() =>
      pureCircuits.assertDigitalPassportPresentationSatisfiesRequest(
        fixture.credential,
        fixture.presentationRequest,
        mismatchedThresholdPresentation,
        mismatchedThresholdProof,
      ),
    ).toThrow(/Presentation age threshold does not match the request/);
  });
});
