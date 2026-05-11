# Canonical Status Non-Membership Bundle

This note freezes the current runtime witness contract for the
non-authority-attested status path.

It does not claim that the repository already ships the final in-circuit
Merkle non-membership proof. It defines the canonical bundle shape that current
helpers and future proof work must build on.

## Purpose

The repository already had the core ingredients for revoked-set verification:

- `RevokedSetStatusRequest`
- `RevokedSetNonMembershipWitnessInput`
- `RevokedSetNonMembershipStatusProofProtocol`
- `LiveStatusWitnessInput`
- shared `RegistryBoundStatusBinding`

What it lacked was one explicit runtime surface that says:

- which bundle shape is canonical today
- how the observed-snapshot and same-contract live-state modes relate
- which invariants are already enforced before any final Merkle proof lands

## Canonical runtime bundle types

The status-registry package now exports:

- `CanonicalObservedNonMembershipBundle`
- `CanonicalLiveNonMembershipBundle`
- `CanonicalNonMembershipBundle`

plus the corresponding builders:

- `buildCanonicalObservedNonMembershipBundle(...)`
- `buildCanonicalLiveNonMembershipBundleFromContractState(...)`
- `assertCanonicalNonMembershipBundle(...)`

Those helpers live in:

- `registry/status-registry/src/canonical-non-membership.ts`

## Observed-snapshot mode

`CanonicalObservedNonMembershipBundle` is the canonical runtime surface when
the verifier accepts an observed `(registryId, revokedRoot, registryVersion)`
snapshot.

The bundle contains:

- the normalized observed snapshot and observation time
- the canonical request:
  - `RevokedSetStatusRequest`
- the canonical witness input:
  - `RevokedSetNonMembershipWitnessInput`
- the combined protocol object:
  - `RevokedSetNonMembershipStatusProofProtocol`
- the shared VC-side `RegistryBoundStatusBinding`
- the derived `statusHandle`

Already enforced:

- request/protocol consistency
- request/observed-state consistency
- witness/protocol consistency
- status-binding to witness/protocol consistency
- fail-closed rejection when the accepted revoked-set snapshot already contains
  the derived handle

Not yet enforced:

- final in-circuit Merkle non-membership against the accepted root

## Same-contract live-state mode

`CanonicalLiveNonMembershipBundle` is the canonical runtime surface when the
business contract owns or can read the live revocation registry state directly.

The bundle contains:

- the live `RevocationRegistryState` read from contract state
- the canonical `LiveStatusWitnessInput`
- the shared VC-side `RegistryBoundStatusBinding`
- the derived `statusHandle`

Already enforced:

- live-state to binding consistency
- live witness to binding consistency
- fail-closed rejection when the live registry already contains the derived
  handle

This mode does not require a separate external `(registryId, revokedRoot)`
handoff during verification because the contract/runtime reads the accepted
state directly.

It is still not the final generic in-circuit root-bound non-membership path.
The current Compact/runtime boundary still prevents a generic
`MerkleTree.root()`-driven live-root proof from becoming the shared final
surface.

## Shared holder-side contract

Across both canonical bundle modes, the holder-side status contract is still:

- a shared `RegistryBoundStatusBinding`
- a derived `statusHandle`
- the `statusHandleOpening` that reproduces the committed
  `statusHandleCommitment`

Any future Merkle witness extension must stay subordinate to that same
registry-bound handle-opening model. It should extend the canonical bundle
rather than replace it with app-local status metadata.

## Relation to the three verification modes

This note covers the two non-authority-attested runtime bundle modes:

- observed snapshot
- same-contract live state

The third supported verification mode remains:

- authority-attested external-registry verification

That mode has a different runtime surface because the trusted authority signs a
request-bound status statement rather than supplying the non-attested
revoked-set bundle directly.

See also:

- [status-verification-modes.md](/private/tmp/vc-core-redesign-plan/docs/architecture/status-verification-modes.md)
- [status-verification-protocol.md](/private/tmp/vc-core-redesign-plan/docs/spec/status-verification-protocol.md)
- [revocation-registry.md](/private/tmp/vc-core-redesign-plan/docs/spec/revocation-registry.md)
