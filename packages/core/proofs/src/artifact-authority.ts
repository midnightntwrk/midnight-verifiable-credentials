import type { AuthorityEvidenceVerificationResultV1 } from "./authority-evidence.js";
import {
  assertArtifactBytes,
  computeSha256Digest,
  isSha256Digest,
  serializeCanonicalJson,
} from "./serialization.js";
import {
  assertBuildManifestIntegrity,
  assertDeploymentManifestIntegrity,
} from "./signatures.js";
import type {
  BuildManifest,
  DeploymentManifest,
  ManifestKeyResolver,
  ProofArtifactRole,
  ResolvedProofArtifact,
  Sha256Digest,
} from "./types.js";

export type ArtifactAuthorityClassificationV1 = "valid" | "invalid" | "indeterminate";
export type ArtifactAuthorityLabelV1 = "local-process" | "ledger-local" | "ledger-attested";

export interface ArtifactAuthorityPolicyV1 {
  readonly formatVersion: 1;
  readonly profile: { readonly id: string; readonly version: string };
  readonly circuit: { readonly id: string; readonly version: string };
  readonly artifact: {
    readonly id: string;
    readonly version: string;
    readonly role: ProofArtifactRole;
    readonly mediaType: string;
    readonly buildManifestDigest: Sha256Digest;
    readonly deploymentManifestDigest: Sha256Digest;
    readonly bytes: number;
    readonly sha256: Sha256Digest;
    readonly signerKeyId: string;
  };
  readonly deployment: {
    readonly id: string;
    readonly version: string;
    readonly identity: string;
    readonly networkId: string;
    readonly chainId: string;
    readonly contractAddress: string;
  };
  /** Digest of the selected #494 DID/trust authority transcript. */
  readonly authorityEvidenceDigest: Sha256Digest;
  readonly freshness: {
    /** Caller-selected authoritative observation time; never defaults to wall clock. */
    readonly observedAt: string;
    readonly maxReceiptAgeSeconds: number;
  };
  readonly receipt: {
    readonly id: string;
    readonly allowedAuthorities: readonly ArtifactAuthorityLabelV1[];
  };
}

export interface ArtifactAuthorityResolverV1 {
  resolveManifest(
    buildManifestDigest: Sha256Digest,
  ): Promise<BuildManifest | null | undefined>;
  resolveArtifact(
    buildManifestDigest: Sha256Digest,
    artifactId: string,
  ): Promise<ResolvedProofArtifact | null | undefined>;
  resolveDeploymentManifest(
    deploymentManifestDigest: Sha256Digest,
  ): Promise<DeploymentManifest | null | undefined>;
}

export interface AuthoritativeExecutionReceiptV1 {
  readonly formatVersion: 1;
  readonly id: string;
  readonly bindingDigest: Sha256Digest;
  readonly classification: ArtifactAuthorityClassificationV1;
  readonly authority: ArtifactAuthorityLabelV1;
  readonly observedAt: string;
  readonly profile: { readonly id: string; readonly version: string };
  readonly circuit: { readonly id: string; readonly version: string };
  readonly artifactDigest: Sha256Digest;
  readonly deployment: {
    readonly id: string;
    readonly version: string;
    readonly identity: string;
    readonly networkId: string;
    readonly chainId: string;
    readonly contractAddress: string;
  };
  readonly authorityEvidenceDigest: Sha256Digest;
  /** Opaque provider-authenticated signature or confirmed transaction identity. */
  readonly confirmationId: string;
  readonly reasonCodes: readonly string[];
}

/**
 * Injected authority boundary. A ledger implementation verifies confirmed
 * transaction evidence; a local implementation verifies its signed receipt.
 * Final executors are deliberately outside this package (#499).
 */
export interface ArtifactExecutionReceiptVerifierV1 {
  verify(receipt: AuthoritativeExecutionReceiptV1): Promise<boolean>;
}

export type ArtifactAuthorityReasonCodeV1 =
  | "POLICY_INVALID"
  | "DEPLOYMENT_UNAVAILABLE"
  | "DEPLOYMENT_INVALID"
  | "ARTIFACT_UNAVAILABLE"
  | "ARTIFACT_INVALID"
  | "RECEIPT_UNAVAILABLE"
  | "RECEIPT_INVALID"
  | "RECEIPT_STALE";

export interface CanonicalArtifactAuthorityTranscriptV1 {
  readonly formatVersion: 1;
  readonly domain: "midnight:vc:artifact-authority:v1";
  readonly profile: ArtifactAuthorityPolicyV1["profile"];
  readonly circuit: ArtifactAuthorityPolicyV1["circuit"];
  readonly artifact: ArtifactAuthorityPolicyV1["artifact"];
  readonly deployment: ArtifactAuthorityPolicyV1["deployment"];
  readonly authorityEvidenceDigest: Sha256Digest;
  readonly freshness: ArtifactAuthorityPolicyV1["freshness"];
  readonly receipt: ArtifactAuthorityPolicyV1["receipt"];
}

export interface ArtifactAuthorityVerificationResultV1 {
  readonly formatVersion: 1;
  readonly status: ArtifactAuthorityClassificationV1;
  readonly classification: ArtifactAuthorityClassificationV1;
  readonly accepted: boolean;
  readonly authority: ArtifactAuthorityLabelV1 | null;
  readonly transcript: CanonicalArtifactAuthorityTranscriptV1 | null;
  readonly bindingDigest: Sha256Digest;
  readonly reasonCodes: readonly string[];
}

const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.trim() === value;
const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const semanticVersion = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u;

const validIdentity = (value: unknown): value is { readonly id: string; readonly version: string } => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { readonly id?: unknown; readonly version?: unknown };
  return nonEmpty(candidate.id) &&
    nonEmpty(candidate.version) &&
    semanticVersion.test(candidate.version);
};

const canonicalUtcTime = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d{3})?Z$/u.exec(value);
  const parsed = Date.parse(value);
  if (match === null || Number.isNaN(parsed)) return false;
  const canonical = new Date(parsed).toISOString().replace(
    /\.000Z$/u,
    match[2] === undefined ? "Z" : ".000Z",
  );
  return canonical === value;
};

const artifactRoles: readonly ProofArtifactRole[] = [
  "prover-key",
  "verifier-key",
  "circuit",
  "managed-code",
  "metadata",
];
const authorityLabels: readonly ArtifactAuthorityLabelV1[] = [
  "local-process",
  "ledger-local",
  "ledger-attested",
];

const validPolicy = (policy: ArtifactAuthorityPolicyV1): boolean =>
  policy?.formatVersion === 1 &&
  validIdentity(policy.profile) &&
  validIdentity(policy.circuit) &&
  nonEmpty(policy.artifact?.id) &&
  nonEmpty(policy.artifact?.version) &&
  semanticVersion.test(policy.artifact.version) &&
  artifactRoles.includes(policy.artifact?.role) &&
  nonEmpty(policy.artifact?.mediaType) &&
  isSha256Digest(policy.artifact?.buildManifestDigest) &&
  isSha256Digest(policy.artifact?.deploymentManifestDigest) &&
  Number.isSafeInteger(policy.artifact?.bytes) &&
  policy.artifact.bytes > 0 &&
  isSha256Digest(policy.artifact?.sha256) &&
  nonEmpty(policy.artifact?.signerKeyId) &&
  nonEmpty(policy.deployment?.id) &&
  nonEmpty(policy.deployment?.version) &&
  semanticVersion.test(policy.deployment.version) &&
  nonEmpty(policy.deployment?.identity) &&
  nonEmpty(policy.deployment?.networkId) &&
  nonEmpty(policy.deployment?.chainId) &&
  nonEmpty(policy.deployment?.contractAddress) &&
  isSha256Digest(policy.authorityEvidenceDigest) &&
  canonicalUtcTime(policy.freshness?.observedAt) &&
  Number.isSafeInteger(policy.freshness?.maxReceiptAgeSeconds) &&
  policy.freshness.maxReceiptAgeSeconds >= 0 &&
  policy.freshness.maxReceiptAgeSeconds <= Number.MAX_SAFE_INTEGER / 1000 &&
  nonEmpty(policy.receipt?.id) &&
  Array.isArray(policy.receipt?.allowedAuthorities) &&
  policy.receipt.allowedAuthorities.length > 0 &&
  policy.receipt.allowedAuthorities.every((authority) => authorityLabels.includes(authority)) &&
  new Set(policy.receipt.allowedAuthorities).size === policy.receipt.allowedAuthorities.length;

/** Structural projection of the exact, already-validated #492 resolution graph. */
export interface ArtifactAuthorityCompositionV1 {
  readonly profile: { readonly id: string; readonly version: string };
  readonly artifacts: readonly {
    readonly requirementId: string;
    readonly requirement: {
      readonly mediaType: string;
      readonly artifactClass:
        | "prover-key"
        | "verifier-key"
        | "zkir"
        | "bzkir"
        | "circuit-metadata";
    };
    readonly artifact: {
      readonly id: string;
      readonly version: string;
      readonly buildManifestDigest: string;
      readonly deploymentManifestDigest: string;
      readonly digest: string;
      readonly bytes: number;
      readonly signerKeyId: string;
      readonly circuit: { readonly id: string; readonly version: string };
      readonly deploymentId: string;
    };
  }[];
  readonly deployments: readonly {
    readonly id: string;
    readonly version: string;
    readonly identity: string;
    readonly networkId: string;
    readonly chainId: string;
    readonly contractAddress: string;
  }[];
}

const artifactRole = (
  artifactClass: ArtifactAuthorityCompositionV1["artifacts"][number]["requirement"]["artifactClass"],
): ProofArtifactRole => {
  switch (artifactClass) {
    case "prover-key":
    case "verifier-key":
      return artifactClass;
    case "zkir":
    case "bzkir":
      return "circuit";
    case "circuit-metadata":
      return "metadata";
  }
};

const deepFreeze = <T>(value: T): T => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};

const assertVerifiedAuthorityEvidence = async (
  value: AuthorityEvidenceVerificationResultV1,
): Promise<void> => {
  const candidate: unknown = value;
  if (!isRecord(candidate) ||
    candidate.formatVersion !== 1 ||
    candidate.status !== "valid" ||
    candidate.decisionStatus !== "approved" ||
    candidate.accepted !== true ||
    !Array.isArray(candidate.reasonCodes) ||
    candidate.reasonCodes.length !== 0 ||
    !isSha256Digest(candidate.transcriptDigest) ||
    !isRecord(candidate.transcript)
  ) {
    throw new TypeError("authority evidence must be a complete valid and accepted #494 result");
  }
  const transcript = candidate.transcript;
  if (
    transcript.formatVersion !== 1 ||
    transcript.domain !== "midnight:vc:authority-evidence:v1" ||
    !validIdentity(transcript.profile) ||
    !isRecord(transcript.policy) ||
    !isRecord(transcript.policy.did) ||
    !isRecord(transcript.policy.trust) ||
    !isRecord(transcript.policy.providers) ||
    !isRecord(transcript.policy.providers.did) ||
    !isRecord(transcript.policy.providers.trust) ||
    !isRecord(transcript.context) ||
    !["proofDigest", "credentialDigest", "presentationDigest", "requestDigest"].every(
      (field) => isSha256Digest((transcript.context as Readonly<Record<string, unknown>>)[field]),
    ) ||
    !Array.isArray(transcript.actors) ||
    transcript.actors.length !== 4
  ) {
    throw new TypeError("authority evidence transcript is incomplete");
  }
  const roles = new Set<string>();
  const didPolicy = transcript.policy.did as Readonly<Record<string, unknown>>;
  const trustPolicy = transcript.policy.trust as Readonly<Record<string, unknown>>;
  for (const actor of transcript.actors) {
    if (!isRecord(actor) ||
      !["issuer", "holder", "verifier", "status"].includes(actor.role as string) ||
      !isRecord(actor.requirement) ||
      !isRecord(actor.didEvidence) ||
      actor.didEvidence.authenticated !== true ||
      !isRecord(actor.trustEvidence) ||
      actor.trustEvidence.authenticated !== true
    ) {
      throw new TypeError("authority evidence actor transcript is incomplete");
    }
    const requirement = actor.requirement;
    const did = actor.didEvidence;
    const trust = actor.trustEvidence;
    if (
      requirement.role !== actor.role ||
      (actor.role === "issuer" && requirement.relationship !== didPolicy.issuerRelationship) ||
      !isSha256Digest(requirement.keyFingerprint) ||
      did.did !== requirement.did ||
      did.method !== didPolicy.method ||
      did.methodId !== requirement.methodId ||
      did.keyFingerprint !== requirement.keyFingerprint ||
      !Array.isArray(did.relationships) ||
      !did.relationships.includes(requirement.relationship) ||
      did.network !== didPolicy.network ||
      did.stateVersion !== requirement.stateVersion ||
      did.versionEvidence !== didPolicy.versionEvidence ||
      did.lifecycleStatus !== "active" ||
      trust.subjectDid !== requirement.did ||
      trust.methodId !== requirement.methodId ||
      trust.keyFingerprint !== requirement.keyFingerprint ||
      trust.network !== didPolicy.network ||
      trust.scope !== trustPolicy.scope ||
      trust.epoch !== requirement.trustEpoch ||
      trust.epochEvidence !== trustPolicy.epochEvidence ||
      trust.status !== "active"
    ) {
      throw new TypeError("authority evidence actor transcript is internally inconsistent");
    }
    roles.add(actor.role as string);
  }
  if (roles.size !== 4) throw new TypeError("authority evidence actor roles are incomplete");
  const actual = await computeSha256Digest(serializeCanonicalJson(transcript));
  if (actual !== candidate.transcriptDigest) {
    throw new TypeError("authority evidence transcript digest does not match its canonical transcript");
  }
};

/** Build the policy only from an exact, already-validated #492 resolution graph. */
export const createArtifactAuthorityPolicyV1 = async (
  composition: ArtifactAuthorityCompositionV1,
  requirementId: string,
  input: {
    /** A complete successful #494 result; its canonical transcript digest is recomputed. */
    readonly authorityEvidence: AuthorityEvidenceVerificationResultV1;
    readonly observedAt: string;
    readonly maxReceiptAgeSeconds: number;
    readonly receiptId: string;
    readonly allowedAuthorities: readonly ArtifactAuthorityLabelV1[];
  },
): Promise<ArtifactAuthorityPolicyV1> => {
  const resolved = composition.artifacts.find((entry) => entry.requirementId === requirementId);
  if (resolved === undefined) throw new TypeError(`resolved artifact '${requirementId}' is unavailable`);
  const deployment = composition.deployments.find(({ id }) => id === resolved.artifact.deploymentId);
  if (deployment === undefined) throw new TypeError(`resolved deployment '${resolved.artifact.deploymentId}' is unavailable`);
  await assertVerifiedAuthorityEvidence(input.authorityEvidence);
  if (
    input.authorityEvidence.transcript.profile.id !== composition.profile.id ||
    input.authorityEvidence.transcript.profile.version !== composition.profile.version
  ) {
    throw new TypeError("authority evidence profile must match the resolved composition");
  }
  const policy: ArtifactAuthorityPolicyV1 = {
    formatVersion: 1,
    profile: { ...composition.profile },
    circuit: { ...resolved.artifact.circuit },
    artifact: {
      id: resolved.artifact.id,
      version: resolved.artifact.version,
      role: artifactRole(resolved.requirement.artifactClass),
      mediaType: resolved.requirement.mediaType,
      buildManifestDigest: resolved.artifact.buildManifestDigest as Sha256Digest,
      deploymentManifestDigest: resolved.artifact.deploymentManifestDigest as Sha256Digest,
      bytes: resolved.artifact.bytes,
      sha256: resolved.artifact.digest as Sha256Digest,
      signerKeyId: resolved.artifact.signerKeyId,
    },
    deployment: {
      id: deployment.id,
      version: deployment.version,
      identity: deployment.identity,
      networkId: deployment.networkId,
      chainId: deployment.chainId,
      contractAddress: deployment.contractAddress,
    },
    authorityEvidenceDigest: input.authorityEvidence.transcriptDigest,
    freshness: {
      observedAt: input.observedAt,
      maxReceiptAgeSeconds: input.maxReceiptAgeSeconds,
    },
    receipt: {
      id: input.receiptId,
      allowedAuthorities: [...input.allowedAuthorities],
    },
  };
  if (!validPolicy(policy)) throw new TypeError("resolved artifact authority policy is invalid");
  return deepFreeze(policy);
};

/** Normalize the exact selected authority graph into a domain-separated transcript. */
export const createArtifactAuthorityTranscriptV1 = (
  policy: ArtifactAuthorityPolicyV1,
): CanonicalArtifactAuthorityTranscriptV1 => {
  if (!validPolicy(policy)) throw new TypeError("artifact authority policy is invalid");
  return {
    formatVersion: 1,
    domain: "midnight:vc:artifact-authority:v1",
    profile: { ...policy.profile },
    circuit: { ...policy.circuit },
    artifact: { ...policy.artifact },
    deployment: { ...policy.deployment },
    authorityEvidenceDigest: policy.authorityEvidenceDigest,
    freshness: { ...policy.freshness },
    receipt: {
      id: policy.receipt.id,
      allowedAuthorities: [...policy.receipt.allowedAuthorities].sort(),
    },
  };
};

/** Canonical cross-runtime digest committed by every equivalent verification path. */
export const computeArtifactAuthorityBindingDigestV1 = async (
  policy: ArtifactAuthorityPolicyV1,
): Promise<Sha256Digest> =>
  computeSha256Digest(serializeCanonicalJson(createArtifactAuthorityTranscriptV1(policy)));

const result = (
  status: ArtifactAuthorityClassificationV1,
  transcript: CanonicalArtifactAuthorityTranscriptV1 | null,
  bindingDigest: Sha256Digest,
  reasonCodes: readonly string[],
  authority: ArtifactAuthorityLabelV1 | null = null,
): ArtifactAuthorityVerificationResultV1 => ({
  formatVersion: 1,
  status,
  classification: status,
  accepted: status === "valid",
  authority,
  transcript,
  bindingDigest,
  reasonCodes,
});

const placeholderDigest = "sha256:" + "0".repeat(64) as Sha256Digest;

const validReceiptShape = (value: unknown): value is AuthoritativeExecutionReceiptV1 => {
  if (!isRecord(value) || !isRecord(value.profile) || !isRecord(value.circuit) || !isRecord(value.deployment)) {
    return false;
  }
  const classification = value.classification;
  const reasons = value.reasonCodes;
  const deployment: Readonly<Record<string, unknown>> = value.deployment;
  return value.formatVersion === 1 &&
    nonEmpty(value.id) &&
    isSha256Digest(value.bindingDigest) &&
    ["valid", "invalid", "indeterminate"].includes(classification as string) &&
    authorityLabels.includes(value.authority as ArtifactAuthorityLabelV1) &&
    canonicalUtcTime(value.observedAt) &&
    validIdentity(value.profile) &&
    validIdentity(value.circuit) &&
    isSha256Digest(value.artifactDigest) &&
    nonEmpty(deployment.id) &&
    nonEmpty(deployment.version) &&
    semanticVersion.test(deployment.version) &&
    nonEmpty(deployment.identity) &&
    nonEmpty(deployment.networkId) &&
    nonEmpty(deployment.chainId) &&
    nonEmpty(deployment.contractAddress) &&
    isSha256Digest(value.authorityEvidenceDigest) &&
    nonEmpty(value.confirmationId) &&
    Array.isArray(reasons) &&
    reasons.every(nonEmpty) &&
    new Set(reasons).size === reasons.length &&
    (classification === "valid" ? reasons.length === 0 : reasons.length > 0);
};

export const verifyArtifactAuthorityV1 = async (input: {
  readonly policy: ArtifactAuthorityPolicyV1;
  readonly resolver: ArtifactAuthorityResolverV1;
  readonly trustedKeyResolver: ManifestKeyResolver;
  readonly receipt: AuthoritativeExecutionReceiptV1 | null | undefined;
  readonly receiptVerifier: ArtifactExecutionReceiptVerifierV1;
}): Promise<ArtifactAuthorityVerificationResultV1> => {
  let transcript: CanonicalArtifactAuthorityTranscriptV1 | null = null;
  let bindingDigest = placeholderDigest;
  try {
    transcript = createArtifactAuthorityTranscriptV1(input.policy);
    bindingDigest = await computeSha256Digest(serializeCanonicalJson(transcript));
  } catch {
    return result("invalid", null, bindingDigest, ["POLICY_INVALID"]);
  }

  let deployment: DeploymentManifest | null | undefined;
  try {
    deployment = await input.resolver.resolveDeploymentManifest(
      input.policy.artifact.deploymentManifestDigest,
    );
  } catch {
    return result("indeterminate", transcript, bindingDigest, ["DEPLOYMENT_UNAVAILABLE"]);
  }
  if (deployment === null || deployment === undefined) {
    return result("indeterminate", transcript, bindingDigest, ["DEPLOYMENT_UNAVAILABLE"]);
  }

  let build: BuildManifest | null | undefined;
  try {
    build = await input.resolver.resolveManifest(input.policy.artifact.buildManifestDigest);
  } catch {
    return result("indeterminate", transcript, bindingDigest, ["ARTIFACT_UNAVAILABLE"]);
  }
  if (build === null || build === undefined) {
    return result("indeterminate", transcript, bindingDigest, ["ARTIFACT_UNAVAILABLE"]);
  }

  try {
    await assertBuildManifestIntegrity(build);
    if (build.manifestDigest !== input.policy.artifact.buildManifestDigest) {
      throw new Error("build manifest identity mismatch");
    }
  } catch {
    return result("invalid", transcript, bindingDigest, ["ARTIFACT_INVALID"]);
  }

  const circuit = build.circuits.find(({ id }) => id === input.policy.circuit.id);
  const descriptor = build.artifacts.find(({ id }) => id === input.policy.artifact.id);
  if (
    circuit === undefined ||
    circuit.version !== input.policy.circuit.version ||
    !circuit.artifactIds.includes(input.policy.artifact.id) ||
    descriptor === undefined ||
    descriptor.version !== input.policy.artifact.version ||
    descriptor.role !== input.policy.artifact.role ||
    descriptor.mediaType !== input.policy.artifact.mediaType ||
    descriptor.bytes !== input.policy.artifact.bytes ||
    descriptor.sha256 !== input.policy.artifact.sha256
  ) {
    return result("invalid", transcript, bindingDigest, ["ARTIFACT_INVALID"]);
  }

  let trustedKey: CryptoKey | null | undefined;
  try {
    trustedKey = await input.trustedKeyResolver(input.policy.artifact.signerKeyId);
  } catch {
    return result("indeterminate", transcript, bindingDigest, ["DEPLOYMENT_UNAVAILABLE"]);
  }
  if (trustedKey === null || trustedKey === undefined) {
    return result("invalid", transcript, bindingDigest, ["DEPLOYMENT_INVALID"]);
  }

  try {
    await assertDeploymentManifestIntegrity(deployment, {
      publicKey: trustedKey,
      expectedKeyId: input.policy.artifact.signerKeyId,
      buildManifest: build,
      expectedBuildManifestDigest: input.policy.artifact.buildManifestDigest,
      expectedDeploymentId: input.policy.deployment.id,
      expectedDeploymentVersion: input.policy.deployment.version,
      expectedDeploymentIdentity: input.policy.deployment.identity,
      expectedProfile: input.policy.profile,
      expectedNetworkId: input.policy.deployment.networkId,
      expectedChainId: input.policy.deployment.chainId,
      expectedContractAddress: input.policy.deployment.contractAddress,
      at: input.policy.freshness.observedAt,
    });
    if (deployment.deploymentManifestDigest !== input.policy.artifact.deploymentManifestDigest) {
      throw new Error("deployment manifest identity mismatch");
    }
  } catch {
    return result("invalid", transcript, bindingDigest, ["DEPLOYMENT_INVALID"]);
  }

  let resolved: unknown;
  try {
    resolved = await input.resolver.resolveArtifact(
      input.policy.artifact.buildManifestDigest,
      input.policy.artifact.id,
    );
  } catch {
    return result("indeterminate", transcript, bindingDigest, ["ARTIFACT_UNAVAILABLE"]);
  }
  if (resolved === null || resolved === undefined) {
    return result("indeterminate", transcript, bindingDigest, ["ARTIFACT_UNAVAILABLE"]);
  }
  try {
    if (
      !isRecord(resolved) ||
      resolved.manifestDigest !== input.policy.artifact.buildManifestDigest ||
      resolved.artifactId !== input.policy.artifact.id ||
      resolved.sha256 !== input.policy.artifact.sha256 ||
      !(resolved.bytes instanceof Uint8Array) ||
      resolved.bytes.byteLength !== input.policy.artifact.bytes
    ) {
      throw new Error("resolved artifact identity mismatch");
    }
    await assertArtifactBytes(descriptor, resolved.bytes);
  } catch {
    return result("invalid", transcript, bindingDigest, ["ARTIFACT_INVALID"]);
  }

  const receipt: unknown = input.receipt;
  if (receipt === null || receipt === undefined) {
    return result("indeterminate", transcript, bindingDigest, ["RECEIPT_UNAVAILABLE"]);
  }
  if (!validReceiptShape(receipt)) {
    return result("invalid", transcript, bindingDigest, ["RECEIPT_INVALID"]);
  }
  const receiptTime = Date.parse(receipt.observedAt);
  const observationTime = Date.parse(input.policy.freshness.observedAt);
  if (
    Number.isNaN(receiptTime) ||
    receiptTime > observationTime ||
    observationTime - receiptTime > input.policy.freshness.maxReceiptAgeSeconds * 1000
  ) {
    return result("invalid", transcript, bindingDigest, ["RECEIPT_STALE"]);
  }
  if (
    receipt.id !== input.policy.receipt.id ||
    receipt.bindingDigest !== bindingDigest ||
    receipt.profile.id !== input.policy.profile.id ||
    receipt.profile.version !== input.policy.profile.version ||
    receipt.circuit.id !== input.policy.circuit.id ||
    receipt.circuit.version !== input.policy.circuit.version ||
    receipt.artifactDigest !== input.policy.artifact.sha256 ||
    receipt.deployment.id !== input.policy.deployment.id ||
    receipt.deployment.version !== input.policy.deployment.version ||
    receipt.deployment.identity !== input.policy.deployment.identity ||
    receipt.deployment.networkId !== input.policy.deployment.networkId ||
    receipt.deployment.chainId !== input.policy.deployment.chainId ||
    receipt.deployment.contractAddress !== input.policy.deployment.contractAddress ||
    receipt.authorityEvidenceDigest !== input.policy.authorityEvidenceDigest ||
    !input.policy.receipt.allowedAuthorities.includes(receipt.authority)
  ) {
    return result("invalid", transcript, bindingDigest, ["RECEIPT_INVALID"]);
  }
  try {
    if (!await input.receiptVerifier.verify(receipt)) {
      return result("invalid", transcript, bindingDigest, ["RECEIPT_INVALID"]);
    }
  } catch {
    return result("indeterminate", transcript, bindingDigest, ["RECEIPT_UNAVAILABLE"]);
  }
  return result(
    receipt.classification,
    transcript,
    bindingDigest,
    receipt.reasonCodes,
    receipt.authority,
  );
};

export interface ArtifactAuthorityParityEvidenceV1 {
  readonly formatVersion: 1;
  readonly status: "equivalent" | "diverged";
  readonly classification: ArtifactAuthorityClassificationV1 | null;
  readonly bindingDigest: Sha256Digest | null;
  readonly paths: readonly {
    readonly pathId: string;
    readonly authority: ArtifactAuthorityLabelV1 | null;
    readonly classification: ArtifactAuthorityClassificationV1;
  }[];
  readonly reasonCodes: readonly ("CLASSIFICATION_DIVERGENCE" | "BINDING_DIVERGENCE")[];
}

/** Compare observations from existing paths without implementing either path. */
export const compareArtifactAuthorityParityV1 = (
  paths: readonly {
    readonly pathId: string;
    readonly result: ArtifactAuthorityVerificationResultV1;
  }[],
): ArtifactAuthorityParityEvidenceV1 => {
  if (paths.length < 2 || paths.some(({ pathId }) => !nonEmpty(pathId))) {
    throw new TypeError("artifact authority parity requires at least two named paths");
  }
  if (new Set(paths.map(({ pathId }) => pathId)).size !== paths.length) {
    throw new TypeError("artifact authority parity requires unique named paths");
  }
  for (const { result: value } of paths) {
    if (
      value.formatVersion !== 1 ||
      !["valid", "invalid", "indeterminate"].includes(value.classification) ||
      value.status !== value.classification ||
      value.accepted !== (value.classification === "valid") ||
      !isSha256Digest(value.bindingDigest) ||
      (value.authority !== null && !authorityLabels.includes(value.authority)) ||
      !Array.isArray(value.reasonCodes)
    ) {
      throw new TypeError("artifact authority parity path result is invalid");
    }
  }
  const classification = paths[0].result.classification;
  const bindingDigest = paths[0].result.bindingDigest;
  const classificationDiverged = paths.some(({ result: value }) => value.classification !== classification);
  const bindingDiverged = paths.some(({ result: value }) => value.bindingDigest !== bindingDigest);
  const reasonCodes = [
    ...(classificationDiverged ? ["CLASSIFICATION_DIVERGENCE" as const] : []),
    ...(bindingDiverged ? ["BINDING_DIVERGENCE" as const] : []),
  ];
  return {
    formatVersion: 1,
    status: reasonCodes.length === 0 ? "equivalent" : "diverged",
    classification: classificationDiverged ? null : classification,
    bindingDigest: bindingDiverged ? null : bindingDigest,
    paths: paths.map(({ pathId, result: value }) => ({
      pathId,
      authority: value.authority,
      classification: value.classification,
    })),
    reasonCodes,
  };
};
