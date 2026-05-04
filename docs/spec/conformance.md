# Midnight VC Conformance

Status: draft conformance model for the current specification suite.

This document defines what it means to claim conformance with the Midnight VC
draft specification at the package/profile level.

Companion document:

- [`midnight-credentials.md`](./midnight-credentials.md)

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

- [`../../credentials/README.md`](../../credentials/README.md)

### 2. Credential family implementation

A credential family implementation conforms when it:

- specializes the generic VC/VP model with a concrete claim schema
- defines explicit disclosure and predicate semantics
- computes claim roots deterministically
- validates schema-specific credential and presentation bodies
- states which holder-binding profiles it supports

Reference implementations:

- [`../../credentials-birth/README.md`](../../credentials-birth/README.md)
- [`../../credentials-birth-secret/README.md`](../../credentials-birth-secret/README.md)

### 3. Holder-binding profile implementation

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
- which external adapter or wire contract carries the Compact protocol values

An injectable randomness interface is helpful evidence, but not sufficient by
itself. A production-shaped claim still has to document the actual randomness
policy and implementation that sits behind that interface.

Reference profile catalog:

- [`profiles.md`](./profiles.md)

### 4. Transport/domain adapter implementation

A transport/domain adapter conforms when it:

- treats Compact payloads as canonical and transport JSON as envelope metadata
- preserves schema/version identification
- encodes and decodes payloads using the declared framing/profile
- does not redefine canonical body-root semantics outside Compact

Reference implementation:

- [`../../credentials-openid/README.md`](../../credentials-openid/README.md)

### 5. Protocol/reference orchestration implementation

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
messages for malformed submissions, request/submission mismatches, and
unsatisfied verifier requests. It may also claim explicit idempotent
re-delivery semantics for duplicate blinded-secret presentation submissions and
presentation outcomes. Presentation-side message-level expiry semantics remain
deferred.

Reference implementation:

- [`../../credentials-protocol/README.md`](../../credentials-protocol/README.md)

### 6. Verifier contract implementation

A verifier contract implementation conforms when it:

- composes the credential-family verification logic without redefining core
  proof semantics
- enforces only the disclosures and predicates it explicitly models
- preserves the contract/business boundary between VC verification and state
  mutation

Reference implementation:

- [`../../credentials-demo-contract/README.md`](../../credentials-demo-contract/README.md)

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

## Current repository stance

This repository contains a mix of:

- normative draft material
- reference implementation packages
- prototype packages
- experimental packages

Conformance claims should therefore be package-specific, not repository-global.
