# Pi Development Loop

This repository supports Pi as an optional local interface for the pinned
`dev-loops` development workflow. The repository does not require Pi to build,
test, publish, or review code.

## Bootstrap from Nix

From the repository root, enter the development shell:

```sh
nix develop
```

The shell provides the pinned Node/pnpm toolchain, Midnight Compact tools,
common repository CLIs (`git`, `gh`, `jq`, `just`), and Pi 0.84.2 under
`.pi/nix-global`. It runs `just bootstrap` automatically, which installs pnpm
dependencies when needed and reconciles Pi to that exact version.

Use these helpers inside the shell:

```sh
just targets     # list repository validation targets
just check       # run the light non-Docker gate
just pi-doctor   # show Pi/dev-loop wiring
```

Set `MVVC_SKIP_BOOTSTRAP=1 nix develop` to skip the automatic bootstrap and run
individual `just` targets manually.

## Start a session

From the repository root, after entering `nix develop` and authenticating Pi:

```sh
pi
```

The first session may ask you to trust the repository because it contains
`.pi/settings.json`. Trust is required before Pi loads the project-local
`dev-loops` and `pi-subagents` packages. Pi packages run with the permissions of
the invoking user, so review package-pin changes as executable tooling.

Check the loop tooling with:

```text
/dev-loops doctor
/dev-loops gates
```

Use the normal issue and pull-request lifecycle from the Pi shell:

```text
/dev-loops start <issue-number>
/dev-loops status <issue-number>
/dev-loops continue <pull-request-number>
```

The exact command help exposed by the installed package is authoritative.


## Retired Pi-Web Nix package

This repository no longer packages or configures Pi-Web. This change deliberately
**does not modify any running user Nix profile**. The retained
`.pi-web/uploads/` ignore rule protects legacy local uploads; it is not a
repository Pi-Web configuration.

After this change is merged, each user who previously followed the old setup
must perform this separate manual cleanup from their own shell, never from this
repository or its bootstrap commands:

1. While the old Pi-Web executable is still available, stop and uninstall its
   user services with `pi-web uninstall` (or use the equivalent user-service
   cleanup procedure for that installation).
2. Inspect the user's Nix profile and remove its Pi-Web entry with the user's
   normal profile-management and rollback procedure.
3. Review or remove any local `.pi-web/uploads/` data deliberately; it can
   contain user-provided material and remains ignored by Git.

## Repository harness policy

The repository-root `.devloops` file uses the strict dev-loops 0.9.0
`version: 1` schema. It owns the supported review gates and personas,
refinement settings, draft-first flow, the pre-approval stop, and human-only
merge. Do not add older, unsupported validation, CI-watch, or repository-policy
keys: one schema error causes the repository layer to be rejected.

`AGENT.md` and `run.sh` are authoritative for validation selection. GitHub
branch protection and Actions are authoritative for CI and merge enforcement.
The Codex and Claude `midnight-identity` skills are mirrors only;
`docs/dev-loop-review-and-ci-remediation.md` provides operational guidance.

The harness is additive. GitHub Issues and pull requests remain the source of
truth for work state. Pi cannot mark a pull request ready for human review or
merge it under this repository policy.

## VC-specific review boundaries

The configured review personas cover:

- reusable VC/VP package exports and dependency boundaries
- Compact authorization, witness secrecy, status/revocation, and artifact drift
- claim openings and holder-binding behavior
- protocol and downstream compatibility
- the boundary between in-repository prototypes and independently released
  credential-family repositories

The policy does not authorize cross-repository source imports or edits. Published
packages remain the integration boundary for sibling `midnight-*` repositories.

## Automation interfaces

For a wrapper or CI experiment, Pi provides two structured local interfaces:

```sh
pi --mode json "inspect the current worktree"
pi --mode rpc --no-session
```

JSON mode emits newline-delimited session events. RPC mode accepts newline-
delimited JSON commands on standard input and emits responses and agent events
on standard output. Keep either process local; do not expose an unauthenticated
Pi process as a network service.

## Evidence and observability boundary

The Pi shell is the operator interface. GitHub Actions and `gh` remain the
authoritative source for pull-request checks and CI logs. A dev-loop may write
machine-readable lifecycle artifacts under `.pi/harness/`, but those artifacts
are local and ignored by Git.

Do not record prompts, credentials, tokens, private keys, claim openings,
holder secrets, witness material, proofs, or raw cryptographic material in
local run artifacts. This repository intentionally does not install or
configure an observability stack or a custom workflow dashboard.

## Versioning, update, and removal

The repository pins Pi 0.84.2 in `justfile`, plus `dev-loops` 0.9.0 and
`pi-subagents` 0.56.0 in `.pi/settings.json`. Update these exact versions
deliberately, review package changes as executable tooling, and validate the
development workflow before merging. Restart Pi after updating the binary or
packages so the running session loads the new code.

Check the installed versions and effective repository configuration:

```sh
pi --version
pi list
npx --yes dev-loops@0.9.0 doctor
npx --yes dev-loops@0.9.0 gates
```

To roll back the integration, remove `.pi/settings.json`, `.devloops`,
`.pi/extensions/vc-current-head-ci-watch.ts`, and its
`.pi/extensions/vc-current-head-ci-watch/` support directory, then remove the Pi
cache directories under `.pi/`. The ordinary shell, Codex, Claude, GitHub, and
`./run.sh` workflows continue to work without Pi.

## Current-head CI watch (interactive Pi only)

`.pi/extensions/vc-current-head-ci-watch.ts` is a trusted-session convenience
watcher. After installing or updating the checkout, run `/reload` or restart
Pi so it loads. While Pi remains open in an interactive trusted session, it
checks this repository's open PRs authored by the authenticated `gh` user every
five minutes. Before a newly observed failure queues an attributed
`continue dev loop on PR <N>` follow-up, the watcher re-reads the PR and confirms
the exact current head. Pending, unknown, superseded, and previously observed
PR/head failures do not trigger it. Within one Actions run, duplicate
cancellation is non-actionable only when an actual success on that exact head
belongs to a later, one-to-one API-enriched attempt of the same workflow/check
identity; Actions URLs without validated attempt metadata and ambiguous
same-named jobs remain fail-closed. Across distinct Actions runs, suppression is
limited to the repository's known `Scan/scan` cross-trigger pair: exactly one
completed cancellation and one completed success with repository-local Actions
URLs, different run IDs, and a strictly later valid start time. Stable
non-Actions provider URLs are grouped only with the same workflow/check identity.
A green observation clears the prior PR/head notification state so a later
failure on the same commit remains actionable. Neutral or skipped conclusions
never clear a real failure.

This is an in-session dev-loop route/fix prompt, not a daemon. It never merges,
approves, marks a PR ready, or changes GitHub state.
