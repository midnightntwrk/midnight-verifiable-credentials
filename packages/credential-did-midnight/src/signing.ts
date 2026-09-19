import {
  type Proof,
  VerificationRelationship,
} from "@midnight-ntwrk/credential-compact";
import {
  deriveJubjubPublicKey,
  JUBJUB_ORDER,
  normalizeScalar,
} from "@midnight-ntwrk/midnight-did-jubjub-schnorr";
import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { concatBytes, randomBytes, utf8ToBytes } from "@noble/hashes/utils.js";

import { pureCircuits } from "./managed/did-midnight/contract/index.js";
import type { MidnightDIDMethodBinding } from "./types.js";

const UINT64_MAX = (1n << 64n) - 1n;
const MAX_NONCE_ATTEMPTS = 512;
const NONCE_DOMAIN = utf8ToBytes("midnight:vc:proof-nonce:v1");

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

const bigintToFixedBytesBE = (value: bigint, length: number): Uint8Array => {
  const output = new Uint8Array(length);
  let remaining = value;
  for (let index = length - 1; index >= 0; index -= 1) {
    output[index] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  if (remaining !== 0n) throw new Error("Integer does not fit nonce encoding");
  return output;
};

const deriveNonceScalar = (
  secretScalar: bigint,
  contextDomain: Uint8Array,
  bodyRoot: Uint8Array,
  createdAt: bigint,
  challengeHash: Uint8Array,
  methodBinding: MidnightDIDMethodBinding,
  attempt: number,
): bigint =>
  bytesToBigIntBE(
    hmac(
      sha512,
      bigintToFixedBytesBE(secretScalar, 32),
      concatBytes(
        NONCE_DOMAIN,
        contextDomain,
        randomBytes(32),
        bodyRoot,
        methodBinding.verificationMethodRef.controllerAddress.bytes,
        methodBinding.verificationMethodRef.methodId,
        bigintToFixedBytesBE(createdAt, 8),
        challengeHash,
        bigintToFixedBytesBE(BigInt(attempt), 4),
      ),
    ),
  ) % JUBJUB_ORDER;

const deriveNonzeroNonceScalar = (
  secretScalar: bigint,
  contextDomain: Uint8Array,
  bodyRoot: Uint8Array,
  createdAt: bigint,
  challengeHash: Uint8Array,
  methodBinding: MidnightDIDMethodBinding,
): bigint => {
  for (let attempt = 0; attempt < MAX_NONCE_ATTEMPTS; attempt += 1) {
    const nonceScalar = deriveNonceScalar(
      secretScalar,
      contextDomain,
      bodyRoot,
      createdAt,
      challengeHash,
      methodBinding,
      attempt,
    );
    if (nonceScalar !== 0n) return nonceScalar;
  }
  throw new Error("Unable to derive a nonzero Jubjub nonce");
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
  contextDomain: Uint8Array,
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

  const bodyRoot = requireBytes32(options.bodyRoot, "bodyRoot");
  const createdAt = requireUint64(options.createdAt, "createdAt");
  const challengeHash = requireBytes32(options.challengeHash, "challengeHash");

  const nonceScalar = deriveNonzeroNonceScalar(
    secretScalar,
    contextDomain,
    bodyRoot,
    createdAt,
    challengeHash,
    methodBinding,
  );
  const noncePoint = deriveJubjubPublicKey(nonceScalar);
  const unsignedProof: Proof = {
    signerVerificationMethodRef: {
      controllerAddress: {
        bytes: new Uint8Array(
          methodBinding.verificationMethodRef.controllerAddress.bytes,
        ),
      },
      methodId: new Uint8Array(methodBinding.verificationMethodRef.methodId),
    },
    createdAt,
    challengeHash,
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
    utf8ToBytes("issuance"),
    pureCircuits.issuanceProofChallenge,
    pureCircuits.assertValidIssuanceContextProof,
  );

export const signMidnightDIDPresentationProof = (
  options: SignMidnightDIDProofOptions,
): Proof =>
  signProof(
    options,
    VerificationRelationship.authentication,
    utf8ToBytes("presentation"),
    pureCircuits.presentationProofChallenge,
    pureCircuits.assertValidPresentationContextProof,
  );
