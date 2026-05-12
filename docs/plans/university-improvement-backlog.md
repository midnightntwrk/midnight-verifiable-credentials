# University Improvement Backlog

Status:

- ordered execution queue for the next university-focused stacked PR wave
- each item is intended to be large enough to stand as its own reviewable PR
- item `1` is opened on the stack as `#218`
- item `2` is the current in-flight slice on top of `#218`
- last reviewed: `2026-05-13`

Scope boundary:

- focus on the university diploma family, executable BDD scenarios, protocol
  harness, verifier contracts, reporting, and CI ergonomics
- do not reopen the broader VC maturity backlog that is already effectively
  closed on the current stack

## Queue

1. `negative-bdd-and-exercise-options`
- status:
  - opened on the stack as `#218`
- problem:
  - negative university flows still rely on ad hoc test mutation and are not visible in executable BDD
- scope:
  - add protocol exercise options for policy overrides and duplicate submissions
  - add readable negative BDD scenarios for invalid company policy and duplicate submissions
  - keep the report verbose and DTO-first
- validation:
  - university protocol tests
  - university BDD execution
- dependencies:
  - stacked on `#217`

2. `protocol-transcript-exporter`
- status:
  - current in-flight slice
- problem:
  - the report is human-readable, but downstream tooling still lacks a stable machine-readable university transcript export
- scope:
  - add JSON and Markdown transcript exporters
  - emit per-thread summaries and rejection-kind breakdowns
  - wire a root runner target
- validation:
  - exporter smoke test
  - golden-file diff
- dependencies:
  - `1`

3. `stress-artifact-publication`
- problem:
  - the 100-student stress lane produces local output only
- scope:
  - normalize the summary schema
  - emit compact Markdown and JSON artifacts
  - document how CI should retain them
- validation:
  - stress lane
  - schema test
- dependencies:
  - `2`

4. `tampered-diploma-negative-pack`
- problem:
  - the university stories do not yet expose credential tampering failures as user-facing scenarios
- scope:
  - add protocol and BDD cases for claim-root tampering, proof mismatch, and issuer mismatch
  - expose rejection-kind and explanation assertions in the report
- validation:
  - protocol negative tests
  - BDD negative feature execution
- dependencies:
  - `1`

5. `holder-binding-negative-pack`
- problem:
  - holder-binding misuse is only indirectly covered today
- scope:
  - add wrong-holder and wrong-method negative flows
  - document the simplest holder-binding boundary in the university narrative
- validation:
  - family-level tests
  - protocol negative tests
- dependencies:
  - `4`

6. `issuance-idempotency-guard`
- problem:
  - batch issuance is deterministic, but duplicate issuance-request semantics are not explicitly guarded
- scope:
  - add issuance duplicate detection or explicit idempotency policy
  - expose replay outcomes in issuance transcripts and BDD summaries
- validation:
  - protocol/issuance tests
  - BDD issuance replay scenario
- dependencies:
  - `1`

7. `batch-sweep-benchmark-automation`
- problem:
  - current bottleneck data is point-in-time and tied to one batch size
- scope:
  - sweep batch sizes across fixed datasets
  - emit summary tables for compile/sign/delivery phases
  - add a root runner target
- validation:
  - batch sweep script
  - summary snapshot
- dependencies:
  - `3`

8. `scenario-data-profile-registry`
- problem:
  - readable and stress datasets exist, but profile selection is still implicit
- scope:
  - formalize profile presets such as `readable-10`, `stress-100`, and future larger sets
  - unify generator entrypoints and drift checks
- validation:
  - generator checks
  - profile smoke tests
- dependencies:
  - `3`

9. `protocol-trace-schema-versioning`
- problem:
  - transcript consumers have no explicit schema/version contract
- scope:
  - define a trace schema version
  - add compatibility tests
  - document upgrade expectations
- validation:
  - schema conformance tests
  - exporter snapshots
- dependencies:
  - `2`

10. `verifier-request-preset-library`
- problem:
  - company and mall request policies are duplicated as raw fixture payloads
- scope:
  - extract named request presets for common verifier patterns
  - reuse them across protocol, contract tests, and BDD fixtures
- validation:
  - contract tests
  - fixture drift checks
- dependencies:
  - `8`

11. `flow-module-split`
- problem:
  - `use-cases/university/protocol/src/flow.ts` is still too large for comfortable maintenance
- scope:
  - split agents, result projections, transcript helpers, and runner wiring into focused modules
  - keep public API stable
- validation:
  - protocol tests
  - package boundary checks
- dependencies:
  - `9`

12. `serenity-report-summarizer`
- problem:
  - the raw Serenity report is still verbose when you want a one-page status summary
- scope:
  - add a compact report summarizer that surfaces actors, counts, timings, and key rejections
  - link it from the scenario README
- validation:
  - summarizer smoke test
  - report fixture
- dependencies:
  - `2`

13. `application-decision-artifacts`
- problem:
  - successful job applications do not emit a stable artifact per company/student
- scope:
  - produce deterministic application-decision summaries
  - connect them to transcript export and stress summaries
- validation:
  - artifact schema test
  - golden outputs
- dependencies:
  - `2`

14. `policy-catalog-and-fixture-audit`
- problem:
  - the policy space is still small and partially implicit
- scope:
  - add a catalog of verifier policies with disclosure rationale
  - audit current fixture coverage against that catalog
- validation:
  - docs link checks
  - fixture coverage report
- dependencies:
  - `10`

15. `issuer-batch-concurrency-prototype`
- problem:
  - issuance metrics are strictly sequential and do not expose a concurrency experiment
- scope:
  - add a controlled prototype for parallel fixture construction or signing stages
  - keep the readable lane sequential
- validation:
  - benchmark script
  - correctness regression tests
- dependencies:
  - `7`

16. `separate-process-university-sim`
- problem:
  - the current virtual-agent harness is intentionally in-process only
- scope:
  - prototype a separate-process simulation boundary for issuer/student/verifier roles
  - keep the same transcript envelope shape
- validation:
  - process smoke test
  - transcript equivalence check
- dependencies:
  - `9`

17. `protocol-persistence-restart-sim`
- problem:
  - the university flow has no restart/recovery story
- scope:
  - persist in-flight protocol threads
  - simulate restart during issuance and presentation phases
  - document what is and is not durable
- validation:
  - restart tests
  - transcript consistency checks
- dependencies:
  - `16`

18. `large-cohort-scenario-pack`
- problem:
  - only 10-student readable and 100-student stress lanes are first-class today
- scope:
  - add an intermediate scenario pack with richer role diversity and more companies
  - keep the report readable via sampled transcript views
- validation:
  - scenario execution
  - stress summary checks
- dependencies:
  - `8`

19. `university-ci-matrix-refinement`
- problem:
  - university lanes are growing, but CI selection and artifact reuse are still coarse
- scope:
  - make university-specific cones and report artifacts explicit
  - add dedicated lane selection docs
- validation:
  - CI output-group checks
  - docs links
- dependencies:
  - `3`

20. `reference-guide-closeout`
- problem:
  - once the stack stabilizes, the university use case still needs a single authoritative operator guide
- scope:
  - publish one end-to-end reference guide covering readable lane, stress lane, transcript export, and known boundaries
  - align repo navigation around it
- validation:
  - docs link checks
  - command smoke checks
- dependencies:
  - `12`, `13`, `19`
