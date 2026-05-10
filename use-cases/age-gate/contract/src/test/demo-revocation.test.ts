import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  RevocationAccessDecision,
  RevocationVerificationMode,
  StatusCapabilityKind,
} from "../managed/demo-revocation/contract/index.js";
import { CredentialsDemoRevocationSimulator } from "../revocation-simulator.js";
import {
  buildSubmissionForAuthorityAttestedRequest,
  buildSubmissionForLiveStatusRequest,
  buildSubmissionForRevokedSetRequest,
  buildWrongAuthorityAttestedStatusProtocolInputs,
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

  it("builds a typed same-contract live-status request with the accepted live registry", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);

    const request = simulator.revocationAwareLiveStatusRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
    );

    expect(request.statusPolicy.requireStatus).toEqual(true);
    expect(request.statusPolicy.enforceRegistryId).toEqual(true);
    expect(request.statusPolicy.acceptedRegistryId).toEqual(
      fixture.witness.statusRegistryId,
    );
    expect(request.statusPolicy.acceptedStatusCapability).toEqual(
      StatusCapabilityKind.revokedSetNonMembership,
    );
    expect(request.verificationRequest.verifierChallengeHash).toEqual(
      fixture.verificationRequest.verifierChallengeHash,
    );
  });

  it("rejects a same-contract live-status request before the local registry is initialized", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    expect(() =>
      simulator.revocationAwareLiveStatusRequest(
        fixture.credential.issuerVerificationMethodRef,
        fixture.witness.verifierDomainHash,
        fixture.verificationRequest.verifierChallengeHash,
      ),
    ).toThrow(/live status registry is not initialized/i);
  });

  it("rejects re-initializing the same-contract live status registry", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);

    expect(() =>
      simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId),
    ).toThrow(/already been initialized/i);
  });

  it("rejects an empty live status registry identifier", () => {
    const simulator = new CredentialsDemoRevocationSimulator();

    expect(() =>
      simulator.initializeLiveStatusRegistry(new Uint8Array(32)),
    ).toThrow(/registry id must be set/i);
  });

  it("rejects revoking an empty live status handle", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);

    expect(() => simulator.revokeLiveStatusHandle(new Uint8Array(32))).toThrow(
      /status handle must be set/i,
    );
  });

  it("verifies a same-contract live-status hidden-holder presentation and issues a reusable capability", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);
    const request = simulator.revocationAwareLiveStatusRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
    );
    const submission = buildSubmissionForLiveStatusRequest(fixture, request);

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

    const capability = simulator.issueRevocationAwareCapabilityWithLiveStatus(
      fixture.credentialWithStatusBinding,
      request,
      submission,
      fixture.liveStatusVerificationInputs,
      fixture.witness.currentDay,
    );
    const state = simulator.getLedger();

    expect(state.issuedCredentialCount).toEqual(1n);
    expect(state.verifiedPresentationCount).toEqual(1n);
    expect(state.lastVerificationMode).toEqual(
      RevocationVerificationMode.sameContractLiveStatus,
    );
    expect(state.lastVerifiedStatusRegistryId).toEqual(
      fixture.witness.statusRegistryId,
    );
    expect(state.activeAccessCapabilities.member(capability)).toEqual(true);
  });

  it("rejects same-contract live-status verification when the credential status handle is revoked locally", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);
    const request = simulator.revocationAwareLiveStatusRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
    );
    const submission = buildSubmissionForLiveStatusRequest(fixture, request);

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
    simulator.revokeLiveStatusHandle(fixture.witness.statusHandle);

    expect(() =>
      simulator.issueRevocationAwareCapabilityWithLiveStatus(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        fixture.liveStatusVerificationInputs,
        fixture.witness.currentDay,
      ),
    ).toThrow(/revoked in the live status registry/i);
  });

  it("allows idempotent repeat revocation of the same live status handle", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);
    simulator.revokeLiveStatusHandle(fixture.witness.statusHandle);

    expect(() =>
      simulator.revokeLiveStatusHandle(fixture.witness.statusHandle),
    ).not.toThrow();
  });

  it("rejects same-contract live-status verification when the credential is bound to another registry", () => {
    const fixture = createDemoRevocationFixture();
    const simulator = new CredentialsDemoRevocationSimulator();

    simulator.initializeLiveStatusRegistry(new Uint8Array(32).fill(9));
    const request = simulator.revocationAwareLiveStatusRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
    );
    // Disable the shared registry-id policy check so this test exercises the
    // demo contract's own local live-registry guard instead of failing earlier
    // in the reusable birth-secret validation layer.
    request.statusPolicy.enforceRegistryId = false;
    const submission = buildSubmissionForLiveStatusRequest(fixture, request);

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
      simulator.issueRevocationAwareCapabilityWithLiveStatus(
        fixture.credentialWithStatusBinding,
        request,
        submission,
        fixture.liveStatusVerificationInputs,
        fixture.witness.currentDay,
      ),
    ).toThrow(/does not match the live status registry/i);
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
      ),
    ).toThrow(/registry version does not match the verifier request/i);
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
        fixture.authorityAttestedStatusProtocolInputs,
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

  it("rejects authority-attested verification when the attestation is signed by the wrong authority", () => {
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
        buildWrongAuthorityAttestedStatusProtocolInputs(fixture),
        fixture.witness.currentDay,
        request.verificationRequest.envelope.createdAt + 10n,
      ),
    ).toThrow(/status authority/i);
  });

  it("rejects authority-attested verification when the request expects another status proof mode", () => {
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
        {
          ...request,
          statusPolicy: {
            ...request.statusPolicy,
            acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
            enforceAttestationMaxAge: false,
            maxAttestationAge: 0n,
          },
        },
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.currentDay,
        request.verificationRequest.envelope.createdAt + 10n,
      ),
    ).toThrow(/does not accept authority-attested status/i);
  });

  it("rejects verifier-supplied-root verification when the request expects another status proof mode", () => {
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
        {
          ...request,
          statusPolicy: {
            ...request.statusPolicy,
            acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
          },
        },
        submission,
        fixture.revokedSetStatusVerificationInputs,
        fixture.witness.currentDay,
      ),
    ).toThrow(/must require revoked-set status support/i);
  });

  it("rejects same-contract live-status verification when the request expects another status proof mode", () => {
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
    simulator.initializeLiveStatusRegistry(fixture.witness.statusRegistryId);

    const request = simulator.revocationAwareLiveStatusRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.witness.verifierDomainHash,
      fixture.verificationRequest.verifierChallengeHash,
    );
    const submission = buildSubmissionForLiveStatusRequest(fixture, request);

    expect(() =>
      simulator.issueRevocationAwareCapabilityWithLiveStatus(
        fixture.credentialWithStatusBinding,
        {
          ...request,
          statusPolicy: {
            ...request.statusPolicy,
            acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
          },
        },
        submission,
        fixture.liveStatusVerificationInputs,
        fixture.witness.currentDay,
      ),
    ).toThrow(/does not accept live revoked-set verification/i);
  });

  it("rejects a revoked credential before building any revocation demo verification inputs", () => {
    const baseline = createDemoRevocationFixture();

    expect(() =>
      createDemoRevocationFixture({
        revokedStatusHandles: [baseline.witness.statusHandle],
      }),
    ).toThrow(/already present in the revoked set snapshot/i);
  });
});
