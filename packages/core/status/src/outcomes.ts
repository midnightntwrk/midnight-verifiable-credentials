export const statusInvalidityCodes = {
  revoked: "revoked",
  staleRegistryState: "staleRegistryState",
  unknownRegistry: "unknownRegistry",
  unsupportedStatusProofMode: "unsupportedStatusProofMode",
  statusBindingMismatch: "statusBindingMismatch",
  statusRequestMismatch: "statusRequestMismatch",
  authorityMismatch: "authorityMismatch",
  attestationExpired: "attestationExpired",
  attestationTooOld: "attestationTooOld",
  futureDatedAttestation: "futureDatedAttestation",
} as const;

export const statusIndeterminateCodes = {
  statusAuthorityUnavailable: "statusAuthorityUnavailable",
  statusStateUnavailable: "statusStateUnavailable",
  statusProofUnavailable: "statusProofUnavailable",
  trustedTimeUnavailable: "trustedTimeUnavailable",
  unclassifiedFailure: "unclassifiedFailure",
} as const;

export type StatusInvalidityCode =
  (typeof statusInvalidityCodes)[keyof typeof statusInvalidityCodes];
export type StatusIndeterminateCode =
  (typeof statusIndeterminateCodes)[keyof typeof statusIndeterminateCodes];

export type StatusVerificationOutcome =
  | { readonly verdict: "valid"; readonly state: "active"; readonly evidence?: unknown }
  | { readonly verdict: "invalid"; readonly code: StatusInvalidityCode; readonly message?: string }
  | { readonly verdict: "indeterminate"; readonly code: StatusIndeterminateCode; readonly message?: string };

export class StatusVerificationError extends Error {
  readonly verdict: "invalid" | "indeterminate";
  readonly code: StatusInvalidityCode | StatusIndeterminateCode;

  constructor(outcome: Exclude<StatusVerificationOutcome, { verdict: "valid" }>) {
    super(outcome.message ?? `Status verification is ${outcome.verdict}: ${outcome.code}`);
    this.name = "StatusVerificationError";
    this.verdict = outcome.verdict;
    this.code = outcome.code;
  }
}

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return (
      (prototype === Object.prototype || prototype === null) &&
      Object.hasOwn(value, "verdict") &&
      Object.hasOwn(value, "state")
    );
  } catch {
    return false;
  }
};

export const isStatusValid = (
  outcome: StatusVerificationOutcome,
): outcome is Extract<StatusVerificationOutcome, { verdict: "valid" }> =>
  isPlainRecord(outcome) &&
  outcome.verdict === "valid" &&
  outcome.state === "active";

/** Fail closed for both proved invalidity and unavailable required evidence. */
export const assertStatusOutcome = (
  outcome: StatusVerificationOutcome,
): asserts outcome is Extract<StatusVerificationOutcome, { verdict: "valid" }> => {
  if (!isStatusValid(outcome)) {
    throw new StatusVerificationError(outcome);
  }
};
