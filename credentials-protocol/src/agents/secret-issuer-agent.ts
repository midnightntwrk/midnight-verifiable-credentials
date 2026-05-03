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

export class SecretIssuerAgent {
  private readonly profile: DIDProfile;
  private readonly bus: MessageBus;
  private issuanceCounter = 0;
  private readonly pendingOffers = new Map<
    string,
    SecretBirthCredentialIssuanceOffer
  >();
  private readonly finalizedRequestIds = new Set<string>();
  private readonly completedOutcomes = new Map<string, ProtocolMessage>();

  constructor(profile: DIDProfile, bus: MessageBus) {
    this.profile = profile;
    this.bus = bus;
  }

  createAndSendOffer(holderLabel: PartyId): void {
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
  ): SecretBirthCredentialIssuanceRejectionCategory {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("No pending issuance offer found")) {
      return "unknown_offer_reference";
    }
    if (
      message.includes("cannot require expiration when the offer disables it") ||
      message.includes("issuer verification method") ||
      message.includes("holder binding profile")
    ) {
      return "offer_request_mismatch";
    }
    return "malformed_request";
  }

  receiveRequestAndIssueCredential(
    request: ProtocolMessage,
    claimWitness: SecretClaimWitness,
  ): void {
    assertMessageType(request, "issuance:request");
    assertBodyHasFields(request, ["envelope", "schema", "body"]);
    const requestMessageId = Buffer.from(request.envelope.messageId).toString("hex");
    if (this.finalizedRequestIds.has(requestMessageId)) {
      throw new Error(
        "This blinded-secret issuance request was already finalized and cannot be processed again.",
      );
    }
    const issuanceRequest = request.body as SecretBirthCredentialIssuanceRequest;
    pureCircuits.assertValidSecretBirthCredentialIssuanceRequest(
      issuanceRequest,
    );
    const respondsToId = Buffer.from(
      request.envelope.respondsToMessageId,
    ).toString("hex");
    const offer = this.pendingOffers.get(respondsToId);
    if (!offer) {
      throw new Error(
        "No pending issuance offer found for this credential request. " +
        "Ensure createAndSendOffer was called first.",
      );
    }
    pureCircuits.assertSecretBirthCredentialIssuanceRequestMatchesOffer(
      offer,
      issuanceRequest,
    );
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
    this.finalizedRequestIds.add(requestMessageId);
    this.completedOutcomes.set(requestMessageId, resultMessage);
  }

  receiveRequestAndRespond(
    request: ProtocolMessage,
    claimWitness: SecretClaimWitness,
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
      this.receiveRequestAndIssueCredential(request, claimWitness);
    } catch (error) {
      this.pendingOffers.delete(respondsToId);
      const rejection = this.buildIssuanceRejection(
        request,
        this.classifyIssuanceError(error),
        error instanceof Error ? error.message : String(error),
      );
      const rejectionMessage: ProtocolMessage = {
        type: "issuance:rejection",
        from: this.profile.label,
        to: request.from,
        envelope: rejection.envelope,
        body: rejection,
      };
      this.bus.send(rejectionMessage);
      this.finalizedRequestIds.add(requestMessageId);
      this.completedOutcomes.set(requestMessageId, rejectionMessage);
    }
  }
}
