import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  RevocationAccessDecision,
  RevocationVerificationMode,
} from "../managed/demo-revocation/contract/index.js";
import { CredentialsDemoRevocationSimulator } from "../revocation-simulator.js";
import {
  buildSubmissionForAuthorityAttestedRequest,
  buildSubmissionForRevokedSetRequest,
  createDemoRevocationFixture,
  fixtureRegistryState,
} from "./demo-revocation-fixtures.js";

setNetworkId("undeployed");

describe("credentials demo revocation contract", () => {
  it("builds a typed verifier-supplied-root request with an accepted registry root", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();
    const registryState = fixtureRegistryState(fixture);

    const request = simulator.revocationAwareVerifierSuppliedRootRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
      registryState,
    );

    expect(request.statusPolicy.requireStatus).toEqual(true);
    expect(request.statusPolicy.enforceRegistryId).toEqual(true);
    expect(request.statusPolicy.acceptedRegistryId).toEqual(
      fixture.witness.statusRegistryId,
    );
    expect(request.statusPolicy.enforceAttestationMaxAge).toEqual(false);
    expect(request.statusRequest.registryState).toEqual(registryState);
    expect(request.verificationRequest.verifierChallengeHash).toEqual(
      fixture.verificationRequest.verifierChallengeHash,
    );
  });

  it("verifies a verifier-supplied-root hidden-holder presentation and issues a reusable capability", () => {
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

    const capability = simulator.issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
      fixture.credentialWithStatusBinding,
      request,
      submission,
      fixture.revokedSetStatusVerificationInputs,
      fixture.witness.currentDay,
    );
    const firstClaim = simulator.claimRevocationAwareCapability(capability);
    const secondClaim = simulator.claimRevocationAwareCapability(capability);
    const state = simulator.getLedger();

    expect(state.issuedCredentialCount).toEqual(1n);
    expect(state.verifiedPresentationCount).toEqual(1n);
    expect(state.lastVerificationMode).toEqual(
      RevocationVerificationMode.verifierSuppliedRoot,
    );
    expect(state.lastVerifiedRevokedRoot).toEqual(
      fixture.witness.statusRevokedRoot,
    );
    expect(state.activeAccessCapabilities.member(capability)).toEqual(false);
    expect(state.consumedAccessCapabilities.member(capability)).toEqual(true);
    expect(firstClaim).toEqual(RevocationAccessDecision.approved);
    expect(secondClaim).toEqual(RevocationAccessDecision.alreadyConsumed);
  });

  it("verifies an authority-attested hidden-holder presentation and issues a reusable capability", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();
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

    const capability = simulator.issueRevocationAwareCapabilityWithAuthorityAttestation(
      fixture.credentialWithStatusBinding,
      request,
      submission,
      fixture.authorityAttestedStatusProtocolInputs,
      fixture.witness.currentDay,
      request.verificationRequest.envelope.createdAt + 10n,
    );
    const state = simulator.getLedger();

    expect(state.issuedCredentialCount).toEqual(1n);
    expect(state.verifiedPresentationCount).toEqual(1n);
    expect(state.lastVerificationMode).toEqual(
      RevocationVerificationMode.authorityAttested,
    );
    expect(state.lastVerifiedStatusRegistryId).toEqual(
      fixture.witness.statusRegistryId,
    );
    expect(state.activeAccessCapabilities.member(capability)).toEqual(true);
  });

  it("rejects authority-attested verification when the attestation exceeds the verifier freshness window", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();
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

    expect(() =>
      simulator.issueRevocationAwareCapabilityWithAuthorityAttestation(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.currentDay,
        request.verificationRequest.envelope.createdAt + 60n,
      ),
    ).toThrow(/exceeds the verifier max-age policy/i);
  });

  it("rejects verifier-supplied-root verification when the supplied revoked root diverges from the request", () => {
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

    expect(() =>
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
      ),
    ).toThrow(/revoked root does not match the verifier request/i);
  });

  it("rejects verifier-supplied-root verification when the request snapshot version is stale", () => {
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

    expect(() =>
      simulator.issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        {
          statusProofProtocol: {
            ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol,
            request: {
              ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol
                .request,
              registryState: {
                ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol
                  .request.registryState,
                registryVersion: 0n,
              },
            },
          },
        },
        fixture.witness.currentDay,
      ),
    ).toThrow(
      /status witness state version does not match the verifier request/i,
    );
  });

  it("rejects authority-attested verification when the request snapshot version is stale", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();
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

    expect(() =>
      simulator.issueRevocationAwareCapabilityWithAuthorityAttestation(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        {
          statusProofProtocol: {
            ...fixture.authorityAttestedStatusProtocolInputs.statusProofProtocol,
            request: {
              ...fixture.authorityAttestedStatusProtocolInputs.statusProofProtocol
                .request,
              registryState: {
                ...fixture.authorityAttestedStatusProtocolInputs
                  .statusProofProtocol.request.registryState,
                registryVersion: 0n,
              },
            },
          },
        },
        fixture.witness.currentDay,
        request.verificationRequest.envelope.createdAt + 10n,
      ),
    ).toThrow(/registry version does not match/i);
  });

  it("rejects authority-attested verification after status proof expiration", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();
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

    expect(() =>
      simulator.issueRevocationAwareCapabilityWithAuthorityAttestation(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.currentDay,
        request.verificationRequest.envelope.createdAt + 101n,
      ),
    ).toThrow(/has expired/i);
  });
});
