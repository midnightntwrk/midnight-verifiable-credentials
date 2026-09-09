export {
  CredentialModelError,
  type CredentialModelErrorCode,
} from "./errors.js";
export type {
  ClaimDisclosure,
  CredentialClaimDescriptor,
  CredentialFamilyDefinition,
  CredentialSchemaDescriptor,
} from "./types.js";
export {
  assertCredentialFamilyDefinition,
  defineCredentialFamily,
} from "./validation.js";
