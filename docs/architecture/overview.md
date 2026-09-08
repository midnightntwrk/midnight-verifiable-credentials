# Architecture Overview

## Boundary

This repository implements protocol-independent VC/VP building blocks. Concrete
credential families, applications, product workflows, and transport protocols
are consumers of this repository and are versioned elsewhere.

The normative boundary is [ADR-0016](../decisions/0016-core-only-specification-and-implementation.md).

## Layers

```text
specification and conformance
             |
       core model
             |
Compact primitives, proof/status ports, reusable capabilities
             |
Midnight status components and thin DID adapters
             |
external credential-family and application repositories
```

### Core

`packages/core` owns runtime-neutral models, Compact vocabulary and primitives,
proof interfaces, status semantics, display metadata, and reusable capabilities.
Core packages cannot depend on adapters, registry implementations, examples, or
application code.

### Registry components

`packages/registry` owns reusable Midnight implementations of the generic status
interfaces. Authorization, ledger mutation, and least-privilege verification are
kept in separate packages so consumers can adopt only the authority they need.

### Adapters

`packages/components/adapters` connects the protocol-independent core to DID
runtime APIs. An adapter may translate types and invoke an external SDK, but it
must not define issuance or presentation orchestration.

### Composition fixture

`examples/core-composition` is a synthetic build/test fixture. It demonstrates
package composition without defining a real credential schema or workflow.

## Dependency rules

- Dependencies point inward toward core.
- Package entrypoints are explicit; deep imports are forbidden.
- The workspace graph is acyclic.
- Apps and concrete VC families are not workspace packages.
- Cross-repository dependencies use npm packages or workspace-managed tarballs.

See [package boundaries](./package-boundaries.md).
