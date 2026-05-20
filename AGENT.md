# AGENT

Engineering guide for agents and engineers working in `midnight-verifiable-credentials`.

This repository can be cloned independently or checked out as `midnight-identity-workspace/midnight-verifiable-credentials`. When it is used inside the workspace, also read the workspace-root `AGENT.md` for cross-repo coordination. This file is the authority for VC repository package boundaries, validation, packaging, BDD, and standalone integration behavior.

## Purpose

`midnight-verifiable-credentials` owns the Midnight Verifiable Credentials stack:

- Compact-first VC/VP primitives
- public/direct claims and commitment-backed claim representation
- holder-binding and same-holder capabilities
- credential-family reference packages
- status and revocation capability work
- OpenID-shaped protocol bindings
- protocol orchestration helpers
- runnable use cases and BDD living documentation
- standalone integration infrastructure

DID method implementation belongs in `midnight-did`. Product-specific Passport flows belong in `midnight-identity-solution-examples` or product repos.

## Quick Start

Prerequisites:

- Node.js 24
- Docker for standalone integration lanes
- Midnight Compact toolchain
- Nix is the preferred shared setup when working from `midnight-identity-workspace`

Standalone setup:

```bash
npm ci
compact update 0.30.0
```

Workspace setup:

```bash
cd /path/to/midnight-identity-workspace
nix develop
cd midnight-verifiable-credentials
npm ci
```

Discover runner targets:

```bash
./run.sh targets
```

Fast validation:

```bash
./run.sh --light
```

Full validation:

```bash
PROOF_SERVER_IMAGE=proof-server-bootstrap:8.0.3 ./run.sh
```

## Midnight MCP Configuration

For Codex or another MCP-capable client, configure the Midnight MCP server at user level. Do not commit personal MCP config or tokens.

```toml
[mcp_servers.midnight]
command = "npx"
args = ["-y", "midnight-mcp@latest"]
```

Use it to inspect Compact entry points, TypeScript package exports, generated `src/managed` outputs, package dependency surfaces, and DID/VC wiring. Always confirm changes with local scripts and tests.

## Repo-Local Codex Skill

This repository distributes a lightweight Codex skill at `.codex/skills/midnight-identity/`.

Use it when a task starts from an independent `midnight-verifiable-credentials` clone and needs VC-specific validation, BDD, university, status/revocation, CI-cone, packaging, or DID/VC boundary reminders. The skill intentionally points agents back to this `AGENT.md` as the detailed source of truth.

## Repository Layout

| Path | Role |
| --- | --- |
| `docs/` | Normative specs, guides, architecture notes, test strategy, plans, decisions, and templates. |
| `packages/core/` | Reusable VC primitives and capabilities. |
| `packages/registry/` | Registry packages, currently status/revocation registry work. |
| `packages/protocols/` | Transport/protocol bindings such as OpenID-shaped schemas and Compact framing. |
| `packages/components/` | Runtime adapters, protocol orchestration, and standalone integration helpers. |
| `packages/prototypes/` | Reference credential-family packages and experimental/lab surfaces. |
| `packages/use-cases/` | Concrete runnable flows, BDD living documentation, demo contracts, and university scenarios. |
| `tooling/` | Build, artifact, vendor, runner, scaffolding, and package-boundary scripts. |
| `assets/` | Static explanatory assets used by docs/use cases. |

BDD belongs under `packages/use-cases/`, not under low-level package tests or prototype-only directories.

## Package Map

| Path | Package | Responsibility |
| --- | --- | --- |
| `packages/core/primitives/credentials` | `@midnight-ntwrk/midnight-did-credentials` | Generic VC/VP Compact primitives, claim envelope, holder/status binding types, proof helpers. |
| `packages/core/capabilities/same-holder` | `@midnight-ntwrk/midnight-did-credentials-same-holder` | Same-holder composition capability. |
| `packages/core/primitives/iso-registry` | `@midnight-ntwrk/midnight-did-credentials-iso-registry` | ISO-style registry primitives. |
| `packages/registry/status-registry` | `@midnight-ntwrk/midnight-did-credentials-status-registry` | Status/revocation registry reference package and witness-builder helpers. |
| `packages/components/adapters/offchain-did` | `@midnight-ntwrk/midnight-did-credentials-offchain-did` | DID-aware offchain holder-binding runtime helpers. |
| `packages/components/integration/standalone-environment` | `@midnight-ntwrk/midnight-did-standalone-environment` | Standalone Midnight/DID runtime bootstrap for integration tests. |
| `packages/components/orchestration/protocol` | `@midnight-ntwrk/midnight-did-credentials-protocol` | Issuer/holder/verifier protocol-state orchestration and reference lifecycle tests. |
| `packages/protocols/openid` | `@midnight-ntwrk/midnight-did-credentials-openid` | OID4VCI/OID4VP-shaped Zod schemas and Compact value framing. |
| `packages/prototypes/credential-families/birth` | `@midnight-ntwrk/midnight-did-credentials-birth` | Explicit-holder birth credential family. |
| `packages/prototypes/credential-families/birth-secret` | `@midnight-ntwrk/midnight-did-credentials-birth-secret` | Hidden/secret-holder birth credential family. |
| `packages/prototypes/credential-families/hello-family` | `@midnight-ntwrk/midnight-did-credentials-hello-family` | Small DID-aware hello credential family. |
| `packages/prototypes/credential-families/dummy-claims` | `@midnight-ntwrk/midnight-did-credentials-dummy-claims` | Broad direct-claims verifier lab. |
| `packages/prototypes/credential-families/mixed-claims` | `@midnight-ntwrk/midnight-did-credentials-mixed-claims` | Reference lab for mixed public/direct and commitment-backed claims. |
| `packages/prototypes/credential-families/university-diploma` | `@midnight-ntwrk/midnight-did-credentials-university-diploma` | University diploma credential family. |
| `packages/use-cases/age-gate/contract` | `@midnight-ntwrk/midnight-did-credentials-demo-contract` | Generic age-gate and revocation-aware verifier demo contracts. |
| `packages/use-cases/age-gate/scenarios` | `vc-bdd-scenarios` | Age-gate Serenity/JS BDD scenarios. |
| `packages/use-cases/hello-verifier/contract` | `@midnight-ntwrk/midnight-did-hello-verifier-contract` | Hello verifier contract path. |
| `packages/use-cases/university/contract` | `@midnight-ntwrk/midnight-did-university-verifier-contract` | University verifier contract path. |
| `packages/use-cases/university/protocol` | `@midnight-ntwrk/midnight-did-university-protocol` | Multi-party university protocol flow and transcript exports. |
| `packages/use-cases/university/reporting` | `@midnight-ntwrk/midnight-did-university-reporting` | University reporting and summary artifacts. |
| `packages/use-cases/university/scenarios` | `vc-university-bdd-scenarios` | University diploma Serenity/JS BDD scenarios. |

## Core Claim Representation

The generic VC envelope is:

```text
VC<TPublicClaims, TClaimCommitments, THolderBinding, TStatusBinding>
```

Rules:

- `claims` is the signed public/direct claim surface.
- `claimCommitments` is the signed commitment surface.
- Use `NoPublicClaims` for commitment-only credential families.
- Use `NoClaimCommitments` for direct-only credential families.
- Name commitment-only structs with `*ClaimCommitments`, for example `BirthCredentialClaimCommitments`.
- Do not reintroduce a nested generic `publicClaims/privateClaims` envelope.
- Each credential-family README should describe every field as public/direct, selectively disclosed, committed-private, or predicate-only.

Reference docs and labs:

- `docs/spec/claim-representation.md`
- `docs/spec/midnight-credentials.md`
- `packages/prototypes/credential-families/mixed-claims`

## Compact Composition Rules

Compact does not deduplicate repeated `include` chains. Layer 3 contracts must not include multiple standalone family roots that each transitively include the same shared generic sources.

Preferred composition model:

- Include shared generic surfaces once.
- Use family composable entry points for multi-family contracts.
- Keep family-prefixed public names to avoid symbol collisions.
- Add package-surface tests when introducing a new public Compact entry point.

Important shared surfaces:

- `packages/core/primitives/credentials/src/credentials.compact`: standalone package root.
- `packages/core/primitives/credentials/src/credentials/composable.compact`: Layer 3 shared root.
- `packages/core/primitives/credentials/src/credentials/vc-support.compact`: VC/VP envelope and proof helpers.
- `packages/core/primitives/credentials/src/credentials/protocol-support.compact`: issuance/presentation protocol modules.
- `packages/core/primitives/credentials/src/credentials/bindings.compact`: holder-binding types and witness helpers.
- `packages/core/capabilities/same-holder/src/same-holder/composable.compact`: same-holder composition surface.

Generated outputs under `src/managed/**`, `dist/**`, and `*.tsbuildinfo` are build artifacts. Do not edit them manually.

## Development Cycle

1. Start from `origin/develop` unless asked otherwise.
2. Create a focused branch, normally with `codex/` prefix.
3. Update source, tests, package README, and spec/guide/test-matrix docs together.
4. Run the narrowest meaningful `./run.sh <target>` lane.
5. Run `./run.sh --light` before treating the repo as stable.
6. Run full or targeted Docker/BDD/protocol lanes for integration-sensitive changes.
7. Commit with DCO and GPG for repository-facing work.

Commit form:

```bash
git commit -S --signoff -m "<type>: <subject>"
```

## Runner Targets

Print target list:

```bash
./run.sh targets
```

Default full pipeline:

```bash
./run.sh
```

Light default pipeline:

```bash
./run.sh --light
```

Core lanes:

```bash
./run.sh lint
./run.sh typecheck
./run.sh build
./run.sh test
```

Focused lanes:

```bash
./run.sh hello-smoke
./run.sh dummy-claims-lab
./run.sh revocation
./run.sh integration-demo-contract
./run.sh integration-protocol
./run.sh integration
./run.sh clean-artifacts
./run.sh integration-report
./run.sh check-integration
```

BDD lanes:

```bash
./run.sh bdd
./run.sh bdd-negative
./run.sh bdd-all
```

University lanes:

```bash
./run.sh university-bdd
./run.sh university-bdd-proof-server
./run.sh university-bdd-standalone
./run.sh university-batch-sweep
./run.sh university-ci-matrix
./run.sh university-data-profiles
./run.sh university-policy-catalog
./run.sh university-protocol
./run.sh university-protocol-export
./run.sh university-protocol-cohort
./run.sh university-protocol-stress
./run.sh university-summary
```

`--light` is honored by selected targets including the default full lane, `build`, `typecheck`, `test`, `hello-smoke`, `dummy-claims-lab`, and the protocol-oriented university summary/stress/cohort/export lanes. If unsupported, the runner warns that `--light` is ignored.

## NPM Scripts and Guards

Important root guards:

```bash
npm run check:package-boundaries
npm run check:ci-build-cones
npm run check:ci-workflow-cones
npm run check:run-target-contract
npm run check:run-target-catalog
npm run check:managed-artifact-catalog
npm run check:did-integration
npm run check:vc-surface-discipline
npm run check:workspace-manifests
npm run check:holder-binding-terminology
npm run check:university-ci-matrix
npm run clean:artifacts
npm run report:did-integration
```

Build cones:

```bash
npm run build:cone:foundation
npm run build:cone:birth-family
npm run build:cone:age-gate
npm run build:cone:protocol
npm run build:all
```

CI-style lanes:

```bash
npm run ci:lint
npm run ci:typecheck
npm run ci:package-tests
npm run ci:revocation
npm run ci:hello-smoke
npm run ci:dummy-claims-lab
npm run ci:integration
npm run ci:university-protocol
```

## BDD and University Use Case

Age-gate BDD:

- `packages/use-cases/age-gate/scenarios`
- Smoke: `./run.sh bdd`
- Negative: `./run.sh bdd-negative`
- Full: `./run.sh bdd-all`

University BDD and protocol flows:

- `packages/use-cases/university/scenarios`: readable Serenity/JS BDD scenarios.
- `packages/use-cases/university/protocol`: multi-party protocol flow, transcript export, stress/cohort runners.
- `packages/use-cases/university/data`: committed fixture profiles for readable, cohort, and stress runs.
- `packages/use-cases/university/reporting`: summary/report generation.
- `packages/use-cases/university/operator-guide.md`: choose the right lane for local, CI, proof-server-contract, standalone-hybrid, cohort, stress, and summary workflows.

The university scenarios should make actor requests/responses, DIDs, issued credentials, and presentation material inspectable through report notes/artifacts while keeping the BDD text readable.

## Status and Revocation Model

Canonical direction:

- Use a revoked-set non-membership model over a dedicated status/revocation registry.
- The verifier/application supplies the accepted `(registryId, revokedRoot)`.
- The holder must not choose the accepted root unilaterally.
- Freshness is an application/verifier policy decision around the accepted root.
- The contract verifies consistency against supplied public inputs; it does not discover latest registry freshness on its own.

Current transitional capability includes authority-attested status evidence for request-bound flows. Long-term direction is holder-side non-membership proof consumption.

Key docs:

- `docs/spec/credential-status.md`
- `docs/spec/revocation-registry.md`
- `docs/spec/status-verification-protocol.md`
- `docs/architecture/status-verification-modes.md`
- `docs/plans/revocation-capability-options.md`

## Standalone Integration

Standalone integration helpers live in:

- `packages/components/integration/standalone-environment`
- `packages/components/integration/infrastructure/standalone`

Rules:

- Import `@midnight-ntwrk/midnight-did-standalone-environment` instead of reaching into parent repo paths.
- Keep VC standalone tests independent of a checked-out parent `midnight-did` repository.
- Use packed DID tarballs from `tooling/vendor/midnight-did` when unpublished DID packages are needed.
- Prefer repo-provided cleanup scripts over ad-hoc Docker cleanup.

Integration commands:

```bash
./run.sh integration-demo-contract
./run.sh integration-protocol
./run.sh integration
```

## Package Distribution Flow

Pack VC packages:

```bash
npm run artifacts:pack
```

Refresh a downstream repo or vendor directory:

```bash
./upgrade-libs.sh --destination /path/to/downstream-repo
```

Vendor/repair helpers run during install:

```bash
node ./tooling/scripts/ensure-midnight-did-package-aliases.mjs
node ./tooling/scripts/ensure-midnight-did-api-paths.mjs
node ./tooling/scripts/ensure-compact-package-aliases.mjs
```

Rules:

- Use `tooling/artifacts/npm/` as the stable packed-artifact output.
- Use `tooling/vendor/` for vendored unpublished dependencies.
- Do not hand-copy `dist/` output into consumers.
- Keep root npm `overrides` out unless there is a deliberate workspace-wide reason; packages that need vendored tarballs should pin them explicitly.
- Keep package `files` lists and build/prepack hooks correct so tarballs are self-sufficient.

## CI Shape

The main PR path is cone-based and should remain fast unless measurements regress.

Current CI pattern:

1. Classify changes as docs-only, BDD-only, or heavy-lane relevant.
2. Prepare Compact toolchain once.
3. Build shared artifacts by dependency cone.
4. Cache and fan out cone outputs.
5. Run lint, typecheck, package tests, and selected heavy lanes from restored artifacts.

Build cones:

- `foundation`
- `birth-family`
- `age-gate`
- `protocol`

Heavy/focused lanes:

- BDD smoke
- hello-smoke
- revocation
- standalone demo-contract integration
- standalone protocol integration
- university validation

Do not redesign CI broadly unless wall clock, cone invalidation, artifact correctness, or Compact complexity materially regresses.

## Documentation Rules

Normative/spec material:

- `docs/spec/`

Guides:

- `docs/guides/`

Architecture and package ownership:

- `docs/architecture/`

Testing evidence:

- `docs/testing/`

Plans and decisions:

- `docs/plans/`
- `docs/decisions/`

Package-local details belong in package `README.md` files.

High-value entry points:

- `docs/spec/midnight-credentials.md`
- `docs/spec/claim-representation.md`
- `docs/spec/profiles.md`
- `docs/spec/conformance.md`
- `docs/architecture/package-boundaries.md`
- `docs/architecture/package-tier-inventory.md`
- `docs/architecture/protocol-classification.md`
- `docs/testing/test-matrix.md`
- `docs/guides/package-selection.md`
- `docs/guides/midnight-credentials-for-dummies.md`
- `docs/plans/vc-maturity-backlog.md`
- `docs/plans/university-improvement-backlog.md`

Update docs when changing public APIs, generated credential literal shapes, package boundaries, CI lanes, BDD semantics, status/revocation semantics, or protocol flows.

## Cross-Repository Boundaries

Use `midnight-did` for:

- DID contract/method implementation
- DID document schemas and resolution
- DID API/runtime orchestration
- secret storage and shared DID signing primitives

Use this repo for:

- generic VC/VP packages
- reference credential families
- status/revocation capability
- protocol/adapters/orchestration
- university and age-gate use cases

Use `midnight-identity-solution-examples` for:

- Passport/product-specific flows
- product-specific credential families
- multi-origin browser demos

Use `midnight-trust-registry` for:

- trust-registry data model and governance integration work

When DID package changes are required here, land and pack DID first, then refresh this repo's vendored DID tarballs.

## Troubleshooting

Clean stale test infrastructure:

```bash
./tooling/scripts/cleanup-test-infra.sh
```

Common fixes:

- Missing DID tarball shape: refresh `tooling/vendor/midnight-did` from `midnight-did` artifacts.
- Missing Compact aliases: run `npm ci` or the `ensure-compact-package-aliases.mjs` helper.
- Missing managed outputs: run the owning build cone instead of copying generated files.
- Standalone Docker failure: run cleanup, verify Docker is running, then retry the focused integration lane.
- BDD report stale or unreadable: rerun the owning BDD lane and inspect `packages/use-cases/*/scenarios/target/site/serenity/`.
- University data drift: run `./run.sh university-data-profiles` and `./run.sh university-ci-matrix`.
