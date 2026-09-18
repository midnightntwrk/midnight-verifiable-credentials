<!-- Generated from a canonical repository source by scripts/sync-content.mjs. Do not edit this copy. -->

# ADR-0017: Thin Midnight DID binding extension

- Status: Accepted
- Date: 2026-09-18
- Owners: VC maintainers
- Amends: ADR-0016 public package graph and DID-adapter boundary

## Context

The core uses fixed-width Compact verification-method references, while
`midnight-did` exposes canonical DID fragments, native Jubjub JWKs, and logical
DID state versions. Requiring every credential-family repository to reproduce
that mapping would create incompatible method identifiers and key encodings.

The removed adapter hierarchy mixed this mapping with protocols and product
flows. Restoring that hierarchy would violate the core-only direction.

## Decision

Publish one flat extension package:

- `@midnight-ntwrk/credential-did-midnight`.

It depends one-way on `@midnight-ntwrk/credential-compact` and the published
Midnight DID `0.6.0` packages. It provides an injected TypeScript resolver
adapter plus standalone and composition-safe Compact entrypoints.

The package owns only deterministic DID-to-core mapping and structural binding
circuits. DID lifecycle, signing, trust decisions, registries, protocols,
wallets, applications, and credential families remain outside this repository.

Ledger 8 consumers must pin an accepted binding or verify an authority proof;
the extension does not claim live cross-contract DID resolution.

## Consequences

- The supported release graph contains three public packages instead of two.
- `credential-did-midnight` is the only package allowed to depend on another
  public workspace package, and that dependency remains acyclic.
- Consumer repositories can compose the extension without copying core Compact
  sources or DID mapping logic.
- A new DID-method adapter still requires a separate architecture decision and
  the same bounded evidence; this decision is not a general adapter framework.
