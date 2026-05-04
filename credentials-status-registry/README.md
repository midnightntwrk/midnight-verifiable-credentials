# credentials-status-registry

Reference Compact surface for a revoked-set status registry.

Current scope:
- dedicated registry id
- append-only revoked handle `MerkleTree`
- monotonic `version` used as the registry epoch
- typed `RevocationRegistryState` snapshot helpers
- off-chain witness-builder helpers for:
  - deterministic status-handle derivation
  - status capability construction
  - witness-input construction
  - snapshot-based revoked-handle rejection

This package does not yet implement privacy-preserving non-membership verification inside Compact. It provides the authoritative state surface that status-aware VC/VP flows can anchor to.

Current prototype limitation:
- `assertStateUsesThisRegistry(...)` binds the supplied snapshot to this
  registry's `registryId` and current `version`
- it does not yet prove that the supplied `revokedRoot` equals the live
  contract Merkle root inside Compact
- callers must therefore treat `revokedRoot` as an off-chain coordinated
  snapshot value until the final in-circuit root-binding/non-membership path
  lands
