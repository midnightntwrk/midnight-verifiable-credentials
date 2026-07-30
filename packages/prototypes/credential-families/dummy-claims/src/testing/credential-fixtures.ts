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
  type DummyClaims,
  type DummyClaimsCredential,
  type DummyClaimsPresentation,
  type DummyClaimsPresentationRequest,
  type DummyNestedClaims,
  pureCircuits,
} from "../managed/dummy-claims-credential/contract/index.js";

// WARNING: deterministic fixture material only. Fixed signer keys and nonce
// salts here are for tests and local compiler probes, not production flows.
const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

type Signer = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

type ProofContext = "issuance" | "presentation";

type DummyClaimsDisclosureOptions = {
  readonly revealByteSizedUnsignedValue?: boolean;
  readonly revealBytes32Value?: boolean;
  readonly revealFieldVector?: boolean;
  readonly revealNestedValue?: boolean;
  readonly revealNestedBooleanValue?: boolean;
  readonly revealNestedBigUnsignedValue?: boolean;
  readonly revealNestedBytesValue?: boolean;
  readonly revealNestedFieldValue?: boolean;
  readonly revealNestedVector?: boolean;
};

type DummyClaimsRequestOptions = {
  readonly requireByteSizedUnsignedValueDisclosure?: boolean;
  readonly requireBytes32ValueDisclosure?: boolean;
  readonly requireFieldVectorDisclosure?: boolean;
  readonly requireNestedValueDisclosure?: boolean;
  readonly requireNestedBooleanValueDisclosure?: boolean;
  readonly requireNestedBigUnsignedValueDisclosure?: boolean;
  readonly requireNestedBytesValueDisclosure?: boolean;
  readonly requireNestedFieldValueDisclosure?: boolean;
  readonly requireNestedVectorDisclosure?: boolean;
};

export type DummyClaimsFixture = {
  readonly issuer: Signer;
  readonly holder: Signer;
  readonly claims: DummyClaims;
  readonly credential: DummyClaimsCredential;
  readonly credentialProof: Proof;
  readonly presentationRequest: DummyClaimsPresentationRequest;
  readonly presentation: DummyClaimsPresentation;
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
}: {
  readonly bodyRoot: Uint8Array;
  readonly context: ProofContext;
  readonly signer: Signer;
  readonly createdAt: bigint;
  readonly challengeHash: Uint8Array;
}): Proof => {
  // NOTE: distinct deterministic nonce salts keep issuance and presentation
  // transcripts separated in the test fixtures.
  const nonceScalar =
    context === "issuance" ? 19n + signer.secretKey : 23n + signer.secretKey;
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

const createDummyNestedClaims = (): DummyNestedClaims => ({
  booleanValue: true,
  bigUnsignedValue: 999999999999999999n,
  bytesValue: padText("nested-bytes", 16),
  fieldValue: 88n,
});

export const createDummyClaimsFixture = ({
  verifierChallengeHash = sha256("challenge:dummy-claims"),
  disclosure = {},
  request = {},
}: {
  readonly verifierChallengeHash?: Uint8Array;
  readonly disclosure?: DummyClaimsDisclosureOptions;
  readonly request?: DummyClaimsRequestOptions;
} = {}): DummyClaimsFixture => {
  const issuer = createSigner("dummy-claims-issuer", 123123123n);
  const holder = createSigner("dummy-claims-holder", 321321321n);
  const nestedValue = createDummyNestedClaims();
  const claims: DummyClaims = {
    booleanValue: true,
    byteSizedUnsignedValue: 8n,
    mediumUnsignedValue: 64n,
    bigUnsignedValue: 248248248248248248n,
    bytes16Value: padText("bytes-16-value", 16),
    bytes32Value: padText("bytes-32-value"),
    fieldValue: 42n,
    booleanVector: [true, false],
    uintVector: [10n, 20n],
    bytesVector: [padText("alpha", 16), padText("beta", 16)],
    fieldVector: [5n, 8n],
    nestedValue,
    nestedVector: [
      nestedValue,
      {
        booleanValue: false,
        bigUnsignedValue: 555555555555555555n,
        bytesValue: padText("second-nested", 16),
        fieldValue: 99n,
      },
    ],
  };

  const credential: DummyClaimsCredential = {
    version: 1n,
    schema: {
      packageId: padText("midnight:vc:dummy-claims"),
      schemaId: padText("dummy-claims:v1"),
      majorVersion: 1n,
      minorVersion: 0n,
    },
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: holder.verificationMethodRef,
    },
    statusBinding: {},
    issuedAt: 30_000n,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimCommitments: {},
    claimRoot: pureCircuits.dummyClaimsRoot(claims),
  };

  const credentialProof = signProof({
    bodyRoot: pureCircuits.dummyClaimsCredentialBodyRoot(credential),
    context: "issuance",
    signer: issuer,
    createdAt: 30_001n,
    challengeHash: sha256("challenge:dummy-claims:issuance"),
  });

  const revealByteSizedUnsignedValue =
    disclosure.revealByteSizedUnsignedValue ?? true;
  const revealBytes32Value = disclosure.revealBytes32Value ?? true;
  const revealFieldVector = disclosure.revealFieldVector ?? true;
  const revealNestedValue = disclosure.revealNestedValue ?? true;
  const revealNestedBooleanValue =
    disclosure.revealNestedBooleanValue ?? revealNestedValue;
  const revealNestedBigUnsignedValue =
    disclosure.revealNestedBigUnsignedValue ?? revealNestedValue;
  const revealNestedBytesValue =
    disclosure.revealNestedBytesValue ?? revealNestedValue;
  const revealNestedFieldValue =
    disclosure.revealNestedFieldValue ?? revealNestedValue;
  const revealNestedVector = disclosure.revealNestedVector ?? true;

  const presentationRequest: DummyClaimsPresentationRequest = {
    version: 1n,
    schema: credential.schema,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    requireBooleanValueDisclosure: true,
    requireByteSizedUnsignedValueDisclosure:
      request.requireByteSizedUnsignedValueDisclosure ??
      revealByteSizedUnsignedValue,
    requireMediumUnsignedValueDisclosure: true,
    requireBigUnsignedValueDisclosure: true,
    requireBytes16ValueDisclosure: true,
    requireBytes32ValueDisclosure:
      request.requireBytes32ValueDisclosure ?? revealBytes32Value,
    requireFieldValueDisclosure: true,
    requireBooleanVectorDisclosure: true,
    requireUintVectorDisclosure: true,
    requireBytesVectorDisclosure: true,
    requireFieldVectorDisclosure:
      request.requireFieldVectorDisclosure ?? revealFieldVector,
    requireNestedValueDisclosure:
      request.requireNestedValueDisclosure ??
      (revealNestedValue ||
        revealNestedBooleanValue ||
        revealNestedBigUnsignedValue ||
        revealNestedBytesValue ||
        revealNestedFieldValue),
    requireNestedBooleanValueDisclosure:
      request.requireNestedBooleanValueDisclosure ?? revealNestedBooleanValue,
    requireNestedBigUnsignedValueDisclosure:
      request.requireNestedBigUnsignedValueDisclosure ??
      revealNestedBigUnsignedValue,
    requireNestedBytesValueDisclosure:
      request.requireNestedBytesValueDisclosure ?? revealNestedBytesValue,
    requireNestedFieldValueDisclosure:
      request.requireNestedFieldValueDisclosure ?? revealNestedFieldValue,
    requireNestedVectorDisclosure:
      request.requireNestedVectorDisclosure ?? revealNestedVector,
    verifierChallengeHash,
  };

  const presentation: DummyClaimsPresentation = {
    version: 1n,
    schema: credential.schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    holderBinding: credential.holderBinding,
    disclosed: {
      revealBooleanValue: true,
      booleanValue: claims.booleanValue,
      revealByteSizedUnsignedValue,
      byteSizedUnsignedValue: revealByteSizedUnsignedValue
        ? claims.byteSizedUnsignedValue
        : 0n,
      revealMediumUnsignedValue: true,
      mediumUnsignedValue: claims.mediumUnsignedValue,
      revealBigUnsignedValue: true,
      bigUnsignedValue: claims.bigUnsignedValue,
      revealBytes16Value: true,
      bytes16Value: claims.bytes16Value,
      revealBytes32Value,
      bytes32Value: revealBytes32Value
        ? claims.bytes32Value
        : new Uint8Array(32),
      revealFieldValue: true,
      fieldValue: claims.fieldValue,
      revealBooleanVector: true,
      booleanVector: claims.booleanVector,
      revealUintVector: true,
      uintVector: claims.uintVector,
      revealBytesVector: true,
      bytesVector: claims.bytesVector,
      revealFieldVector,
      fieldVector: revealFieldVector ? claims.fieldVector : [0n, 0n],
      revealNestedValue,
      nestedValue: {
        revealBooleanValue: revealNestedBooleanValue,
        booleanValue: revealNestedBooleanValue
          ? claims.nestedValue.booleanValue
          : false,
        revealBigUnsignedValue: revealNestedBigUnsignedValue,
        bigUnsignedValue: revealNestedBigUnsignedValue
          ? claims.nestedValue.bigUnsignedValue
          : 0n,
        revealBytesValue: revealNestedBytesValue,
        bytesValue: revealNestedBytesValue
          ? claims.nestedValue.bytesValue
          : new Uint8Array(16),
        revealFieldValue: revealNestedFieldValue,
        fieldValue: revealNestedFieldValue ? claims.nestedValue.fieldValue : 0n,
      },
      revealNestedVector,
      nestedVector: claims.nestedVector,
    },
  };

  const presentationProof = signProof({
    bodyRoot: pureCircuits.dummyClaimsPresentationBodyRoot(presentation),
    context: "presentation",
    signer: holder,
    createdAt: 30_100n,
    challengeHash: presentationRequest.verifierChallengeHash,
  });

  return {
    issuer,
    holder,
    claims,
    credential,
    credentialProof,
    presentationRequest,
    presentation,
    presentationProof,
  };
};
