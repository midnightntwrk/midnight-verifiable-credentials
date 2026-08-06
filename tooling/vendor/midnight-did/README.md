# Resolver-Owned Secret Storage Package

The DID package cohort is consumed from npm at exact version `0.5.0` and
pinned in the root `pnpm.overrides` block.

This directory only keeps the resolver-owned
`@midnight-ntwrk/midnight-did-secret-storage` tarball until that package has a
published package source available to VC.

Refreshed:

- DID package source: npm package cohort `0.5.0`
- Secret-storage source: `../midnight-did-resolver`

Validation:

- `pnpm install --frozen-lockfile`
- `./run.sh --light`

Dependency note:

The vendored secret-storage tarball is intentionally repacked from the resolver
artifact with its unused `circomlibjs` dependency removed. The generated
`dist` contains no `circomlibjs` or `ethers` imports; retaining that stale
manifest entry would reintroduce `elliptic` through `ethers@5`.

- `@midnight-ntwrk/midnight-did-api` and
  `@midnight-ntwrk/midnight-did-jubjub-schnorr` declare
  `@midnight-ntwrk/ledger-v8@8.0.3`.
- The DID API passes ledger objects into the Midnight wallet SDK, so duplicate
  ledger versions are not runtime-isolated: their WASM-backed classes fail
  identity checks across package boundaries.
- The root override resolves the entire dependency graph to
  `@midnight-ntwrk/ledger-v8@8.1.0`, matching the VC, Midnight JS, and wallet
  SDK baseline.
- `pnpm run check:ledger-v8-boundary` enforces the single-version requirement
  in the fast local/CI check lane.
