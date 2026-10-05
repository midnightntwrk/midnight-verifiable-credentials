# Midnight Verifiable Credentials

Protocol-independent verifiable credential and presentation building blocks for
Midnight.

This repository contains the normative VC/VP core specification, conformance
vectors, generic credential-family and claim-schema metadata, and reusable
Compact primitives. It also contains one bounded Midnight DID binding extension
so consumers do not reproduce canonical method and key mapping. It does not
contain concrete credential families, general adapter frameworks, product use
cases, applications, exchange protocols, or deployment environments. Those
belong in independently versioned consumer repositories.

## Start here

- [Published documentation](https://midnightntwrk.github.io/midnight-verifiable-credentials/)
- [Package quickstart](https://midnightntwrk.github.io/midnight-verifiable-credentials/guide/quickstart)
- [Core specification](./spec/README.md)
- [Proof semantics](./spec/proof-semantics.md)
- [Glossary](./spec/terminology.md)
- [Conformance](./conformance/README.md)
- [Core-only architecture decision](./docs/decisions/0016-core-only-specification-and-implementation.md)
- [Midnight DID binding decision](./docs/decisions/0017-midnight-did-binding-extension.md)
- [Credential schema model decision](./docs/decisions/0018-credential-schema-model.md)
- [npm publication runbook](./docs/guides/npmjs-publication.md)

## Packages

| Need | Package | Does not provide |
| --- | --- | --- |
| Describe and validate a credential family or claim schema | `@midnight-ntwrk/credential-model` | Credentials, proofs, protocols, or deployment |
| Compose family-neutral VC/VP circuits and encode Compact values | `@midnight-ntwrk/credential-compact` | Issuer trust, status authority, trusted time, or a wallet flow |
| Map a resolved `did:midnight` Jubjub method into the core types and circuits | `@midnight-ntwrk/credential-did-midnight` | A DID resolver, current-state proof, or trust policy |

All three packages are in the executable publication allowlist, and their
packed artifacts pass build and clean-consumer checks. They are ESM-only
pre-1.0 APIs and follow semantic versioning.

Use the smallest package that owns the required boundary. A credential-family
repository normally depends on both: `credential-model` describes its metadata,
while `credential-compact` provides the generic circuit primitives. The
optional `credential-did-midnight` package maps resolved Midnight DID methods
into those primitives. The
executable package catalog in `tooling/scripts/workspace-catalog.mjs` is the
publication allowlist.

Concrete families own their schema, policy, family-specific circuits, proving
artifacts, integration, release train, and deployment. They consume released
packages and must not import this repository's source or generated internals.

## Release channels

The current stable package graph is `0.2.0`. Install exact versions so a
credential-family build cannot change when an npm dist-tag moves:

```bash
pnpm add -E \
  @midnight-ntwrk/credential-model@0.2.0 \
  @midnight-ntwrk/credential-compact@0.2.0
```

Add `@midnight-ntwrk/credential-did-midnight@0.2.0` only when the family or
consumer uses Midnight DID methods. The `0.3.0-rc1` graph is available under
the `rc` tag for explicit prerelease evaluation; it is not the stable release.
See the [quickstart](https://midnightntwrk.github.io/midnight-verifiable-credentials/guide/quickstart)
for guarded stable and RC installation.

## Read by task

- Credential-family authors: start with the
  [quickstart](https://midnightntwrk.github.io/midnight-verifiable-credentials/guide/quickstart)
  and the [model package README](./packages/core/model/README.md).
- Compact contract authors: read the
  [composition guide](https://midnightntwrk.github.io/midnight-verifiable-credentials/guide/composition)
  and the [Compact package README](./packages/core/compact/README.md).
- Security reviewers: read [proof semantics](./spec/proof-semantics.md),
  [security considerations](./spec/security-considerations.md), and the
  [conformance evidence](./conformance/README.md).
- Release operators: use the [npm publication runbook](./docs/guides/npmjs-publication.md).

## Repository layout

```text
spec/                        Normative VC/VP core
conformance/                 Machine-readable vectors and operation mapping
packages/core/               Runtime-neutral packages and Compact primitives
packages/credential-did-midnight/  Optional Midnight DID binding extension
docs/                        Core-only decision and release runbook
```

## Development

Use Node.js 24, pnpm 11.25.0, and the pinned Compact toolchain.

```bash
pnpm install --frozen-lockfile
./run.sh --light
```

Focused targets are `lint`, `typecheck`, `build`, `test`, `conformance`, and
`package`. Build the documentation with `./run.sh docs` or run it locally with
`pnpm run docs:dev`. Run focused targets as `./run.sh <target>`. The default and
`--light` commands run the same authoritative non-Docker release gate.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) and [AGENT.md](./AGENT.md) before
changing public APIs or repository boundaries.
