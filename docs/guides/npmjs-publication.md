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

The normal release workflow uses npm trusted publishing through GitHub OIDC.
It does not receive a long-lived npm token. Each publish runs in the protected
`npm-release` GitHub environment and requests `id-token: write` only for the
publishing job.

An npm owner must configure a trusted publisher on all supported packages
with these exact values:

| Setting | Value |
| --- | --- |
| Organization | `midnightntwrk` |
| Repository | `midnight-verifiable-credentials` |
| Workflow filename | `publish.yml` |
| Environment | `npm-release` |
| Allowed action | `npm publish` |

The GitHub environment should require the designated release reviewers and
permit only the repository release branches. `@midnightntwrk/mn-sre` owns the
npm trusted-publisher bindings and incident response. Never place a token in
repository files, workflow inputs, command arguments, artifacts, or logs.

npm trusted publishing requires npm 11.5.1 or newer and Node.js 22.14.0 or
newer. The workflow uses the repository's Node.js 24 baseline and rejects an
older npm CLI before any release work begins.

npm OIDC authorizes publication but not separate `dist-tag` or `access`
commands. The normal path therefore applies public access and the intended tag
as options to `npm publish` and performs no separate authenticated mutation.
By default, `--tag rc` applies `rc` and preserves `latest`. Only a stable
release may move `latest`.
The workflow snapshots and verifies the selected tag policy independently and
fails closed when registry metadata cannot be read. A tokenless idempotent
rerun is a no-op when the immutable version and requested tag already exist.
If the version exists under the wrong tag, the workflow stops and reports that
a separately authorized maintenance operation is required. See the
[npm trusted-publishing limitations](https://docs.npmjs.com/trusted-publishers/#limitations-and-future-improvements).

## Release gates

Before dispatch:

1. Confirm the release PR is merged to the intended branch and CI is green.
2. Confirm `workspace-catalog.mjs --publishable-paths` lists only approved
   reusable packages.
3. Confirm the package changelog, support policy, and version are current.
4. Confirm all packages have the exact npm trusted-publisher configuration
   above and the `npm-release` GitHub environment is protected.
5. Confirm the requested version does not already contain different bytes.

The workflow reruns `./run.sh --light`, validates the packed release contents,
runs local clean-consumer tests, generates SBOMs, and publishes with provenance. It uploads
the tested tarballs and SPDX SBOMs as a 90-day GitHub Actions artifact.

## Prerelease publication

Set the root and supported package manifests to the version approved by the
release PR, then dispatch `Publish npmjs Packages` from `develop`. For example:

```text
channel: rc
rc_index: 2
```

The current release graph publishes three packages under the `rc` dist-tag:

- `@midnight-ntwrk/credential-model`
- `@midnight-ntwrk/credential-compact`
- `@midnight-ntwrk/credential-did-midnight`

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
VERSION=0.2.0-rc2
for package in \
  @midnight-ntwrk/credential-model \
  @midnight-ntwrk/credential-compact \
  @midnight-ntwrk/credential-did-midnight; do
  npm view "${package}@${VERSION}" version
  npm view "${package}" dist-tags --json
done
```

The `rc` tag must resolve to `${VERSION}` for all packages and `latest` must
remain unchanged. Retain the workflow URL and release-evidence artifact with
the release record.

## Retry and rollback

npm package versions are immutable. A rerun skips an existing exact version.
It is a no-op when the requested dist-tag is already correct. A mismatched tag
requires a separate, human-authorized npm maintenance operation because OIDC
does not authorize `npm dist-tag`. Never unpublish a consumed release as a
routine rollback.

A successful `npm publish` response means npm accepted the mutation, but the
new version may remain temporarily absent from registry reads. If the workflow
times out after publication, do not immediately rerun the publishing job.
Preserve the run evidence and repeat the read-only verification commands above
until the propagation window has been ruled out. Rerun only after confirming
the exact version is absent; the workflow will otherwise take its idempotent
verification path.

For a bad RC:

1. Move or remove the `rc` tag so new consumers cannot select it.
2. Deprecate the bad immutable version with a concise migration message.
3. Fix the source and publish the next RC index.
4. Record the affected version, workflow run, impact, and corrective action.

Example operator commands:

```bash
VERSION=0.2.0-rc2
for package in \
  @midnight-ntwrk/credential-model \
  @midnight-ntwrk/credential-compact \
  @midnight-ntwrk/credential-did-midnight; do
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
