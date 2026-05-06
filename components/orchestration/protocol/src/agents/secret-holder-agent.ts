import { Buffer } from "node:buffer";

import {
  HolderBindingProfile,
  type Proof,
  pureCircuits as genericPureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import {
  pureCircuits,
  type SecretBirthCredential,
  type SecretBirthCredentialIssuanceOffer,
  type SecretBirthCredentialIssuanceRequest,
  type SecretBirthCredentialIssuanceResult,
  type SecretBirthCredentialPresentation,
  type SecretBirthCredentialVerificationRequest,
  type SecretBirthCredentialVerificationResult,
  type SecretBirthCredentialVerificationSubmission,
} from "@midnight-ntwrk/midnight-did-credentials-birth-secret/managed/secret-birth-credential/contract/index.js";

import { padText } from "../shared/crypto.js";
import { createEnvelope } from "../shared/envelope.js";
import { assertBodyHasFields,assertMessageType } from "../shared/validation.js";
import type { MessageBus } from "../transport/message-bus.js";
import type {
  ProtocolMessage,
  SecretBirthCredentialIssuanceRejection,
  SecretBirthCredentialVerificationRejection,
} from "../transport/types.js";
import {
  InMemoryProtocolStateStore,
  type ProtocolStateCollection,
  type ProtocolStateRetentionPolicy,
  type ProtocolStateStore,
  readRetainedProtocolState,
  recoverAppendOnlyOrdinalCount,
  resolveCurrentTimeMs,
  type RetainedProtocolState,
  writeRetainedProtocolState,
} from "./protocol-state-store.js";
import {
  type ProtocolRandomnessSource,
  unsafeReferenceDeterministicRandomnessSource,
} from "./randomness.js";

const SECRET_BIRTH_SCHEMA = {
  packageId: padText("midnight-did:vc:birth-secret"),
  schemaId: padText("birth-credential:v1"),
  majorVersion: 1n,
  minorVersion: 0n,
};

const SECRET_HOLDER_FEATURES = {
  supportsSelectiveDisclosure: true,
  supportsPredicateProofs: true,
  supportsVerifierScopedPseudonym: true,
  supportsSameHolderProof: true,
};

const DEFAULT_PROTOCOL_CURRENT_DAY = 0n;
const DEFAULT_ISSUANCE_REQUEST_EXPIRY_DAY = 1_000_000n;

type SecretIssuanceRequestOptions = {
  readonly currentDay?: bigint;
  readonly requestExpiresAtDay?: bigint;
  readonly currentTimeMs?: bigint;
};

type SecretPresentationSubmissionOptions = {
  readonly currentTimeMs?: bigint;
  readonly submissionExpiresAtMs?: bigint;
};

type SecretOutcomeReadOptions = {
  readonly currentTimeMs?: bigint;
};

export type SecretStoredCredential = {
  readonly credential: SecretBirthCredential;
  readonly credentialProof: Proof;
  readonly holderBindingBlindingFactor: Uint8Array;
};

export type SecretIssuanceOutcome =
  | {
      readonly kind: "issued";
      readonly stored: SecretStoredCredential;
    }
  | {
      readonly kind: "rejected";
      readonly rejection: SecretBirthCredentialIssuanceRejection;
    };

export type SecretPresentationOutcome =
  | {
      readonly kind: "approved";
      readonly result: SecretBirthCredentialVerificationResult;
    }
  | {
      readonly kind: "rejected";
      readonly rejection: SecretBirthCredentialVerificationRejection;
    };

/**
 * Protocol data for a same-holder composition proof.
 * Contains only what would be transmitted to the verifier in a real protocol.
 */
export type SameHolderPresentation = {
  readonly firstCredential: SecretBirthCredential;
  readonly firstCredentialProof: Proof;
  readonly firstRequest: SecretBirthCredentialVerificationRequest;
  readonly firstPresentation: SecretBirthCredentialPresentation;
  readonly secondCredential: SecretBirthCredential;
  readonly secondCredentialProof: Proof;
  readonly secondRequest: SecretBirthCredentialVerificationRequest;
  readonly secondPresentation: SecretBirthCredentialPresentation;
};

export type SameHolderTriplePresentation = SameHolderPresentation & {
  readonly thirdCredential: SecretBirthCredential;
  readonly thirdCredentialProof: Proof;
  readonly thirdRequest: SecretBirthCredentialVerificationRequest;
  readonly thirdPresentation: SecretBirthCredentialPresentation;
};

export type SecretPresentationWitness = {
  readonly credentialIndex: number;
  readonly currentDay: bigint;
  readonly birthDateDays: bigint;
  readonly birthDateOpening: Uint8Array;
  readonly birthCountryCodePadded: Uint8Array;
  readonly birthCountryCodeOpening: Uint8Array;
};

export class SecretHolderAgent {
  private static readonly CREDENTIAL_COUNT_KEY = "credential-count";
  readonly label: string;
  private readonly holderSecret: Uint8Array;
  private readonly holderSecretOpening: Uint8Array;
  private readonly bus: MessageBus;
  private readonly randomness: ProtocolRandomnessSource;
  private readonly retentionPolicy: ProtocolStateRetentionPolicy;
  private readonly storedCredentials: ProtocolStateCollection<SecretStoredCredential>;
  private readonly metadata: ProtocolStateCollection<number>;
  private readonly pendingIssuanceRequests: ProtocolStateCollection<{
    readonly request: SecretBirthCredentialIssuanceRequest;
    readonly holderBindingBlindingFactor: Uint8Array;
  }>;
  private readonly completedIssuanceOutcomes: ProtocolStateCollection<
    RetainedProtocolState<SecretIssuanceOutcome>
  >;
  private readonly pendingPresentationSubmissions: ProtocolStateCollection<SecretBirthCredentialVerificationSubmission>;
  private readonly completedPresentationOutcomes: ProtocolStateCollection<
    RetainedProtocolState<SecretPresentationOutcome>
  >;
  private credentialCountCache = 0;
  private issuanceRequestCounter = 0;

  constructor(
    config: {
      readonly label: string;
      readonly holderSecret: Uint8Array;
      readonly holderSecretOpening: Uint8Array;
    },
    bus: MessageBus,
    options: {
      readonly randomness?: ProtocolRandomnessSource;
      readonly stateStore?: ProtocolStateStore;
      readonly stateRetention?: ProtocolStateRetentionPolicy;
    } = {},
  ) {
    this.label = config.label;
    this.holderSecret = config.holderSecret;
    this.holderSecretOpening = config.holderSecretOpening;
    this.bus = bus;
    this.randomness =
      options.randomness ?? unsafeReferenceDeterministicRandomnessSource;
    this.retentionPolicy = options.stateRetention ?? {};
    const stateStore = options.stateStore ?? new InMemoryProtocolStateStore();
    const stateScope = `secret-holder:${this.label}`;
    this.storedCredentials = stateStore.collection(
      `${stateScope}:stored-credentials`,
    );
    this.metadata = stateStore.collection(`${stateScope}:metadata`);
    this.pendingIssuanceRequests = stateStore.collection(
      `${stateScope}:pending-issuance-requests`,
    );
    this.completedIssuanceOutcomes = stateStore.collection(
      `${stateScope}:completed-issuance-outcomes`,
    );
    this.pendingPresentationSubmissions = stateStore.collection(
      `${stateScope}:pending-presentation-submissions`,
    );
    this.completedPresentationOutcomes = stateStore.collection(
      `${stateScope}:completed-presentation-outcomes`,
    );
    this.credentialCountCache = this.recoverCredentialCount();
  }

  receiveOfferAndSendRequest(
    offer: ProtocolMessage,
    options: SecretIssuanceRequestOptions = {},
  ): void {
    assertMessageType(offer, "issuance:offer");
    assertBodyHasFields(offer, ["envelope", "schema", "body"]);
    const issuanceOffer = offer.body as SecretBirthCredentialIssuanceOffer;
    pureCircuits.assertValidSecretBirthCredentialIssuanceOffer(issuanceOffer);
    const currentDay = options.currentDay ?? DEFAULT_PROTOCOL_CURRENT_DAY;
    if (currentDay > issuanceOffer.body.offerExpiresAtDay) {
      throw new Error(
        "This blinded-secret issuance offer expired before the holder could answer it.",
      );
    }
    const issuanceSequence = this.issuanceRequestCounter++;
    const challengeHash = this.randomness.nextChallengeHash({
      partyLabel: this.label,
      flow: "blinded-secret-issuance",
      purpose: "holder-challenge",
      sequence: issuanceSequence,
      threadId: issuanceOffer.envelope.threadId,
      respondsToMessageId: issuanceOffer.envelope.messageId,
    });

    const holderSecretCommitment =
      genericPureCircuits.secretHolderBindingCommitment(
        this.holderSecret,
        this.holderSecretOpening,
      );

    const holderBindingBlindingFactor = this.randomness.nextBlindingFactor({
      partyLabel: this.label,
      flow: "blinded-secret-issuance",
      purpose: "holder-binding-blinding-factor",
      sequence: issuanceSequence,
      threadId: issuanceOffer.envelope.threadId,
      respondsToMessageId: issuanceOffer.envelope.messageId,
    });

    const request: SecretBirthCredentialIssuanceRequest = {
      envelope: createEnvelope(
        "secret-issuance-request",
        "secret-birth-issuance",
        false,
        issuanceOffer.envelope.messageId,
        issuanceOffer.envelope.threadId,
        {
          createdAtMs: options.currentTimeMs,
        },
      ),
      schema: issuanceOffer.schema,
      issuerVerificationMethodRef: issuanceOffer.issuerVerificationMethodRef,
      holderBindingProfile: issuanceOffer.holderBindingProfile,
      body: {
        holderSecretCommitment,
        holderBindingBlindingFactor,
        holderChallengeHash: challengeHash,
        requestExpiration: true,
        requestedExpirationDays: 365n,
        requestExpiresAtDay:
          options.requestExpiresAtDay ?? DEFAULT_ISSUANCE_REQUEST_EXPIRY_DAY,
      },
    };

    // Store request metadata keyed by request message ID for later validation.
    const requestMessageId = Buffer.from(request.envelope.messageId).toString("hex");
    this.pendingIssuanceRequests.set(requestMessageId, {
      request,
      holderBindingBlindingFactor,
    });

    this.bus.send({
      type: "issuance:request",
      from: this.label,
      to: offer.from,
      envelope: request.envelope,
      body: request,
    });
  }

  receiveCredentialResult(
    result: ProtocolMessage,
    options: SecretOutcomeReadOptions = {},
  ): void {
    assertMessageType(result, "issuance:result");
    assertBodyHasFields(result, ["envelope", "schema", "body"]);
    const issuanceResult = result.body as SecretBirthCredentialIssuanceResult;
    pureCircuits.assertValidSecretBirthCredentialIssuanceResult(issuanceResult);
    const respondsToId = Buffer.from(result.envelope.respondsToMessageId).toString("hex");
    const pendingIssuance = this.pendingIssuanceRequests.get(respondsToId);
    if (!pendingIssuance) {
      if (
        readRetainedProtocolState(
          this.completedIssuanceOutcomes,
          respondsToId,
          resolveCurrentTimeMs(options.currentTimeMs),
        )
      ) {
        throw new Error(
          "This blinded-secret issuance result was already finalized and cannot be accepted again.",
        );
      }
      throw new Error(
        "No pending issuance request found for this credential result. " +
        "Ensure receiveOfferAndSendRequest was called first.",
      );
    }
    pureCircuits.assertSecretBirthCredentialIssuanceResultMatchesRequest(
      pendingIssuance.request,
      issuanceResult,
    );
    this.pendingIssuanceRequests.delete(respondsToId);

    const credentialIndex = this.credentialCountCache;
    this.storedCredentials.set(String(credentialIndex), {
      credential: issuanceResult.body.credential,
      credentialProof: issuanceResult.body.credentialProof,
      holderBindingBlindingFactor:
        pendingIssuance.holderBindingBlindingFactor,
    });
    this.credentialCountCache += 1;
    this.metadata.set(
      SecretHolderAgent.CREDENTIAL_COUNT_KEY,
      this.credentialCountCache,
    );
  }

  receiveIssuanceRejection(
    rejectionMessage: ProtocolMessage,
    options: SecretOutcomeReadOptions = {},
  ): SecretBirthCredentialIssuanceRejection {
    assertMessageType(rejectionMessage, "issuance:rejection");
    assertBodyHasFields(rejectionMessage, ["envelope", "schema", "body"]);
    const rejection =
      rejectionMessage.body as SecretBirthCredentialIssuanceRejection;
    const respondsToId = Buffer.from(
      rejectionMessage.envelope.respondsToMessageId,
    ).toString("hex");
    const pendingIssuance = this.pendingIssuanceRequests.get(respondsToId);
    if (!pendingIssuance) {
      if (
        readRetainedProtocolState(
          this.completedIssuanceOutcomes,
          respondsToId,
          resolveCurrentTimeMs(options.currentTimeMs),
        )
      ) {
        throw new Error(
          "This blinded-secret issuance rejection was already finalized and cannot be accepted again.",
        );
      }
      throw new Error(
        "No pending issuance request found for this credential rejection. " +
        "Ensure receiveOfferAndSendRequest was called first.",
      );
    }
    this.pendingIssuanceRequests.delete(respondsToId);
    return rejection;
  }

  receiveIssuanceOutcome(
    message: ProtocolMessage,
    options: SecretOutcomeReadOptions = {},
  ): SecretIssuanceOutcome {
    const nowMs = resolveCurrentTimeMs(options.currentTimeMs);
    const respondsToId = Buffer.from(
      message.envelope.respondsToMessageId,
    ).toString("hex");
    const completedOutcome = readRetainedProtocolState(
      this.completedIssuanceOutcomes,
      respondsToId,
      nowMs,
    );
    if (completedOutcome) {
      if (
        (message.type === "issuance:result" &&
          completedOutcome.kind !== "issued") ||
        (message.type === "issuance:rejection" &&
          completedOutcome.kind !== "rejected")
      ) {
        throw new Error(
          "This blinded-secret issuance outcome type does not match the previously finalized outcome for the same request.",
        );
      }
      return completedOutcome;
    }

    if (message.type === "issuance:result") {
      const pendingIssuance = this.pendingIssuanceRequests.get(respondsToId);
      this.receiveCredentialResult(message, options);
      const outcome = {
        kind: "issued",
        stored: this.getCredential(this.credentialCount - 1),
      } as const;
      writeRetainedProtocolState(
        this.completedIssuanceOutcomes,
        respondsToId,
        outcome,
        nowMs,
        this.retentionPolicy,
        pendingIssuance?.request.envelope.hasExpiresAt
          ? pendingIssuance.request.envelope.expiresAt
          : undefined,
      );
      return outcome;
    }
    const pendingIssuance = this.pendingIssuanceRequests.get(respondsToId);
    const rejection = this.receiveIssuanceRejection(message, options);
    const outcome = {
      kind: "rejected",
      rejection,
    } as const;
    writeRetainedProtocolState(
      this.completedIssuanceOutcomes,
      respondsToId,
      outcome,
      nowMs,
      this.retentionPolicy,
      pendingIssuance?.request.envelope.hasExpiresAt
        ? pendingIssuance.request.envelope.expiresAt
        : undefined,
    );
    return outcome;
  }

  get credentialCount(): number {
    return this.credentialCountCache;
  }

  getCredential(index: number): SecretStoredCredential {
    const credentialCount = this.credentialCount;
    if (index < 0 || index >= credentialCount) {
      throw new RangeError(
        `Credential index ${index} out of range [0, ${credentialCount})`,
      );
    }
    const stored = this.storedCredentials.get(String(index));
    if (!stored) {
      throw new Error(
        `Credential index ${index} is missing from protocol state storage.`,
      );
    }
    return stored;
  }

  private recoverCredentialCount(): number {
    return recoverAppendOnlyOrdinalCount(
      this.metadata,
      SecretHolderAgent.CREDENTIAL_COUNT_KEY,
      this.storedCredentials,
    );
  }

  /**
   * The holder secret is private. This accessor exposes it only so that
   * simulator-based tests can pass the witness data into the verifier's
   * circuit assertions. In a real ZK deployment the verifier never sees it.
   */
  get secretWitness(): {
    holderSecret: Uint8Array;
    holderSecretOpening: Uint8Array;
  } {
    return {
      holderSecret: this.holderSecret,
      holderSecretOpening: this.holderSecretOpening,
    };
  }

  receiveRequestAndSendPresentation(
    requestMessage: ProtocolMessage,
    witnessData: SecretPresentationWitness,
    options: SecretPresentationSubmissionOptions = {},
  ): void {
    assertMessageType(requestMessage, "presentation:request");
    assertBodyHasFields(requestMessage, ["envelope", "schema", "verifierChallengeHash", "body"]);
    const request =
      requestMessage.body as SecretBirthCredentialVerificationRequest;
    const nowMs = resolveCurrentTimeMs(options.currentTimeMs);
    if (
      requestMessage.envelope.hasExpiresAt &&
      nowMs > requestMessage.envelope.expiresAt
    ) {
      throw new Error(
        "This blinded-secret presentation request expired before the holder could answer it.",
      );
    }
    const stored = this.getCredential(witnessData.credentialIndex);
    const credential = stored.credential;

    const presentation: SecretBirthCredentialPresentation = {
      version: 1n,
      schema: credential.schema,
      credentialClaimRoot: credential.claimRoot,
      issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
      holderBinding: {
        blindedHolderSecretCommitment:
          credential.holderBinding.blindedHolderSecretCommitment,
        issuerNonce: credential.holderBinding.issuerNonce,
        requestChallengeResponse:
          genericPureCircuits.secretHolderBindingChallengeResponse(
            this.holderSecret,
            request.verifierChallengeHash,
          ),
      },
      disclosed: {
        revealSubjectIdCommitment:
          request.body.requireSubjectIdCommitmentDisclosure,
        subjectIdCommitment: request.body.requireSubjectIdCommitmentDisclosure
          ? credential.claims.subjectIdCommitment
          : new Uint8Array(32),
        revealBirthCountryCode: request.body.requireBirthCountryDisclosure,
        birthCountryCodePadded: request.body.requireBirthCountryDisclosure
          ? witnessData.birthCountryCodePadded
          : new Uint8Array(32),
        birthCountryCodeOpening: request.body.requireBirthCountryDisclosure
          ? witnessData.birthCountryCodeOpening
          : new Uint8Array(32),
        revealVerifierScopedPseudonym:
          request.body.requireVerifierScopedPseudonym,
        verifierScopedPseudonym: request.body.requireVerifierScopedPseudonym
          ? genericPureCircuits.verifierScopedPseudonym(
              this.holderSecret,
              request.body.verifierDomainHash,
            )
          : new Uint8Array(32),
        proveAgeOverThreshold: request.body.requireAgeOverThreshold,
        ageThresholdYears: request.body.requestedAgeThresholdYears,
      },
    };

    const submission: SecretBirthCredentialVerificationSubmission = {
      envelope: createEnvelope(
        "secret-presentation-submission",
        "secret-birth-presentation",
        false,
        requestMessage.envelope.messageId,
        requestMessage.envelope.threadId,
        {
          createdAtMs: nowMs,
          expiresAtMs: options.submissionExpiresAtMs,
        },
      ),
      schema: request.schema,
      issuerVerificationMethodRef: request.issuerVerificationMethodRef,
      holderBindingProfile: request.holderBindingProfile,
      challengeHash: request.verifierChallengeHash,
      body: {
        credential: stored.credential,
        credentialProof: stored.credentialProof,
        presentation,
      },
    };

    this.bus.send({
      type: "presentation:submission",
      from: this.label,
      to: requestMessage.from,
      envelope: submission.envelope,
      body: submission,
    });
    const submissionMessageId = Buffer.from(submission.envelope.messageId).toString(
      "hex",
    );
    this.pendingPresentationSubmissions.set(submissionMessageId, submission);
  }

  receivePresentationRejection(
    rejectionMessage: ProtocolMessage,
    options: SecretOutcomeReadOptions = {},
  ): SecretBirthCredentialVerificationRejection {
    assertMessageType(rejectionMessage, "presentation:rejection");
    assertBodyHasFields(rejectionMessage, ["envelope", "schema", "body"]);
    const rejection =
      rejectionMessage.body as SecretBirthCredentialVerificationRejection;
    const respondsToId = Buffer.from(
      rejectionMessage.envelope.respondsToMessageId,
    ).toString("hex");
    const pendingSubmission =
      this.pendingPresentationSubmissions.get(respondsToId);
    if (!pendingSubmission) {
      if (
        readRetainedProtocolState(
          this.completedPresentationOutcomes,
          respondsToId,
          resolveCurrentTimeMs(options.currentTimeMs),
        )
      ) {
        throw new Error(
          "This blinded-secret presentation rejection was already finalized and cannot be accepted again through the strict helper.",
        );
      }
      throw new Error(
        "No pending presentation submission found for this rejection outcome. " +
        "Ensure receiveRequestAndSendPresentation was called first.",
      );
    }
    this.pendingPresentationSubmissions.delete(respondsToId);
    return rejection;
  }

  receivePresentationOutcome(
    message: ProtocolMessage,
    options: SecretOutcomeReadOptions = {},
  ): SecretPresentationOutcome {
    const nowMs = resolveCurrentTimeMs(options.currentTimeMs);
    const respondsToId = Buffer.from(
      message.envelope.respondsToMessageId,
    ).toString("hex");
    const completedOutcome = readRetainedProtocolState(
      this.completedPresentationOutcomes,
      respondsToId,
      nowMs,
    );
    if (completedOutcome) {
      if (
        (message.type === "presentation:result" &&
          completedOutcome.kind !== "approved") ||
        (message.type === "presentation:rejection" &&
          completedOutcome.kind !== "rejected")
      ) {
        throw new Error(
          "This blinded-secret presentation outcome type does not match the previously finalized outcome for the same submission.",
        );
      }
      return completedOutcome;
    }

    if (message.type === "presentation:result") {
      assertBodyHasFields(message, ["envelope", "approved", "body"]);
      const pendingSubmission =
        this.pendingPresentationSubmissions.get(respondsToId);
      if (!pendingSubmission) {
        throw new Error(
          "No pending presentation submission found for this approved outcome. " +
          "Ensure receiveRequestAndSendPresentation was called first.",
        );
      }
      this.pendingPresentationSubmissions.delete(respondsToId);
      const outcome = {
        kind: "approved",
        result: message.body as SecretBirthCredentialVerificationResult,
      } as const;
      writeRetainedProtocolState(
        this.completedPresentationOutcomes,
        respondsToId,
        outcome,
        nowMs,
        this.retentionPolicy,
        pendingSubmission.envelope.hasExpiresAt
          ? pendingSubmission.envelope.expiresAt
          : undefined,
      );
      return outcome;
    }
    if (message.type === "presentation:rejection") {
      const pendingSubmission =
        this.pendingPresentationSubmissions.get(respondsToId);
      const outcome = {
        kind: "rejected",
        rejection: this.receivePresentationRejection(message, options),
      } as const;
      writeRetainedProtocolState(
        this.completedPresentationOutcomes,
        respondsToId,
        outcome,
        nowMs,
        this.retentionPolicy,
        pendingSubmission?.envelope.hasExpiresAt
          ? pendingSubmission.envelope.expiresAt
          : undefined,
      );
      return outcome;
    }
    throw new Error(
      `Expected message type "presentation:result" or "presentation:rejection", got "${message.type}"`,
    );
  }

  /**
   * Build a same-holder proof for two stored credentials.
   * Both presentations use the same verifier challenge hash so the
   * verifier can confirm they share a single hidden holder secret.
   */
  buildSameHolderProof(
    credentialIndices: [number, number],
    verifierChallengeHash: Uint8Array,
  ): SameHolderPresentation {
    const first = this.getCredential(credentialIndices[0]);
    const second = this.getCredential(credentialIndices[1]);

    return this._buildSameHolderProofForPair(
      first,
      second,
      verifierChallengeHash,
    );
  }

  /**
   * Build a same-holder proof using two arbitrary stored credentials.
   * Useful for negative testing (e.g. mixing credentials that belong
   * to different holder secrets).
   */
  buildSameHolderProofWith(
    ownCredential: SecretStoredCredential,
    otherCredential: SecretStoredCredential,
    verifierChallengeHash: Uint8Array,
  ): SameHolderPresentation {
    return this._buildSameHolderProofForPair(
      ownCredential,
      otherCredential,
      verifierChallengeHash,
    );
  }

  /**
   * Build a same-holder proof for three stored credentials under one shared
   * verifier challenge.
   */
  buildSameHolderProof3(
    credentialIndices: [number, number, number],
    verifierChallengeHash: Uint8Array,
  ): SameHolderTriplePresentation {
    const first = this.getCredential(credentialIndices[0]);
    const second = this.getCredential(credentialIndices[1]);
    const third = this.getCredential(credentialIndices[2]);

    const pair = this._buildSameHolderProofForPair(
      first,
      second,
      verifierChallengeHash,
    );
    const thirdRequest = this._buildSameHolderRequest(
      third.credential,
      verifierChallengeHash,
    );
    const thirdPresentation = this._buildSameHolderPresentation(
      third.credential,
      thirdRequest,
    );

    return {
      ...pair,
      thirdCredential: third.credential,
      thirdCredentialProof: third.credentialProof,
      thirdRequest,
      thirdPresentation,
    };
  }

  private _buildSameHolderProofForPair(
    first: SecretStoredCredential,
    second: SecretStoredCredential,
    verifierChallengeHash: Uint8Array,
  ): SameHolderPresentation {
    const firstRequest = this._buildSameHolderRequest(
      first.credential,
      verifierChallengeHash,
    );
    const secondRequest = this._buildSameHolderRequest(
      second.credential,
      verifierChallengeHash,
    );
    const firstPresentation = this._buildSameHolderPresentation(
      first.credential,
      firstRequest,
    );
    const secondPresentation = this._buildSameHolderPresentation(
      second.credential,
      secondRequest,
    );

    return {
      firstCredential: first.credential,
      firstCredentialProof: first.credentialProof,
      firstRequest,
      firstPresentation,
      secondCredential: second.credential,
      secondCredentialProof: second.credentialProof,
      secondRequest,
      secondPresentation,
    };
  }

  private _buildSameHolderRequest(
    credential: SecretBirthCredential,
    verifierChallengeHash: Uint8Array,
  ): SecretBirthCredentialVerificationRequest {
    return {
      envelope: createEnvelope(
        "same-holder-presentation-request",
        "secret-birth-presentation",
        true,
      ),
      schema: credential.schema,
      issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
      holderBindingProfile: HolderBindingProfile.blindedSecretHolder,
      features: SECRET_HOLDER_FEATURES,
      verifierChallengeHash,
      body: {
        requireSubjectIdCommitmentDisclosure: false,
        requireBirthCountryDisclosure: false,
        requireVerifierScopedPseudonym: false,
        verifierDomainHash: new Uint8Array(32),
        requireAgeOverThreshold: false,
        requestedAgeThresholdYears: 0n,
      },
    };
  }

  private _buildSameHolderPresentation(
    credential: SecretBirthCredential,
    request: SecretBirthCredentialVerificationRequest,
  ): SecretBirthCredentialPresentation {
    return {
      version: 1n,
      schema: credential.schema,
      credentialClaimRoot: credential.claimRoot,
      issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
      holderBinding: {
        blindedHolderSecretCommitment:
          credential.holderBinding.blindedHolderSecretCommitment,
        issuerNonce: credential.holderBinding.issuerNonce,
        requestChallengeResponse:
          genericPureCircuits.secretHolderBindingChallengeResponse(
            this.holderSecret,
            request.verifierChallengeHash,
          ),
      },
      disclosed: {
        revealSubjectIdCommitment: false,
        subjectIdCommitment: new Uint8Array(32),
        revealBirthCountryCode: false,
        birthCountryCodePadded: new Uint8Array(32),
        birthCountryCodeOpening: new Uint8Array(32),
        revealVerifierScopedPseudonym: false,
        verifierScopedPseudonym: new Uint8Array(32),
        proveAgeOverThreshold: false,
        ageThresholdYears: 0n,
      },
    };
  }
}
