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
- `src/status-proof-protocol.compact` is `Reusable Compact proof-protocol surface`
- TypeScript builders and managed exports are `Off-chain only`

Start here:

1. use `src/revocation-registry.compact` when authoring a registry contract
2. use `src/status-proof-protocol.compact` when a family or Layer 3 contract
   needs registry-facing status proof-protocol types and validators
3. use `src/witness-builder.ts` and `src/attestation-builder.ts` only in
   off-chain verifier/holder/application code
4. read:
   - [`../docs/spec/revocation-registry.md`](../docs/spec/revocation-registry.md)
   - [`../docs/spec/status-verification-protocol.md`](../docs/spec/status-verification-protocol.md)
   - [`../docs/architecture/protocol-classification.md`](../docs/architecture/protocol-classification.md)
   - [`../docs/guides/integration-surface-map.md`](../docs/guides/integration-surface-map.md)

Current scope:

- dedicated registry id
- append-only revoked handle `MerkleTree`
- monotonic internal `version` counter for registry-side bookkeeping
- typed `RevocationRegistryState` snapshot helpers
  - snapshot shape now includes `registryVersion`
  - `assertStateUsesThisRegistry(...)` binds that version to the live contract
    counter even though the Merkle root is still verifier-supplied
- typed `RevokedSetStatusRequest` helpers for verifier-supplied roots
- off-chain witness-builder helpers for:
  - deterministic status-handle derivation
  - registry-bound status binding construction
  - canonical revoked-set status request construction
  - witness-input construction
  - canonical request + witness + protocol bundle construction
  - snapshot-based revoked-handle rejection
- authority-attested status helpers for:
  - request-bound attestation statements
  - status authority signatures
  - Layer 3 transitional verification flows

Nonce requirement for authority-attested proofs:

- `signAuthorityAttestedStatusProof(...)` now derives a deterministic JubJub
  subgroup nonce scalar via domain-separated SHA-256 plus rejection sampling
  from:
  - the attestation statement
  - signer verification-method identity
  - signer secret key
  - `createdAt`
- this is now the default safe helper path
- the low-level escape hatch is
  `unsafeSignAuthorityAttestedStatusProofWithNonceScalar(...)`
- callers should treat that unsafe override as test-only or tightly controlled
  integration glue rather than a normal application path

Freshness requirement for authority-attested proofs:

- verifier policy can now require a bounded freshness window by:
  - enabling `enforceAttestationMaxAge`
  - supplying a non-zero `maxAttestationAge`
- that freshness window uses the same unit as:
  - the verifier-supplied `currentTime`
  - the attestation `createdAt`
- this is separate from the attestation's optional absolute `expiresAt`
- recommended prototype posture:
  - use absolute expiration to cap overall lifetime
  - use verifier max-age to bound replay of otherwise still-unexpired
    authority attestations

This package does not yet implement privacy-preserving non-membership verification inside Compact. It provides the authoritative state surface that status-aware VC/VP flows can anchor to.

Import rule:

- credential families should import shared status binding types from
  `credentials`
- credential families and Layer 3 contracts should import registry-facing
  proof-protocol Compact types and validators from
  `src/status-proof-protocol.compact`
- verifiers, holders, and Layer 3 status-aware application code should import
  registry-facing proof-protocol helpers from this package

Protocol reading rule:

- this package owns registry-facing status proof-protocol helpers
- it does not turn status transport/orchestration concerns into reusable core
  protocol semantics

Canonical revoked-set helper path:

- use `buildRevokedSetNonMembershipInputs(...)` when you want the whole
  prototype bundle in one call:
  - `RevokedSetStatusRequest`
  - `RevokedSetNonMembershipWitnessInput`
  - `RevokedSetNonMembershipStatusProofProtocol`
  - matching shared `RegistryBoundStatusBinding`
- the exported TypeScript helper path is now binding-first:
  helper results carry `RegistryBoundStatusBinding` and no longer expose a
  separate capability-shaped intermediate value
- this helper still does not prove final Merkle non-membership
- it normalizes the request/witness/protocol shape so higher-layer families and
  verifier code stop rebuilding those pieces ad hoc

Current prototype limitation:

- `assertStateUsesThisRegistry(...)` binds the supplied snapshot to this
  registry's `registryId` and `registryVersion`
- it does not yet prove that the supplied `revokedRoot` equals the live
  contract Merkle root inside Compact
- freshness of the supplied root is still an application/verifier
  responsibility, not an in-circuit property
- authority-attested proof freshness is now partially contract-enforced when
  the verifier enables `enforceAttestationMaxAge`, but that does not make the
  supplied root itself live or canonical
- callers must therefore treat `revokedRoot` as an off-chain coordinated
  snapshot value until the final in-circuit root-binding/non-membership path
  lands

Observed-root integration helper path:

- use `buildObservedRevocationRegistryState(...)` to normalize a verifier-side
  snapshot plus observation time
- use `assertObservedRevocationRegistryVersionAtLeast(...)` when the caller
  must reject snapshots older than a known contract-version floor
- use `assertObservedRevocationRegistryStateFreshEnough(...)` when the caller
  already has a normalized snapshot and only needs the freshness decision
- use `buildRevokedSetStatusRequestFromObservedState(...)` when request
  construction must reject stale or future-dated snapshots before entering the
  Compact proof path
- use `buildFreshRevokedSetNonMembershipInputs(...)` when you want that same
  freshness gate applied to the canonical request/witness/protocol bundle
- this still does not make the root live inside Compact:
  it turns the current verifier-side freshness choice into one explicit typed
  integration seam instead of leaving it as ad hoc application logic
