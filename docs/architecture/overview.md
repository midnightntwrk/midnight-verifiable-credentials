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
 external credential-family and application repositories
```

- `packages/core` owns generic family and claim-schema metadata, validation,
  and generic Compact primitives.
- `examples/core-composition` proves package composition with synthetic data.
  It is not a product example.

## Dependency rules

- Dependencies point toward core.
- The workspace graph remains acyclic.
- Cross-repository dependencies use published packages or workspace-managed
  tarballs, never sibling source.

The only workspace classes are reusable core packages in `packages/core` and
the private synthetic fixture in `examples/core-composition`. The fixture may
depend on core; core must not depend on the fixture.

## Excluded surfaces

The workspace does not contain concrete credential families, role-specific
applications, product data, BDD scenarios, deployment environments, exchange
protocols, connector APIs, or business-process orchestration. Those concerns
belong in independently owned consumer repositories.

Reusable packages expose explicit entrypoints. Consumers do not import `src/`,
`dist/`, `managed/`, generated internals, or sibling-repository files. Internal
workspace dependencies use `workspace:*`.

## Enforcement

```bash
pnpm run check:workspace-catalog
pnpm run check:release-package-contract
pnpm run check:package-boundaries
```

These checks validate the workspace inventory, public manifests and exports,
and source/dependency direction. See [package selection](../guides/package-selection.md)
for the public surface.
