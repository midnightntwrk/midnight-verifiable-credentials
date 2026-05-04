import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import {
  type AuthorityAttestedStatusCapability,
  type AuthorityAttestedStatusProof,
  type AuthorityAttestedStatusProofProtocol,
  type AuthorityAttestedStatusStatement,
  JUBJUB_SUBGROUP_ORDER,
  modJubjubSubgroupOrder,
  type Proof,
  pureCircuits,
  type RegistryBoundStatusBinding,
  type RevocationRegistryState,
  type RevokedSetStatusRequest,
  type VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials";

import { buildRegistryBoundStatusBinding } from "./status-binding.js";

export type StatusAuthoritySigner = {
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

export const buildRevokedSetStatusRequest = ({
  registryState,
  verifierChallengeHash,
}: {
  readonly registryState: RevocationRegistryState;
  readonly verifierChallengeHash: Uint8Array;
}): RevokedSetStatusRequest => {
  const request = {
    registryState,
    verifierChallengeHash,
  };
  pureCircuits.assertValidRevokedSetStatusRequest(request);
  return request;
};

// Transitional alias: the authority-attested path currently uses the same
// verifier-supplied request shape as the basic revoked-set status path.
export const buildAuthorityAttestedStatusRequest = buildRevokedSetStatusRequest;

export const buildAuthorityAttestedStatusCapability = ({
  registryRef,
  statusHandleCommitment,
}: {
  readonly registryRef: AuthorityAttestedStatusCapability["registryRef"];
  readonly statusHandleCommitment: Uint8Array;
}): AuthorityAttestedStatusCapability => {
  const capability = {
    registryRef,
    statusHandleCommitment,
  };
  pureCircuits.assertValidAuthorityAttestedStatusCapability(capability);
  return capability;
};

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

export const signAuthorityAttestedStatusProof = ({
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
  // Callers must supply a fresh scalar in the JubJub subgroup interval
  // `[1, JUBJUB_SUBGROUP_ORDER)`. Reusing or biasing this nonce breaks Schnorr
  // signature security. The current prototype keeps nonce generation explicit
  // so application code can integrate its own RNG / deterministic signer.
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
