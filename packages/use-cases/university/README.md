# University Diploma Use Case

Status:

- large narrative prototype use case built on `credentials-university-diploma`
- data-rich SSI flow covering issuance, job-application verification, and student-discount verification
- operator guide covering local lane selection, backend boundaries, report paths,
  and CI artifact expectations
- BDD-style scenario set with bottleneck-oriented metrics
- human-readable BDD wording keyed to real actor names instead of raw data-file
  paths
- compileable verifier-side contract surface for employer and mall policies
- threaded protocol-style multi-party flow over the same deterministic actors and data
- protocol transport can now force every issuer, student, company, and mall
  message through a JSON process-boundary codec while preserving the in-process
  simulator result
- protocol restart simulation can now checkpoint in-flight issuance,
  job-application, and mall-discount threads, reload them through a fresh
  runner, and prove the restarted transcript still matches the baseline flow
- executable BDD job-application and discount paths now sourced from the same
  threaded protocol transcript, rather than a second parallel orchestration
- explicit negative-path coverage now includes malformed verifier policy,
  duplicate-thread replay, and tampered diploma submission scenarios with
  readable failure reasons
- holder-binding misuse is now exercised as a first-class negative path rather
  than being left only to family-level guards
- issuance-request replay is now an explicit scenario boundary: duplicate
  student submissions are counted and ignored idempotently, while the issuance
  report still proves one diploma credential per student
- separate 100-student protocol stress dataset and runner so throughput
  experiments do not make the human-readable BDD report unreadable
- committed stress-summary artifacts now have a stable JSON/Markdown contract
  for downstream CI publication
- named data profiles now define the canonical university fixtures:
  `readable-10` for human-readable narrative lanes, `cohort-30` for richer
  protocol/export maturity checks, and `stress-100` for throughput-oriented
  protocol lanes
- a machine-readable CI matrix now maps every university lane to its run target,
  package script, light-artifact profile, retained artifacts, and GitHub
  Actions selection rule
- a dedicated batch-sweep lane now compares issuance behavior across multiple
  batch sizes and projected compile-concurrency levels without mixing that
  experiment into the readable BDD report
- company and mall verifier policies are now keyed to named request presets so
  fixture JSON, contract tests, and readable BDD DTOs can all refer to the
  same policy catalog
- every request preset now carries policy-rationale text and is covered by
  a policy-catalog audit across both readable and stress fixtures
- one-page JSON/Markdown reporting now exists as a separate workspace package
  over the committed university artifact set
- the university BDD runner now has three execution backends:
  - `simulator` for the fast local reference lane
  - `proof-server-contract` for the simulator semantics plus recorded
    proof-server request/response DTO exchanges in the Serenity report
  - `standalone-hybrid` for real standalone DID bootstrap timings over the same
    readable university scenarios

## Purpose

This use case models a university that issues a non-revocable diploma VC to 10
students, then reuses that VC in two verifier flows:

- employer job applications across 3 companies
- a mall discount flow for students whose final grade meets the mall threshold
  (91)

The slice is intentionally explicit and operational:

- the university is a DID-backed issuer
- every student is a DID-backed agent
- every company is a DID-backed verifier
- the mall is a DID-backed verifier
- the holder binding is the simplest one in the repository:
  `ExplicitHolderBinding`
- that simplicity is intentional for this prototype, but it also means holder
  DID/method mismatches are direct contract-visible invariants rather than a
  privacy-preserving abstraction layer
- the credential is not revocable and therefore uses `NoStatusBinding`
- the 10-student fixture size is tuned for report readability first, so its
  throughput metrics are better for relative bottleneck spotting than for
  realistic scale modeling
- the standalone-hybrid backend keeps that readable 10-student flow intact but
  replaces the committed DID identifiers with generated standalone DID overlay
  fixtures at runtime and injects a provisioned party runtime plus hybrid proof
  backend into the protocol runner, so the report can capture real environment
  startup, wallet sync, DID provisioning latency, and simulator proof timings
  under an explicit backend contract
- standalone-hybrid runs also write `scenarios/target/standalone-timing`
  JSON/Markdown artifacts with startup, wallet sync, DID provisioning, overlay
  generation, shutdown, and accumulated proof backend phase totals for local
  timing comparisons, plus `unclassifiedMetricNames` drift signals for metrics
  that do not yet map to a phase bucket
- the generated standalone `backend-metadata.json` is initialization and
  overlay-generation metadata; the `standalone-timing/summary.json` artifact is
  the authoritative end-of-run timing record
- the proof-server contract backend now records the DTO boundary between the
  protocol runner and future remote proof execution for issuance, request
  construction, presentation construction, and verifier checks; the BDD
  `proof-server-contract` lane surfaces those exchanges alongside the
  representative job-application and mall-discount protocol threads
- the repository also carries a separate 30-student cohort dataset for richer
  protocol/export checks and a 100-student stress dataset when you want
  throughput-oriented measurements instead
- cohort/stress profile summaries include sampled transcript views so a human
  can inspect representative student/issuer/verifier exchanges without opening
  the full transcript DTO export
- that stress lane now publishes paired `summary.json` and `summary.md`
  artifacts under `packages/use-cases/university/protocol/target/stress-100`

## Family and Schema

Prototype family:

- [`../../../packages/prototypes/credential-families/university-diploma/README.md`](../../../packages/prototypes/credential-families/university-diploma/README.md)
- verifier contract package:
  - [`./contract/README.md`](./contract/README.md)
- threaded protocol package:
  - [`./protocol/README.md`](./protocol/README.md)
- reporting package:
  - [`./reporting/README.md`](./reporting/README.md)
- lane and artifact matrix:
  - [`./ci-matrix.md`](./ci-matrix.md)
- local operator guide:
  - [`./operator-guide.md`](./operator-guide.md)

Credential family package:

- `@midnight-ntwrk/midnight-did-credentials-university-diploma`

Credential shape:

- `VC<UniversityDiplomaClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>`

Privacy boundary:

- the current diploma family is a direct-claim prototype optimized for readable
  BDD and protocol reporting
- raw academic facts live in `credential.claims`; any party that receives the
  credential body can read them
- presentation `reveal*` flags authorize what a verifier request may use in a
  presentation, but they do not hide values already present in the credential
  body
- the credential-family package now exposes additive production-profile
  building blocks that move stable identifiers and sensitive academic facts into
  `claimCommitments`; the current BDD/protocol use case still runs on the
  readable v1 direct-claim alias
- the next production slices should add verifier-facing openings and predicate
  witnesses for committed academic facts
- migration plan:
  [`../../../docs/plans/university-commitment-backed-privacy.md`](../../../docs/plans/university-commitment-backed-privacy.md)

Key schema fields:

- `diplomaId`
- `studentId`
- `graduateName`
- `universityName`
- `facultyName`
- `awardName`
- `honorsCode`
- `graduationYear`
- `graduationMonth`
- `finalGrade`
- `creditsEarned`

Important encoding rule:

- the scenario JSON keeps human-readable strings
- the Compact family encodes those string-like values into fixed-width
  `Bytes<N>` fields
- this is required because direct `String` claims are not supported and
  `Opaque<'string'>` cannot participate in the `persistentHash<Claims>(claims)`
  claim-root model used by the family

## Actors

### University

- acts as the issuer
- owns the issuer DID instance and issuer verification method
- validates graduation requests against the graduation roster
- batches accepted issuance requests in groups of 5
- signs and delivers 10 diploma VCs

Authoritative data file:

- [`./data/university.json`](./data/university.json)

### Students

- 10 student agents
- each student owns a DID instance and holder verification method
- each student initiates diploma issuance after graduation is confirmed
- each student later initiates at least one job application
- 5 selected students also initiate the mall discount flow

Authoritative data file:

- [`./data/students.json`](./data/students.json)

### Companies

- 3 verifier organizations
- each company owns a DID instance and verifier verification method
- each company publishes a verifier request policy over the diploma VC
- all 10 students are assigned to one of the 3 companies in the data set

Authoritative data file:

- [`./data/companies.json`](./data/companies.json)

### Mall

- one verifier organization
- offers a discount for students whose final grade meets the mall threshold (91)
- uses a minimum-grade request of `91` to represent the policy exactly

Authoritative data file:

- [`./data/mall.json`](./data/mall.json)
- [`./data/discount-applicants.json`](./data/discount-applicants.json)

## Scenario Data

Committed data artifacts:

- named profile registry:
  - `readable-10` -> [`./data`](./data)
  - `cohort-30` -> [`./data/cohort-30`](./data/cohort-30)
  - `stress-100` -> [`./data/stress-100`](./data/stress-100)
- university issuer profile:
  - [`./data/university.json`](./data/university.json)
- 10 students with DID identifiers, company assignment, and diploma claim data:
  - [`./data/students.json`](./data/students.json)
- deterministic issuance batches of 5 students each:
  - [`./data/issuance-batches.json`](./data/issuance-batches.json)
- company verifier profiles and request policies:
  - [`./data/companies.json`](./data/companies.json)
- mall verifier profile and minimum-grade policy:
  - [`./data/mall.json`](./data/mall.json)
- shared verifier request-preset catalog:
  - [`./data/request-policy-presets.json`](./data/request-policy-presets.json)
- 5 discount applicants with mixed success/failure expectations:
  - [`./data/discount-applicants.json`](./data/discount-applicants.json)

Dataset regeneration script:

- [`./scripts/generate-university-use-case-data.mjs`](./scripts/generate-university-use-case-data.mjs)
- named profile registry:
  - [`./scripts/data-profile-registry.mjs`](./scripts/data-profile-registry.mjs)
- shared verifier request presets:
  - [`./scripts/request-policy-presets.mjs`](./scripts/request-policy-presets.mjs)
- profile listing:
  - `node ./packages/use-cases/university/scripts/list-data-profiles.mjs --json`
- fixture drift check:
  - `./run.sh university-data-profiles`
  - `./run.sh university-policy-catalog`
  - `node ./packages/use-cases/university/scripts/generate-university-use-case-data.mjs --profile readable-10 --check`
  - `node ./packages/use-cases/university/scripts/generate-university-use-case-data.mjs --profile cohort-30 --check`
  - `node ./packages/use-cases/university/scripts/generate-university-use-case-data.mjs --profile stress-100 --check`
- 30-student cohort dataset regeneration:
  - `node ./packages/use-cases/university/scripts/generate-university-use-case-data.mjs --profile cohort-30`
- cohort artifact generation:
  - `./run.sh university-protocol-cohort`
  - `./run.sh university-protocol-cohort --light`
- 100-student stress dataset regeneration:
  - `node ./packages/use-cases/university/scripts/generate-university-use-case-data.mjs --profile stress-100`
- stress artifact generation:
  - `./run.sh university-protocol-stress`
  - `./run.sh university-protocol-stress --light`

Fixture-time note:

- the dataset fixes graduation month/year to `2030-06` for determinism
- treat that as stable fixture time, not as a real-world academic calendar requirement

## Flow Description

### 1. Student-initiated diploma issuance

1. a student agent confirms graduation eligibility in the university roster
2. the student sends an issuance request that binds the diploma request to the
   student's DID-controlled holder verification method
3. the university validates:
   - student DID identity
   - holder verification method
   - graduation eligibility
   - diploma claim payload for that student
4. the university groups accepted requests into issuance batches of 5
   - if the same student replays the same issuance request, the replay is
     counted and ignored idempotently rather than creating a second batch
     entry or a second credential
5. the university signs and returns one diploma VC per student
6. each student stores the diploma VC for later use

### 2. Job application

1. a company publishes a verifier request policy
   - the policy is selected from
     [`./data/request-policy-presets.json`](./data/request-policy-presets.json)
   - the preset documents why every explicit disclosure is requested or
     intentionally suppressed
2. a student chooses the assigned company from the data set
3. the student creates a job application message containing:
   - student DID identifier
   - company DID identifier
   - requested role
   - diploma presentation request/response transcript
4. the company verifies the diploma presentation
5. the company accepts the job application if the VC and VP checks pass

All 10 students are expected to produce valid job applications in this
prototype data set.

### 3. Mall discount

1. the mall publishes a verifier request requiring:
   - university name disclosure
   - final grade disclosure
   - minimum final grade `91`
   - the preset documents why the verifier needs each disclosure and why `91`
     represents a strict `> 90` integer threshold
2. a selected student requests the discount
3. the student presents the diploma VC with the required fields disclosed
4. the mall verifies the presentation and checks the minimum-grade predicate
5. applicants with grades `91` or above succeed; applicants at `90` or below
   fail

## Metrics and Bottleneck Plan

The scenario set is intentionally metric-heavy so an implementation harness can
locate the first serious scaling bottlenecks.

Stress artifact note:

- the readable BDD report remains the living narrative surface
- the 100-student stress lane is the machine-oriented artifact surface
- if CI publishes stress output, publish the whole
  `packages/use-cases/university/protocol/target/stress-100` directory so `summary.json`
  and `summary.md` stay together

Naming rule:

- `*_ms` entries are real timed samples captured by the harness
- `*_count` entries are tagged event counters, not latency measurements

Batch-sweep lane:

- `./run.sh university-batch-sweep`
- output:
  - `./scenarios/target/batch-sweep/summary.json`
  - `./scenarios/target/batch-sweep/summary.md`
- scope:
  - issuance harness only
  - fixed student count with multiple batch sizes
  - queue-wait, compile, sign, delivery, and credentials-per-second comparison
  - deterministic compile-concurrency projection for the measured
    fixture-construction phase while keeping actual issuance sequential

### Actor bootstrap metrics

- `issuer_did_bootstrap_ms`
- `student_did_bootstrap_ms`
- `company_did_bootstrap_ms`
- `mall_did_bootstrap_ms`
- `virtual_agent_key_load_ms`

### Issuance metrics

- `issuance_request_build_ms`
- `issuance_request_validation_ms`
- `issuance_batch_queue_wait_ms`
- `issuance_batch_size`
- `issuance_batch_compile_ms`
- `issuance_batch_sign_ms`
- `issuance_batch_delivery_ms`
- `issuance_total_students`
- `issuance_credentials_per_second`
- `issuance_duplicate_request_count`
- `issuance_idempotent_replay_count`

### Job application metrics

- `job_protocol_phase_ms`
- `job_request_count`
- `job_presentation_submission_count`
- `job_verification_result_count`
- `job_duplicate_rejection_count`
- `job_verification_rejection_count`
- `job_application_acceptance_rate`
- `job_applications_per_second`

### Mall discount metrics

- `mall_did_bootstrap_ms`
- `discount_protocol_phase_ms`
- `discount_request_count`
- `discount_presentation_submission_count`
- `discount_verification_result_count`
- `discount_duplicate_rejection_count`
- `discount_verification_rejection_count`
- `discount_acceptance_rate`
- `discount_rejection_reason_count`

### Suggested first bottleneck probes

- university batch signing time vs batch size 2 / 5 / 10
- per-student presentation build time across 10 parallel job applications
- verifier throughput by company policy complexity
- grade-threshold verification overhead vs plain disclosure-only verification

## Implementation Plan

### Phase 1. Family and data stabilization

- keep the `university-diploma` family compileable and tested
- keep the 10-student and verifier data files deterministic
- keep the grade-threshold policy explicit as `minimumFinalGrade = 91`

### Phase 2. Virtual-agent harness

- implement a virtual university issuer agent
- implement 10 virtual student agents in one process with isolated key material
- implement 3 virtual company verifier agents and 1 mall verifier agent
- expose a metric collector around every external message boundary

Current status:

- implemented in the checked-in executable scenario package:
  - [`./scenarios/README.md`](./scenarios/README.md)
- verifier-side contract package now exists for company and mall request/verification flows:
  - [`./contract/README.md`](./contract/README.md)
- threaded protocol-style university flow now exists as a separate workspace package:
  - [`./protocol/README.md`](./protocol/README.md)
- ordered follow-on improvement queue:
  - [`../../../docs/plans/university-improvement-backlog.md`](../../../docs/plans/university-improvement-backlog.md)
- current university CI lane contract:
  - [`./ci-matrix.md`](./ci-matrix.md)

### Phase 3. Batch issuance orchestration

- let students initiate issuance individually
- let the university batch accepted requests into groups of 5
- emit per-batch metrics and a total issuance throughput report

### Phase 4. Job application orchestration

- publish company verifier policies
- let each student create one job application to the assigned company
- record VP build time, verifier time, and acceptance rate

### Phase 5. Mall discount orchestration

- publish the mall request policy with minimum grade 91
- run the 5 selected applicants with mixed grade outcomes
- record acceptance vs rejection reason counts

### Phase 6. Bottleneck reporting

- emit a report grouped by:
  - actor bootstrap
  - issuance
  - job applications
  - mall discount verification
- include per-step latency distribution and batch throughput
- emit stable transcript exports for the readable lane:
  - `./protocol/target/readable-10/transcript-export.json`
  - `./protocol/target/readable-10/transcript-export.md`
  - each export now includes `schemaId`, `schemaVersion`, and a pinned reader
    compatibility window so external tooling can reject unsupported transcript
    shapes deterministically
- emit a one-page summary over the committed university artifact set:
  - `./reporting/target/summary.json`
  - `./reporting/target/summary.md`
  - the summary keeps a stable schema id/version and compresses the readable
    BDD lane, transcript export, 100-student stress lane, and issuance
    batch-sweep, including compile-concurrency projections, into one handoff
    surface

## BDD Scenarios

Scenario directory:

- [`./scenarios/README.md`](./scenarios/README.md)

Feature files:

- [`./scenarios/features/university_diploma_batch_issuance.feature`](./scenarios/features/university_diploma_batch_issuance.feature)
- [`./scenarios/features/university_diploma_job_application.feature`](./scenarios/features/university_diploma_job_application.feature)
- [`./scenarios/features/university_diploma_discount.feature`](./scenarios/features/university_diploma_discount.feature)
- [`./scenarios/features/university_diploma_negative_flows.feature`](./scenarios/features/university_diploma_negative_flows.feature)
  - malformed verifier policy
  - duplicate job-application replay
  - duplicate mall-discount replay
  - tampered claim-root / challenge / issuer-method diploma submissions
  - holder-binding and proof-signer mismatch submissions
