# Live-Root Binding Feasibility

Status: architecture note for the remaining `VC-MAT-20` live-root tail.

Companion documents:

- [`./status-verification-modes.md`](./status-verification-modes.md)
- [`./status-canonical-non-membership-bundle.md`](./status-canonical-non-membership-bundle.md)
- [`../spec/revocation-registry.md`](../spec/revocation-registry.md)
- [`../spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)

## Problem

The repository now has three real status verification modes:

- same-contract live-state verification
- off-chain verifier-side live-state verification
- authority-attested external-registry verification

What it still does not have is one generic in-circuit path that proves:

- the accepted `revokedRoot` is the live root of the registry, and
- the holder witness is a final non-membership witness against that root

The current blocker is the Compact/runtime boundary around `MerkleTree.root()`.

Upstream tracking note:

- there is no dedicated upstream Compact issue linked from this repository yet
- until one exists, this note is the canonical place that records the blocker
  and the fallback options

## Current limitation

Today Compact can read ordinary ledger fields in-circuit:

- `registryId`
- `initialized`
- `version`

But it cannot yet call the live revoked-set `MerkleTree.root()` getter
in-circuit.

That means the repository can already do all of this:

- bind a supplied registry snapshot to live `registryId`
- bind a supplied registry snapshot to live `registryVersion`
- read the live root at runtime/off-chain
- reject revoked handles directly against a same-contract local revoked set

But it cannot yet do this generically inside Compact:

- prove `suppliedRevokedRoot == liveMerkleRoot()`

## Feasible paths

### Option 1: new Compact surface for live Merkle-root access

This is the cleanest generic target.

Required capability:

- an in-circuit way to read or expose the current `MerkleTree.root()` value for
  the revoked-set ledger tree

What it would unlock:

- final live-root equality inside the registry contract
- one generic root-bound non-membership path for external snapshots
- a clearer final status-contract story without duplicating root state in a
  second ledger field

Current recommendation:

- this remains the preferred final architecture

### Option 2: same-contract-only reference path

This path already works today.

Shape:

- the business verifier and the revoked-set ledger live in the same contract
  domain
- the verifier contract checks the live local revoked set directly
- no external `(registryId, revokedRoot)` handoff is required

What it solves:

- real Layer 3 revocation enforcement when the registry is local
- no dependency on authority attestation
- no dependency on off-chain root freshness coordination

What it does not solve:

- external-registry Layer 3 verification
- a generic root-bound proof surface

Current recommendation:

- keep this as the strongest currently available Layer 3 reference path
- do not describe it as the final generic live-root architecture

### Option 3: mirrored root as an ordinary ledger field

This is a fallback design if Compact root access stays unavailable.

Shape:

- every revoked-set mutation also updates a plain ledger `revokedRoot` field
- business contracts read that plain ledger field instead of calling
  `MerkleTree.root()`

Tradeoffs:

- duplicates the same source of truth in two places
- pushes the equality invariant into every mutation circuit
- creates maintenance risk if any future mutation path forgets to keep the
  mirrored field synchronized with the tree

Current recommendation:

- feasible, but not preferred
- only use this if the Compact surface cannot expose live root access in a
  reasonable timeframe and the generic Layer 3 root-bound path becomes
  blocking

## Current repository decision

For the current stack:

- same-contract live-state verification remains the preferred real Layer 3
  reference path when the registry is local
- off-chain verifier-side live-state verification remains the preferred path
  when verification can terminate off-chain
- authority-attested verification remains the supported Layer 3 bridge for
  external registries
- final generic live-root binding still depends on either:
  - a new Compact root-access surface, or
  - a consciously accepted mirrored-root design

So the remaining feasibility answer is:

- **same-contract local status is already executable**
- **generic external root-bound status is still blocked on a lower-level
  surface decision**

## Engineering consequence

The next implementation work should continue in two tracks:

1. harden same-contract conformance and adversarial coverage
2. keep the generic external-root target explicit until the Compact-side
   surface decision is made

That prevents the repo from overstating the generic live-root story while still
shipping a strong local Layer 3 reference path today.
