# DID Integration Modes

Use this page when a VC package, use case, or integration harness needs
packages from `midnight-did`.

The VC repository supports one canonical DID package cohort plus one temporary
local-artifact exception. Repository checkouts remain independent.

## Mode Matrix

| Mode                            | Purpose                                     | Source                                      | Validation                                      |
| ------------------------------- | ------------------------------------------- | ------------------------------------------- | ----------------------------------------------- |
| npm registry cohort             | Canonical DID runtime and contract packages | Five exact `0.5.0` npm package versions | `pnpm install` and `./run.sh check-integration` |
| Resolver secret-storage tarball | Temporary unpublished custody dependency    | `tooling/vendor/midnight-did/`              | integration report and frozen-lockfile install  |

## Repository Isolation

Package manifests, scripts, TypeScript configuration, Compact includes, and
integration checks must not resolve source from a sibling `midnight-did`
checkout. The npm cohort must be published before VC consumes a DID change.

## DID Key Normalization Compatibility

VC packages that consume resolver output or `LedgerToDomain` from
`midnight-did` must preserve DID's JWK projection rules. The on-ledger DID
contract stores key material as opaque canonical `publicKeyJwk.x` and
`publicKeyJwk.y` strings, while DID documents expose canonical JWKs.
`Ed25519` and `X25519` verification methods are OKP/x-only keys in those
documents, so their ledger `y` value is the empty-string sentinel and must not
be emitted in the resolved DID document.

Coverage:

- `pnpm run test:did-key-normalization`
  - verifies the DID package surface emits x-only Ed25519/X25519 JWKs
  - verifies EC JWK coordinate preservation for Jubjub, P-256, and secp256k1
  - verifies the VC package-alias shim links to the same DID package
    surface instead of carrying a generated `LedgerToDomain` fallback

## 0.5.0 Migration Notes

The released `0.5.0` cohort is breaking relative to `0.5.0-rc1`. The VC
migration is tracked in [issue #391](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/391).
The changes relevant to this repository are:

- Midnight DID API mutation helpers now receive `MidnightDIDProviders`
  explicitly; the standalone integration passes its providers to
  `addSchnorrJubjubVerificationMethod`.
- DID contract controller authorization uses `JubjubPoint`-typed public keys
  and explicit authorization witnesses in the generated contract surface.
  VC code must not treat controller keys as opaque 32-byte values.
- The released contract/API packages contain regenerated managed code and ZK
  artifacts. VC must consume those package artifacts rather than copying
  generated files from a sibling checkout.
- The released DID cohort brings `@midnight-ntwrk/compact-runtime@0.16.0`.
  Since the Compact `0.31.1` toolchain adoption, VC Compact packages pin the
  same `@midnight-ntwrk/compact-runtime@0.16.0`, so DID and VC managed code
  share a single runtime. Do not reintroduce drift through broad overrides or
  unpinned (`*`) runtime specifiers; future runtime bumps must move the DID
  cohort and the VC packages together and re-run the integration/ledger
  checks.
- The domain package keeps the DID document and off-chain DID surfaces used by
  the VC adapter; the adapter and consumer tests are required to prove that
  those surfaces still resolve and bind holders correctly.

No compatibility shim is added for the old mutation signatures. Call sites
must use the released API directly so future package upgrades fail at
compile-time instead of silently taking an obsolete path.

## Ledger Version Boundary

The released `0.5.0` DID API and Jubjub Schnorr packages declare
`@midnight-ntwrk/ledger-v8@8.0.3`, while VC, Midnight JS, and the wallet SDK use
`ledger-v8@8.1.0`. These paths are not runtime-isolated: the DID API passes
ledger values into wallet SDK methods, and independently loaded WASM-backed
classes fail identity checks even when their public shapes match.

The root override therefore resolves every `ledger-v8` edge to `8.1.0`. Treat
this as a release-candidate compatibility override, not evidence that arbitrary
ledger versions are interchangeable. Revalidate the override with real
on-ledger publish/resolve/sign/verify flows whenever the DID or Midnight SDK
cohort changes.

Check the boundary after changing DID package refs:

```bash
pnpm run check:ledger-v8-boundary
pnpm why --recursive @midnight-ntwrk/ledger-v8
```

## npm Registry Cohort

All five DID packages are pinned centrally in the root `pnpm.overrides` block
and directly in consuming package manifests:

```json
"@midnight-ntwrk/midnight-did-domain": "0.5.0"
```

The cohort is:

- `@midnight-ntwrk/midnight-did`
- `@midnight-ntwrk/midnight-did-api`
- `@midnight-ntwrk/midnight-did-contract`
- `@midnight-ntwrk/midnight-did-domain`
- `@midnight-ntwrk/midnight-did-jubjub-schnorr`

Use the exact released version. Do not use `^0.5.0`, a dist-tag, a Git URL,
or a sibling path. The complete root override is required while the vendored
secret-storage package still declares a non-portable local dependency on
Jubjub Schnorr.

`@midnight-ntwrk/midnight-did-secret-storage` is resolver-owned and remains the
only local tarball under `tooling/vendor/midnight-did/`.

Validate with:

```bash
pnpm install --frozen-lockfile
./run.sh check-integration
pnpm run check:did-integration
```

Repair flow:

1. Publish one coherent DID package cohort to npm.
2. Update every direct DID dependency and root override to the same exact
   version.
3. Refresh the resolver-owned tarball only when secret storage changes.
4. Re-run `./run.sh integration-report`.
5. Re-run `./run.sh check-integration` before committing.

VC source imports stable package surfaces such as:

```text
@midnight-ntwrk/midnight-did
@midnight-ntwrk/midnight-did-api
@midnight-ntwrk/midnight-did-domain
```

Do not import from a sibling repository path, generated `dist/` path, or UI
service path. If a VC use case needs resolver service behavior, put that
adapter in the owning integration package rather than reintroducing resolver
service code into the VC package graph.

The `0.5.0` npm contract package includes managed code, prover keys,
verifier keys, and ZKIR. This migration validates the npm package-local
artifacts; GHCR and GitHub Release artifact channels are outside the VC package
consumption path and are not introduced by this change.

## Compatibility Alias Lifecycle

The top-level `midnight-did-credentials*` entries are official local
compatibility aliases. They exist to keep legacy Compact includes and local
tooling stable while canonical package sources live under `packages/`.

Rules:

- aliases are symlinks, not canonical package roots
- aliases are materialized and checked by repository setup and integration
  reporting
- `clean-artifacts` must preserve official aliases
- historical non-alias shells may be removed by `clean-artifacts` only when
  they are classified as disposable generated residue
- removing an official alias requires a dedicated deprecation PR that updates
  Compact include paths, package docs, integration reporting, and cleanup
  guards together

Use canonical package paths for architecture and documentation:

```text
packages/core/
packages/registry/
packages/protocols/
packages/components/
packages/prototypes/
packages/use-cases/
tooling/
```

Use aliases only where the Compact toolchain or compatibility surface still
requires them.

## Troubleshooting

Print the full report:

```bash
./run.sh integration-report
```

Fail the command when stale wiring is detected:

```bash
./run.sh check-integration
```

Common failures:

- stale DID package ref: update every direct spec and root override to the same
  exact published cohort
- missing resolver-owned secret-storage tarball: refresh
  `tooling/vendor/midnight-did/`
- missing compatibility alias: run install/setup or inspect
  `tooling/scripts/compatibility-aliases.mjs`
- unexpected top-level `midnight-did-credentials*` entry: remove the stray
  entry or classify it explicitly before it is treated as architecture

## PR Checklist

Before sending a DID/VC integration PR for review:

```bash
./run.sh integration-report
./run.sh check-integration
pnpm run docs:links
git diff --check
```
