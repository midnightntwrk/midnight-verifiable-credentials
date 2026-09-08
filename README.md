# Midnight Verifiable Credentials

Protocol-independent verifiable credential and presentation building blocks for
Midnight.

This repository contains the normative VC/VP core specification, conformance
vectors, reusable TypeScript packages, generic Compact primitives, credential
status interfaces, and a thin `did:midnight` adapter. It does not contain
credential families, product use cases, applications, exchange protocols, or
deployment environments. Those belong in independently versioned consumer
repositories.

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
| `@midnight-ntwrk/credential-proofs` | supported | Proof, authority-evidence, and artifact-manifest ports |
| `@midnight-ntwrk/credential-status` | supported | Runtime-neutral credential-status semantics |
| `@midnight-ntwrk/credential-did-midnight` | supported | Thin `did:midnight` holder-binding adapter |
| `@midnight-ntwrk/credential-display` | internal | Experimental display metadata |
| `@midnight-ntwrk/credential-status-midnight-contract` | internal | Status state and mutation boundary |
| `@midnight-ntwrk/credential-status-midnight-verifier` | internal | Status reads and proof verification |
| `@midnight-ntwrk/credential-status-midnight-authority` | internal | Status authorization and signing ports |

The [release contract](./docs/architecture/package-release-contract.md) is the
authority for publication status. The
[manifest discipline](./docs/architecture/workspace-package-manifest-discipline.md)
defines package metadata and export requirements.

## Repository layout

```text
spec/                        Normative VC/VP core
conformance/                 Machine-readable vectors and operation mapping
packages/core/               Runtime-neutral packages and Compact primitives
packages/registry/           Internal Midnight status components
packages/components/adapters Thin runtime adapters
examples/core-composition/   Minimal synthetic composition fixture
docs/                        Architecture, glossary, decisions, and runbooks
```

## Development

Use Node.js 24, pnpm 10, and the pinned Compact toolchain.

```bash
pnpm install --frozen-lockfile
./run.sh --light
```

Focused targets are `lint`, `typecheck`, `build`, `test`, `conformance`,
`check-integration`, and `package`. Run them as `./run.sh <target>`.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) and [AGENT.md](./AGENT.md) before
changing public APIs or repository boundaries.
