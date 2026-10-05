# Composition

The repository provides low-level building blocks rather than a final VC
protocol.

## Core Responsibilities

- canonical VC and VP bodies
- schema and verification-method references
- context-separated proof verification
- explicit holder and status bindings
- optional source-neutral signer authorization
- deterministic conformance vectors
- optional canonical Midnight DID method binding

## Consumer Responsibilities

- concrete schema claims and predicates
- DID resolver configuration and verification-method authorization policy
- issuer and verifier trust policy
- current status evidence and registry synchronization
- challenge freshness, replay prevention, audience, and trusted time
- proving artifacts, deployment, transport, wallet, and application behavior

## Adapter Responsibilities

An adapter translates an external representation into inputs accepted by one
or more core operations. Its public contract documents:

- which core operations it invokes;
- which validation it performs before and after those operations; and
- which checks remain the consumer's responsibility.

Canonical encoding and verification requirements remain with the specification
section that defines the corresponding operation. Successfully translating an
object does not by itself establish proof validity, signer authorization,
credential status, trusted time, or application policy.

## Package Direction

Credential and application repositories depend on released core packages. The
core never depends on a concrete schema, protocol, application, or sibling
repository. This direction keeps releases independent and the dependency graph
acyclic.

`credential-did-midnight` is a thin extension of `credential-compact`. Its
standalone root includes the core once; its composition root assumes the
consumer has already included the core composition root.

For Ledger 8, consuming contracts materialize trusted signer decisions locally
because synchronous cross-contract calls are unavailable. See
[Signer Authorization](/spec/signer-authorization) for the local and
authority-backed flows.
