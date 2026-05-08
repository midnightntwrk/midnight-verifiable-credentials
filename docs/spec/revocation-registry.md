# Midnight VC Revocation Registry

Status: prototype normative companion draft for the first Midnight-native
revocation target.

Companion documents:

- [`./midnight-credentials.md`](./midnight-credentials.md)
- [`./credential-status.md`](./credential-status.md)
- [`./status-verification-protocol.md`](./status-verification-protocol.md)
- [`./profiles.md`](./profiles.md)
- [`./conformance.md`](./conformance.md)

## Purpose

This document defines the repository's prototype target for revocation.

It narrows the current status contract into a concrete direction:

- `MerkleTree<n, T>` as the canonical registry primitive
- a revoked-set model
- privacy-preserving non-membership proofs over that revoked set
- a minimal canonical state shape without revocation reason or revocation date
  in the core proof model

This document is still a prototype spec. The repository already contains
partial implementation surfaces for the registry state, request/witness/proof-
protocol vocabulary, and observed-root helper path, but it does not yet
contain the final in-circuit non-membership implementation described here.

## Scope

This document defines:

- the prototype revocation registry shape
- the status binding and proof-protocol model for VC/VP/protocol extensions
- the canonical Level 2 target proof protocol
- why this direction is preferred over alternatives
- extension points for future richer status models

This document does not define:

- final wire formats
- final governance / multi-authority policy
- a public status-list fallback as the primary target
- the exact Compact syntax of the final implementation

## Design decisions

The repository's prototype revocation target makes these decisions:

1. use `MerkleTree`, not `HistoricMerkleTree`
2. use non-membership in a revoked set
3. keep the canonical registry state minimal:
   - no revocation reason in the proof model
   - no revocation date in the proof model
4. make revocation a first-class VC/VP/protocol capability, not ad hoc app
   metadata

## Why these decisions are strong

### 1. `MerkleTree` instead of `HistoricMerkleTree`

Revocation is freshness-sensitive.

`HistoricMerkleTree` is useful when old proofs should remain acceptable after
insertions. That is the opposite of the main revocation requirement:

- once a credential is revoked, stale older proofs should not remain
  automatically acceptable

So the canonical revocation proof should target the current accepted registry
root, not a historic root family.

### 2. Revoked-set non-membership instead of active-set inclusion

The revoked-set model is preferred because:

- revocation is naturally append-only
- issuance does not need to mutate a global active set forever
- auditors and operators can reason about a monotonic set of revoked handles
- the proof statement is clean:
  - "this credential's status handle is not in the revoked set under the
    accepted root"

### 3. Minimal canonical state

The core revocation proof only needs to answer:

- is the credential revoked or not?

It does not need, in the canonical proof model, to expose:

- why it was revoked
- when it was revoked

Keeping those details out of the canonical proof model is good because:

- it keeps the circuit surface smaller
- it avoids leaking unnecessary semantics into the verifier proof
- it preserves room for richer application-specific status metadata later

### 4. Capability-based integration

Revocation should compose like holder binding does:

- as an explicit capability with typed semantics
- not as optional off-chain glue hidden in app code

That makes the contract surface clearer and lets conformance claims state
precisely whether status logic is absent, public, or privacy-preserving.

## Status binding and proof-protocol model

The repository should model credential status through:

- a VC/VP status binding layer
- a presentation-time status proof-protocol layer

Conceptually:

- a VC/VP family chooses one status binding shape
- the verifier/protocol chooses one status proof protocol for that binding

### 1. `NoStatusBinding`

This is the explicit zero-status binding.

Current compatibility name in code:

- `NoStatusCapability`

Purpose:

- represent credentials and presentations with no revocation logic at all
- make "no status support" an explicit choice instead of an implicit omission

Semantics:

- no status handle
- no status witness
- no revocation/non-revocation verification logic
- only claim expiry or session expiry may still exist where the family defines
  them

This binding complements all VC/VP families that currently have no revocation
support.

### 2. `RegistryBoundStatusBinding`

This is the normalized target binding shape for status-aware credentials.

Purpose:

- bind a credential to one revocation registry domain and one committed
  status-handle domain without choosing the verifier-facing proof mode yet

Semantics:

- the credential binds:
  - `registryRef`
  - `statusHandleCommitment`
- later verifier-facing proof modes must match that same binding

Current compatibility names in code:

- `AuthorityAttestedStatusCapability`
- `RevokedSetNonMembershipStatusCapability`

Those current capability structs should be read as two proof-mode wrappers over
one shared registry-bound binding model.

### 3. `RevokedSetNonMembershipStatusProofProtocol`

This is the prototype Level 2 target proof protocol.

Purpose:

- prove non-revocation for a registry-bound status handle without requiring a
  public lookup during proof verification

Semantics:

- the verifier accepts a published `(registryId, revokedRoot)`
- the holder proves non-membership of the status handle in the revoked set
- the VP proof includes status consistency and non-revocation logic

Current canonical prototype shape:

- public request:
  - `RevokedSetStatusRequest`
  - carries `registryState` plus `verifierChallengeHash`
- holder witness:
  - `RevokedSetNonMembershipWitnessInput`
  - carries `registryState`, `statusHandle`, and `statusHandleOpening`
- combined proof-protocol container:
  - `RevokedSetNonMembershipStatusProofProtocol`

Current invariants:

- the request and witness must agree on `registryId`
- the request and witness must agree on `revokedRoot`
- the witness must open to the status-handle commitment already carried by the
  VC-side status binding or status capability

Future final Merkle non-membership witness material should extend this shape.
It should not replace the canonical request object or the committed
status-handle-opening model.

Current off-chain implementation helper path:

- `buildRevokedSetNonMembershipInputs(...)`
- `buildObservedRevocationRegistryState(...)`
- `buildRevokedSetStatusRequestFromObservedState(...)`
- `buildFreshRevokedSetNonMembershipInputs(...)`

Those helpers normalize the request/witness/protocol bundle and the verifier's
accepted snapshot freshness choice. They do not yet add final in-circuit Merkle
non-membership or live-root discovery.

### 4. `AuthorityAttestedStatusProofProtocol`

This is the current transitional proof protocol.

Purpose:

- bridge the current Layer 3 contract story before final in-circuit
  non-membership verification lands

Semantics:

- the verifier supplies an accepted `(registryId, revokedRoot)`
- a trusted authority signs a request-bound status attestation over that root
- the business contract verifies that attestation alongside the VC/VP
- the attestation must match the same registry-bound status binding already
  carried by the credential

### Deferred capability families

The taxonomy leaves room for future additions such as:

- `PublicStatusListProofProtocol`
- `SuspensionAwareStatusBinding`
- `ReasonCarryingStatusBinding`
- `DelegatedStatusAuthorityProofProtocol`

But those are not the prototype target.

## Registry model

The prototype registry model is:

- one dedicated revocation registry contract per registry domain
- ledger state publishes:
  - `registryId`
  - `revokedRoot`
- an internal monotonic update counter may exist for registry-side bookkeeping

The canonical VC/VP/protocol surface does not need to expose a registry epoch.
For the current prototype target, freshness is enforced by who supplies and
accepts the revocation root, not by an in-band epoch field carried in the
credential status witness.

Current prototype implementation note:

- the repository's current Compact implementation does not yet expose an
  in-circuit Merkle-root equality check for the revoked-set tree
- so `assertStateUsesThisRegistry(...)` currently binds a supplied snapshot to:
  - the contract's `registryId`
- but it does not yet prove that the supplied `revokedRoot` equals the live
  contract Merkle root

Until the final in-circuit non-membership path lands, the current repository
implementation must treat `revokedRoot` as an off-chain coordinated snapshot
value, not as a fully contract-proven root.

That means the current prototype witness shape is already canonical for:

- request binding
- registry-domain binding
- status-handle-opening consistency

but not yet for:

- final live-root equality inside the registry contract
- final Merkle non-membership inside the business-contract verification path

## Status handle model

The canonical proof model should not use a raw credential hash directly as the
public registry key.

Instead, the family binds a dedicated `StatusHandle` or
`StatusHandleCommitment`.

Why:

- clear domain separation
- easier migration/versioning
- avoids overloading a generic credential hash with status semantics
- allows hidden-holder-friendly derivation patterns later

Issuer requirement:

- `issuerStatusSalt` must be unique per credential instance
- reusing the same salt across multiple credentials weakens the privacy goal of
  the revoked-set design and increases correlation risk if status handles are
  ever observed or derived

## VC extension point

Credential families that opt into status support should extend their credential
model with a status binding.

At the spec level, the VC needs to bind:

- `StatusRegistryRef`
- the chosen status binding shape
- any family-specific status commitment fields

The prototype target is that a status-aware VC carries enough information to
link the credential to:

- one registry
- one committed status handle domain

without exposing the raw status handle publicly.

The proof protocol chosen later by the verifier or contract should not require
the VC shape itself to change.

## VP extension point

Presentations using a status-aware binding should extend the proof model with:

- status public inputs:
  - `registryId`
  - `revokedRoot`
- private witness inputs:
  - `StatusHandle`
  - non-membership Merkle witness

The VP proof should show:

1. the ordinary credential and holder-binding checks pass
2. the status witness is consistent with the credential-bound status commitment
3. the status handle is not revoked in the accepted registry state

## Verifier request extension point

Status-aware verifier requests should define a typed status policy and proof
protocol.

That policy should be able to say:

- whether status is required
- which proof protocol is accepted
- which registry is accepted
- how the verifier/application determines that the supplied root is fresh enough

The verifier request is where freshness becomes explicit.

## Protocol extension point

Protocol/orchestration layers should treat status as:

- proof metadata and witness acquisition inputs
- not as a replacement for the canonical proof

In particular:

- business-contract verification should consume one VP proof bundle that
  already contains the non-revocation proof
- protocol/orchestration may fetch or prepare the accepted root off-chain
- but the final contract verification should not rely on a separate live
  revocation-contract call inside the business proof

This is important because current smart-contract composability is not yet the
right primitive to rely on for this repository's production target.

## Best current implementation direction

The repository's current best direction is:

1. keep `NoStatusCapability` as the compatibility name for the explicit
   zero-status case, while moving architecture language toward
   `NoStatusBinding`
2. normalize status-aware credentials around one registry-bound status binding
3. model current authority-attested and future non-membership paths as
   verifier-facing proof protocols over that shared binding
4. keep final proof-protocol choice outside the VC shape itself

## Threat model notes

The canonical design must defend against:

- stale-root replay
- wrong-registry proofs
- status-handle collision or weak derivation
- status-handle linkability
- confusion between:
  - not revoked
  - and validly issued

Therefore:

- verifier freshness policy is mandatory in any real deployment
- registry binding must be explicit
- issuer proof validity remains separate from non-revocation
- domain separation for handles and related commitments is mandatory
- the current prototype implementation must not over-claim root binding before
  the final in-circuit Merkle-root equality and non-membership proof path is
  implemented

## Why no revocation reason/date in the core model

Revocation reason and revocation date are useful operational features, but they
are not required for the core zero-knowledge statement:

- "this credential is not revoked in the accepted registry state"

If we force reason/date into the first canonical proof model:

- the circuit surface grows
- public semantics become heavier
- privacy and disclosure choices get more complicated earlier than needed

So the prototype spec keeps them out of the core status binding and proof
protocol.

They can be added later as optional or higher-level extensions.

## Available future extensions

This minimal design still leaves room for:

1. revocation reason metadata
2. revocation timestamp metadata
3. suspension as distinct from revocation
4. delegated status authorities
5. multiple accepted registries
6. richer historic/audit views outside the canonical proof path
7. application-specific policy over reason/date without changing the canonical
   proof statement

## Prototype repository target

The repository's preferred prototype implementation target is now:

- `NoStatusCapability` for current families by default
- `RegistryBoundStatusBinding` as the normalized status-aware VC shape
- `RevokedSetNonMembershipStatusProofProtocol` as the first real status-aware
  proof protocol
- `MerkleTree` as the canonical registry primitive
- dedicated revocation registry contract with `(registryId, revokedRoot)` plus
  optional internal update bookkeeping
- VP-embedded non-revocation proof, not a separate business-contract
  revocation call
