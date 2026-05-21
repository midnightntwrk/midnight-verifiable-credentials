# DID Integration Modes

Use this page when a VC package, use case, or integration harness needs
packages from `midnight-did`.

The VC repository supports three DID integration modes. They are intentionally
separate so local development, CI, and published consumers can make different
tradeoffs without changing package source.

## Mode Matrix

| Mode               | Purpose                                             | Source of DID Packages              | Validation                                 |
| ------------------ | --------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| Sibling checkout   | Local DID + VC development in adjacent repositories | `../midnight-did`                   | `./run.sh integration-report`              |
| Vendored tarballs  | Reproducible standalone fixtures and CI paths       | `tooling/vendor/midnight-did/*.tgz` | `./run.sh check-integration`               |
| Published packages | Normal downstream package consumption               | npm registry package specs          | package manager install plus package tests |

## Sibling Checkout Mode

Use sibling checkout mode when `midnight-did` and
`midnight-verifiable-credentials` are cloned side by side:

```text
parent/
  midnight-did/
  midnight-verifiable-credentials/
```

The integration report inspects `../midnight-did/package.json`, enumerates DID
workspace packages, and verifies whether expected `dist/` and managed artifact
surfaces exist.

Run:

```bash
./run.sh integration-report
```

This mode is best for active cross-repo work because it shows what the VC repo
would consume from the current DID checkout before a package is published.

## Vendored Tarball Mode

Use vendored tarball mode for standalone fixtures and CI paths that must not
depend on a live sibling checkout.

Vendored DID packages live under:

```text
tooling/vendor/midnight-did/
```

VC package manifests that need DID packages should point at the matching
`file:` tarball when they are intentionally testing a bundled DID artifact. The
integration check verifies that the package spec matches the sibling package
version when a sibling checkout exists and that the expected tarball is present.

Run:

```bash
./run.sh check-integration
npm run check:did-integration
```

Repair flow:

1. Build and pack the DID repository from the matching DID branch.
2. Refresh the tarballs under `tooling/vendor/midnight-did/`.
3. Re-run `./run.sh integration-report` to inspect the expected package names,
   versions, and tarball filenames.
4. Re-run `./run.sh check-integration` before committing.

## Published Package Mode

Use published package mode for consumers outside this monorepo-style workspace.

In this mode package specs should resolve through the package manager instead
of local `file:` tarballs. VC source should keep importing stable package
surfaces such as:

```text
@midnight-ntwrk/midnight-did
@midnight-ntwrk/midnight-did-api
@midnight-ntwrk/midnight-did-domain
```

Do not import from a sibling repository path, generated `dist/` path, or UI
service path. If a VC use case needs resolver service behavior, put that
adapter in the owning integration package rather than reintroducing resolver
service code into the VC package graph.

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

- missing sibling DID checkout: acceptable for tarball-only consumers, but the
  report can only compare against vendored specs
- missing vendor tarball: refresh `tooling/vendor/midnight-did/`
- stale `file:` spec: update the consuming package manifest to the expected
  tarball path shown by the report
- missing compatibility alias: run install/setup or inspect
  `tooling/scripts/compatibility-aliases.mjs`
- unexpected top-level `midnight-did-credentials*` entry: remove the stray
  entry or classify it explicitly before it is treated as architecture

## PR Checklist

Before sending a DID/VC integration PR for review:

```bash
./run.sh integration-report
./run.sh check-integration
npm run docs:links
git diff --check
```
