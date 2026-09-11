# Pi Development Loop

Pi is an optional local interface for the repository's pinned `dev-loops`
workflow. It helps an operator move a bounded GitHub issue through implementation,
review, and CI. Pi is not required to build, test, contribute to, or publish the
packages.

## Sources of truth

- GitHub Discussions record design proposals and unresolved architecture choices.
- GitHub Issues record accepted deliverables and their completion criteria.
- Pull requests contain implementation and exact-head evidence.
- GitHub Actions is authoritative for remote CI.
- `AGENT.md` and `.devloops` define repository scope and lifecycle policy.

Do not create a second backlog in prompts, local state, or generated planning
documents. Convert an accepted discussion outcome into a focused issue before
starting implementation.

## Start clean

Start from a clean worktree based on the pull request's actual base. Normal
feature work starts from the latest `origin/develop`; only release promotion
targets `main`.

Enter the Nix shell and bootstrap the pinned local tools:

```bash
nix develop
just bootstrap
just pi-doctor
pi
```

The first Pi session may ask you to trust the repository before loading
`.pi/settings.json`. Inspect that file before accepting: project-local Pi
packages and extensions execute with the invoking user's permissions.

Inside Pi, verify the installed workflow and inspect command help:

```text
/dev-loops doctor
/dev-loops gates
```

The installed command help is authoritative. The normal lifecycle is:

```text
/dev-loops start <issue-number>
/dev-loops status
/dev-loops continue <pull-request-number>
```

## Delivery contract

Use one issue per pull request unless a mechanical follow-up has no independent
value. Keep no more than two active stack levels. A child pull request targets
its parent branch and must be retargeted to `develop` after the parent merges.

For each pull request:

1. Confirm the issue, scope, base branch, and stop conditions.
2. Create a dedicated worktree and branch from the intended base.
3. Run focused checks while iterating.
4. Run `./run.sh --light`, documentation links, and `git diff --check` on the
   final local head.
5. Commit with GPG and DCO.
6. Push and open a draft pull request before requesting review.
7. Run the configured independent review against the pull request's exact base
   and current head.
8. Resolve retained-core defects, rerun invalidated evidence, and wait for every
   required GitHub check on the final head to reach a terminal state.
9. Stop at human approval and merge.

Review findings block delivery only when they identify a concrete correctness,
security, conformance, packaging, or release-boundary defect in retained code.
Deleted surfaces, style preferences, speculative governance, and future protocol
ideas belong in a discussion or backlog issue, not in the active pull request.

## Interactive CI watch

The project extension `.pi/extensions/vc-current-head-ci-watch.ts` polls open
pull requests authored by the current GitHub user while a trusted interactive
Pi session is running. It reports a failed current head once and can hand the
failure back to the active loop.

The watcher is notification only. It does not persist a durable scheduler,
modify files, push commits, promote drafts, approve reviews, or merge pull
requests. Closing Pi stops the watcher. Use GitHub Actions and `gh` for
authoritative CI facts and logs.

## Stop conditions

Stop the loop instead of guessing when:

- a required product, protocol, trust-policy, or public API decision is absent;
- the observed PR head changes while evidence is being gathered;
- required CI or review evidence is missing or ambiguous;
- a failure belongs to credentials, permissions, npm authorization, or external
  infrastructure;
- a proposed fix crosses repository boundaries; or
- the next change would widen the issue or exceed stack depth two.

## Deliberate exclusions

This repository does not install a privileged routed-review service, durable CI
remediation scheduler, custom dashboard, autonomous approval, or autonomous
merge. Those systems add operational ownership and security requirements that
are not justified for this small core library. Add one only through a separate
decision and issue with a named operator.

Local Pi state under `.pi/`, `.pi-subagents/`, and `review/` is ignored. Never
store tokens, prompts containing credentials, signing keys, witnesses, or real
credential data in agent artifacts.
