# Resolver-Owned Secret Storage Package

The DID 0.4.0 packages are consumed through package-root Git tags in the
`midnight-did` repository and pinned in the root `pnpm.overrides` block.

This directory only keeps the resolver-owned
`@midnight-ntwrk/midnight-did-secret-storage` tarball until that package has a
published package source available to VC.

Refreshed:
- DID package source: `midnightntwrk/midnight-did` package-root Git tags
  `npm-midnight-did*-v0.4.0`
- Secret-storage source: `../midnight-did-resolver`

Validation:
- `pnpm install --frozen-lockfile`
- `./run.sh --light`

Dependency note:
- `@midnight-ntwrk/midnight-did-jubjub-schnorr` declares
  `@midnight-ntwrk/ledger-v8@8.0.3`.
- The VC workspace and Midnight JS packages continue to use
  `@midnight-ntwrk/ledger-v8@8.1.0`.
- `pnpm why --recursive @midnight-ntwrk/ledger-v8` shows the `8.0.3` copy is
  scoped under the DID/Jubjub Schnorr dependency tree, while `8.1.0`
  remains under the Midnight JS/Compact JS dependency tree.
- `pnpm run check:ledger-v8-boundary` enforces this dependency boundary in the
  fast local/CI check lane.
