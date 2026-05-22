# University Improvement Backlog

Status: university-focused expansion for current `origin/develop`.
Last audited: 2026-05-21.

The large university runtime/backend port is merged. Current university work is
no longer about proving that the scenario can run; it is about making the flow
simpler to maintain, easier for humans to read, and easier for tools to consume.

This file expands the university-related slices in
[`repository-audit-backlog.md`](./repository-audit-backlog.md). It is not an
independent PR queue; the repository audit backlog remains the scheduling
authority.

## Current Baseline

Current `develop` includes:

- readable 10-student university BDD lane
- standalone-hybrid backend seam for real standalone DID bootstrap timing
- proof-server DTO recording lane
- DID-aware transcript DTOs for students, issuer, companies, and mall verifier
- application decision export artifacts
- university data-profile, policy-catalog, batch-sweep, protocol-export,
  cohort, stress, and summary lanes

## University Expansion

Each entry below expands the canonical slug in
[`repository-audit-backlog.md`](./repository-audit-backlog.md); do not schedule
these as a separate stack.

1. Expansion for `university-flow-file-split`
   - split large protocol/scenario files by actor and phase
   - keep DTO logging, runtime backend seams, policy decisions, and assertions in
     separate modules
   - validation: `./run.sh university-protocol --light`,
     `./run.sh university-protocol-export --light`, protocol package tests

2. Expansion for `bdd-summary-first-output`
   - make compact JSON/Markdown summaries the default local inspection surface
   - keep full Serenity HTML for report/publish lanes
   - 2026-05-22: `codex/vc-university-bdd-insight-helpers` adds a reusable
     `midnight-university-step-insight.v1` support shape and contract check so
     step notes stay summary-first without duplicating Serenity log wiring in
     every step definition
   - validation: `./run.sh university-bdd`, `./run.sh university-summary`

3. Expansion for `university-stakeholder-language-pass`
   - remove low-level schema names from feature text where possible
   - keep roots, DID method refs, credential DTOs, and proof details in step
     notes and artifacts
   - validation: `./run.sh university-bdd`, `npm run docs:links`

The following entries are university-only follow-ons that are not yet scheduled
as parent queue items. Promote them into the repository audit backlog when one
becomes part of a stackable PR.

4. University-only follow-on: `university-operator-doc-generation`
   - generate or validate operator guide command tables from the same lane matrix
     used by CI checks
   - 2026-05-22: `codex/vc-university-operator-lane-docs` generates the
     operator guide execution-lane table from the university CI matrix and
     extends `npm run check:university-ci-matrix` so local runbook commands,
     outputs, and "when to run" guidance cannot drift from CI lane metadata
   - validation: `npm run check:university-ci-matrix`, `npm run docs:links`

5. University-only follow-on: `university-report-surface-slimming`
   - reduce overlapping report artifacts to one human handoff and one tool
     handoff where possible
   - 2026-05-22: `codex/vc-university-report-handoff-contract` adds a checked
     reporting-package handoff contract naming `summary.md` as the primary
     human surface, `summary.json` as the primary tool surface, and
     `artifact-manifest.json` as the source-evidence index
   - 2026-05-22: `codex/vc-university-report-schema-contract` adds the
     versioned `midnight-university-report-summary.v5` contract object and
     contract validator for handoff artifacts, source artifacts, transcript
     schema, and required privacy-profile sections
   - 2026-05-22: `codex/vc-university-report-contract-runner` exposes that
     contract through `./run.sh university-report-contract`, the run-target
     catalog, and the generated university CI/operator matrix
   - validation: reporting package tests, `./run.sh university-summary`,
     `./run.sh university-report-contract`, `npm run check:run-target-contract`,
     and `npm run check:university-ci-matrix`

6. University-only follow-on: `university-negative-flow-triage`
   - move low-level tampering checks into protocol tests when they read like
     schema fuzzing rather than stakeholder scenarios
   - keep BDD negative flows focused on user-visible decisions and rejections
   - validation: protocol negative tests plus `./run.sh university-bdd`

7. University-only follow-on: `university-backend-mode-clarity`
   - keep simulator, proof-server DTO recording, and standalone-hybrid modes
     clearly labeled
   - avoid implying proof-server DTO recording is full networked proof execution
   - validation: docs links and lane smoke tests

8. University-only follow-on: `university-data-fixture-lifecycle`
   - keep readable, cohort, and stress fixture generation/check scripts aligned
   - 2026-05-22: `codex/vc-university-data-profile-runbook` adds generated
     `data-profiles.md` documentation plus profile lifecycle checks for batch
     coverage, company assignments, discount applicant grades, and eligibility
     expectations across readable, cohort, and stress fixtures
   - 2026-05-22: `codex/vc-university-data-profile-validator-tests` adds
     focused bad-fixture validator tests for batch coverage, duplicate
     membership, company assignment, diploma-claim IDs, discount applicants,
     final grades, and eligibility drift
   - validation: `./run.sh university-data-profiles`,
     `./run.sh university-protocol-cohort --light`,
     `./run.sh university-protocol-stress --light`

9. University-only follow-on: `university-policy-preset-deduplication`
   - keep verifier request policies as named presets instead of repeated raw
     payloads
   - 2026-05-22: `codex/vc-university-policy-preset-docs` adds generated
     Markdown documentation for `request-policy-presets.json` and checks it
     from the university protocol profile lane so named presets remain
     inspectable without hand-maintained policy prose
   - 2026-05-22: `codex/vc-university-policy-rationale-invariants` extends
     the policy-catalog audit so preset rationale fields must correspond to
     fields present in the preset `requestPolicy`, catching stale policy prose
     when a disclosure or threshold field is removed
   - validation: `npm run check:university-request-policy-presets`,
     `./run.sh university-policy-catalog`, protocol tests

10. Expansion for `age-gate-bdd-style-alignment`
   - either bring age-gate BDD notes/artifacts closer to university style or
     state that age-gate remains the smaller smoke scenario
   - 2026-05-22 follow-up branch:
     `codex/vc-age-gate-bdd-narrative-catalog`
   - keeps age-gate as the smaller smoke scenario, but moves its scenario
     narration and summary DTO projection into a checked support catalog so it
     follows the same report-note discipline as the university scenarios
   - validation: `./run.sh bdd`, `./run.sh bdd-negative`,
     `./run.sh university-bdd`

11. University-only follow-on: `university-commitment-backed-privacy`
   - make it explicit that the current diploma family is a direct-claim
     prototype: the raw academic facts are present in `credential.claims`
   - clarify that current `reveal*` flags enforce verifier request policy and
     signed presentation authorization, not credential-body secrecy
   - migrate stable identifiers and sensitive academic facts into
     `claimCommitments` before treating the family as production privacy work
   - validation: university credential-family tests, university protocol tests,
     `./run.sh university-bdd`
   - 2026-05-22: `codex/vc-university-report-privacy-profile` projects the
     transcript privacy profile into the aggregate one-page university report
     so operators can inspect the direct-claim prototype boundary and
     production commitment profile from `./run.sh university-summary`
   - 2026-05-22 follow-up branch:
     `codex/vc-university-report-schema-contract`
   - exports a checked `UNIVERSITY_REPORT_SUMMARY_CONTRACT`, adds a package
     contract-printing script, and validates the v5 handoff/source-artifact and
     transcript privacy-profile expectations with actionable error names

## Human-Readability Rule

Feature files should describe actors, intentions, outcomes, and decisions.
DTOs, DIDs, claim roots, method references, credential envelopes, presentation
payloads, and proof details should remain inspectable through notes and
artifacts, not forced into every Gherkin sentence.
