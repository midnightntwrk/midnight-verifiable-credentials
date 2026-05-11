import { createHash } from "node:crypto";

import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import {
  JUBJUB_SUBGROUP_ORDER,
  modJubjubSubgroupOrder,
  type Proof,
  type VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials";

import {
  type AuthorityAttestedStatusProof,
  type AuthorityAttestedStatusProofProtocol,
  type AuthorityAttestedStatusStatement,
  pureCircuits,
  type RevocationRegistryState,
  type RevokedSetStatusRequest,
} from "./managed/revocation-registry/contract/index.js";
import { buildRevokedSetStatusRequest } from "./witness-builder.js";

export type StatusAuthoritySigner = {
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  bytes.reduce((accumulator, byte) => (accumulator << 8n) + BigInt(byte), 0n);

const bigintToBytes = (value: bigint, widthBytes: number): Uint8Array => {
  if (value < 0n) {
    throw new Error("Cannot encode a negative bigint into bytes");
  }
  const encoded = new Uint8Array(widthBytes);
  let remaining = value;
  for (let index = widthBytes - 1; index >= 0; index -= 1) {
    encoded[index] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  if (remaining !== 0n) {
    throw new Error(
      `Cannot encode bigint into ${widthBytes} bytes without truncation`,
    );
  }
  return encoded;
};

const assertValidAuthorityAttestedSigningInputs = ({
  signer,
  createdAt,
}: {
  readonly signer: StatusAuthoritySigner;
  readonly createdAt: bigint;
}): void => {
  if (signer.secretKey <= 0n || signer.secretKey >= JUBJUB_SUBGROUP_ORDER) {
    throw new Error(
      "Authority-attested status proof signer secret key must be in (0, JUBJUB_SUBGROUP_ORDER)",
    );
  }
  if (createdAt < 0n) {
    throw new Error("Authority-attested status proof createdAt must be >= 0");
  }
  bigintToBytes(createdAt, 32);
};

export const deriveAuthorityAttestedStatusProofNonceScalar = ({
  statement,
  signer,
  createdAt,
}: {
  readonly statement: AuthorityAttestedStatusStatement;
  readonly signer: StatusAuthoritySigner;
  readonly createdAt: bigint;
}): bigint => {
  assertValidAuthorityAttestedSigningInputs({ signer, createdAt });
  const bodyRoot = pureCircuits.authorityAttestedStatusStatementRoot(statement);

  let attempt = 0n;
  while (true) {
    const digest = createHash("sha256")
      .update("midnight:vc:status-attestation:signing-nonce:v1")
      .update(bodyRoot)
      .update(statement.verifierChallengeHash)
      .update(statement.registryState.registryId)
      .update(statement.registryState.revokedRoot)
      .update(statement.statusHandleCommitment)
      .update(signer.verificationMethodRef.didContractAddress.bytes)
      .update(signer.verificationMethodRef.methodId)
      .update(bigintToBytes(createdAt, 32))
      .update(bigintToBytes(signer.secretKey, 32))
      .update(bigintToBytes(attempt, 8))
      .digest();

    const scalar = modJubjubSubgroupOrder(
      bytesToBigInt(new Uint8Array(digest)),
    );
    if (scalar !== 0n) {
      return scalar;
    }
    attempt += 1n;
  }
};

// Transitional alias: the authority-attested path currently uses the same
// verifier-supplied request shape as the basic revoked-set status path.
export const buildAuthorityAttestedStatusRequest = buildRevokedSetStatusRequest;

export const buildAuthorityAttestedStatusStatement = ({
  request,
  statusHandleCommitment,
  expiresAt,
}: {
  readonly request: RevokedSetStatusRequest;
  readonly statusHandleCommitment: Uint8Array;
  readonly expiresAt?: bigint;
}): AuthorityAttestedStatusStatement => {
  const statement = {
    registryState: request.registryState,
    statusHandleCommitment,
    verifierChallengeHash: request.verifierChallengeHash,
    hasExpiration: expiresAt !== undefined,
    expiresAt: expiresAt ?? 0n,
  };
  pureCircuits.assertValidAuthorityAttestedStatusStatement(statement);
  return statement;
};

/**
 * Unsafe escape hatch for tests or tightly controlled deterministic replay.
 * Production integrations should use `signAuthorityAttestedStatusProof(...)`
 * so nonce derivation stays internal to the helper.
 */
export const unsafeSignAuthorityAttestedStatusProofWithNonceScalar = ({
  statement,
  signer,
  createdAt,
  nonceScalar,
}: {
  readonly statement: AuthorityAttestedStatusStatement;
  readonly signer: StatusAuthoritySigner;
  readonly createdAt: bigint;
  readonly nonceScalar: bigint;
}): AuthorityAttestedStatusProof => {
  assertValidAuthorityAttestedSigningInputs({ signer, createdAt });
  if (nonceScalar <= 0n || nonceScalar >= JUBJUB_SUBGROUP_ORDER) {
    throw new Error(
      "Authority-attested status proof nonce scalar must be in [1, JUBJUB_SUBGROUP_ORDER)",
    );
  }
  const bodyRoot = pureCircuits.authorityAttestedStatusStatementRoot(statement);
  const provisionalProof: Proof = {
    signerVerificationMethodRef: signer.verificationMethodRef,
    createdAt,
    challengeHash: statement.verifierChallengeHash,
    publicKey: signer.publicKey,
    signature: {
      r: ecMulGenerator(nonceScalar),
      s: 0n,
    },
  };
  const challenge = pureCircuits.statusAttestationProofChallenge(
    bodyRoot,
    provisionalProof,
  );
  const proof: Proof = {
    ...provisionalProof,
    signature: {
      r: provisionalProof.signature.r,
      s: modJubjubSubgroupOrder(nonceScalar + challenge * signer.secretKey),
    },
  };
  const attestation = {
    statement,
    proof,
  };
  pureCircuits.assertValidAuthorityAttestedStatusProof(attestation);
  return attestation;
};

export const signAuthorityAttestedStatusProof = ({
  statement,
  signer,
  createdAt,
}: {
  readonly statement: AuthorityAttestedStatusStatement;
  readonly signer: StatusAuthoritySigner;
  readonly createdAt: bigint;
}): AuthorityAttestedStatusProof =>
  unsafeSignAuthorityAttestedStatusProofWithNonceScalar({
    statement,
    signer,
    createdAt,
    nonceScalar: deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer,
      createdAt,
    }),
  });

export const buildAuthorityAttestedStatusProofProtocol = ({
  request,
  attestation,
}: {
  readonly request: RevokedSetStatusRequest;
  readonly attestation: AuthorityAttestedStatusProof;
}): AuthorityAttestedStatusProofProtocol => {
  const protocol = {
    request,
    attestation,
  };
  pureCircuits.assertValidAuthorityAttestedStatusProofProtocol(protocol);
  return protocol;
};
