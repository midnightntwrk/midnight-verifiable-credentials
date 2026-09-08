# ADR-0009: Verifiable release evidence

- Status: Accepted
- Date: 2026-07-16
- Updated: 2026-09-09
- Owners: VC maintainers and security owners

## Context

Building an npm tarball does not make it a supported public release. Consumers
need to identify the source, workflow, dependencies, and exact artifact they
are installing. Vulnerability suppressions also need accountable, temporary
risk acceptance rather than permanent inline ignores.

## Decision

1. Security workflows cover integration, release, and default branches and run
   on a schedule where the scanner supports it.
2. GitHub Actions are pinned to immutable commit SHAs.
3. Supported packages are published only by the reviewed manual workflow with
   npm provenance, an SBOM, immutable versions, and verified dist-tags.
4. The release gate packs the declared package allowlist and validates those
   exact tarballs in clean consumers outside the workspace.
5. Vulnerability exceptions require a linked record containing the advisory,
   affected versions, rationale, compensating controls, owner, and an expiry no
   later than 30 days. Critical exceptions require security-owner approval.
6. A suspected compromise freezes affected publication. Maintainers preserve
   evidence, rotate exposed credentials, deprecate affected versions, publish
   a corrected immutable version, and notify known consumers.

The executable policy lives in the security workflows, release scripts,
`osv-scanner.toml`, and
[`docs/security/vulnerability-exceptions.md`](../security/vulnerability-exceptions.md).
The complete package lifecycle is defined by the
[package release contract](../architecture/package-release-contract.md).

## Consequences

- Release evidence is checked by automation rather than inferred from a tag.
- Exceptions expire and remain visible to maintainers and consumers.
- Published versions are never overwritten or silently repaired in place.
- Repository or organization settings that enforce branch reviews remain
  external configuration and must match the documented workflow names.
