import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import {
  type AuthorityAttestedStatusCapability,
  type AuthorityAttestedStatusProof,
  type AuthorityAttestedStatusStatement,
  type Proof,
  pureCircuits,
  type RevocationRegistryState,
  type RevokedSetStatusRequest,
  type VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials";

const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

export type StatusAuthoritySigner = {
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

const mod = (value: bigint): bigint => {
  const reduced = value % JUBJUB_SUBGROUP_ORDER;
  return reduced >= 0n ? reduced : reduced + JUBJUB_SUBGROUP_ORDER;
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
      s: mod(nonceScalar + challenge * signer.secretKey),
    },
  };
  const attestation = {
    statement,
    proof,
  };
  pureCircuits.assertValidAuthorityAttestedStatusProof(attestation);
  return attestation;
};
