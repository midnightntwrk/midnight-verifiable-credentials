import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import type { StatusSha256DigestV1 } from "./index.js";

const digestPattern = /^sha256:[0-9a-f]{64}$/u;
const emptyRootMaterial = "midnight:vc:status-revoked-set:empty:v1";

const assertDigest = (digest: StatusSha256DigestV1): void => {
  if (!digestPattern.test(digest)) {
    throw new TypeError("status Merkle node must be a SHA-256 digest");
  }
};

const digestBytes = (digest: StatusSha256DigestV1): Uint8Array => {
  assertDigest(digest);
  return Uint8Array.from(Buffer.from(digest.slice("sha256:".length), "hex"));
};

/** Canonical empty revoked-set root for the SHA-256 reference tree. */
export const emptyStatusRegistryRootV1 = `sha256:${createHash("sha256")
  .update(emptyRootMaterial)
  .digest("hex")}` as const;

/** Hashes a status handle into its domain-separated Merkle leaf node. */
export const computeStatusMerkleLeafV1 = (
  statusHandleDigest: StatusSha256DigestV1,
): StatusSha256DigestV1 => {
  assertDigest(statusHandleDigest);
  return `sha256:${createHash("sha256")
    .update(Uint8Array.of(0))
    .update(digestBytes(statusHandleDigest))
    .digest("hex")}`;
};

/**
 * Hashes an ordered pair of already-domain-separated node digests. The byte
 * prefix prevents a parent from being confused with a leaf.
 */
export const computeStatusMerkleParentV1 = (
  left: StatusSha256DigestV1,
  right: StatusSha256DigestV1,
): StatusSha256DigestV1 => {
  assertDigest(left);
  assertDigest(right);
  return `sha256:${createHash("sha256")
    .update(Uint8Array.of(1))
    .update(digestBytes(left))
    .update(digestBytes(right))
    .digest("hex")}`;
};

/**
 * Reference authenticated root over the sorted revoked status-handle digests.
 * Odd levels duplicate their final node. This is deterministic reference
 * semantics, not a claim that Compact's ledger MerkleTree uses this encoding.
 */
export const computeStatusRegistryRootV1 = (
  statusHandleDigests: readonly StatusSha256DigestV1[],
): StatusSha256DigestV1 => {
  if (statusHandleDigests.length === 0) return emptyStatusRegistryRootV1;
  const sortedLeaves = [...statusHandleDigests].sort();
  if (new Set(sortedLeaves).size !== sortedLeaves.length) {
    throw new TypeError("status revoked-set leaves must be unique");
  }
  sortedLeaves.forEach(assertDigest);
  let level = sortedLeaves.map(computeStatusMerkleLeafV1);
  while (level.length > 1) {
    const next: StatusSha256DigestV1[] = [];
    for (let index = 0; index < level.length; index += 2) {
      const left = level[index]!;
      const right = level[index + 1] ?? left;
      next.push(computeStatusMerkleParentV1(left, right));
    }
    level = next;
  }
  return level[0]!;
};
