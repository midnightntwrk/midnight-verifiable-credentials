# Package Publication Catalog

Status: core-only package catalog.

The authoritative stage and publishability of each workspace lives in
`tooling/scripts/workspace-catalog.mjs` and the
[release contract](./package-release-contract.md).

## Supported foundation

| Package | Responsibility |
| --- | --- |
| `@midnight-ntwrk/credential-model` | Protocol-independent credential configuration and model contracts |
| `@midnight-ntwrk/credential-compact` | Family-neutral Compact VC/VP semantics |
| `@midnight-ntwrk/credential-proofs` | Proof ports and artifact-manifest contracts |
| `@midnight-ntwrk/credential-status` | Generic credential-status semantics and ports |
| `@midnight-ntwrk/credential-did-midnight` | Thin `did:midnight` holder-binding adapter |

## Internal implementation packages

The remaining core primitives, same-holder capability, ISO registry, display
metadata, legacy combined status registry, split Midnight status components,
and off-chain DID adapter remain internal until their release contracts and
external consumer evidence are approved.

## Excluded package categories

This repository will not publish concrete credential families, OpenID or
DIDComm protocols, connector APIs, workflow/session engines, application
contracts, product renderers, BDD support, deployment harnesses, or use-case
evidence. Those packages belong in independently versioned consumer or adapter
repositories.

## Publication requirements

A package can be supported only when it has explicit exports, registry-resolvable
dependencies, deterministic tarballs, clean-consumer tests, provenance, SBOM
evidence, named ownership, a compatibility policy, and rollback procedures.
`pnpm pack` by itself is not a support promise.
