import {
  computeSha256Digest,
  isSha256Digest,
  serializeCanonicalJson,
} from "./serialization.js";
import type { Sha256Digest } from "./types.js";

export const AUTHORITY_ACTOR_ROLES_V1 = [
  "issuer",
  "holder",
  "verifier",
  "status",
] as const;

export type AuthorityActorRoleV1 = (typeof AUTHORITY_ACTOR_ROLES_V1)[number];

/** Structural projection of the #492/#493 profile fields used by authority binding. */
export interface AuthorityEvidenceProfileV1 {
  readonly id: string;
  readonly version: string;
  readonly semantics: {
    readonly did: {
      readonly method: string;
      readonly relationship: string;
      readonly network: string;
      readonly versionEvidence: string;
    };
    readonly trust: {
      readonly scope: string;
      readonly epochEvidence: string;
    };
  };
  readonly requirements: {
    readonly providers: readonly {
      readonly id: string;
      readonly role: string;
    }[];
  };
}

export interface AuthorityResolvedProviderIdentityV1 {
  readonly requirementId: string;
  readonly role: string;
  readonly providerId: string;
  readonly providerVersion: string;
  readonly instanceId: string;
}

/** Structural projection of a resolved #492 composition provider graph. */
export interface AuthorityEvidenceCompositionV1 {
  readonly formatVersion: 1;
  readonly profile: { readonly id: string; readonly version: string };
  readonly providers: readonly AuthorityResolvedProviderIdentityV1[];
}

export interface AuthorityActorKeyRequirementV1 {
  readonly role: AuthorityActorRoleV1;
  readonly did: string;
  readonly methodId: string;
  /** Digest/fingerprint of the proof-carried public key, never the key or witness. */
  readonly keyFingerprint: Sha256Digest;
  readonly relationship: string;
  /** Exact authenticated DID state selected by the verification transcript. */
  readonly stateVersion: string;
  /** Exact authenticated trust state selected by the verification transcript. */
  readonly trustEpoch: string;
}

export interface AuthorityEvidencePolicyV1 {
  readonly formatVersion: 1;
  readonly profile: { readonly id: string; readonly version: string };
  readonly did: {
    readonly method: string;
    readonly issuerRelationship: string;
    readonly network: string;
    readonly versionEvidence: string;
  };
  readonly trust: {
    readonly scope: string;
    readonly epochEvidence: string;
  };
  readonly providers: {
    readonly did: AuthorityResolvedProviderIdentityV1;
    readonly trust: AuthorityResolvedProviderIdentityV1;
  };
  readonly actors: readonly AuthorityActorKeyRequirementV1[];
}

export type DidMethodLifecycleStatusV1 =
  | "active"
  | "rotated"
  | "revoked"
  | "deactivated";

export interface DidMethodEvidenceV1 {
  readonly formatVersion: 1;
  readonly evidenceId: string;
  readonly authenticated: boolean;
  readonly observedAt: string;
  readonly did: string;
  readonly method: string;
  readonly methodId: string;
  readonly keyFingerprint: Sha256Digest;
  readonly relationships: readonly string[];
  readonly network: string;
  readonly stateVersion: string;
  readonly versionEvidence: string;
  readonly lifecycle: {
    readonly status: DidMethodLifecycleStatusV1;
    readonly activatedAtStateVersion: string;
    readonly previousMethodId?: string;
    readonly replacedByMethodId?: string;
    readonly deactivatedAtStateVersion?: string;
  };
}

export interface TrustAuthorizationEvidenceV1 {
  readonly formatVersion: 1;
  readonly evidenceId: string;
  readonly authenticated: boolean;
  readonly observedAt: string;
  readonly subjectDid: string;
  readonly methodId: string;
  readonly keyFingerprint: Sha256Digest;
  readonly network: string;
  readonly scope: string;
  readonly epoch: string;
  readonly epochEvidence: string;
  readonly status: "active" | "suspended" | "withdrawn";
}

export type AuthorityEvidenceProviderPolicyV1 = Pick<
  AuthorityEvidencePolicyV1,
  "formatVersion" | "profile" | "did" | "trust"
>;

export interface DidMethodEvidenceRequestV1 {
  readonly formatVersion: 1;
  readonly actor: AuthorityActorKeyRequirementV1;
  readonly policy: AuthorityEvidenceProviderPolicyV1;
  readonly provider: AuthorityResolvedProviderIdentityV1;
}

export interface TrustAuthorizationEvidenceRequestV1 {
  readonly formatVersion: 1;
  readonly actor: AuthorityActorKeyRequirementV1;
  readonly policy: AuthorityEvidenceProviderPolicyV1;
  readonly provider: AuthorityResolvedProviderIdentityV1;
}

/**
 * Injected midnight-did consumption port. Implementations authenticate DID
 * method state; this package deliberately does not implement a DID method.
 */
export interface DidMethodEvidenceProviderV1 {
  resolve(
    request: DidMethodEvidenceRequestV1,
  ): Promise<DidMethodEvidenceV1 | null | undefined>;
}

/** Injected trust-evidence port; no concrete registry or governance is selected. */
export interface TrustAuthorizationEvidenceProviderV1 {
  resolve(
    request: TrustAuthorizationEvidenceRequestV1,
  ): Promise<TrustAuthorizationEvidenceV1 | null | undefined>;
}

export interface AuthorityVerificationContextV1 {
  readonly proofDigest: Sha256Digest;
  readonly credentialDigest: Sha256Digest;
  readonly presentationDigest: Sha256Digest;
  readonly requestDigest: Sha256Digest;
}

export type AuthorityEvidenceReasonCodeV1 =
  | "DID_EVIDENCE_UNAVAILABLE"
  | "DID_SUBJECT_MISMATCH"
  | "DID_METHOD_MISMATCH"
  | "DID_METHOD_REFERENCE_MISMATCH"
  | "DID_KEY_MISMATCH"
  | "DID_RELATIONSHIP_MISMATCH"
  | "DID_NETWORK_MISMATCH"
  | "DID_STATE_VERSION_MISMATCH"
  | "DID_VERSION_EVIDENCE_MISMATCH"
  | "DID_METHOD_ROTATED"
  | "DID_METHOD_REVOKED"
  | "DID_DEACTIVATED"
  | "TRUST_EVIDENCE_UNAVAILABLE"
  | "TRUST_SUBJECT_MISMATCH"
  | "TRUST_METHOD_MISMATCH"
  | "TRUST_KEY_MISMATCH"
  | "TRUST_NETWORK_MISMATCH"
  | "TRUST_SCOPE_MISMATCH"
  | "TRUST_EPOCH_MISMATCH"
  | "TRUST_EPOCH_EVIDENCE_MISMATCH"
  | "TRUST_NOT_ACTIVE";

export type ScopedAuthorityEvidenceReasonCodeV1 =
  `${AuthorityActorRoleV1}:${AuthorityEvidenceReasonCodeV1}`;

export interface CanonicalDidEvidenceSelectionV1 {
  readonly evidenceId: string;
  readonly authenticated: boolean;
  readonly observedAt: string;
  readonly did: string;
  readonly method: string;
  readonly methodId: string;
  readonly keyFingerprint: Sha256Digest;
  readonly relationships: readonly string[];
  readonly network: string;
  readonly stateVersion: string;
  readonly versionEvidence: string;
  readonly lifecycleStatus: DidMethodLifecycleStatusV1;
  readonly activatedAtStateVersion: string;
  readonly previousMethodId: string | null;
  readonly replacedByMethodId: string | null;
  readonly deactivatedAtStateVersion: string | null;
}

export interface CanonicalTrustEvidenceSelectionV1 {
  readonly evidenceId: string;
  readonly authenticated: boolean;
  readonly observedAt: string;
  readonly subjectDid: string;
  readonly methodId: string;
  readonly keyFingerprint: Sha256Digest;
  readonly network: string;
  readonly scope: string;
  readonly epoch: string;
  readonly epochEvidence: string;
  readonly status: "active" | "suspended" | "withdrawn";
}

export interface CanonicalAuthorityActorTranscriptV1 {
  readonly role: AuthorityActorRoleV1;
  readonly requirement: AuthorityActorKeyRequirementV1;
  readonly didEvidence: CanonicalDidEvidenceSelectionV1 | null;
  readonly trustEvidence: CanonicalTrustEvidenceSelectionV1 | null;
}

export interface CanonicalAuthorityVerificationTranscriptV1 {
  readonly formatVersion: 1;
  readonly domain: "midnight:vc:authority-evidence:v1";
  readonly profile: { readonly id: string; readonly version: string };
  readonly policy: {
    readonly did: AuthorityEvidencePolicyV1["did"];
    readonly trust: AuthorityEvidencePolicyV1["trust"];
    readonly providers: AuthorityEvidencePolicyV1["providers"];
  };
  readonly context: AuthorityVerificationContextV1;
  readonly actors: readonly CanonicalAuthorityActorTranscriptV1[];
}

export interface AuthorityEvidenceVerificationResultV1 {
  readonly formatVersion: 1;
  readonly status: "valid" | "invalid" | "indeterminate";
  readonly decisionStatus: "approved" | "notEvaluated";
  readonly accepted: boolean;
  readonly reasonCodes: readonly ScopedAuthorityEvidenceReasonCodeV1[];
  readonly transcript: CanonicalAuthorityVerificationTranscriptV1;
  readonly transcriptDigest: Sha256Digest;
}

const nonEmpty = (value: string, field: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
};

const normalizeProviderIdentity = (
  provider: AuthorityResolvedProviderIdentityV1,
  role: "did-resolver" | "trust-resolver",
): AuthorityResolvedProviderIdentityV1 => {
  if (provider.role !== role) {
    throw new TypeError(`Authority provider role must be ${role}`);
  }
  return {
    requirementId: nonEmpty(provider.requirementId, `${role}.requirementId`),
    role,
    providerId: nonEmpty(provider.providerId, `${role}.providerId`),
    providerVersion: nonEmpty(provider.providerVersion, `${role}.providerVersion`),
    instanceId: nonEmpty(provider.instanceId, `${role}.instanceId`),
  };
};

const normalizeActors = (
  input: readonly AuthorityActorKeyRequirementV1[],
): readonly AuthorityActorKeyRequirementV1[] => {
  const byRole = new Map(input.map((actor) => [actor.role, actor]));
  if (
    input.length !== AUTHORITY_ACTOR_ROLES_V1.length ||
    byRole.size !== AUTHORITY_ACTOR_ROLES_V1.length
  ) {
    throw new TypeError(
      "Authority policy requires one issuer, holder, verifier, and status actor",
    );
  }

  return AUTHORITY_ACTOR_ROLES_V1.map((role) => {
    const actor = byRole.get(role);
    if (actor === undefined) {
      throw new TypeError(`Authority policy is missing ${role}`);
    }
    if (!isSha256Digest(actor.keyFingerprint)) {
      throw new TypeError(`${role}.keyFingerprint must be a SHA-256 digest`);
    }
    return {
      role,
      did: nonEmpty(actor.did, `${role}.did`),
      methodId: nonEmpty(actor.methodId, `${role}.methodId`),
      keyFingerprint: actor.keyFingerprint,
      relationship: nonEmpty(actor.relationship, `${role}.relationship`),
      stateVersion: nonEmpty(actor.stateVersion, `${role}.stateVersion`),
      trustEpoch: nonEmpty(actor.trustEpoch, `${role}.trustEpoch`),
    };
  });
};

const resolveProvider = (
  profile: AuthorityEvidenceProfileV1,
  composition: AuthorityEvidenceCompositionV1,
  role: "did-resolver" | "trust-resolver",
): AuthorityResolvedProviderIdentityV1 => {
  const requirements = profile.requirements.providers.filter(
    (requirement) => requirement.role === role,
  );
  if (requirements.length !== 1) {
    throw new TypeError(`Authority policy requires exactly one ${role} profile requirement`);
  }
  const selected = composition.providers.filter(
    (provider) =>
      provider.role === role &&
      provider.requirementId === requirements[0]!.id,
  );
  if (selected.length !== 1) {
    throw new TypeError(`Authority policy requires exactly one resolved ${role}`);
  }
  return normalizeProviderIdentity(selected[0]!, role);
};

export const createAuthorityEvidencePolicyV1 = (input: {
  readonly profile: AuthorityEvidenceProfileV1;
  readonly composition: AuthorityEvidenceCompositionV1;
  readonly actors: readonly AuthorityActorKeyRequirementV1[];
}): AuthorityEvidencePolicyV1 => {
  if (
    input.composition.formatVersion !== 1 ||
    input.composition.profile.id !== input.profile.id ||
    input.composition.profile.version !== input.profile.version
  ) {
    throw new TypeError(
      "Authority composition profile must exactly match the selected profile",
    );
  }

  const actors = normalizeActors(input.actors);

  if (
    actors.find((actor) => actor.role === "issuer")!.relationship !==
    input.profile.semantics.did.relationship
  ) {
    throw new TypeError(
      "issuer relationship must match profile.semantics.did.relationship",
    );
  }

  return {
    formatVersion: 1,
    profile: {
      id: nonEmpty(input.profile.id, "profile.id"),
      version: nonEmpty(input.profile.version, "profile.version"),
    },
    did: {
      method: nonEmpty(input.profile.semantics.did.method, "profile.semantics.did.method"),
      issuerRelationship: nonEmpty(
        input.profile.semantics.did.relationship,
        "profile.semantics.did.relationship",
      ),
      network: nonEmpty(input.profile.semantics.did.network, "profile.semantics.did.network"),
      versionEvidence: nonEmpty(
        input.profile.semantics.did.versionEvidence,
        "profile.semantics.did.versionEvidence",
      ),
    },
    trust: {
      scope: nonEmpty(input.profile.semantics.trust.scope, "profile.semantics.trust.scope"),
      epochEvidence: nonEmpty(
        input.profile.semantics.trust.epochEvidence,
        "profile.semantics.trust.epochEvidence",
      ),
    },
    providers: {
      did: resolveProvider(input.profile, input.composition, "did-resolver"),
      trust: resolveProvider(input.profile, input.composition, "trust-resolver"),
    },
    actors,
  };
};

const didSelection = (
  evidence: DidMethodEvidenceV1 | null,
): CanonicalDidEvidenceSelectionV1 | null =>
  evidence === null
    ? null
    : {
        evidenceId: evidence.evidenceId,
        authenticated: evidence.authenticated,
        observedAt: evidence.observedAt,
        did: evidence.did,
        method: evidence.method,
        methodId: evidence.methodId,
        keyFingerprint: evidence.keyFingerprint,
        relationships: [...evidence.relationships].sort(),
        network: evidence.network,
        stateVersion: evidence.stateVersion,
        versionEvidence: evidence.versionEvidence,
        lifecycleStatus: evidence.lifecycle.status,
        activatedAtStateVersion: evidence.lifecycle.activatedAtStateVersion,
        previousMethodId: evidence.lifecycle.previousMethodId ?? null,
        replacedByMethodId: evidence.lifecycle.replacedByMethodId ?? null,
        deactivatedAtStateVersion:
          evidence.lifecycle.deactivatedAtStateVersion ?? null,
      };

const trustSelection = (
  evidence: TrustAuthorizationEvidenceV1 | null,
): CanonicalTrustEvidenceSelectionV1 | null =>
  evidence === null
    ? null
    : {
        evidenceId: evidence.evidenceId,
        authenticated: evidence.authenticated,
        observedAt: evidence.observedAt,
        subjectDid: evidence.subjectDid,
        methodId: evidence.methodId,
        keyFingerprint: evidence.keyFingerprint,
        network: evidence.network,
        scope: evidence.scope,
        epoch: evidence.epoch,
        epochEvidence: evidence.epochEvidence,
        status: evidence.status,
      };

const didReasons = (
  actor: AuthorityActorKeyRequirementV1,
  policy: AuthorityEvidencePolicyV1,
  evidence: DidMethodEvidenceV1 | null,
): readonly AuthorityEvidenceReasonCodeV1[] => {
  if (evidence === null || evidence.authenticated !== true) {
    return ["DID_EVIDENCE_UNAVAILABLE"];
  }
  const reasons: AuthorityEvidenceReasonCodeV1[] = [];
  if (evidence.did !== actor.did) reasons.push("DID_SUBJECT_MISMATCH");
  if (evidence.method !== policy.did.method) reasons.push("DID_METHOD_MISMATCH");
  if (evidence.methodId !== actor.methodId) {
    reasons.push("DID_METHOD_REFERENCE_MISMATCH");
  }
  if (evidence.keyFingerprint !== actor.keyFingerprint) {
    reasons.push("DID_KEY_MISMATCH");
  }
  if (!evidence.relationships.includes(actor.relationship)) {
    reasons.push("DID_RELATIONSHIP_MISMATCH");
  }
  if (evidence.network !== policy.did.network) reasons.push("DID_NETWORK_MISMATCH");
  if (evidence.stateVersion !== actor.stateVersion) {
    reasons.push("DID_STATE_VERSION_MISMATCH");
  }
  if (evidence.versionEvidence !== policy.did.versionEvidence) {
    reasons.push("DID_VERSION_EVIDENCE_MISMATCH");
  }
  if (evidence.lifecycle.status === "rotated") reasons.push("DID_METHOD_ROTATED");
  if (evidence.lifecycle.status === "revoked") reasons.push("DID_METHOD_REVOKED");
  if (evidence.lifecycle.status === "deactivated") reasons.push("DID_DEACTIVATED");
  return reasons;
};

const trustReasons = (
  actor: AuthorityActorKeyRequirementV1,
  policy: AuthorityEvidencePolicyV1,
  evidence: TrustAuthorizationEvidenceV1 | null,
): readonly AuthorityEvidenceReasonCodeV1[] => {
  if (evidence === null || evidence.authenticated !== true) {
    return ["TRUST_EVIDENCE_UNAVAILABLE"];
  }
  const reasons: AuthorityEvidenceReasonCodeV1[] = [];
  if (evidence.subjectDid !== actor.did) reasons.push("TRUST_SUBJECT_MISMATCH");
  if (evidence.methodId !== actor.methodId) reasons.push("TRUST_METHOD_MISMATCH");
  if (evidence.keyFingerprint !== actor.keyFingerprint) reasons.push("TRUST_KEY_MISMATCH");
  if (evidence.network !== policy.did.network) reasons.push("TRUST_NETWORK_MISMATCH");
  if (evidence.scope !== policy.trust.scope) reasons.push("TRUST_SCOPE_MISMATCH");
  if (evidence.epoch !== actor.trustEpoch) reasons.push("TRUST_EPOCH_MISMATCH");
  if (evidence.epochEvidence !== policy.trust.epochEvidence) {
    reasons.push("TRUST_EPOCH_EVIDENCE_MISMATCH");
  }
  if (evidence.status !== "active") reasons.push("TRUST_NOT_ACTIVE");
  return reasons;
};

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isEvidenceTime = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  !Number.isNaN(Date.parse(value));

const optionalNonEmptyString = (value: unknown): boolean =>
  value === undefined ||
  (typeof value === "string" && value.trim().length > 0);

const isDidEvidence = (value: unknown): value is DidMethodEvidenceV1 => {
  if (!isRecord(value) || !isRecord(value.lifecycle)) return false;
  const relationships = value.relationships;
  const lifecycle = value.lifecycle;
  const lifecycleStatus = lifecycle.status;
  return (
    value.formatVersion === 1 &&
    value.authenticated === true &&
    typeof value.evidenceId === "string" &&
    value.evidenceId.length > 0 &&
    isEvidenceTime(value.observedAt) &&
    typeof value.did === "string" &&
    value.did.length > 0 &&
    typeof value.method === "string" &&
    value.method.length > 0 &&
    typeof value.methodId === "string" &&
    value.methodId.length > 0 &&
    isSha256Digest(value.keyFingerprint) &&
    Array.isArray(relationships) &&
    relationships.length > 0 &&
    relationships.every(
      (relationship) =>
        typeof relationship === "string" && relationship.length > 0,
    ) &&
    typeof value.network === "string" &&
    value.network.length > 0 &&
    typeof value.stateVersion === "string" &&
    value.stateVersion.length > 0 &&
    typeof value.versionEvidence === "string" &&
    value.versionEvidence.length > 0 &&
    ["active", "rotated", "revoked", "deactivated"].includes(
      lifecycleStatus as string,
    ) &&
    typeof lifecycle.activatedAtStateVersion === "string" &&
    lifecycle.activatedAtStateVersion.length > 0 &&
    optionalNonEmptyString(lifecycle.previousMethodId) &&
    optionalNonEmptyString(lifecycle.replacedByMethodId) &&
    optionalNonEmptyString(lifecycle.deactivatedAtStateVersion) &&
    (lifecycleStatus !== "rotated" ||
      (typeof lifecycle.replacedByMethodId === "string" &&
        lifecycle.replacedByMethodId.length > 0)) &&
    (lifecycleStatus !== "deactivated" ||
      (typeof lifecycle.deactivatedAtStateVersion === "string" &&
        lifecycle.deactivatedAtStateVersion.length > 0))
  );
};

const isTrustEvidence = (
  value: unknown,
): value is TrustAuthorizationEvidenceV1 =>
  isRecord(value) &&
  value.formatVersion === 1 &&
  value.authenticated === true &&
  typeof value.evidenceId === "string" &&
  value.evidenceId.length > 0 &&
  isEvidenceTime(value.observedAt) &&
  typeof value.subjectDid === "string" &&
  value.subjectDid.length > 0 &&
  typeof value.methodId === "string" &&
  value.methodId.length > 0 &&
  isSha256Digest(value.keyFingerprint) &&
  typeof value.network === "string" &&
  value.network.length > 0 &&
  typeof value.scope === "string" &&
  value.scope.length > 0 &&
  typeof value.epoch === "string" &&
  value.epoch.length > 0 &&
  typeof value.epochEvidence === "string" &&
  value.epochEvidence.length > 0 &&
  ["active", "suspended", "withdrawn"].includes(value.status as string);

const safeResolve = async <T>(
  resolve: () => Promise<T | null | undefined>,
  validate: (value: unknown) => value is T,
): Promise<T | null> => {
  try {
    const value: unknown = await resolve();
    return validate(value) ? value : null;
  } catch {
    return null;
  }
};

export const verifyAuthorityEvidenceV1 = async (input: {
  readonly policy: AuthorityEvidencePolicyV1;
  readonly context: AuthorityVerificationContextV1;
  readonly didProvider: DidMethodEvidenceProviderV1;
  readonly trustProvider: TrustAuthorizationEvidenceProviderV1;
}): Promise<AuthorityEvidenceVerificationResultV1> => {
  if (input.policy.formatVersion !== 1) {
    throw new TypeError("authority policy formatVersion must be 1");
  }
  const policy: AuthorityEvidencePolicyV1 = {
    formatVersion: 1,
    profile: {
      id: nonEmpty(input.policy.profile.id, "policy.profile.id"),
      version: nonEmpty(input.policy.profile.version, "policy.profile.version"),
    },
    did: {
      method: nonEmpty(input.policy.did.method, "policy.did.method"),
      issuerRelationship: nonEmpty(
        input.policy.did.issuerRelationship,
        "policy.did.issuerRelationship",
      ),
      network: nonEmpty(input.policy.did.network, "policy.did.network"),
      versionEvidence: nonEmpty(
        input.policy.did.versionEvidence,
        "policy.did.versionEvidence",
      ),
    },
    trust: {
      scope: nonEmpty(input.policy.trust.scope, "policy.trust.scope"),
      epochEvidence: nonEmpty(
        input.policy.trust.epochEvidence,
        "policy.trust.epochEvidence",
      ),
    },
    providers: {
      did: normalizeProviderIdentity(
        input.policy.providers.did,
        "did-resolver",
      ),
      trust: normalizeProviderIdentity(
        input.policy.providers.trust,
        "trust-resolver",
      ),
    },
    actors: normalizeActors(input.policy.actors),
  };
  if (policy.actors[0]!.relationship !== policy.did.issuerRelationship) {
    throw new TypeError(
      "issuer relationship must match policy.did.issuerRelationship",
    );
  }

  const context: AuthorityVerificationContextV1 = {
    proofDigest: input.context.proofDigest,
    credentialDigest: input.context.credentialDigest,
    presentationDigest: input.context.presentationDigest,
    requestDigest: input.context.requestDigest,
  };
  for (const [name, digest] of Object.entries(context)) {
    if (!isSha256Digest(digest)) {
      throw new TypeError(`authority context ${name} must be a SHA-256 digest`);
    }
  }

  const providerPolicy = (): AuthorityEvidenceProviderPolicyV1 => ({
    formatVersion: 1,
    profile: { ...policy.profile },
    did: { ...policy.did },
    trust: { ...policy.trust },
  });
  const actorResults = await Promise.all(
    policy.actors.map(async (actor) => {
      const [didEvidence, trustEvidence] = await Promise.all([
        safeResolve(
          () =>
            input.didProvider.resolve({
              formatVersion: 1,
              actor: { ...actor },
              policy: providerPolicy(),
              provider: { ...policy.providers.did },
            }),
          isDidEvidence,
        ),
        safeResolve(
          () =>
            input.trustProvider.resolve({
              formatVersion: 1,
              actor: { ...actor },
              policy: providerPolicy(),
              provider: { ...policy.providers.trust },
            }),
          isTrustEvidence,
        ),
      ]);
      const did = didReasons(actor, policy, didEvidence);
      const trust = trustReasons(actor, policy, trustEvidence);
      return {
        transcript: {
          role: actor.role,
          requirement: { ...actor },
          didEvidence: didSelection(didEvidence),
          trustEvidence: trustSelection(trustEvidence),
        } satisfies CanonicalAuthorityActorTranscriptV1,
        reasons: [...did, ...trust].map(
          (reason) => `${actor.role}:${reason}` as ScopedAuthorityEvidenceReasonCodeV1,
        ),
      };
    }),
  );

  const transcript: CanonicalAuthorityVerificationTranscriptV1 = {
    formatVersion: 1,
    domain: "midnight:vc:authority-evidence:v1",
    profile: { ...policy.profile },
    policy: {
      did: { ...policy.did },
      trust: { ...policy.trust },
      providers: {
        did: { ...policy.providers.did },
        trust: { ...policy.providers.trust },
      },
    },
    context,
    actors: actorResults.map((actor) => actor.transcript),
  };
  const reasonCodes = actorResults.flatMap((actor) => actor.reasons);
  const unavailable = reasonCodes.some((reason) =>
    reason.endsWith("_EVIDENCE_UNAVAILABLE"),
  );
  const invalid = reasonCodes.some(
    (reason) => !reason.endsWith("_EVIDENCE_UNAVAILABLE"),
  );
  const status = invalid ? "invalid" : unavailable ? "indeterminate" : "valid";
  return {
    formatVersion: 1,
    status,
    decisionStatus: status === "valid" ? "approved" : "notEvaluated",
    accepted: status === "valid",
    reasonCodes,
    transcript,
    transcriptDigest: await computeSha256Digest(serializeCanonicalJson(transcript)),
  };
};
