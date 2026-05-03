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

import { mod, padText,sha256 } from "../shared/crypto.js";
import { createEnvelope } from "../shared/envelope.js";
import { assertBodyHasFields,assertMessageType } from "../shared/validation.js";
import type { MessageBus } from "../transport/message-bus.js";
import type {
  PartyId,
  ProtocolMessage,
  SecretBirthCredentialIssuanceRejection,
  SecretBirthCredentialIssuanceRejectionCategory,
} from "../transport/types.js";
import type { DIDProfile } from "./types.js";

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

const SECRET_BIRTH_SCHEMA = {
  packageId: padText("midnight-did:vc:birth-secret"),
  schemaId: padText("birth-credential:v1"),
  majorVersion: 1n,
  minorVersion: 0n,
};

const FEATURES = {
  supportsSelectiveDisclosure: true,
  supportsPredicateProofs: true,
  supportsVerifierScopedPseudonym: true,
  supportsSameHolderProof: true,
};

const DEFAULT_PROTOCOL_CURRENT_DAY = 0n;
const DEFAULT_ISSUANCE_OFFER_EXPIRY_DAY = 1_000_000n;

type SecretIssuanceOfferOptions = {
  readonly offerExpiresAtDay?: bigint;
};

type SecretIssuanceProcessingOptions = {
  readonly currentDay?: bigint;
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
  private issuanceCounter = 0;
  private readonly pendingOffers = new Map<
    string,
    SecretBirthCredentialIssuanceOffer
  >();
  private readonly completedOutcomes = new Map<string, ProtocolMessage>();

  constructor(profile: DIDProfile, bus: MessageBus) {
    this.profile = profile;
    this.bus = bus;
  }

  createAndSendOffer(
    holderLabel: PartyId,
    options: SecretIssuanceOfferOptions = {},
  ): void {
    const offer: SecretBirthCredentialIssuanceOffer = {
      envelope: createEnvelope(
        "secret-issuance-offer",
        "secret-birth-issuance",
        true,
      ),
      schema: SECRET_BIRTH_SCHEMA,
      issuerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      holderBindingProfile: HolderBindingProfile.blindedSecretHolder,
      features: FEATURES,
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
    this.pendingOffers.set(offerMessageId, offer);
  }

  private buildIssuanceRejection(
    request: ProtocolMessage,
    category: SecretBirthCredentialIssuanceRejectionCategory,
    detail: string,
    retryable = false,
  ): SecretBirthCredentialIssuanceRejection {
    return {
      envelope: createEnvelope(
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
    const sameMethodId = offerMethod.methodId === requestMethod.methodId;
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
    const requestMessageId = Buffer.from(request.envelope.messageId).toString("hex");
    if (this.completedOutcomes.has(requestMessageId)) {
      throw new IssuanceProtocolError(
        "malformed_request",
        "This blinded-secret issuance request was already finalized and cannot be processed again.",
      );
    }
    const issuanceRequest = request.body as SecretBirthCredentialIssuanceRequest;
    this.assertValidIssuanceRequest(issuanceRequest);
    const respondsToId = Buffer.from(
      request.envelope.respondsToMessageId,
    ).toString("hex");
    const offer = this.pendingOffers.get(respondsToId);
    if (!offer) {
      throw new IssuanceProtocolError(
        "unknown_offer_reference",
        "No pending issuance offer found for this credential request. " +
        "Ensure createAndSendOffer was called first.",
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

    // TEST ONLY: production must use a unique random nonce per issuance.
    const issuerNonce = sha256(`issuer-nonce:${this.profile.label}:${this.issuanceCounter++}`);

    const claims = {
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
      issuedAt: claimWitness.issuedAt,
      hasExpiration: true,
      expiresAt: claimWitness.expiresAt,
      claims,
      claimRoot: pureCircuits.birthCredentialClaimRoot(claims),
    };

    const bodyRoot = pureCircuits.secretBirthCredentialBodyRoot(credential);
    const challengeHash = requestBody.holderChallengeHash;
    // TEST ONLY: production must use cryptographically random nonces.
    const nonceScalar = 11n;

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
      envelope: createEnvelope(
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
    this.completedOutcomes.set(requestMessageId, resultMessage);
  }

  receiveRequestAndRespond(
    request: ProtocolMessage,
    claimWitness: SecretClaimWitness,
    options: SecretIssuanceProcessingOptions = {},
  ): void {
    const requestMessageId = Buffer.from(
      request.envelope.messageId,
    ).toString("hex");
    const completedOutcome = this.completedOutcomes.get(requestMessageId);
    if (completedOutcome) {
      this.bus.send(completedOutcome);
      return;
    }
    const respondsToId = Buffer.from(
      request.envelope.respondsToMessageId,
    ).toString("hex");
    try {
      this.receiveRequestAndIssueCredential(request, claimWitness, options);
    } catch (error) {
      this.pendingOffers.delete(respondsToId);
      const classification = this.classifyIssuanceError(error);
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
      this.completedOutcomes.set(requestMessageId, rejectionMessage);
    }
  }
}
