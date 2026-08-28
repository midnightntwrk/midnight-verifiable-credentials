# Dev-loop Housekeeping Plan

## Status

Implemented and locally validated on PR #483; the two final pre-approval risk/Codex findings on exact head `6496c998d3af87f85a4820b3e4130776a5a28b39` are remediated in one bounded pass, and exact-head gate/CI convergence must be rerun. The user authorized this bounded housekeeping change, the existing PR against `develop`, configured review/fix cycles, and merge only after every repository safety gate is satisfied.

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
- Keep untrusted check names out of model-triggering messages. Retain bounded Unicode code-point helpers only as non-model logic evidence.
- Reconcile only the newest bounded relevant watcher snapshot against the bounded exact current-head set, retaining active notifications while compacting stale history without unbounded growth; malformed or oversized newest state stays fail-closed.
- Preserve active failures across wholly neutral/skipped rollups while allowing mixed actual-success plus neutral/skipped rollups to clear state.
- Persist a bounded pending notification outbox before calling the void `sendUserMessage` API, promote a key to durable dedupe only after the exact watcher user-message marker appears in the active session branch, and recover/retry pending markers safely across cadence ticks and restarts.
- Verify cross-run cancellation candidates through strict HTTPS fixed-repository URLs and authoritative Actions job/run/head/workflow/`started_at` metadata before suppression.
- Dispatch at most one model-triggering notification per observation, and immediately before that send re-read and authoritatively enrich the complete rollup.
- Recover conservatively when prior state is outside the bounded branch tail by suppressing current heads until a real green transition, without unbounded scans or permanent disablement.
- Exercise the registered extension handlers with injected fake API, timers, and abort controllers for deterministic startup, restoration, ordering, retry, dedupe, rerun, lookup-bound, and shutdown coverage.
- Run focused extension unit/component tests and type checks, applicable repository lint, dev-loops diagnostics, lockfile consistency checks, and full configured PR gates/reviews. Keep clean-CI strict typing deterministic with a minimal checked declaration copied from the pinned Pi 0.84.2 extension API instead of relying on an untracked parent-checkout installation.

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
6. The model-triggering watcher prompt contains no untrusted check names, includes only a validated PR number and full validated expected head SHA as variable data, and requires downstream canonical exact-head confirmation before action; non-model Unicode encoding and all bounds remain deterministically tested.
7. Restored notification state preserves every previously seen failure on the bounded current open-PR/head set, rejects explicitly null/malformed outboxes, retries fail-closed when heads cannot be reconciled, and recovers from out-of-tail state without duplicate active alerts or suppressing a later failure after a real green transition.
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
| Exact-head watcher semantics | Deterministic unit tests over extracted pure logic plus component tests over registered handlers |
| Unicode and boundedness | Focused encoding, lookup, branch-tail, and raw-state bound tests |
| Restored notification state | Newest-only restore, null/malformed/oversized rejection, conservative out-of-tail recovery, legacy compaction, latest-clear, and closed-PR pruning regressions |
| Delivery and lifecycle | Fake API/timer tests for bounded outbox-before-send, one dispatch per observation, final full-rollup enrichment, exact branch-marker confirmation, restart retry/recovery, deduped-red status, five-minute cadence, shutdown abort, stale callback rejection, and trust/mode guards |
| Shared lookup budget | Multi-PR component coverage proves `pr list --limit 100` and at most 100 fixed-repository Actions job API calls per observation |
| Repository quality | Focused unit/component tests, deterministic strict TypeScript plus syntax checks in CI using the checked Pi 0.84.2 API contract, applicable `ci:lint`, lock consistency, diff check |
| Delivery safety | Signed+DCO commit, draft/pre-approval evidence, exact-head CI/reviews, protected merge |

## Open questions and risks

- Cancelled and successful duplicate checks must be grouped by a stable check identity; name/context normalization needs to avoid coalescing unrelated checks while preserving provider output.
- GitHub rollups can be eventually consistent. A second exact-head read plus a final complete rollup re-read with authoritative Actions enrichment immediately before notification is required to reject a superseded head and consume a newer same-head rerun state.
- Pi's `sendUserMessage` API is void and delivery can fail asynchronously. A bounded durable outbox plus exact active-branch marker count is therefore the acknowledgement boundary; three sends per key/session are allowed before waiting for a restart or marker confirmation.
- Legacy snapshots may contain more keys than the current watcher bound. Startup must select only exact current-head keys after all watched heads are known; lexicographic truncation is not a recency signal and can forget an active failure.
- A project-local package pin could duplicate globally loaded resources. Pi's project-wins identity rule and an actual package listing/install test determine whether the reproducibility benefit outweighs that risk.

## Audit findings and evidence

- `dev-loops` package and authenticated registry stable are both 0.9.0; the registry's 1.0.0 line remains prerelease-only and was not adopted.
- The installed 0.9.0 `FileConfigSchema` accepts the tracked `.devloops` without errors. The merged config preserves required draft/pre-approval gates, fan-out evidence, exact CI at pre-approval, draft-first flow, `humanMergeOnly: true`, and the configured mandatory external-review angles. No config mutation is justified.
- The absent `.pi/dev-loop-retrospective-checkpoint.json` maps to the documented `none` state (no prior qualifying completion), not `missing`; startup with `workflow.requireRetrospective: true` therefore passed without bypass. A future `{ "state": "required" }` checkpoint will still fail closed until completed or explicitly skipped.
- The checked-in all-`not-run` quality-evidence provenance still named superseded head `161d33d9`, which is not an ancestor of recreated `origin/develop` at `12cd5409`; it was truthfully rebaselined to exact `origin/develop` without changing or fabricating any metric.
- Authenticated registry stable versions for `@input-output-hk/agent-review-pi` and `@input-output-hk/agent-review` are both 0.6.0, matching the user-level Pi package. This is a verified no-op.
- Fresh pre-approval reviewers on `99e107ff` correctly found that neutral/skipped-only rollups could clear active state, notification state was recorded before delivery, cross-run suppression lacked authoritative fixed-repository metadata, restoration scanned every historical snapshot, and only pure logic had deterministic tests. That pass made actual `SUCCESS` the sole clear signal, validated both cross-run jobs against fixed API metadata, selected one bounded newest snapshot, and added registered-handler tests.
- Fresh pre-approval reviewers on `a66f7e792d117335371d4f54b77705a8626d5af6` then found mixed success plus neutral/skipped rollups remained unknown, deduped red heads were omitted from the footer, void message delivery was acknowledged too early, untrusted names entered the model prompt, the expected-head precondition was incomplete, and component/strict-type evidence had gaps. The current remediation distinguishes settled-neutral groups from pending unknowns, counts every reconfirmed red head, uses a bounded restart-safe outbox with exact branch-marker acknowledgement, emits a constant validated PR/full-SHA prompt, proves the shared lookup budget/restoration/cadence/stale-callback lifecycle, and wires strict TypeScript into `ci:lint`. The first pushed remediation exposed that local type resolution had climbed into an untracked parent Pi installation; the follow-up checks in a minimal Pi 0.84.2 API declaration so clean CI exercises the same strict surface without adding a root runtime/development package cohort.
- Final bounded remediation after the clean security/coverage pass on `6496c998d3af87f85a4820b3e4130776a5a28b39` resets exhausted in-memory send budgets whenever a green observation or head/PR pruning clears the corresponding failure, and walks deterministic dispatch candidates past unavailable final reads/enrichment until one actual send. Focused component regressions cover same-head refailure, head/PR pruning, multi-candidate continuation, and the one-send-per-observation bound.
- No repository-local agent-review pin is added. Pi's documented same-identity precedence would make a project entry shadow the user's package rather than load a duplicate, but agent peer review is authenticated user workflow tooling, the repository does not currently declare it as a project requirement, and adding it would broaden trusted project-startup code without an implementation need. The existing project pins for `dev-loops` and `pi-subagents` remain unchanged.

## Docs-grill findings

- Resolved: the requested plan location is `docs/plans/`, even though the generic installed contract examples use `docs/phases/`; startup accepts an explicit plan path and the repository already persists plans under `docs/plans/`.
- Resolved: cancelled checks are not globally reclassified as success; only duplicate/retry evidence on the same exact head can suppress an alert.
- Resolved: merge authorization does not override exact-head CI, review, signature/DCO, branch-protection, or code-owner requirements.
