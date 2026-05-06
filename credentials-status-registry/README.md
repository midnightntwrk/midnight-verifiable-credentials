# credentials-status-registry

Reference Compact surface for a revoked-set status registry.

Status:

- prototype / evolving capability package

Tier:

- reusable core capability package with prototype trust semantics

Dependency direction:

- higher-layer families, verifier workflows, and demos may depend on it
- must not depend on protocol/orchestration packages, demos, or standalone
  integration harnesses
- shared VC-side binding shape remains in `credentials`

Reusable outside this repo:

- yes, with prototype status-path caveats

Ownership:

- `credentials`
  - owns the shared VC-side status binding vocabulary
- `credentials-status-registry`
  - owns the registry contract surface
  - owns verifier-facing status proof protocols and off-chain builders

Surface classification:

- mixed surface package
- `src/revocation-registry.compact` is `On-chain only`
- TypeScript builders and managed exports are `Off-chain only`

Start here:

1. use `src/revocation-registry.compact` when authoring a registry contract
2. use `src/witness-builder.ts` and `src/attestation-builder.ts` only in
   off-chain verifier/holder/application code
3. read:
   - [`../docs/spec/revocation-registry.md`](../docs/spec/revocation-registry.md)
   - [`../docs/spec/status-verification-protocol.md`](../docs/spec/status-verification-protocol.md)
   - [`../docs/architecture/protocol-classification.md`](../docs/architecture/protocol-classification.md)
   - [`../docs/guides/integration-surface-map.md`](../docs/guides/integration-surface-map.md)

Current scope:
- dedicated registry id
- append-only revoked handle `MerkleTree`
- monotonic internal `version` counter for registry-side bookkeeping
- typed `RevocationRegistryState` snapshot helpers
- typed `RevokedSetStatusRequest` helpers for verifier-supplied roots
- off-chain witness-builder helpers for:
  - deterministic status-handle derivation
  - registry-bound status binding construction
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

Import rule:

- credential families should import shared status binding types from
  `credentials`
- verifiers, holders, and Layer 3 status-aware application code should import
  registry-facing proof-protocol helpers from this package

Protocol reading rule:

- this package owns registry-facing status proof-protocol helpers
- it does not turn status transport/orchestration concerns into reusable core
  protocol semantics

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
