import type { StatusReader } from "@midnight-ntwrk/credential-status";
import type { AuthorityEvidencePolicyV1 } from "@midnight-ntwrk/credential-proofs";
import type { StatusRegistryStateV1 } from "@midnight-ntwrk/credential-status-midnight-contract";
import {
  type AuthenticatedRootStatusEvidenceV1,
  type AuthenticatedRootStatusPolicyV1,
  createMidnightStatusReaderV1,
  createSha256StatusProofVerifierV1,
  type StatusCryptographicProofVerifierV1,
  type StatusEvidenceVerificationResultV1,
  type StatusRootAuthorityVerifierV1,
  type StatusRootFreshnessVerifierV1,
  verifyAuthenticatedRootStatusV1,
} from "@midnight-ntwrk/credential-status-midnight-verifier";
import type { StatusAuthoritySignerV1 } from "@midnight-ntwrk/credential-status-midnight-authority";

export const consume = (
  state: StatusRegistryStateV1,
  policy: AuthorityEvidencePolicyV1,
  signer: StatusAuthoritySignerV1,
  authorityVerifier: StatusRootAuthorityVerifierV1,
  freshnessVerifier: StatusRootFreshnessVerifierV1,
): {
  reader: StatusReader;
  proofVerifier: StatusCryptographicProofVerifierV1;
  verifyExternal: (
    policy: AuthenticatedRootStatusPolicyV1,
    evidence: AuthenticatedRootStatusEvidenceV1,
  ) => Promise<StatusEvidenceVerificationResultV1>;
  policy: AuthorityEvidencePolicyV1;
  signer: StatusAuthoritySignerV1;
} => {
  const proofVerifier = createSha256StatusProofVerifierV1();
  return {
    reader: createMidnightStatusReaderV1({ readState: () => state }),
    proofVerifier,
    verifyExternal: (statusPolicy, evidence) =>
      verifyAuthenticatedRootStatusV1({
        policy: statusPolicy,
        evidence,
        proofVerifier,
        authorityVerifier,
        freshnessVerifier,
      }),
    policy,
    signer,
  };
};
