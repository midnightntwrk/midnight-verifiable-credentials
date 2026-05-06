import { createBirthCredentialFixture } from "@midnight-ntwrk/midnight-did-credentials-birth/testing";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../contract.js";
import { HelloVerifierSimulator } from "../testing.js";

setNetworkId("undeployed");

describe("hello-verifier contract", () => {
  it("verifies a birth presentation against a minimal verifier request", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new HelloVerifierSimulator();
    const request = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      18n,
    );

    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );
    simulator.verifyBirthPresentationForHelloVerifier(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
      fixture.witness.currentDay,
    );

    const state = simulator.getLedger();
    expect(state.successfulVerificationCount).toEqual(1n);
    expect(state.lastVerifiedCredentialRoot).toEqual(
      pureCircuits.birthCredentialBodyRoot(fixture.credential),
    );
    expect(state.lastVerifiedCurrentDay).toEqual(fixture.witness.currentDay);
    expect(state.lastVerifiedThresholdYears).toEqual(18n);
    expect(state.lastVerifiedRequestChallenge).toEqual(
      fixture.presentationRequest.verifierChallengeHash,
    );
  });

  it("rejects a presentation that does not satisfy the verifier request", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new HelloVerifierSimulator();
    const stricterRequest = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      30n,
    );

    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );

    expect(() =>
      simulator.verifyBirthPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        stricterRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.currentDay,
      ),
    ).toThrow(/Presentation age threshold does not match the request/);
  });
});
