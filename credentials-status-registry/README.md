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
