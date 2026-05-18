# VC Maturity and University Closeout Wave

Status: active 20-iteration execution plan targeting `origin/develop`.

Purpose:

- finish the remaining university scope without reviving stale wrong-base PRs
- close repository-owned VC maturity work that is still actionable in this repo
- keep upstream Compact/runtime blockers separate from ordinary repository work
- keep every iteration large enough to be reviewable as a meaningful PR

Ground rules:

- all PRs target `develop`
- keep the active stack shallow; prefer depth `1`, depth `2` only when CI is
  already locally green and the next slice is clearly downstream
- each PR must include focused local validation and a Claude PR review pass
- update this file after every PR and refresh the wider backlog every five PRs

## Merged Through 2026-05-18

The current `origin/develop` baseline has advanced through:

- university runtime/backend/proof-server closeout: `#236` through `#244`
- generated-artifact and CI cone audit: `#245`, `#246`
- mixed public/direct plus committed/private claim-representation profile:
  `#247`

Important carry-forward rule from `#247`:

- use `VC<TPublicClaims, TClaimCommitments, THolderBinding, TStatusBinding>`
- use `NoPublicClaims` for commitment-only credentials
- use `NoClaimCommitments` for direct-only credentials
- call commitment structs `*ClaimCommitments`, not generic `*Claims`
- document every field as public/direct, selectively disclosed,
  committed-private, or predicate-only

## Iteration Plan

1. `university-flow-module-split`

- status: implemented locally on `codex/vc-university-flow-modules`
- scope:
  - split student, issuer, company, and mall protocol agents out of `flow.ts`
  - split transcript and message helper utilities into internal modules
  - keep `UniversityProtocolFlowRunner` public API stable
- validation:
  - `npm run lint -w ./use-cases/university/protocol`
  - `npm run typecheck:university-protocol`
  - `npm run test:university-protocol`
  - `npm run docs:links`

2. `university-policy-catalog-audit`

- status: implemented locally on `codex/vc-university-policy-catalog-audit`
- scope:
  - make verifier policy coverage explicit across companies and mall
  - add fixture drift checks that prove policy presets cover the BDD fixtures
  - document policy rationale per request preset
- validation:
  - `./run.sh university-policy-catalog`
  - `npm run test:university-policy-catalog`

3. `university-proof-server-backend-contract`

- status: implemented locally on `codex/vc-university-proof-server-backend-contract`
- scope:
  - define a concrete proof-server backend interface for the university proof
    execution seam
  - add deterministic contract tests with a fake proof-server adapter
  - document which simulator proofs map to remote proof calls
- validation:
  - `npm exec -w ./use-cases/university/protocol -- vitest run src/test/proof-server-contract.test.ts`
  - `npm run test:university-protocol`

4. `university-proof-server-bdd-wiring`

- status:
  [PR #236](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/236)
  merged to `develop` from `codex/vc-university-proof-server-runner-wiring`
- scope:
  - make the proof-server contract backend selectable from the university BDD
    runner
  - surface recorded proof-server request/response exchanges in Serenity step
    insight DTOs
  - add root and workspace run targets for the proof-server BDD lane

5. `university-standalone-timing-telemetry`

- status:
  [PR #237](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/237)
  merged to `develop` from `codex/vc-university-standalone-timing-telemetry`
- scope:
  - expand standalone-hybrid metrics for DID bootstrap, overlay generation,
    proof backend phases, and teardown
  - emit machine-readable timing artifacts for local comparison
- validation:
  - `./run.sh university-bdd`
  - `./run.sh university-bdd-proof-server`
  - `npm run test:standalone-timing:contract -w use-cases/university/scenarios`
  - `npm run test:backend-mode:contract -w use-cases/university/scenarios`
  - `npm run typecheck -w use-cases/university/scenarios`
  - `npm run docs:links`
  - `bash -n run.sh`
  - `git diff --check`

6. `university-issuer-batch-concurrency-prototype`

- status:
  [PR #238](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/238)
  merged to `develop` from `codex/vc-university-issuer-batch-concurrency`
- scope:
  - add deterministic fixture-construction compile-concurrency projections to
    the issuance batch-sweep lane
  - preserve the readable lane as sequential
  - report correctness and timing deltas side by side
- validation:
  - `npm run test:batch-sweep:contract -w use-cases/university/scenarios`
  - `npm run test:batch-sweep -w use-cases/university/scenarios`
  - `npm run test -w use-cases/university/reporting`
  - `npm run typecheck -w use-cases/university/scenarios`
  - `npm run typecheck -w use-cases/university/reporting`
  - `./run.sh university-batch-sweep`

7. `university-separate-process-simulator`

- status:
  [PR #239](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/239)
  merged to `develop` from `codex/vc-university-process-transport-simulator`
- scope:
  - add a serialized process-boundary transport for issuer, student, company,
    and mall protocol messages
  - keep the same transcript envelope shape as the in-process simulator
  - add transcript equivalence checks
- validation:
  - `npm exec -w ./use-cases/university/protocol -- vitest run src/test/process-transport.test.ts`
  - `npm run typecheck -w ./use-cases/university/protocol`
  - `npm run test:university-protocol`
  - `./run.sh university-protocol --light`

8. `university-protocol-persistence-restart`

- status:
  [PR #240](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/240)
  merged to `develop` from `codex/vc-university-protocol-persistence-restart`
- scope:
  - persist in-flight university protocol threads
  - simulate restart during issuance and presentation phases
  - document durable versus reconstructed state
- validation:
  - `npm exec -w ./use-cases/university/protocol -- vitest run src/test/restart-flow.test.ts`
  - `npm run typecheck -w ./use-cases/university/protocol`
  - `./run.sh university-protocol --light`

9. `university-large-cohort-pack`

- status:
  [PR #241](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/241)
  opened against `develop` from `codex/vc-university-large-cohort-pack`
- scope:
  - add a committed `cohort-30` data profile between `readable-10` and
    `stress-100`
  - increase role, award, company, credit, and mall-discount diversity
  - add a cohort protocol run target and light lane
  - keep cohort/stress reports readable through sampled transcript views
- validation:
  - `./run.sh university-data-profiles`
  - `./run.sh university-policy-catalog`
  - `npm exec -w ./use-cases/university/protocol -- vitest run src/test/stress-export.test.ts src/test/policy-catalog.test.ts`
  - `./run.sh university-protocol-cohort --light`

10. `university-ci-matrix-refinement`

- status: implemented locally on `codex/vc-university-ci-matrix-refinement`
- scope:
  - make university-specific build/test cones explicit
  - retain report artifacts predictably
  - document local, PR, and dispatch lane selection
- validation:
  - `./run.sh university-ci-matrix`
  - `npm run check:university-ci-matrix`
  - `npm run build:university-ci-matrix:json`
  - `npm run docs:links`
  - `npm run check:run-target-contract`
  - `bash -n run.sh && git diff --check`

11. `university-reference-guide-closeout`

- status: implemented locally on `codex/vc-university-reference-guide-closeout`
- scope:
  - publish one authoritative end-to-end operator guide
  - cover readable, stress, standalone-hybrid, transcript export, and known
    proof-server boundaries
- validation:
  - `npm run docs:links`
  - `git diff --check`

12. `turbo-package-graph-generated-artifacts`

- status:
  [PR #245](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/245)
  opened from `codex/vc-generated-artifact-audit`
- scope:
  - identify package-local generated-artifact coupling that prevents safe
    parallel Turbo execution
  - move or document generated outputs so build cones become deterministic
- validation:
  - `npm run check:ci-build-cones`
  - `npm run docs:links`
  - `git diff --check`

13. `turbo-build-cone-contracts`

- status: in progress on `codex/vc-turbo-build-cone-contracts`
- scope:
  - add guardrails for root runner targets and Turbo filter contracts
  - prevent future CI drift between package graph and documented cones
- validation:
  - `npm run check:ci-workflow-cones`
  - `npm run check:ci-build-cones`
  - `npm run ci:lint`
  - `npm run docs:links`
  - `git diff --check`

14. `holder-binding-name-deprecation-closeout`

- status: planned
- scope:
  - finish deprecating stale holder-binding terminology in docs/comments
  - keep compatibility names explicit where they still exist

15. `compatibility-shim-and-path-hygiene`

- status: planned
- scope:
  - audit generated `midnight-did-credentials*` compatibility shims
  - clean stale paths that imply old package roots are canonical

16. `did-tarball-hello-smoke-matrix`

- status: planned
- scope:
  - keep DID tarball compatibility assumptions explicit
  - add/update hello-smoke matrix docs and checks for adapter movement

17. `status-live-root-upstream-boundary`

- status: planned
- scope:
  - keep final live-root non-membership documented as an upstream boundary
  - add conformance notes that prevent repo-local work from overstating status
    maturity

18. `orchestration-transport-boundary`

- status: planned
- scope:
  - clarify what the reference orchestration layer does and does not provide
  - add transport-boundary tests or fixtures where current docs are too broad

19. `surface-change-release-discipline`

- status: planned
- scope:
  - tighten changelog and release-note conventions for compatibility-significant
    package surface changes
  - add contributor guidance for future PRs

20. `repo-audit-and-closeout-report`

- status: planned
- scope:
  - add lightweight checks for stale docs links, package inventory drift, and
    current/future scope markers
  - wire the checks into docs-only or light CI where appropriate
  - reconcile the maturity, university, repository-audit, and Obsidian backlogs
  - publish a final remaining-risk summary and next-wave recommendation
