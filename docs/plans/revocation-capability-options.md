# Midnight VC Revocation Capability Options

Status: design options and recommendation for revocation / non-revocation.

Companion material:

- [`../spec/credential-status.md`](../spec/credential-status.md)
- [`../spec/midnight-credentials.md`](../spec/midnight-credentials.md)
- [`../spec/profiles.md`](../spec/profiles.md)
- [`../spec/conformance.md`](../spec/conformance.md)
- [`../spec/revocation-registry.md`](../spec/revocation-registry.md)
- [`../decisions/anoncreds-comparison.md`](../decisions/anoncreds-comparison.md)

## Why this exists

The repository now has:

- a Compact-first VC/VP model
- explicit-holder and hidden-holder profile support
- blinded-secret issuance/presentation reference flows
- protocol session durability and replay/idempotency seams
- a normative credential-status claim contract

The next unresolved production gap is revocation.

This document is not yet the final revocation spec. It defines the main design
options and recommends which direction the repository should take.

The current chosen prototype target now lives in:

- [`../spec/revocation-registry.md`](../spec/revocation-registry.md)

## Non-goals

This document does not:

- define a final cryptographic construction
- define a final transport wire format
- commit the repository to AnonCreds object compatibility
- make any package claim that revocation is already implemented

## Design objectives

A Midnight-native revocation capability should:

1. preserve Compact-first canonical semantics
2. work for both explicit-holder and hidden-holder profiles
3. support verifier freshness policies
4. separate credential validity from protocol/session expiry
5. avoid unnecessary holder correlation
6. exploit Midnight-native ledger state and zero-knowledge verification
7. avoid importing AnonCreds infrastructure blindly where it does not fit

## Required building blocks

Any serious revocation design in this repository will need:

- a typed `StatusHandle` bound to the credential at issuance time
- a `StatusAuthority` that owns state transitions
- a verifier freshness request:
  - maximum accepted status age
  - required status level
- a way to prove one of:
  - current active status
  - non-revocation during an accepted interval
- an update model:
  - issuer-driven
  - delegated authority-driven
  - or contract-governed

## Option 1: Public status list

### Model

- each credential carries a status handle
- the status authority publishes a status list or sparse status map
- the verifier retrieves the latest acceptable status evidence
- the holder may not prove anything in zero knowledge beyond the ordinary VC/VP

### Midnight shape

- status list root or sparse entries anchored in Midnight ledger state
- adapter retrieves the latest list or entries from:
  - a Midnight contract
  - or off-chain storage anchored by a Midnight digest
- verifier checks:
  - status handle
  - freshness window
  - active/suspended/revoked state

### Advantages

- simplest production path
- easiest to explain
- good fit for explicit-holder enterprise deployments
- easiest place to start for operational tooling

### Drawbacks

- weak privacy for hidden-holder scenarios
- verifier or adapter may reveal which credential/status handle is being checked
- does not meet the strongest unlinkability expectations

### Recommendation

- acceptable as Level 1 status support
- not sufficient as the final answer for hidden-holder production claims

## Option 2: Midnight-native inclusion registry

### Model

- the authority stores active credential commitments in a Midnight-managed
  Merkle tree
- the holder proves inclusion of their credential-bound status commitment
- revocation removes or overwrites the leaf

### Midnight shape

- contract ledger state:
  - authority public key
  - Merkle root of active commitments
- holder produces:
  - Merkle path
  - proof that the path leaf matches the secret-bound status commitment
- verifier checks:
  - path root against the authoritative state root
  - freshness/policy around that root

### Why it is attractive

- uses Midnight-native Merkle structures and Compact circuits directly
- no tails-file style artifact is required
- natural fit for on-chain or anchored state

### Why it is not enough by itself

- naive inclusion proofs can still leak correlation if the same status
  commitment is reused too directly
- if proof generation requires a chain transaction, it becomes too expensive
  and operationally awkward
- simple “present inclusion proof against current root” does not yet give a
  full non-revocation interval model

### Assessment of the Patextreme PoC

The Patextreme PoC explores this family of design:

- Midnight as a VDR layer
- a Merkle tree of credential commitments
- a holder proving inclusion of their commitment

Useful lessons from the PoC:

- Midnight can clearly host a revocation-root contract
- Midnight Merkle proofs are a viable primitive
- a simple status-list alternative is explicitly acknowledged in the PoC

Reasons not to adopt it as-is:

- all proofs are modeled as transactions
- the PoC itself calls out cost and operational drawbacks
- it is explicitly not AnonCreds-compatible
- it does not yet solve the full privacy/freshness/interoperability story

So this option is a useful primitive, not the final architecture.

## Option 3: Privacy-preserving non-revocation witness

### Model

- the credential carries a hidden-holder-compatible status handle commitment
- the authority publishes epoch-based status roots
- the holder maintains or fetches a status witness for the latest acceptable
  epoch
- the presentation proof includes a non-revocation witness check in Compact

### Midnight shape

- on-chain or anchored state publishes:
  - `statusRegistryId`
  - `epoch`
  - `statusRoot`
  - metadata for freshness and authority
- the credential binds:
  - `statusRegistryId`
  - `statusHandleCommitment`
- the holder proves:
  - knowledge of the bound status handle or secret-derived handle
  - membership or non-membership semantics against the published root
  - consistency between the credential and the status witness
- the verifier checks:
  - proof validity
  - accepted epoch/freshness window
  - authority metadata

### Advantages

- strongest privacy story
- fits hidden-holder and blinded-secret deployments best
- makes revocation part of the proof model instead of a side lookup
- leverages Midnight’s strength: circuit-verified typed state relations

### Drawbacks

- hardest construction
- requires witness update semantics
- requires careful root/epoch governance
- more protocol complexity for wallets and holders

### Recommendation

- this should be the long-term target for hidden-holder production claims
- it is the closest Midnight-native analogue to the “good part” of AnonCreds
  non-revocation, without inheriting all of AnonCreds infrastructure assumptions

## Option 4: Hybrid rollout

### Model

Build two levels intentionally:

1. Level 1 first:
   - public status lookup
   - explicit-holder-ready
   - operational tooling and authority model first
2. Level 2 next:
   - Compact-native non-revocation witness
   - hidden-holder-ready
   - privacy-preserving proof integration

### Why this is likely the right repository plan

- it avoids blocking all production progress on the hardest cryptography first
- it still preserves a serious long-term privacy target
- it maps cleanly to the status levels already defined in
  `credential-status.md`

## Recommended architecture

The recommended direction is Option 4:

- Level 1 public status support as the first implementation milestone
- Level 2 privacy-preserving non-revocation as the long-term hidden-holder
  target

But the Level 1 implementation should be shaped so it does not trap the
repository in a public-lookup-only design.

### Architectural rules

1. keep status typed and family-aware
   - add status fields and status references as explicit schema/family data
   - do not hide status behind ad hoc app metadata

2. separate status evidence from transport/session expiry
   - status freshness is not the same as protocol message expiry

3. make verifier freshness requests first-class
   - verifier request must state:
     - whether status is required
     - which status level is accepted
     - maximum status age / accepted epoch window

4. do not require chain transactions for ordinary presentation-time
   non-revocation proofs
   - proofs should be locally generable from published or fetched witness data
   - chain transactions should publish state transitions, not be required for
     each verification

5. use Midnight roots, not AnonCreds tails files, as the canonical state anchor
   where possible

6. preserve an upgrade path from Level 1 to Level 2
   - `StatusHandle`
   - `StatusRegistryId`
   - authority metadata
   - freshness semantics
   should survive the transition

## Suggested data-model direction

The likely repository direction is to add typed status components like:

- `StatusRegistryRef`
- `CredentialStatusLevel`
- `StatusHandleCommitment`
- `StatusEvidenceRef`
- verifier request fields for:
  - `requireStatus`
  - `minimumStatusLevel`
  - `maxStatusAge`
  - `acceptedStatusRegistry`

The exact structs should be defined only after the first status capability
package boundary is chosen.

## Engineering phases

### Phase 1: status request contract

- typed verifier freshness/status request semantics
- family-level status handle model
- explicit statement of Level 0/1/2 support per profile

### Phase 2: Level 1 reference implementation

- status registry contract or anchored status list
- explicit-holder verifier flow
- reference transport/domain adapter
- freshness and negative-path tests

### Phase 3: hidden-holder non-revocation design

- choose the witness construction
- choose registry/root update semantics
- define witness refresh lifecycle
- define proof/public-input boundaries

### Phase 4: Level 2 implementation

- Compact circuits
- protocol orchestration changes
- conformance and interoperability updates
- privacy and abuse-case review

## Current recommendation in one sentence

Do not copy AnonCreds revocation object shapes mechanically.

Borrow the requirement:

- privacy-preserving non-revocation with verifier freshness constraints

But implement it in a Midnight-native way:

- typed status handles
- Midnight-anchored status roots
- Compact-verified witnesses
- no per-presentation chain transaction requirement
