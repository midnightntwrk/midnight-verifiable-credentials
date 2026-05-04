# credentials-status-registry

Reference Compact surface for a revoked-set status registry.

Current scope:
- dedicated registry id
- append-only revoked handle `MerkleTree`
- monotonic internal `version` counter for registry-side bookkeeping
- typed `RevocationRegistryState` snapshot helpers
- typed `RevokedSetStatusRequest` helpers for verifier-supplied roots
- off-chain witness-builder helpers for:
  - deterministic status-handle derivation
  - status capability construction
  - witness-input construction
  - snapshot-based revoked-handle rejection
- authority-attested status helpers for:
  - request-bound attestation statements
  - status authority signatures
  - Layer 3 transitional verification flows

Nonce requirement for authority-attested proofs:

- `signAuthorityAttestedStatusProof(...)` currently expects the caller to supply
  a fresh JubJub subgroup nonce scalar in `[1, JUBJUB_SUBGROUP_ORDER)`
- callers must not reuse or bias that nonce
- nonce generation policy is still application-side in the current prototype

This package does not yet implement privacy-preserving non-membership verification inside Compact. It provides the authoritative state surface that status-aware VC/VP flows can anchor to.

Current prototype limitation:
- `assertStateUsesThisRegistry(...)` binds the supplied snapshot to this
  registry's `registryId`
- it does not yet prove that the supplied `revokedRoot` equals the live
  contract Merkle root inside Compact
- freshness of the supplied root is currently an application/verifier
  responsibility, not an in-circuit property
- callers must therefore treat `revokedRoot` as an off-chain coordinated
  snapshot value until the final in-circuit root-binding/non-membership path
  lands
