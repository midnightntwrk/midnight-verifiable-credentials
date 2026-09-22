# Changelog

## 0.2.0

- Reintroduced `@midnight-ntwrk/credential-did-midnight` as a flat,
  protocol-independent extension of `@midnight-ntwrk/credential-compact`.
- Added an injected Midnight DID 0.7 resolver adapter for on-chain native
  Jubjub verification methods.
- Decode canonical fixed-width big-endian Jubjub JWK coordinates with the
  public Midnight DID domain codec; 0.6 little-endian snapshots are not
  auto-detected and require explicit migration.
- Added standalone and composition-safe Compact entrypoints for method, holder,
  proof, and signer-authorization binding.
- Added credential-issuance and presentation signing helpers that interoperate
  with Midnight DID Jubjub keys and the VC core Compact challenge circuits.
- Pinned the supported Ledger 8 profile and documented that binding circuits
  require composition with core signature-verification circuits.

Historical `0.1.0-rc*` releases used the removed pre-core architecture and are
not API-compatible with this package.
