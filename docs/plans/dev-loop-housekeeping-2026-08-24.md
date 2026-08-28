# Dev-loop Housekeeping Plan

## Status

Implemented and locally validated on draft PR #483; current-head gate review/fix convergence is in progress. The user authorized this bounded housekeeping change, the existing draft PR against `develop`, configured review/fix cycles, and merge only after every repository safety gate is satisfied.

## Objective

Audit the repository's dev-loops and Pi agent-review posture against the installed and published stable packages, and harden the current-head CI watcher so it reports only actionable failures on the exact current PR head without masking real failures.

## In scope

- Validate `.devloops` against the installed dev-loops 0.9.0 schema and current repository policy, preserving current-head, review, branch-protection, and human-merge rails.
- Reconcile the configured retrospective requirement using the installed retrospective checkpoint/config contract rather than bypassing startup.
- Verify the authenticated registry stable versions for `dev-loops`, `@input-output-hk/agent-review-pi`, and `@input-output-hk/agent-review`; record truthful no-ops when already current.
- Evaluate Pi user/project package precedence and duplicate-resource risk before deciding whether a repository-local agent-review pin is justified; do not change user-global files.
- Extract deterministic, testable current-head check-rollup logic from `.pi/extensions/vc-current-head-ci-watch.ts`.
- Suppress stale/superseded-head and cancelled-duplicate alerts only when a fresh exact-head observation proves them non-actionable; preserve fail-closed behavior for real current-head failures and pending/unknown states.
- Add focused tests for a real failure, pending/unknown checks, superseded-head confirmation, duplicate cancelled-plus-success checks, and a later successful rerun.
- Preserve Unicode code-point encoding and message/name bounds for untrusted check names.
- Reconcile legacy watcher state against the bounded exact current-head set before truncation, retaining active notifications while compacting stale history without unbounded growth.
- Run focused extension tests/type checks, applicable repository lint, dev-loops diagnostics, lockfile consistency checks, and full configured PR gates/reviews.

## Explicit non-goals

- Product, credential, protocol, contract, publication, release, or workflow-dispatch behavior.
- Credentials or changes to `~/.pi`, `~/.agent-peer-review`, organization settings, branch protection, or other user-global state.
- Dependency-major migrations, prerelease adoption, fabricated version bumps, or weakening any review/merge safety rail.
- Treating cancelled checks as universally successful: cancellation remains fail-closed unless an exact-head duplicate success or newer successful rerun makes the cancellation non-actionable.

## Acceptance criteria

1. The installed stable dev-loops schema/version and registry stable version are recorded, `.devloops` passes sanctioned diagnostics, and any config change is evidence-based without weakening safety rails.
2. Retrospective startup state is reconciled through the documented checkpoint/config behavior, with no bypass.
3. Both agent-review package identities are verified against the authenticated registry. Version 0.6.0 is recorded as a no-op if still latest, and a project pin is added only if precedence/conflict testing demonstrates it is appropriate.
4. The watcher alerts for a real current-head failure, keeps pending/unknown non-actionable, confirms the head is still current before alerting, ignores cancelled duplicate attempts when the same exact-head check has a success, and does not alert after a later successful rerun supersedes a prior failed attempt.
5. Current-head failures remain fail-closed when no exact-head success or rerun resolves them.
6. Untrusted check-name Unicode encoding and all existing bounds remain enforced and deterministically tested.
7. Restored notification state preserves every previously seen failure on the bounded current open-PR/head set, retries fail-closed when those heads cannot be reconciled, and compacts legacy history without suppressing a later failure after a cleared key.
8. The diff stays limited to housekeeping config, harness extension/logic/tests, this plan/evidence documentation, and only justified package/lock changes.
9. Focused tests, extension type/syntax checks, applicable `ci:lint`, dev-loops config diagnostics, package-lock consistency, and `git diff --check` pass.
10. Commits are GPG-signed and DCO-signed-off; the draft and pre-approval gates, exact-head CI, configured independent review, signatures, branch protection, and all merge requirements pass before merge.

## Definition of done

- The implementation and deterministic tests are committed on a dedicated worktree branch from exact `origin/develop`.
- A draft PR targeting `develop` references this plan as its specification and truthfully summarizes version/config findings and validation evidence.
- All configured review rounds converge with valid findings fixed and exact-head evidence rerun.
- The PR is merged only through the repository-sanctioned method after every required gate is satisfied, and the resulting merge SHA on `develop` is verified; otherwise the exact unsatisfied external checkpoint is reported.

## Coverage matrix

| Requirement | Evidence |
| --- | --- |
| Dev-loops config/schema audit | Sanctioned config/doctor diagnostics and documented findings |
| Agent-review stable verification | Authenticated registry/version output and Pi precedence analysis |
| Exact-head watcher semantics | Deterministic unit tests over extracted pure logic |
| Unicode and boundedness | Focused encoding/bounds tests |
| Restored notification state | Legacy truncation regression, latest-snapshot clearing, over-bound fail-closed, and closed-PR pruning tests |
| Repository quality | Focused type/syntax checks, applicable `ci:lint`, lock consistency, diff check |
| Delivery safety | Signed+DCO commit, draft/pre-approval evidence, exact-head CI/reviews, protected merge |

## Open questions and risks

- Cancelled and successful duplicate checks must be grouped by a stable check identity; name/context normalization needs to avoid coalescing unrelated checks while preserving provider output.
- GitHub rollups can be eventually consistent. A second exact-head read immediately before notification is required to reject a superseded head and consume a newer rerun state.
- Legacy snapshots may contain more keys than the current watcher bound. Startup must select only exact current-head keys after all watched heads are known; lexicographic truncation is not a recency signal and can forget an active failure.
- A project-local package pin could duplicate globally loaded resources. Pi's project-wins identity rule and an actual package listing/install test determine whether the reproducibility benefit outweighs that risk.

## Audit findings and evidence

- `dev-loops` package and authenticated registry stable are both 0.9.0; the registry's 1.0.0 line remains prerelease-only and was not adopted.
- The installed 0.9.0 `FileConfigSchema` accepts the tracked `.devloops` without errors. The merged config preserves required draft/pre-approval gates, fan-out evidence, exact CI at pre-approval, draft-first flow, `humanMergeOnly: true`, and the configured mandatory external-review angles. No config mutation is justified.
- The absent `.pi/dev-loop-retrospective-checkpoint.json` maps to the documented `none` state (no prior qualifying completion), not `missing`; startup with `workflow.requireRetrospective: true` therefore passed without bypass. A future `{ "state": "required" }` checkpoint will still fail closed until completed or explicitly skipped.
- The checked-in all-`not-run` quality-evidence provenance still named superseded head `161d33d9`, which is not an ancestor of recreated `origin/develop` at `12cd5409`; it was truthfully rebaselined to exact `origin/develop` without changing or fabricating any metric.
- Authenticated registry stable versions for `@input-output-hk/agent-review-pi` and `@input-output-hk/agent-review` are both 0.6.0, matching the user-level Pi package. This is a verified no-op.
- No repository-local agent-review pin is added. Pi's documented same-identity precedence would make a project entry shadow the user's package rather than load a duplicate, but agent peer review is authenticated user workflow tooling, the repository does not currently declare it as a project requirement, and adding it would broaden trusted project-startup code without an implementation need. The existing project pins for `dev-loops` and `pi-subagents` remain unchanged.

## Docs-grill findings

- Resolved: the requested plan location is `docs/plans/`, even though the generic installed contract examples use `docs/phases/`; startup accepts an explicit plan path and the repository already persists plans under `docs/plans/`.
- Resolved: cancelled checks are not globally reclassified as success; only duplicate/retry evidence on the same exact head can suppress an alert.
- Resolved: merge authorization does not override exact-head CI, review, signature/DCO, branch-protection, or code-owner requirements.
