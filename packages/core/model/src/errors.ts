export type CredentialModelErrorCode =
  | "INVALID_IDENTIFIER"
  | "INVALID_VERSION"
  | "INVALID_DESCRIPTOR"
  | "DUPLICATE_ID"
  | "INVALID_PACKAGE_REQUIREMENT"
  | "INVALID_CODEC"
  | "MISSING_FIELD"
  | "UNKNOWN_FIELD"
  | "UNSUPPORTED_VALUE"
  | "CONTRADICTORY_PROFILE"
  | "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION"
  | "STATUS_EVIDENCE_REQUIRED"
  | "CALLER_TIME_WITH_LEDGER_AUTHORITY"
  | "ATOMIC_REPLAY_REQUIRED"
  | "DISABLED_CAPABILITY_DEPENDENCY"
  | "LEDGER_COMMIT_REQUIRED"
  | "UNTESTED_COMBINATION"
  | "MISSING_REQUIRED_RULE"
  | "FAMILY_IDENTITY_MISMATCH"
  | "PROFILE_ASSEMBLY_MISMATCH"
  | "UNKNOWN_PROVIDER"
  | "CAPABILITY_NOT_PROVIDED"
  | "PACKAGE_VERSION_CONFLICT"
  | "MISSING_ARTIFACT";

export class CredentialModelError extends Error {
  readonly code: CredentialModelErrorCode;
  readonly path: string;

  constructor(
    code: CredentialModelErrorCode,
    path: string,
    message: string,
  ) {
    super(`${path}: ${message}`);
    this.name = "CredentialModelError";
    this.code = code;
    this.path = path;
  }
}
