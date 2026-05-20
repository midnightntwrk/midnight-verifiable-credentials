# Status Verification Modes

Status: architecture note for the current `VC-MAT-20` status-contract rollout.

Companion documents:

- [`../spec/credential-status.md`](../spec/credential-status.md)
- [`../spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)
- [`../spec/revocation-registry.md`](../spec/revocation-registry.md)
- [`./live-root-binding-feasibility.md`](./live-root-binding-feasibility.md)
- [`./status-canonical-non-membership-bundle.md`](./status-canonical-non-membership-bundle.md)
- [`./status-contract-closeout-boundary.md`](./status-contract-closeout-boundary.md)
- [`./status-binding-body-root-commitment.md`](./status-binding-body-root-commitment.md)

## Purpose

This note fixes the repository's current status-verification mode matrix.

It exists because the current prototype already supports more than one real
status-checking shape, but those shapes have different trust and execution
properties:

- same-contract live revoked-set checks
- off-chain verifier-side live state observation
- external authority-attested Layer 3 verification

Those are not interchangeable, and they should not be described as if they are
all the same "revocation support" claim.

## Current Compact limitation

Today the revocation registry contract can read ordinary ledger fields
in-circuit:

- `registryId`
- `initialized`
- `version`

But it cannot yet call the `MerkleTree.root()` getter in-circuit for the live
revoked-set ledger tree.

Practical consequence:

- the contract can bind a supplied registry snapshot to the live
  `registryId` and `version`
- the runtime/off-chain layer can decode the contract state and read the live
  Merkle root
- but the generic Compact proof path cannot yet prove
  `suppliedRevokedRoot == liveMerkleRoot()` inside the revocation-registry
  contract itself

That is why the repository still distinguishes:

- runtime live-state observation
- same-contract local revoked-set membership checks
- and the final future generic in-circuit root-bound non-membership path

## Mode 1: Same-contract live revoked-set verification

Use this when:

- the business verification logic and the revoked-set ledger live in the same
  contract domain

Shape:

- the verifier contract already owns the live revoked set
- the holder discloses or proves the status handle and opening
- the contract checks that the disclosed handle is not present in the local
  revoked set

Important property:

- this mode does not need an externally supplied `revokedRoot`
- it does not need an authority-attested root bridge
- it does not need to extract the Merkle root first

So this mode is already a real Layer 3 revocation check today.

It is still not the final generic root-bound non-membership proof because it
depends on direct access to the local revoked-set ledger rather than proving
against an arbitrary accepted root snapshot.

Repository reference:

- [`../../packages/use-cases/age-gate/contract/src/demo-revocation.compact`](../../packages/use-cases/age-gate/contract/src/demo-revocation.compact)

## Mode 2: Off-chain verifier-side live-state verification

Use this when:

- the verifier can read live registry state at runtime
- full status-aware VC/VP verification does not need to terminate inside a
  Layer 3 contract

Shape:

- the verifier or trusted application decodes the live registry contract state
- reads the current `(registryId, revokedRoot, registryVersion)` snapshot
- rejects already-revoked handles against that live state
- applies freshness policy off-chain
- accepts or rejects the VC/VP attempt before any optional business call

Important property:

- this mode can read the live Merkle root at runtime
- it can normalize request and witness construction around that live state
- it does not require the verifier to mint any extra `Proof` object

That last point matters:

- reading live state and deciding `revoked` or `not revoked` is enough for this
  mode
- a signed status `Proof` object is only needed if some other verifier or Layer
  3 contract must later consume delegated status evidence

Repository reference:

- [`../../packages/registry/status-registry/src/registry-state-observation.ts`](../../packages/registry/status-registry/src/registry-state-observation.ts)

## Mode 3: External-registry authority-attested Layer 3 verification

Use this when:

- the registry is external to the business contract
- the deployment still requires a Layer 3 contract to validate status-aware
  VC/VP flows

Shape:

- a trusted status authority observes accepted live registry state
- it builds a request-bound status attestation
- it signs that attestation under the repository's generic `Proof` container
- the holder submits that attestation to the Layer 3 verifier contract

Important property:

- this mode is where a runtime-observed root becomes a signed proof artifact
- not every verifier can create that proof
- only the trusted authority, or a verifier acting as that authority, can mint
  that signed attestation

So a plain verifier without the authority key can:

- observe live state
- validate status for itself
- reject or accept

but it cannot create the authority-attested proof artifact.

Repository reference:

- [`../../packages/registry/status-registry/src/attestation-builder.ts`](../../packages/registry/status-registry/src/attestation-builder.ts)

## Decision rule

Choose the mode by trust and deployment shape, not by convenience:

1. if the business contract owns the live revoked set, prefer same-contract
   live verification
2. if verification can terminate off-chain, prefer verifier-side live-state
   verification
3. if Layer 3 must validate external-registry status, use the
   authority-attested path

Do not describe mode 1 or mode 2 as if they already solve the final generic
in-circuit root-bound non-membership target.

## What remains unfinished

The final `VC-MAT-20` target still requires a generic path where Compact can
verify status against a live accepted root without depending on:

- same-contract local revoked-set access, or
- a trusted authority's signed attestation

The main blocker today is still the missing in-circuit `MerkleTree.root()`
access for the live registry tree.

Until that lands, the repository should claim:

- same-contract live verification: available
- off-chain verifier-side live-state verification: available
- authority-attested external-registry verification: available
- final generic in-circuit live-root binding: not yet available

Repository closeout note:

- [`./status-contract-closeout-boundary.md`](./status-contract-closeout-boundary.md)
