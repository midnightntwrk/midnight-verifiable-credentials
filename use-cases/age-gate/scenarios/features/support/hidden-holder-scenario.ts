import { Ability, type UsesAbilities } from "@serenity-js/core";

import {
  RevocationAccessDecision,
  RevocationVerificationMode,
} from "@midnight-ntwrk/midnight-did-credentials-demo-contract/contract-revocation";
import {
  buildSubmissionForRevokedSetRequest,
  createDemoRevocationFixture,
  CredentialsDemoRevocationSimulator,
  fixtureRegistryState,
} from "@midnight-ntwrk/midnight-did-credentials-demo-contract/testing";

export type HiddenHolderScenarioResult = {
  readonly approved: boolean;
  readonly claimDecision: string;
  readonly verificationMode: string;
  readonly issuedCredentialCount: bigint;
  readonly verifiedPresentationCount: bigint;
  readonly consumedAccessCapabilityCount: bigint;
  readonly lastVerifiedStatusRegistryId: Uint8Array;
  readonly expectedStatusRegistryId: Uint8Array;
};

export class UseHiddenHolderScenario extends Ability {
  #lastResult: HiddenHolderScenarioResult | undefined;

  constructor() {
    super();
  }

  static locally(): UseHiddenHolderScenario {
    return new UseHiddenHolderScenario();
  }

  static from(actor: UsesAbilities): UseHiddenHolderScenario {
    return actor.abilityTo(UseHiddenHolderScenario);
  }

  async runVerifierSuppliedRootHappyPath(): Promise<void> {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();
    const request = simulator.revocationAwareVerifierSuppliedRootRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
      fixtureRegistryState(fixture),
    );
    const submission = buildSubmissionForRevokedSetRequest(fixture, request);

    simulator.issueSecretBirthCredential(
      fixture.credential,
      fixture.credentialProof,
    );
    simulator.setHolderWitnesses({
      holderSecret: fixture.witness.holderSecret,
      holderSecretOpening: fixture.witness.holderSecretOpening,
      holderBindingBlindingFactor: fixture.witness.holderBindingBlindingFactor,
      holderBirthDateDays: fixture.witness.birthDateDays,
      holderBirthDateOpening: fixture.witness.birthDateOpening,
    });

    const capability =
      simulator.issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
        fixture.credentialWithStatus,
        request,
        submission,
        fixture.statusVerificationInputs,
        fixture.witness.currentDay,
      );
    const claimDecision = simulator.claimRevocationAwareCapability(capability);
    const ledger = simulator.getLedger();

    this.#lastResult = {
      approved: claimDecision === RevocationAccessDecision.approved,
      claimDecision: RevocationAccessDecision[claimDecision],
      verificationMode: RevocationVerificationMode[ledger.lastVerificationMode],
      issuedCredentialCount: ledger.issuedCredentialCount,
      verifiedPresentationCount: ledger.verifiedPresentationCount,
      consumedAccessCapabilityCount: ledger.consumedAccessCapabilityCount,
      lastVerifiedStatusRegistryId: ledger.lastVerifiedStatusRegistryId,
      expectedStatusRegistryId: fixture.witness.statusRegistryId,
    };
  }

  lastResult(): HiddenHolderScenarioResult {
    if (!this.#lastResult) {
      throw new Error("Hidden-holder scenario has not been executed yet");
    }
    return this.#lastResult;
  }
}
