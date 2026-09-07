import {
  type AuthorityEvidencePolicyV1,
  type AuthorityEvidenceVerificationResultV1,
  type AuthorityVerificationContextV1,
  type DidMethodEvidenceProviderV1,
  type TrustAuthorizationEvidenceProviderV1,
  type TrustedTimeAnchorVerifierV1,
  type TrustedTimeAttestationSignatureVerifierV1,
  type TrustedTimeAuthorityVerifierV1,
  type TrustedTimeCheckpointV1,
  type TrustedTimeEvidenceV1,
  type TrustedTimePolicyV1,
  type TrustedTimeScopeV1,
  verifyAuthorityEvidenceV1,
  verifyTrustedTimeEvidenceV1,
} from "@midnight-ntwrk/credential-proofs";
import type { StatusVerificationOutcome } from "@midnight-ntwrk/credential-status";
import {
  computeStatusMerkleLeafV1,
  computeStatusMerkleParentV1,
  computeStatusRecordDigestV1,
  computeStatusRegistryRootV1,
  emptyStatusRegistryRootV1,
  type StatusRegistryBindingV1,
  type StatusRegistryOperatorV1,
  type StatusRegistryStateV1,
  type StatusSha256DigestV1,
} from "@midnight-ntwrk/credential-status-midnight-contract";

export type StatusVerificationProfileV1 =
  | "ledger-local-v1"
  | "ledger-attested-v1"
  | "offchain-public-v1";

export interface StatusMerkleMembershipPathV1 {
  readonly formatVersion: 1;
  readonly leaf: StatusSha256DigestV1;
  readonly leafIndex: number;
  readonly treeSize: number;
  readonly siblings: readonly StatusSha256DigestV1[];
}

export type StatusMerkleProofV1 =
  | {
      readonly formatVersion: 1;
      readonly kind: "membership";
      readonly membership: StatusMerkleMembershipPathV1;
    }
  | {
      readonly formatVersion: 1;
      readonly kind: "non-membership";
      readonly treeSize: number;
      readonly lower: StatusMerkleMembershipPathV1 | null;
      readonly upper: StatusMerkleMembershipPathV1 | null;
    };

export interface StatusProofVerificationRequestV1 {
  readonly root: StatusSha256DigestV1;
  readonly leaf: StatusSha256DigestV1;
  readonly result: "not-revoked" | "revoked";
  readonly proof: StatusMerkleProofV1;
}

export interface StatusCryptographicProofVerifierV1 {
  verify(
    request: StatusProofVerificationRequestV1,
  ): Promise<boolean> | boolean;
}

/**
 * A verifier that consumes the handle/path as private witness material. Its
 * request must never be retained, logged, or projected into a public result.
 */
export interface PrivateStatusCryptographicProofVerifierV1
  extends StatusCryptographicProofVerifierV1 {}

export interface StatusRootAuthorityEvidenceV1 {
  readonly policy: AuthorityEvidencePolicyV1;
  readonly context: AuthorityVerificationContextV1;
}

export interface StatusRootAuthorityVerifierV1 {
  verify(input: {
    readonly evidence: StatusRootAuthorityEvidenceV1;
  }): Promise<AuthorityEvidenceVerificationResultV1>;
}

export interface StatusRootFreshnessVerificationV1 {
  readonly status: "valid" | "invalid" | "indeterminate";
  readonly anchorDigest: StatusSha256DigestV1 | null;
}

export interface StatusRootFreshnessVerifierV1 {
  verify(input: {
    readonly binding: StatusRegistryBindingV1;
    readonly root: StatusSha256DigestV1;
    readonly registryVersion: number;
    readonly observedAt: number;
    readonly expiresAt: number;
    readonly freshnessPolicyDigest: StatusSha256DigestV1;
    readonly evidence: unknown;
  }): Promise<StatusRootFreshnessVerificationV1>;
}

/**
 * Adapts canonical trusted-time evidence to the authenticated status verifier.
 * The anchor verifier is the only ledger integration point; this package never
 * upgrades caller timestamps or runtime observation clocks to ledger authority.
 */
export const createTrustedTimeStatusFreshnessVerifierV1 = (input: {
  readonly policy: TrustedTimePolicyV1;
  readonly scope: TrustedTimeScopeV1;
  readonly maximumStatusAge: number;
  readonly anchorVerifier?: TrustedTimeAnchorVerifierV1;
  readonly authorityVerifier?: TrustedTimeAuthorityVerifierV1;
  readonly signatureVerifier?: TrustedTimeAttestationSignatureVerifierV1;
  readonly previousCheckpoint?: TrustedTimeCheckpointV1 | null;
}): StatusRootFreshnessVerifierV1 => ({
  verify: async ({
    binding,
    observedAt,
    expiresAt,
    freshnessPolicyDigest,
    evidence,
  }) => {
    if (
      binding.network !== input.scope.network ||
      freshnessPolicyDigest !== input.scope.freshnessPolicyDigest ||
      binding.deployment !== input.scope.deployment ||
      !Number.isSafeInteger(input.maximumStatusAge) ||
      input.maximumStatusAge < 0 ||
      !Number.isSafeInteger(observedAt) ||
      !Number.isSafeInteger(expiresAt) ||
      observedAt < 0 ||
      expiresAt < observedAt
    ) {
      return { status: "invalid", anchorDigest: null };
    }
    const verified = await verifyTrustedTimeEvidenceV1({
      policy: input.policy,
      scope: input.scope,
      evidence: evidence as TrustedTimeEvidenceV1 | null | undefined,
      anchorVerifier: input.anchorVerifier,
      authorityVerifier: input.authorityVerifier,
      signatureVerifier: input.signatureVerifier,
      previousCheckpoint: input.previousCheckpoint,
    });
    if (verified.status === "indeterminate") {
      return { status: "indeterminate", anchorDigest: null };
    }
    if (
      verified.status !== "valid" ||
      !verified.authoritative ||
      verified.trustedTime === null ||
      verified.anchorDigest === null ||
      observedAt > verified.trustedTime ||
      verified.trustedTime > expiresAt ||
      verified.trustedTime - observedAt > input.maximumStatusAge
    ) {
      return { status: "invalid", anchorDigest: verified.anchorDigest };
    }
    return { status: "valid", anchorDigest: verified.anchorDigest };
  },
});

export interface AuthenticatedRootStatusEvidenceV1 {
  readonly formatVersion: 1;
  readonly profile: StatusVerificationProfileV1;
  readonly privacy: "public" | "private";
  readonly binding: StatusRegistryBindingV1;
  readonly root: StatusSha256DigestV1;
  readonly registryVersion: number;
  readonly result: "not-revoked" | "revoked";
  /** Public status-handle digest. Private profiles require a real ZK adapter. */
  readonly leaf: StatusSha256DigestV1;
  readonly credentialBindingDigest: StatusSha256DigestV1;
  readonly presentationBindingDigest: StatusSha256DigestV1;
  readonly challengeDigest: StatusSha256DigestV1;
  readonly freshnessPolicyDigest: StatusSha256DigestV1;
  readonly observedAt: number;
  readonly expiresAt: number;
  readonly proof: StatusMerkleProofV1;
  readonly proofDigest: StatusSha256DigestV1;
  readonly authority: StatusRootAuthorityEvidenceV1;
  readonly freshnessEvidence: unknown;
}

export interface AuthenticatedRootStatusPolicyV1 {
  readonly profile: StatusVerificationProfileV1;
  readonly mode: "external-nonmembership";
  readonly binding: StatusRegistryBindingV1;
  readonly acceptedRoot: StatusSha256DigestV1;
  readonly acceptedRegistryVersion: number;
  readonly acceptedAuthority: StatusRegistryOperatorV1;
  readonly acceptedAuthorityPolicyDigest: StatusSha256DigestV1;
  /** Verifier-trusted subject/request bindings; never copied from holder evidence. */
  readonly acceptedLeaf: StatusSha256DigestV1;
  readonly acceptedCredentialBindingDigest: StatusSha256DigestV1;
  readonly acceptedPresentationBindingDigest: StatusSha256DigestV1;
  readonly acceptedChallengeDigest: StatusSha256DigestV1;
  readonly freshnessPolicyDigest: StatusSha256DigestV1;
}

export interface CanonicalStatusVerificationTranscriptV1 {
  readonly formatVersion: 1;
  readonly domain: "midnight:vc:authenticated-status-verification:v1";
  readonly profile: StatusVerificationProfileV1;
  readonly mode: "same-contract-live" | "external-nonmembership";
  readonly binding: StatusRegistryBindingV1;
  readonly root: StatusSha256DigestV1;
  readonly registryVersion: number;
  readonly privacy: "public" | "private";
  readonly subjectDigest: StatusSha256DigestV1;
  readonly freshnessPolicyDigest: StatusSha256DigestV1;
  readonly freshnessAnchorDigest: StatusSha256DigestV1 | null;
  readonly authorityPolicyDigest: StatusSha256DigestV1 | null;
  readonly authorityTranscriptDigest: StatusSha256DigestV1 | null;
  readonly proofDigest: StatusSha256DigestV1 | null;
  readonly result: "not-revoked" | "revoked" | "not-evaluated";
}

export interface StatusEvidenceVerificationResultV1 {
  readonly status: "valid" | "invalid" | "indeterminate";
  readonly reasonCodes: readonly string[];
  readonly outcome: StatusVerificationOutcome;
  readonly transcript: CanonicalStatusVerificationTranscriptV1;
  readonly transcriptDigest: StatusSha256DigestV1;
}

const digestPattern = /^sha256:[0-9a-f]{64}$/u;
const zeroDigest = `sha256:${"0".repeat(64)}` as const;

const isDigest = (value: unknown): value is StatusSha256DigestV1 =>
  typeof value === "string" && digestPattern.test(value);

const bindingMismatch = (
  expected: StatusRegistryBindingV1,
  actual: StatusRegistryBindingV1,
): string | null => {
  if (actual.formatVersion !== 1) return "BINDING_VERSION_MISMATCH";
  if (actual.network !== expected.network) return "NETWORK_MISMATCH";
  if (actual.namespace !== expected.namespace) return "NAMESPACE_MISMATCH";
  if (actual.registryId !== expected.registryId) return "REGISTRY_MISMATCH";
  if (actual.deployment !== expected.deployment) return "DEPLOYMENT_MISMATCH";
  return null;
};

const authorityPolicyDigest = (
  evidence: AuthenticatedRootStatusEvidenceV1,
): StatusSha256DigestV1 => computeStatusRecordDigestV1(evidence.authority.policy);

const authorityPolicyDigestOrZero = (
  evidence: AuthenticatedRootStatusEvidenceV1,
): StatusSha256DigestV1 => {
  try {
    return authorityPolicyDigest(evidence);
  } catch {
    return zeroDigest;
  }
};

const proofStatement = (evidence: AuthenticatedRootStatusEvidenceV1) => ({
  domain: "midnight:vc:authenticated-status-statement:v1",
  formatVersion: evidence.formatVersion,
  profile: evidence.profile,
  privacy: evidence.privacy,
  binding: evidence.binding,
  root: evidence.root,
  registryVersion: evidence.registryVersion,
  result: evidence.result,
  leaf: evidence.leaf,
  credentialBindingDigest: evidence.credentialBindingDigest,
  presentationBindingDigest: evidence.presentationBindingDigest,
  challengeDigest: evidence.challengeDigest,
  freshnessPolicyDigest: evidence.freshnessPolicyDigest,
  observedAt: evidence.observedAt,
  expiresAt: evidence.expiresAt,
  proofDigest: evidence.proofDigest,
  authorityPolicyDigest: authorityPolicyDigest(evidence),
});

const scopedSubjectDigest = (input: {
  readonly privacy: "public" | "private";
  readonly leaf: StatusSha256DigestV1;
  readonly challengeDigest: StatusSha256DigestV1;
  readonly credentialBindingDigest: StatusSha256DigestV1;
  readonly presentationBindingDigest: StatusSha256DigestV1;
}): StatusSha256DigestV1 => input.privacy === "public"
  ? input.leaf
  : computeStatusRecordDigestV1({
      domain: "midnight:vc:private-status-subject:v1",
      challengeDigest: input.challengeDigest,
      credentialBindingDigest: input.credentialBindingDigest,
      presentationBindingDigest: input.presentationBindingDigest,
      privateLeafDigest: input.leaf,
    });

const transcriptDigest = (
  transcript: CanonicalStatusVerificationTranscriptV1,
): StatusSha256DigestV1 => computeStatusRecordDigestV1(transcript);

const bindingMismatchReasons = new Set([
  "BINDING_VERSION_MISMATCH",
  "NETWORK_MISMATCH",
  "NAMESPACE_MISMATCH",
  "REGISTRY_MISMATCH",
  "DEPLOYMENT_MISMATCH",
]);

const classifyOutcome = (
  status: StatusEvidenceVerificationResultV1["status"],
  reasonCodes: readonly string[],
  transcript: CanonicalStatusVerificationTranscriptV1,
): StatusVerificationOutcome => {
  if (status === "valid") {
    return {
      verdict: "valid",
      state: "active",
      evidence: { transcriptDigest: transcriptDigest(transcript) },
    };
  }
  if (status === "indeterminate") {
    if (reasonCodes.includes("STATUS_STATE_UNAVAILABLE")) {
      return { verdict: "indeterminate", code: "statusStateUnavailable" };
    }
    if (reasonCodes.includes("FRESHNESS_EVIDENCE_UNAVAILABLE")) {
      return { verdict: "indeterminate", code: "trustedTimeUnavailable" };
    }
    if (reasonCodes.includes("ROOT_AUTHORITY_UNAVAILABLE")) {
      return { verdict: "indeterminate", code: "statusAuthorityUnavailable" };
    }
    return { verdict: "indeterminate", code: "statusProofUnavailable" };
  }
  if (reasonCodes.includes("STATUS_REVOKED")) {
    return { verdict: "invalid", code: "revoked" };
  }
  if (reasonCodes.includes("STALE_ROOT")) {
    return { verdict: "invalid", code: "staleRegistryState" };
  }
  if (reasonCodes.some((code) => code.startsWith("ROOT_AUTHORITY_"))) {
    return { verdict: "invalid", code: "authorityMismatch" };
  }
  if (reasonCodes.some((code) => bindingMismatchReasons.has(code))) {
    return { verdict: "invalid", code: "statusBindingMismatch" };
  }
  return { verdict: "invalid", code: "statusRequestMismatch" };
};

const result = (
  status: StatusEvidenceVerificationResultV1["status"],
  reasonCodes: readonly string[],
  transcript: CanonicalStatusVerificationTranscriptV1,
): StatusEvidenceVerificationResultV1 => {
  const outcome = classifyOutcome(status, reasonCodes, transcript);
  return Object.freeze({
    status,
    reasonCodes: Object.freeze([...reasonCodes]),
    outcome,
    transcript,
    transcriptDigest: transcriptDigest(transcript),
  });
};

export const computeStatusMerkleProofDigestV1 = (
  proof: StatusMerkleProofV1,
): StatusSha256DigestV1 => computeStatusRecordDigestV1(proof);

const verifyMembershipPath = (
  root: StatusSha256DigestV1,
  path: StatusMerkleMembershipPathV1,
): boolean => {
  if (
    path.formatVersion !== 1 ||
    !isDigest(path.leaf) ||
    !Number.isSafeInteger(path.leafIndex) ||
    !Number.isSafeInteger(path.treeSize) ||
    path.treeSize < 1 ||
    path.leafIndex < 0 ||
    path.leafIndex >= path.treeSize
  ) return false;
  let node = computeStatusMerkleLeafV1(path.leaf);
  let index = path.leafIndex;
  let width = path.treeSize;
  let siblingIndex = 0;
  while (width > 1) {
    const sibling = path.siblings[siblingIndex];
    if (!isDigest(sibling)) return false;
    if (index % 2 === 0) {
      if (index + 1 >= width && sibling !== node) return false;
      node = computeStatusMerkleParentV1(node, sibling);
    } else {
      node = computeStatusMerkleParentV1(sibling, node);
    }
    index = Math.floor(index / 2);
    width = Math.ceil(width / 2);
    siblingIndex += 1;
  }
  return siblingIndex === path.siblings.length && node === root;
};

const verifyReferenceProof = (request: StatusProofVerificationRequestV1): boolean => {
  const { proof } = request;
  if (
    !isDigest(request.root) ||
    !isDigest(request.leaf) ||
    proof === null ||
    typeof proof !== "object" ||
    proof.formatVersion !== 1
  ) return false;
  if (proof.kind === "membership") {
    return request.result === "revoked" &&
      proof.membership.leaf === request.leaf &&
      verifyMembershipPath(request.root, proof.membership);
  }
  if (
    proof.kind !== "non-membership" ||
    request.result !== "not-revoked" ||
    !Number.isSafeInteger(proof.treeSize) ||
    proof.treeSize < 0
  ) return false;
  if (proof.treeSize === 0) {
    return request.root === emptyStatusRegistryRootV1 && proof.lower === null && proof.upper === null;
  }
  if ((proof.lower?.treeSize ?? proof.upper?.treeSize) !== proof.treeSize) return false;
  if (proof.lower !== null && (!verifyMembershipPath(request.root, proof.lower) || proof.lower.leaf >= request.leaf)) return false;
  if (proof.upper !== null && (!verifyMembershipPath(request.root, proof.upper) || proof.upper.leaf <= request.leaf)) return false;
  if (proof.lower === null && proof.upper === null) return false;
  if (proof.lower === null) return proof.upper!.leafIndex === 0;
  if (proof.upper === null) return proof.lower.leafIndex === proof.treeSize - 1;
  return proof.lower.leafIndex + 1 === proof.upper.leafIndex;
};

/**
 * Cryptographic SHA-256 reference verifier for interoperable test/off-chain
 * use. It does not claim to be a Compact proof or confer ledger authority.
 */
export const createSha256StatusProofVerifierV1 = (): StatusCryptographicProofVerifierV1 => ({
  verify: (request) => {
    try {
      return verifyReferenceProof(request);
    } catch {
      return false;
    }
  },
});

export const createStatusRootAuthorityVerifierV1 = (input: {
  readonly didProvider: DidMethodEvidenceProviderV1;
  readonly trustProvider: TrustAuthorizationEvidenceProviderV1;
}): StatusRootAuthorityVerifierV1 => ({
  verify: ({ evidence }) => verifyAuthorityEvidenceV1({
    policy: evidence.policy,
    context: evidence.context,
    didProvider: input.didProvider,
    trustProvider: input.trustProvider,
  }),
});

const publicProofDigest = (
  evidence: AuthenticatedRootStatusEvidenceV1,
): StatusSha256DigestV1 => evidence.privacy === "public"
  ? evidence.proofDigest
  : computeStatusRecordDigestV1({
      domain: "midnight:vc:private-status-proof-scope:v1",
      challengeDigest: evidence.challengeDigest,
      credentialBindingDigest: evidence.credentialBindingDigest,
      presentationBindingDigest: evidence.presentationBindingDigest,
      privateProofDigest: evidence.proofDigest,
    });

const externalTranscript = (
  policy: AuthenticatedRootStatusPolicyV1,
  evidence: AuthenticatedRootStatusEvidenceV1 | null,
  overrides: Partial<CanonicalStatusVerificationTranscriptV1> = {},
): CanonicalStatusVerificationTranscriptV1 => Object.freeze({
  formatVersion: 1,
  domain: "midnight:vc:authenticated-status-verification:v1",
  profile: policy.profile,
  mode: "external-nonmembership",
  binding: policy.binding,
  root: evidence?.root ?? policy.acceptedRoot,
  registryVersion: evidence?.registryVersion ?? policy.acceptedRegistryVersion,
  privacy: evidence?.privacy ?? "public",
  subjectDigest: evidence === null ? zeroDigest : scopedSubjectDigest(evidence),
  freshnessPolicyDigest: policy.freshnessPolicyDigest,
  freshnessAnchorDigest: null,
  authorityPolicyDigest: evidence === null
    ? policy.acceptedAuthorityPolicyDigest
    : authorityPolicyDigestOrZero(evidence),
  authorityTranscriptDigest: null,
  proofDigest: evidence === null ? null : publicProofDigest(evidence),
  result: "not-evaluated",
  ...overrides,
});

const shapeReason = (
  policy: AuthenticatedRootStatusPolicyV1,
  evidence: AuthenticatedRootStatusEvidenceV1,
): string | null => {
  if (evidence.formatVersion !== 1) return "EVIDENCE_VERSION_MISMATCH";
  if (evidence.profile !== policy.profile) return "PROFILE_MISMATCH";
  const mismatch = bindingMismatch(policy.binding, evidence.binding);
  if (mismatch !== null) return mismatch;
  if (evidence.root !== policy.acceptedRoot) return "ROOT_MISMATCH";
  if (evidence.registryVersion !== policy.acceptedRegistryVersion) return "REGISTRY_VERSION_MISMATCH";
  if (evidence.freshnessPolicyDigest !== policy.freshnessPolicyDigest) return "FRESHNESS_POLICY_MISMATCH";
  if (evidence.leaf !== policy.acceptedLeaf) return "STATUS_SUBJECT_MISMATCH";
  if (evidence.credentialBindingDigest !== policy.acceptedCredentialBindingDigest) return "CREDENTIAL_BINDING_MISMATCH";
  if (evidence.presentationBindingDigest !== policy.acceptedPresentationBindingDigest) return "PRESENTATION_BINDING_MISMATCH";
  if (evidence.challengeDigest !== policy.acceptedChallengeDigest) return "CHALLENGE_MISMATCH";
  if (
    !isDigest(policy.acceptedAuthorityPolicyDigest) ||
    authorityPolicyDigest(evidence) !== policy.acceptedAuthorityPolicyDigest
  ) return "ROOT_AUTHORITY_POLICY_MISMATCH";
  if (
    evidence.authority.policy.profile.id !== evidence.profile ||
    evidence.authority.policy.did.network !== evidence.binding.network
  ) return "ROOT_AUTHORITY_MISMATCH";
  if (!isDigest(evidence.leaf) || !isDigest(evidence.credentialBindingDigest) || !isDigest(evidence.presentationBindingDigest) || !isDigest(evidence.challengeDigest)) return "MALFORMED_STATUS_EVIDENCE";
  if (!Number.isSafeInteger(evidence.observedAt) || !Number.isSafeInteger(evidence.expiresAt) || evidence.observedAt < 0 || evidence.expiresAt < evidence.observedAt) return "MALFORMED_STATUS_EVIDENCE";
  const actualProofDigest = computeStatusMerkleProofDigestV1(evidence.proof);
  if (actualProofDigest !== evidence.proofDigest) return "PROOF_DIGEST_MISMATCH";
  const expectedStatementDigest = computeStatusRecordDigestV1(proofStatement(evidence));
  if (evidence.authority.context.requestDigest !== expectedStatementDigest) return "STATUS_STATEMENT_DIGEST_MISMATCH";
  if (evidence.authority.context.proofDigest !== evidence.proofDigest || evidence.authority.context.credentialDigest !== evidence.credentialBindingDigest || evidence.authority.context.presentationDigest !== evidence.presentationBindingDigest) return "AUTHORITY_CONTEXT_MISMATCH";
  const statusActor = evidence.authority.policy.actors.find(({ role }) => role === "status");
  if (
    statusActor === undefined ||
    statusActor.did !== policy.acceptedAuthority.did ||
    statusActor.methodId !== policy.acceptedAuthority.methodId ||
    statusActor.keyFingerprint !== policy.acceptedAuthority.keyFingerprint ||
    statusActor.relationship !== policy.acceptedAuthority.relationship
  ) return "ROOT_AUTHORITY_MISMATCH";
  return null;
};

export const verifyAuthenticatedRootStatusV1 = async (input: {
  readonly policy: AuthenticatedRootStatusPolicyV1;
  readonly evidence: AuthenticatedRootStatusEvidenceV1 | null | undefined;
  readonly proofVerifier: StatusCryptographicProofVerifierV1;
  readonly privateProofVerifier?: PrivateStatusCryptographicProofVerifierV1;
  readonly authorityVerifier: StatusRootAuthorityVerifierV1;
  readonly freshnessVerifier: StatusRootFreshnessVerifierV1;
}): Promise<StatusEvidenceVerificationResultV1> => {
  const evidence = input.evidence ?? null;
  if (evidence === null) return result("indeterminate", ["STATUS_PROOF_UNAVAILABLE"], externalTranscript(input.policy, null));
  if (evidence.privacy === "private" && input.privateProofVerifier === undefined) {
    return result("indeterminate", ["PRIVATE_STATUS_PROOF_UNAVAILABLE"], externalTranscript(input.policy, evidence));
  }
  let reason: string | null;
  try {
    reason = shapeReason(input.policy, evidence);
  } catch {
    reason = "MALFORMED_STATUS_EVIDENCE";
  }
  if (reason !== null) return result("invalid", [reason], externalTranscript(input.policy, evidence));

  let proofAccepted: boolean;
  try {
    const proofVerifier = evidence.privacy === "private"
      ? input.privateProofVerifier!
      : input.proofVerifier;
    proofAccepted = await proofVerifier.verify({ root: evidence.root, leaf: evidence.leaf, result: evidence.result, proof: evidence.proof });
  } catch {
    return result("indeterminate", ["STATUS_PROOF_UNAVAILABLE"], externalTranscript(input.policy, evidence));
  }
  if (proofAccepted !== true) return result("invalid", ["STATUS_PROOF_INVALID"], externalTranscript(input.policy, evidence));

  let authority: AuthorityEvidenceVerificationResultV1;
  try {
    authority = await input.authorityVerifier.verify({ evidence: evidence.authority });
  } catch {
    return result("indeterminate", ["ROOT_AUTHORITY_UNAVAILABLE"], externalTranscript(input.policy, evidence));
  }
  if (
    authority.accepted !== true ||
    authority.status !== "valid" ||
    authority.decisionStatus !== "approved" ||
    !isDigest(authority.transcriptDigest)
  ) {
    return result(authority.status === "indeterminate" ? "indeterminate" : "invalid", [authority.status === "indeterminate" ? "ROOT_AUTHORITY_UNAVAILABLE" : "ROOT_AUTHORITY_INVALID"], externalTranscript(input.policy, evidence, { authorityTranscriptDigest: authority.transcriptDigest }));
  }

  let freshness: StatusRootFreshnessVerificationV1;
  try {
    freshness = await input.freshnessVerifier.verify({
      binding: evidence.binding,
      root: evidence.root,
      registryVersion: evidence.registryVersion,
      observedAt: evidence.observedAt,
      expiresAt: evidence.expiresAt,
      freshnessPolicyDigest: evidence.freshnessPolicyDigest,
      evidence: evidence.freshnessEvidence,
    });
  } catch {
    return result("indeterminate", ["FRESHNESS_EVIDENCE_UNAVAILABLE"], externalTranscript(input.policy, evidence, { authorityTranscriptDigest: authority.transcriptDigest }));
  }
  if (freshness.status !== "valid" || freshness.anchorDigest === null || !isDigest(freshness.anchorDigest)) {
    return result(freshness.status === "invalid" ? "invalid" : "indeterminate", [freshness.status === "invalid" ? "STALE_ROOT" : "FRESHNESS_EVIDENCE_UNAVAILABLE"], externalTranscript(input.policy, evidence, { authorityTranscriptDigest: authority.transcriptDigest, freshnessAnchorDigest: freshness.anchorDigest }));
  }

  const transcript = externalTranscript(input.policy, evidence, {
    authorityTranscriptDigest: authority.transcriptDigest,
    freshnessAnchorDigest: freshness.anchorDigest,
    result: evidence.result,
  });
  return evidence.result === "revoked"
    ? result("invalid", ["STATUS_REVOKED"], transcript)
    : result("valid", [], transcript);
};

export type SameContractStatusPrivacyV1 =
  | { readonly mode: "public" }
  | {
      readonly mode: "private";
      readonly challengeDigest: StatusSha256DigestV1;
      readonly credentialBindingDigest: StatusSha256DigestV1;
      readonly presentationBindingDigest: StatusSha256DigestV1;
    };

export const verifySameContractStatusV1 = (input: {
  readonly profile: StatusVerificationProfileV1;
  readonly binding: StatusRegistryBindingV1;
  readonly state: StatusRegistryStateV1;
  readonly statusHandleDigest: StatusSha256DigestV1;
  readonly expectedAuthorityDid: string;
  readonly privacy: SameContractStatusPrivacyV1;
  readonly freshnessPolicyDigest: StatusSha256DigestV1;
}): StatusEvidenceVerificationResultV1 => {
  const subjectDigest = input.privacy.mode === "public"
    ? input.statusHandleDigest
    : scopedSubjectDigest({ privacy: "private", leaf: input.statusHandleDigest, ...input.privacy });
  const transcript: CanonicalStatusVerificationTranscriptV1 = Object.freeze({
    formatVersion: 1,
    domain: "midnight:vc:authenticated-status-verification:v1",
    profile: input.profile,
    mode: "same-contract-live",
    binding: input.binding,
    root: input.state.revokedRoot,
    registryVersion: input.state.registryVersion,
    privacy: input.privacy.mode,
    subjectDigest,
    freshnessPolicyDigest: input.freshnessPolicyDigest,
    freshnessAnchorDigest: computeStatusRecordDigestV1({ domain: "midnight:vc:same-contract-status-anchor:v1", binding: input.state.binding, root: input.state.revokedRoot, registryVersion: input.state.registryVersion, authorityGeneration: input.state.authorityGeneration }),
    authorityPolicyDigest: null,
    authorityTranscriptDigest: null,
    proofDigest: null,
    result: "not-evaluated",
  });
  if (input.profile !== "ledger-local-v1") return result("invalid", ["PROFILE_MISMATCH"], transcript);
  if (!input.state.initialized) return result("indeterminate", ["STATUS_STATE_UNAVAILABLE"], transcript);
  const mismatch = bindingMismatch(input.binding, input.state.binding);
  if (mismatch !== null) return result("invalid", [mismatch], transcript);
  if (input.state.controllerDid !== input.expectedAuthorityDid) return result("invalid", ["ROOT_AUTHORITY_MISMATCH"], transcript);
  if (
    !Number.isSafeInteger(input.state.registryVersion) ||
    input.state.registryVersion < 1 ||
    input.state.revokedStatusHandleCount !== input.state.revokedStatusHandleDigests.length
  ) return result("invalid", ["MALFORMED_STATUS_EVIDENCE"], transcript);
  let computedRoot: StatusSha256DigestV1;
  try {
    computedRoot = computeStatusRegistryRootV1(input.state.revokedStatusHandleDigests);
  } catch {
    return result("invalid", ["MALFORMED_STATUS_EVIDENCE"], transcript);
  }
  if (computedRoot !== input.state.revokedRoot) return result("invalid", ["ROOT_MISMATCH"], transcript);
  if (!isDigest(input.statusHandleDigest) || !isDigest(input.freshnessPolicyDigest)) return result("invalid", ["MALFORMED_STATUS_EVIDENCE"], transcript);
  const revoked = input.state.revokedStatusHandleDigests.includes(input.statusHandleDigest);
  const evaluated = Object.freeze({ ...transcript, result: revoked ? "revoked" as const : "not-revoked" as const });
  return revoked ? result("invalid", ["STATUS_REVOKED"], evaluated) : result("valid", [], evaluated);
};
