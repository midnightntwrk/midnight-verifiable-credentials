import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import {
  type Proof,
  pureCircuits as genericPureCircuits,
  type VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";

import {
  type CredentialProtocolFeatures,
  type DigitalPassportCredential,
  type DigitalPassportCredentialPrivateParts,
  type DigitalPassportIssuanceOffer,
  type DigitalPassportIssuanceRequest,
  type DigitalPassportIssuanceResult,
  type DigitalPassportPresentation,
  type DigitalPassportPresentationRequest,
  type DigitalPassportVerificationRequest,
  type DigitalPassportVerificationResult,
  type DigitalPassportVerificationSubmission,
  HolderBindingProfile,
  type ProtocolMessageEnvelope,
  pureCircuits,
} from "../managed/digital-passport-credential/contract/index.js";
import { JUBJUB_SUBGROUP_ORDER, mod } from "./jubjub-utils.js";

export type Signer = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

export type ProofContext = "issuance" | "presentation";

export type DigitalPassportFixture = {
  readonly issuer: Signer;
  readonly holder: Signer;
  readonly credential: DigitalPassportCredential;
  readonly credentialProof: Proof;
  readonly presentationRequest: DigitalPassportPresentationRequest;
  readonly presentation: DigitalPassportPresentation;
  readonly presentationProof: Proof;
  readonly privateParts: DigitalPassportCredentialPrivateParts;
  readonly currentDay: bigint;
};

export type DigitalPassportProtocolFixture = DigitalPassportFixture & {
  readonly features: CredentialProtocolFeatures;
  readonly issuanceOffer: DigitalPassportIssuanceOffer;
  readonly issuanceRequest: DigitalPassportIssuanceRequest;
  readonly issuanceResult: DigitalPassportIssuanceResult;
  readonly verificationRequest: DigitalPassportVerificationRequest;
  readonly verificationSubmission: DigitalPassportVerificationSubmission;
  readonly verificationResult: DigitalPassportVerificationResult;
};

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length >= length) {
    return bytes.subarray(0, length);
  }
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

const contractAddress = (label: string): { bytes: Uint8Array } => ({
  bytes: sha256(`contract:${label}`),
});

const createProtocolEnvelope = ({
  label,
  threadLabel,
  initialMessage,
  respondsToMessageId,
  createdAt,
}: {
  readonly label: string;
  readonly threadLabel: string;
  readonly initialMessage: boolean;
  readonly respondsToMessageId?: Uint8Array;
  readonly createdAt: bigint;
}): ProtocolMessageEnvelope => ({
  version: 1n,
  messageId: sha256(`protocol:message:${label}`),
  threadId: sha256(`protocol:thread:${threadLabel}`),
  initialMessage,
  respondsToMessageId:
    respondsToMessageId ?? genericPureCircuits.noProtocolResponseReference(),
  createdAt,
  hasExpiresAt: false,
  expiresAt: 0n,
});

export const createSigner = (
  label: string,
  secretKey: bigint,
  methodId = `#${label}-key-1`,
): Signer => ({
  label,
  secretKey,
  publicKey: ecMulGenerator(secretKey),
  verificationMethodRef: {
    didContractAddress: contractAddress(label),
    methodId: padText(methodId),
  },
});

export const withVerificationMethodRef = (
  signer: Signer,
  verificationMethodRef: VerificationMethodRef,
): Signer => ({
  ...signer,
  verificationMethodRef,
});

const deriveProofChallenge = (
  bodyRoot: Uint8Array,
  proof: Proof,
  context: ProofContext,
): bigint =>
  context === "issuance"
    ? genericPureCircuits.issuanceProofChallenge(bodyRoot, proof)
    : genericPureCircuits.presentationProofChallenge(bodyRoot, proof);

export const signProof = ({
  bodyRoot,
  context,
  signer,
  createdAt,
  challengeHash,
  nonceScalar,
}: {
  readonly bodyRoot: Uint8Array;
  readonly context: ProofContext;
  readonly signer: Signer;
  readonly createdAt: bigint;
  readonly challengeHash: Uint8Array;
  readonly nonceScalar: bigint;
}): Proof => {
  const proof: Proof = {
    signerVerificationMethodRef: signer.verificationMethodRef,
    createdAt,
    challengeHash,
    publicKey: signer.publicKey,
    signature: {
      r: ecMulGenerator(nonceScalar),
      s: 0n,
    },
  };
  const challenge = deriveProofChallenge(bodyRoot, proof, context);
  return {
    ...proof,
    signature: {
      r: proof.signature.r,
      s: mod(nonceScalar + challenge * signer.secretKey),
    },
  };
};

type FixtureOptions = {
  readonly hasDocumentNumber?: boolean;
};

const buildDigitalPassportFixture = (
  issuer: Signer,
  holder: Signer,
  verifierChallengeHash = sha256("challenge:verifier"),
  options: FixtureOptions = {},
): DigitalPassportFixture => {
  const hasDocumentNumber = options.hasDocumentNumber ?? true;
  const claimValues = {
    firstNameValuePadded: padText("Alice", 64),
    lastNameValuePadded: padText("Example", 64),
    dateOfBirthDays: 3650n,
    documentNumberValue: hasDocumentNumber
      ? padText("AB1234567", 32)
      : new Uint8Array(32),
    issuingStateValue: padText("US", 32),
  };

  const openings = {
    firstNameOpening: sha256("opening:first-name"),
    lastNameOpening: sha256("opening:last-name"),
    dateOfBirthOpening: sha256("opening:date-of-birth"),
    documentNumberOpening: hasDocumentNumber
      ? sha256("opening:document-number")
      : new Uint8Array(32),
    issuingStateOpening: sha256("opening:issuing-state"),
  };

  const privateParts: DigitalPassportCredentialPrivateParts = {
    claimValues,
    openings,
  };

  const currentDay = 3650n + 365n * 25n;

  const claimCommitments = {
    firstNameCommitment: pureCircuits.firstNameCommitment(
      claimValues.firstNameValuePadded,
      openings.firstNameOpening,
    ),
    lastNameCommitment: pureCircuits.lastNameCommitment(
      claimValues.lastNameValuePadded,
      openings.lastNameOpening,
    ),
    dateOfBirthCommitment: pureCircuits.dateOfBirthCommitment(
      claimValues.dateOfBirthDays,
      openings.dateOfBirthOpening,
    ),
    documentNumberCommitment: hasDocumentNumber
      ? pureCircuits.documentNumberCommitment(
          claimValues.documentNumberValue,
          openings.documentNumberOpening,
        )
      : pureCircuits.documentNumberNullCommitment(),
    issuingStateCommitment: pureCircuits.issuingStateCommitment(
      claimValues.issuingStateValue,
      openings.issuingStateOpening,
    ),
  };

  const credential: DigitalPassportCredential = {
    version: 1n,
    schema: {
      packageId: padText("midnight:vc:digital-passport"),
      schemaId: padText("digital-passport:v1"),
      majorVersion: 1n,
      minorVersion: 0n,
    },
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: holder.verificationMethodRef,
    },
    statusBinding: {},
    issuedAt: 10_000n,
    hasExpiration: true,
    expiresAt: 20_000n,
    claims: {},
    claimCommitments,
    claimRoot: pureCircuits.digitalPassportClaimRoot(claimCommitments),
  };

  const credentialProof = signProof({
    bodyRoot: pureCircuits.digitalPassportCredentialBodyRoot(credential),
    context: "issuance",
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:issuance"),
    nonceScalar: 11n,
  });

  const presentationRequest: DigitalPassportPresentationRequest = {
    version: 1n,
    schema: credential.schema,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    requireFirstNameDisclosure: false,
    requireLastNameDisclosure: true,
    requireAgeOverThreshold: true,
    requestedAgeThresholdYears: 18n,
    requireDocumentNumberDisclosure: false,
    requireIssuingStateDisclosure: false,
    verifierChallengeHash,
  };

  const presentation: DigitalPassportPresentation = {
    version: 1n,
    schema: credential.schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    holderBinding: credential.holderBinding,
    disclosed: {
      revealFirstName: false,
      firstNameValuePadded: new Uint8Array(64),
      firstNameOpening: new Uint8Array(32),
      revealLastName: true,
      lastNameValuePadded: claimValues.lastNameValuePadded,
      lastNameOpening: openings.lastNameOpening,
      proveAgeOverThreshold: true,
      ageThresholdYears: 18n,
      revealDocumentNumber: false,
      documentNumberValue: new Uint8Array(32),
      documentNumberOpening: new Uint8Array(32),
      revealIssuingState: false,
      issuingStateValue: new Uint8Array(32),
      issuingStateOpening: new Uint8Array(32),
    },
  };

  const presentationProof = signProof({
    bodyRoot: pureCircuits.digitalPassportPresentationBodyRoot(presentation),
    context: "presentation",
    signer: holder,
    createdAt: 10_100n,
    challengeHash: presentationRequest.verifierChallengeHash,
    nonceScalar: 17n,
  });

  return {
    issuer,
    holder,
    credential,
    credentialProof,
    presentationRequest,
    presentation,
    presentationProof,
    privateParts,
    currentDay,
  };
};

export const createDigitalPassportFixture = (): DigitalPassportFixture =>
  buildDigitalPassportFixture(
    createSigner("issuer", 123456789n),
    createSigner("holder", 987654321n),
  );

export const createDigitalPassportFixtureWithoutDocumentNumber =
  (): DigitalPassportFixture =>
    buildDigitalPassportFixture(
      createSigner("issuer", 123456789n),
      createSigner("holder", 987654321n),
      sha256("challenge:verifier"),
      { hasDocumentNumber: false },
    );

export const createDigitalPassportFixtureForParticipants = (
  issuer: Signer,
  holder: Signer,
  verifierChallengeHash?: Uint8Array,
): DigitalPassportFixture =>
  buildDigitalPassportFixture(issuer, holder, verifierChallengeHash);

export const createDigitalPassportProtocolFixture =
  (): DigitalPassportProtocolFixture => {
    const fixture = createDigitalPassportFixture();
    const features: CredentialProtocolFeatures = {
      supportsSelectiveDisclosure: true,
      supportsPredicateProofs: true,
      supportsVerifierScopedPseudonym: false,
      supportsSameHolderProof: false,
    };

    return createDigitalPassportProtocolFixtureFromFixture(fixture, features);
  };

export const createDigitalPassportProtocolFixtureForParticipants = (
  issuer: Signer,
  holder: Signer,
  verifierChallengeHash?: Uint8Array,
): DigitalPassportProtocolFixture =>
  createDigitalPassportProtocolFixtureFromFixture(
    createDigitalPassportFixtureForParticipants(
      issuer,
      holder,
      verifierChallengeHash,
    ),
  );

const createDigitalPassportProtocolFixtureFromFixture = (
  fixture: DigitalPassportFixture,
  features: CredentialProtocolFeatures = {
    supportsSelectiveDisclosure: true,
    supportsPredicateProofs: true,
    supportsVerifierScopedPseudonym: false,
    supportsSameHolderProof: false,
  },
): DigitalPassportProtocolFixture => {
  const normalizedFeatures: CredentialProtocolFeatures = {
    supportsSelectiveDisclosure: features.supportsSelectiveDisclosure,
    supportsPredicateProofs: features.supportsPredicateProofs,
    supportsVerifierScopedPseudonym: features.supportsVerifierScopedPseudonym,
    supportsSameHolderProof: features.supportsSameHolderProof,
  };

  const issuanceOffer: DigitalPassportIssuanceOffer = {
    envelope: createProtocolEnvelope({
      label: "issuance-offer",
      threadLabel: "digital-passport-issuance",
      initialMessage: true,
      createdAt: 20_000n,
    }),
    schema: fixture.credential.schema,
    issuerVerificationMethodRef: fixture.credential.issuerVerificationMethodRef,
    holderBindingProfile: HolderBindingProfile.explicitDid,
    features: normalizedFeatures,
    body: {
      supportsExpiration: true,
      defaultExpirationDays: 365n,
      requiresHolderPublicKey: true,
    },
  };

  const issuanceRequest: DigitalPassportIssuanceRequest = {
    envelope: createProtocolEnvelope({
      label: "issuance-request",
      threadLabel: "digital-passport-issuance",
      initialMessage: false,
      respondsToMessageId: issuanceOffer.envelope.messageId,
      createdAt: 20_010n,
    }),
    schema: fixture.credential.schema,
    issuerVerificationMethodRef: fixture.credential.issuerVerificationMethodRef,
    holderBindingProfile: HolderBindingProfile.explicitDid,
    body: {
      holderBinding: fixture.credential.holderBinding,
      holderPublicKey: fixture.holder.publicKey,
      holderChallengeHash: fixture.credentialProof.challengeHash,
      requestExpiration: true,
      requestedExpirationDays: 365n,
    },
  };

  const issuanceResult: DigitalPassportIssuanceResult = {
    envelope: createProtocolEnvelope({
      label: "issuance-result",
      threadLabel: "digital-passport-issuance",
      initialMessage: false,
      respondsToMessageId: issuanceRequest.envelope.messageId,
      createdAt: 20_020n,
    }),
    schema: fixture.credential.schema,
    issuerVerificationMethodRef: fixture.credential.issuerVerificationMethodRef,
    holderBindingProfile: HolderBindingProfile.explicitDid,
    body: {
      credential: fixture.credential,
      credentialProof: fixture.credentialProof,
      holderPublicKey: fixture.holder.publicKey,
      issuanceChallengeHash: fixture.credentialProof.challengeHash,
      privateParts: fixture.privateParts,
    },
  };

  const verificationRequest: DigitalPassportVerificationRequest = {
    envelope: createProtocolEnvelope({
      label: "verification-request",
      threadLabel: "digital-passport-verification",
      initialMessage: true,
      createdAt: 21_000n,
    }),
    schema: fixture.credential.schema,
    issuerVerificationMethodRef: fixture.credential.issuerVerificationMethodRef,
    holderBindingProfile: HolderBindingProfile.explicitDid,
    features: normalizedFeatures,
    verifierChallengeHash: fixture.presentationRequest.verifierChallengeHash,
    body: {
      requireFirstNameDisclosure:
        fixture.presentationRequest.requireFirstNameDisclosure,
      requireLastNameDisclosure:
        fixture.presentationRequest.requireLastNameDisclosure,
      requireAgeOverThreshold:
        fixture.presentationRequest.requireAgeOverThreshold,
      requestedAgeThresholdYears:
        fixture.presentationRequest.requestedAgeThresholdYears,
      requireDocumentNumberDisclosure:
        fixture.presentationRequest.requireDocumentNumberDisclosure,
      requireIssuingStateDisclosure:
        fixture.presentationRequest.requireIssuingStateDisclosure,
    },
  };

  const verificationSubmission: DigitalPassportVerificationSubmission = {
    envelope: createProtocolEnvelope({
      label: "verification-submission",
      threadLabel: "digital-passport-verification",
      initialMessage: false,
      respondsToMessageId: verificationRequest.envelope.messageId,
      createdAt: 21_010n,
    }),
    schema: fixture.credential.schema,
    issuerVerificationMethodRef: fixture.credential.issuerVerificationMethodRef,
    holderBindingProfile: HolderBindingProfile.explicitDid,
    challengeHash: fixture.presentationProof.challengeHash,
    body: {
      credential: fixture.credential,
      credentialProof: fixture.credentialProof,
      presentation: fixture.presentation,
      presentationProof: fixture.presentationProof,
    },
  };

  const verificationResult: DigitalPassportVerificationResult = {
    envelope: createProtocolEnvelope({
      label: "verification-result",
      threadLabel: "digital-passport-verification",
      initialMessage: false,
      respondsToMessageId: verificationSubmission.envelope.messageId,
      createdAt: 21_020n,
    }),
    approved: true,
    body: {
      credentialRoot: pureCircuits.digitalPassportCredentialBodyRoot(
        fixture.credential,
      ),
      verifiedThresholdYears: fixture.presentation.disclosed.ageThresholdYears,
    },
  };

  return {
    ...fixture,
    features: normalizedFeatures,
    issuanceOffer,
    issuanceRequest,
    issuanceResult,
    verificationRequest,
    verificationSubmission,
    verificationResult,
  };
};
