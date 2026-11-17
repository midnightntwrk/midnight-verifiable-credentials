# ADR-0017: Thin Midnight DID binding extension

- Status: Accepted
- Date: 2026-09-18
- Updated: 2026-11-16
- Owners: VC maintainers
- Amends: ADR-0016 public package graph and DID-adapter boundary

## Context

The core uses fixed-width Compact verification-method references, while
`midnight-did` exposes canonical DID fragments, native Jubjub JWKs, and logical
DID state versions. Requiring every credential implementation repository to reproduce
that mapping would create incompatible method identifiers and key encodings.

The removed adapter hierarchy mixed this mapping with protocols and product
flows. Restoring that hierarchy would violate the core-only direction.

## Decision

Publish one flat extension package:

- `@midnight-ntwrk/credential-did-midnight`.

It depends one-way on `@midnight-ntwrk/credential-compact` and the published
Midnight DID packages (selected migration: exact `1.0.0-rc1` domain/Schnorr,
with DID RC1 as a development dependency). It provides an injected TypeScript
resolver adapter plus standalone and composition-safe Compact entrypoints.

The package owns deterministic DID-to-core mapping, structural binding
circuits, and bounded software helpers that assemble core issuance and
presentation proofs for a supplied Jubjub secret scalar. DID lifecycle,
long-lived key custody, trust decisions, registries, protocols, wallets,
applications, and concrete credential schemas remain outside this repository.

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

Consumers must pin an accepted binding or verify an authority proof on every
supported Ledger profile; the extension does not claim live cross-contract DID
resolution, including when targeting Ledger9.

The adapter accepts only the Midnight DID canonical big-endian Jubjub JWK
profile introduced in 0.7 and retained by RC1. It delegates coordinate decoding
and range validation to the public domain package codec. Historical 0.6 little-endian snapshots should be
re-resolved through a 0.7-compatible resolver. An offline migration is allowed
only when the snapshot provenance authenticates its DID, method, relationship,
positive observed `versionId`, and 0.6 encoding profile; it must decode the 0.6
coordinates and re-encode the same native point in the canonical 0.7 profile.
Profile auto-detection and use of ledger `versionId` as an encoding marker are
rejected. Because some legacy values remain in range under the new byte order,
a mis-supplied 0.6 snapshot can silently bind the wrong point.

The initial support profile was Compact `0.31.1`, runtime `0.16.0`, and Ledger
`8.0.2`. The selected migration profile is Compact `0.36.0` / runtime `0.21.0`,
measured backend `zkir-3.2.0-rc.2`, and public npm cohort
`@midnightntwrk/ledger-v9@1.0.0`. Backend and Ledger identities are distinct.
Full profile support remains subject to the gates in the
[Ledger9 migration guide](../guides/ledger9-migration.md). That migration does
not add cross-contract calls, change snapshot trust, or restore application
infrastructure. Downstream DID replacement/rebinding and rebuilt keys/artifacts
are explicit migration obligations, not automatic history preservation.

## Consequences

- The supported release graph contains three public packages instead of two.
- `credential-did-midnight` is the only package allowed to depend on another
  public workspace package, and that dependency remains acyclic.
- Consumer repositories can compose the extension without copying core Compact
  sources or DID mapping logic.
- A new DID-method adapter still requires a separate architecture decision and
  the same bounded evidence; this decision is not a general adapter framework.
