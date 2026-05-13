# University Diploma BDD Scenarios

Purpose:

- document the full university diploma prototype flow in BDD style
- make each request, response, and verification check visible in the scenario text
- emit step-level DTO and intent summaries into the Serenity report via
  Serenity/JS log entries
- surface representative protocol request/submission/result threads directly in
  the Serenity report for job applications and mall discounts
- surface representative issuance request/result DTOs and batch metrics for the
  local batch-issuance harness
- define a metric vocabulary for later executable orchestration work
- execute the current virtual-agent university flow against the checked-in
  `university-diploma` family package
- expose a separate programmatic batch-sweep benchmark lane so issuance
  bottlenecks can be compared across batch sizes without going through the
  Serenity report

Files:

- batch issuance:
  - [`./features/university_diploma_batch_issuance.feature`](./features/university_diploma_batch_issuance.feature)
- job applications:
  - [`./features/university_diploma_job_application.feature`](./features/university_diploma_job_application.feature)
- mall discount:
  - [`./features/university_diploma_discount.feature`](./features/university_diploma_discount.feature)
- negative flows:
  - [`./features/university_diploma_negative_flows.feature`](./features/university_diploma_negative_flows.feature)

Execution:

- root lane:
  - `./run.sh university-bdd`
- standalone-hybrid lane:
  - `./run.sh university-bdd-standalone`
- issuance benchmark lane:
  - `./run.sh university-batch-sweep`
- one-page reporting lane:
  - `./run.sh university-summary`
- direct workspace lane:
  - `npm run test:bdd:university`
  - `npm run test:bdd:university:standalone`
  - `npm run test:batch-sweep -w use-cases/university/scenarios`

Batch-sweep artifacts:

- `./target/batch-sweep/summary.json`
- `./target/batch-sweep/summary.md`
- artifacts are regenerated on each run and are intended for local inspection or
  CI retention, not source control
- one-page reporting outputs:
  - `../reporting/target/summary.json`
  - `../reporting/target/summary.md`

Current boundary:

- this package now executes the committed university scenarios with virtual
  issuer, student, company, and mall agents in one process
- the issuance scenario still uses the local batch harness so it can expose the
  more detailed issuance-stage metrics
- the batch-sweep lane is issuance-only by design, so its timing summaries do
  not include company or mall verification phases
- the job-application and mall-discount scenarios now consume the threaded
  [`../protocol/README.md`](../protocol/README.md) transcript directly instead
  of replaying separate local request choreography
- the Serenity report now includes representative protocol thread excerpts so a
  human can inspect the request DTO, submission DTO, and verifier result for a
  small readable subset of students without leaving the report
- metric names now distinguish true timed samples (`*_ms`) from tagged counts
  (`*_count`) so the report does not present cached or categorical events as
  measured latency
- it is still a local reference harness, not a Docker-backed or networked SSI
  deployment
- the new `standalone-hybrid` backend is the bridge between those two worlds:
  it provisions real Midnight DIDs for the university, students, companies, and
  mall through `standalone-environment`, then rewrites the checked-in fixture
  set into generated overlay JSON before the existing university issuance and
  verifier simulator lanes run
- that means the BDD can now measure environment startup, wallet sync, and DID
  provisioning timings with real standalone infrastructure while still keeping
  the university credential semantics on the local simulator path
- the comments remain intentionally verbose so the step text still acts as
  living documentation even though the scenarios are now executable
