# Midnight Verifiable Credentials

Compact-first, protocol-independent building blocks for verifiable credentials
and presentations on Midnight.

This repository contains the reusable VC/VP specification, conformance vectors,
Compact primitives, TypeScript models, proof interfaces, status components, and
thin DID adapters. It intentionally does not contain concrete credential
families, product use cases, wallet applications, relying-party applications,
or OIDC/DIDComm orchestration. Those belong in independently versioned
repositories that consume these packages.

## Repository shape

```text
conformance/                 Machine-readable vectors and support status
docs/                        Architecture, decisions, guides, and test policy
examples/core-composition/   Minimal synthetic package-composition fixture
packages/core/               Protocol-neutral models and VC/VP primitives
packages/registry/           Reusable credential-status components
packages/components/adapters Thin DID integration adapters
spec/                        Normative core specification
tooling/                     Build, validation, release, and fixture tooling
```

The accepted repository boundary is recorded in
[ADR-0016](./docs/decisions/0016-core-only-specification-and-implementation.md).
The removal history for former families and use cases is retained in the
[credential migration ledger](./docs/architecture/credential-family-migration-ledger.md).

## Workspace packages

### Core

| Package | Purpose |
| --- | --- |
| `@midnight-ntwrk/credential-model` | Protocol-neutral credential configuration and model contracts |
| `@midnight-ntwrk/credential-compact` | Family-neutral Compact VC/VP semantics |
| `@midnight-ntwrk/credential-proofs` | Proof ports and immutable artifact-manifest contracts |
| `@midnight-ntwrk/credential-status` | Generic credential-status semantics and ports |
| `@midnight-ntwrk/credential-display` | Framework-neutral display metadata contracts |
| `@midnight-ntwrk/midnight-did-credentials` | Compact credential and presentation primitives |
| `@midnight-ntwrk/midnight-did-credentials-same-holder` | Same-holder proof composition |
| `@midnight-ntwrk/midnight-did-credentials-iso-registry` | Compact-native ISO code types |

### Status and adapters

| Package | Purpose |
| --- | --- |
| `@midnight-ntwrk/midnight-did-credentials-status-registry` | Midnight status-registry contract and helpers |
| `@midnight-ntwrk/credential-status-midnight-contract` | Atomic status state and authorization gate |
| `@midnight-ntwrk/credential-status-midnight-verifier` | Least-privilege status read and witness adapter |
| `@midnight-ntwrk/credential-status-midnight-authority` | Status controller/delegate authorization ports |
| `@midnight-ntwrk/midnight-did-credentials-offchain-did` | Off-chain DID holder-binding adapter |
| `@midnight-ntwrk/credential-did-midnight` | `did:midnight` holder-binding adapter |

Package publication status and supported entrypoints are defined by
[the release contract](./docs/architecture/package-release-contract.md), not by
directory placement alone.
Workspace package metadata and export rules are defined by the
[package-manifest discipline](./docs/architecture/workspace-package-manifest-discipline.md).

## Specification and conformance

- [Core specification](./spec/README.md)
- [Conformance suite](./conformance/README.md)
- [Architecture overview](./docs/architecture/overview.md)
- [Package selection](./docs/guides/package-selection.md)
- [Documentation index](./docs/README.md)

The synthetic [core composition example](./examples/core-composition/README.md)
proves that independently consumable core packages compose. Product examples
and credential-family prototypes belong outside this repository.

## Development

Prerequisites are Node.js 24, pnpm 10, and the Compact compiler version recorded
by the repository toolchain.

```bash
pnpm install --frozen-lockfile
./run.sh --light
```

Useful focused targets:

```bash
./run.sh lint
./run.sh typecheck
./run.sh build
./run.sh test
./run.sh conformance
./run.sh package
./run.sh targets
```

`./run.sh --light` is the repository gate. It validates package boundaries,
builds the workspaces, runs conformance and package tests, and packs the
supported release surface without starting Docker integration environments.

## Repository boundaries

Every `midnight-*` repository is independent. Do not import sibling source,
generated output, or package internals. Consume published npm packages when
available; otherwise use package tarballs distributed by the root identity
workspace automation.

See [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md), and
[AGENT.md](./AGENT.md) before changing the repository.
