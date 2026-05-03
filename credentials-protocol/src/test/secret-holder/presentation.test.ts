import { pureCircuits as genericPureCircuits } from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import {
  pureCircuits,
  type SecretBirthCredentialVerificationRequest,
  type SecretBirthCredentialVerificationSubmission,
} from "@midnight-ntwrk/midnight-did-credentials-birth-secret/managed/secret-birth-credential/contract/index.js";
import { describe, expect, it } from "vitest";

import {
  SecretHolderAgent,
  type SecretPresentationWitness,
} from "../../agents/secret-holder-agent.js";
import {
  type SecretClaimWitness,
  SecretIssuerAgent,
} from "../../agents/secret-issuer-agent.js";
import {
  type SecretSimulatorWitness,
  VerifierAgent,
} from "../../agents/verifier-agent.js";
import { MessageBus } from "../../transport/message-bus.js";
import {
  createDIDProfile,
  padText,
  sha256,
} from "../helpers/did-provider.js";

describe("secret-holder presentation", () => {
  const issuerProfile = createDIDProfile("issuer", "issuer", 123456789n);
  const verifierProfile = createDIDProfile("verifier", "verifier", 555555555n);

  const holderConfig = {
    label: "holder",
    holderSecret: sha256("holder-secret:alice"),
    holderSecretOpening: sha256("opening:holder-secret"),
  };

  const claimWitness: SecretClaimWitness = {
    subjectId: sha256("subject:alice"),
    subjectOpening: sha256("opening:subject"),
    legalNamePadded: padText("Alice Example"),
    legalNameOpening: sha256("opening:legal-name"),
    birthDateDays: 3650n,
    birthDateOpening: sha256("opening:birth-date"),
    birthCountryCodePadded: padText("CAN"),
    birthCountryCodeOpening: sha256("opening:birth-country"),
    issuedAt: 10_000n,
    expiresAt: 20_000n,
  };

  const issueCredential = (bus: MessageBus): SecretHolderAgent => {
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    genericPureCircuits.assertValidProtocolMessageEnvelope(offer.envelope);
    holder.receiveOfferAndSendRequest(offer);
    const request = bus.receive("issuer")!;
    genericPureCircuits.assertValidProtocolMessageEnvelope(request.envelope);
    genericPureCircuits.assertProtocolResponseEnvelope(
      offer.envelope,
      request.envelope,
    );
    issuer.receiveRequestAndIssueCredential(request, claimWitness);
    const result = bus.receive("holder")!;
    genericPureCircuits.assertValidProtocolMessageEnvelope(result.envelope);
    genericPureCircuits.assertProtocolResponseEnvelope(
      request.envelope,
      result.envelope,
    );
    holder.receiveCredentialResult(result);

    return holder;
  };

  const preparePresentation = (
    bus: MessageBus,
    requestedAgeThresholdYears: number,
  ): {
    holder: SecretHolderAgent;
    verifier: VerifierAgent;
    requestMessage: NonNullable<ReturnType<MessageBus["receive"]>>;
    submission: NonNullable<ReturnType<MessageBus["receive"]>>;
    simulatorWitness: SecretSimulatorWitness;
  } => {
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);

    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: true,
      requireVerifierScopedPseudonym: false,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears,
    });

    const requestMessage = bus.receive("holder")!;
    expect(requestMessage.type).toBe("presentation:request");
    genericPureCircuits.assertValidProtocolMessageEnvelope(
      requestMessage.envelope,
    );
    const requestBody =
      requestMessage.body as SecretBirthCredentialVerificationRequest;
    pureCircuits.assertValidSecretBirthCredentialVerificationRequestMessage(
      requestBody,
    );

    const presentationWitness: SecretPresentationWitness = {
      credentialIndex: 0,
      currentDay: 3650n + 365n * 25n,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
      birthCountryCodePadded: claimWitness.birthCountryCodePadded,
      birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
    };

    holder.receiveRequestAndSendPresentation(requestMessage, presentationWitness);
    const submission = bus.receive("verifier")!;
    expect(submission.type).toBe("presentation:submission");
    genericPureCircuits.assertValidProtocolMessageEnvelope(submission.envelope);
    genericPureCircuits.assertProtocolResponseEnvelope(
      requestMessage.envelope,
      submission.envelope,
    );

    const stored = holder.getCredential(0);
    const { holderSecret, holderSecretOpening } = holder.secretWitness;
    const simulatorWitness: SecretSimulatorWitness = {
      request: requestBody,
      currentDay: 3650n + 365n * 25n,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
      holderSecret,
      holderSecretOpening,
      holderBindingBlindingFactor: stored.holderBindingBlindingFactor,
    };

    return {
      holder,
      verifier,
      requestMessage,
      submission,
      simulatorWitness,
    };
  };

  it("presents a secret-holder credential with age predicate", () => {
    const bus = new MessageBus();
    const { holder, verifier, submission, simulatorWitness } =
      preparePresentation(bus, 18);

    expect(holder.credentialCount).toBe(1);

    const result = verifier.receiveSecretSubmissionAndEvaluate(
      submission,
      simulatorWitness,
    );
    expect(result.approved).toBe(true);
  });

  it("rejects a presentation when the holder does not meet the age threshold", () => {
    const bus = new MessageBus();
    const { verifier, submission, simulatorWitness } =
      preparePresentation(bus, 30);

    expect(() =>
      verifier.receiveSecretSubmissionAndEvaluate(submission, simulatorWitness),
    ).toThrow();
  });

  it("returns an approved presentation outcome over the transport-shaped API", () => {
    const bus = new MessageBus();
    const { holder, verifier, submission, simulatorWitness } =
      preparePresentation(bus, 18);

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
    const outcome = holder.receivePresentationOutcome(bus.receive("holder")!);

    expect(outcome.kind).toBe("approved");
    if (outcome.kind === "approved") {
      expect(outcome.result.approved).toBe(true);
    }
  });

  it("returns an explicit rejection for a malformed secret presentation submission", () => {
    const bus = new MessageBus();
    const { holder, verifier, submission, simulatorWitness } =
      preparePresentation(bus, 18);

    const malformedSubmission = globalThis.structuredClone(submission);
    const malformedBody =
      malformedSubmission.body as SecretBirthCredentialVerificationSubmission;
    malformedBody.body.presentation.credentialClaimRoot = new Uint8Array(31);

    verifier.receiveSecretSubmissionAndRespond(
      malformedSubmission,
      simulatorWitness,
    );
    const outcome = holder.receivePresentationOutcome(bus.receive("holder")!);

    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("malformed_submission");
      expect(outcome.rejection.body.retryable).toBe(false);
    }
  });

  it("returns an explicit rejection for a request/submission mismatch", () => {
    const bus = new MessageBus();
    const { holder, verifier, submission, simulatorWitness } =
      preparePresentation(bus, 18);

    const mismatchedSubmission = globalThis.structuredClone(submission);
    const mismatchedBody =
      mismatchedSubmission.body as SecretBirthCredentialVerificationSubmission;
    mismatchedBody.challengeHash = sha256("tampered-presentation-challenge");

    verifier.receiveSecretSubmissionAndRespond(
      mismatchedSubmission,
      simulatorWitness,
    );
    const outcome = holder.receivePresentationOutcome(bus.receive("holder")!);

    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe(
        "request_submission_mismatch",
      );
    }
  });

  it("returns an explicit rejection when the presentation does not satisfy the request", () => {
    const bus = new MessageBus();
    const { holder, verifier, submission, simulatorWitness } =
      preparePresentation(bus, 30);

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
    const outcome = holder.receivePresentationOutcome(bus.receive("holder")!);

    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("unsatisfied_request");
      expect(outcome.rejection.body.retryable).toBe(false);
    }
  });
});
