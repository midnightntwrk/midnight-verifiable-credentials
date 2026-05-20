import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import {
  type Proof,
  pureCircuits as genericPureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import {
  type BirthCredential,
  type BirthCredentialIssuanceOffer,
  type BirthCredentialIssuanceRequest,
  type BirthCredentialIssuanceResult,
  type BirthCredentialPresentation,
  type BirthCredentialPresentationRequest,
  type BirthCredentialVerificationRequest,
  type BirthCredentialVerificationSubmission,
  HolderBindingProfile,
  pureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials-birth/managed/birth-credential/contract/index.js";

import { mod } from "../shared/crypto.js";
import { createEnvelope } from "../shared/envelope.js";
import { assertBodyHasFields,assertMessageType } from "../shared/validation.js";
import type { MessageBus } from "../transport/message-bus.js";
import type { ProtocolMessage } from "../transport/types.js";
import {
  InMemoryProtocolStateStore,
  type ProtocolStateCollection,
  type ProtocolStateStore,
  recoverAppendOnlyOrdinalCount,
} from "./protocol-state-store.js";
import {
  type ProtocolRandomnessSource,
  unsafeReferenceDeterministicRandomnessSource,
} from "./randomness.js";
import type { DIDProfile } from "./types.js";

export type StoredCredential = {
  readonly credential: BirthCredential;
  readonly credentialProof: Proof;
};

export type PresentationWitness = {
  readonly credentialIndex: number;
  readonly currentDay: bigint;
  readonly birthDateDays: bigint;
  readonly birthDateOpening: Uint8Array;
  readonly birthCountryCodePadded: Uint8Array;
  readonly birthCountryCodeOpening: Uint8Array;
};

export class HolderAgent {
  private static readonly CREDENTIAL_COUNT_KEY = "credential-count";
  private readonly profile: DIDProfile;
  private readonly bus: MessageBus;
  private readonly randomness: ProtocolRandomnessSource;
  private readonly storedCredentials: ProtocolStateCollection<StoredCredential>;
  private readonly metadata: ProtocolStateCollection<number>;
  private credentialCountCache = 0;
  private issuanceRequestCounter = 0;
  private presentationCounter = 0;

  constructor(
    profile: DIDProfile,
    bus: MessageBus,
    options: {
      readonly randomness?: ProtocolRandomnessSource;
      readonly stateStore?: ProtocolStateStore;
    } = {},
  ) {
    this.profile = profile;
    this.bus = bus;
    this.randomness =
      options.randomness ?? unsafeReferenceDeterministicRandomnessSource;
    const stateStore = options.stateStore ?? new InMemoryProtocolStateStore();
    const stateScope = `holder:${this.profile.label}`;
    this.storedCredentials = stateStore.collection(
      `${stateScope}:stored-credentials`,
    );
    this.metadata = stateStore.collection(`${stateScope}:metadata`);
    this.credentialCountCache = this.recoverCredentialCount();
  }

  receiveOfferAndSendRequest(offer: ProtocolMessage): void {
    assertMessageType(offer, "issuance:offer");
    assertBodyHasFields(offer, ["envelope", "schema", "body"]);
    const issuanceOffer = offer.body as BirthCredentialIssuanceOffer;
    const issuanceSequence = this.issuanceRequestCounter++;
    const challengeHash = this.randomness.nextChallengeHash({
      partyLabel: this.profile.label,
      flow: "explicit-issuance",
      purpose: "holder-challenge",
      sequence: issuanceSequence,
      threadId: issuanceOffer.envelope.threadId,
      respondsToMessageId: issuanceOffer.envelope.messageId,
    });

    const request: BirthCredentialIssuanceRequest = {
      envelope: createEnvelope(
        "issuance-request",
        "birth-issuance",
        false,
        issuanceOffer.envelope.messageId,
        issuanceOffer.envelope.threadId,
      ),
      schema: issuanceOffer.schema,
      issuerVerificationMethodRef: issuanceOffer.issuerVerificationMethodRef,
      holderBindingProfile: HolderBindingProfile.explicitDid,
      body: {
        holderBinding: {
          holderVerificationMethodRef:
            this.profile.signer.verificationMethodRef,
        },
        holderPublicKey: this.profile.signer.publicKey,
        holderChallengeHash: challengeHash,
        requestExpiration: true,
        requestedExpirationDays: 365n,
      },
    };

    this.bus.send({
      type: "issuance:request",
      from: this.profile.label,
      to: offer.from,
      envelope: request.envelope,
      body: request,
    });
  }

  receiveCredentialResult(result: ProtocolMessage): void {
    assertMessageType(result, "issuance:result");
    assertBodyHasFields(result, ["envelope", "schema", "body"]);
    const issuanceResult = result.body as BirthCredentialIssuanceResult;
    this.storedCredentials.set(String(this.credentialCountCache), {
      credential: issuanceResult.body.credential,
      credentialProof: issuanceResult.body.credentialProof,
    });
    this.credentialCountCache += 1;
    this.metadata.set(
      HolderAgent.CREDENTIAL_COUNT_KEY,
      this.credentialCountCache,
    );
  }

  get credentialCount(): number {
    return this.credentialCountCache;
  }

  getCredential(index: number): StoredCredential {
    if (index < 0 || index >= this.credentialCountCache) {
      throw new RangeError(
        `Credential index ${index} out of range [0, ${this.credentialCountCache})`,
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
      HolderAgent.CREDENTIAL_COUNT_KEY,
      this.storedCredentials,
    );
  }

  buildPresentationForContract(
    credentialIndex: number,
    request: BirthCredentialPresentationRequest,
    witnessData: PresentationWitness,
    requestContext?: {
      readonly threadId: Uint8Array;
      readonly requestMessageId: Uint8Array;
    },
  ): { presentation: BirthCredentialPresentation; presentationProof: Proof } {
    const stored = this.getCredential(credentialIndex);
    const credential = stored.credential;

    const presentation: BirthCredentialPresentation = {
      version: 1n,
      schema: credential.schema,
      credentialClaimRoot: credential.claimRoot,
      issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
      holderBinding: credential.holderBinding,
      disclosed: {
        revealSubjectIdCommitment: request.requireSubjectIdCommitmentDisclosure,
        subjectIdCommitment: request.requireSubjectIdCommitmentDisclosure
          ? credential.claimCommitments.subjectIdCommitment
          : new Uint8Array(32),
        revealBirthCountryCode: request.requireBirthCountryDisclosure,
        birthCountryCodePadded: request.requireBirthCountryDisclosure
          ? witnessData.birthCountryCodePadded
          : new Uint8Array(32),
        birthCountryCodeOpening: request.requireBirthCountryDisclosure
          ? witnessData.birthCountryCodeOpening
          : new Uint8Array(32),
        proveAgeOverThreshold: request.requireAgeOverThreshold,
        ageThresholdYears: request.requestedAgeThresholdYears,
      },
    };

    const bodyRoot =
      pureCircuits.birthCredentialPresentationBodyRoot(presentation);
    const presentationSequence = this.presentationCounter++;
    const nonceScalar = this.randomness.nextSigningNonceScalar({
      partyLabel: this.profile.label,
      flow: "explicit-presentation",
      purpose: "signing-nonce",
      sequence: presentationSequence,
      threadId: requestContext?.threadId,
      respondsToMessageId: requestContext?.requestMessageId,
    });

    const proof: Proof = {
      signerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      createdAt: BigInt(Date.now()),
      challengeHash: request.verifierChallengeHash,
      publicKey: this.profile.signer.publicKey,
      signature: {
        r: ecMulGenerator(nonceScalar),
        s: 0n,
      },
    };

    const challenge = genericPureCircuits.presentationProofChallenge(
      bodyRoot,
      proof,
    );

    const presentationProof: Proof = {
      ...proof,
      signature: {
        r: proof.signature.r,
        s: mod(nonceScalar + challenge * this.profile.signer.secretKey),
      },
    };

    return { presentation, presentationProof };
  }

  receiveRequestAndSendPresentation(
    requestMessage: ProtocolMessage,
    witnessData: PresentationWitness,
  ): void {
    assertMessageType(requestMessage, "presentation:request");
    assertBodyHasFields(requestMessage, ["envelope", "schema", "body"]);
    const requestMessageBody =
      requestMessage.body as BirthCredentialVerificationRequest;
    const request =
      pureCircuits.birthCredentialPresentationRequestFromProtocol(
        requestMessageBody,
      );
    const stored = this.getCredential(witnessData.credentialIndex);

    const { presentation, presentationProof } =
      this.buildPresentationForContract(
        witnessData.credentialIndex,
        request,
        witnessData,
        {
          threadId: requestMessage.envelope.threadId,
          requestMessageId: requestMessage.envelope.messageId,
        },
      );

    const submissionBody: BirthCredentialVerificationSubmission = {
      envelope: createEnvelope(
        "presentation-submission",
        "birth-presentation",
        false,
        requestMessageBody.envelope.messageId,
        requestMessageBody.envelope.threadId,
      ),
      schema: requestMessageBody.schema,
      issuerVerificationMethodRef:
        requestMessageBody.issuerVerificationMethodRef,
      holderBindingProfile: requestMessageBody.holderBindingProfile,
      challengeHash: requestMessageBody.verifierChallengeHash,
      body: {
        credential: stored.credential,
        credentialProof: stored.credentialProof,
        presentation,
        presentationProof,
      },
    };

    this.bus.send({
      type: "presentation:submission",
      from: this.profile.label,
      to: requestMessage.from,
      envelope: submissionBody.envelope,
      body: submissionBody,
    });
  }
}
