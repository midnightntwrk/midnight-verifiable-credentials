import { Buffer } from "node:buffer";

import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
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
  assertProtocolMessageEnvelopeAlignment,
  protocolMessageDigest,
} from "../../shared/validation.js";
import type { MessageBus } from "../../transport/message-bus.js";
import type {
  PartyId,
  ProtocolMessage,
  SecretBirthCredentialIssuanceRejection,
  SecretBirthCredentialIssuanceRejectionCategory,
} from "../../transport/types.js";
import {
  SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS,
  SECRET_BIRTH_SCHEMA,
} from "./schema-descriptors.js";

export type SecretClaimWitness = {
  readonly subjectId: Uint8Array;
  readonly subjectOpening: Uint8Array;
  readonly legalNamePadded: Uint8Array;
  readonly legalNameOpening: Uint8Array;
  readonly birthDateDays: bigint;
  readonly birthDateOpening: Uint8Array;
  readonly birthCountryCodePadded: Uint8Array;
  readonly birthCountryCodeOpening: Uint8Array;
  readonly issuedAt: bigint;
  readonly expiresAt: bigint;
};

const DEFAULT_PROTOCOL_CURRENT_DAY = 0n;
const DEFAULT_ISSUANCE_OFFER_EXPIRY_DAY = 1_000_000n;

const createNoStatusBinding = (): SecretBirthCredential["statusBinding"] => {
  // The thin-core secret-birth credential models `NoStatusBinding` as an empty struct.
  const binding: SecretBirthCredential["statusBinding"] = {};
  genericPureCircuits.assertValidNoStatusBinding(binding);
  return binding;
};

type SecretIssuanceOfferOptions = {
  readonly offerExpiresAtDay?: bigint;
};

type SecretIssuanceProcessingOptions = {
  readonly currentDay?: bigint;
  readonly currentTimeMs?: bigint;
};

type PendingSecretIssuanceOffer = {
  readonly offer: SecretBirthCredentialIssuanceOffer;
  readonly holder: PartyId;
};

class IssuanceProtocolError extends Error {
  readonly category: SecretBirthCredentialIssuanceRejectionCategory;
  readonly retryable: boolean;

  constructor(
    category: SecretBirthCredentialIssuanceRejectionCategory,
    message: string,
    retryable = false,
  ) {
    super(message);
    this.name = "IssuanceProtocolError";
    this.category = category;
    this.retryable = retryable;
  }
}

export class SecretIssuerAgent {
  private readonly profile: DIDProfile;
  private readonly bus: MessageBus;
  private readonly randomness: ProtocolRandomnessSource;
  private readonly createEnvelope: ProtocolEnvelopeFactory;
  private readonly retentionPolicy: ProtocolStateRetentionPolicy;
  private issuanceCounter = 0;
  private readonly pendingOffers: ProtocolStateCollection<PendingSecretIssuanceOffer>;
  private readonly completedOutcomes: ProtocolStateCollection<
    RetainedProtocolState<ProtocolMessage>
  >;
  private readonly completedRequests: ProtocolStateCollection<
    RetainedProtocolState<Uint8Array>
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
    const stateScope = `secret-issuer:${this.profile.label}`;
    this.pendingOffers = stateStore.collection(
      `${stateScope}:pending-offers`,
    );
    this.completedOutcomes = stateStore.collection(
      `${stateScope}:completed-outcomes`,
    );
    this.completedRequests = stateStore.collection(
      `${stateScope}:completed-requests`,
    );
  }

  createAndSendOffer(
    holderLabel: PartyId,
    options: SecretIssuanceOfferOptions = {},
  ): void {
    const offer: SecretBirthCredentialIssuanceOffer = {
      envelope: this.createEnvelope(
        "secret-issuance-offer",
        "secret-birth-issuance",
        true,
      ),
      schema: SECRET_BIRTH_SCHEMA,
      issuerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      holderBindingProfile: HolderBindingProfile.blindedSecretHolder,
      features: SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS,
      body: {
        supportsExpiration: true,
        defaultExpirationDays: 365n,
        offerExpiresAtDay:
          options.offerExpiresAtDay ?? DEFAULT_ISSUANCE_OFFER_EXPIRY_DAY,
        requiresHolderSecret: true,
      },
    };

    this.bus.send({
      type: "issuance:offer",
      from: this.profile.label,
      to: holderLabel,
      envelope: offer.envelope,
      body: offer,
    });
    const offerMessageId = Buffer.from(offer.envelope.messageId).toString("hex");
    this.pendingOffers.set(offerMessageId, {
      offer,
      holder: holderLabel,
    });
  }

  private buildIssuanceRejection(
    request: ProtocolMessage,
    category: SecretBirthCredentialIssuanceRejectionCategory,
    detail: string,
    retryable = false,
  ): SecretBirthCredentialIssuanceRejection {
    return {
      envelope: this.createEnvelope(
        "secret-issuance-rejection",
        "secret-birth-issuance",
        false,
        request.envelope.messageId,
        request.envelope.threadId,
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

  private classifyIssuanceError(
    error: unknown,
  ): {
    category: SecretBirthCredentialIssuanceRejectionCategory;
    retryable: boolean;
  } {
    if (error instanceof IssuanceProtocolError) {
      return {
        category: error.category,
        retryable: error.retryable,
      };
    }
    return { category: "malformed_request", retryable: false };
  }

  private assertValidIssuanceRequest(
    issuanceRequest: SecretBirthCredentialIssuanceRequest,
  ): void {
    try {
      pureCircuits.assertValidSecretBirthCredentialIssuanceRequest(
        issuanceRequest,
      );
    } catch (error) {
      throw new IssuanceProtocolError(
        "malformed_request",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private assertRequestMatchesOffer(
    offer: SecretBirthCredentialIssuanceOffer,
    issuanceRequest: SecretBirthCredentialIssuanceRequest,
  ): void {
    const offerMethod = offer.issuerVerificationMethodRef;
    const requestMethod = issuanceRequest.issuerVerificationMethodRef;

    const sameDidAddress =
      Buffer.compare(
        Buffer.from(offerMethod.didContractAddress.bytes),
        Buffer.from(requestMethod.didContractAddress.bytes),
      ) === 0;
    const sameMethodId =
      Buffer.compare(
        Buffer.from(offerMethod.methodId),
        Buffer.from(requestMethod.methodId),
      ) === 0;
    if (!sameDidAddress || !sameMethodId) {
      throw new IssuanceProtocolError(
        "offer_request_mismatch",
        "Secret birth credential issuance request issuer verification method must match the offer",
      );
    }

    if (issuanceRequest.holderBindingProfile !== offer.holderBindingProfile) {
      throw new IssuanceProtocolError(
        "offer_request_mismatch",
        "Secret birth credential issuance request holder binding profile must match the offer",
      );
    }

    if (
      issuanceRequest.body.requestExpiration &&
      !offer.body.supportsExpiration
    ) {
      throw new IssuanceProtocolError(
        "offer_request_mismatch",
        "Secret birth credential issuance request cannot require expiration when the offer disables it",
      );
    }

    try {
      pureCircuits.assertSecretBirthCredentialIssuanceRequestMatchesOffer(
        offer,
        issuanceRequest,
      );
    } catch (error) {
      throw new IssuanceProtocolError(
        "offer_request_mismatch",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  receiveRequestAndIssueCredential(
    request: ProtocolMessage,
    claimWitness: SecretClaimWitness,
    options: SecretIssuanceProcessingOptions = {},
  ): void {
    assertMessageType(request, "issuance:request");
    assertBodyHasFields(request, ["envelope", "schema", "body"]);
    try {
      assertProtocolMessageEnvelopeAlignment(request);
    } catch (error) {
      throw new IssuanceProtocolError(
        "correlation_mismatch",
        error instanceof Error ? error.message : String(error),
      );
    }
    const requestMessageId = Buffer.from(request.envelope.messageId).toString("hex");
    const nowMs = resolveCurrentTimeMs(options.currentTimeMs);
    const requestIdentity = protocolMessageDigest(request);
    const completedRequest = readRetainedProtocolState(
      this.completedRequests,
      requestMessageId,
      nowMs,
    );
    if (
      completedRequest &&
      (completedRequest.length !== requestIdentity.length ||
        !completedRequest.every(
          (value, index) => value === requestIdentity[index],
        ))
    ) {
      throw new IssuanceProtocolError(
        "replayed_request",
        "This blinded-secret issuance message ID was already used with different message content.",
      );
    }
    const completedOutcome = readRetainedProtocolState(
      this.completedOutcomes,
      requestMessageId,
      nowMs,
    );
    if (completedOutcome) {
      if (!completedRequest || completedRequest.length === 0) {
        throw new IssuanceProtocolError(
          "replayed_request",
          "This finalized issuance outcome has no replay identity and cannot be redelivered.",
        );
      }
      throw new IssuanceProtocolError(
        "replayed_request",
        "This blinded-secret issuance request was already finalized and cannot be processed again.",
      );
    }
    const issuanceRequest = request.body as SecretBirthCredentialIssuanceRequest;
    this.assertValidIssuanceRequest(issuanceRequest);
    const respondsToId = Buffer.from(
      request.envelope.respondsToMessageId,
    ).toString("hex");
    const pendingOffer = this.pendingOffers.get(respondsToId);
    if (!pendingOffer) {
      throw new IssuanceProtocolError(
        "unknown_offer_reference",
        "No pending issuance offer found for this credential request. " +
        "Ensure createAndSendOffer was called first.",
      );
    }
    const offer = pendingOffer.offer;
    const sameBytes = (left: Uint8Array, right: Uint8Array): boolean =>
      Buffer.compare(Buffer.from(left), Buffer.from(right)) === 0;
    if (
      request.to !== this.profile.label ||
      request.from !== pendingOffer.holder ||
      !sameBytes(request.envelope.threadId, offer.envelope.threadId)
    ) {
      throw new IssuanceProtocolError(
        "correlation_mismatch",
        "Secret birth credential issuance request transport parties and thread must match the offered session",
      );
    }
    this.assertRequestMatchesOffer(offer, issuanceRequest);
    const currentDay = options.currentDay ?? DEFAULT_PROTOCOL_CURRENT_DAY;
    if (currentDay > offer.body.offerExpiresAtDay) {
      throw new IssuanceProtocolError(
        "expired_offer",
        "This blinded-secret issuance offer expired before the holder request was processed.",
        true,
      );
    }
    if (currentDay > issuanceRequest.body.requestExpiresAtDay) {
      throw new IssuanceProtocolError(
        "expired_request",
        "This blinded-secret issuance request expired before the issuer responded.",
        true,
      );
    }
    this.pendingOffers.delete(respondsToId);
    const requestBody = issuanceRequest.body;
    const issuanceSequence = this.issuanceCounter++;
    const issuerNonce = this.randomness.nextIssuerNonce({
      partyLabel: this.profile.label,
      flow: "blinded-secret-issuance",
      purpose: "issuer-nonce",
      sequence: issuanceSequence,
      threadId: issuanceRequest.envelope.threadId,
      respondsToMessageId: issuanceRequest.envelope.respondsToMessageId,
    });

    const claimCommitments = {
      subjectIdCommitment: pureCircuits.subjectIdCommitment(
        claimWitness.subjectId,
        claimWitness.subjectOpening,
      ),
      legalNameCommitment: pureCircuits.legalNameCommitment(
        claimWitness.legalNamePadded,
        claimWitness.legalNameOpening,
      ),
      birthDateCommitment: pureCircuits.birthDateCommitment(
        claimWitness.birthDateDays,
        claimWitness.birthDateOpening,
      ),
      birthCountryCodeCommitment: pureCircuits.birthCountryCodeCommitment(
        claimWitness.birthCountryCodePadded,
        claimWitness.birthCountryCodeOpening,
      ),
    };

    const credential: SecretBirthCredential = {
      version: 1n,
      schema: SECRET_BIRTH_SCHEMA,
      issuerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      holderBinding: {
        blindedHolderSecretCommitment:
          genericPureCircuits.blindedSecretHolderCommitment(
            requestBody.holderSecretCommitment,
            issuerNonce,
            requestBody.holderBindingBlindingFactor,
          ),
        issuerNonce,
        requestChallengeResponse:
          genericPureCircuits.noSecretHolderChallengeResponse(),
      },
      statusBinding: createNoStatusBinding(),
      issuedAt: claimWitness.issuedAt,
      hasExpiration: true,
      expiresAt: claimWitness.expiresAt,
      claims: {},
      claimCommitments,
      claimRoot: pureCircuits.birthCredentialClaimRoot(claimCommitments),
    };

    const bodyRoot = pureCircuits.secretBirthCredentialBodyRoot(credential);
    const challengeHash = requestBody.holderChallengeHash;
    const nonceScalar = this.randomness.nextSigningNonceScalar({
      partyLabel: this.profile.label,
      flow: "blinded-secret-issuance",
      purpose: "signing-nonce",
      sequence: issuanceSequence,
      threadId: issuanceRequest.envelope.threadId,
      respondsToMessageId: issuanceRequest.envelope.respondsToMessageId,
    });

    const proof: Proof = {
      signerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      createdAt: claimWitness.issuedAt + 1n,
      challengeHash,
      publicKey: this.profile.signer.publicKey,
      signature: {
        r: ecMulGenerator(nonceScalar),
        s: 0n,
      },
    };

    const challenge = genericPureCircuits.issuanceProofChallenge(
      bodyRoot,
      proof,
    );

    const credentialProof: Proof = {
      ...proof,
      signature: {
        r: proof.signature.r,
        s: mod(nonceScalar + challenge * this.profile.signer.secretKey),
      },
    };

    const result: SecretBirthCredentialIssuanceResult = {
      envelope: this.createEnvelope(
        "secret-issuance-result",
        "secret-birth-issuance",
        false,
        issuanceRequest.envelope.messageId,
        issuanceRequest.envelope.threadId,
      ),
      schema: SECRET_BIRTH_SCHEMA,
      issuerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      holderBindingProfile: HolderBindingProfile.blindedSecretHolder,
      body: {
        credential,
        credentialProof,
        issuanceChallengeHash: challengeHash,
        privateParts: {
          claims: {
            subjectId: claimWitness.subjectId,
            legalNamePadded: claimWitness.legalNamePadded,
            birthDateDays: claimWitness.birthDateDays,
            birthCountryCodePadded: claimWitness.birthCountryCodePadded,
          },
          openings: {
            subjectOpening: claimWitness.subjectOpening,
            legalNameOpening: claimWitness.legalNameOpening,
            birthDateOpening: claimWitness.birthDateOpening,
            birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
          },
        },
      },
    };

    const resultMessage: ProtocolMessage = {
      type: "issuance:result",
      from: this.profile.label,
      to: request.from,
      envelope: result.envelope,
      body: result,
    };
    this.bus.send(resultMessage);
    writeRetainedProtocolState(
      this.completedOutcomes,
      requestMessageId,
      resultMessage,
      nowMs,
      this.retentionPolicy,
      issuanceRequest.envelope.hasExpiresAt
        ? issuanceRequest.envelope.expiresAt
        : undefined,
    );
    writeRetainedProtocolState(
      this.completedRequests,
      requestMessageId,
      requestIdentity,
      nowMs,
      this.retentionPolicy,
      issuanceRequest.envelope.hasExpiresAt
        ? issuanceRequest.envelope.expiresAt
        : undefined,
    );
  }

  receiveRequestAndRespond(
    request: ProtocolMessage,
    claimWitness: SecretClaimWitness,
    options: SecretIssuanceProcessingOptions = {},
  ): void {
    const requestMessageId = Buffer.from(
      request.envelope.messageId,
    ).toString("hex");
    const nowMs = resolveCurrentTimeMs(options.currentTimeMs);
    const requestIdentity = protocolMessageDigest(request);
    const completedOutcome = readRetainedProtocolState(
      this.completedOutcomes,
      requestMessageId,
      nowMs,
    );
    const completedRequest = readRetainedProtocolState(
      this.completedRequests,
      requestMessageId,
      nowMs,
    );
    if (
      completedOutcome &&
      completedRequest &&
      completedRequest.length === requestIdentity.length &&
      completedRequest.every((value, index) => value === requestIdentity[index])
    ) {
      this.bus.send(completedOutcome);
      return;
    }
    const respondsToId = Buffer.from(
      request.envelope.respondsToMessageId,
    ).toString("hex");
    try {
      this.receiveRequestAndIssueCredential(request, claimWitness, options);
    } catch (error) {
      const classification = this.classifyIssuanceError(error);
      const transportCorrelationMismatch =
        classification.category === "correlation_mismatch";
      if (!transportCorrelationMismatch) {
        this.pendingOffers.delete(respondsToId);
      }
      const rejection = this.buildIssuanceRejection(
        request,
        classification.category,
        error instanceof Error ? error.message : String(error),
        classification.retryable,
      );
      const rejectionMessage: ProtocolMessage = {
        type: "issuance:rejection",
        from: this.profile.label,
        to: request.from,
        envelope: rejection.envelope,
        body: rejection,
      };
      this.bus.send(rejectionMessage);
      if (completedOutcome || transportCorrelationMismatch) {
        return;
      }
      writeRetainedProtocolState(
        this.completedOutcomes,
        requestMessageId,
        rejectionMessage,
        nowMs,
        this.retentionPolicy,
        request.envelope.hasExpiresAt
          ? request.envelope.expiresAt
          : undefined,
      );
      writeRetainedProtocolState(
        this.completedRequests,
        requestMessageId,
        requestIdentity,
        nowMs,
        this.retentionPolicy,
        request.envelope.hasExpiresAt
          ? request.envelope.expiresAt
          : undefined,
      );
    }
  }
}
