# Midnight VC Repository Audit Backlog

Status: historical May 2026 simplification audit. Remaining production work is
owned by [`vc-maturity-backlog.md`](./vc-maturity-backlog.md).
Last audited: 2026-05-21.

This document is retained for delivery traceability. It no longer owns the
active repository execution queue. Open findings must be reconciled into the
canonical production backlog before implementation.

## Current Baseline

The `develop` branch already includes the first runner/catalog/artifact wave:

- checked runner target catalog
- checked managed-artifact catalog
- `./run.sh clean-artifacts`
- `./run.sh integration-report`
- `./run.sh check-integration`
- university lane matrix checks
- DID/VC integration mode reporting
- readable university BDD and transcript/reporting foundations
- backlog collapse into this repository-audit authority plus narrow maturity and
  university index files
- pre-collapse backlog history archived under
  [`docs/plans/archive/2026-05-20-backlog-collapse`](./archive/2026-05-20-backlog-collapse/)

The current audit therefore focuses on simplifying what remains, deleting dead
surfaces, reducing duplicate catalogs, and making university/use-case paths more
human-readable.

`./run.sh clean-artifacts` is the developer-facing wrapper for
`pnpm run clean:artifacts`; both surfaces resolve to the same cleanup script.
Dry-run JSON is available through both
`./run.sh clean-artifacts -- --dry-run --json` and
`pnpm run clean:artifacts -- --dry-run --json`.
CHANGELOG/release-note discipline remains release-management work and is not part
of this simplification stack.

## Queue Authority

This file owns the active VC execution queue. The university backlog file is a
per-use-case expansion of the university-related slices here, not an independent
PR sequence. The maturity backlog file is a status index only.

## Where Status And Revocation Live

Status and revocation work should start from these entry points:

- [`docs/guides/status-revocation-entrypoints.md`](../guides/status-revocation-entrypoints.md)
- [`docs/spec/credential-status.md`](../spec/credential-status.md)
- [`docs/spec/revocation-registry.md`](../spec/revocation-registry.md)
- [`docs/spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)
- [`packages/registry/status-registry`](../../packages/registry/status-registry)

DID package integration work should start from:

- [`docs/guides/did-integration-modes.md`](../guides/did-integration-modes.md)
- `./run.sh integration-report`
- `./run.sh check-integration`
- `pnpm run check:did-integration`

## Audit Findings

### Strengths

- VC/VP claim representation is coherent:
  `VC<TPublicClaims, TClaimCommitments, THolderBinding, TStatusBinding>`.
- Runner help lists a broad target set and says which targets support
  `--light`.
- Status/revocation direction is documented as verifier-supplied root with
  fail-closed checks.
- University BDD now exposes DTO notes and transcript artifacts instead of only
  raw Serenity output.
- Package-boundary, CI cone, workflow-cone, managed-artifact, DID integration,
  workspace-manifest, holder-binding, and university-matrix checks exist.

### Remaining Gaps

- Root `package.json` still repeats large cone/workspace command lists:
  `root-script-cone-deduplication`.
- CI change classification and local runner catalogs are still parallel maps:
  `runner-catalog-authority` and `ci-change-classification-catalog`.
- Some top-level compatibility shells/symlinks need an explicit lifecycle or
  removal decision: `dead-top-level-shell-removal`,
  `compatibility-alias-lifecycle`, and `legacy-wrapper-runner-flattening`.
- Some generated/test artifact directories are still outside cleanup coverage:
  `cleanup-artifact-coverage`.
- University scenario/protocol files are large and mix stakeholder language with
  low-level DTO/schema names: `university-flow-file-split`,
  `bdd-summary-first-output`, and `university-stakeholder-language-pass`.
- Backlog/plans docs overlap and still describe completed work as active:
  resolved by this 2026-05-20 backlog collapse; future drift is tracked through
  the status/revocation and DID-integration entrypoint guides plus archive link
  checks.

### External Review Addendum, 2026-05-21

The supplied credential-review notes were triaged in
[`external-review-triage-2026-05-21.md`](./external-review-triage-2026-05-21.md).
They add four review-driven backlog decisions:

- `schema-capabilities-layering`: schema/family capabilities must be schema
  metadata, not trusted per-protocol-message booleans.
- `schema-family-resolution-hints`: generic wallets need an adapter-level way to
  resolve credential-family handlers from `SchemaRef` identities.
  - 2026-05-22: `codex/vc-schema-family-resolution-hints` adds bounded
    resolver-hint helpers and a TypeScript-side reference family adapter
    registry in the protocol orchestration package without expanding canonical
    Compact `SchemaRef`.
- `university-commitment-backed-privacy`: the current university family is a
  direct-claim prototype; `reveal*` flags enforce presentation policy but do not
  hide raw credential-body values.
- `disclosure-shape-guidance`: `Maybe<T>`-style disclosure structs are allowed
  for new families when useful, but existing `reveal*` structs should not churn
  for style only.

## Top 20 Simplification Backlog Items

1. `dead-top-level-shell-removal`
   - remove or formally justify empty legacy top-level package shells and empty
     artifact/test directories
   - include cleanup of stale review artifacts through `.gitignore`, not
     committed files
   - example shell to classify first: top-level empty `libs`
   - do not remove live `midnight-did-credentials*` symlink aliases under this
     item; those are covered by `compatibility-alias-lifecycle`

2. `compatibility-alias-lifecycle`
   - decide whether top-level `midnight-did-credentials*` symlinks are official
     developer aliases or removable compatibility residue
   - document and guard the lifecycle in install/cleanup scripts
   - report alias health through `pnpm run check:did-integration`,
     `./run.sh integration-report`, and `./run.sh check-integration`

3. `missing-ci-script-repair`
   - verify all scripts referenced by workflows exist in root `package.json`
   - add or rename any missing university/profile scripts and cover them with
     workflow-cone checks

4. `runner-catalog-authority`
   - make the runner target catalog the source of truth for target names,
     light-mode support, prerequisite profiles, and CI mapping

5. `root-script-cone-deduplication`
   - replace repeated `lint`, `typecheck`, `build`, `test`, `from-artifacts`,
     and CI script cone lists with generated or validated command fragments

6. `ci-change-classification-catalog`
   - move GitHub Actions docs-only/BDD/heavy-lane path patterns into a checked
     catalog that aligns with package cones and runner targets

7. `managed-artifact-freshness-manifest`
   - move beyond presence/mtime probes and track source hash, Compact compiler,
     runtime guard, and generator version per managed artifact profile

8. `ci-cone-artifact-profile-unification`
   - unify CI build output groups and local managed-artifact profiles instead of
     maintaining shell and JS maps separately

9. `legacy-wrapper-runner-flattening`
   - retire or flatten `run-credentials.sh` and
     `run-credentials-standalone.sh` after runner/npm script mapping is
     authoritative

10. `did-integration-mode-docs`
    - document supported DID integration modes: vendored tarballs, sibling
      checkout inspection, and published package consumption
    - include repair flow and examples from `./run.sh integration-report`

11. `standalone-environment-package-policy`
    - decide whether `packages/components/integration/standalone-environment`
      is strictly private/test-only or a distributable helper package
    - align `exports`, `files`, `main`, and prehook scripts accordingly

12. `cleanup-artifact-coverage`
    - keep generated/test directories such as `.midnight-test` covered by
      cleanup scripts while preserving fixture data and vendor tarballs
    - keep dry-run JSON available through
      `./run.sh clean-artifacts -- --dry-run --json`

13. `turbo-cache-input-hardening`
    - strengthen `turbo.json` inputs and cache policy so source, Compact, and
      manifest drift invalidates the right tasks without bloating CI runtime

14. `ci-setup-action-consolidation`
    - extract repeated Compact/Node/npm workflow setup into a composite action
      or reusable workflow

15. `university-flow-file-split`
    - split large university protocol/scenario/support files by actor, phase,
      DTO logging, policy, and assertion concern

16. `bdd-summary-first-output`
    - make compact JSON/Markdown handoff summaries the default local
      inspection surface; keep full Serenity HTML for publish/report lanes

17. `university-stakeholder-language-pass`
    - keep feature files readable by humans and move schema names, roots, and
      DTO field names into step notes/artifacts

18. `age-gate-bdd-style-alignment`
    - bring age-gate BDD up to the university instrumentation style or
      explicitly document the lighter smoke-test role
    - 2026-05-22 follow-up branch:
      `codex/vc-age-gate-bdd-narrative-catalog`
    - centralizes age-gate request/response/check narration and DTO projection
      in a checked scenario-reporting catalog so feature text remains compact
      while Serenity notes still expose explicit-holder and hidden-holder
      result details

19. `status-revocation-entrypoint-map`
    - keep status/revocation spec and package entry points discoverable from
      the active backlog
    - prevent future backlog refreshes from hiding verification and registry
      docs

20. `prototype-graduation-policy`
    - classify credential-family packages as reference, lab, demo, prototype,
      or publishable
    - add package README maturity tags and enforce them through workspace
      manifest checks
    - 2026-05-22 delivery branch:
      `codex/vc-package-maturity-policy`
    - workspace package manifests now carry checked `midnight.maturity` and
      `midnight.packageClass` metadata, and each package README repeats those
      tags for human review

## First 10 PR Slices

These are ordered for stackable execution. Keep each PR large enough to be
useful, but stop the stack if a base PR fails CI for a real reason. The
2026-05-20 ordering principle is foundation cleanup first, then runner/catalog
authority, artifact freshness, standalone policy, cache hardening, university
file splits, BDD readability, and maturity tags.

1. `vc-repo-hygiene-dead-surface`
   - covers `dead-top-level-shell-removal`, `missing-ci-script-repair`,
     `cleanup-artifact-coverage`, and the safe parts of
     `compatibility-alias-lifecycle`
   - validation: `git diff --check`, `pnpm run check:workspace-manifests`,
     `pnpm run check:run-target-catalog`, `pnpm run check:ci-workflow-cones`,
     `./run.sh --light` as the safety smoke that cleanup did not break the
     light lane

2. `vc-status-revocation-entrypoints`
   - covers `status-revocation-entrypoint-map` and keeps the active backlog,
     maturity index, README, and status/revocation specs mutually discoverable
   - 2026-05-21 delivery branch:
     `codex/vc-status-did-integration-entrypoints`
   - validation: `git diff --check`, `pnpm run docs:links`

3. `vc-did-integration-docs`
   - covers `did-integration-mode-docs` and the documented lifecycle for aliases
     from `compatibility-alias-lifecycle`
   - 2026-05-21 delivery branch:
     `codex/vc-status-did-integration-entrypoints`
   - validation: `./run.sh integration-report`, `./run.sh check-integration`,
     `pnpm run docs:links`

4. `vc-runner-catalog-authority`
   - covers `runner-catalog-authority`, `root-script-cone-deduplication`,
     `ci-change-classification-catalog`, and
     `legacy-wrapper-runner-flattening` after runner/npm mapping becomes
     authoritative
   - 2026-05-21 delivery branch:
     `codex/vc-runner-catalog-authority`
   - centralizes runner target script metadata, CI build-cone package/output
     lists, root `build:cone:*` commands, and workflow change-classification
     patterns in checked tooling catalogs
   - validation: `pnpm run check:run-target-catalog`,
     `pnpm run check:ci-build-cones`, `pnpm run check:ci-workflow-cones`,
     `./run.sh targets`

5. `vc-managed-artifact-freshness`
   - covers `managed-artifact-freshness-manifest` and
     `ci-cone-artifact-profile-unification`
   - 2026-05-22 delivery branch:
     `codex/vc-managed-artifact-freshness`
   - managed-artifact profiles now derive package groups from the checked CI
     build-cone catalog, so local readiness checks and GitHub artifact lanes use
     the same package ownership source
   - validation: `pnpm run check:managed-artifact-catalog`,
     `./run.sh typecheck --light`, `./run.sh build --light`

6. `vc-standalone-package-policy`
   - covers `standalone-environment-package-policy`
   - 2026-05-22 delivery branch:
     `codex/vc-standalone-package-policy`
   - keeps `standalone-environment` explicitly private/source-only, removes the
     misleading `prepack` distribution hook, and extends workspace-manifest
     checks so the harness cannot grow a dist/publish surface by accident
   - validation: `./run.sh integration-demo-contract`,
     `./run.sh integration-protocol` when Docker is available

7. `vc-turbo-cache-hardening`
   - covers `turbo-cache-input-hardening`
   - 2026-05-22 delivery branch:
     `codex/vc-turbo-cache-hardening`
   - adds checked Turbo global invalidators for workflow/tooling drift,
     Compact compiler version cache keys, explicit task env keys, and a
     `check:turbo-cache-policy` guard wired into `ci:lint`
   - validation: `./run.sh --light`, CI wall-clock observation

8. `vc-university-flow-split`
   - covers `university-flow-file-split`
   - 2026-05-22 delivery branch:
     `codex/vc-university-flow-split`
   - moves pure university flow result aggregation from the runner into
     `flow-result-builder.ts`, reducing the runner's responsibility to actor
     setup, phase execution, restart simulation, and message delivery
   - `codex/vc-university-checkpoint-split` continues this by moving restart
     checkpoint state decoding and summary projection into
     `flow-checkpoint-state.ts`
   - validation: `./run.sh university-protocol --light`,
     `./run.sh university-protocol-export --light`, package tests

9. `vc-university-bdd-language-pass`
   - covers `bdd-summary-first-output` and
     `university-stakeholder-language-pass`
   - 2026-05-22 delivery branch:
     `codex/vc-university-bdd-insight-helpers`
   - moves Serenity step-insight serialization into a reusable support module
     with a checked `midnight-university-step-insight.v1` report shape, keeping
     scenario steps focused on stakeholder intent while DTO details stay in
     report artifacts
   - validation: `./run.sh university-bdd`, `./run.sh university-summary`

10. `vc-bdd-style-alignment-and-prototype-tags`
    - covers `age-gate-bdd-style-alignment` and
      `prototype-graduation-policy`
    - 2026-05-22 delivery branch:
      `codex/vc-age-gate-bdd-insights`
    - aligns age-gate Serenity logs with the university
      request/response/check/DTO insight pattern and documents the current
      prototype credential-family maturity table at the prototypes root
    - 2026-05-22 follow-up branch:
      `codex/vc-age-gate-bdd-narrative-catalog`
    - extracts the age-gate insight narratives and summary DTO builders from
      task orchestration into `features/support/age-gate-reporting.ts`, then
      extends the step-insight contract check to lock the full scenario catalog
    - validation: `./run.sh bdd`, `./run.sh bdd-negative`,
      `pnpm run check:workspace-manifests`, `pnpm run check:vc-surface-discipline`,
      `pnpm run docs:links`

11. `vc-bdd-summary-first-output`
    - covers `bdd-summary-first-output`
    - 2026-05-22 delivery branch:
      `codex/vc-bdd-summary-first-output`
    - emits Cucumber JSON during BDD execution, then writes compact
      `target/summary.json` and `target/summary.md` artifacts from the shared
      BDD support package before the heavier Serenity HTML aggregation step
    - validation: `pnpm --dir ./packages/use-cases/bdd-support`, run test:ci
      `pnpm run test:bdd:smoke`, `pnpm run test:bdd:university`,
      `pnpm run docs:links`

12. `vc-bdd-summary-ci-artifacts`
    - covers the CI-retention follow-up for `bdd-summary-first-output`
    - 2026-05-22 delivery branch:
      `codex/vc-bdd-summary-ci-artifacts`
    - runs both age-gate smoke and university BDD in the focused BDD-only CI
      lane, uploads Cucumber JSON plus `summary.json`/`summary.md` files under
      `bdd-summary-artifacts`, and adds a guard so future workflow edits do not
      drop the compact report handoff
    - validation: `pnpm run check:bdd-summary-artifacts`,
      `pnpm run check:ci-workflow-cones`, `pnpm run docs:links`

13. `vc-ci-setup-action-consolidation`
    - covers `ci-setup-action-consolidation`
    - 2026-05-22 delivery branch:
      `codex/vc-ci-setup-action-consolidation`
    - extracts repeated Node/npm/Turbo and prepared Compact-toolchain restore
      blocks into local composite actions, then extends the workflow-cone guard
      so direct setup blocks do not drift back into the primary CI workflow
    - validation: `pnpm run check:ci-workflow-cones`,
      `pnpm run check:bdd-summary-artifacts`, `git diff --check`

## Review-Driven Stack Additions

These additions come from the 2026-05-21 external review triage and should be
stacked after `vc-repo-hygiene-dead-surface` unless a lower-level CI failure
forces a stop.

1. `vc-review-schema-capabilities`
   - covers `schema-capabilities-layering`,
     `schema-family-resolution-hints`, and `disclosure-shape-guidance`
   - validation: `git diff --check`, `pnpm run docs:links`,
     `pnpm run check:vc-surface-discipline`

2. `vc-protocol-feature-hint-deprecation`
   - moves authoritative capability reads away from issue/present protocol
     `features` fields
   - centralizes reference agent schema descriptors so compatibility feature
     hints are derived from schema capabilities
   - keeps compatibility fields only where existing generated surfaces require
     them during the migration
   - 2026-05-22 delivery branch:
     `codex/vc-protocol-feature-hint-naming`
   - renames reference-agent feature constants and helpers to compatibility
     hint terminology and extends `check:vc-surface-discipline` so
     authority-looking protocol-feature names do not return
   - validation: focused credential primitive tests, orchestration protocol
     tests, `./run.sh --light`

3. `vc-university-privacy-hardening-plan`
   - covers `university-commitment-backed-privacy` as a plan/spec/test-warning
     slice before changing the family surface
   - adds direct-claim privacy-boundary tests and a migration plan for a future
     commitment-backed diploma family
   - validation:
     `pnpm --dir ./packages/prototypes/credential-families/university-diploma`, run test:ci
     `./run.sh university-bdd`, `pnpm run docs:links`

4. `vc-university-commitment-backed-diploma`
   - starts the production privacy migration by adding an additive Compact and
     fixture-backed field split:
     `UniversityDiplomaProductionPublicClaims`,
     `UniversityDiplomaClaimCommitments`, per-field commitment helpers, and a
     domain-separated production claim root
   - leaves the existing readable v1 BDD/protocol alias unchanged
   - follow-up slices add verifier-facing openings, predicates, and protocol DTO
     reporting over the committed profile
   - 2026-05-22 delivery branch:
     `codex/vc-university-production-credential-alias`
   - adds the additive `UniversityDiplomaProductionCredential` v2 alias,
     production fixture, proof validation helper, and drift tests proving
     committed academic values are outside `credential.claims`
   - 2026-05-22 follow-up branch:
     `codex/vc-university-production-openings`
   - adds the additive `UniversityDiplomaProductionPresentation` and
     production request/disclosure validators so verifier-facing raw values must
     open to the signed `claimCommitments` before request policy checks use
     them
   - 2026-05-22 follow-up branch:
     `codex/vc-university-production-predicate-witnesses`
   - adds additive final-grade and credits-earned predicate witness helpers so
     production verifier policies can prove thresholds against committed values
     without requiring those raw values in the production disclosure payload
   - 2026-05-22 follow-up branch:
     `codex/vc-university-production-profile-surface`
   - promotes the university production privacy-profile metadata out of
     fixture-only testing helpers into the public `./privacy-profile` package
     surface so protocol/reporting code can describe the v2 profile without
     importing test builders
   - 2026-05-22 follow-up branch:
     `codex/vc-university-transcript-privacy-profile`
   - consumes that public metadata surface from the university protocol
     transcript exporter and adds compact JSON/Markdown profile handoff fields
     for report readers
   - 2026-05-22 follow-up branch:
     `codex/vc-university-report-privacy-profile`
   - projects the same transcript privacy-profile metadata into the one-page
     university reporting summary so operators can inspect the direct-claim
     prototype boundary and production commitment-profile guidance without
     opening the full transcript artifact
   - 2026-05-22 follow-up branch:
     `codex/vc-university-report-schema-contract`
   - adds a versioned report-summary contract object, a package script to print
     it, and contract validation for handoff artifacts, source artifacts,
     transcript schema, and non-empty privacy-profile arrays
   - 2026-05-22 follow-up branch:
     `codex/vc-university-report-contract-runner`
   - exposes the report-summary contract through the root
     `./run.sh university-report-contract` target, the run-target catalog, and
     the generated university operator/CI matrix so schema drift checks have a
     single discoverable entry point
   - validation: university credential-family tests, university protocol tests,
     university reporting tests, `./run.sh university-bdd`,
     `./run.sh university-summary`, `./run.sh university-report-contract`,
     `pnpm run check:run-target-contract`, `pnpm run check:university-ci-matrix`,
     `pnpm run docs:links`

## Validation Defaults

Fast docs/backlog slice:

```bash
git diff --check
pnpm run docs:links
pnpm run check:run-target-catalog
pnpm run check:workspace-manifests
```

Fast repository slice:

```bash
git diff --check
pnpm run check:package-boundaries
pnpm run check:ci-build-cones
pnpm run check:ci-workflow-cones
pnpm run check:managed-artifact-catalog
pnpm run check:did-integration
pnpm run check:vc-surface-discipline
pnpm run check:holder-binding-terminology
./run.sh --light
```

University slice:

```bash
pnpm run check:university-ci-matrix
pnpm run check:run-target-contract
./run.sh university-data-profiles
./run.sh university-policy-catalog
./run.sh university-protocol --light
./run.sh university-protocol-export --light
./run.sh university-report-contract
./run.sh university-bdd
```

Standalone/integration slice:

```bash
./tooling/scripts/cleanup-test-infra.sh
PROOF_SERVER_IMAGE=proof-server-bootstrap:8.0.3 ./run.sh integration-demo-contract
PROOF_SERVER_IMAGE=proof-server-bootstrap:8.0.3 ./run.sh integration-protocol
```

## Do Not Touch Without Explicit Scope

- generated `src/managed/**`, `dist/**`, Serenity `target/**`, report output,
  and vendored tarballs
- `NightFi` and `arc-passport` from the identity workspace
- core VC envelope generic shape unless the PR is explicitly a protocol surface
  change
- status/revocation semantics without dedicated security review
- Compact include composition broadly without package-surface tests
- standalone integration by reaching into a sibling DID checkout instead of
  using supported package/vendor paths.
