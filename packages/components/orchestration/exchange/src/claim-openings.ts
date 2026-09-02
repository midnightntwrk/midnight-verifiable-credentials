import type {
  CanonicalFamilyIdentity,
  CanonicalMessage,
} from "./canonical-messages.js";

/** The holder identity and exact claim-opening set bound into an issuance request. */
export interface HolderClaimOpeningRequest {
  readonly recipientId: string;
  readonly claimIds: readonly string[];
}

/**
 * Additive request wrapper for committed-private issuance. The canonical family
 * request remains byte-for-byte unchanged; the holder-only delivery request is
 * an orchestration sidecar.
 */
export interface IssuanceRequestWithClaimOpenings {
  readonly formatVersion: 1;
  readonly request: CanonicalMessage<"issuance-request">;
  readonly claimOpenings: HolderClaimOpeningRequest;
}

/**
 * Opaque holder-only material. Its family adapter owns encoding, commitment
 * validation, and selective extraction. It must travel only on the confidential
 * issuance path addressed to `recipientId`.
 */
export interface HolderClaimOpeningDelivery {
  readonly formatVersion: 1;
  readonly recipientId: string;
  readonly claimIds: readonly string[];
  readonly payload: Uint8Array;
}

/** The issued canonical credential plus its separate holder-only sidecar. */
export interface CredentialIssuanceResult {
  readonly formatVersion: 1;
  /** Exact canonical request echoed for holder-side result correlation. */
  readonly request: CanonicalMessage<"issuance-request">;
  readonly credential: CanonicalMessage<"credential">;
  readonly claimOpenings: HolderClaimOpeningDelivery;
}

/** An opaque, exact subset recovered by the holder for family-owned disclosure. */
export interface HolderClaimOpeningSelection {
  readonly claimIds: readonly string[];
  readonly payload: Uint8Array;
}

export interface HolderCredentialStoreKey extends CanonicalFamilyIdentity {
  readonly recipientId: string;
}

/** Private wallet record. Public receipts and presentations never contain it. */
export interface HolderCredentialRecord extends HolderCredentialStoreKey {
  readonly formatVersion: 1;
  readonly issuanceRequest: CanonicalMessage<"issuance-request">;
  readonly credential: CanonicalMessage<"credential">;
  readonly claimOpenings: HolderClaimOpeningDelivery;
}

export interface HolderCredentialStore {
  load(key: HolderCredentialStoreKey): HolderCredentialRecord | undefined;
  save(record: HolderCredentialRecord): void;
}

export interface HolderAgentOptions {
  readonly recipientId?: string;
  readonly credentialStore?: HolderCredentialStore;
}

/** Deliberately non-correlating metadata so receipts expose no holder material. */
export interface HolderCredentialAcceptanceReceipt extends CanonicalFamilyIdentity {
  readonly formatVersion: 1;
  readonly deliveredClaimCount: number;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const assertClaimIds: (
  value: unknown,
  context: string,
) => asserts value is readonly string[] = (value, context) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${context} must contain at least one requested claim identifier`);
  }
  const seen = new Set<string>();
  for (const claimId of value) {
    if (!isNonEmptyString(claimId)) {
      throw new Error(`${context} contains an invalid claim identifier`);
    }
    if (seen.has(claimId)) {
      throw new Error(`${context} contains duplicate claim identifier "${claimId}"`);
    }
    seen.add(claimId);
  }
};

export const assertClaimOpeningRequest = (
  request: HolderClaimOpeningRequest,
): void => {
  if (!isNonEmptyString(request?.recipientId)) {
    throw new Error("Claim-opening recipient must be a non-empty identifier");
  }
  assertClaimIds(request.claimIds, "Claim-opening request");
};

const sameClaimIds = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export const assertClaimOpeningDelivery = (
  delivery: HolderClaimOpeningDelivery,
  expected: HolderClaimOpeningRequest,
): void => {
  if (delivery?.formatVersion !== 1) {
    throw new Error("Claim-opening delivery formatVersion must be 1");
  }
  if (delivery.recipientId !== expected.recipientId) {
    throw new Error("Claim-opening delivery recipient does not match intended recipient");
  }
  assertClaimIds(delivery.claimIds, "Claim-opening delivery");
  if (!sameClaimIds(delivery.claimIds, expected.claimIds)) {
    throw new Error("Claim-opening delivery does not contain the exact requested claim identifiers");
  }
  if (!(delivery.payload instanceof Uint8Array) || delivery.payload.length === 0) {
    throw new Error("Claim-opening delivery payload must contain family-owned bytes");
  }
};

export const assertClaimOpeningSelection = (
  selection: HolderClaimOpeningSelection,
  expectedClaimIds: readonly string[],
): void => {
  assertClaimIds(selection?.claimIds, "Claim-opening selection");
  if (!sameClaimIds(selection.claimIds, expectedClaimIds)) {
    throw new Error("Claim-opening adapter returned a selection other than the requested claims");
  }
  if (!(selection.payload instanceof Uint8Array) || selection.payload.length === 0) {
    throw new Error("Claim-opening selection payload must contain family-owned bytes");
  }
};

export const cloneCanonicalMessage = <TKind extends CanonicalMessage["kind"]>(
  message: CanonicalMessage<TKind>,
): CanonicalMessage<TKind> => ({
  ...message,
  payload: message.payload.slice(),
});

export const cloneClaimOpeningDelivery = (
  delivery: HolderClaimOpeningDelivery,
): HolderClaimOpeningDelivery => ({
  ...delivery,
  claimIds: [...delivery.claimIds],
  payload: delivery.payload.slice(),
});

export const cloneHolderCredentialRecord = (
  record: HolderCredentialRecord,
): HolderCredentialRecord => ({
  ...record,
  issuanceRequest: cloneCanonicalMessage(record.issuanceRequest),
  credential: cloneCanonicalMessage(record.credential),
  claimOpenings: cloneClaimOpeningDelivery(record.claimOpenings),
});
