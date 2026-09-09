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

## Consumer Responsibilities

- concrete credential-family claims and predicates
- DID resolution and verification-method authorization
- issuer and verifier trust policy
- current status evidence and registry synchronization
- challenge freshness, replay prevention, audience, and trusted time
- proving artifacts, deployment, transport, wallet, and application behavior

## Package Direction

Credential-family and application repositories depend on released core
packages. The core never depends on a family, protocol, application, or sibling
repository. This direction keeps releases independent and the dependency graph
acyclic.

For Ledger 8, consuming contracts materialize trusted signer decisions locally
because synchronous cross-contract calls are unavailable. See
[Signer Authorization](/spec/signer-authorization) for the local and
authority-backed flows.
