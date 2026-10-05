export {
  CredentialModelError,
  type CredentialModelErrorCode,
} from "./errors.js";
export type {
  ClaimDisclosure,
  CredentialClaimDescriptor,
  CredentialSchemaDefinition,
} from "./types.js";
export {
  assertCredentialSchemaDefinition,
  defineCredentialSchema,
} from "./validation.js";
