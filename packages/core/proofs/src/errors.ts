export type CredentialProofsErrorCode =
  | "INVALID_IDENTIFIER"
  | "INVALID_VERSION"
  | "INVALID_DIGEST"
  | "INVALID_MANIFEST"
  | "INVALID_ARTIFACT"
  | "INVALID_TIMESTAMP"
  | "DUPLICATE_ID"
  | "MISMATCHED_REFERENCE"
  | "WRONG_DIGEST"
  | "INVALID_SIGNATURE"
  | "INVALID_SIGNATURE_KEY"
  | "MISMATCHED_DEPLOYMENT_BINDING"
  | "STALE_DEPLOYMENT_BINDING";

export class CredentialProofsError extends Error {
  readonly code: CredentialProofsErrorCode;
  readonly path: string;

  constructor(code: CredentialProofsErrorCode, path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "CredentialProofsError";
    this.code = code;
    this.path = path;
  }
}
