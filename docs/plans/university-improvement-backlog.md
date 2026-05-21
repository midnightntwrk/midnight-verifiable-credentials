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
   - validation: `npm run check:university-ci-matrix`, `npm run docs:links`

5. University-only follow-on: `university-report-surface-slimming`
   - reduce overlapping report artifacts to one human handoff and one tool
     handoff where possible
   - validation: reporting package tests and `./run.sh university-summary`

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
   - validation: `./run.sh university-data-profiles`,
     `./run.sh university-protocol-cohort --light`,
     `./run.sh university-protocol-stress --light`

9. University-only follow-on: `university-policy-preset-deduplication`
   - keep verifier request policies as named presets instead of repeated raw
     payloads
   - validation: `./run.sh university-policy-catalog`, protocol tests

10. Expansion for `age-gate-bdd-style-alignment`
   - either bring age-gate BDD notes/artifacts closer to university style or
     state that age-gate remains the smaller smoke scenario
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

## Human-Readability Rule

Feature files should describe actors, intentions, outcomes, and decisions.
DTOs, DIDs, claim roots, method references, credential envelopes, presentation
payloads, and proof details should remain inspectable through notes and
artifacts, not forced into every Gherkin sentence.
