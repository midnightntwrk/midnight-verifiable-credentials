# Package Boundaries

## Allowed package classes

| Class | Location | Responsibility |
| --- | --- | --- |
| Core | `packages/core` | Models, Compact VC/VP primitives, and generic proof/status interfaces |
| Registry | `packages/registry` | Reusable status implementations for Midnight |
| Adapter | `packages/components/adapters` | Thin integration with DID runtime APIs |
| Fixture | `examples/core-composition` | Minimal non-product composition test |

## Dependency direction

```text
fixture -> adapter/registry -> core
```

Core code must not import adapters or registry implementations. Registry
packages may implement core status ports. Adapters may consume core interfaces
and explicitly declared external SDKs. The fixture may consume published package
entrypoints from any retained layer.

## Forbidden surfaces

The workspace must not contain:

- a concrete credential schema or family package
- issuer, holder, verifier, wallet, or relying-party applications
- product data, BDD scenarios, or deployment environments
- OIDC, DIDComm, DApp connector, or business-process orchestration
- imports from sibling repository source or generated output

These concerns belong in independently owned consumer repositories.

## Public APIs

Every reusable package exposes explicit `exports`. Consumers import package
entrypoints and do not reach into `src/`, `dist/`, `managed/`, or another
package's private files. Internal workspace dependencies use `workspace:*`.

## Enforcement

```bash
pnpm run check:workspace-catalog
pnpm run check:workspace-manifests
pnpm run check:package-boundaries
```

The first check keeps workspace inventories aligned, the second validates
package manifests and public entrypoints, and the third rejects invalid source
and dependency edges.
