# npmjs Publication Runbook

This runbook covers public releases of reusable packages from
`midnight-verifiable-credentials`. Concrete credential families, prototypes,
use cases, reporting packages, and integration infrastructure are never part
of this release train.

## Ownership

- Technical package owner: `@midnightntwrk/ex-identus`
- npm credentials and incident owner: `@midnightntwrk/mn-sre`
- Security disclosure and escalation: [`SECURITY.md`](../../SECURITY.md)

## Authentication

The workflow requests npm provenance identity and supplies the
`MIDNIGHTCI_NPMJS_TOKEN` secret to the release script. The token is required
for access and dist-tag operations, must be granular and read/write, and must
be scoped to the required `@midnight-ntwrk` packages.

`@midnightntwrk/mn-sre` owns token creation, rotation, and revocation. Never
place a token in repository files, workflow inputs, command arguments,
artifacts, or logs. After the first release, configure npm trusted publishing
for `midnightntwrk/midnight-verifiable-credentials` and
`.github/workflows/publish.yml`, then remove the token fallback when
organization policy permits.

npm trusted publishing requires npm 11.5.1 or newer and Node.js 22.14.0 or
newer. The workflow uses the repository's Node.js 24 baseline and rejects an
older npm CLI before any release work begins.

npm OIDC authorizes publication but not separate `dist-tag` or `access`
commands. The normal path therefore uses the scoped
`MIDNIGHTCI_NPMJS_TOKEN` for access and tag operations. By default, `--tag rc`
applies `rc` and preserves `latest`. Only a stable release may move `latest`.
The workflow snapshots and verifies the selected tag policy independently and
fails closed when registry metadata cannot be read. An idempotent rerun is a
no-op when the requested tags are already correct. See the
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

The workflow reruns `./run.sh --light`, validates the packed release contents,
runs local clean-consumer tests, generates SBOMs, and publishes with provenance. It uploads
the tested tarballs and SPDX SBOMs as a 90-day GitHub Actions artifact.

## Prerelease publication

Dispatch `Publish npmjs Packages` from the protected `develop` branch with
the version approved by the release PR. For example:

```text
channel: rc
version: 0.2.0
rc_index: 1
```

The current release graph publishes two packages under the `rc` dist-tag:

- `@midnight-ntwrk/credential-model`
- `@midnight-ntwrk/credential-compact`

The workflow preserves an existing `latest` tag and fails if npm changes it
during a prerelease.

Source manifests retain the approved base version. The workflow applies the
channel suffix only to its ephemeral release checkout, so the reviewed source
stays ready for the next channel dispatch.

Branch rules are fail closed:

- `rc`: `develop` or `main`
- `release`: `main` only

Automatic publication on pushes is intentionally disabled.

## Verification

The workflow waits for bounded npmjs propagation, installs each exact package
version into a fresh temporary project, rejects local locators, and runs the
cataloged Node, TypeScript, browser, and applicable Compact checks.

Set `VERSION` to the exact version reported by the workflow, then verify every
package version and the moving tags:

```bash
VERSION=0.2.0-rc1
for package in \
  @midnight-ntwrk/credential-model \
  @midnight-ntwrk/credential-compact; do
  npm view "${package}@${VERSION}" version
  npm view "${package}" dist-tags --json
done
```

The `rc` tag must resolve to `${VERSION}` for both packages and `latest` must
remain unchanged. Retain the workflow URL and release-evidence artifact with
the release record.

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
VERSION=0.2.0-rc1
for package in \
  @midnight-ntwrk/credential-model \
  @midnight-ntwrk/credential-compact; do
  npm dist-tag rm "${package}" rc
  npm deprecate "${package}@${VERSION}" "Use the replacement RC"
done
```

Do not move `latest` during RC rollback.

## Incident response

For suspected token, workflow, provenance, or tarball compromise:

1. Stop or reject pending publish jobs.
2. Revoke the npm token or trusted-publisher binding.
3. Remove affected moving tags without deleting evidence.
4. Preserve workflow logs, uploaded tarballs, SBOMs, provenance, and npm
   metadata.
5. Notify `@midnightntwrk/mn-sre`, the technical owner, and the security
   channel defined in `SECURITY.md`.
6. Publish a corrected version only after the source commit and evidence have
   been independently verified.
