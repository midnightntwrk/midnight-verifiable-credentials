import { Buffer } from "node:buffer";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deserialize, serialize } from "node:v8";

import { pureCircuits as genericPureCircuits } from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import {
  pureCircuits,
  type SecretBirthCredentialVerificationRequest,
  type SecretBirthCredentialVerificationSubmission,
} from "@midnight-ntwrk/midnight-did-credentials-birth-secret/managed/secret-birth-credential/contract/index.js";
import { describe, expect, it } from "vitest";

import { FileSystemProtocolStateByteStore } from "../../adapters/file-protocol-state-store.js";
import {
  createCodecBackedProtocolStateStore,
  InMemoryProtocolStateByteStore,
  InMemoryProtocolStateStore,
  type ProtocolStateCodecResolver,
} from "../../agents/protocol-state-store.js";
import type { ProtocolRandomnessSource } from "../../agents/randomness.js";
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

  const secretPresentationRandomness = (): ProtocolRandomnessSource => ({
    nextChallengeHash: () => sha256("custom:secret-presentation:challenge"),
    nextIssuerNonce: () => sha256("custom:secret-presentation:issuer-nonce"),
    nextBlindingFactor: () => sha256("custom:secret-presentation:blinding-factor"),
    nextSigningNonceScalar: () => 41n,
  });

  const v8CodecResolver: ProtocolStateCodecResolver = {
    getCodec<T>() {
      return {
        encode: (value: T) => serialize(value),
        decode: (encodedValue: Uint8Array) =>
          deserialize(Buffer.from(encodedValue)) as T,
      };
    },
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

  it("can re-deliver blinded-secret presentation outcomes across verifier restarts with a shared protocol state store", () => {
    const bus = new MessageBus();
    const stateStore = new InMemoryProtocolStateStore();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus, {
      stateStore,
    });

    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: true,
      requireVerifierScopedPseudonym: false,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears: 18,
    });

    const requestMessage = bus.receive("holder")!;
    const requestBody =
      requestMessage.body as SecretBirthCredentialVerificationRequest;
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

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
    const firstOutcome = bus.receive("holder")!;

    const restartedVerifier = new VerifierAgent(verifierProfile, bus, {
      stateStore,
    });
    restartedVerifier.receiveSecretSubmissionAndRespond(
      submission,
      simulatorWitness,
    );
    const replayedOutcome = bus.receive("holder")!;

    expect(replayedOutcome).toEqual(firstOutcome);
  });

  it("can re-deliver blinded-secret presentation outcomes through a codec-backed state store", () => {
    const bus = new MessageBus();
    const stateStore = createCodecBackedProtocolStateStore(
      new InMemoryProtocolStateByteStore(),
      v8CodecResolver,
    );
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus, {
      stateStore,
    });

    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: true,
      requireVerifierScopedPseudonym: false,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears: 18,
    });

    const requestMessage = bus.receive("holder")!;
    const requestBody =
      requestMessage.body as SecretBirthCredentialVerificationRequest;
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

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
    const firstOutcome = bus.receive("holder")!;

    const restartedVerifier = new VerifierAgent(verifierProfile, bus, {
      stateStore,
    });
    restartedVerifier.receiveSecretSubmissionAndRespond(
      submission,
      simulatorWitness,
    );
    const replayedOutcome = bus.receive("holder")!;

    expect(replayedOutcome).toEqual(firstOutcome);
  });

  it("can re-deliver blinded-secret presentation outcomes through a file-backed codec store", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-protocol-state-"));

    try {
      const bus = new MessageBus();
      const stateStore = createCodecBackedProtocolStateStore(
        new FileSystemProtocolStateByteStore(rootDir),
        v8CodecResolver,
      );
      const holder = issueCredential(bus);
      const verifier = new VerifierAgent(verifierProfile, bus, {
        stateStore,
      });

      verifier.createAndSendSecretPresentationRequest("holder", {
        issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
        requireSubjectIdCommitmentDisclosure: false,
        requireBirthCountryDisclosure: true,
        requireVerifierScopedPseudonym: false,
        requireAgeOverThreshold: true,
        requestedAgeThresholdYears: 18,
      });

      const requestMessage = bus.receive("holder")!;
      const requestBody =
        requestMessage.body as SecretBirthCredentialVerificationRequest;
      const presentationWitness: SecretPresentationWitness = {
        credentialIndex: 0,
        currentDay: 3650n + 365n * 25n,
        birthDateDays: claimWitness.birthDateDays,
        birthDateOpening: claimWitness.birthDateOpening,
        birthCountryCodePadded: claimWitness.birthCountryCodePadded,
        birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
      };

      holder.receiveRequestAndSendPresentation(
        requestMessage,
        presentationWitness,
      );
      const submission = bus.receive("verifier")!;
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

      verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
      const firstOutcome = bus.receive("holder")!;

      const restartedVerifier = new VerifierAgent(verifierProfile, bus, {
        stateStore,
      });
      restartedVerifier.receiveSecretSubmissionAndRespond(
        submission,
        simulatorWitness,
      );
      const replayedOutcome = bus.receive("holder")!;

      expect(replayedOutcome).toEqual(firstOutcome);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("allows integrators to inject custom blinded-secret presentation randomness", () => {
    const bus = new MessageBus();
    const randomness = secretPresentationRandomness();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus, {
      randomness,
    });

    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: true,
      requireVerifierScopedPseudonym: false,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears: 18,
    });

    const requestMessage = bus.receive("holder")!;
    const requestBody =
      requestMessage.body as SecretBirthCredentialVerificationRequest;
    expect(requestBody.verifierChallengeHash).toEqual(
      sha256("custom:secret-presentation:challenge"),
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
    const submissionBody =
      submission.body as SecretBirthCredentialVerificationSubmission;
    expect(submissionBody.challengeHash).toEqual(
      sha256("custom:secret-presentation:challenge"),
    );
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

  it("rejects an expired secret presentation request at the holder boundary", () => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);

    verifier.createAndSendSecretPresentationRequest(
      "holder",
      {
        issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
        requireSubjectIdCommitmentDisclosure: false,
        requireBirthCountryDisclosure: true,
        requireVerifierScopedPseudonym: false,
        requireAgeOverThreshold: true,
        requestedAgeThresholdYears: 18,
      },
      {
        currentTimeMs: 10n,
        requestExpiresAtMs: 100n,
      },
    );

    const requestMessage = bus.receive("holder")!;
    const presentationWitness: SecretPresentationWitness = {
      credentialIndex: 0,
      currentDay: 3650n + 365n * 25n,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
      birthCountryCodePadded: claimWitness.birthCountryCodePadded,
      birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
    };

    expect(() =>
      holder.receiveRequestAndSendPresentation(requestMessage, presentationWitness, {
        currentTimeMs: 101n,
      }),
    ).toThrow(/presentation request expired/i);
  });

  it("returns an explicit rejection when the verifier processes a submission after the request expired", () => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);

    verifier.createAndSendSecretPresentationRequest(
      "holder",
      {
        issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
        requireSubjectIdCommitmentDisclosure: false,
        requireBirthCountryDisclosure: true,
        requireVerifierScopedPseudonym: false,
        requireAgeOverThreshold: true,
        requestedAgeThresholdYears: 18,
      },
      {
        currentTimeMs: 10n,
        requestExpiresAtMs: 100n,
      },
    );

    const requestMessage = bus.receive("holder")!;
    const requestBody =
      requestMessage.body as SecretBirthCredentialVerificationRequest;
    const presentationWitness: SecretPresentationWitness = {
      credentialIndex: 0,
      currentDay: 3650n + 365n * 25n,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
      birthCountryCodePadded: claimWitness.birthCountryCodePadded,
      birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
    };

    holder.receiveRequestAndSendPresentation(requestMessage, presentationWitness, {
      currentTimeMs: 90n,
    });
    const submission = bus.receive("verifier")!;
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

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness, {
      currentTimeMs: 101n,
    });
    const outcome = holder.receivePresentationOutcome(bus.receive("holder")!, {
      currentTimeMs: 101n,
    });

    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("expired_request");
      expect(outcome.rejection.body.retryable).toBe(true);
    }
  });

  it("returns an explicit rejection when the verifier processes a submission after the submission expired", () => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);

    verifier.createAndSendSecretPresentationRequest(
      "holder",
      {
        issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
        requireSubjectIdCommitmentDisclosure: false,
        requireBirthCountryDisclosure: true,
        requireVerifierScopedPseudonym: false,
        requireAgeOverThreshold: true,
        requestedAgeThresholdYears: 18,
      },
      {
        currentTimeMs: 10n,
        requestExpiresAtMs: 200n,
      },
    );

    const requestMessage = bus.receive("holder")!;
    const requestBody =
      requestMessage.body as SecretBirthCredentialVerificationRequest;
    const presentationWitness: SecretPresentationWitness = {
      credentialIndex: 0,
      currentDay: 3650n + 365n * 25n,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
      birthCountryCodePadded: claimWitness.birthCountryCodePadded,
      birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
    };

    holder.receiveRequestAndSendPresentation(requestMessage, presentationWitness, {
      currentTimeMs: 90n,
      submissionExpiresAtMs: 95n,
    });
    const submission = bus.receive("verifier")!;
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

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness, {
      currentTimeMs: 96n,
    });
    const outcome = holder.receivePresentationOutcome(bus.receive("holder")!, {
      currentTimeMs: 96n,
    });

    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("expired_submission");
      expect(outcome.rejection.body.retryable).toBe(true);
    }
  });

  it("re-evaluates a finalized presentation after the retention window expires", () => {
    const bus = new MessageBus();
    const stateStore = new InMemoryProtocolStateStore();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus, {
      stateStore,
      stateRetention: {
        finalizedOutcomeTtlMs: 5n,
      },
    });

    verifier.createAndSendSecretPresentationRequest(
      "holder",
      {
        issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
        requireSubjectIdCommitmentDisclosure: false,
        requireBirthCountryDisclosure: true,
        requireVerifierScopedPseudonym: false,
        requireAgeOverThreshold: true,
        requestedAgeThresholdYears: 18,
      },
      {
        currentTimeMs: 10n,
      },
    );

    const requestMessage = bus.receive("holder")!;
    const requestBody =
      requestMessage.body as SecretBirthCredentialVerificationRequest;
    const presentationWitness: SecretPresentationWitness = {
      credentialIndex: 0,
      currentDay: 3650n + 365n * 25n,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
      birthCountryCodePadded: claimWitness.birthCountryCodePadded,
      birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
    };

    holder.receiveRequestAndSendPresentation(requestMessage, presentationWitness, {
      currentTimeMs: 11n,
    });
    const submission = bus.receive("verifier")!;
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

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness, {
      currentTimeMs: 12n,
    });
    const firstOutcome = bus.receive("holder")!;

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness, {
      currentTimeMs: 20n,
    });
    const secondOutcome = bus.receive("holder")!;

    expect(secondOutcome.type).toBe("presentation:result");
    expect(secondOutcome.envelope.messageId).not.toEqual(
      firstOutcome.envelope.messageId,
    );
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

  it("re-delivers the same approved presentation outcome for a duplicate submission", () => {
    const bus = new MessageBus();
    const { holder, verifier, submission, simulatorWitness } =
      preparePresentation(bus, 18);

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
    const firstOutcome = holder.receivePresentationOutcome(bus.receive("holder")!);

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
    const secondOutcome = holder.receivePresentationOutcome(bus.receive("holder")!);

    expect(firstOutcome.kind).toBe("approved");
    expect(secondOutcome.kind).toBe("approved");
    if (firstOutcome.kind === "approved" && secondOutcome.kind === "approved") {
      expect(secondOutcome.result).toEqual(firstOutcome.result);
    }
  });

  it("re-delivers the same rejected presentation outcome for a duplicate malformed submission", () => {
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
    const firstOutcome = holder.receivePresentationOutcome(bus.receive("holder")!);

    verifier.receiveSecretSubmissionAndRespond(
      malformedSubmission,
      simulatorWitness,
    );
    const secondOutcome = holder.receivePresentationOutcome(bus.receive("holder")!);

    expect(firstOutcome.kind).toBe("rejected");
    expect(secondOutcome.kind).toBe("rejected");
    if (firstOutcome.kind === "rejected" && secondOutcome.kind === "rejected") {
      expect(secondOutcome.rejection).toEqual(firstOutcome.rejection);
    }
  });

  it("rejects an uncorrelated approved presentation outcome at the holder boundary", () => {
    const bus = new MessageBus();
    const { holder, verifier, submission, simulatorWitness } =
      preparePresentation(bus, 18);

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
    const approvedMessage = bus.receive("holder")!;
    const uncorrelatedApproved = {
      ...globalThis.structuredClone(approvedMessage),
      envelope: {
        ...approvedMessage.envelope,
        respondsToMessageId: sha256("unknown-presentation-submission"),
      },
    };

    expect(() =>
      holder.receivePresentationOutcome(uncorrelatedApproved),
    ).toThrow(/No pending presentation submission found/);
  });

  it("rejects an uncorrelated presentation rejection at the holder boundary", () => {
    const bus = new MessageBus();
    const { holder, verifier, submission, simulatorWitness } =
      preparePresentation(bus, 30);

    verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
    const rejectionMessage = bus.receive("holder")!;
    const uncorrelatedRejection = {
      ...globalThis.structuredClone(rejectionMessage),
      envelope: {
        ...rejectionMessage.envelope,
        respondsToMessageId: sha256("unknown-presentation-submission"),
      },
    };

    expect(() =>
      holder.receivePresentationOutcome(uncorrelatedRejection),
    ).toThrow(/No pending presentation submission found/);
  });
});
