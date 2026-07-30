# npmjs Publication Runbook

This runbook covers public releases of reusable packages from
`midnight-verifiable-credentials`. Concrete credential families, prototypes,
use cases, reporting packages, and integration infrastructure are never part
of this release train.

## Ownership

- Technical package owner: `@midnightntwrk/ex-identus`
- npm credentials and incident owner: `@midnightntwrk/mn-sre`
- Security disclosure and escalation: [`SECURITY.md`](../../SECURITY.md)

The initial release path follows `midnight-did`: it uses the organization
`MIDNIGHTCI_NPMJS_TOKEN` secret directly from the reviewed workflow. A
protected GitHub environment may be added when repository administration and
release policy support it, but it is not required to bootstrap publication.
The workflow needs `contents: read` and `id-token: write`; it does not need
repository write access.

## Authentication

The first publication uses the existing `MIDNIGHTCI_NPMJS_TOKEN`, matching the
working `midnight-did` npmjs release path. That token must be a granular
read/write token with bypass 2FA enabled and only the `@midnight-ntwrk` package
permissions needed for this release.

`@midnightntwrk/mn-sre` owns token creation, rotation, and revocation. Never
place a token in repository files, workflow inputs, command arguments,
artifacts, or logs. After the first release, configure npm trusted publishing
for `midnightntwrk/midnight-verifiable-credentials` and
`.github/workflows/publish.yml`, then remove the token fallback when
organization policy permits.

npm trusted publishing requires npm 11.5.1 or newer and Node.js 22.14.0 or
newer. The workflow uses the repository's Node.js 24 baseline and rejects an
older npm CLI before any release work begins.

npm OIDC currently authorizes publication but not separate `dist-tag` or
`access` commands. The normal path therefore sets access and the intended tag
on `npm publish`. Per npm's dist-tag contract, `--tag rc` applies `rc` instead
of `latest`, including on the first publication. The workflow snapshots and
verifies `latest` independently and fails closed when registry metadata cannot
be read. An idempotent rerun is a no-op when that tag is already correct; an
actual tag repair requires the scoped token or an authenticated release
operator. See the
[npm trusted-publishing limitations](https://docs.npmjs.com/trusted-publishers/#limitations-and-future-improvements).

## Release gates

Before dispatch:

1. Confirm the release PR is merged to the intended branch and CI is green.
2. Confirm `workspace-catalog.mjs --publishable-paths` lists only approved
   reusable packages.
3. Confirm the package changelog, support policy, and version are current.
4. Confirm `MIDNIGHTCI_NPMJS_TOKEN` is available to this repository and has
   the required npm scope permissions.
5. Confirm the requested version does not already contain different bytes.

The workflow reruns `./run.sh --light`, deterministic pack checks, local
clean-consumer tests, SBOM generation, and provenance publication. It uploads
the tested tarballs and SPDX SBOMs as a 90-day GitHub Actions artifact.

## First release

Dispatch `Publish npmjs Packages` from `develop` with:

```text
channel: rc
version: 0.1.0
rc_index: 1
```

The expected version is `0.1.0-rc1` under the `rc` dist-tag. The workflow
preserves an existing `latest` tag and fails if npm changes `latest` during a
prerelease.

Source manifests retain the base `0.1.0` version. The workflow applies the
channel suffix only to its ephemeral release checkout, so the changelog names
the externally visible `0.1.0-rc1` while the reviewed source stays ready for
the next channel dispatch.

Branch rules are fail closed:

- `snapshot`: `develop` only
- `rc`: `develop` or `main`
- `release`: `main` only

Automatic publication on pushes is intentionally disabled.

## Verification

The workflow waits for bounded npmjs propagation, installs each exact package
version into a fresh temporary project, rejects local locators, and runs the
cataloged Node, TypeScript, browser, and applicable Compact checks.

For the first release, verify:

```bash
npm view @midnight-ntwrk/credential-model@0.1.0-rc1 version
npm view @midnight-ntwrk/credential-model dist-tags --json
```

The `rc` tag must resolve to `0.1.0-rc1`. `latest` must be absent or unchanged.
Retain the workflow URL and release-evidence artifact with the release record.

## Retry and rollback

npm package versions are immutable. A rerun skips an existing exact version.
It is a no-op when the requested dist-tag is already correct and repairs only
that tag when scoped token authentication is available. Never unpublish a
consumed release as a routine rollback.

For a bad RC:

1. Move or remove the `rc` tag so new consumers cannot select it.
2. Deprecate the bad immutable version with a concise migration message.
3. Fix the source and publish the next RC index.
4. Record the affected version, workflow run, impact, and corrective action.

Example operator commands:

```bash
npm dist-tag rm @midnight-ntwrk/credential-model rc
npm deprecate @midnight-ntwrk/credential-model@0.1.0-rc1 "Use the replacement RC"
```

Do not move `latest` during RC rollback.

## Incident response

For suspected token, workflow, provenance, or tarball compromise:

1. Stop or reject pending jobs in the `npmjs` environment.
2. Revoke the npm token or trusted-publisher binding.
3. Remove affected moving tags without deleting evidence.
4. Preserve workflow logs, uploaded tarballs, SBOMs, provenance, and npm
   metadata.
5. Notify `@midnightntwrk/mn-sre`, the technical owner, and the security
   channel defined in `SECURITY.md`.
6. Publish a corrected version only after the source commit and evidence have
   been independently verified.
