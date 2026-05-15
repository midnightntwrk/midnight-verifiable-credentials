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

4. `university-standalone-timing-telemetry`
- status: planned
- scope:
  - expand standalone-hybrid metrics for DID bootstrap, overlay generation,
    proof backend phases, and teardown
  - emit machine-readable timing artifacts for local comparison

5. `university-issuer-batch-concurrency-prototype`
- status: planned
- scope:
  - add controlled batch-signing or fixture-construction concurrency
  - preserve the readable lane as sequential
  - report correctness and timing deltas side by side

6. `university-separate-process-simulator`
- status: planned
- scope:
  - run issuer, student, company, and mall roles across process boundaries
  - keep the same transcript envelope shape as the in-process simulator
  - add transcript equivalence checks

7. `university-protocol-persistence-restart`
- status: planned
- scope:
  - persist in-flight university protocol threads
  - simulate restart during issuance and presentation phases
  - document durable versus reconstructed state

8. `university-large-cohort-pack`
- status: planned
- scope:
  - add an intermediate richer cohort beyond `readable-10` and `stress-100`
  - increase role and company diversity
  - keep reports readable through sampled transcript views

9. `university-ci-matrix-refinement`
- status: planned
- scope:
  - make university-specific build/test cones explicit
  - retain report artifacts predictably
  - document local, PR, and dispatch lane selection

10. `university-reference-guide-closeout`
- status: planned
- scope:
  - publish one authoritative end-to-end operator guide
  - cover readable, stress, standalone-hybrid, transcript export, and known
    proof-server boundaries

11. `turbo-package-graph-generated-artifacts`
- status: planned
- scope:
  - identify package-local generated-artifact coupling that prevents safe
    parallel Turbo execution
  - move or document generated outputs so build cones become deterministic

12. `turbo-build-cone-contracts`
- status: planned
- scope:
  - add guardrails for root runner targets and Turbo filter contracts
  - prevent future CI drift between package graph and documented cones

13. `holder-binding-name-deprecation-closeout`
- status: planned
- scope:
  - finish deprecating stale holder-binding terminology in docs/comments
  - keep compatibility names explicit where they still exist

14. `compatibility-shim-and-path-hygiene`
- status: planned
- scope:
  - audit generated `midnight-did-credentials*` compatibility shims
  - clean stale paths that imply old package roots are canonical

15. `did-tarball-hello-smoke-matrix`
- status: planned
- scope:
  - keep DID tarball compatibility assumptions explicit
  - add/update hello-smoke matrix docs and checks for adapter movement

16. `status-live-root-upstream-boundary`
- status: planned
- scope:
  - keep final live-root non-membership documented as an upstream boundary
  - add conformance notes that prevent repo-local work from overstating status
    maturity

17. `orchestration-transport-boundary`
- status: planned
- scope:
  - clarify what the reference orchestration layer does and does not provide
  - add transport-boundary tests or fixtures where current docs are too broad

18. `surface-change-release-discipline`
- status: planned
- scope:
  - tighten changelog and release-note conventions for compatibility-significant
    package surface changes
  - add contributor guidance for future PRs

19. `repo-audit-automation`
- status: planned
- scope:
  - add lightweight checks for stale docs links, package inventory drift, and
    current/future scope markers
  - wire the checks into docs-only or light CI where appropriate

20. `vc-maturity-closeout-report`
- status: planned
- scope:
  - reconcile the maturity, university, repository-audit, and Obsidian backlogs
  - publish a final remaining-risk summary and next-wave recommendation
