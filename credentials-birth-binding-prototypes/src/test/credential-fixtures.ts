import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";

import {
  HolderBindingProfile,
  type Proof,
  pureCircuits as genericPureCircuits,
  type VerificationMethodRef,
} from "../../../credentials/src/managed/credentials/contract/index.js";
import {
  type BirthCredentialClaims,
  type BirthCredentialDisclosures,
  type BirthCredentialPresentationRequest,
  pureCircuits as birthPureCircuits,
} from "../../../credentials-birth/src/managed/birth-credential/contract/index.js";
import {
  type BirthBlindedSecretCredential,
  type BirthBlindedSecretPresentation,
  type BirthExplicitCredential,
  type BirthExplicitPresentation,
  type BirthJubjubCredential,
  type BirthJubjubPresentation,
  type BirthOffchainCredential,
  type BirthOffchainPresentation,
  type BirthSecretCredential,
  type BirthSecretPresentation,
  pureCircuits,
} from "../managed/birth-binding-prototypes/contract/index.js";

const JUBJUB_FIELD_MODULUS =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

export type Signer = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

const OFFCHAIN_METHOD_ID_DOMAIN = "midnight:offchain:holder-method-id:v1";

const hashOffchainMethodId = (normalizedFragment: string): Uint8Array =>
  new Uint8Array(
    createHash("sha256")
      .update(OFFCHAIN_METHOD_ID_DOMAIN)
      .update("\0")
      .update(new TextEncoder().encode(normalizedFragment))
      .digest(),
  );

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
  const reduced = value % JUBJUB_FIELD_MODULUS;
  return reduced >= 0n ? reduced : reduced + JUBJUB_FIELD_MODULUS;
};

const contractAddress = (label: string): { bytes: Uint8Array } => ({
  bytes: sha256(`contract:${label}`),
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

const signProof = ({
  bodyRoot,
  signer,
  createdAt,
  challengeHash,
  nonceScalar,
  context,
}: {
  readonly bodyRoot: Uint8Array;
  readonly signer: Signer;
  readonly createdAt: bigint;
  readonly challengeHash: Uint8Array;
  readonly nonceScalar: bigint;
  readonly context: "issuance" | "presentation";
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
      : genericPureCircuits.presentationProofChallenge(bodyRoot, proof);
  return {
    ...proof,
    signature: {
      r: proof.signature.r,
      s: mod(nonceScalar + challenge * signer.secretKey),
    },
  };
};

const schema = {
  packageId: padText("midnight-did:vc:birth-proto"),
  schemaId: padText("birth-bindings:v1"),
  majorVersion: 1n,
  minorVersion: 0n,
};

const createBirthWitness = () => ({
  subjectId: sha256("subject:alice"),
  subjectOpening: sha256("opening:subject"),
  legalNamePadded: padText("Alice Example"),
  legalNameOpening: sha256("opening:legal-name"),
  birthDateDays: 3650n,
  birthDateOpening: sha256("opening:birth-date"),
  birthCountryCodePadded: padText("CAN"),
  birthCountryCodeOpening: sha256("opening:birth-country"),
  verifierChallengeHash: sha256("challenge:verifier"),
  holderSecret: sha256("holder-secret:alice"),
  holderSecretOpening: sha256("opening:holder-secret"),
  holderBindingBlindingFactor: sha256("blinding:holder-secret"),
  issuerNonce: sha256("issuer-nonce:birth-prototypes"),
});

const createBirthClaims = (
  witness: ReturnType<typeof createBirthWitness>,
): BirthCredentialClaims => ({
  subjectIdCommitment: birthPureCircuits.subjectIdCommitment(
    witness.subjectId,
    witness.subjectOpening,
  ),
  legalNameCommitment: birthPureCircuits.legalNameCommitment(
    witness.legalNamePadded,
    witness.legalNameOpening,
  ),
  birthDateCommitment: birthPureCircuits.birthDateCommitment(
    witness.birthDateDays,
    witness.birthDateOpening,
  ),
  birthCountryCodeCommitment: birthPureCircuits.birthCountryCodeCommitment(
    witness.birthCountryCodePadded,
    witness.birthCountryCodeOpening,
  ),
});

const createPresentationRequest = (
  issuerVerificationMethodRef: VerificationMethodRef,
  verifierChallengeHash: Uint8Array,
): BirthCredentialPresentationRequest => ({
  version: 1n,
  schema,
  issuerVerificationMethodRef,
  requireSubjectIdCommitmentDisclosure: false,
  requireBirthCountryDisclosure: true,
  requireAgeOverThreshold: true,
  requestedAgeThresholdYears: 18n,
  verifierChallengeHash,
});

const createBirthDisclosures = (
  witness: ReturnType<typeof createBirthWitness>,
): BirthCredentialDisclosures => ({
  revealSubjectIdCommitment: true,
  subjectIdCommitment: birthPureCircuits.subjectIdCommitment(
    witness.subjectId,
    witness.subjectOpening,
  ),
  revealBirthCountryCode: true,
  birthCountryCodePadded: witness.birthCountryCodePadded,
  birthCountryCodeOpening: witness.birthCountryCodeOpening,
  proveAgeOverThreshold: true,
  ageThresholdYears: 18n,
});

export const createExplicitBirthPrototypeFixture = () => {
  const issuer = createSigner("issuer", 123456789n);
  const holder = createSigner("holder", 987654321n);
  const witness = createBirthWitness();
  const claims = createBirthClaims(witness);
  const credential: BirthExplicitCredential = {
    version: 1n,
    schema,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: holder.verificationMethodRef,
    },
    issuedAt: 10_000n,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimRoot: birthPureCircuits.birthCredentialClaimRoot(claims),
  };
  const credentialProof = signProof({
    bodyRoot: pureCircuits.birthExplicitCredentialBodyRoot(credential),
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:issuance-explicit"),
    nonceScalar: 11n,
    context: "issuance",
  });
  const presentation: BirthExplicitPresentation = {
    version: 1n,
    schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: holder.verificationMethodRef,
    },
    disclosed: createBirthDisclosures(witness),
  };
  const presentationProof = signProof({
    bodyRoot: pureCircuits.birthExplicitPresentationBodyRoot(presentation),
    signer: holder,
    createdAt: 10_002n,
    challengeHash: witness.verifierChallengeHash,
    nonceScalar: 12n,
    context: "presentation",
  });
  return {
    issuer,
    holder,
    witness,
    credential,
    credentialProof,
    presentationRequest: createPresentationRequest(
      issuer.verificationMethodRef,
      witness.verifierChallengeHash,
    ),
    presentation,
    presentationProof,
  };
};

export const createJubjubBirthPrototypeFixture = () => {
  const issuer = createSigner("issuer", 123456789n);
  const holder = createSigner("holder", 987654321n);
  const witness = createBirthWitness();
  const claims = createBirthClaims(witness);
  const credential: BirthJubjubCredential = {
    version: 1n,
    schema,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: { holderPublicKey: holder.publicKey },
    issuedAt: 10_000n,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimRoot: birthPureCircuits.birthCredentialClaimRoot(claims),
  };
  const credentialProof = signProof({
    bodyRoot: pureCircuits.birthJubjubCredentialBodyRoot(credential),
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:issuance-jubjub"),
    nonceScalar: 13n,
    context: "issuance",
  });
  const presentation: BirthJubjubPresentation = {
    version: 1n,
    schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: { holderPublicKey: holder.publicKey },
    disclosed: createBirthDisclosures(witness),
  };
  const presentationProof = signProof({
    bodyRoot: pureCircuits.birthJubjubPresentationBodyRoot(presentation),
    signer: holder,
    createdAt: 10_002n,
    challengeHash: witness.verifierChallengeHash,
    nonceScalar: 14n,
    context: "presentation",
  });
  return {
    issuer,
    holder,
    witness,
    credential,
    credentialProof,
    presentationRequest: createPresentationRequest(
      issuer.verificationMethodRef,
      witness.verifierChallengeHash,
    ),
    presentation,
    presentationProof,
  };
};

export const createOffchainBirthPrototypeFixture = () => {
  const issuer = createSigner("issuer", 123456789n);
  const holder = createSigner("holder", 987654321n);
  const witness = createBirthWitness();
  const claims = createBirthClaims(witness);
  const credential: BirthOffchainCredential = {
    version: 1n,
    schema,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderDidStateHash: sha256("offchain-state:holder"),
      holderMethodId: hashOffchainMethodId("#holder-key-1"),
      holderPublicKey: holder.publicKey,
    },
    issuedAt: 10_000n,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimRoot: birthPureCircuits.birthCredentialClaimRoot(claims),
  };
  const credentialProof = signProof({
    bodyRoot: pureCircuits.birthOffchainCredentialBodyRoot(credential),
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:issuance-offchain"),
    nonceScalar: 15n,
    context: "issuance",
  });
  const presentation: BirthOffchainPresentation = {
    version: 1n,
    schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: credential.holderBinding,
    disclosed: createBirthDisclosures(witness),
  };
  const presentationProof = signProof({
    bodyRoot: pureCircuits.birthOffchainPresentationBodyRoot(presentation),
    signer: holder,
    createdAt: 10_002n,
    challengeHash: witness.verifierChallengeHash,
    nonceScalar: 16n,
    context: "presentation",
  });
  return {
    issuer,
    holder,
    witness,
    credential,
    credentialProof,
    presentationRequest: createPresentationRequest(
      issuer.verificationMethodRef,
      witness.verifierChallengeHash,
    ),
    presentation,
    presentationProof,
  };
};

export const createSecretBirthPrototypeFixture = () => {
  const issuer = createSigner("issuer", 123456789n);
  const witness = createBirthWitness();
  const claims = createBirthClaims(witness);
  const holderSecretCommitment =
    genericPureCircuits.secretHolderBindingCommitment(
      witness.holderSecret,
      witness.holderSecretOpening,
    );
  const credential: BirthSecretCredential = {
    version: 1n,
    schema,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderSecretCommitment,
      requestChallengeResponse:
        genericPureCircuits.noSecretHolderChallengeResponse(),
    },
    issuedAt: 10_000n,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimRoot: birthPureCircuits.birthCredentialClaimRoot(claims),
  };
  const credentialProof = signProof({
    bodyRoot: pureCircuits.birthSecretCredentialBodyRoot(credential),
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:issuance-secret"),
    nonceScalar: 17n,
    context: "issuance",
  });
  const presentation: BirthSecretPresentation = {
    version: 1n,
    schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderSecretCommitment,
      requestChallengeResponse:
        genericPureCircuits.secretHolderBindingChallengeResponse(
          witness.holderSecret,
          witness.verifierChallengeHash,
        ),
    },
    disclosed: createBirthDisclosures(witness),
  };
  return {
    issuer,
    witness,
    credential,
    credentialProof,
    presentationRequest: createPresentationRequest(
      issuer.verificationMethodRef,
      witness.verifierChallengeHash,
    ),
    presentation,
  };
};

export const createBlindedSecretBirthPrototypeFixture = () => {
  const issuer = createSigner("issuer", 123456789n);
  const witness = createBirthWitness();
  const claims = createBirthClaims(witness);
  const holderSecretCommitment =
    genericPureCircuits.secretHolderBindingCommitment(
      witness.holderSecret,
      witness.holderSecretOpening,
    );
  const credential: BirthBlindedSecretCredential = {
    version: 1n,
    schema,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      blindedHolderSecretCommitment:
        genericPureCircuits.blindedSecretHolderCommitment(
          holderSecretCommitment,
          witness.issuerNonce,
          witness.holderBindingBlindingFactor,
        ),
      issuerNonce: witness.issuerNonce,
      requestChallengeResponse:
        genericPureCircuits.noSecretHolderChallengeResponse(),
    },
    issuedAt: 10_000n,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimRoot: birthPureCircuits.birthCredentialClaimRoot(claims),
  };
  const credentialProof = signProof({
    bodyRoot: pureCircuits.birthBlindedSecretCredentialBodyRoot(credential),
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:issuance-blinded"),
    nonceScalar: 18n,
    context: "issuance",
  });
  const presentation: BirthBlindedSecretPresentation = {
    version: 1n,
    schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      blindedHolderSecretCommitment:
        credential.holderBinding.blindedHolderSecretCommitment,
      issuerNonce: witness.issuerNonce,
      requestChallengeResponse:
        genericPureCircuits.secretHolderBindingChallengeResponse(
          witness.holderSecret,
          witness.verifierChallengeHash,
        ),
    },
    disclosed: createBirthDisclosures(witness),
  };
  return {
    issuer,
    witness,
    credential,
    credentialProof,
    presentationRequest: createPresentationRequest(
      issuer.verificationMethodRef,
      witness.verifierChallengeHash,
    ),
    presentation,
  };
};
