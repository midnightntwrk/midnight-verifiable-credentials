import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/secret-birth-credential/contract/index.js";
import { createSecretBirthCredentialFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("secret birth credential: holder binding", () => {
  it("binds the issuer proof to the secret-bound credential body", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertValidSecretBirthCredential(
        fixture.credential,
        fixture.credentialProof,
      ),
    ).not.toThrow();

    const tamperedCredential = {
      ...fixture.credential,
      issuedAt: fixture.credential.issuedAt + 1n,
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredential(
        tamperedCredential,
        fixture.credentialProof,
      ),
    ).toThrow(/Signature verification failed/);
  });

  it("binds the presentation to the hidden holder secret", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertSecretBirthPresentationSatisfiesRequest(
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
      pureCircuits.assertSecretBirthPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        new Uint8Array(32).fill(5),
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(
      /Blinded holder commitment does not match the hidden holder secret witness/,
    );
  });

  it("rejects a mismatched verifier challenge for the secret holder binding", () => {
    const fixture = createSecretBirthCredentialFixture();
    const mismatchedChallenge = new Uint8Array(32).fill(7);
    const mismatchedRequest = {
      ...fixture.presentationRequest,
      verifierChallengeHash: mismatchedChallenge,
      verifierPseudonymScope: {
        ...fixture.presentationRequest.verifierPseudonymScope,
        challengeDigest: mismatchedChallenge,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        mismatchedRequest,
        fixture.presentation,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(
      /Blinded holder challenge response does not match the verifier challenge/,
    );
  });

  it("derives a verifier-scoped pseudonym from the hidden holder secret", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertSecretBirthPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).not.toThrow();

    const mismatchedRequest = {
      ...fixture.presentationRequest,
      verifierPseudonymScope: {
        ...fixture.presentationRequest.verifierPseudonymScope,
        verifierIdentityDigest: new Uint8Array(32).fill(3),
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        mismatchedRequest,
        fixture.presentation,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/Request-scoped verifier pseudonym context mismatch/);
  });

  it.each([
    "verifierIdentityDigest",
    "executionContextDigest",
    "audienceDigest",
    "originDigest",
    "consentDigest",
    "requestDigest",
    "challengeDigest",
  ] as const)("rejects an empty %s in a requested pseudonym scope", (field) => {
    const fixture = createSecretBirthCredentialFixture();
    const request = {
      ...fixture.verificationRequest,
      body: {
        ...fixture.verificationRequest.body,
        verifierPseudonymScope: {
          ...fixture.verificationRequest.body.verifierPseudonymScope,
          [field]: new Uint8Array(32),
        },
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialVerificationRequestMessage(
        request,
      ),
    ).toThrow(/pseudonym scope|pseudonym.*(?:request|challenge)/iu);
  });

  it("rejects a pseudonym scope challenge that differs from the verifier challenge", () => {
    const fixture = createSecretBirthCredentialFixture();
    const request = {
      ...fixture.verificationRequest,
      body: {
        ...fixture.verificationRequest.body,
        verifierPseudonymScope: {
          ...fixture.verificationRequest.body.verifierPseudonymScope,
          challengeDigest: new Uint8Array(32).fill(91),
        },
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialVerificationRequestMessage(
        request,
      ),
    ).toThrow(/pseudonym scope challenge does not match/iu);
  });
});
