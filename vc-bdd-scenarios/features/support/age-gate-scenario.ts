import { Ability, type UsesAbilities } from "@serenity-js/core";

import { pureCircuits } from "@midnight-ntwrk/midnight-did-credentials-birth/managed/birth-credential/contract/index.js";
import { createBirthCredentialFixture } from "@midnight-ntwrk/midnight-did-credentials-birth/testing";
import { AccessDecision } from "@midnight-ntwrk/midnight-did-credentials-demo-contract";
import { CredentialsDemoSimulator } from "@midnight-ntwrk/midnight-did-credentials-demo-contract/testing";

export type AgeGateScenarioResult = {
  readonly approved: boolean;
  readonly claimDecision: string;
  readonly issuedCredentialCount: bigint;
  readonly verifiedPresentationCount: bigint;
  readonly consumedAccessCapabilityCount: bigint;
  readonly lastVerifiedCredentialRoot: Uint8Array;
  readonly expectedCredentialRoot: Uint8Array;
  readonly lastVerifiedRequestChallenge: Uint8Array;
};

export class UseAgeGateScenario extends Ability {
  #lastResult: AgeGateScenarioResult | undefined;

  constructor() {
    super();
  }

  static locally(): UseAgeGateScenario {
    return new UseAgeGateScenario();
  }

  static from(actor: UsesAbilities): UseAgeGateScenario {
    return actor.abilityTo(UseAgeGateScenario);
  }

  async runHappyPath(): Promise<void> {
    const fixture = createBirthCredentialFixture();
    const simulator = new CredentialsDemoSimulator();

    simulator.issueBirthCredential(
      fixture.credential,
      fixture.credentialProof,
      fixture.holder.publicKey,
    );
    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );

    const capability = simulator.issueAgeGateCapability(
      fixture.credential,
      fixture.credentialProof,
      fixture.presentation,
      fixture.presentationProof,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
    );
    const claimDecision = simulator.claimAgeGateCapability(capability);
    const ledger = simulator.getLedger();
    const expectedCredentialRoot = pureCircuits.birthCredentialBodyRoot(
      fixture.credential,
    );

    this.#lastResult = {
      approved: claimDecision === AccessDecision.approved,
      claimDecision: AccessDecision[claimDecision],
      issuedCredentialCount: ledger.issuedCredentialCount,
      verifiedPresentationCount: ledger.verifiedPresentationCount,
      consumedAccessCapabilityCount: ledger.consumedAccessCapabilityCount,
      lastVerifiedCredentialRoot: ledger.lastVerifiedCredentialRoot,
      expectedCredentialRoot,
      lastVerifiedRequestChallenge: ledger.lastVerifiedRequestChallenge,
    };
  }

  lastResult(): AgeGateScenarioResult {
    if (!this.#lastResult) {
      throw new Error("Age gate scenario has not been executed yet");
    }
    return this.#lastResult;
  }
}
