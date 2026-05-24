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

- In-workspace gate that keeps DID/VC integration healthy:
  - `cd <workspace-root>/midnight-identity-workspace && ./run.sh --light --strict --repos vc`
  - `cd <workspace-root>/midnight-identity-workspace && ./run.sh --light --strict --repos did`
- Repo-local gate:
  - `./run.sh --light`
  - `./run.sh bdd`
  - `./run.sh university-protocol`
  - `./run.sh university-summary`
  - `./run.sh clean-artifacts`
  - `./run.sh integration-report`

Do not open the PR until all required gate commands pass.

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
npm run check:run-target-catalog
npm run check:managed-artifact-catalog
npm run check:did-integration
PROOF_SERVER_IMAGE=proof-server-bootstrap:8.0.3 ./run.sh
```

Use `packages/use-cases/university/operator-guide.md` when choosing university BDD, proof-server, standalone, cohort, stress, and summary lanes.

## Packaging

```bash
npm run artifacts:pack
./upgrade-libs.sh --destination /path/to/downstream-repo
```

Use `tooling/artifacts/npm/` and `tooling/vendor/`; do not hand-copy `dist/`.

## MCP

Use a user-level Midnight MCP config when available; do not commit personal MCP files:

```toml
[mcp_servers.midnight]
command = "npx"
args = ["-y", "midnight-mcp@latest"]
```
