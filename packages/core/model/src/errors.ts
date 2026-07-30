export type CredentialModelErrorCode =
  | "INVALID_IDENTIFIER"
  | "INVALID_VERSION"
  | "INVALID_DESCRIPTOR"
  | "DUPLICATE_ID"
  | "INVALID_PACKAGE_REQUIREMENT"
  | "INVALID_CODEC";

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
