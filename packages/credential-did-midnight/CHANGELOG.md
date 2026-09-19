# Changelog

## 0.2.0

- Reintroduced `@midnight-ntwrk/credential-did-midnight` as a flat,
  protocol-independent extension of `@midnight-ntwrk/credential-compact`.
- Added an injected Midnight DID 0.6 resolver adapter for on-chain native
  Jubjub verification methods.
- Added standalone and composition-safe Compact entrypoints for method, holder,
  proof, and signer-authorization binding.
- Pinned the supported Ledger 8 profile and documented that binding circuits
  require composition with core signature-verification circuits.

Historical `0.1.0-rc*` releases used the removed pre-core architecture and are
not API-compatible with this package.
