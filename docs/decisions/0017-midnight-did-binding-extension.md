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
Midnight DID `0.7.0` packages. It provides an injected TypeScript resolver
adapter plus standalone and composition-safe Compact entrypoints.

The package owns deterministic DID-to-core mapping, structural binding
circuits, and bounded software helpers that assemble core issuance and
presentation proofs for a supplied Jubjub secret scalar. DID lifecycle,
long-lived key custody, trust decisions, registries, protocols, wallets,
applications, and credential families remain outside this repository.

The helpers reuse Midnight DID key/scalar primitives but derive the challenge
through the VC core's generated context-specific circuits. They do not call the
Midnight DID contract payload signer because that operation has a different
challenge domain. Software-held keys use a hedged nonce derived from the secret,
operation domain, signed inputs, fresh entropy, and retry counter;
hardware-backed custody remains external.

The binding circuits do not verify signatures. Consumers must compose them with
the core context-specific proof circuit over a body root recomputed from the
complete credential, presentation, authorization decision, or verifier request.
This is a normative security boundary, not an optional integration pattern.

Ledger 8 consumers must pin an accepted binding or verify an authority proof;
the extension does not claim live cross-contract DID resolution.

The adapter accepts only the Midnight DID 0.7 canonical big-endian Jubjub JWK
profile and delegates coordinate decoding and range validation to the public
domain package codec. Historical 0.6 little-endian snapshots require an
explicit migration; byte-order auto-detection and use of ledger `versionId` as
an encoding marker are rejected. Because some legacy values remain in range
under the new byte order, a mis-supplied 0.6 snapshot can silently bind the
wrong point. This transport change does not alter the native point or its
Compact binding root when migration is explicit.

The initial support profile is Compact `0.31.1`, runtime `0.16.0`, and Ledger
`8.0.2`. Cross-contract DID validation is deferred until a later Ledger profile.

## Consequences

- The supported release graph contains three public packages instead of two.
- `credential-did-midnight` is the only package allowed to depend on another
  public workspace package, and that dependency remains acyclic.
- Consumer repositories can compose the extension without copying core Compact
  sources or DID mapping logic.
- A new DID-method adapter still requires a separate architecture decision and
  the same bounded evidence; this decision is not a general adapter framework.
