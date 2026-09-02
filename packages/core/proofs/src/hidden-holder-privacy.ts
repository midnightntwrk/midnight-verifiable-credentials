import type { AuthorityEvidenceVerificationResultV1 } from "./authority-evidence.js";
import { computeSha256Digest, serializeCanonicalJson } from "./serialization.js";
import type { Sha256Digest } from "./types.js";

const FORBIDDEN_FIELD_NAMES = new Set([
  "credentialroot",
  "credentialclaimroot",
  "holderdid",
  "holderidentifier",
  "holdersecret",
  "statushandle",
  "statushandledigest",
  "statusleaf",
  "statusopening",
  "statuswitness",
  "presentationopening",
  "privateleafdigest",
]);

const normalizeFieldName = (value: string): string =>
  value.replaceAll(/[^a-z0-9]/giu, "").toLowerCase();

const isBytes = (value: unknown): value is Uint8Array => value instanceof Uint8Array;

const sameBytes = (left: Uint8Array, right: Uint8Array): boolean =>
  left.byteLength === right.byteLength && left.every((value, index) => value === right[index]);

export type HiddenHolderPrivacyErrorCodeV1 = "HIDDEN_HOLDER_PUBLIC_LEAK";

/** Bounded privacy error: it deliberately excludes paths and rejected values. */
export class HiddenHolderPrivacyError extends Error {
  readonly code: HiddenHolderPrivacyErrorCodeV1 = "HIDDEN_HOLDER_PUBLIC_LEAK";

  constructor(kind: "field" | "value") {
    super(`Hidden-holder public surface contains a privacy-forbidden ${kind}`);
    this.name = "HiddenHolderPrivacyError";
  }
}

export interface HiddenHolderPublicSurfaceOptionsV1 {
  /** Stable private values that must not survive under an otherwise-safe key. */
  readonly forbiddenValues?: readonly Uint8Array[];
}

const visit = (
  value: unknown,
  options: HiddenHolderPublicSurfaceOptionsV1,
  seen: Set<object>,
): void => {
  if (isBytes(value)) {
    if (options.forbiddenValues?.some((candidate) => sameBytes(value, candidate)) === true) {
      throw new HiddenHolderPrivacyError("value");
    }
    return;
  }
  if (value === null || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const entry of value) visit(entry, options, seen);
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (
      FORBIDDEN_FIELD_NAMES.has(normalizeFieldName(key)) ||
      /(?:opening|witness)$/iu.test(key)
    ) {
      throw new HiddenHolderPrivacyError("field");
    }
    visit(entry, options, seen);
  }
};

export const assertHiddenHolderPublicSurfaceV1 = <T>(
  value: T,
  options: HiddenHolderPublicSurfaceOptionsV1 = {},
): T => {
  visit(value, options, new Set());
  return value;
};

const snapshot = (value: unknown, seen: Set<object>): unknown => {
  if (isBytes(value)) return `<bytes:${value.byteLength}>`;
  if (typeof value === "bigint") return `<bigint:${value.toString(10)}>`;
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "<cycle>";
  seen.add(value);
  if (Array.isArray(value)) return value.map((entry) => snapshot(entry, seen));
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, snapshot(entry, seen)]),
  );
};

export const deriveAuthenticatedVerifierIdentityDigestV1 = async (
  authority: AuthorityEvidenceVerificationResultV1,
): Promise<Sha256Digest> => {
  const verifier = authority.transcript.actors.find(({ role }) => role === "verifier");
  if (
    authority.status !== "valid" ||
    authority.decisionStatus !== "approved" ||
    authority.accepted !== true ||
    verifier?.didEvidence?.authenticated !== true ||
    verifier.didEvidence.lifecycleStatus !== "active" ||
    verifier.trustEvidence?.authenticated !== true ||
    verifier.trustEvidence.status !== "active" ||
    verifier.didEvidence.did !== verifier.trustEvidence.subjectDid ||
    verifier.didEvidence.methodId !== verifier.trustEvidence.methodId ||
    verifier.didEvidence.keyFingerprint !== verifier.trustEvidence.keyFingerprint
  ) {
    throw new HiddenHolderPrivacyError("value");
  }
  return computeSha256Digest(serializeCanonicalJson({
    domain: "midnight:vc:hidden-holder-verifier-identity:v1",
    authorityTranscriptDigest: authority.transcriptDigest,
    did: verifier.didEvidence.did,
    methodId: verifier.didEvidence.methodId,
    keyFingerprint: verifier.didEvidence.keyFingerprint,
    network: verifier.didEvidence.network,
    trustScope: verifier.trustEvidence.scope,
    trustEpoch: verifier.trustEvidence.epoch,
  }));
};

/** Creates reviewable snapshots without retaining raw byte arrays. */
export const snapshotHiddenHolderPublicSurfaceV1 = (value: unknown): unknown => {
  assertHiddenHolderPublicSurfaceV1(value);
  return snapshot(value, new Set());
};
