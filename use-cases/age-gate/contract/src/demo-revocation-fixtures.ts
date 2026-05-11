import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import { StatusType } from "@midnight-ntwrk/midnight-did-credentials";
import { assertStatusHandleNotRevoked } from "@midnight-ntwrk/midnight-did-credentials-status-registry";

import {
  HolderBindingProfile,
  type Proof,
  type ProtocolMessageEnvelope,
  pureCircuits,
  type RevocationRegistryState,
  type RevokedSetStatusRequest,
  type SecretBirthCredential,
  type SecretBirthCredentialPresentation,
  type SecretBirthCredentialPresentationRequest,
  type SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs,
  type SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
  type SecretBirthCredentialVerificationLiveStatusInputs,
  type SecretBirthCredentialVerificationLiveStatusRequest,
  type SecretBirthCredentialVerificationRequest,
  type SecretBirthCredentialVerificationRevokedSetStatusInputs,
  type SecretBirthCredentialVerificationRevokedSetStatusRequest,
  type SecretBirthCredentialVerificationSubmission,
  type SecretBirthCredentialWithStatusBinding,
  type SecretBirthStatusCredential,
  StatusCapabilityKind,
  type VerificationMethodRef,
} from "./managed/demo-revocation/contract/index.js";

const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

export type Signer = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

export type DemoRevocationFixture = {
  readonly issuer: Signer;
  readonly credential: SecretBirthCredential;
  readonly credentialProof: Proof;
  readonly presentationRequest: SecretBirthCredentialPresentationRequest;
  readonly verificationRequest: SecretBirthCredentialVerificationRequest;
  readonly credentialWithStatusBinding: SecretBirthCredentialWithStatusBinding;
  readonly liveStatusVerificationRequest: SecretBirthCredentialVerificationLiveStatusRequest;
  readonly revokedSetStatusVerificationRequest: SecretBirthCredentialVerificationRevokedSetStatusRequest;
  readonly authorityAttestedStatusVerificationRequest: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest;
  readonly liveStatusVerificationInputs: SecretBirthCredentialVerificationLiveStatusInputs;
  readonly revokedSetStatusVerificationInputs: SecretBirthCredentialVerificationRevokedSetStatusInputs;
  readonly authorityAttestedStatusProtocolInputs: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs;
  readonly presentation: SecretBirthCredentialPresentation;
  readonly witness: {
    readonly holderSecret: Uint8Array;
    readonly holderSecretOpening: Uint8Array;
    readonly holderBindingBlindingFactor: Uint8Array;
    readonly holderBindingIssuerNonce: Uint8Array;
    readonly verifierDomainHash: Uint8Array;
    readonly subjectId: Uint8Array;
    readonly subjectOpening: Uint8Array;
    readonly legalNamePadded: Uint8Array;
    readonly legalNameOpening: Uint8Array;
    readonly birthDateDays: bigint;
    readonly birthDateOpening: Uint8Array;
    readonly birthCountryCodePadded: Uint8Array;
    readonly birthCountryCodeOpening: Uint8Array;
    readonly currentDay: bigint;
    readonly statusHandle: Uint8Array;
    readonly statusHandleOpening: Uint8Array;
    readonly statusRegistryId: Uint8Array;
    readonly statusRevokedRoot: Uint8Array;
    readonly statusRegistryVersion: bigint;
  };
};

export type DemoRevocationFixtureOptions = {
  readonly revokedStatusHandles?: readonly Uint8Array[];
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

const mod = (value: bigint): bigint => {
  const reduced = value % JUBJUB_SUBGROUP_ORDER;
  return reduced >= 0n ? reduced : reduced + JUBJUB_SUBGROUP_ORDER;
};

const contractAddress = (label: string): { bytes: Uint8Array } => ({
  bytes: sha256(`contract:${label}`),
});

const createProtocolEnvelope = (
  label: string,
  threadLabel: string,
): ProtocolMessageEnvelope => ({
  version: 1n,
  messageId: sha256(`protocol:message:${label}`),
  threadId: sha256(`protocol:thread:${threadLabel}`),
  initialMessage: true,
  respondsToMessageId: pureCircuits.noProtocolResponseReference(),
  createdAt: 1n,
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

export const signProof = ({
  bodyRoot,
  signer,
  createdAt,
  challengeHash,
  nonceScalar,
  context = "issuance",
}: {
  readonly bodyRoot: Uint8Array;
  readonly signer: Signer;
  readonly createdAt: bigint;
  readonly challengeHash: Uint8Array;
  readonly nonceScalar: bigint;
  readonly context?: "issuance" | "statusAttestation";
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
  const challenge =
    context === "issuance"
      ? pureCircuits.issuanceProofChallenge(bodyRoot, proof)
      : pureCircuits.statusAttestationProofChallenge(bodyRoot, proof);
  return {
    ...proof,
    signature: {
      r: proof.signature.r,
      s: mod(nonceScalar + challenge * signer.secretKey),
    },
  };
};

export const createDemoRevocationFixture = (
  options: DemoRevocationFixtureOptions = {},
): DemoRevocationFixture => {
  const issuer = createSigner("issuer", 123456789n);

  const witness = {
    holderSecret: sha256("holder-secret:alice"),
    holderSecretOpening: sha256("opening:holder-secret"),
    holderBindingBlindingFactor: sha256("blinding:holder-secret"),
    holderBindingIssuerNonce: sha256("issuer-nonce:birth-secret"),
    verifierDomainHash: sha256("verifier-domain:age-gateway.example"),
    subjectId: sha256("subject:alice"),
    subjectOpening: sha256("opening:subject"),
    legalNamePadded: padText("Alice Example"),
    legalNameOpening: sha256("opening:legal-name"),
    birthDateDays: 3650n,
    birthDateOpening: sha256("opening:birth-date"),
    birthCountryCodePadded: padText("CAN"),
    birthCountryCodeOpening: sha256("opening:birth-country"),
    currentDay: 3650n + 365n * 25n,
    statusHandle: sha256("status-handle:birth-secret:alice"),
    statusHandleOpening: sha256("opening:status-handle"),
    statusRegistryId: sha256("registry:birth-secret-status"),
    statusRevokedRoot: sha256("revoked-root:current"),
    statusRegistryVersion: 1n,
  };

  const claims = {
    subjectIdCommitment: pureCircuits.subjectIdCommitment(
      witness.subjectId,
      witness.subjectOpening,
    ),
    legalNameCommitment: pureCircuits.legalNameCommitment(
      witness.legalNamePadded,
      witness.legalNameOpening,
    ),
    birthDateCommitment: pureCircuits.birthDateCommitment(
      witness.birthDateDays,
      witness.birthDateOpening,
    ),
    birthCountryCodeCommitment: pureCircuits.birthCountryCodeCommitment(
      witness.birthCountryCodePadded,
      witness.birthCountryCodeOpening,
    ),
  };

  const credential: SecretBirthCredential = {
    version: 1n,
    schema: {
      packageId: padText("midnight-did:vc:birth-secret"),
      schemaId: padText("birth-credential:v1"),
      majorVersion: 1n,
      minorVersion: 0n,
    },
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      blindedHolderSecretCommitment: pureCircuits.blindedSecretHolderCommitment(
        pureCircuits.secretHolderBindingCommitment(
          witness.holderSecret,
          witness.holderSecretOpening,
        ),
        witness.holderBindingIssuerNonce,
        witness.holderBindingBlindingFactor,
      ),
      issuerNonce: witness.holderBindingIssuerNonce,
      requestChallengeResponse: pureCircuits.noSecretHolderChallengeResponse(),
    },
    statusBinding: {},
    issuedAt: 10_000n,
    hasExpiration: true,
    expiresAt: 20_000n,
    claims,
    claimRoot: pureCircuits.birthCredentialClaimRoot(claims),
  };

  const credentialProof = signProof({
    bodyRoot: pureCircuits.secretBirthCredentialBodyRoot(credential),
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:issuance"),
    nonceScalar: 11n,
  });

  const presentationRequest: SecretBirthCredentialPresentationRequest = {
    version: 1n,
    schema: credential.schema,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    requireSubjectIdCommitmentDisclosure: false,
    requireBirthCountryDisclosure: true,
    requireVerifierScopedPseudonym: true,
    verifierDomainHash: witness.verifierDomainHash,
    requireAgeOverThreshold: true,
    requestedAgeThresholdYears: 18n,
    verifierChallengeHash: sha256("challenge:verifier"),
  };

  const verificationRequest: SecretBirthCredentialVerificationRequest = {
    envelope: createProtocolEnvelope(
      "secret-presentation-request",
      "secret-birth-presentation",
    ),
    schema: credential.schema,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    holderBindingProfile: HolderBindingProfile.blindedSecretHolder,
    features: {
      supportsSelectiveDisclosure: true,
      supportsPredicateProofs: true,
      supportsVerifierScopedPseudonym: true,
      supportsSameHolderProof: true,
    },
    verifierChallengeHash: presentationRequest.verifierChallengeHash,
    body: {
      requireSubjectIdCommitmentDisclosure:
        presentationRequest.requireSubjectIdCommitmentDisclosure,
      requireBirthCountryDisclosure:
        presentationRequest.requireBirthCountryDisclosure,
      requireVerifierScopedPseudonym:
        presentationRequest.requireVerifierScopedPseudonym,
      verifierDomainHash: presentationRequest.verifierDomainHash,
      requireAgeOverThreshold: presentationRequest.requireAgeOverThreshold,
      requestedAgeThresholdYears:
        presentationRequest.requestedAgeThresholdYears,
    },
  };

  const statusHandleCommitment = pureCircuits.revokedSetStatusHandleCommitment(
    witness.statusHandle,
    witness.statusHandleOpening,
  );
  const statusBinding = {
    statusType: StatusType.revocationRegistry,
    registryRef: {
      registryId: witness.statusRegistryId,
      authorityVerificationMethodRef: issuer.verificationMethodRef,
    },
    statusHandleCommitment,
  };

  const statusCredential = {
    ...credential,
    statusBinding,
  } as SecretBirthStatusCredential;

  const statusBoundCredentialProof = signProof({
    bodyRoot: pureCircuits.secretBirthCredentialRegistryBoundStatusBodyRoot(
      statusCredential,
    ),
    signer: issuer,
    createdAt: credentialProof.createdAt,
    challengeHash: credentialProof.challengeHash,
    nonceScalar: 12n,
  });

  const credentialWithStatusBinding: SecretBirthCredentialWithStatusBinding = {
    credential: statusCredential,
    credentialProof: statusBoundCredentialProof,
  };

  const statusRequest: RevokedSetStatusRequest = {
    registryState: {
      registryId: witness.statusRegistryId,
      revokedRoot: witness.statusRevokedRoot,
      registryVersion: witness.statusRegistryVersion,
    },
    verifierChallengeHash: verificationRequest.verifierChallengeHash,
  };

  if (options.revokedStatusHandles) {
    assertStatusHandleNotRevoked(
      {
        registryState: statusRequest.registryState,
        revokedStatusHandles: options.revokedStatusHandles,
      },
      witness.statusHandle,
    );
  }

  const revokedSetStatusVerificationRequest: SecretBirthCredentialVerificationRevokedSetStatusRequest =
    {
      verificationRequest,
      statusPolicy: {
        requireStatus: true,
        acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
        enforceRegistryId: true,
        acceptedRegistryId: witness.statusRegistryId,
        enforceAttestationMaxAge: false,
        maxAttestationAge: 0n,
      },
      statusRequest,
    };

  const liveStatusVerificationRequest: SecretBirthCredentialVerificationLiveStatusRequest =
    {
      verificationRequest,
      statusPolicy: {
        requireStatus: true,
        acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
        enforceRegistryId: true,
        acceptedRegistryId: witness.statusRegistryId,
        // The live same-contract path does not consume an authority attestation.
        // These fields remain present because the status-policy surface is shared
        // across live, revoked-root, and authority-attested verification modes.
        enforceAttestationMaxAge: false,
        maxAttestationAge: 0n,
      },
    };

  const liveStatusVerificationInputs: SecretBirthCredentialVerificationLiveStatusInputs =
    {
      witnessInput: {
        statusHandle: witness.statusHandle,
        statusHandleOpening: witness.statusHandleOpening,
      },
    };

  const revokedSetStatusVerificationInputs: SecretBirthCredentialVerificationRevokedSetStatusInputs =
    {
      statusProofProtocol: {
        request: statusRequest,
        witnessInput: {
          registryState: {
            registryId: witness.statusRegistryId,
            revokedRoot: witness.statusRevokedRoot,
            registryVersion: witness.statusRegistryVersion,
          },
          statusHandle: witness.statusHandle,
          statusHandleOpening: witness.statusHandleOpening,
        },
      },
    };

  const authorityAttestedStatusVerificationRequest: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest =
    {
      verificationRequest,
      statusPolicy: {
        requireStatus: true,
        acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
        enforceRegistryId: true,
        acceptedRegistryId: witness.statusRegistryId,
        enforceAttestationMaxAge: true,
        maxAttestationAge: 50n,
      },
      statusRequest,
    };

  const statusAttestationStatement = {
    registryState: statusRequest.registryState,
    statusHandleCommitment:
      credentialWithStatusBinding.credential.statusBinding.statusHandleCommitment,
    verifierChallengeHash: statusRequest.verifierChallengeHash,
    hasExpiration: true,
    expiresAt: verificationRequest.envelope.createdAt + 100n,
  };

  const authorityAttestedStatusProtocolInputs: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs =
    {
      statusProofProtocol: {
        request: statusRequest,
        attestation: {
          statement: statusAttestationStatement,
          proof: signProof({
            bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(
              statusAttestationStatement,
            ),
            signer: issuer,
            createdAt: verificationRequest.envelope.createdAt + 1n,
            challengeHash: statusRequest.verifierChallengeHash,
            nonceScalar: 21n,
            context: "statusAttestation",
          }),
        },
      },
    };

  const presentation: SecretBirthCredentialPresentation = {
    version: 1n,
    schema: credential.schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    holderBinding: {
      blindedHolderSecretCommitment:
        credential.holderBinding.blindedHolderSecretCommitment,
      issuerNonce: credential.holderBinding.issuerNonce,
      requestChallengeResponse: pureCircuits.secretHolderBindingChallengeResponse(
        witness.holderSecret,
        presentationRequest.verifierChallengeHash,
      ),
    },
    disclosed: {
      revealSubjectIdCommitment: false,
      subjectIdCommitment: new Uint8Array(32),
      revealBirthCountryCode: true,
      birthCountryCodePadded: witness.birthCountryCodePadded,
      birthCountryCodeOpening: witness.birthCountryCodeOpening,
      revealVerifierScopedPseudonym: true,
      verifierScopedPseudonym: pureCircuits.verifierScopedPseudonym(
        witness.holderSecret,
        witness.verifierDomainHash,
      ),
      proveAgeOverThreshold: true,
      ageThresholdYears: 18n,
    },
  };

  return {
    issuer,
    credential,
    credentialProof,
    presentationRequest,
    verificationRequest,
    credentialWithStatusBinding,
    liveStatusVerificationRequest,
    revokedSetStatusVerificationRequest,
    authorityAttestedStatusVerificationRequest,
    liveStatusVerificationInputs,
    revokedSetStatusVerificationInputs,
    authorityAttestedStatusProtocolInputs,
    presentation,
    witness,
  };
};

export const fixtureRegistryState = (
  fixture: DemoRevocationFixture,
): RevocationRegistryState => ({
  registryId: fixture.witness.statusRegistryId,
  revokedRoot: fixture.witness.statusRevokedRoot,
  registryVersion: fixture.witness.statusRegistryVersion,
});

export const buildWrongAuthorityAttestedStatusProtocolInputs = (
  fixture: DemoRevocationFixture,
): SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs => {
  const wrongAuthority = createSigner("other-authority", 444n);
  const statement =
    fixture.authorityAttestedStatusProtocolInputs.statusProofProtocol
      .attestation.statement;

  return {
    statusProofProtocol: {
      ...fixture.authorityAttestedStatusProtocolInputs.statusProofProtocol,
      attestation: {
        ...fixture.authorityAttestedStatusProtocolInputs.statusProofProtocol
          .attestation,
        proof: signProof({
          bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(
            statement,
          ),
          signer: wrongAuthority,
          createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
          challengeHash:
            fixture.authorityAttestedStatusVerificationRequest.statusRequest
              .verifierChallengeHash,
          nonceScalar: 37n,
          context: "statusAttestation",
        }),
      },
    },
  };
};

const verificationMessageEnvelope = (
  request: SecretBirthCredentialVerificationRequest,
): ProtocolMessageEnvelope => ({
  ...request.envelope,
  initialMessage: false,
  respondsToMessageId: request.envelope.messageId,
  messageId: new Uint8Array(32).fill(99),
  createdAt: request.envelope.createdAt + 2n,
});

export const buildSubmissionForVerificationRequest = (
  fixture: DemoRevocationFixture,
  request: SecretBirthCredentialVerificationRequest,
): SecretBirthCredentialVerificationSubmission => ({
  envelope: verificationMessageEnvelope(request),
  schema: fixture.credential.schema,
  issuerVerificationMethodRef: fixture.credential.issuerVerificationMethodRef,
  holderBindingProfile: request.holderBindingProfile,
  challengeHash: request.verifierChallengeHash,
  body: {
    credential: fixture.credential,
    credentialProof: fixture.credentialProof,
    presentation: {
      ...fixture.presentation,
      holderBinding: {
        ...fixture.presentation.holderBinding,
        requestChallengeResponse:
          fixture.presentation.holderBinding.requestChallengeResponse,
      },
      disclosed: {
        ...fixture.presentation.disclosed,
        ageThresholdYears: request.body.requestedAgeThresholdYears,
      },
    },
  },
});

export const buildSubmissionForRevokedSetRequest = (
  fixture: DemoRevocationFixture,
  request: SecretBirthCredentialVerificationRevokedSetStatusRequest,
): SecretBirthCredentialVerificationSubmission =>
  buildSubmissionForVerificationRequest(fixture, request.verificationRequest);

export const buildSubmissionForLiveStatusRequest = (
  fixture: DemoRevocationFixture,
  request: SecretBirthCredentialVerificationLiveStatusRequest,
): SecretBirthCredentialVerificationSubmission =>
  buildSubmissionForVerificationRequest(fixture, request.verificationRequest);

export const buildSubmissionForAuthorityAttestedRequest = (
  fixture: DemoRevocationFixture,
  request: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
): SecretBirthCredentialVerificationSubmission =>
  buildSubmissionForVerificationRequest(fixture, request.verificationRequest);
