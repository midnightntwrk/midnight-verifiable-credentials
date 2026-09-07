import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/credentials/contract/index.js";

setNetworkId("undeployed");

describe("credentials core: secret holder binding", () => {
  it("derives request-unlinkable pseudonyms from authenticated verifier context", () => {
    const holderSecret = new Uint8Array(32).fill(1);
    const scope = {
      verifierIdentityDigest: new Uint8Array(32).fill(2),
      executionContextDigest: new Uint8Array(32).fill(3),
      audienceDigest: new Uint8Array(32).fill(4),
      originDigest: new Uint8Array(32).fill(5),
      consentDigest: new Uint8Array(32).fill(6),
      requestDigest: new Uint8Array(32).fill(7),
      challengeDigest: new Uint8Array(32).fill(8),
    };
    const pseudonym = pureCircuits.requestScopedVerifierPseudonymV1(
      holderSecret,
      scope,
    );

    expect(() =>
      pureCircuits.assertRequestScopedVerifierPseudonymV1(
        pseudonym,
        holderSecret,
        scope,
      ),
    ).not.toThrow();

    for (const [field, value] of Object.entries(scope)) {
      const mutated = {
        ...scope,
        [field]: new Uint8Array(32).fill(value[0]! + 20),
      };
      expect(
        pureCircuits.requestScopedVerifierPseudonymV1(holderSecret, mutated),
      ).not.toEqual(pseudonym);
      expect(() =>
        pureCircuits.assertRequestScopedVerifierPseudonymV1(
          pseudonym,
          holderSecret,
          mutated,
        ),
      ).toThrow(/Request-scoped verifier pseudonym context mismatch/);
    }
  });

  it("checks blinded holder-binding witnesses without exposing the raw holder commitment", () => {
    const holderSecret = new Uint8Array(32).fill(4);
    const opening = new Uint8Array(32).fill(5);
    const blindingFactor = new Uint8Array(32).fill(6);
    const verifierChallengeHash = new Uint8Array(32).fill(7);
    const issuerNonce = new Uint8Array(32).fill(8);
    const holderSecretCommitment = pureCircuits.secretHolderBindingCommitment(
      holderSecret,
      opening,
    );
    const binding = {
      blindedHolderSecretCommitment: pureCircuits.blindedSecretHolderCommitment(
        holderSecretCommitment,
        issuerNonce,
        blindingFactor,
      ),
      issuerNonce,
      requestChallengeResponse:
        pureCircuits.secretHolderBindingChallengeResponse(
          holderSecret,
          verifierChallengeHash,
        ),
    };

    expect(() =>
      pureCircuits.assertBlindedSecretHolderBindingWitness(
        binding,
        verifierChallengeHash,
        holderSecret,
        opening,
        blindingFactor,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertBlindedSecretHolderBindingWitness(
        binding,
        verifierChallengeHash,
        holderSecret,
        opening,
        new Uint8Array(32).fill(9),
      ),
    ).toThrow(
      /Blinded holder commitment does not match the hidden holder secret witness/,
    );
  });
});
