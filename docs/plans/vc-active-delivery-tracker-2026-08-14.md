# VC Active Delivery Tracker — 2026-08-14

Status: active operator plan. This file records execution state and links to
canonical GitHub artifacts; it does not redefine the production-readiness
acceptance authority in `vc-maturity-backlog.md`.

Baseline: `origin/develop` at `ee79e7f`; this includes merged PR #453. The
historic plan branch was `codex/vc-delivery-tracker-2026-08-14`.

## Guardrails

- Never merge or make changes on `main`.
- Keep #267's University v1 direct-claim/request-binding scope isolated from
  CI/backlog/skill work. #426 is superseded history; merged #453 is the
  canonical implementation link and does not close or broaden #267.
- Reuse an existing linked PR rather than opening a duplicate PR.
- A bot-PR consolidation may contain only reviewed `develop`-target changes;
  it must not absorb `main`-target PRs, unrelated feature work, or unverified
  dependency cohorts.
- Do not merge any PR while its merge state is `UNSTABLE`, `BLOCKED`, `DIRTY`,
  `BEHIND`, or `UNKNOWN`.

## Execution board

| Priority | Artifact | State at plan refresh | Next bounded action | Exit evidence |
| --- | --- | --- | --- | --- |
| P0 | Issue #267 / merged PR #453 (supersedes #426) | #453 merged to `develop` on 2026-08-19; #267 remains open with its v1-only prototype/privacy scope | Treat #453 as the completed request-binding slice. Any future #267 work must stay within its retained acceptance criteria; do not revive #426 or infer a production/privacy closure | A separately scoped current-head PR with required review state, no unresolved threads, and explicit human merge approval |
| P0 | Issue #429 | Open follow-up for merged #421 quality-evidence/CI concerns | Convert residual findings into one small, issue-backed CI follow-up independent of the merged #453/#267 slice | Targeted CI classification/quality evidence tests and green PR CI |
| P0 | Issue #347 | OSV exception review deadline: 2026-08-15 | Inventory expiring exceptions, assign remediation/renewal owners, and validate the security lane | Updated exception evidence and green security checks |
| P1 | Bot PR consolidation | Candidate set not yet approved | Produce an evidence-backed candidate list limited to `develop`; create one clean worktree/branch only after version coupling and CI scope are known | One small `develop` PR with green CI and source-PR disposition table |
| P1 | `agent-peer-review` and local skills | Package audit and workflow-refinement audit pending | Decide upgrade compatibility; apply only the smallest project-local skill changes supported by recent evidence | Skill validation/readability check, no conflicting installed-skill edits, documented upgrade decision |
| Strategic | A1/E2 and external X1/X2/B3 | Canonical production backlog remains open | Keep A1 verification transcript/public-input work and E2 durable-session work as separately planned streams; do not claim a production profile while trusted time/DID/trust authority are unresolved | Acceptance criteria in `vc-maturity-backlog.md` satisfied |

## Parallel workstreams

1. **#267 boundary:** #453 is merged and #426 remains superseded history; keep
   any remaining #267 work in a dedicated family-scoped worktree and PR.
2. **Bot PR triage:** read-only inventory first, then one consolidation writer
   only after an approved candidate set.
3. **Workflow tooling:** read-only package/skill audits first; skill edits go in
   this tracker branch or a dedicated tooling branch, never the #267/#453
   implementation path.
4. **Security:** #347 is independent but must not be bundled with dependency
   consolidation unless its dependency cohort is explicitly required.

## Historical CI signal for superseded PR #426

The prior #426 lint and public-Compact-fixture failures are historical evidence
only. They are not an active delivery target and must not be transplanted into
#267 or #453. The canonical request-binding implementation is merged PR #453;
new work starts from its `develop` head and carries its own current-head CI
and review evidence.

## Decision checkpoints

- Approve the final bot-PR candidate list before creating its consolidation PR.
- Ask for a human decision before merge; this plan authorizes execution and
  validation, not merging.
- If `agent-peer-review` requires a global/user installation or changes the
  review authority model, present the upgrade plan before installing it.
- Record blockers and changed facts in this table after each completed lane.
