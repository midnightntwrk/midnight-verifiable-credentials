# Midnight Verifiable Credentials

Protocol-independent verifiable credential and presentation building blocks for
Midnight.

This repository contains the normative VC/VP core specification, conformance
vectors, generic credential-family and claim-schema metadata, and reusable
Compact primitives. It does not contain concrete credential families, method
adapters, product use cases, applications,
exchange protocols, or deployment environments. Those belong in independently
versioned consumer repositories.

## Start here

- [Core specification](./spec/README.md)
- [Glossary](./spec/terminology.md)
- [Conformance](./conformance/README.md)
- [Core-only architecture decision](./docs/decisions/0016-core-only-specification-and-implementation.md)
- [npm publication runbook](./docs/guides/npmjs-publication.md)

## Packages

| Package | Stage | Purpose |
| --- | --- | --- |
| `@midnight-ntwrk/credential-model` | supported | Family and claim-schema metadata with validation |
| `@midnight-ntwrk/credential-compact` | supported | Family-neutral Compact VC/VP primitives |

`supported` means the package is in the executable publication allowlist and
passes build, metadata, export, tarball-content, and clean-consumer checks.
Both packages are ESM-only prerelease APIs and follow semantic versioning.

Use the smallest package that owns the required boundary. A credential-family
repository normally depends on both: `credential-model` describes its metadata,
while `credential-compact` provides the generic circuit primitives. The
executable package catalog in `tooling/scripts/workspace-catalog.mjs` is the
publication allowlist; private examples are never packed.

Concrete families own their schema, policy, family-specific circuits, proving
artifacts, integration, release train, and deployment. They consume released
packages and must not import this repository's source or generated internals.

## Repository layout

```text
spec/                        Normative VC/VP core
conformance/                 Machine-readable vectors and operation mapping
packages/core/               Runtime-neutral packages and Compact primitives
examples/core-composition/   Minimal synthetic composition fixture
docs/                        Core-only decision and release runbook
```

## Development

Use Node.js 24, pnpm 10, and the pinned Compact toolchain.

```bash
pnpm install --frozen-lockfile
./run.sh --light
```

Focused targets are `lint`, `typecheck`, `build`, `test`, `conformance`, and
`package`. Run them as `./run.sh <target>`. The default and `--light` commands
run the same authoritative non-Docker release gate.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) and [AGENT.md](./AGENT.md) before
changing public APIs or repository boundaries.
