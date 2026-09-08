# Architecture

## Boundary

This repository defines and implements reusable, protocol-independent VC/VP
semantics. A concrete credential family combines these primitives with its own
schema, policies, circuits, artifacts, release train, and application
integration in a separate repository.

The normative repository boundary is [ADR-0016](../decisions/0016-core-only-specification-and-implementation.md).

## Layers

```text
normative specification + conformance vectors
                    |
           model and Compact core
                    |
       proof and credential-status ports
                    |
 internal Midnight status components + thin DID adapter
                    |
 external credential-family and application repositories
```

- `packages/core` owns runtime-neutral models, Compact primitives, and generic
  proof/status interfaces.
- `packages/registry` contains internal Midnight implementations of status
  interfaces. Read, mutation, and authorization responsibilities stay separate.
- `packages/components/adapters` translates external SDK types at a narrow
  boundary. It does not own VC issuance or presentation workflows.
- `examples/core-composition` proves package composition with synthetic data.
  It is not a product example.

## Dependency rules

- Dependencies point toward core.
- Packages expose explicit entrypoints; consumers do not deep-import source or
  generated internals.
- The workspace graph remains acyclic.
- Cross-repository dependencies use published packages or workspace-managed
  tarballs, never sibling source.
- Credential families, applications, OIDC, DIDComm, connector APIs, and
  deployment harnesses remain outside this repository.

See [package boundaries](./package-boundaries.md) for executable checks and
[package selection](../guides/package-selection.md) for the public surface.
