# VC Active Delivery Tracker — 2026-08-14

Status: active operator plan. This file records execution state and links to
canonical GitHub artifacts; it does not redefine the production-readiness
acceptance authority in `vc-maturity-backlog.md`.

Baseline: `origin/develop` at `0192ba65`; plan branch
`codex/vc-delivery-tracker-2026-08-14`.

## Guardrails

- Never merge or make changes on `main`.
- Keep #267/#426 selective-disclosure work isolated from CI/backlog/skill work.
- Reuse an existing linked PR rather than opening a duplicate PR.
- A bot-PR consolidation may contain only reviewed `develop`-target changes;
  it must not absorb `main`-target PRs, unrelated feature work, or unverified
  dependency cohorts.
- Do not merge any PR while its merge state is `UNSTABLE`, `BLOCKED`, `DIRTY`,
  `BEHIND`, or `UNKNOWN`.

## Execution board

| Priority | Artifact | State at plan creation | Next bounded action | Exit evidence |
| --- | --- | --- | --- | --- |
| P0 | Issue #267 / PR #426 | PR approved, `UNSTABLE`; local hardening is validated but uncommitted | Reconcile authoritative PR route; transplant only the #267 patch to its PR worktree; diagnose and fix its lint and Compact-fixture failures | Current-head green CI, required review state, no unresolved threads, explicit human merge approval |
| P0 | Issue #429 | Open follow-up for merged #421 quality-evidence/CI concerns | Convert residual findings into one small, issue-backed CI follow-up after #426 isolation is complete | Targeted CI classification/quality evidence tests and green PR CI |
| P0 | Issue #347 | OSV exception review deadline: 2026-08-15 | Inventory expiring exceptions, assign remediation/renewal owners, and validate the security lane | Updated exception evidence and green security checks |
| P1 | Bot PR consolidation | Candidate set not yet approved | Produce an evidence-backed candidate list limited to `develop`; create one clean worktree/branch only after version coupling and CI scope are known | One small `develop` PR with green CI and source-PR disposition table |
| P1 | `agent-peer-review` and local skills | Package audit and workflow-refinement audit pending | Decide upgrade compatibility; apply only the smallest project-local skill changes supported by recent evidence | Skill validation/readability check, no conflicting installed-skill edits, documented upgrade decision |
| Strategic | A1/E2 and external X1/X2/B3 | Canonical production backlog remains open | Keep A1 verification transcript/public-input work and E2 durable-session work as separately planned streams; do not claim a production profile while trusted time/DID/trust authority are unresolved | Acceptance criteria in `vc-maturity-backlog.md` satisfied |

## Parallel workstreams

1. **#426 repair:** single writer in a PR-isolated worktree; validation and review may fan out read-only.
2. **Bot PR triage:** read-only inventory first, then one consolidation writer only after an approved candidate set.
3. **Workflow tooling:** read-only package/skill audits first; skill edits go in this tracker branch or a dedicated tooling branch, never #426.
4. **Security:** #347 is independent but must not be bundled with dependency consolidation unless its dependency cohort is explicitly required.

## Current known CI signal for PR #426

Passing: change classification, dependency review, security scan, Compact setup,
shared artifacts, university validation, typecheck, build/package tests,
revocation, and standalone integrations.

Failing: **Lint** and **Restore and Validate Public Compact Fixtures**. These
must be reproduced from the current PR head before a fix is proposed.

## Decision checkpoints

- Approve the final bot-PR candidate list before creating its consolidation PR.
- Ask for a human decision before merge; this plan authorizes execution and
  validation, not merging.
- If `agent-peer-review` requires a global/user installation or changes the
  review authority model, present the upgrade plan before installing it.
- Record blockers and changed facts in this table after each completed lane.
