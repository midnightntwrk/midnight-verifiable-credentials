export {
  createMidnightDIDHolderBinding,
  createMidnightDIDSignerDescriptor,
  midnightDIDMethodId,
  resolveMidnightDIDMethodBinding,
} from "./adapter.js";
export type { SignMidnightDIDProofOptions } from "./signing.js";
export {
  signMidnightDIDCredentialProof,
  signMidnightDIDPresentationProof,
} from "./signing.js";
export type {
  CreateMidnightDIDSignerDescriptorOptions,
  MidnightDIDHolderBinding,
  MidnightDIDMethodBinding,
  MidnightDIDSignerDescriptor,
  MidnightDIDVerificationRelationship,
  ResolveMidnightDIDMethodBindingOptions,
} from "./types.js";
