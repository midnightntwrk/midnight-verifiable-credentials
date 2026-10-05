# AGENT

Engineering guide for `midnight-verifiable-credentials`.

This file is the repository's single agent-facing source of truth. Do not add
tool-specific skills, prompts, autonomous-loop configuration, or checked-in
agent runtime state. Human contributor guidance belongs in `CONTRIBUTING.md`;
durable architecture decisions belong in ADRs.

## Scope

This is a core-only VC/VP specification and implementation repository. Follow
[ADR-0016](./docs/decisions/0016-core-only-specification-and-implementation.md).

Keep here:

- protocol-independent VC/VP data models and Compact primitives
- the bounded Midnight DID-to-core binding defined by ADR-0017
- explicit holder-binding primitives
- generic credential-family and claim-schema metadata
- normative specifications and conformance vectors

Keep out:

- concrete credential families and schemas
- product and organizational use cases
- wallet, issuer, verifier, or relying-party applications
- OIDC, DIDComm, connector, and business-process orchestration
- deployment environments and product integration harnesses

Credential families and substantial examples must live in independent
repositories with their own release trains. Use Git history and linked issues
for removed surfaces instead of preserving runnable compatibility implementations
or migration-only machinery here.

## Repository boundaries

Treat every `midnight-*` repository as independent. Never import sibling source,
generated files, `dist/` output, or package internals. Use published packages;
when a package is not published, consume tarballs copied by the root
`midnight-identity-workspace` automation.

Do not modify sibling repositories from this checkout. `NightFi` and
`arc-passport` are read-only references unless the user explicitly authorizes
work in them.

## Package layering

The model and Compact core packages are independent. The flat Midnight DID
binding is an optional extension and depends one-way on the Compact core.

Rules:

- `packages/core` must not depend on adapters, registries, or apps.
- `packages/credential-did-midnight` may depend on
  `@midnight-ntwrk/credential-compact` and published Midnight DID packages, but
  core packages must not depend on it.
- packages must expose public entrypoints; consumers must not deep-import
  another package's `src`, `dist`, or generated implementation files.
- keep the workspace dependency graph acyclic.

The executable boundary policy is `pnpm run check:package-boundaries`.

## Workspace management

`pnpm-workspace.yaml` is the authoritative workspace inventory.
`tooling/scripts/workspace-catalog.mjs` is only the public release allowlist.
Internal workspace dependencies use `workspace:*`. Use pnpm only; do not create
`package-lock.json` or yarn lockfiles.

## Compact artifacts

Compact sources and generated artifacts are owned by their package. Do not copy
generated outputs across package or repository boundaries.

When Compact sources or runtime inputs change:

```bash
pnpm run build
```

Never commit wallet keys, signing keys, seeds, witnesses, credentials, or other
private material.

## Validation

Install exactly from the lockfile:

```bash
pnpm install --frozen-lockfile
```

Run the narrowest relevant lane while iterating:

```bash
./run.sh lint
./run.sh typecheck
./run.sh build
./run.sh test
./run.sh conformance
./run.sh package
```

Before a PR, run:

```bash
./run.sh --light
pnpm run docs:links
git diff --check
```

`./run.sh --light` is the core-only gate. It must remain free of Docker and
product/use-case integration environments.

## Pull requests

- Base core-only work on the repository's current integration branch unless an
  active stack requires a documented predecessor branch.
- Target `main` only for an explicit release-promotion PR.
- Use `codex/*` branch names.
- Keep no more than two active stack levels.
- Commit with DCO and GPG:
  `git commit -S --signoff -m "<type>: <subject>"`.
- Obtain an independent current-head review for Compact, security, public API,
  dependency-major, and release-workflow changes. Documentation-only and
  dependency-patch PRs may rely on normal human review plus required CI.
- When the required independent current-head review runs through a CLI, allow
  it up to 15 minutes to produce output. A silent timeout, authentication
  failure, or unavailable reviewer is missing review evidence, not approval;
  record that state in a PR comment naming the full head commit SHA.
- Wait for every hosted check that GitHub reports on the current head and
  current base to reach a terminal state, and require every branch-protection
  check to conclude successfully, before requesting merge. On a milestone PR,
  `Core Validation`, `Dependency Review`, `scan`, and `license/cla` must each be
  present and succeed. For check runs, require `conclusion=SUCCESS`; for the
  legacy CLA commit status, require `state=SUCCESS`. A missing or non-successful
  minimum check blocks an autonomous merge. Other reported checks may be
  successful, neutral, or skipped; failure, cancellation, timeout, staleness,
  startup failure, or required action blocks the merge. If repository visibility
  changes and dependency review can no longer run, pause the train and update
  the gate instead of treating the skipped check as success.
- Agents do not merge PRs by default. Merges into `develop`, `main`,
  `release/**`, `vc-core`, feature branches, and stacked predecessor branches
  are human-only.
- The sole exception is a dedicated `milestone-*` delivery branch that the user
  explicitly authorizes for an autonomous merge train. Its name must use the
  no-slash form `milestone-<version>` covered by the hosted workflow filters.
  An agent may merge into that branch only after the check gate above is
  satisfied and an independent review is successful and recorded against the
  full current head SHA. A failed, unavailable, or timed-out review does not
  satisfy this gate. The documentation-only and dependency-patch exemption
  applies only to human-mediated merges, not an autonomous milestone merge
  train.
- Immediately before each autonomous milestone merge, refresh the PR metadata
  and branch-protection status. If the head branch does not contain the current
  milestone tip, update or rebase it and require fresh successful checks against
  the new head/base pair. If that update changes the head SHA, obtain a fresh
  successful independent review for the new SHA as well. Do not merge while
  GitHub reports the protected branch as stale or blocked.
- After each autonomous milestone merge, wait for the milestone branch's
  push-triggered `Core Validation` and `scan` checks to finish successfully
  before merging the next PR. Promotion from the milestone branch to another
  branch remains human-only.
- Treat findings against deleted or superseded surfaces as obsolete. Fix only
  real defects in the retained core or in the change's validation path.

## References

- [Specification](./spec/README.md)
- [Terminology and glossary](./spec/terminology.md)
- [Conformance](./conformance/README.md)
- [Core-only architecture decision](./docs/decisions/0016-core-only-specification-and-implementation.md)
- [Midnight DID binding decision](./docs/decisions/0017-midnight-did-binding-extension.md)
- [Credential schema model decision](./docs/decisions/0018-credential-schema-model.md)
- [npm publication runbook](./docs/guides/npmjs-publication.md)
