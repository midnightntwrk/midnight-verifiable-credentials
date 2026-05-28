# Vendored Midnight DID Packages

These tarballs are local VC integration fixtures for `@midnight-ntwrk/midnight-did*`
packages.

Refreshed:
- Date: 2026-05-28
- Source checkout: `../midnight-did`
- Source commit: `6274cff61605` (`feat!: Redesign DID verification method storage`)
- Refresh command: `./scripts/sync-package-tarballs.sh --source did --destination midnight-verifiable-credentials`

Validation:
- `pnpm install --frozen-lockfile`
- `./run.sh --light`

Dependency note:
- `@midnight-ntwrk/midnight-did-jubjub-schnorr` declares
  `@midnight-ntwrk/ledger-v8@8.0.3`.
- The VC workspace and Midnight JS packages continue to use
  `@midnight-ntwrk/ledger-v8@8.1.0`.
- `pnpm why --recursive @midnight-ntwrk/ledger-v8` shows the `8.0.3` copy is
  scoped under the vendored DID/Jubjub Schnorr dependency tree, while `8.1.0`
  remains under the Midnight JS/Compact JS dependency tree.
- `pnpm run check:ledger-v8-boundary` enforces this dependency boundary in the
  fast local/CI check lane.
