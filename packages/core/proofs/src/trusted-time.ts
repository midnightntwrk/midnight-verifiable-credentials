import {
  type AuthorityEvidencePolicyV1,
  type AuthorityEvidenceVerificationResultV1,
  type AuthorityVerificationContextV1,
  type DidMethodEvidenceProviderV1,
  type TrustAuthorizationEvidenceProviderV1,
  verifyAuthorityEvidenceV1,
} from "./authority-evidence.js";
import {
  computeSha256Digest,
  isSha256Digest,
  serializeCanonicalJson,
} from "./serialization.js";
import type { Sha256Digest } from "./types.js";

export type TrustedTimeProfileV1 =
  | "ledger-local-v1"
  | "ledger-attested-v1"
  | "offchain-public-v1";

export type TrustedTimeModeV1 =
  | "ledger"
  | "authority-attested"
  | "local-reference";

export interface TrustedTimeScopeV1 {
  readonly network: string;
  readonly deployment: string;
  readonly requestDigest: Sha256Digest;
  readonly challengeDigest: Sha256Digest;
  readonly audienceDigest: Sha256Digest;
  readonly originDigest: Sha256Digest;
  readonly profile: TrustedTimeProfileV1;
  readonly freshnessPolicyDigest: Sha256Digest;
}

export interface TrustedTimePolicyV1 {
  readonly formatVersion: 1;
  readonly mode: TrustedTimeModeV1;
  readonly unit: "unix-seconds";
  readonly sourcePolicyDigest: Sha256Digest;
  /** Stable ledger source or attestor DID used to scope monotonic sequence state. */
  readonly sequenceAuthority: string;
  readonly maximumEvidenceAge: number;
  readonly maximumFutureSkew: number;
  readonly minimumSequence: number;
}

export interface TrustedTimeStatementV1 {
  readonly formatVersion: 1;
  readonly scope: TrustedTimeScopeV1;
  readonly unit: "unix-seconds";
  readonly time: number;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly sequence: number;
  readonly sourcePolicyDigest: Sha256Digest;
}

export interface TrustedTimeAnchorV1 {
  readonly formatVersion: 1;
  readonly scope: TrustedTimeScopeV1;
  readonly unit: "unix-seconds";
  readonly time: number;
  readonly sourcePolicyDigest: Sha256Digest;
}

export interface TrustedTimeAttestationSignatureV1 {
  readonly formatVersion: 1;
  readonly signerDid: string;
  readonly methodId: string;
  readonly keyFingerprint: Sha256Digest;
  readonly payloadDigest: Sha256Digest;
  readonly signature: string;
}

export interface TrustedTimeAuthorityEvidenceV1 {
  readonly policy: AuthorityEvidencePolicyV1;
  readonly context: AuthorityVerificationContextV1;
  readonly signature: TrustedTimeAttestationSignatureV1;
}

export interface TrustedTimeAttestationSignatureVerifierV1 {
  verify(input: {
    readonly domain: "midnight:vc:trusted-time-statement:v1";
    readonly payloadDigest: Sha256Digest;
    readonly signature: TrustedTimeAttestationSignatureV1;
  }): Promise<boolean>;
}

export interface TrustedTimeEvidenceV1 {
  readonly formatVersion: 1;
  readonly mode: TrustedTimeModeV1;
  readonly statement: TrustedTimeStatementV1;
  readonly statementDigest: Sha256Digest;
  readonly anchor: TrustedTimeAnchorV1;
  readonly anchorDigest: Sha256Digest;
  readonly authority: TrustedTimeAuthorityEvidenceV1 | null;
}

export interface TrustedTimeAnchorVerificationV1 {
  readonly status: "valid" | "invalid" | "indeterminate";
  readonly currentTime?: number;
  readonly anchorDigest?: Sha256Digest;
}

export interface TrustedTimeAnchorVerifierV1 {
  verify(input: {
    readonly policy: TrustedTimePolicyV1;
    readonly scope: TrustedTimeScopeV1;
    readonly evidence: TrustedTimeEvidenceV1;
    readonly evidenceDigest: Sha256Digest;
  }): Promise<TrustedTimeAnchorVerificationV1>;
}

export interface TrustedTimeAuthorityVerifierV1 {
  /** Verifier-selected policy; evidence can only prove conformance to this policy. */
  readonly selectedPolicy: AuthorityEvidencePolicyV1;
  verify(input: {
    readonly evidence: TrustedTimeAuthorityEvidenceV1;
  }): Promise<AuthorityEvidenceVerificationResultV1>;
}

export interface TrustedTimeSequenceKeyV1 {
  readonly formatVersion: 1;
  readonly network: string;
  readonly deployment: string;
  readonly authority: string;
  readonly sourcePolicyDigest: Sha256Digest;
}

export interface TrustedTimeCheckpointV1 {
  readonly sequenceKeyDigest: Sha256Digest;
  readonly sourcePolicyDigest: Sha256Digest;
  readonly sequence: number;
  readonly time: number;
  readonly evidenceDigest: Sha256Digest;
}

export type TrustedTimeReasonCodeV1 =
  | "MALFORMED_TRUSTED_TIME_EVIDENCE"
  | "TRUSTED_TIME_EVIDENCE_UNAVAILABLE"
  | "TRUSTED_TIME_MODE_MISMATCH"
  | "TRUSTED_TIME_SCOPE_MISMATCH"
  | "TRUSTED_TIME_SOURCE_POLICY_MISMATCH"
  | "TRUSTED_TIME_STATEMENT_DIGEST_MISMATCH"
  | "TRUSTED_TIME_ANCHOR_DIGEST_MISMATCH"
  | "TRUSTED_TIME_ANCHOR_UNAVAILABLE"
  | "TRUSTED_TIME_ANCHOR_INVALID"
  | "TRUSTED_TIME_AUTHORITY_UNAVAILABLE"
  | "TRUSTED_TIME_AUTHORITY_INVALID"
  | "TRUSTED_TIME_AUTHORITY_MISMATCH"
  | "TRUSTED_TIME_FUTURE"
  | "TRUSTED_TIME_STALE"
  | "TRUSTED_TIME_EXPIRED"
  | "TRUSTED_TIME_ROLLBACK"
  | "TRUSTED_TIME_REPLAYED"
  | "LOCAL_REFERENCE_TIME_NOT_ALLOWED";

export interface TrustedTimeVerificationResultV1 {
  readonly status: "malformed" | "invalid" | "indeterminate" | "valid";
  readonly accepted: boolean;
  readonly authoritative: boolean;
  readonly authority: "ledger-local" | "ledger-attested" | "local-process";
  readonly trustedTime: number | null;
  readonly reasonCodes: readonly TrustedTimeReasonCodeV1[];
  readonly evidenceDigest: Sha256Digest | null;
  readonly anchorDigest: Sha256Digest | null;
  readonly authorityTranscriptDigest: Sha256Digest | null;
  readonly checkpoint: TrustedTimeCheckpointV1 | null;
}

const safeNonNegativeInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;

const nonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const objectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sameScope = (left: TrustedTimeScopeV1, right: TrustedTimeScopeV1): boolean =>
  left.network === right.network &&
  left.deployment === right.deployment &&
  left.requestDigest === right.requestDigest &&
  left.challengeDigest === right.challengeDigest &&
  left.audienceDigest === right.audienceDigest &&
  left.originDigest === right.originDigest &&
  left.profile === right.profile &&
  left.freshnessPolicyDigest === right.freshnessPolicyDigest;

const validScope = (scope: TrustedTimeScopeV1): boolean =>
  scope.network.length > 0 &&
  scope.deployment.length > 0 &&
  isSha256Digest(scope.requestDigest) &&
  isSha256Digest(scope.challengeDigest) &&
  isSha256Digest(scope.audienceDigest) &&
  isSha256Digest(scope.originDigest) &&
  isSha256Digest(scope.freshnessPolicyDigest) &&
  ["ledger-local-v1", "ledger-attested-v1", "offchain-public-v1"].includes(
    scope.profile,
  );

const validPolicy = (policy: TrustedTimePolicyV1): boolean =>
  policy.formatVersion === 1 &&
  ["ledger", "authority-attested", "local-reference"].includes(policy.mode) &&
  policy.unit === "unix-seconds" &&
  isSha256Digest(policy.sourcePolicyDigest) &&
  nonEmptyString(policy.sequenceAuthority) &&
  safeNonNegativeInteger(policy.maximumEvidenceAge) &&
  safeNonNegativeInteger(policy.maximumFutureSkew) &&
  safeNonNegativeInteger(policy.minimumSequence);

const validAuthorityActorShape = (value: unknown): boolean =>
  objectRecord(value) &&
  ["issuer", "holder", "verifier", "status"].includes(value.role as string) &&
  nonEmptyString(value.did) &&
  nonEmptyString(value.methodId) &&
  isSha256Digest(value.keyFingerprint) &&
  nonEmptyString(value.relationship) &&
  nonEmptyString(value.stateVersion) &&
  nonEmptyString(value.trustEpoch);

const validProviderIdentityShape = (value: unknown): boolean =>
  objectRecord(value) &&
  nonEmptyString(value.requirementId) &&
  nonEmptyString(value.role) &&
  nonEmptyString(value.providerId) &&
  nonEmptyString(value.providerVersion) &&
  nonEmptyString(value.instanceId);

const validAuthorityPolicyShape = (value: unknown): value is AuthorityEvidencePolicyV1 =>
  objectRecord(value) &&
  value.formatVersion === 1 &&
  objectRecord(value.profile) &&
  nonEmptyString(value.profile.id) &&
  nonEmptyString(value.profile.version) &&
  objectRecord(value.did) &&
  nonEmptyString(value.did.method) &&
  nonEmptyString(value.did.issuerRelationship) &&
  nonEmptyString(value.did.network) &&
  nonEmptyString(value.did.versionEvidence) &&
  objectRecord(value.trust) &&
  nonEmptyString(value.trust.scope) &&
  nonEmptyString(value.trust.epochEvidence) &&
  objectRecord(value.providers) &&
  validProviderIdentityShape(value.providers.did) &&
  validProviderIdentityShape(value.providers.trust) &&
  Array.isArray(value.actors) &&
  value.actors.length === 4 &&
  new Set(value.actors.map((actor) =>
    objectRecord(actor) ? actor.role : undefined,
  )).size === 4 &&
  value.actors.every(validAuthorityActorShape);

const validAuthorityShape = (evidence: TrustedTimeEvidenceV1): boolean => {
  if (evidence.mode !== "authority-attested") return evidence.authority === null;
  if (!objectRecord(evidence.authority)) return false;
  const { policy, context, signature } = evidence.authority;
  return (
    validAuthorityPolicyShape(policy) &&
    objectRecord(context) &&
    isSha256Digest(context.proofDigest) &&
    isSha256Digest(context.credentialDigest) &&
    isSha256Digest(context.presentationDigest) &&
    isSha256Digest(context.requestDigest) &&
    objectRecord(signature) &&
    signature.formatVersion === 1 &&
    nonEmptyString(signature.signerDid) &&
    nonEmptyString(signature.methodId) &&
    isSha256Digest(signature.keyFingerprint) &&
    isSha256Digest(signature.payloadDigest) &&
    nonEmptyString(signature.signature)
  );
};

const validEvidenceShape = (evidence: TrustedTimeEvidenceV1): boolean => {
  const { statement, anchor } = evidence;
  return (
    evidence.formatVersion === 1 &&
    ["ledger", "authority-attested", "local-reference"].includes(evidence.mode) &&
    statement.formatVersion === 1 &&
    anchor.formatVersion === 1 &&
    validScope(statement.scope) &&
    validScope(anchor.scope) &&
    statement.unit === "unix-seconds" &&
    anchor.unit === "unix-seconds" &&
    safeNonNegativeInteger(statement.time) &&
    safeNonNegativeInteger(statement.issuedAt) &&
    safeNonNegativeInteger(statement.expiresAt) &&
    safeNonNegativeInteger(statement.sequence) &&
    safeNonNegativeInteger(anchor.time) &&
    isSha256Digest(statement.sourcePolicyDigest) &&
    isSha256Digest(anchor.sourcePolicyDigest) &&
    isSha256Digest(evidence.statementDigest) &&
    isSha256Digest(evidence.anchorDigest) &&
    validAuthorityShape(evidence)
  );
};

const digestRecord = (value: unknown): Promise<Sha256Digest> =>
  computeSha256Digest(serializeCanonicalJson(value));

export const computeTrustedTimeScopeDigestV1 = (
  scope: TrustedTimeScopeV1,
): Promise<Sha256Digest> =>
  digestRecord({ ...scope, domain: "midnight:vc:trusted-time-scope:v1" });

export const computeTrustedTimeSequenceKeyDigestV1 = (
  key: TrustedTimeSequenceKeyV1,
): Promise<Sha256Digest> =>
  digestRecord({ ...key, domain: "midnight:vc:trusted-time-sequence-key:v1" });

export const computeTrustedTimeStatementDigestV1 = (
  statement: TrustedTimeStatementV1,
): Promise<Sha256Digest> =>
  digestRecord({ ...statement, domain: "midnight:vc:trusted-time-statement:v1" });

export const computeTrustedTimeAnchorDigestV1 = (
  anchor: TrustedTimeAnchorV1,
): Promise<Sha256Digest> =>
  digestRecord({ ...anchor, domain: "midnight:vc:trusted-time-anchor:v1" });

export const computeTrustedTimeEvidenceDigestV1 = (
  evidence: TrustedTimeEvidenceV1,
): Promise<Sha256Digest> =>
  digestRecord({ ...evidence, domain: "midnight:vc:trusted-time-evidence:v1" });

export const computeTrustedTimeAuthorityPolicyDigestV1 = (
  policy: AuthorityEvidencePolicyV1,
): Promise<Sha256Digest> =>
  digestRecord({ ...policy, domain: "midnight:vc:trusted-time-source-policy:v1" });

export const createTrustedTimeAuthorityVerifierV1 = (input: {
  readonly policy: AuthorityEvidencePolicyV1;
  readonly didProvider: DidMethodEvidenceProviderV1;
  readonly trustProvider: TrustAuthorizationEvidenceProviderV1;
}): TrustedTimeAuthorityVerifierV1 => ({
  selectedPolicy: input.policy,
  verify: ({ evidence }) =>
    verifyAuthorityEvidenceV1({
      policy: input.policy,
      context: evidence.context,
      didProvider: input.didProvider,
      trustProvider: input.trustProvider,
    }),
});

const failed = (
  status: TrustedTimeVerificationResultV1["status"],
  reasonCode: TrustedTimeReasonCodeV1,
  evidenceDigest: Sha256Digest | null = null,
  anchorDigest: Sha256Digest | null = null,
  authorityTranscriptDigest: Sha256Digest | null = null,
): TrustedTimeVerificationResultV1 => ({
  status,
  accepted: false,
  authoritative: false,
  authority: "local-process",
  trustedTime: null,
  reasonCodes: [reasonCode],
  evidenceDigest,
  anchorDigest,
  authorityTranscriptDigest,
  checkpoint: null,
});

export const verifyTrustedTimeEvidenceV1 = async (input: {
  readonly policy: TrustedTimePolicyV1;
  readonly scope: TrustedTimeScopeV1;
  readonly evidence: TrustedTimeEvidenceV1 | null | undefined;
  readonly anchorVerifier?: TrustedTimeAnchorVerifierV1;
  readonly authorityVerifier?: TrustedTimeAuthorityVerifierV1;
  readonly signatureVerifier?: TrustedTimeAttestationSignatureVerifierV1;
  readonly previousCheckpoint?: TrustedTimeCheckpointV1 | null;
}): Promise<TrustedTimeVerificationResultV1> => {
  if (!validPolicy(input.policy) || !validScope(input.scope)) {
    return failed("malformed", "MALFORMED_TRUSTED_TIME_EVIDENCE");
  }
  const evidence = input.evidence ?? null;
  if (evidence === null) {
    return failed("indeterminate", "TRUSTED_TIME_EVIDENCE_UNAVAILABLE");
  }
  if (typeof evidence !== "object" || Array.isArray(evidence)) {
    return failed("malformed", "MALFORMED_TRUSTED_TIME_EVIDENCE");
  }
  try {
    if (!validEvidenceShape(evidence)) {
      return failed("malformed", "MALFORMED_TRUSTED_TIME_EVIDENCE");
    }
  } catch {
    return failed("malformed", "MALFORMED_TRUSTED_TIME_EVIDENCE");
  }

  let evidenceDigest: Sha256Digest;
  let statementDigest: Sha256Digest;
  let anchorDigest: Sha256Digest;
  let sequenceKeyDigest: Sha256Digest;
  try {
    [evidenceDigest, statementDigest, anchorDigest, sequenceKeyDigest] = await Promise.all([
      computeTrustedTimeEvidenceDigestV1(evidence),
      computeTrustedTimeStatementDigestV1(evidence.statement),
      computeTrustedTimeAnchorDigestV1(evidence.anchor),
      computeTrustedTimeSequenceKeyDigestV1({
        formatVersion: 1,
        network: input.scope.network,
        deployment: input.scope.deployment,
        authority: input.policy.sequenceAuthority,
        sourcePolicyDigest: input.policy.sourcePolicyDigest,
      }),
    ]);
  } catch {
    return failed("malformed", "MALFORMED_TRUSTED_TIME_EVIDENCE");
  }

  if (evidence.mode !== input.policy.mode) {
    return failed("invalid", "TRUSTED_TIME_MODE_MISMATCH", evidenceDigest);
  }
  if (
    !sameScope(evidence.statement.scope, input.scope) ||
    !sameScope(evidence.anchor.scope, input.scope)
  ) {
    return failed("invalid", "TRUSTED_TIME_SCOPE_MISMATCH", evidenceDigest);
  }
  if (
    evidence.statement.sourcePolicyDigest !== input.policy.sourcePolicyDigest ||
    evidence.anchor.sourcePolicyDigest !== input.policy.sourcePolicyDigest
  ) {
    return failed(
      "invalid",
      "TRUSTED_TIME_SOURCE_POLICY_MISMATCH",
      evidenceDigest,
    );
  }
  if (statementDigest !== evidence.statementDigest) {
    return failed(
      "invalid",
      "TRUSTED_TIME_STATEMENT_DIGEST_MISMATCH",
      evidenceDigest,
    );
  }
  if (anchorDigest !== evidence.anchorDigest) {
    return failed(
      "invalid",
      "TRUSTED_TIME_ANCHOR_DIGEST_MISMATCH",
      evidenceDigest,
    );
  }

  const expectedProfile =
    evidence.mode === "ledger"
      ? "ledger-local-v1"
      : evidence.mode === "authority-attested"
        ? "ledger-attested-v1"
        : "offchain-public-v1";
  if (input.scope.profile !== expectedProfile) {
    return failed(
      "invalid",
      evidence.mode === "local-reference"
        ? "LOCAL_REFERENCE_TIME_NOT_ALLOWED"
        : "TRUSTED_TIME_MODE_MISMATCH",
      evidenceDigest,
    );
  }

  let currentTime = evidence.statement.time;
  let acceptedAnchorDigest: Sha256Digest | null = null;
  if (evidence.mode !== "local-reference") {
    if (input.anchorVerifier === undefined) {
      return failed(
        "indeterminate",
        "TRUSTED_TIME_ANCHOR_UNAVAILABLE",
        evidenceDigest,
      );
    }
    let verifiedAnchor: TrustedTimeAnchorVerificationV1;
    try {
      verifiedAnchor = await input.anchorVerifier.verify({
        policy: input.policy,
        scope: input.scope,
        evidence,
        evidenceDigest,
      });
    } catch {
      return failed(
        "indeterminate",
        "TRUSTED_TIME_ANCHOR_UNAVAILABLE",
        evidenceDigest,
      );
    }
    if (verifiedAnchor.status === "indeterminate") {
      return failed(
        "indeterminate",
        "TRUSTED_TIME_ANCHOR_UNAVAILABLE",
        evidenceDigest,
      );
    }
    if (
      verifiedAnchor.status !== "valid" ||
      !safeNonNegativeInteger(verifiedAnchor.currentTime) ||
      verifiedAnchor.currentTime !== evidence.anchor.time ||
      verifiedAnchor.anchorDigest !== evidence.anchorDigest
    ) {
      return failed(
        "invalid",
        "TRUSTED_TIME_ANCHOR_INVALID",
        evidenceDigest,
      );
    }
    currentTime = verifiedAnchor.currentTime;
    acceptedAnchorDigest = verifiedAnchor.anchorDigest;
  }

  let authorityTranscriptDigest: Sha256Digest | null = null;
  if (evidence.mode === "authority-attested") {
    if (
      evidence.authority === null ||
      input.authorityVerifier === undefined ||
      input.signatureVerifier === undefined
    ) {
      return failed(
        "indeterminate",
        "TRUSTED_TIME_AUTHORITY_UNAVAILABLE",
        evidenceDigest,
        acceptedAnchorDigest,
      );
    }
    const selectedAuthorityPolicy = input.authorityVerifier.selectedPolicy;
    let policyAccepted: boolean;
    try {
      if (!validAuthorityPolicyShape(selectedAuthorityPolicy)) {
        return failed(
          "invalid",
          "TRUSTED_TIME_AUTHORITY_MISMATCH",
          evidenceDigest,
          acceptedAnchorDigest,
        );
      }
      const [selectedPolicyDigest, evidencePolicyDigest] = await Promise.all([
        computeTrustedTimeAuthorityPolicyDigestV1(selectedAuthorityPolicy),
        computeTrustedTimeAuthorityPolicyDigestV1(evidence.authority.policy),
      ]);
      policyAccepted =
        selectedPolicyDigest === input.policy.sourcePolicyDigest &&
        evidencePolicyDigest === selectedPolicyDigest;
    } catch {
      return failed(
        "indeterminate",
        "TRUSTED_TIME_AUTHORITY_UNAVAILABLE",
        evidenceDigest,
        acceptedAnchorDigest,
      );
    }
    if (!policyAccepted) {
      return failed(
        "invalid",
        "TRUSTED_TIME_AUTHORITY_MISMATCH",
        evidenceDigest,
        acceptedAnchorDigest,
      );
    }
    const timeActor = selectedAuthorityPolicy.actors.find(
      (actor) => actor.role === "verifier",
    );
    const signature = evidence.authority.signature;
    if (
      evidence.authority.context.requestDigest !== evidence.statementDigest ||
      selectedAuthorityPolicy.profile.id !== input.scope.profile ||
      selectedAuthorityPolicy.did.network !== input.scope.network ||
      timeActor === undefined ||
      timeActor.did !== input.policy.sequenceAuthority ||
      signature.formatVersion !== 1 ||
      signature.payloadDigest !== evidence.statementDigest ||
      signature.signerDid !== timeActor.did ||
      signature.methodId !== timeActor.methodId ||
      signature.keyFingerprint !== timeActor.keyFingerprint ||
      signature.signature.length === 0
    ) {
      return failed(
        "invalid",
        "TRUSTED_TIME_AUTHORITY_MISMATCH",
        evidenceDigest,
        acceptedAnchorDigest,
      );
    }
    let verifiedAuthority: AuthorityEvidenceVerificationResultV1;
    try {
      verifiedAuthority = await input.authorityVerifier.verify({
        evidence: evidence.authority,
      });
    } catch {
      return failed(
        "indeterminate",
        "TRUSTED_TIME_AUTHORITY_UNAVAILABLE",
        evidenceDigest,
        acceptedAnchorDigest,
      );
    }
    authorityTranscriptDigest = verifiedAuthority.transcriptDigest;
    if (!verifiedAuthority.accepted) {
      return failed(
        verifiedAuthority.status === "indeterminate" ? "indeterminate" : "invalid",
        verifiedAuthority.status === "indeterminate"
          ? "TRUSTED_TIME_AUTHORITY_UNAVAILABLE"
          : "TRUSTED_TIME_AUTHORITY_INVALID",
        evidenceDigest,
        acceptedAnchorDigest,
        authorityTranscriptDigest,
      );
    }
    let signatureAccepted: boolean;
    try {
      signatureAccepted = await input.signatureVerifier.verify({
        domain: "midnight:vc:trusted-time-statement:v1",
        payloadDigest: evidence.statementDigest,
        signature,
      });
    } catch {
      return failed(
        "indeterminate",
        "TRUSTED_TIME_AUTHORITY_UNAVAILABLE",
        evidenceDigest,
        acceptedAnchorDigest,
        authorityTranscriptDigest,
      );
    }
    if (!signatureAccepted) {
      return failed(
        "invalid",
        "TRUSTED_TIME_AUTHORITY_INVALID",
        evidenceDigest,
        acceptedAnchorDigest,
        authorityTranscriptDigest,
      );
    }
  } else if (evidence.authority !== null) {
    return failed(
      "malformed",
      "MALFORMED_TRUSTED_TIME_EVIDENCE",
      evidenceDigest,
      acceptedAnchorDigest,
    );
  }

  const { statement } = evidence;
  if (
    statement.issuedAt > statement.time ||
    statement.time > statement.expiresAt ||
    currentTime > statement.expiresAt
  ) {
    return failed(
      "invalid",
      "TRUSTED_TIME_EXPIRED",
      evidenceDigest,
      acceptedAnchorDigest,
      authorityTranscriptDigest,
    );
  }
  if (
    statement.time > currentTime &&
    statement.time - currentTime > input.policy.maximumFutureSkew
  ) {
    return failed(
      "invalid",
      "TRUSTED_TIME_FUTURE",
      evidenceDigest,
      acceptedAnchorDigest,
      authorityTranscriptDigest,
    );
  }
  if (
    statement.issuedAt > currentTime &&
    statement.issuedAt - currentTime > input.policy.maximumFutureSkew
  ) {
    return failed(
      "invalid",
      "TRUSTED_TIME_FUTURE",
      evidenceDigest,
      acceptedAnchorDigest,
      authorityTranscriptDigest,
    );
  }
  if (
    currentTime >= statement.time &&
    currentTime - statement.time > input.policy.maximumEvidenceAge
  ) {
    return failed(
      "invalid",
      "TRUSTED_TIME_STALE",
      evidenceDigest,
      acceptedAnchorDigest,
      authorityTranscriptDigest,
    );
  }
  if (evidence.mode === "ledger" && statement.time !== currentTime) {
    return failed(
      "invalid",
      "TRUSTED_TIME_ANCHOR_INVALID",
      evidenceDigest,
      acceptedAnchorDigest,
      authorityTranscriptDigest,
    );
  }
  if (statement.sequence <= input.policy.minimumSequence) {
    return failed(
      "invalid",
      "TRUSTED_TIME_ROLLBACK",
      evidenceDigest,
      acceptedAnchorDigest,
      authorityTranscriptDigest,
    );
  }

  const previous = input.previousCheckpoint ?? null;
  if (previous !== null) {
    if (
      previous.sequenceKeyDigest !== sequenceKeyDigest ||
      previous.sourcePolicyDigest !== input.policy.sourcePolicyDigest
    ) {
      return failed(
        "invalid",
        "TRUSTED_TIME_SCOPE_MISMATCH",
        evidenceDigest,
        acceptedAnchorDigest,
        authorityTranscriptDigest,
      );
    }
    if (previous.evidenceDigest === evidenceDigest) {
      return failed(
        "invalid",
        "TRUSTED_TIME_REPLAYED",
        evidenceDigest,
        acceptedAnchorDigest,
        authorityTranscriptDigest,
      );
    }
    if (statement.sequence <= previous.sequence || statement.time < previous.time) {
      return failed(
        "invalid",
        "TRUSTED_TIME_ROLLBACK",
        evidenceDigest,
        acceptedAnchorDigest,
        authorityTranscriptDigest,
      );
    }
  }

  const authority =
    evidence.mode === "ledger"
      ? "ledger-local"
      : evidence.mode === "authority-attested"
        ? "ledger-attested"
        : "local-process";
  return {
    status: "valid",
    accepted: true,
    authoritative: evidence.mode !== "local-reference",
    authority,
    trustedTime: statement.time,
    reasonCodes: [],
    evidenceDigest,
    anchorDigest: acceptedAnchorDigest,
    authorityTranscriptDigest,
    checkpoint: {
      sequenceKeyDigest,
      sourcePolicyDigest: input.policy.sourcePolicyDigest,
      sequence: statement.sequence,
      time: statement.time,
      evidenceDigest,
    },
  };
};
