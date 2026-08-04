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
common repository CLIs (`git`, `gh`, `jq`, `just`), and a repo-local Pi install
under `.pi/nix-global`. It runs `just bootstrap` automatically, which installs
pnpm dependencies when needed and installs Pi locally if missing.

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

## Use the PI WEB browser UI

The repository includes a project-local PI WEB configuration at
`.pi-web/config.json`. It keeps manual uploads workspace-relative under
`.pi-web/uploads/`; uploaded files are ignored by Git.

Entering `nix develop` (or allowing direnv to load this checkout) exposes the
pinned PI WEB version and `just bootstrap` installs it into the repo-local
`.pi/nix-global` prefix. To install or refresh it explicitly:

```sh
just pi-web-bootstrap
just pi-web-doctor
pi-web install
```

The pinned version is `1.202607.3`. For a manual install outside the Nix shell,
use:

```sh
npm install -g @jmfederico/pi-web@1.202607.3 --allow-scripts=node-pty
pi-web doctor
pi-web install
```

Then open <http://127.0.0.1:8504>, add this repository as a project, and use the
browser UI to supervise persistent Pi sessions. PI WEB must remain bound to a
trusted local/private network path; do not expose the unauthenticated service
directly to the public internet. For a remote machine, use an SSH tunnel:

```sh
ssh -L 8504:127.0.0.1:8504 user@server
```

The service requires Node.js 22.19 or newer, Pi 0.82.x, and a login-shell PATH
that exposes `node`, `npm`, `pi`, and repository tooling. Run `just pi-web-status`,
`pi-web status`, or `pi-web logs` for service diagnostics. The project config is
portable; service installation and credentials remain machine-local and are not
committed.

## Repository harness policy

The repository-root `.devloops` file configures the review and lifecycle
policy. It requires refinement, draft-first pull requests, VC package and
Compact boundary review, external review, validation evidence, CI triage, and
a human-only merge. The authoritative repository rules remain `AGENT.md`, the
bundled `midnight-identity` skill, the pull-request template, and the
`./run.sh` validation targets.

The harness is additive. GitHub Issues, pull requests, protected branches, and
GitHub Actions remain the source of truth for work and CI state. Pi cannot mark
a pull request ready for human review or merge it under this repository policy.

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

The project-local `dev-loops` package is pinned in `.pi/settings.json` so the
workflow does not silently drift. Update the pin deliberately, review the
package changes, and validate the development workflow before merging.

Check the effective repository configuration:

```sh
npx dev-loops@0.9.0 doctor
npx dev-loops@0.9.0 gates
```

To roll back the integration, remove `.pi/settings.json` and `.devloops`, then
remove the Pi cache directories under `.pi/`. The ordinary shell, Codex,
Claude, GitHub, and `./run.sh` workflows continue to work without Pi.
