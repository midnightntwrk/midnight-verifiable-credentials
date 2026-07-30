export const statusVerificationErrorCodes = {
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
  unclassifiedFailure: "unclassifiedFailure",
} as const;

export type StatusVerificationErrorCode =
  (typeof statusVerificationErrorCodes)[keyof typeof statusVerificationErrorCodes];

export class StatusHelperError extends Error {
  readonly code: StatusVerificationErrorCode;

  constructor({
    code,
    message,
    cause,
  }: {
    readonly code: StatusVerificationErrorCode;
    readonly message: string;
    readonly cause?: unknown;
  }) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "StatusHelperError";
    this.code = code;
  }
}
