# Compact Source Conventions, Purity, and Commitment Research

Status: research note for the post-`VC-MAT-20` cleanup and simplification track as of `2026-05-11`.

Reference repos and snapshots used for this note:

- `midnightntwrk/example-kitties` at `6478745`
- `OpenZeppelin/compact-contracts` at `6d22e7c`

## Executive Summary

The repository does not need a new architecture. It already has a stronger package and module decomposition than the reference repos.

What it is missing is:

1. more in-source orientation for Compact readers
2. clearer source-level trust-boundary and limitation markers
3. a stricter pure-circuit substrate in `core/` and `registry/`
4. one remaining ad-hoc commitment that should likely become a built-in `persistentCommit`

The recommended direction is:

- keep the current modular `include` graph
- adopt a lighter, repeatable source-comment convention
- make `core/` and `registry/` the explicit pure substrate first
- then simplify the credential families and Layer 3 contracts to become thin ledger wrappers over that pure substrate

## Compact Claim-Surface Findings

Current compiler-backed findings from the checked-in claim-type probes:

- supported primitive claim fields:
  - `Boolean`
  - `Uint<n>`
  - `Bytes<n>`
  - `Field`
- supported composite claim fields:
  - `Vector<k, SupportedPrimitive>`
  - nested structs composed from supported primitives
  - `Vector<k, NestedStruct>` when the nested struct itself only uses supported primitives
- unsupported direct claim fields:
  - `Int<n>`
  - `Float<n>`
  - `String`
  - vectors over those unsupported primitives

Design implication:

- `bigint` remains a runtime interpretation of `Uint<n>`, not a separate Compact type
- nested structs are technically available, but they should stay a deliberate modeling choice rather than the default shared-family shape

## Source Conventions To Adopt

These conventions are high-value because they improve reader orientation without pushing architectural prose out of the existing `docs/` tree.

### 1. File-purpose header on each public Compact module

Every public `.compact` file should begin with a short 1-3 line module-orientation block under the SPDX header.

Use it to answer:

- what this file owns
- what it intentionally does not own
- where a reader should look next

This is the best part of the `example-kitties` readability style, without copying its long legal/comment boilerplate.

### 2. Public circuit docblocks on exported surfaces

Exported circuits should carry a short docblock or comment that states:

- purpose
- important preconditions not obvious from the type signature
- whether the circuit is transitional, prototype-only, or intended as a stable reusable primitive

This is the best part of the OpenZeppelin source style.

Do not restate every `assert(...)` as prose. Only document invariants that are easy to miss from the body.

### 3. Section banners in long or dense files

Use section banners in Compact files that are long enough to lose navigability.

Good candidates are files that mix:

- struct definitions
- request/result builders
- multiple verification modes
- business logic and audit telemetry

### 4. Standard comment tags

Use a small fixed vocabulary for source comments:

- `TRUST BOUNDARY:` caller- or witness-supplied data that must not be implicitly trusted
- `LIMITATION:` current prototype gap that callers or downstream contracts must compensate for
- `NOTE:` non-obvious design intent that should survive refactors
- `CONFORMANCE LOCK:` a test assertion that intentionally fails on structural drift

Recent examples of the conformance-lock pattern already exist in the status
bundle and same-contract live-status test surfaces.

### 5. Public struct field comments where semantics are not obvious from the type

Add short inline field comments to public structs when a field carries protocol meaning beyond its bare type.

This is especially useful for:

- challenge hashes
- sentinel values
- verifier-scoped fields
- status-binding fields
- protocol envelope fields

## Conventions To Avoid

Do not copy these parts of the reference repos.

### 1. Monolithic Compact files

The current repository decomposition is better than the monolithic `example-kitties` style and should be preserved.

### 2. Hand-maintained proving-cost tags

OpenZeppelin-style `@circuitInfo k=..., rows=...` tags should not be added manually.

If the repository wants in-source proving-cost tags, they must be generated or CI-verified.

### 3. Over-commenting obvious code

Avoid comments that only restate the next line.

The target is:

- explain intent
- explain invariants
- explain trust boundaries
- explain limitations

not narrate assignment-by-assignment execution.

### 4. Migrating architecture/spec prose into source comments

The architecture docs should remain the canonical place for design tradeoffs and prototype boundaries.

Source comments should point to those docs, not duplicate them.

## Highest-Value Adoption Targets

The following files are the best first targets for the new source-comment conventions.

### Core and registry surfaces

- `core/primitives/credentials/src/credentials/holder-bindings.compact`
  - add a file-purpose header
  - split the file with section banners by binding family
  - add docblocks to the exported binding helpers and validators

- `core/primitives/credentials/src/credentials/proofs.compact`
  - document context-tag semantics and challenge derivation
  - make the domain-separation rationale explicit at the exported surface

- `core/primitives/credentials/src/credentials/status-bindings.compact`
  - document `StatusType`
  - document `registryBoundStatusBindingRoot` semantics

- `core/primitives/credentials/src/credentials/vc.compact`
- `core/primitives/credentials/src/credentials/vp.compact`
- `core/primitives/credentials/src/credentials/protocols.compact`
- `core/primitives/credentials/src/credentials/issue.compact`
- `core/primitives/credentials/src/credentials/present.compact`
  - add short public-surface headers and requirement notes

### Prototype family surfaces

- `prototypes/credential-families/birth/src/birth-credential/validation.compact`
- `prototypes/credential-families/birth-secret/src/secret-birth-credential/validation.compact`
- `prototypes/credential-families/birth-secret/src/secret-birth-credential/status-validation.compact`
  - add section banners for issuance, presentation, status-mode, and predicate sections
  - add trust-boundary comments around verifier-domain and same-holder flows

### Use-case and template surfaces

- `use-cases/hello-verifier/contract/src/hello-verifier.compact`
  - add ledger-purpose comments and witness explanations

- `use-cases/age-gate/contract/src/demo.compact`
- `use-cases/age-gate/contract/src/demo-revocation.compact`
  - add sectioning and trust-boundary notes only where the flows remain dense after the current cleanup

- `docs/templates/verifier-contract-template.compact.md`
  - bake the chosen file header / warning / trust-boundary pattern into the starter template

## Pure-Circuit Findings

### Key observation

The generated TypeScript bindings already classify many current `export circuit` definitions into `pureCircuits` based on what the body actually does.

That means the `pure` keyword is not only about code generation. In this repository it is mainly valuable for:

- making intent explicit in source
- forcing compile-time rejection if someone later sneaks in ledger access or witness access
- making the pure substrate visible to contributors without having to inspect generated bindings

### P1. Mark the existing `core/` substrate as explicitly pure

These files are the dependency root and are already structurally pure:

- `core/primitives/credentials/src/credentials/vc.compact`
- `core/primitives/credentials/src/credentials/vp.compact`
- `core/primitives/credentials/src/credentials/relations.compact`
- `core/primitives/credentials/src/credentials/issue.compact`
- `core/primitives/credentials/src/credentials/present.compact`
- `core/primitives/credentials/src/credentials/protocols.compact`
- `core/primitives/credentials/src/credentials/status-bindings.compact`
- `core/primitives/credentials/src/credentials/proofs.compact`
- `core/primitives/credentials/src/credentials/holder-bindings.compact`
- `core/capabilities/same-holder/src/same-holder.compact`
- `core/capabilities/same-holder/src/same-holder/composable.compact`

Why first:

- everything else depends on these helpers
- the move is mostly a source-intent / compile-safety improvement
- it establishes a clean reusable pure layer for all families and Layer 3 contracts

### P2. Mark the registry status proof protocol layer as explicitly pure

Target file:

- `registry/status-registry/src/status-proof-protocol.compact`

Why:

- the file is already a stateless protocol library
- it is one of the most security-sensitive reusable surfaces in the repo
- it composes directly with `birth-secret` status validation and future verifier paths

### P3. Mark the family validation layers as explicitly pure

Targets:

- `prototypes/credential-families/birth/src/birth-credential/claims.compact`
- `prototypes/credential-families/birth/src/birth-credential/helpers.compact`
- `prototypes/credential-families/birth/src/birth-credential/validation.compact`
- `prototypes/credential-families/birth-secret/src/secret-birth-credential/helpers.compact`
- `prototypes/credential-families/birth-secret/src/secret-birth-credential/validation.compact`
- `prototypes/credential-families/birth-secret/src/secret-birth-credential/status-validation.compact`

Why:

- these files are already state-free acceptance engines
- the move makes the families reusable off-chain and from multiple Layer 3 wrappers without ambiguity

### P4. Refactor use-case request builders into parameterized pure helpers

Highest-value refactor targets:

- `use-cases/age-gate/contract/src/demo.compact: ageGateRequest`
- `use-cases/age-gate/contract/src/demo-revocation.compact: revocationAwareAgeGateVerificationRequest`
- `use-cases/age-gate/contract/src/demo-revocation.compact: revocationAwareVerifierSuppliedRootRequest`
- `use-cases/age-gate/contract/src/demo-revocation.compact: revocationAwareAuthorityAttestedRequest`

Reason:

- these currently stay impure largely because they read sealed policy values
- the heavy policy semantics can be preserved by moving those values into parameters and asserting equality in the thin ledger wrapper
- this is the highest-leverage simplification for TS-side consumers and Layer 3 contract readability

### P5. Split the revocation demo contract into pure acceptance helpers plus thin ledger wrappers

Target file:

- `use-cases/age-gate/contract/src/demo-revocation.compact`

Why:

- the file still mixes verification logic, status-mode branching, set membership, and audit bookkeeping
- same-contract live status will always keep some impure logic, but the acceptance and request-shape logic can be factored out cleanly

### P6. Clean up the simple verifier contracts later

Targets:

- `use-cases/hello-verifier/contract/src/hello-verifier.compact`
- `use-cases/age-gate/contract/src/demo.compact`

These are valuable but should follow the core/registry/family normalization work.

### Non-candidates

These should remain impure because they are inherently ledger-mutating:

- `registry/status-registry/src/revocation-registry.compact: initializeRegistry`
- `registry/status-registry/src/revocation-registry.compact: revokeStatusHandle`
- capability-claim mutation entrypoints in `demo.compact` and `demo-revocation.compact`

## PersistentCommit Findings

The repository already uses `persistentCommit` for almost every real commitment site:

- base secret-holder commitment
- birth claim commitments
- revoked-set status-handle commitment

Only one high-confidence ad-hoc commitment remains.

### High-confidence replacement

- `core/primitives/credentials/src/credentials/holder-bindings.compact: blindedSecretHolderCommitment`

Current shape:

- `persistentHash<Vector<4, Bytes<32>>>([tag, holderSecretCommitment, issuerNonce, blindingFactor])`

Why it should likely change:

- semantically this is a real blinded commitment, not an aggregate root
- it is later re-opened in-circuit with witness material and the `blindingFactor`
- it is the one clear place where the code still hand-rolls commitment semantics instead of using the built-in primitive

Preferred replacement shape:

- define a typed anchor struct such as `BlindedSecretHolderAnchor { holderSecretCommitment, issuerNonce }`
- use `persistentCommit<BlindedSecretHolderAnchor>(..., blindingFactor)`
- if explicit domain separation is still desired, keep the tag as a field inside the committed struct rather than as an outer ad-hoc hash element

### Important caveat

This is breaking.

Changing `blindedSecretHolderCommitment` changes:

- holder-binding bytes
- credential body roots
- issuer proofs
- secret-holder fixture outputs
- protocol-layer issuance and verification flows

So this is not a silent cleanup. It needs a versioned rollout with explicit
compatibility checkpoints, fixture and golden-vector updates, and downstream
consumer coordination.

### Lower-confidence or do-not-change sites

These should stay as hashes:

- body roots
- claim roots
- presentation roots
- signature payload/challenge roots
- status-binding roots
- verifier-scoped pseudonyms
- challenge-response derivations
- revoked-set status-handle derivation itself

In particular, `revokedSetStatusHandle(...)` should remain a salted opaque derivation. The actual hiding commitment layer already exists separately as `revokedSetStatusHandleCommitment(...)`.

## Recommended Execution Order

1. adopt the source-comment convention in a small pilot on `holder-bindings.compact`, `proofs.compact`, and `status-bindings.compact`
2. mark `core/` and `registry/status-proof-protocol.compact` as explicitly pure
3. mark the birth and birth-secret family validation layers as explicitly pure
4. refactor the age-gate and revocation request builders into parameterized pure helpers with thin impure wrappers
5. split the revocation demo verification flows into pure acceptance helpers plus thin ledger wrappers
6. only after the pure substrate settles, evaluate the breaking `blindedSecretHolderCommitment` migration

## Practical Guidance

If the goal is near-term simplification without churn, start with:

- source-comment convention pilot
- pure annotation of existing stateless layers
- request-builder refactors that only hoist sealed-ledger reads into explicit parameters

If the goal is cryptographic/model cleanup, the next real breaking change is the `blindedSecretHolderCommitment` migration.

That migration should be treated as its own versioned track rather than bundled with source-style or pure-circuit cleanup.
