import { Buffer } from "node:buffer";

import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import {
  type Proof,
  pureCircuits as genericPureCircuits,
  type VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import {
  type BirthCredential,
  type BirthCredentialPresentation,
  type BirthCredentialPresentationRequest,
  type BirthCredentialVerificationRequest,
  type BirthCredentialVerificationResult,
  type BirthCredentialVerificationSubmission,
  HolderBindingProfile,
  pureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials-birth/managed/birth-credential/contract/index.js";
import {
  pureCircuits as secretPureCircuits,
  type SecretBirthCredentialVerificationRequest,
  type SecretBirthCredentialVerificationResult,
  type SecretBirthCredentialVerificationSubmission,
} from "@midnight-ntwrk/midnight-did-credentials-birth-secret/managed/secret-birth-credential/contract/index.js";

import {
  InMemoryProtocolStateStore,
  type ProtocolStateCollection,
  type ProtocolStateRetentionPolicy,
  type ProtocolStateStore,
  readRetainedProtocolState,
  resolveCurrentTimeMs,
  type RetainedProtocolState,
  writeRetainedProtocolState,
} from "../../agents/protocol-state-store.js";
import {
  type ProtocolRandomnessFlow,
  type ProtocolRandomnessSource,
  secureProtocolRandomnessSource,
} from "../../agents/randomness.js";
import type { DIDProfile } from "../../agents/types.js";
import { mod } from "../../shared/crypto.js";
import {
  createProtocolEnvelopeFactory,
  type ProtocolEnvelopeFactory,
  type ProtocolEnvelopeIdentifierSource,
} from "../../shared/envelope.js";
import {
  assertBodyHasFields,
  assertMessageType,
  protocolMessageAuthenticationDigest,
} from "../../shared/validation.js";
import type { MessageBus } from "../../transport/message-bus.js";
import type {
  PartyId,
  ProtocolMessage,
  SecretBirthCredentialVerificationRejection,
  SecretBirthCredentialVerificationRejectionCategory,
} from "../../transport/types.js";
import {
  BIRTH_COMPATIBILITY_FEATURE_HINTS,
  BIRTH_SCHEMA,
  SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS,
  SECRET_BIRTH_SCHEMA,
} from "./schema-descriptors.js";
import type {
  SameHolderPresentation,
  SameHolderTriplePresentation,
} from "./secret-holder-agent.js";

export type PresentationRequirements = {
  readonly issuerVerificationMethodRef: VerificationMethodRef;
  readonly requireSubjectIdCommitmentDisclosure: boolean;
  readonly requireBirthCountryDisclosure: boolean;
  readonly requireAgeOverThreshold: boolean;
  readonly requestedAgeThresholdYears: number;
};

const earlierExpiryMs = (
  first?: bigint,
  second?: bigint,
): bigint | undefined => {
  if (first === undefined) {
    return second;
  }
  if (second === undefined) {
    return first;
  }
  return first < second ? first : second;
};

class PresentationProtocolError extends Error {
  readonly category: SecretBirthCredentialVerificationRejectionCategory;
  readonly retryable: boolean;

  constructor(
    category: SecretBirthCredentialVerificationRejectionCategory,
    message: string,
    retryable = false,
  ) {
    super(message);
    this.name = "PresentationProtocolError";
    this.category = category;
    this.retryable = retryable;
  }
}

export type PresentationSubmissionBody = {
  readonly credential: BirthCredential;
  readonly credentialProof: Proof;
  readonly presentation: BirthCredentialPresentation;
  readonly presentationProof: Proof;
};

/**
 * Private witness data needed only by the Compact simulator to evaluate
 * age predicates. In a real ZK deployment the verifier never sees this --
 * the circuit proves the predicate without revealing the inputs.
 * This type is intended for test use only.
 */
export type SimulatorWitness = {
  readonly request: BirthCredentialVerificationRequest;
  readonly currentDay: bigint;
  readonly birthDateDays: bigint;
  readonly birthDateOpening: Uint8Array;
};

export type SecretPresentationRequirements = {
  readonly issuerVerificationMethodRef: VerificationMethodRef;
  readonly requireSubjectIdCommitmentDisclosure: boolean;
  readonly requireBirthCountryDisclosure: boolean;
  readonly requireVerifierScopedPseudonym: boolean;
  readonly deploymentDigest?: Uint8Array;
  readonly audienceDigest?: Uint8Array;
  readonly originDigest?: Uint8Array;
  readonly consentDigest?: Uint8Array;
  readonly requireAgeOverThreshold: boolean;
  readonly requestedAgeThresholdYears: number;
};

type SecretPresentationRequestOptions = {
  readonly currentTimeMs?: bigint;
  readonly requestExpiresAtMs?: bigint;
};

type SecretPresentationProcessingOptions = {
  readonly currentTimeMs?: bigint;
};

/**
 * Private witness data needed only by the Compact simulator to evaluate
 * secret-holder presentations. In a real ZK deployment the verifier never
 * sees the holder secret or its opening -- the circuit proves holder
 * binding and age predicates without revealing these inputs.
 * This type is intended for test use only.
 */
export type SecretSimulatorWitness = {
  readonly request: SecretBirthCredentialVerificationRequest;
  readonly currentDay: bigint;
  readonly birthDateDays: bigint;
  readonly birthDateOpening: Uint8Array;
  readonly holderSecret: Uint8Array;
  readonly holderSecretOpening: Uint8Array;
  readonly holderBindingBlindingFactor: Uint8Array;
};

/**
 * Private witness data needed only by the Compact simulator to verify
 * same-holder composition proofs. In a real ZK deployment the verifier
 * never sees the holder secret or blinding factors.
 * This type is intended for test use only.
 */
export type SameHolderSimulatorWitness = {
  readonly holderSecret: Uint8Array;
  readonly firstHolderSecretOpening: Uint8Array;
  readonly firstHolderBindingBlindingFactor: Uint8Array;
  readonly secondHolderSecretOpening: Uint8Array;
  readonly secondHolderBindingBlindingFactor: Uint8Array;
};

export type SameHolderTripleSimulatorWitness = SameHolderSimulatorWitness & {
  readonly thirdHolderSecretOpening: Uint8Array;
  readonly thirdHolderBindingBlindingFactor: Uint8Array;
};

export class VerifierAgent {
  private readonly profile: DIDProfile;
  private readonly bus: MessageBus;
  private readonly randomness: ProtocolRandomnessSource;
  private readonly createEnvelope: ProtocolEnvelopeFactory;
  private readonly retentionPolicy: ProtocolStateRetentionPolicy;
  private challengeCounter = 0;
  private authenticationCounter = 0;
  private readonly completedSecretPresentationOutcomes: ProtocolStateCollection<
    RetainedProtocolState<ProtocolMessage>
  >;

  constructor(
    profile: DIDProfile,
    bus: MessageBus,
    options: {
      readonly envelopeIdentifierSource?: ProtocolEnvelopeIdentifierSource;
      readonly randomness?: ProtocolRandomnessSource;
      readonly stateStore?: ProtocolStateStore;
      readonly stateRetention?: ProtocolStateRetentionPolicy;
    } = {},
  ) {
    this.profile = profile;
    this.bus = bus;
    this.randomness = options.randomness ?? secureProtocolRandomnessSource;
    this.createEnvelope = createProtocolEnvelopeFactory(
      options.envelopeIdentifierSource,
    );
    this.retentionPolicy = options.stateRetention ?? {};
    const stateStore = options.stateStore ?? new InMemoryProtocolStateStore();
    this.completedSecretPresentationOutcomes = stateStore.collection(
      `verifier:${this.profile.label}:completed-secret-presentation-outcomes`,
    );
  }

  private generateChallengeHashFor(
    flow: ProtocolRandomnessFlow,
    threadId?: Uint8Array,
  ): Uint8Array {
    return this.randomness.nextChallengeHash({
      partyLabel: this.profile.label,
      flow,
      purpose: "verifier-challenge",
      sequence: this.challengeCounter++,
      threadId,
    });
  }

  /** Generate a unique challenge hash for explicit-holder presentation. */
  generateChallengeHash(): Uint8Array {
    return this.generateChallengeHashFor("explicit-presentation");
  }

  /**
   * @deprecated Use generateChallengeHash() or createAndSend*Request(...) to avoid
   * ambiguous flow selection.
   */
  get verifierChallengeHash(): Uint8Array {
    return this.generateChallengeHash();
  }

  createAndSendPresentationRequest(
    holderLabel: PartyId,
    requirements: PresentationRequirements,
  ): void {
    const request: BirthCredentialVerificationRequest = {
      envelope: this.createEnvelope(
        "presentation-request",
        "birth-presentation",
        true,
      ),
      schema: BIRTH_SCHEMA,
      issuerVerificationMethodRef: requirements.issuerVerificationMethodRef,
      holderBindingProfile: HolderBindingProfile.explicitDid,
      features: BIRTH_COMPATIBILITY_FEATURE_HINTS,
      verifierChallengeHash: this.generateChallengeHashFor(
        "explicit-presentation",
      ),
      body: {
        requireSubjectIdCommitmentDisclosure:
          requirements.requireSubjectIdCommitmentDisclosure,
        requireBirthCountryDisclosure:
          requirements.requireBirthCountryDisclosure,
        requireAgeOverThreshold: requirements.requireAgeOverThreshold,
        requestedAgeThresholdYears: BigInt(
          requirements.requestedAgeThresholdYears,
        ),
      },
    };

    this.bus.send({
      type: "presentation:request",
      from: this.profile.label,
      to: holderLabel,
      envelope: request.envelope,
      body: request,
    });
  }

  receiveSubmissionAndEvaluate(
    submission: ProtocolMessage,
    simulatorWitness: SimulatorWitness,
  ): { approved: boolean; result: BirthCredentialVerificationResult } {
    assertMessageType(submission, "presentation:submission");
    assertBodyHasFields(submission, ["envelope", "schema", "body"]);
    const submissionMessage =
      submission.body as BirthCredentialVerificationSubmission;
    const body = submissionMessage.body;
    const presentationRequest =
      pureCircuits.birthCredentialPresentationRequestFromProtocol(
        simulatorWitness.request,
      );

    pureCircuits.assertValidBirthCredentialVerificationRequestMessage(
      simulatorWitness.request,
    );
    pureCircuits.assertBirthCredentialVerificationSubmissionMatchesRequest(
      simulatorWitness.request,
      submissionMessage,
    );

    // Validate the credential and presentation signatures
    pureCircuits.assertValidBirthCredentialPresentation(
      body.credential,
      body.credentialProof,
      body.presentation,
      body.presentationProof,
    );

    // Verify the presentation satisfies the request
    pureCircuits.assertBirthPresentationSatisfiesRequest(
      body.credential,
      presentationRequest,
      body.presentation,
      body.presentationProof,
    );

    // If an age predicate was requested, validate it
    if (presentationRequest.requireAgeOverThreshold) {
      pureCircuits.assertValidBirthCredentialAgePredicate(
        body.credential,
        body.presentation,
        simulatorWitness.currentDay,
        simulatorWitness.birthDateDays,
        simulatorWitness.birthDateOpening,
      );
    }

    const result: BirthCredentialVerificationResult = {
      envelope: this.createEnvelope(
        "presentation-result",
        "birth-presentation",
        false,
        submissionMessage.envelope.messageId,
        submissionMessage.envelope.threadId,
      ),
      approved: true,
      body: {
        credentialRoot: pureCircuits.birthCredentialBodyRoot(body.credential),
        verifiedThresholdYears:
          presentationRequest.requestedAgeThresholdYears,
      },
    };

    pureCircuits.assertBirthCredentialVerificationResultMatchesSubmission(
      submissionMessage,
      result,
    );

    return { approved: true, result };
  }

  // --- Secret-holder presentation methods ---

  createAndSendSecretPresentationRequest(
    holderLabel: PartyId,
    requirements: SecretPresentationRequirements,
    options: SecretPresentationRequestOptions = {},
  ): void {
    if (
      requirements.requireVerifierScopedPseudonym &&
      (
        requirements.deploymentDigest === undefined ||
        requirements.audienceDigest === undefined ||
        requirements.originDigest === undefined ||
        requirements.consentDigest === undefined
      )
    ) {
      throw new PresentationProtocolError(
        "unsatisfied_request",
        "Hidden-holder pseudonyms require authenticated deployment, audience, origin, and consent context.",
      );
    }
    const envelope = this.createEnvelope(
      "secret-presentation-request",
      "secret-birth-presentation",
      true,
      undefined,
      undefined,
      {
        createdAtMs: options.currentTimeMs,
        expiresAtMs: options.requestExpiresAtMs,
      },
    );
    const verifierChallengeHash = this.generateChallengeHashFor(
      "blinded-secret-presentation",
    );
    const request: SecretBirthCredentialVerificationRequest = {
      envelope,
      schema: SECRET_BIRTH_SCHEMA,
      issuerVerificationMethodRef: requirements.issuerVerificationMethodRef,
      holderBindingProfile: HolderBindingProfile.blindedSecretHolder,
      features: SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS,
      verifierChallengeHash,
      body: {
        requireSubjectIdCommitmentDisclosure:
          requirements.requireSubjectIdCommitmentDisclosure,
        requireBirthCountryDisclosure:
          requirements.requireBirthCountryDisclosure,
        requireVerifierScopedPseudonym:
          requirements.requireVerifierScopedPseudonym,
        verifierPseudonymScope: {
          verifierIdentityDigest: genericPureCircuits.verifierIdentityDigestV1(
            this.profile.signer.verificationMethodRef,
          ),
          executionContextDigest:
            requirements.deploymentDigest ?? new Uint8Array(32),
          audienceDigest: requirements.audienceDigest ?? new Uint8Array(32),
          originDigest: requirements.originDigest ?? new Uint8Array(32),
          consentDigest: requirements.consentDigest ?? new Uint8Array(32),
          requestDigest: requirements.requireVerifierScopedPseudonym
            ? envelope.messageId
            : new Uint8Array(32),
          challengeDigest: requirements.requireVerifierScopedPseudonym
            ? verifierChallengeHash
            : new Uint8Array(32),
        },
        requireAgeOverThreshold: requirements.requireAgeOverThreshold,
        requestedAgeThresholdYears: BigInt(
          requirements.requestedAgeThresholdYears,
        ),
      },
    };

    const unsignedMessage: ProtocolMessage = {
      type: "presentation:request",
      from: this.profile.label,
      to: holderLabel,
      envelope: request.envelope,
      body: request,
    };
    const nonceScalar = this.randomness.nextSigningNonceScalar({
      partyLabel: this.profile.label,
      flow: "blinded-secret-presentation",
      purpose: "signing-nonce",
      sequence: this.authenticationCounter++,
      threadId: request.envelope.threadId,
    });
    const authenticationDraft: Proof = {
      signerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      createdAt: request.envelope.createdAt,
      challengeHash: request.envelope.messageId,
      publicKey: this.profile.signer.publicKey,
      signature: { r: ecMulGenerator(nonceScalar), s: 0n },
    };
    const authenticationChallenge =
      genericPureCircuits.presentationProofChallenge(
        protocolMessageAuthenticationDigest(unsignedMessage),
        authenticationDraft,
      );

    this.bus.send({
      ...unsignedMessage,
      authentication: {
        ...authenticationDraft,
        signature: {
          r: authenticationDraft.signature.r,
          s: mod(
            nonceScalar +
            authenticationChallenge * this.profile.signer.secretKey,
          ),
        },
      },
    });
  }

  receiveSecretSubmissionAndEvaluate(
    submission: ProtocolMessage,
    simulatorWitness: SecretSimulatorWitness,
    options: SecretPresentationProcessingOptions = {},
  ): {
    approved: boolean;
    pseudonym?: Uint8Array;
    result: SecretBirthCredentialVerificationResult;
  } {
    assertMessageType(submission, "presentation:submission");
    assertBodyHasFields(submission, ["envelope", "schema", "body"]);
    const submissionMessage =
      submission.body as SecretBirthCredentialVerificationSubmission;
    const body = submissionMessage.body;
    const nowMs = resolveCurrentTimeMs(options.currentTimeMs);
    if (
      simulatorWitness.request.envelope.hasExpiresAt &&
      nowMs > simulatorWitness.request.envelope.expiresAt
    ) {
      throw new PresentationProtocolError(
        "expired_request",
        "This blinded-secret presentation request expired before the verifier processed the submission.",
        true,
      );
    }
    if (
      submissionMessage.envelope.hasExpiresAt &&
      nowMs > submissionMessage.envelope.expiresAt
    ) {
      throw new PresentationProtocolError(
        "expired_submission",
        "This blinded-secret presentation submission expired before the verifier processed it.",
        true,
      );
    }

    secretPureCircuits.assertValidSecretBirthCredentialVerificationRequestMessage(
      simulatorWitness.request,
    );
    this.assertValidSecretSubmission(submissionMessage);
    this.assertSecretSubmissionMatchesRequest(
      simulatorWitness.request,
      submissionMessage,
      simulatorWitness.holderSecret,
      simulatorWitness.holderSecretOpening,
      simulatorWitness.holderBindingBlindingFactor,
    );

    // Validate the credential and presentation
    this.assertValidSecretPresentation(body);

    // Verify the presentation satisfies the request (requires witness for simulator)
    this.assertSecretPresentationSatisfiesRequest(body, simulatorWitness);

    // Extract pseudonym if it was disclosed
    const pseudonym = body.presentation.disclosed.revealVerifierScopedPseudonym
      ? body.presentation.disclosed.verifierScopedPseudonym
      : undefined;

    const result: SecretBirthCredentialVerificationResult = {
      envelope: this.createEnvelope(
        "secret-presentation-result",
        "secret-birth-presentation",
        false,
        submissionMessage.envelope.messageId,
        submissionMessage.envelope.threadId,
        { createdAtMs: options.currentTimeMs },
      ),
      approved: true,
      body: {
        presentationBindingDigest:
          secretPureCircuits.secretBirthPresentationBindingDigestV1(
            body.credential,
            body.presentation,
            secretPureCircuits.secretBirthCredentialPresentationRequestFromProtocol(
              simulatorWitness.request,
            ),
          ),
        verifiedThresholdYears:
          simulatorWitness.request.body.requestedAgeThresholdYears,
        hasVerifierScopedPseudonym: pseudonym != null,
        verifierScopedPseudonym: pseudonym ?? new Uint8Array(32),
      },
    };

    secretPureCircuits.assertSecretBirthCredentialVerificationResultMatchesSubmission(
      simulatorWitness.request,
      submissionMessage,
      result,
    );

    return { approved: true, pseudonym, result };
  }

  receiveSecretSubmissionAndRespond(
    submission: ProtocolMessage,
    simulatorWitness: SecretSimulatorWitness,
    options: SecretPresentationProcessingOptions = {},
  ): void {
    const submissionMessageId = Buffer.from(
      submission.envelope.messageId,
    ).toString("hex");
    const completedOutcome = readRetainedProtocolState(
      this.completedSecretPresentationOutcomes,
      submissionMessageId,
      resolveCurrentTimeMs(options.currentTimeMs),
    );
    const requestExpiresAtMs = simulatorWitness.request.envelope.hasExpiresAt
      ? simulatorWitness.request.envelope.expiresAt
      : undefined;
    const submissionExpiresAtMs = submission.envelope.hasExpiresAt
      ? submission.envelope.expiresAt
      : undefined;
    const retentionExpiresAtMs = earlierExpiryMs(
      requestExpiresAtMs,
      submissionExpiresAtMs,
    );
    if (completedOutcome) {
      this.bus.send(completedOutcome);
      return;
    }
    try {
      const evaluation = this.receiveSecretSubmissionAndEvaluate(
        submission,
        simulatorWitness,
        options,
      );
      const resultMessage: ProtocolMessage = {
        type: "presentation:result",
        from: this.profile.label,
        to: submission.from,
        envelope: evaluation.result.envelope,
        body: evaluation.result,
      };
      this.bus.send(resultMessage);
      writeRetainedProtocolState(
        this.completedSecretPresentationOutcomes,
        submissionMessageId,
        resultMessage,
        resolveCurrentTimeMs(options.currentTimeMs),
        this.retentionPolicy,
        retentionExpiresAtMs,
      );
    } catch (error) {
      const rejection = this.buildSecretPresentationRejection(
        submission,
        error instanceof PresentationProtocolError
          ? error.category
          : "malformed_submission",
        error instanceof Error ? error.message : String(error),
        error instanceof PresentationProtocolError
          ? error.retryable
          : false,
      );
      const rejectionMessage: ProtocolMessage = {
        type: "presentation:rejection",
        from: this.profile.label,
        to: submission.from,
        envelope: rejection.envelope,
        body: rejection,
      };
      this.bus.send(rejectionMessage);
      writeRetainedProtocolState(
        this.completedSecretPresentationOutcomes,
        submissionMessageId,
        rejectionMessage,
        resolveCurrentTimeMs(options.currentTimeMs),
        this.retentionPolicy,
        retentionExpiresAtMs,
      );
    }
  }

  private buildSecretPresentationRejection(
    submission: ProtocolMessage,
    category: SecretBirthCredentialVerificationRejectionCategory,
    detail: string,
    retryable = false,
  ): SecretBirthCredentialVerificationRejection {
    return {
      envelope: this.createEnvelope(
        "secret-presentation-rejection",
        "secret-birth-presentation",
        false,
        submission.envelope.messageId,
        submission.envelope.threadId,
      ),
      schema: SECRET_BIRTH_SCHEMA,
      issuerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      holderBindingProfile: HolderBindingProfile.blindedSecretHolder,
      body: {
        category,
        detail,
        retryable,
      },
    };
  }

  private assertValidSecretSubmission(
    submission: SecretBirthCredentialVerificationSubmission,
  ): void {
    try {
      secretPureCircuits.assertValidSecretBirthCredentialVerificationSubmissionMessage(
        submission,
      );
    } catch (error) {
      throw new PresentationProtocolError(
        "malformed_submission",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private assertSecretSubmissionMatchesRequest(
    request: SecretBirthCredentialVerificationRequest,
    submission: SecretBirthCredentialVerificationSubmission,
    holderSecret: Uint8Array,
    holderSecretOpening: Uint8Array,
    holderBindingBlindingFactor: Uint8Array,
  ): void {
    try {
      secretPureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesRequest(
        request,
        submission,
        holderSecret,
        holderSecretOpening,
        holderBindingBlindingFactor,
      );
    } catch (error) {
      throw new PresentationProtocolError(
        "request_submission_mismatch",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private assertValidSecretPresentation(
    body: SecretBirthCredentialVerificationSubmission["body"],
  ): void {
    try {
      secretPureCircuits.assertValidSecretBirthCredentialPresentation(
        body.credential,
        body.credentialProof,
        body.presentation,
      );
    } catch (error) {
      throw new PresentationProtocolError(
        "malformed_submission",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private assertSecretPresentationSatisfiesRequest(
    body: SecretBirthCredentialVerificationSubmission["body"],
    simulatorWitness: SecretSimulatorWitness,
  ): void {
    try {
      secretPureCircuits.assertSecretBirthPresentationSatisfiesRequest(
        body.credential,
        body.credentialProof,
        secretPureCircuits.secretBirthCredentialPresentationRequestFromProtocol(
          simulatorWitness.request,
        ),
        body.presentation,
        simulatorWitness.holderSecret,
        simulatorWitness.holderSecretOpening,
        simulatorWitness.holderBindingBlindingFactor,
      );

      if (simulatorWitness.request.body.requireAgeOverThreshold) {
        secretPureCircuits.assertValidSecretBirthCredentialAgePredicate(
          body.credential,
          body.presentation,
          simulatorWitness.currentDay,
          simulatorWitness.birthDateDays,
          simulatorWitness.birthDateOpening,
        );
      }
    } catch (error) {
      throw new PresentationProtocolError(
        "unsatisfied_request",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // --- Same-holder composition methods ---

  generateChallenge(): Uint8Array {
    return this.generateChallengeHash();
  }

  verifySameHolderProof(
    presentation: SameHolderPresentation,
    simulatorWitness: SameHolderSimulatorWitness,
  ): { sameHolder: boolean } {
    secretPureCircuits.assertSameHolderSecretBirthPresentations(
      presentation.firstCredential,
      presentation.firstCredentialProof,
      presentation.firstRequest,
      presentation.firstPresentation,
      presentation.secondCredential,
      presentation.secondCredentialProof,
      presentation.secondRequest,
      presentation.secondPresentation,
      simulatorWitness.holderSecret,
      simulatorWitness.firstHolderSecretOpening,
      simulatorWitness.firstHolderBindingBlindingFactor,
      simulatorWitness.secondHolderSecretOpening,
      simulatorWitness.secondHolderBindingBlindingFactor,
    );

    return { sameHolder: true };
  }

  verifySameHolderProof3(
    presentation: SameHolderTriplePresentation,
    simulatorWitness: SameHolderTripleSimulatorWitness,
  ): { sameHolder: boolean } {
    secretPureCircuits.assertSameHolderSecretBirthPresentations3(
      presentation.firstCredential,
      presentation.firstCredentialProof,
      presentation.firstRequest,
      presentation.firstPresentation,
      presentation.secondCredential,
      presentation.secondCredentialProof,
      presentation.secondRequest,
      presentation.secondPresentation,
      presentation.thirdCredential,
      presentation.thirdCredentialProof,
      presentation.thirdRequest,
      presentation.thirdPresentation,
      simulatorWitness.holderSecret,
      simulatorWitness.firstHolderSecretOpening,
      simulatorWitness.firstHolderBindingBlindingFactor,
      simulatorWitness.secondHolderSecretOpening,
      simulatorWitness.secondHolderBindingBlindingFactor,
      simulatorWitness.thirdHolderSecretOpening,
      simulatorWitness.thirdHolderBindingBlindingFactor,
    );

    return { sameHolder: true };
  }
}
