# VC Maturity Backlog

Status: active maturity index for `origin/develop`.
Last audited: 2026-05-21.

This file is a status index only. The active execution queue lives in
[`repository-audit-backlog.md`](./repository-audit-backlog.md).

The original capability backlog is effectively closed on current `develop`.
The current maturity scope is simplification, maintainability, package-boundary
clarity, runner/catalog authority, generated-artifact freshness, and
human-readable use-case reporting.

## Current Direction

Use [`repository-audit-backlog.md`](./repository-audit-backlog.md) as the active
execution queue. It contains the current top 20 backlog items and first 10 PR
slices. Use [`university-improvement-backlog.md`](./university-improvement-backlog.md)
as a university-specific expansion of those slices, not as a competing queue.
Use [`archive/2026-05-20-backlog-collapse`](./archive/2026-05-20-backlog-collapse/)
for the pre-collapse VC-MAT, audit, and PR-number history.

High-level maturity themes:

1. Delete or document dead top-level compatibility surfaces.
2. Make runner targets, root npm scripts, CI cones, and workflow classifiers
   validate against one source of truth.
3. Make managed-artifact reuse fail closed through source/compiler/version
   freshness manifests.
4. Keep DID integration modes explicit and repairable.
5. Keep university BDD readable by humans while retaining detailed DTO logs and
   machine-readable handoff artifacts.
6. Archive completed plans so new contributors do not mistake historical
   backlog text for current work.
7. Move credential-family capabilities into schema metadata and treat protocol
   feature fields as compatibility hints until they are deprecated.
8. Add wallet-friendly family-resolution hints at the adapter/descriptor layer
   without making canonical Compact `SchemaRef` unbounded.
9. Keep prototype privacy boundaries explicit: direct claims are visible to any
   party that receives the credential body, even when presentations gate which
   mirrored fields are shown.

## Current Non-Goals

- Do not reopen the public/direct versus commitment claim-representation model.
- Do not reintroduce nested `publicClaims/privateClaims` wrappers.
- Do not change status/revocation semantics in simplification PRs.
- Do not move VC use cases into `midnight-did`.
- Do not rewrite existing disclosure structs into `Maybe<T>` solely for style.
- Do not treat university direct-claim `reveal*` flags as privacy guarantees;
  production privacy requires commitment-backed fields.

## Recently Completed Baseline

See the `Current Baseline` section in
[`repository-audit-backlog.md`](./repository-audit-backlog.md). This index does
not duplicate that list by design.
