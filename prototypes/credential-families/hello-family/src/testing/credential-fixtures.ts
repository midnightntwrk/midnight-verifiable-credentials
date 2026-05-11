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
  type HelloFamilyClaims,
  type HelloFamilyCredential,
  type HelloFamilyPresentation,
  type HelloFamilyPresentationRequest,
  pureCircuits,
} from "../managed/hello-family-credential/contract/index.js";

// NOTE: Jubjub subgroup order used by the Compact proof challenge/signature math.
const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

type Signer = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

type ProofContext = "issuance" | "presentation";

export type HelloFamilyFixture = {
  readonly issuer: Signer;
  readonly holder: Signer;
  readonly credential: HelloFamilyCredential;
  readonly credentialProof: Proof;
  readonly presentationRequest: HelloFamilyPresentationRequest;
  readonly presentation: HelloFamilyPresentation;
  readonly presentationProof: Proof;
};

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > length) {
    throw new Error(`Text value exceeds ${length}-byte fixture padding limit`);
  }
  if (bytes.length === length) {
    return bytes;
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

const createSigner = (
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

const deriveProofChallenge = (
  bodyRoot: Uint8Array,
  proof: Proof,
  context: ProofContext,
): bigint =>
  context === "issuance"
    ? genericPureCircuits.issuanceProofChallenge(bodyRoot, proof)
    : genericPureCircuits.presentationProofChallenge(bodyRoot, proof);

const signProof = ({
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

const createHelloFamilyClaims = (): HelloFamilyClaims => ({
  booleanValue: true,
  smallUintValue: 7n,
  bigUnsignedValue: 1234567890123456789n,
  bytesValue: padText("hello-family-bytes", 32),
  fieldValue: 42n,
  booleanVector: [true, false],
  uintVector: [10n, 20n],
  bytesVector: [padText("alpha", 16), padText("beta", 16)],
  fieldVector: [5n, 8n],
});

export const createHelloFamilyFixture = ({
  revealBytesValue = false,
  requireBytesValueDisclosure = revealBytesValue,
  verifierChallengeHash = sha256("challenge:hello-family"),
}: {
  readonly revealBytesValue?: boolean;
  readonly requireBytesValueDisclosure?: boolean;
  readonly verifierChallengeHash?: Uint8Array;
} = {}): HelloFamilyFixture => {
  // NOTE: callers that build their own verifier request must reuse this
  // challenge, otherwise the presentation proof will fail challenge binding.
  const issuer = createSigner("hello-family-issuer", 123456789n);
  const holder = createSigner("hello-family-holder", 987654321n);
  const claims = createHelloFamilyClaims();

  const credential: HelloFamilyCredential = {
    version: 1n,
    schema: {
      packageId: padText("midnight:vc:hello-family"),
      schemaId: padText("hello-family:v1"),
      majorVersion: 1n,
      minorVersion: 0n,
    },
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: holder.verificationMethodRef,
    },
    statusBinding: {},
    issuedAt: 10_000n,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimRoot: pureCircuits.helloFamilyClaimRoot(claims),
  };

  const credentialProof = signProof({
    bodyRoot: pureCircuits.helloFamilyCredentialBodyRoot(credential),
    context: "issuance",
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:hello-family:issuance"),
    nonceScalar: 11n,
  });

  const presentationRequest: HelloFamilyPresentationRequest = {
    version: 1n,
    schema: credential.schema,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    requireBooleanValueDisclosure: true,
    requireBytesValueDisclosure,
    requireBigUnsignedValueDisclosure: true,
    verifierChallengeHash,
  };

  const presentation: HelloFamilyPresentation = {
    version: 1n,
    schema: credential.schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    holderBinding: credential.holderBinding,
    disclosed: {
      revealBooleanValue: true,
      booleanValue: claims.booleanValue,
      revealBytesValue,
      bytesValue: revealBytesValue ? claims.bytesValue : new Uint8Array(32),
      revealBigUnsignedValue: true,
      bigUnsignedValue: claims.bigUnsignedValue,
    },
  };

  const presentationProof = signProof({
    bodyRoot: pureCircuits.helloFamilyPresentationBodyRoot(presentation),
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
  };
};
