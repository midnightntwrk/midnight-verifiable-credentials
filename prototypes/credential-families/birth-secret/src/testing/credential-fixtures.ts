import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import {
  HolderBindingProfile,
  type Proof,
  type ProtocolMessageEnvelope,
  pureCircuits as genericPureCircuits,
  type RegistryBoundStatusBinding,
  StatusType,
  type VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import { assertStatusHandleNotRevoked } from "@midnight-ntwrk/midnight-did-credentials-status-registry";

import {
  type AuthorityAttestedStatusProofProtocol,
  pureCircuits,
  type RevokedSetNonMembershipStatusProofProtocol,
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
  StatusCapabilityKind,
} from "../managed/secret-birth-credential/contract/index.js";

const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

export type Signer = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

export type SecretBirthStatusCredentialCompat = SecretBirthCredential & {
  readonly statusBinding: RegistryBoundStatusBinding;
};

type SecretBirthCredentialCompat = Omit<
  SecretBirthCredential,
  "statusBinding"
> & {
  readonly statusBinding?: RegistryBoundStatusBinding | Record<string, never>;
};

export type SecretBirthCredentialWithStatusBindingCompat = {
  readonly credential: SecretBirthStatusCredentialCompat;
  readonly statusBinding: RegistryBoundStatusBinding;
  readonly credentialProof: Proof;
};

export type BirthCredentialFixture = {
  readonly issuer: Signer;
  readonly credential: SecretBirthCredential;
  readonly credentialProof: Proof;
  readonly presentationRequest: SecretBirthCredentialPresentationRequest;
  readonly verificationRequest: SecretBirthCredentialVerificationRequest;
  readonly credentialWithStatusBinding: SecretBirthCredentialWithStatusBindingCompat;
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

export type SecretBirthCredentialFixtureOptions = {
  readonly issuerLabel?: string;
  readonly issuerSecretKey?: bigint;
  readonly holderSecret?: Uint8Array;
  readonly holderSecretOpening?: Uint8Array;
  readonly holderBindingBlindingFactor?: Uint8Array;
  readonly holderBindingIssuerNonce?: Uint8Array;
  readonly verifierDomainHash?: Uint8Array;
  readonly subjectId?: Uint8Array;
  readonly subjectOpening?: Uint8Array;
  readonly legalNamePadded?: Uint8Array;
  readonly legalNameOpening?: Uint8Array;
  readonly birthDateDays?: bigint;
  readonly birthDateOpening?: Uint8Array;
  readonly birthCountryCodePadded?: Uint8Array;
  readonly birthCountryCodeOpening?: Uint8Array;
  readonly currentDay?: bigint;
  readonly statusHandle?: Uint8Array;
  readonly statusHandleOpening?: Uint8Array;
  readonly statusRegistryId?: Uint8Array;
  readonly statusRevokedRoot?: Uint8Array;
  readonly statusRegistryVersion?: bigint;
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
  respondsToMessageId: genericPureCircuits.noProtocolResponseReference(),
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
      ? genericPureCircuits.issuanceProofChallenge(bodyRoot, proof)
      : genericPureCircuits.statusAttestationProofChallenge(bodyRoot, proof);
  return {
    ...proof,
    signature: {
      r: proof.signature.r,
      s: mod(nonceScalar + challenge * signer.secretKey),
    },
  };
};

const secretBirthCredentialRegistryBoundStatusBodyRootCompat = (
  credential: SecretBirthStatusCredentialCompat,
): Uint8Array => {
  const bodyRoot =
    pureCircuits.secretBirthCredentialRegistryBoundStatusBodyRoot as unknown as (
      ...args: unknown[]
    ) => Uint8Array;

  try {
    return bodyRoot(
      credential as SecretBirthCredential,
      credential.statusBinding,
    );
  } catch {
    return bodyRoot(credential);
  }
};

export const createSecretBirthCredentialFixture = (
  options: SecretBirthCredentialFixtureOptions = {},
): BirthCredentialFixture => {
  const issuer = createSigner(
    options.issuerLabel ?? "issuer",
    options.issuerSecretKey ?? 123456789n,
  );

  const witness = {
    holderSecret: options.holderSecret ?? sha256("holder-secret:alice"),
    holderSecretOpening:
      options.holderSecretOpening ?? sha256("opening:holder-secret"),
    holderBindingBlindingFactor:
      options.holderBindingBlindingFactor ?? sha256("blinding:holder-secret"),
    holderBindingIssuerNonce:
      options.holderBindingIssuerNonce ?? sha256("issuer-nonce:birth-secret"),
    verifierDomainHash:
      options.verifierDomainHash ??
      sha256("verifier-domain:age-gateway.example"),
    subjectId: options.subjectId ?? sha256("subject:alice"),
    subjectOpening: options.subjectOpening ?? sha256("opening:subject"),
    legalNamePadded: options.legalNamePadded ?? padText("Alice Example"),
    legalNameOpening: options.legalNameOpening ?? sha256("opening:legal-name"),
    birthDateDays: options.birthDateDays ?? 3650n,
    birthDateOpening: options.birthDateOpening ?? sha256("opening:birth-date"),
    birthCountryCodePadded: options.birthCountryCodePadded ?? padText("CAN"),
    birthCountryCodeOpening:
      options.birthCountryCodeOpening ?? sha256("opening:birth-country"),
    currentDay: options.currentDay ?? 3650n + 365n * 25n,
    statusHandle:
      options.statusHandle ?? sha256("status-handle:birth-secret:alice"),
    statusHandleOpening:
      options.statusHandleOpening ?? sha256("opening:status-handle"),
    statusRegistryId:
      options.statusRegistryId ?? sha256("registry:birth-secret-status"),
    statusRevokedRoot:
      options.statusRevokedRoot ?? sha256("revoked-root:current"),
    statusRegistryVersion: options.statusRegistryVersion ?? 1n,
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

  const credential: SecretBirthCredentialCompat = {
    version: 1n,
    schema: {
      packageId: padText("midnight-did:vc:birth-secret"),
      schemaId: padText("birth-credential:v1"),
      majorVersion: 1n,
      minorVersion: 0n,
    },
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      blindedHolderSecretCommitment:
        genericPureCircuits.blindedSecretHolderCommitment(
          genericPureCircuits.secretHolderBindingCommitment(
            witness.holderSecret,
            witness.holderSecretOpening,
          ),
          witness.holderBindingIssuerNonce,
          witness.holderBindingBlindingFactor,
        ),
      issuerNonce: witness.holderBindingIssuerNonce,
      requestChallengeResponse:
        genericPureCircuits.noSecretHolderChallengeResponse(),
    },
    statusBinding: {},
    issuedAt: 10_000n,
    hasExpiration: true,
    expiresAt: 20_000n,
    claims,
    claimRoot: pureCircuits.birthCredentialClaimRoot(claims),
  };

  const credentialProof = signProof({
    bodyRoot: pureCircuits.secretBirthCredentialBodyRoot(
      credential as SecretBirthCredential,
    ),
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

  const statusBinding: RegistryBoundStatusBinding = {
    statusType: StatusType.revocationRegistry,
    registryRef: {
      registryId: witness.statusRegistryId,
      authorityVerificationMethodRef: issuer.verificationMethodRef,
    },
    statusHandleCommitment: pureCircuits.revokedSetStatusHandleCommitment(
      witness.statusHandle,
      witness.statusHandleOpening,
    ),
  };

  const statusCredential: SecretBirthStatusCredentialCompat = {
    ...(credential as SecretBirthCredential),
    statusBinding,
  };

  const statusBoundCredentialProof = signProof({
    bodyRoot:
      secretBirthCredentialRegistryBoundStatusBodyRootCompat(statusCredential),
    signer: issuer,
    createdAt: credentialProof.createdAt,
    challengeHash: credentialProof.challengeHash,
    nonceScalar: 12n,
  });

  const credentialWithStatusBinding: SecretBirthCredentialWithStatusBindingCompat =
    {
      credential: statusCredential,
      statusBinding,
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

  const revokedSetStatusProofProtocol: RevokedSetNonMembershipStatusProofProtocol =
    {
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
    };

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
      statusProofProtocol: revokedSetStatusProofProtocol,
    };

  const authorityAttestedStatusVerificationRequest: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest =
    {
      verificationRequest,
      statusPolicy: {
        requireStatus: true,
        acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
        enforceRegistryId: true,
        acceptedRegistryId: witness.statusRegistryId,
        enforceAttestationMaxAge: false,
        maxAttestationAge: 0n,
      },
      statusRequest,
    };

  const statusAttestationStatement = {
    registryState: statusRequest.registryState,
    statusHandleCommitment: statusBinding.statusHandleCommitment,
    verifierChallengeHash: statusRequest.verifierChallengeHash,
    hasExpiration: true,
    expiresAt: verificationRequest.envelope.createdAt + 100n,
  };

  const authorityAttestedStatusProofProtocol: AuthorityAttestedStatusProofProtocol =
    {
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
    };

  const authorityAttestedStatusProtocolInputs: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs =
    {
      statusProofProtocol: authorityAttestedStatusProofProtocol,
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
      requestChallengeResponse:
        genericPureCircuits.secretHolderBindingChallengeResponse(
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
      verifierScopedPseudonym: genericPureCircuits.verifierScopedPseudonym(
        witness.holderSecret,
        witness.verifierDomainHash,
      ),
      proveAgeOverThreshold: true,
      ageThresholdYears: 18n,
    },
  };

  return {
    issuer,
    credential: credential as SecretBirthCredential,
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
