import { Ability, type UsesAbilities } from "@serenity-js/core";

import {
  RevocationAccessDecision,
  RevocationVerificationMode,
} from "@midnight-ntwrk/midnight-did-credentials-demo-contract/contract-revocation";
import {
  buildSubmissionForAuthorityAttestedRequest,
  buildSubmissionForLiveStatusRequest,
  buildSubmissionForRevokedSetRequest,
  createSecretBirthCredentialFixture,
  createDemoRevocationFixture,
  CredentialsDemoRevocationSimulator,
  fixtureRegistryState,
} from "@midnight-ntwrk/midnight-did-credentials-demo-contract/testing";

export type HiddenHolderScenarioResult = {
  readonly approved: boolean;
  readonly claimDecision: string | null;
  readonly verificationMode: string | null;
  readonly issuedCredentialCount: bigint;
  readonly verifiedPresentationCount: bigint;
  readonly consumedAccessCapabilityCount: bigint;
  readonly lastVerifiedStatusRegistryId: Uint8Array;
  readonly expectedStatusRegistryId: Uint8Array;
  readonly failureMessage: string | null;
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

  #setupFixture() {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

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

    return { fixture, simulator };
  }

  #recordResult(
    approved: boolean,
    simulator: CredentialsDemoRevocationSimulator,
    fixture: ReturnType<typeof createDemoRevocationFixture>,
    extras: {
      claimDecision: string | null;
      verificationMode: string | null;
      failureMessage: string | null;
    },
  ): void {
    const ledger = simulator.getLedger();

    this.#lastResult = {
      approved,
      claimDecision: extras.claimDecision,
      verificationMode: extras.verificationMode,
      issuedCredentialCount: ledger.issuedCredentialCount,
      verifiedPresentationCount: ledger.verifiedPresentationCount,
      consumedAccessCapabilityCount: ledger.consumedAccessCapabilityCount,
      lastVerifiedStatusRegistryId: ledger.lastVerifiedStatusRegistryId,
      expectedStatusRegistryId: fixture.witness.statusRegistryId,
      failureMessage: extras.failureMessage,
    };
  }

  async runVerifierSuppliedRootHappyPath(): Promise<void> {
    const { fixture, simulator } = this.#setupFixture();
    const request = simulator.revocationAwareVerifierSuppliedRootRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
      fixtureRegistryState(fixture),
    );
    const submission = buildSubmissionForRevokedSetRequest(fixture, request);

    const capability =
      simulator.issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        fixture.revokedSetStatusVerificationInputs,
        fixture.witness.currentDay,
      );
    const claimDecision = simulator.claimRevocationAwareCapability(capability);
    this.#recordResult(
      claimDecision === RevocationAccessDecision.approved,
      simulator,
      fixture,
      {
        claimDecision: RevocationAccessDecision[claimDecision],
        verificationMode:
          RevocationVerificationMode[simulator.getLedger().lastVerificationMode],
        failureMessage: null,
      },
    );
  }

  async runLiveStatusHappyPath(): Promise<void> {
    const { fixture, simulator } = this.#setupFixture();

    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);
    const request = simulator.revocationAwareLiveStatusRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
    );
    const submission = buildSubmissionForLiveStatusRequest(fixture, request);

    const capability = simulator.issueRevocationAwareCapabilityWithLiveStatus(
      fixture.credentialWithStatusBinding,
      request,
      submission,
      fixture.liveStatusVerificationInputs,
      fixture.witness.currentDay,
    );
    const claimDecision = simulator.claimRevocationAwareCapability(capability);
    this.#recordResult(
      claimDecision === RevocationAccessDecision.approved,
      simulator,
      fixture,
      {
        claimDecision: RevocationAccessDecision[claimDecision],
        verificationMode:
          RevocationVerificationMode[simulator.getLedger().lastVerificationMode],
        failureMessage: null,
      },
    );
  }

  async runVerifierSuppliedRootWrongRegistryRejectedPath(): Promise<void> {
    const { fixture, simulator } = this.#setupFixture();
    const request = simulator.revocationAwareVerifierSuppliedRootRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
      fixtureRegistryState(fixture),
    );
    const submission = buildSubmissionForRevokedSetRequest(fixture, request);

    try {
      simulator.issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        {
          statusProofProtocol: {
            ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol,
            witnessInput: {
              ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol
                .witnessInput,
              registryState: {
                ...fixture.revokedSetStatusVerificationInputs
                  .statusProofProtocol.witnessInput.registryState,
                registryId: new Uint8Array(32).fill(9),
              },
            },
          },
        },
        fixture.witness.currentDay,
      );
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage: null,
      });
    } catch (error) {
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage:
          error instanceof Error ? error.message : String(error),
      });
    }
  }

  async runVerifierSuppliedRootWrongRevokedRootRejectedPath(): Promise<void> {
    const { fixture, simulator } = this.#setupFixture();
    const request = simulator.revocationAwareVerifierSuppliedRootRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
      fixtureRegistryState(fixture),
    );
    const submission = buildSubmissionForRevokedSetRequest(fixture, request);

    try {
      simulator.issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        {
          statusProofProtocol: {
            ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol,
            witnessInput: {
              ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol
                .witnessInput,
              registryState: {
                ...fixture.revokedSetStatusVerificationInputs
                  .statusProofProtocol.witnessInput.registryState,
                revokedRoot: new Uint8Array(32).fill(7),
              },
            },
          },
        },
        fixture.witness.currentDay,
      );
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage: null,
      });
    } catch (error) {
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage:
          error instanceof Error ? error.message : String(error),
      });
    }
  }

  async runVerifierSuppliedRootStaleVersionRejectedPath(): Promise<void> {
    const { fixture, simulator } = this.#setupFixture();
    const request = simulator.revocationAwareVerifierSuppliedRootRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
      fixtureRegistryState(fixture),
    );
    const submission = buildSubmissionForRevokedSetRequest(fixture, request);

    try {
      simulator.issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
        fixture.credentialWithStatusBinding,
        {
          ...request,
          statusRequest: {
            ...request.statusRequest,
            registryState: {
              ...request.statusRequest.registryState,
              registryVersion: 0n,
            },
          },
        },
        submission,
        fixture.revokedSetStatusVerificationInputs,
        fixture.witness.currentDay,
      );
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage: null,
      });
    } catch (error) {
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage:
          error instanceof Error ? error.message : String(error),
      });
    }
  }

  async runAuthorityAttestedExpiredProofRejectedPath(): Promise<void> {
    const { fixture, simulator } = this.#setupFixture();
    const request = simulator.revocationAwareAuthorityAttestedRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
      fixtureRegistryState(fixture),
    );
    const submission = buildSubmissionForAuthorityAttestedRequest(
      fixture,
      request,
    );

    try {
      simulator.issueRevocationAwareCapabilityWithAuthorityAttestation(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.currentDay,
        request.verificationRequest.envelope.createdAt + 60n,
      );
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage: null,
      });
    } catch (error) {
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage:
          error instanceof Error ? error.message : String(error),
      });
    }
  }

  async runRevokedCredentialRejectedPath(): Promise<void> {
    const baseline = createSecretBirthCredentialFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    try {
      createSecretBirthCredentialFixture({
        revokedStatusHandles: [baseline.witness.statusHandle],
      });
      this.#recordResult(false, simulator, baseline, {
        claimDecision: null,
        verificationMode: null,
        failureMessage: null,
      });
    } catch (error) {
      this.#recordResult(false, simulator, baseline, {
        claimDecision: null,
        verificationMode: null,
        failureMessage:
          error instanceof Error ? error.message : String(error),
      });
    }
  }

  async runLiveStatusRevokedCredentialRejectedPath(): Promise<void> {
    const { fixture, simulator } = this.#setupFixture();

    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);
    const request = simulator.revocationAwareLiveStatusRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
    );
    const submission = buildSubmissionForLiveStatusRequest(fixture, request);
    simulator.revokeLiveStatusHandle(fixture.witness.statusHandle);

    try {
      simulator.issueRevocationAwareCapabilityWithLiveStatus(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        fixture.liveStatusVerificationInputs,
        fixture.witness.currentDay,
      );
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage: null,
      });
    } catch (error) {
      this.#recordResult(false, simulator, fixture, {
        claimDecision: null,
        verificationMode: null,
        failureMessage:
          error instanceof Error ? error.message : String(error),
      });
    }
  }
  lastResult(): HiddenHolderScenarioResult {
    if (!this.#lastResult) {
      throw new Error("Hidden-holder scenario has not been executed yet");
    }
    return this.#lastResult;
  }
}
