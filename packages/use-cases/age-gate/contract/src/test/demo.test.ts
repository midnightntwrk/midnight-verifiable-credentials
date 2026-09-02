import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  AccessDecision,
  AgeGateDecisionStatusV1,
  pureCircuits,
  type VerificationTranscriptV1,
} from "../managed/demo/contract/index.js";
import {
  CredentialsDemoSimulator,
  DEFAULT_AGE_GATE_DEPLOYMENT_CONTEXT_V1,
} from "../simulator.js";
import {
  createBirthCredentialFixture,
  createSigner,
  signProof,
} from "./demo-fixtures.js";

setNetworkId("undeployed");

describe("credentials demo contract", () => {
  it("builds an age-gate request from explicit policy inputs", () => {
    const fixture = createBirthCredentialFixture();
    const request = pureCircuits.ageGateRequestForPolicy(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      false,
      21n,
    );

    expect(request.requireBirthCountryDisclosure).toEqual(false);
    expect(request.requireAgeOverThreshold).toEqual(true);
    expect(request.requestedAgeThresholdYears).toEqual(21n);
    expect(request.verifierChallengeHash).toEqual(
      fixture.presentationRequest.verifierChallengeHash,
    );
  });

  it("records issued credentials and verifies an age presentation against private witness data", () => {
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
    simulator.verifyBirthPresentationForRequest(
      fixture.credential,
      fixture.credentialProof,
      fixture.presentationRequest,
      fixture.presentation,
      fixture.presentationProof,
      fixture.witness.currentDay,
    );

    const state = simulator.getLedger();
    const credentialRoot = pureCircuits.birthCredentialBodyRoot(fixture.credential);

    expect(state.issuedCredentialCount).toEqual(1n);
    expect(state.verifiedPresentationCount).toEqual(1n);
    expect(state.issuedCredentialClaimRoots.member(credentialRoot)).toEqual(true);
    expect(state.lastVerifiedCredentialRoot).toEqual(credentialRoot);
    expect(state.lastVerifiedCurrentDay).toEqual(fixture.witness.currentDay);
    expect(state.lastVerifiedThresholdYears).toEqual(
      fixture.presentation.disclosed.ageThresholdYears,
    );
    expect(state.lastVerifiedRequestChallenge).toEqual(
      fixture.presentationRequest.verifierChallengeHash,
    );
  });

  it("rejects future and rolled-back caller days against the ledger context", () => {
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
    const ledgerTime = fixture.witness.currentDay * 86_400n;

    expect(() =>
      simulator.verifyBirthPresentationForRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.currentDay + 1n,
        ledgerTime,
      ),
    ).toThrow(/Trusted day candidate is in the future/);
    expect(() =>
      simulator.verifyBirthPresentationForRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.currentDay - 1n,
        ledgerTime,
      ),
    ).toThrow(/Trusted day candidate is stale/);
    expect(() =>
      simulator.verifyBirthPresentationForRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.currentDay,
        (fixture.witness.currentDay + 1n) * 86_400n - 1n,
      ),
    ).not.toThrow();
  });

  it("rejects credentials outside their ledger-bound validity interval", () => {
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

    expect(() =>
      simulator.verifyBirthPresentationForRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.credential.issuedAt - 1n,
      ),
    ).toThrow(/Credential is not yet valid at trusted ledger time/);
    expect(() =>
      simulator.verifyBirthPresentationForRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.credential.expiresAt + 1n,
      ),
    ).toThrow(/Credential has expired at trusted ledger time/);
  });

  it("rejects presentation verification when the credential was never issued", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new CredentialsDemoSimulator();

    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );

    expect(() =>
      simulator.verifyBirthPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.currentDay,
      ),
    ).toThrow(/Credential was not issued by the demo contract/);
  });

  it("rejects presentation verification when the holder proof key does not match the issued binding", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new CredentialsDemoSimulator();
    const attacker = createSigner("attacker", 111111111n);
    const attackerProof = signProof({
      bodyRoot: pureCircuits.birthCredentialPresentationBodyRoot(fixture.presentation),
      context: "presentation",
      signer: attacker,
      createdAt: fixture.presentationProof.createdAt + 1n,
      challengeHash: fixture.presentationProof.challengeHash,
      nonceScalar: 29n,
    });

    simulator.issueBirthCredential(
      fixture.credential,
      fixture.credentialProof,
      fixture.holder.publicKey,
    );
    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );

    expect(() =>
      simulator.verifyBirthPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        attackerProof,
        fixture.witness.currentDay,
      ),
    ).toThrow(/Presentation proof signer must match holder binding/);
  });

  it("rejects presentation verification when the private age witness is too young", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new CredentialsDemoSimulator();

    simulator.issueBirthCredential(
      fixture.credential,
      fixture.credentialProof,
      fixture.holder.publicKey,
    );
    simulator.setAgeWitness(
      fixture.witness.currentDay - 365n * 10n,
      fixture.witness.birthDateOpening,
    );

    expect(() =>
      simulator.verifyBirthPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.currentDay,
      ),
    ).toThrow(/Birth-date witness does not match credential commitment|Age predicate does not satisfy the requested threshold/);
  });

  it("rejects verification when the presentation does not satisfy the verifier request", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new CredentialsDemoSimulator();
    const stricterRequest = {
      ...fixture.presentationRequest,
      requireSubjectIdCommitmentDisclosure: true,
    };

    simulator.issueBirthCredential(
      fixture.credential,
      fixture.credentialProof,
      fixture.holder.publicKey,
    );
    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );

    expect(() =>
      simulator.verifyBirthPresentationForRequest(
        fixture.credential,
        fixture.credentialProof,
        stricterRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.currentDay,
      ),
    ).toThrow(/Presentation request requires the subject-id commitment disclosure/);
  });

  it("exposes a typed age-gate requirement and issues a reusable capability after successful verification", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new CredentialsDemoSimulator();
    const request = simulator.ageGateRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
    );

    expect(request.requireBirthCountryDisclosure).toEqual(true);
    expect(request.requireAgeOverThreshold).toEqual(true);
    expect(request.requestedAgeThresholdYears).toEqual(18n);
    expect(request.verifierChallengeHash).toEqual(
      fixture.presentationRequest.verifierChallengeHash,
    );

    simulator.issueBirthCredential(
      fixture.credential,
      fixture.credentialProof,
      fixture.holder.publicKey,
    );
    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );

    const transcript = simulator.ageGateDecisionTranscript(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
    );
    const receipt = simulator.issueAgeGateCapability(
      fixture.credential,
      fixture.credentialProof,
      fixture.presentation,
      fixture.presentationProof,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
      transcript,
    );

    const state = simulator.getLedger();
    expect(receipt.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(state.issuedAccessCapabilityCount).toEqual(1n);
    expect(state.activeAccessCapabilities.member(receipt.capability)).toEqual(true);
    expect(state.lastIssuedAccessCapability).toEqual(receipt.capability);
    expect(state.lastBusinessDecision).toEqual(AccessDecision.approved);
  });

  it("supports a soft business denial when a capability is unknown or already consumed", () => {
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

    const transcript = simulator.ageGateDecisionTranscript(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
    );
    const receipt = simulator.issueAgeGateCapability(
      fixture.credential,
      fixture.credentialProof,
      fixture.presentation,
      fixture.presentationProof,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
      transcript,
    );
    const capability = receipt.capability;

    const firstClaim = simulator.claimAgeGateCapability(capability);
    const secondClaim = simulator.claimAgeGateCapability(capability);
    const unknownClaim = simulator.claimAgeGateCapability(new Uint8Array(32).fill(42));

    const state = simulator.getLedger();

    expect(firstClaim).toEqual(AccessDecision.approved);
    expect(secondClaim).toEqual(AccessDecision.alreadyConsumed);
    expect(unknownClaim).toEqual(AccessDecision.unknownCapability);
    expect(state.consumedAccessCapabilityCount).toEqual(1n);
    expect(state.activeAccessCapabilities.member(capability)).toEqual(false);
    expect(state.consumedAccessCapabilities.member(capability)).toEqual(true);
    expect(state.lastBusinessDecision).toEqual(AccessDecision.unknownCapability);
  });

  const prepareAtomicDecision = () => {
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
    const transcript = simulator.ageGateDecisionTranscript(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
    );
    const submit = (
      candidate: VerificationTranscriptV1 = transcript,
      target: CredentialsDemoSimulator = simulator,
      currentDay: bigint = fixture.witness.currentDay,
    ) => target.issueAgeGateCapability(
      fixture.credential,
      fixture.credentialProof,
      fixture.presentation,
      fixture.presentationProof,
      fixture.presentationRequest.verifierChallengeHash,
      currentDay,
      candidate,
    );
    return { fixture, simulator, transcript, submit };
  };

  it("atomically applies one transition and returns idempotent duplicate receipts", () => {
    const { simulator, submit } = prepareAtomicDecision();

    const first = submit();
    const duplicate = submit();

    expect(first.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(duplicate.status).toEqual(AgeGateDecisionStatusV1.duplicate);
    expect(duplicate.decisionNullifier).toEqual(first.decisionNullifier);
    expect(duplicate.capability).toEqual(first.capability);
    const state = simulator.getLedger();
    expect(state.issuedAccessCapabilityCount).toEqual(1n);
    expect(state.consumedDecisionNullifierCount).toEqual(1n);
  });

  it("serializes separate pre-state transaction contexts to one committed transition", () => {
    const { simulator, transcript, fixture } = prepareAtomicDecision();
    const submit = (relay: CredentialsDemoSimulator) => relay.issueAgeGateCapability(
      fixture.credential,
      fixture.credentialProof,
      fixture.presentation,
      fixture.presentationProof,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
      transcript,
    );

    const competition = simulator.serializeCompetingTransactions([submit, submit]);

    expect(competition.map(({ speculative }) => speculative.status)).toEqual([
      AgeGateDecisionStatusV1.applied,
      AgeGateDecisionStatusV1.applied,
    ]);
    expect(competition.map(({ committed }) => committed)).toEqual([true, false]);
    expect(competition.map(({ serialized }) => serialized.status)).toEqual([
      AgeGateDecisionStatusV1.applied,
      AgeGateDecisionStatusV1.duplicate,
    ]);
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(1n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(1n);
  });

  it("serializes competing protected mutations to a deterministic conflict", () => {
    const { simulator, transcript, fixture } = prepareAtomicDecision();
    const competingTranscript = simulator.ageGateDecisionTranscript(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
      fixture.witness.currentDay + 2n,
    );
    const submit = (candidate: VerificationTranscriptV1) =>
      (relay: CredentialsDemoSimulator) => relay.issueAgeGateCapability(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        fixture.presentationProof,
        fixture.presentationRequest.verifierChallengeHash,
        fixture.witness.currentDay,
        candidate,
      );

    const competition = simulator.serializeCompetingTransactions([
      submit(transcript),
      submit(competingTranscript),
    ]);

    expect(competition.map(({ speculative }) => speculative.status)).toEqual([
      AgeGateDecisionStatusV1.applied,
      AgeGateDecisionStatusV1.applied,
    ]);
    expect(competition.map(({ committed }) => committed)).toEqual([true, false]);
    expect(competition.map(({ serialized }) => serialized.status)).toEqual([
      AgeGateDecisionStatusV1.applied,
      AgeGateDecisionStatusV1.conflict,
    ]);
    expect(competition[1]?.serialized.transcriptDigest).toEqual(
      competition[0]?.serialized.transcriptDigest,
    );
    expect(competition[1]?.serialized.capability).toEqual(
      competition[0]?.serialized.capability,
    );
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(1n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(1n);
  });

  it("retains consumed nullifiers across runtime restart", () => {
    const { simulator, submit } = prepareAtomicDecision();
    const first = submit();
    const restarted = simulator.restart();

    const duplicate = submit(undefined, restarted);

    expect(first.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(duplicate.status).toEqual(AgeGateDecisionStatusV1.duplicate);
    expect(restarted.getLedger().issuedAccessCapabilityCount).toEqual(1n);
  });

  it("binds verifier-issued request ids to the configured network", () => {
    const { fixture, transcript } = prepareAtomicDecision();
    const otherNetwork = new CredentialsDemoSimulator(undefined, {
      networkIdDigest: new Uint8Array(32).fill(31),
      deploymentDigest:
        DEFAULT_AGE_GATE_DEPLOYMENT_CONTEXT_V1.deploymentDigest,
      verifierContractDigest:
        DEFAULT_AGE_GATE_DEPLOYMENT_CONTEXT_V1.verifierContractDigest,
    });
    const otherTranscript = otherNetwork.ageGateDecisionTranscript(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
    );

    expect(otherTranscript.requestIdDigest).not.toEqual(
      transcript.requestIdDigest,
    );
  });

  it("domain-separates nullifiers across configured networks and deployments", () => {
    const { fixture, simulator, transcript, submit } = prepareAtomicDecision();
    const other = new CredentialsDemoSimulator(undefined, {
      networkIdDigest: new Uint8Array(32).fill(31),
      deploymentDigest: new Uint8Array(32).fill(32),
      verifierContractDigest: new Uint8Array(32).fill(33),
    });
    other.issueBirthCredential(
      fixture.credential,
      fixture.credentialProof,
      fixture.holder.publicKey,
    );
    other.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );
    const otherTranscript = other.ageGateDecisionTranscript(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
    );

    const first = submit(transcript, simulator);
    const second = submit(otherTranscript, other);

    expect(first.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(second.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(first.decisionNullifier).not.toEqual(second.decisionNullifier);
  });

  it("returns conflict without consuming a fresh nullifier for the same protected mutation", () => {
    const { fixture, simulator, submit } = prepareAtomicDecision();
    const first = submit();
    const competing = simulator.ageGateDecisionTranscript(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
      fixture.witness.currentDay + 2n,
    );

    const conflict = submit(competing);

    expect(first.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(conflict.status).toEqual(AgeGateDecisionStatusV1.conflict);
    expect(conflict.decisionNullifier).not.toEqual(first.decisionNullifier);
    const state = simulator.getLedger();
    expect(state.issuedAccessCapabilityCount).toEqual(1n);
    expect(state.consumedDecisionNullifierCount).toEqual(1n);
    expect(state.consumedDecisionNullifiers.member(conflict.decisionNullifier)).toEqual(false);
  });

  it("preserves at-most-once semantics when conflicting requests arrive in reverse order", () => {
    const { fixture, simulator, submit } = prepareAtomicDecision();
    const competing = simulator.ageGateDecisionTranscript(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
      fixture.witness.currentDay + 2n,
    );

    const competingFirst = submit(competing);
    const originalSecond = submit();

    expect(competingFirst.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(originalSecond.status).toEqual(AgeGateDecisionStatusV1.conflict);
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(1n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(1n);
  });

  it.each([
    ["action", "actionClassDigest"],
    ["action invocation", "actionInvocationDigest"],
    ["scope", "replayScopeDigest"],
    ["deployment", "deploymentDigest"],
    ["verifier contract", "verifierContractDigest"],
    ["network", "networkIdDigest"],
    ["transcript", "policyDigest"],
    ["caller request id", "requestIdDigest"],
    ["caller nullifier", "decisionNullifier"],
  ] as const)("rejects %s mutation before replay or business state changes", (_label, field) => {
    const { simulator, transcript, submit } = prepareAtomicDecision();
    const candidate = {
      ...transcript,
      [field]: new Uint8Array(32).fill(73),
    };

    expect(() => submit(candidate)).toThrow(
      /request id was not issued|canonical age-gate decision transcript/i,
    );
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(0n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(0n);
  });

  it("rejects a trusted-time transcript mismatch without consuming replay or business state", () => {
    const { simulator, transcript, submit } = prepareAtomicDecision();

    expect(() => submit({
      ...transcript,
      trustedTime: transcript.trustedTime + 1n,
    })).toThrow(/canonical age-gate decision transcript/i);
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(0n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(0n);
  });

  it("rejects an expired verifier-issued request instead of refreshing its expiry", () => {
    const { fixture, simulator, transcript, submit } = prepareAtomicDecision();
    const expiredDay = fixture.witness.currentDay + 2n;

    expect(() => submit(transcript, simulator, expiredDay)).toThrow(
      /request has expired/i,
    );
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(0n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(0n);
  });

  it("rejects a stale submitted day against later ledger time", () => {
    const { fixture, simulator, transcript } = prepareAtomicDecision();

    expect(() => simulator.issueAgeGateCapability(
      fixture.credential,
      fixture.credentialProof,
      fixture.presentation,
      fixture.presentationProof,
      fixture.presentationRequest.verifierChallengeHash,
      fixture.witness.currentDay,
      transcript,
      (fixture.witness.currentDay + 2n) * 86_400n,
    )).toThrow(/Trusted day candidate is stale/);
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(0n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(0n);
  });

  it("rejects reuse of a verifier-issued request id with another challenge", () => {
    const { fixture, simulator, transcript } = prepareAtomicDecision();
    const otherChallenge = new Uint8Array(32).fill(99);
    const otherProof = signProof({
      bodyRoot: pureCircuits.birthCredentialPresentationBodyRoot(fixture.presentation),
      context: "presentation",
      signer: fixture.holder,
      createdAt: fixture.presentationProof.createdAt,
      challengeHash: otherChallenge,
      nonceScalar: 19n,
    });

    expect(() => simulator.issueAgeGateCapability(
      fixture.credential,
      fixture.credentialProof,
      fixture.presentation,
      otherProof,
      otherChallenge,
      fixture.witness.currentDay,
      { ...transcript, challengeDigest: otherChallenge },
    )).toThrow(/request challenge mismatch/i);
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(0n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(0n);
  });

  it("returns conflict, not duplicate, when canonical transcript data changes for one nullifier", () => {
    const { fixture, simulator, transcript, submit } = prepareAtomicDecision();
    const first = submit();
    const nextDay = fixture.witness.currentDay + 1n;
    const changed = simulator.ageGateDecisionTranscriptForIssuedRequest(
      fixture.credential,
      fixture.presentation,
      fixture.presentationRequest.verifierChallengeHash,
      nextDay,
      transcript.requestIdDigest,
    );

    const conflict = submit(changed, simulator, nextDay);

    expect(first.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(conflict.status).toEqual(AgeGateDecisionStatusV1.conflict);
    expect(conflict.decisionNullifier).toEqual(first.decisionNullifier);
    expect(conflict.transcriptDigest).toEqual(first.transcriptDigest);
    expect(conflict.capability).toEqual(first.capability);
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(1n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(1n);
  });

  it("rejects cross-profile submissions and indeterminate-shaped transcripts without consumption", () => {
    const { simulator, transcript, submit } = prepareAtomicDecision();

    expect(() => submit({ ...transcript, profile: 2n })).toThrow(
      /profile requires|canonical age-gate decision transcript/i,
    );
    expect(() => submit({
      ...transcript,
      issuerEvidenceDigest: new Uint8Array(32).fill(81),
    })).toThrow(/canonical age-gate decision transcript/i);
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(0n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(0n);
  });

  it("does not consume a nullifier when credential verification fails", () => {
    const { fixture, simulator, transcript, submit } = prepareAtomicDecision();
    simulator.setAgeWitness(
      fixture.witness.currentDay - 365n * 10n,
      fixture.witness.birthDateOpening,
    );

    expect(() => submit(transcript)).toThrow(
      /Birth-date witness does not match credential commitment|Age predicate does not satisfy the requested threshold/,
    );
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(0n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(0n);
  });

  it("discards both nullifier and protected mutation when a transaction rolls back", () => {
    const { simulator, submit } = prepareAtomicDecision();

    const rolledBack = simulator.simulateRolledBackTransaction(submit);

    expect(rolledBack.status).toEqual(AgeGateDecisionStatusV1.applied);
    expect(simulator.getLedger().issuedAccessCapabilityCount).toEqual(0n);
    expect(simulator.getLedger().consumedDecisionNullifierCount).toEqual(0n);
    expect(submit().status).toEqual(AgeGateDecisionStatusV1.applied);
  });
});
