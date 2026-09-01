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
  HolderBindingProfile,
  pureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials-birth/managed/birth-credential/contract/index.js";

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
import { assertBodyHasFields, assertMessageType } from "../../shared/validation.js";
import type { MessageBus } from "../../transport/message-bus.js";
import type { PartyId,ProtocolMessage } from "../../transport/types.js";
import {
  BIRTH_COMPATIBILITY_FEATURE_HINTS,
  BIRTH_SCHEMA,
} from "./schema-descriptors.js";

export type ClaimWitness = {
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

const createNoStatusBinding = (): BirthCredential["statusBinding"] => {
  // The thin-core birth credential models `NoStatusBinding` as an empty struct.
  const binding: BirthCredential["statusBinding"] = {};
  genericPureCircuits.assertValidNoStatusBinding(binding);
  return binding;
};

export class IssuerAgent {
  private readonly profile: DIDProfile;
  private readonly bus: MessageBus;
  private readonly randomness: ProtocolRandomnessSource;
  private readonly createEnvelope: ProtocolEnvelopeFactory;
  private issuanceCounter = 0;

  constructor(
    profile: DIDProfile,
    bus: MessageBus,
    options: {
      readonly envelopeIdentifierSource?: ProtocolEnvelopeIdentifierSource;
      readonly randomness?: ProtocolRandomnessSource;
    } = {},
  ) {
    this.profile = profile;
    this.bus = bus;
    this.randomness = options.randomness ?? secureProtocolRandomnessSource;
    this.createEnvelope = createProtocolEnvelopeFactory(
      options.envelopeIdentifierSource,
    );
  }

  createAndSendOffer(holderLabel: PartyId): void {
    const offer: BirthCredentialIssuanceOffer = {
      envelope: this.createEnvelope(
        "issuance-offer",
        "birth-issuance",
        true,
      ),
      schema: BIRTH_SCHEMA,
      issuerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      holderBindingProfile: HolderBindingProfile.explicitDid,
      features: BIRTH_COMPATIBILITY_FEATURE_HINTS,
      body: {
        supportsExpiration: true,
        defaultExpirationDays: 365n,
        requiresHolderPublicKey: true,
      },
    };

    this.bus.send({
      type: "issuance:offer",
      from: this.profile.label,
      to: holderLabel,
      envelope: offer.envelope,
      body: offer,
    });
  }

  receiveRequestAndIssueCredential(
    request: ProtocolMessage,
    claimWitness: ClaimWitness,
  ): void {
    assertMessageType(request, "issuance:request");
    assertBodyHasFields(request, ["envelope", "schema", "body"]);
    const issuanceRequest = request.body as BirthCredentialIssuanceRequest;

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

    const credential: BirthCredential = {
      version: 1n,
      schema: BIRTH_SCHEMA,
      issuerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      holderBinding: issuanceRequest.body.holderBinding,
      statusBinding: createNoStatusBinding(),
      issuedAt: claimWitness.issuedAt,
      hasExpiration: true,
      expiresAt: claimWitness.expiresAt,
      claims: {},
      claimCommitments,
      claimRoot: pureCircuits.birthCredentialClaimRoot(claimCommitments),
    };

    const bodyRoot = pureCircuits.birthCredentialBodyRoot(credential);
    const challengeHash = issuanceRequest.body.holderChallengeHash;
    const issuanceSequence = this.issuanceCounter++;
    const nonceScalar = this.randomness.nextSigningNonceScalar({
      partyLabel: this.profile.label,
      flow: "explicit-issuance",
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

    const result: BirthCredentialIssuanceResult = {
      envelope: this.createEnvelope(
        "issuance-result",
        "birth-issuance",
        false,
        issuanceRequest.envelope.messageId,
        issuanceRequest.envelope.threadId,
      ),
      schema: BIRTH_SCHEMA,
      issuerVerificationMethodRef: this.profile.signer.verificationMethodRef,
      holderBindingProfile: HolderBindingProfile.explicitDid,
      body: {
        credential,
        credentialProof,
        holderPublicKey: issuanceRequest.body.holderPublicKey,
        issuanceChallengeHash: challengeHash,
      },
    };

    this.bus.send({
      type: "issuance:result",
      from: this.profile.label,
      to: request.from,
      envelope: result.envelope,
      body: result,
    });
  }
}
