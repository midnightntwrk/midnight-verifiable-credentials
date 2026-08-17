---
name: midnight-identity
description: "Use this skill for midnight-verifiable-credentials repository work: VC/VP packages, Compact claim representation, credential families, status/revocation, BDD scenarios, university use case, standalone integration, CI cones, and package distribution."
---

# Midnight Identity VC Skill

Use this skill from the `midnight-verifiable-credentials` repository, whether cloned independently or as a submodule.

## Required Context

1. Read repository-root `AGENT.md` first.
2. If this checkout is inside `midnight-identity-workspace`, read the workspace-root `AGENT.md` for submodule and artifact fanout rules.
3. Keep DID method implementation in `midnight-did`; keep Passport/product flows in examples/product repos.

## Defaults

- Target branch is `develop` unless instructed otherwise.
- Use DCO/GPG for repository-facing commits: `git commit -S --signoff -m "<type>: <subject>"`.
- Preserve the generic envelope `VC<TPublicClaims, TClaimCommitments, THolderBinding, TStatusBinding>`.
- Keep BDD under `packages/use-cases/`.

## PR Gate (required before any PR)

- Mandatory:
  - `./run.sh --light`
  - `./run.sh bdd`
  - `./run.sh university-protocol`
  - `./run.sh clean-artifacts`
  - `./run.sh integration-report`
- Required cross-repo sanity:
  - `cd <workspace-root>/midnight-identity-workspace && ./run.sh --light --repos vc`

Do not open or push PRs before completing this gate.

## Validation

```bash
./run.sh targets
./run.sh --light
./run.sh lint
./run.sh typecheck
./run.sh build
./run.sh test
./run.sh bdd
./run.sh university-protocol
./run.sh university-summary
./run.sh clean-artifacts
./run.sh integration-report
./run.sh check-integration
pnpm run check:run-target-catalog
pnpm run check:managed-artifact-catalog
pnpm run check:did-integration
PROOF_SERVER_IMAGE=proof-server-bootstrap:8.0.3 ./run.sh
```

Use `packages/use-cases/university/operator-guide.md` when choosing university BDD, proof-server, standalone, cohort, stress, and summary lanes.

## Packaging

```bash
pnpm run artifacts:pack
./upgrade-libs.sh --destination /path/to/downstream-repo
```

Use `tooling/artifacts/npm/` and `tooling/vendor/`; do not hand-copy `dist/`.

## MCP

Use a user-level Midnight MCP config when available; do not commit personal MCP files:

```toml
[mcp_servers.midnight]
command = "pnpm"
args = ["exec", "midnight-mcp@latest"]
```

## Workflow Safety

### PR isolation and consolidation

- Treat `develop` as the only default PR base. Before a mutating task, run
  `git fetch origin` and use an isolated worktree/feature branch based on
  `origin/develop`; do not edit, validate, commit, or merge from the primary
  checkout.
- Use the repository `dev-loop` entrypoint for issue/PR lifecycle work. Resolve
  the issue/PR state first; when an open linked PR exists, continue that
  canonical PR rather than opening a duplicate. Consolidate bot work only after
  selecting compatible `develop`-target PRs with current-head evidence.
- Keep one issue/scope per PR and one writer per worktree. Never merge a branch
  into local `main`, never target `main` by default, and never run `gh pr merge`.
  Stop at the human merge handoff.

### CI failure triage

- Re-baseline the canonical PR and current head SHA before acting. Identify the
  failing check/job and confirm it ran against that head; use dev-loop CI-status
  and CI-log helpers rather than shell polling or blind reruns.
- Reproduce the named lane first. For university protocol changes, start with
  `pnpm run ci:university-protocol`; add
  `pnpm run ci:university-protocol-profiles` for profile/cohort/stress inputs.
  Then run `./run.sh --light` and select the necessary full or integration runner target
  from `AGENT.md`.
- Classify each failure as repo-fixable, flaky/transient, CI configuration,
  external-service outage, or unknown. Make one narrow validated fix per cycle.
  If logs are unavailable or classification remains unknown, report the
  head/check/job and stop; do not claim green, push speculation, or merge.

### Selective-disclosure changes

- Treat `claims` as public and `claimCommitments` as the private commitment
  surface. Do not call a type cast or fixture constructor a privacy migration:
  preserve the verifier/circuit trust boundary or stop for a contract decision.
- Test serialized submission payloads, exports, and proof-server DTOs. Assert
  hidden plaintext is absent, public claims are allowlisted, expected
  commitments are present, and only requested `(value, opening)` pairs disclose.
- Use private high-entropy, field-domain-separated openings and an unlinkable,
  verifier/request-bound subject reference. Never derive either from public DID,
  fixture, student, or routing data. Test altered openings and known/default
  openings fail verification or recovery attempts.
- Ensure holder-private opening/correlation material survives every supported
  restart. Explicitly document any process-local or transport-linkability
  limitation rather than representing the flow as durable/private by default.
