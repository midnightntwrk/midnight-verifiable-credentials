# Changelog

## Unreleased

## 0.3.0 - 2026-10-01

- Bind the exact circuit surfaces of both the standalone and composition
  Compact entrypoints and clarify which helpers own state-version,
  relationship, and body-root checks.
- Keep the repository's pnpm requirement development-only so published binding
  consumers are not coupled to this monorepo's package manager.
- Narrow the public resolver boundary to a structural interface backed by DID
  domain types, keeping the full Midnight DID resolver as a development-only
  compatibility dependency.
- Add an executable packed-package consumer that resolves Midnight DID issuer
  and holder methods, validates family metadata through the model package,
  signs a nonempty typed VC/VP flow, verifies the published Compact composition,
  and rejects targeted substitutions.

## 0.2.0 - 2026-09-25

- Reintroduced `@midnight-ntwrk/credential-did-midnight` as a flat,
  protocol-independent extension of `@midnight-ntwrk/credential-compact`.
- Added an injected Midnight DID 0.7 resolver adapter for on-chain native
  Jubjub verification methods.
- Decode canonical fixed-width big-endian Jubjub JWK coordinates with the
  public Midnight DID domain codec; 0.6 little-endian snapshots require
  re-resolution or an explicit, provenance-authenticated migration and are
  never auto-detected by this package.
- Added standalone and composition-safe Compact entrypoints for method, holder,
  proof, and signer-authorization binding.
- Added credential-issuance and presentation signing helpers that interoperate
  with Midnight DID Jubjub keys and the VC core Compact challenge circuits.
- Pinned the supported Ledger 8 profile and documented that binding circuits
  require composition with core signature-verification circuits.

Historical `0.1.0-rc*` releases used the removed pre-core architecture and are
not API-compatible with this package.
