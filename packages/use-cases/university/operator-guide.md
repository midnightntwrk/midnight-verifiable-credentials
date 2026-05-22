# University Diploma Operator Guide

Status: authoritative local runbook for the university diploma use case.

Use this guide when you want to run the university scenarios, inspect the
request/response DTOs, compare simulator and standalone timing, or decide which
lane belongs in a pull request.

## Fast Path

From the repository root:

```bash
./run.sh university-ci-matrix
./run.sh university-bdd
open packages/use-cases/university/scenarios/target/site/serenity/index.html
```

That gives you:

- the generated lane contract check
- the readable 10-student Serenity/JS BDD report
- student, issuer, employer, and mall request/response notes in the report
- issuance, job-application, mall-discount, and negative-path coverage

If you only need protocol-level checks and already have build artifacts:

```bash
./run.sh university-protocol --light
./run.sh university-protocol-export --light
./run.sh university-protocol-cohort --light
./run.sh university-protocol-stress --light
```

## Execution Lanes

<!-- university-operator-lanes:start -->
| Goal | Command | Main output | When to run |
| --- | --- | --- | --- |
| Validate lane wiring | `./run.sh university-ci-matrix` | generated matrix contract | Any run.sh, package.json, workflow, or university lane contract change. |
| Check fixture drift | `./run.sh university-data-profiles` | generator/profile validation | Any change to packages/use-cases/university/data or data-profile registry scripts. |
| Check policy drift | `./run.sh university-policy-catalog` | verifier preset coverage | Any change to university verifier policies, request presets, or protocol disclosure logic. |
| Read the executable story | `./run.sh university-bdd` | Serenity report | Narrative scenario, BDD step, or readable report behavior changes. |
| See proof-server DTO boundaries | `./run.sh university-bdd-proof-server` | Serenity report with proof exchanges | Proof-backend, proof-server contract, or protocol DTO boundaries change. |
| Measure standalone DID bootstrap | `./run.sh university-bdd-standalone` | standalone timing summary | Standalone environment, DID bootstrap, or proof-backend timing changes. |
| Sweep issuance batches | `./run.sh university-batch-sweep` | batch-sweep JSON/Markdown | Issuer batching, batch metrics, or reporting summary inputs change. |
| Run protocol tests | `./run.sh university-protocol` | package tests | Protocol agents, transports, persistence, proof backend, or transcript logic changes. |
| Export readable transcript | `./run.sh university-protocol-export` | transcript and decisions artifacts | Transcript schema, application decision schema, or export formatting changes. |
| Run 30-student cohort profile | `./run.sh university-protocol-cohort` | sampled cohort summary | Cohort data, profile summary schema, or sampled transcript behavior changes. |
| Run 100-student stress profile | `./run.sh university-protocol-stress` | stress summary | Stress data, throughput summary, or protocol profile performance behavior changes. |
| Aggregate handoff summary | `./run.sh university-summary` | one-page JSON/Markdown report | Reporting package, summary schema, or aggregate artifact wiring changes. |
| Inspect report contract | `./run.sh university-report-contract` | contract JSON | Reporting schema, handoff artifact ids, source artifact ids, or privacy-profile requirements change. |
<!-- university-operator-lanes:end -->

The machine-readable lane catalog is generated at
[`./ci-matrix.md`](./ci-matrix.md). Regenerate or verify it with:

```bash
npm run --silent build:university-ci-matrix:markdown > packages/use-cases/university/ci-matrix.md
npm run update:university-operator-guide
npm run check:university-ci-matrix
```

## Backend Modes

| Mode | Command | DID behavior | Proof behavior | Use it for |
| --- | --- | --- | --- | --- |
| `simulator` | `./run.sh university-bdd` | fixture DID identifiers from committed JSON | local deterministic simulator proofs | readable report and functional checks |
| `proof-server-contract` | `./run.sh university-bdd-proof-server` | fixture DID identifiers from committed JSON | simulator semantics plus recorded proof-server request/response DTOs | validating remote proof API shape before a real server is wired |
| `standalone-hybrid` | `./run.sh university-bdd-standalone` | generated standalone DID overlays for university, students, companies, and mall | hybrid backend still uses simulator proof semantics today | measuring real environment startup, wallet sync, DID provisioning, overlay generation, and teardown |

Current boundary:

- the simulator and proof-server-contract modes do not boot standalone Midnight
  infrastructure
- the standalone-hybrid mode uses real standalone DID provisioning but does not
  claim full real-proof execution yet
- the proof-server-contract mode records DTOs for a future proof-server
  transport; it is not a networked proof-server integration
- no university lane currently models a production multi-process SSI deployment
  with issuer-key isolation

## Actor And DID Model

The university use case has four actor classes:

- university issuer
- student holders
- company verifiers
- mall verifier

The readable fixture profile uses:

- 1 university
- 10 students
- 3 companies
- 1 mall
- 2 issuance batches of 5 students
- 5 mall-discount applicants

The richer protocol profiles use:

- `cohort-30`: 30 students, 6 companies, 3 issuance batches, 10 discount
  applicants
- `stress-100`: 100 students, 5 issuance batches, fixed 5-applicant mall
  discount control sample

In simulator-style lanes, the DIDs are the committed fixture identifiers in:

- [`./data/university.json`](./data/university.json)
- [`./data/students.json`](./data/students.json)
- [`./data/companies.json`](./data/companies.json)
- [`./data/mall.json`](./data/mall.json)

In standalone-hybrid lanes, the harness provisions generated DID overlays at
runtime and writes initialization metadata under:

```text
packages/use-cases/university/scenarios/target/standalone-hybrid-data/backend-metadata.json
```

Treat that file as initialization metadata. The authoritative end-of-run timing
record is:

```text
packages/use-cases/university/scenarios/target/standalone-timing/summary.json
```

## Report And Artifact Map

| Artifact | Producer | Meaning |
| --- | --- | --- |
| `scenarios/target/site/serenity/index.html` | `university-bdd`, `university-bdd-proof-server`, `university-bdd-standalone` | human-readable scenario report |
| `scenarios/target/standalone-timing/summary.json` | `university-bdd-standalone` | startup, wallet sync, DID provisioning, overlay, shutdown, proof-phase totals |
| `scenarios/target/standalone-timing/summary.md` | `university-bdd-standalone` | human-readable timing digest |
| `scenarios/target/batch-sweep/summary.json` | `university-batch-sweep` | issuance batch-size and compile-concurrency projection data |
| `scenarios/target/batch-sweep/summary.md` | `university-batch-sweep` | batch-sweep table for humans |
| `protocol/target/readable-10/transcript-export.json` | `university-protocol-export` | readable protocol transcript export |
| `protocol/target/readable-10/transcript-export.md` | `university-protocol-export` | readable transcript digest |
| `protocol/target/readable-10/application-decisions-export.json` | `university-protocol-export` | job and mall verifier decision DTOs |
| `protocol/target/readable-10/application-decisions-export.md` | `university-protocol-export` | job and mall verifier decision digest |
| `protocol/target/cohort-30/summary.json` | `university-protocol-cohort` | 30-student sampled profile summary |
| `protocol/target/cohort-30/summary.md` | `university-protocol-cohort` | 30-student sampled profile digest |
| `protocol/target/stress-100/summary.json` | `university-protocol-stress` | 100-student throughput profile summary |
| `protocol/target/stress-100/summary.md` | `university-protocol-stress` | 100-student profile digest |
| `reporting/target/summary.json` | `university-summary` | one-page aggregate machine-readable summary |
| `reporting/target/summary.md` | `university-summary` | one-page human handoff summary |
| `reporting/target/artifact-manifest.json` | `university-summary` | source artifact index with schema versions, producers, byte sizes, and SHA-256 digests |
| `reporting/target/artifact-manifest.md` | `university-summary` | human-readable source artifact index |

The reporting paths above are generated outputs. They are intended for local
inspection and CI retention, not for ordinary source-control edits.
The aggregate summary includes the transcript privacy-profile section, so
`university-summary` is the fastest lane for checking whether the readable
direct-claim prototype and production commitment-profile guidance stayed aligned
after transcript-export changes.

## Reading The Serenity Report

Open the report after any BDD lane:

```bash
open packages/use-cases/university/scenarios/target/site/serenity/index.html
```

Useful report sections:

- issuance steps show the graduating class, accepted issuance requests, batch
  partitioning, delivered credentials, and report metrics
- job-application steps show representative student-to-company request,
  submission, and verifier result DTOs
- mall-discount steps show representative student-to-mall request, submission,
  and verifier result DTOs
- proof-server-contract runs add proof-server operation IDs and recorded
  request/response DTO boundaries
- negative-flow steps show the failed policy, duplicate-thread, tampered
  credential, holder-DID, or proof-signer invariant and the expected rejection
  kind

The step notes are intentionally verbose. They are the fastest way to inspect:

- which DID each party used
- which verification method signed the credential or presentation
- which credential was issued
- which presentation request was built
- which presentation submission was verified
- which rejection reason was expected on negative paths

## Common Recipes

### Verify a university-only PR

```bash
./run.sh university-ci-matrix
./run.sh university-data-profiles
./run.sh university-policy-catalog
./run.sh university-protocol --light
npm run docs:links
```

Add the specific lane that matches your change:

- BDD wording or report DTO changes: `./run.sh university-bdd`
- proof-server DTO boundary changes: `./run.sh university-bdd-proof-server`
- standalone bootstrap or timing changes: `./run.sh university-bdd-standalone`
- batch issuance timing changes: `./run.sh university-batch-sweep`
- transcript schema changes: `./run.sh university-protocol-export --light`
- cohort/stress profile changes: `./run.sh university-protocol-cohort --light`
  and `./run.sh university-protocol-stress --light`
- aggregate report changes: `./run.sh university-summary --light`

### Rebuild all profile artifacts for a handoff

```bash
./run.sh university-bdd
./run.sh university-protocol-export
./run.sh university-protocol-cohort
./run.sh university-protocol-stress
./run.sh university-batch-sweep
./run.sh university-summary
```

Use this when preparing a demo or when you want all report surfaces to reflect
the same branch.

### Inspect protocol DTOs without Serenity

```bash
./run.sh university-protocol-export --light
open packages/use-cases/university/protocol/target/readable-10/transcript-export.md
```

Use the JSON forms when building downstream tooling:

```text
packages/use-cases/university/protocol/target/readable-10/transcript-export.json
packages/use-cases/university/protocol/target/readable-10/application-decisions-export.json
packages/use-cases/university/protocol/target/readable-10/application-decisions-export.md
packages/use-cases/university/reporting/target/artifact-manifest.json
```

### Measure real standalone timing

```bash
./run.sh university-bdd-standalone
open packages/use-cases/university/scenarios/target/standalone-timing/summary.md
```

Requirements:

- Docker must be available
- only run one standalone stack at a time unless the infrastructure grows
  explicit per-stack port overrides
- expect this lane to be slower than simulator/proof-server-contract modes

## CI Selection Rules

The GitHub Actions workflow classifies changed files before choosing heavy
lanes.

High-level behavior:

- docs-only changes run the docs fast path
- BDD-only changes run the BDD smoke path
- global workflow/package/runner changes trigger the broad heavy lanes
- university package/data/protocol/family changes trigger `University
  Validation`

`University Validation` currently runs:

- committed data/profile checks
- request-policy catalog checks
- `cohort-30` protocol profile
- `stress-100` protocol profile
- upload of the generated cohort and stress summaries as
  `university-protocol-targets`

The exact local/CI mapping is generated in [`./ci-matrix.md`](./ci-matrix.md).

## When Not To Use This Use Case

Do not treat the university harness as:

- a production SSI deployment
- a proof-server network transport reference
- a full standalone proof execution benchmark
- a revocation/status example
- an issuer-key isolation reference

Use it as:

- a DID-backed VC issuance and presentation blueprint
- a readable BDD story for issuer, holder, and verifier interactions
- a protocol DTO and transcript-export harness
- a standalone DID bootstrap timing experiment
- a CI-friendly maturity surface for the university diploma family
