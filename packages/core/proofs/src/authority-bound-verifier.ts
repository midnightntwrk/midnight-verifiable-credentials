import {
  type AuthorityEvidencePolicyV1,
  type AuthorityEvidenceVerificationResultV1,
  type AuthorityVerificationContextV1,
  type DidMethodEvidenceProviderV1,
  type TrustAuthorizationEvidenceProviderV1,
  verifyAuthorityEvidenceV1,
} from "./authority-evidence.js";
import type {
  ProofJob,
  ProofResult,
  ProofVerificationResult,
  ProofVerifier,
} from "./types.js";

export interface AuthorityBoundProofVerificationResultV1 {
  readonly formatVersion: 1;
  readonly status: "valid" | "invalid" | "indeterminate";
  readonly decisionStatus: "approved" | "notEvaluated";
  readonly accepted: boolean;
  readonly reasonCodes: readonly string[];
  readonly proof: ProofVerificationResult;
  readonly authority: AuthorityEvidenceVerificationResultV1 | null;
}

/**
 * Verifies proof bytes first, then resolves authority evidence. Neither proof
 * input/witnesses nor proof bytes are copied into the canonical authority result.
 */
export const verifyProofWithAuthorityV1 = async <
  TJob extends ProofJob,
  TResult extends ProofResult,
>(input: {
  readonly verifier: ProofVerifier<TJob, TResult>;
  readonly job: TJob;
  readonly result: TResult;
  readonly authority: {
    readonly policy: AuthorityEvidencePolicyV1;
    readonly context: AuthorityVerificationContextV1;
    readonly didProvider: DidMethodEvidenceProviderV1;
    readonly trustProvider: TrustAuthorizationEvidenceProviderV1;
  };
}): Promise<AuthorityBoundProofVerificationResultV1> => {
  const proof = await input.verifier.verify(input.job, input.result);
  if (!proof.valid) {
    return {
      formatVersion: 1,
      status: "invalid",
      decisionStatus: "notEvaluated",
      accepted: false,
      reasonCodes: ["PROOF_INVALID"],
      proof,
      authority: null,
    };
  }

  const authority = await verifyAuthorityEvidenceV1(input.authority);
  return {
    formatVersion: 1,
    status: authority.status,
    decisionStatus: authority.decisionStatus,
    accepted: authority.accepted,
    reasonCodes: authority.reasonCodes,
    proof,
    authority,
  };
};
