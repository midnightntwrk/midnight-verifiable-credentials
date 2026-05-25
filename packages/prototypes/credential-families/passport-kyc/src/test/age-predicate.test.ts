import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/passport-kyc-credential/contract/index.js";
import {
  createPassportKycFixture,
  signProof,
} from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("passport-kyc credential: age predicate", () => {
  it("checks the private age witness against the committed date of birth", () => {
    const fixture = createPassportKycFixture();

    expect(() =>
      pureCircuits.assertValidPassportKycAgePredicate(
        fixture.credential,
        fixture.presentation,
        fixture.witness.currentDay,
        fixture.witness.dateOfBirthDays,
        fixture.witness.dateOfBirthOpening,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertValidPassportKycAgePredicate(
        fixture.credential,
        fixture.presentation,
        fixture.witness.currentDay,
        fixture.witness.dateOfBirthDays,
        new Uint8Array(32).fill(1),
      ),
    ).toThrow(/Date-of-birth witness does not match credential commitment/);
  });

  it("rejects a predicate proof when the holder is below the requested threshold", () => {
    const fixture = createPassportKycFixture();

    const strictPresentation = {
      ...fixture.presentation,
      disclosed: {
        ...fixture.presentation.disclosed,
        ageThresholdYears: 30n,
      },
    };
    const strictPresentationProof = signProof({
      bodyRoot:
        pureCircuits.passportKycPresentationBodyRoot(strictPresentation),
      context: "presentation",
      signer: fixture.holder,
      createdAt: fixture.presentationProof.createdAt + 1n,
      challengeHash: fixture.presentationProof.challengeHash,
      nonceScalar: 23n,
    });

    expect(() =>
      pureCircuits.assertValidPassportKycPresentation(
        fixture.credential,
        fixture.credentialProof,
        strictPresentation,
        strictPresentationProof,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertValidPassportKycAgePredicate(
        fixture.credential,
        strictPresentation,
        fixture.witness.currentDay,
        fixture.witness.dateOfBirthDays,
        fixture.witness.dateOfBirthOpening,
      ),
    ).toThrow(/Age predicate does not satisfy the requested threshold/);
  });
});
