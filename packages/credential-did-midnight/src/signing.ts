import {
  type Proof,
  VerificationRelationship,
} from "@midnight-ntwrk/credential-compact";
import {
  deriveJubjubPublicKey,
  JUBJUB_ORDER,
  normalizeScalar,
} from "@midnight-ntwrk/midnight-did-jubjub-schnorr";
import { randomBytes } from "@noble/hashes/utils.js";

import { pureCircuits } from "./managed/did-midnight/contract/index.js";
import type { MidnightDIDMethodBinding } from "./types.js";

const UINT64_MAX = (1n << 64n) - 1n;

export type SignMidnightDIDProofOptions = {
  readonly methodBinding: MidnightDIDMethodBinding;
  readonly secretScalar: bigint;
  readonly bodyRoot: Uint8Array;
  readonly createdAt: bigint;
  readonly challengeHash: Uint8Array;
};

const requireBytes32 = (value: Uint8Array, label: string): Uint8Array => {
  if (value.length !== 32) {
    throw new Error(`${label} must contain exactly 32 bytes`);
  }
  return new Uint8Array(value);
};

const requireUint64 = (value: bigint, label: string): bigint => {
  if (value < 0n || value > UINT64_MAX) {
    throw new Error(`${label} must fit into uint64`);
  }
  return value;
};

const bytesToBigIntBE = (bytes: Uint8Array): bigint => {
  let value = 0n;
  for (const byte of bytes) {
    value = (value << 8n) | BigInt(byte);
  }
  return value;
};

const randomNonzeroScalar = (): bigint => {
  for (;;) {
    const candidate = bytesToBigIntBE(randomBytes(64)) % JUBJUB_ORDER;
    if (candidate !== 0n) return candidate;
  }
};

const matchingPoint = (
  left: Proof["publicKey"],
  right: Proof["publicKey"],
): boolean => left.x === right.x && left.y === right.y;

type ChallengeCircuit = (bodyRoot: Uint8Array, proof: Proof) => bigint;
type VerificationCircuit = (bodyRoot: Uint8Array, proof: Proof) => unknown;

const signProof = (
  options: SignMidnightDIDProofOptions,
  requiredRelationship: VerificationRelationship,
  challengeCircuit: ChallengeCircuit,
  verificationCircuit: VerificationCircuit,
): Proof => {
  const { methodBinding } = options;
  pureCircuits.assertValidMidnightDIDMethodBinding(methodBinding);
  if (methodBinding.verificationRelationship !== requiredRelationship) {
    throw new Error(
      requiredRelationship === VerificationRelationship.assertionMethod
        ? "Midnight DID credential signing requires assertionMethod"
        : "Midnight DID presentation signing requires authentication",
    );
  }

  const secretScalar = normalizeScalar(options.secretScalar);
  if (secretScalar === 0n) {
    throw new Error("Midnight DID signing secret must be nonzero");
  }
  const publicKey = deriveJubjubPublicKey(secretScalar);
  if (!matchingPoint(publicKey, methodBinding.publicKey)) {
    throw new Error(
      "Midnight DID signing secret does not match method binding",
    );
  }

  const nonceScalar = randomNonzeroScalar();
  const noncePoint = deriveJubjubPublicKey(nonceScalar);
  const bodyRoot = requireBytes32(options.bodyRoot, "bodyRoot");
  const unsignedProof: Proof = {
    signerVerificationMethodRef: {
      controllerAddress: {
        bytes: new Uint8Array(
          methodBinding.verificationMethodRef.controllerAddress.bytes,
        ),
      },
      methodId: new Uint8Array(methodBinding.verificationMethodRef.methodId),
    },
    createdAt: requireUint64(options.createdAt, "createdAt"),
    challengeHash: requireBytes32(options.challengeHash, "challengeHash"),
    publicKey,
    signature: { r: noncePoint, s: 0n },
  };
  const challenge = challengeCircuit(bodyRoot, unsignedProof);
  const proof: Proof = {
    ...unsignedProof,
    signature: {
      r: noncePoint,
      s: normalizeScalar(nonceScalar + challenge * secretScalar),
    },
  };

  verificationCircuit(bodyRoot, proof);
  pureCircuits.assertMidnightDIDProofMatchesMethod(proof, methodBinding);
  return proof;
};

export const signMidnightDIDCredentialProof = (
  options: SignMidnightDIDProofOptions,
): Proof =>
  signProof(
    options,
    VerificationRelationship.assertionMethod,
    pureCircuits.issuanceProofChallenge,
    pureCircuits.assertValidIssuanceContextProof,
  );

export const signMidnightDIDPresentationProof = (
  options: SignMidnightDIDProofOptions,
): Proof =>
  signProof(
    options,
    VerificationRelationship.authentication,
    pureCircuits.presentationProofChallenge,
    pureCircuits.assertValidPresentationContextProof,
  );
