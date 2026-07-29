export {
  CredentialModelError,
  type CredentialModelErrorCode,
} from "./errors.js";
export type {
  ClaimDisclosure,
  CredentialCapabilityDescriptor,
  CredentialCapabilityKind,
  CredentialClaimDescriptor,
  CredentialCodec,
  CredentialCompositionManifest,
  CredentialFamilyDefinition,
  CredentialPackageRequirement,
  CredentialSchemaDescriptor,
  PresentationCodec,
  ProofArtifactRequirement,
} from "./types.js";
export {
  assertCredentialCompositionManifest,
  assertCredentialFamilyDefinition,
  defineCredentialFamily,
} from "./validation.js";
