export {
  buildAuthorityAttestedStatusProofProtocol,
  buildAuthorityAttestedStatusRequest,
  buildAuthorityAttestedStatusStatement,
  deriveAuthorityAttestedStatusProofNonceScalar,
  signAuthorityAttestedStatusProof,
  type StatusAuthoritySigner,
} from "./attestation-builder.js";
export * from "./managed/revocation-registry/contract/index.js";
export * as RevocationRegistryContract from "./managed/revocation-registry/contract/index.js";
export * from "./registry-state-observation.js";
export * from "./status-binding.js";
export * from "./witness-builder.js";
