# Midnight VC Conformance

Status: draft conformance model for the current specification suite.

This document defines what it means to claim conformance with the Midnight VC
draft specification at the package/profile level.

Companion document:

- [`midnight-credentials.md`](./midnight-credentials.md)
- [`credential-status.md`](./credential-status.md)
- [`status-error-taxonomy.md`](./status-error-taxonomy.md)
- [`revocation-registry.md`](./revocation-registry.md)

## Scope

This is a draft conformance model. It does not define a formal certification
program. It defines practical categories for implementation and review.

## Conformance categories

### 1. Core VC implementation

A core VC implementation conforms when it:

- implements the canonical Compact-first data model
- computes credential and presentation body roots in Compact
- uses the Midnight proof context separation rules
- preserves the holder-binding invariants defined for its chosen profile
- rejects malformed or schema-mismatched payloads before accepting proofs

In this repository, the primary reference is:

- [`../../core/primitives/credentials/README.md`](../../core/primitives/credentials/README.md)

### 2. Credential family implementation

A credential family implementation conforms when it:

- specializes the generic VC/VP model with a concrete claim schema
- defines explicit disclosure and predicate semantics
- computes claim roots deterministically
- validates schema-specific credential and presentation bodies
- states which holder-binding profiles it supports

Reference implementations:

- [`../../prototypes/credential-families/birth/README.md`](../../prototypes/credential-families/birth/README.md)
- [`../../prototypes/credential-families/birth-secret/README.md`](../../prototypes/credential-families/birth-secret/README.md)

### 3. Status binding implementation

A status binding implementation conforms when it:

- declares one explicit status binding model
- documents whether that binding is:
  - `NoStatusCapability` / `NoStatusBinding`
  - a registry-bound status binding
- states which credential-bound fields participate in the binding
- for a registry-bound binding, documents at minimum:
  - `statusType`
  - `registryRef`
  - `statusHandleCommitment`
- documents whether the binding is carried in the issuer-signed credential body,
  a wrapped family model, or another explicit compatibility layer
- documents the verifier/application responsibilities that sit outside Compact

Reference companion material:

- [`credential-status.md`](./credential-status.md)
- [`revocation-registry.md`](./revocation-registry.md)
- [`status-verification-protocol.md`](./status-verification-protocol.md)

### 4. Status proof-protocol implementation

A status proof-protocol implementation conforms when it:

- declares one verifier-facing proof protocol
- documents whether that protocol is:
  - `AuthorityAttestedStatusProofProtocol`
  - `RevokedSetNonMembershipStatusProofProtocol`
- documents the shared request object and public inputs it consumes
- documents the verifier/application responsibilities that sit outside Compact
- states whether the protocol surface is:
  - reference-shaped and fully enforced in Compact
  - or prototype-shaped and coordinated partly off-chain
- if it exposes an off-chain verifier/helper surface, maps failures into the
  canonical error vocabulary in
  [`status-error-taxonomy.md`](./status-error-taxonomy.md) instead of inventing
  use-case-local status verdict names
- documents that the status errors in
  [`status-error-taxonomy.md`](./status-error-taxonomy.md)
  are hard invalidity, not soft business-policy denials

Additional expectations by proof protocol:

- `AuthorityAttestedStatusProofProtocol`
  - must disclose the trusted authority role
  - must disclose that the verifier/application supplies the accepted
    `(registryId, revokedRoot)`
  - must disclose whether expiration is required by local policy
  - must disclose that accepted `revoked` evidence is hard VC/VP invalidity,
    not a softer business-policy denial
- `RevokedSetNonMembershipStatusProofProtocol`
  - must disclose whether the implementation is only a witness/capability
    surface or a final in-circuit non-membership verification path
  - must disclose whether root freshness and root selection remain
    verifier/application responsibilities
  - must disclose the canonical witness shape it consumes:
    - `RevokedSetStatusRequest`
    - `RevokedSetNonMembershipWitnessInput`
    - any additional Merkle witness material beyond that base shape
  - must disclose which parts are already enforced:
    - request binding
    - registry-domain binding
    - status-handle-opening consistency
    - final Merkle non-membership, if present
  - must disclose that an accepted revoked-set hit is hard VC/VP invalidity,
    not a "verified but denied" result

Reference companion material:

- [`credential-status.md`](./credential-status.md)
- [`revocation-registry.md`](./revocation-registry.md)
- [`status-verification-protocol.md`](./status-verification-protocol.md)

### 5. Holder-binding profile implementation

A holder-binding profile implementation conforms when it:

- implements the profile-specific binding struct and validation rules
- preserves the proof-to-binding matching semantics defined by the profile
- documents the trust boundary and known limitations of the profile

For evolving privacy-oriented profiles such as blinded-secret binding,
conformance claims must distinguish between:

- a supported reference happy path validated by checked-in tests
- production transport/interoperability guarantees that remain deferred

For hidden-holder profiles, a production-shaped conformance claim should also
state:

- how randomness and signing nonces are generated
- whether pending protocol state is durable or only in-memory
- whether replay/idempotency behavior is defined
- whether expiry semantics are defined for each protocol stage
- whether revocation/non-revocation is implemented or explicitly deferred
- which status binding, if any, is integrated by the credential family
- which external adapter or wire contract carries the Compact protocol values

An injectable randomness interface is helpful evidence, but not sufficient by
itself. A production-shaped claim still has to document the actual randomness
policy and implementation that sits behind that interface.

An injectable protocol state-store interface is also helpful evidence, but not
sufficient by itself. A production-shaped claim still has to document whether
that store is persistent, how finalized session state is retained, and how
replay/idempotency data is expired or evicted.

For hidden-holder adapters that claim interoperability, the same
implementation should also disclose whether it follows the repository-aligned
adapter rules in:

- [`hidden-holder-interoperability.md`](./hidden-holder-interoperability.md)

Reference profile catalog:

- [`profiles.md`](./profiles.md)
- [`hidden-holder-interoperability.md`](./hidden-holder-interoperability.md)

### 6. Transport/domain adapter implementation

A transport/domain adapter conforms when it:

- treats Compact payloads as canonical and transport JSON as envelope metadata
- preserves schema/version identification
- encodes and decodes payloads using the declared framing/profile
- does not redefine canonical body-root semantics outside Compact

Reference implementation:

- [`../../protocols/openid/README.md`](../../protocols/openid/README.md)

### 7. Protocol/reference orchestration implementation

A protocol/orchestration implementation conforms when it:

- preserves the underlying credential-family semantics
- does not weaken proof or holder-binding invariants
- treats transport/orchestration as an outer layer, not a replacement for the
  canonical verification model
- distinguishes success results from rejection results or rejection outcomes
- documents whether rejections are explicit protocol messages or only local
  implementation outcomes

For the current reference protocol layer, conformance claims about
blinded-secret issuance may include explicit rejection messages for malformed
requests, offer/request mismatches, unknown offer references, expired offers,
and expired requests. The same flow may also claim explicit idempotent
re-delivery semantics for duplicate blinded-secret issuance deliveries. Broader
transport interoperability guarantees remain deferred. The same reference
protocol layer may also claim explicit blinded-secret presentation rejection
messages for malformed submissions, request/submission mismatches,
unsatisfied verifier requests, expired requests, and expired submissions. It
may also claim explicit idempotent re-delivery semantics for duplicate
blinded-secret presentation submissions and presentation outcomes. Envelope-
level presentation expiry semantics now exist in the reference layer, while
body-level timeout fields and final external timeout interoperability remain
deferred.

Reference implementation:

- [`../../components/orchestration/protocol/README.md`](../../components/orchestration/protocol/README.md)

### 8. Verifier contract implementation

A verifier contract implementation conforms when it:

- composes the credential-family verification logic without redefining core
  proof semantics
- enforces only the disclosures and predicates it explicitly models
- preserves the contract/business boundary between VC verification and state
  mutation
- does not present a generic core package root as if it were the final
  deployable business contract surface

Reference implementation:

- [`../../use-cases/age-gate/contract/README.md`](../../use-cases/age-gate/contract/README.md)
- [`../../use-cases/hello-verifier/contract/README.md`](../../use-cases/hello-verifier/contract/README.md)

## Required implementation disclosures

Any implementation claiming conformance should document:

- which holder-binding profiles it supports
- which credential families it supports
- whether it is:
  - normative draft aligned
  - reference implementation
  - prototype
  - experimental
- which test surfaces it executes
- whether it has explicit rejection message semantics or only local rejection
  behavior
- for hidden-holder profiles, whether protocol state is durable or only
  reference-local/in-memory
- for hidden-holder profiles, whether randomness/nonce generation is production
  hardening or only test/reference behavior
- whether status support is deferred or implemented
- which status binding is implemented:
  - `NoStatusCapability` / `NoStatusBinding`
  - or a registry-bound status binding
- which status proof protocol is implemented:
  - `AuthorityAttestedStatusProofProtocol`
  - or `RevokedSetNonMembershipStatusProofProtocol`
- whether the verifier/application must supply off-chain status inputs such as
  an accepted `(registryId, revokedRoot)`
- whether `revoked` is treated as hard VC/VP invalidity
- if the implementation surfaces runtime/helper status results, which canonical
  status codes it emits and where `unclassifiedFailure` can still appear
- any security/privacy limitations that are intentionally deferred

## Non-conformance examples

An implementation is not conformant if it:

- treats JSON field order or `JSON.stringify(...)` as canonical signing input
- bypasses Compact body-root recomputation during verification
- silently changes holder-binding semantics without documenting a new profile
- claims resolver-backed DID semantics while only checking structural metadata
- treats a rejection as an empty or partial success result without documenting a
  distinct rejection outcome
- presents supported reference happy paths as production-ready profiles without
  disclosing deferred transport or revocation limitations
- claims production-ready hidden-holder behavior without disclosing randomness,
  durable-state, expiry, replay, or adapter limitations
- claims revocation/non-revocation support without documenting its declared
  status binding, proof protocol, and freshness/privacy assumptions
- exposes use-case-local revocation verdict names that bypass the shared
  canonical status-error taxonomy

## Current repository stance

This repository contains a mix of:

- normative draft material
- reference implementation packages
- prototype packages
- experimental packages

Conformance claims should therefore be package-specific, not repository-global.

## Current Package Maturity Table

This table is the current repository snapshot for integrators on `develop`.
Use it together with:

- [`../guides/integration-surface-map.md`](../guides/integration-surface-map.md)
- package READMEs

| Package | Primary surface class | Current maturity | Integrator stance |
| --- | --- | --- | --- |
| `credentials` | `On-chain + off-chain` | reference implementation | safe core starting point for contract authors and runtime consumers |
| `credentials-same-holder` | `On-chain + off-chain` | reference implementation | use when hidden-holder same-holder correlation is required |
| `credentials-iso-registry` | `On-chain + off-chain` | reference implementation | safe shared vocabulary layer |
| `credentials-birth` | `On-chain + off-chain` | reference implementation | current concrete explicit-holder family |
| `credentials-birth-secret` | `On-chain + off-chain` | reference implementation with prototype status-aware additions | current concrete hidden-holder family; status-aware pieces remain prototype-scoped |
| `credentials-status-registry` | mixed: on-chain registry + off-chain builders | prototype | use only with explicit awareness of current revocation/root-freshness limitations |
| `use-cases/age-gate/contract` | `On-chain + off-chain` | prototype use-case | concrete business composition, not canonical generic API |
| `use-cases/hello-verifier/contract` | `On-chain + off-chain` | starter reference implementation | smallest verifier-contract entry point for integrators |
| `protocols/openid` | `Off-chain only` | reference implementation | transport/domain adapter only |
| `components/adapters/offchain-did` | `Off-chain only` | reference implementation adapter | runtime DID helper only |
| `components/orchestration/protocol` | `Off-chain only` | prototype / evolving API | reference orchestration only, not a stable network library |
| `components/integration/standalone-environment` | `Off-chain only` | infrastructure / test support | integration infrastructure, not VC semantics |

Interpretation rules:

- `reference implementation` means the package is a checked-in repository
  surface used as the primary example for that role
- `prototype` means the package is useful and intentional, but its API,
  interoperability contract, or security model still has declared gaps
- `infrastructure / test support` means the package is important for validation
  but is not itself part of the canonical VC/VP semantics
