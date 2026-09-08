# Midnight Verifiable Credentials

Protocol-independent verifiable credential and presentation building blocks for
Midnight.

This repository contains the normative VC/VP core specification, conformance
vectors, a reusable TypeScript model, generic Compact primitives, and bounded
credential capability and artifact descriptors. It does not contain method
adapters, credential families, product use cases, applications, exchange
protocols, or deployment environments. Those belong in independently versioned
consumer repositories.

## Start here

- [Core specification](./spec/README.md)
- [Glossary](./docs/glossary.md)
- [Architecture](./docs/architecture/overview.md)
- [Package selection](./docs/guides/package-selection.md)
- [Conformance](./conformance/README.md)
- [Decision records](./docs/decisions/README.md)

## Packages

| Package | Stage | Purpose |
| --- | --- | --- |
| `@midnight-ntwrk/credential-model` | supported | Configuration, descriptors, codecs, and validation |
| `@midnight-ntwrk/credential-compact` | supported | Family-neutral Compact VC/VP primitives |

The [release contract](./docs/architecture/package-release-contract.md) is the
authority for publication status. The
[manifest discipline](./docs/architecture/workspace-package-manifest-discipline.md)
defines package metadata and export requirements.

## Repository layout

```text
spec/                        Normative VC/VP core
conformance/                 Machine-readable vectors and operation mapping
packages/core/               Runtime-neutral packages and Compact primitives
examples/core-composition/   Minimal synthetic composition fixture
docs/                        Architecture, glossary, decisions, and runbooks
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
