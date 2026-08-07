import type {
  BuildManifest,
  DeploymentManifest,
  ProofManifest,
  Sha256Digest,
} from "./types.js";

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/u;

/** The only signing algorithm supported by the G1 manifest envelope. */
export const MANIFEST_SIGNATURE_ALGORITHM = "Ed25519" as const;

/** Named, versioned canonical JSON profile used by manifest digests/signatures. */
export const CANONICALIZATION_PROFILE = "canonical-json-v1" as const;

const utf8 = (value: string): Uint8Array => new TextEncoder().encode(value);

const assertCanonicalValue = (value: unknown, path: string): void => {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${path} must be finite`);
    return;
  }
  if (value === undefined || typeof value === "function" || typeof value === "bigint") {
    throw new TypeError(`${path} is not canonical JSON`);
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) throw new TypeError(`${path}[${index}] must not be a sparse array hole`);
      assertCanonicalValue(value[index], `${path}[${index}]`);
    }
    return;
  }
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must be a plain object`);
    }
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      assertCanonicalValue(child, `${path}.${key}`);
    }
    return;
  }
  throw new TypeError(`${path} is not canonical JSON`);
};

const serializeCanonicalValue = (value: unknown): string => {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError("value is not canonical JSON");
    return serialized;
  }
  if (Array.isArray(value)) return `[${value.map(serializeCanonicalValue).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
    return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${serializeCanonicalValue(child)}`).join(",")}}`;
  }
  throw new TypeError("value is not canonical JSON");
};

/**
 * Serialize a JSON value with recursively sorted object keys. This is the
 * versioned wire format used by manifest digests and signatures.
 */
export const canonicalize = (value: unknown): string => {
  assertCanonicalValue(value, "$");
  return serializeCanonicalValue(value);
};

export const serializeCanonicalJson = (value: unknown): Uint8Array => utf8(canonicalize(value));

const withoutBuildDigest = (manifest: BuildManifest): Omit<BuildManifest, "manifestDigest"> => {
  const { manifestDigest: _manifestDigest, ...unsigned } = manifest;
  return unsigned;
};

const withoutProofDigest = (manifest: ProofManifest): Omit<ProofManifest, "manifestDigest"> => {
  const { manifestDigest: _manifestDigest, ...unsigned } = manifest;
  return unsigned;
};

const withoutDeploymentEnvelope = (manifest: DeploymentManifest): Record<string, unknown> => {
  const {
    deploymentManifestDigest: _deploymentManifestDigest,
    signature,
    ...unsigned
  } = manifest;
  // The signature bytes are excluded to avoid a self-reference, but its
  // algorithm and key id are signed and digest-bound.
  return {
    ...unsigned,
    signature: { algorithm: signature.algorithm, keyId: signature.keyId },
  };
};

/** Bytes covered by a proof-manifest digest (the self-referential digest field is omitted). */
export const serializeProofManifest = (manifest: ProofManifest): Uint8Array =>
  serializeCanonicalJson(withoutProofDigest(manifest));

/** Bytes covered by a build-manifest digest (the self-referential digest field is omitted). */
export const serializeBuildManifest = (manifest: BuildManifest): Uint8Array =>
  serializeCanonicalJson(withoutBuildDigest(manifest));

/** Bytes covered by a deployment digest and Ed25519 signature. */
export const serializeDeploymentManifest = (manifest: DeploymentManifest): Uint8Array =>
  serializeCanonicalJson(withoutDeploymentEnvelope(manifest));

const subtleCrypto = (): SubtleCrypto => {
  const candidate = globalThis.crypto?.subtle;
  if (candidate === undefined) throw new Error("Web Crypto SubtleCrypto is unavailable");
  return candidate;
};

const bufferSource = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
};

const hex = (bytes: Uint8Array): string => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

export const computeSha256Digest = async (bytes: Uint8Array): Promise<Sha256Digest> => {
  const digest = new Uint8Array(await subtleCrypto().digest("SHA-256", bufferSource(bytes)));
  return `sha256:${hex(digest)}` as Sha256Digest;
};

export const computeProofManifestDigest = async (manifest: ProofManifest): Promise<Sha256Digest> =>
  computeSha256Digest(serializeProofManifest(manifest));

export const computeBuildManifestDigest = async (manifest: BuildManifest): Promise<Sha256Digest> =>
  computeSha256Digest(serializeBuildManifest(manifest));

export const computeDeploymentManifestDigest = async (manifest: DeploymentManifest): Promise<Sha256Digest> =>
  computeSha256Digest(serializeDeploymentManifest(manifest));

export const computeManifestDigest = computeSha256Digest;

export const base64UrlEncode = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
};

export const base64UrlDecode = (value: string): Uint8Array => {
  if (value.length === 0 || !BASE64URL_PATTERN.test(value) || value.includes("=")) {
    throw new TypeError("value must be unpadded base64url");
  }
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = globalThis.atob(padded);
  const decoded = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (base64UrlEncode(decoded) !== value) throw new TypeError("value is not canonical base64url");
  return decoded;
};

export const isSha256Digest = (value: unknown): value is Sha256Digest =>
  typeof value === "string" && SHA256_PATTERN.test(value);

export const isEd25519Signature = (value: unknown): value is string => {
  if (typeof value !== "string" || !BASE64URL_PATTERN.test(value)) return false;
  try {
    return base64UrlDecode(value).byteLength === 64;
  } catch {
    return false;
  }
};

export const assertArtifactBytes = async (
  artifact: { readonly bytes: number; readonly sha256: Sha256Digest },
  bytes: Uint8Array,
): Promise<void> => {
  if (bytes.byteLength !== artifact.bytes) {
    throw new Error(`artifact byte length mismatch: expected ${artifact.bytes}, got ${bytes.byteLength}`);
  }
  const actual = await computeSha256Digest(bytes);
  if (actual !== artifact.sha256) throw new Error(`artifact digest mismatch: expected ${artifact.sha256}, got ${actual}`);
};
