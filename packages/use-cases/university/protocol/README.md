# @midnight-ntwrk/midnight-did-university-protocol

Status:

- protocol-style multi-party university flow package
- shared-bus virtual issuer / student / company / mall orchestration over the university diploma family
- explicit party-runtime and proof-execution seams for future standalone and proof-server backends
- serialized in-process transport for catching DTOs that would not survive a
  real issuer/student/verifier process boundary
- persisted restart simulation that checkpoints in-flight issuance,
  job-application, and mall-discount threads and resumes them through a fresh
  runner

Purpose:

- demonstrate the university use case as real threaded message exchange rather than direct fixture calls only
- reuse the shared protocol message bus and envelope primitives
- reuse the university verifier contract for employer and mall presentation checks
- prove the same protocol transcript can execute through a JSON transport
  boundary before the harness moves to real separate OS processes

Boundary:

- this package is a deterministic trace harness, not a security-realistic SSI deployment
- the student-side harness rebuilds presentation artifacts from stable local test keys and stored issuer outputs so the full flow can execute in one process
- treat it as protocol-shape validation and bottleneck instrumentation, not as a reference for issuer-key isolation

Scope:

- 10 student-initiated issuance requests and 10 issuance results
- 10 company presentation-request / submission / result threads
- 5 mall discount presentation-request / submission / result threads
- separate 100-student stress lane with JSON summary output under `target/stress-100`
- deterministic transcript assertions over thread and policy semantics
- explicit negative-path coverage for a company verifier that bypasses the safe
  request-builder helper and publishes a malformed job-application request
- explicit duplicate-submission rejection coverage for both company and mall
  verifier threads
- explicit tampered-diploma rejection coverage for company verification over:
  - credential claim-root tampering
  - verifier-challenge tampering
  - issuer verification-method tampering
- explicit holder-binding misuse coverage for company verification over:
  - holder DID contract tampering
  - holder method-reference tampering
  - proof-signer DID contract tampering
  - proof-signer method-reference tampering
- explicit issuance replay coverage for student-initiated diploma requests:
  duplicate student submissions are counted and ignored idempotently, while the
  runner still emits exactly one issuance result per student
- protocol results distinguish verifier-side rejections from duplicate-thread
  rejections so metrics do not collapse business-policy failures into replay
  guard events
- policy-catalog audit coverage proves company and mall fixture policies are
  still copied from the shared request-preset catalog and that each explicit
  disclosure/threshold field has a human-readable rationale
- the runner now exposes explicit exercise options for negative-path scenarios
  instead of relying on test-time monkey patching
- the runner now routes party identity and signer derivation through a
  `UniversityPartyRuntime` abstraction and issuance/presentation/verification
  through a `UniversityProofExecutionBackend` abstraction so future slices can
  swap simulator behavior for real DID CRUD and real proof execution without
  rewriting the transcript harness
- the runtime seam now exposes explicit CRUD-style party registration,
  inspection, update, and deletion so standalone-backed university actors can
  be provisioned once and injected into the runner instead of being implicitly
  reconstructed from fixture JSON
- the proof seam now distinguishes `simulator` from `standalone-hybrid`
  backends and emits proof-step timing samples, even though the hybrid mode
  still uses simulator proof semantics today
- the proof-server contract backend records deterministic remote-call DTOs for
  the same issuance, presentation-build, request-build, and verifier-check
  operations before a real proof-server transport is wired in
- the serialized process-boundary transport preserves the existing in-process
  behavior but stores every message as a JSON payload with explicit bigint and
  byte-array tags before delivery, so transport traces can expose message size,
  thread id, message id, and response correlation for every hop
- restart simulation checkpoints serialize queued transport payloads together
  with durable runner-owned state: transcript entries, sent message DTOs,
  issued student credentials, received presentation results, verifier replay
  guards, and verifier counters. Fixture data, party runtime configuration, and
  proof backend adapters are reconstructed from runner options on restore. The
  simulator intentionally reuses deterministic runtime and proof-backend
  instances across restarts today; a real standalone process restart must
  reconstruct those adapters from durable seed/configuration data.
- stable transcript export now exists in both JSON and Markdown forms under
  `target/readable-10`
- export summaries group entries per thread and include rejection-kind
  breakdowns for downstream tooling
- the `cohort-30` profile adds a richer 30-student, 6-company protocol lane with
  sampled transcript views in the profile summary so representative DTO intent
  stays readable without expanding every thread
- the reporting package now consumes those transcript exports together with the
  readable BDD, stress, and batch-sweep artifacts to emit one compact
  university summary
- transcript exports now carry an explicit schema id, schema version, and
  exact-match reader compatibility window so downstream consumers can fail fast
  on unsupported shapes instead of guessing from ad hoc field presence
- the cohort and 100-student stress lanes now emit both JSON and Markdown
  artifacts under `target/cohort-30` and `target/stress-100`
- readable and stress lanes now resolve their fixture directories from the
  shared university data-profile registry instead of hardcoded path strings
- stress artifacts now carry an explicit schema version and retention hint so a
  CI lane can publish the whole directory without inventing a second format

Stress-lane note:

- the 30-student cohort profile scales issuance, company job applications, and
  mall-discount samples enough to exercise verifier diversity without replacing
  the smaller human-readable BDD fixture
- the 100-student stress dataset scales issuance and company job-application
  threads to 100 students
- the mall discount slice intentionally remains fixed at 5 selected applicants
  so the stress summary isolates issuer and employer verifier throughput first
- treat `discountsMs` in the stress summary as a fixed-size control sample, not
  as a 100-student discount benchmark

Build and test:

- operator guide for choosing the readable, cohort, stress, export, summary,
  proof-server-contract, and standalone-hybrid lanes:
  - [`../operator-guide.md`](../operator-guide.md)
- root lane:
  - `./run.sh university-protocol`
  - `./run.sh university-protocol --light`
  - `./run.sh university-policy-catalog`
  - `./run.sh university-protocol-export`
  - `./run.sh university-protocol-export --light`
  - `./run.sh university-protocol-cohort`
  - `./run.sh university-protocol-cohort --light`
  - `./run.sh university-protocol-stress`
  - `./run.sh university-protocol-stress --light`
- `npm run lint -w ./packages/use-cases/university/protocol`
- `npm run typecheck -w ./packages/use-cases/university/protocol`
- `npm run test:ci -w ./packages/use-cases/university/protocol`
- `npm run build -w ./packages/use-cases/university/protocol`
- focused proof-server contract test:
  - `npm exec -w ./packages/use-cases/university/protocol -- vitest run src/test/proof-server-contract.test.ts`
- focused process-boundary transport test:
  - `npm exec -w ./packages/use-cases/university/protocol -- vitest run src/test/process-transport.test.ts`
- focused restart-persistence test:
  - `npm exec -w ./packages/use-cases/university/protocol -- vitest run src/test/restart-flow.test.ts`
- transcript export:
  - `npm run export:transcript -w ./packages/use-cases/university/protocol`
  - outputs:
    - `./packages/use-cases/university/protocol/target/readable-10/transcript-export.json`
    - `./packages/use-cases/university/protocol/target/readable-10/transcript-export.md`
  - contract:
    - `schemaId` is `midnight-university-protocol-export`
    - `schemaVersion` is `midnight-university-protocol-export.v1`
    - `compatibility.minimumReaderVersion` and
      `compatibility.maximumReaderVersion` are both pinned to the same value in
      this first schema generation, so consumers should exact-match `v1`
    - any export-shape change that requires a different reader should bump the
      schema version and widen or replace the compatibility window deliberately
- stress summary:
  - `npm run stress:run -w ./packages/use-cases/university/protocol`
  - `UNIVERSITY_PROTOCOL_PROFILE=cohort-30 npm run stress:run -w ./packages/use-cases/university/protocol`
  - output:
    - `./packages/use-cases/university/protocol/target/cohort-30/summary.json`
    - `./packages/use-cases/university/protocol/target/cohort-30/summary.md`
    - `./packages/use-cases/university/protocol/target/stress-100/summary.json`
    - `./packages/use-cases/university/protocol/target/stress-100/summary.md`
  - retention guidance:
    - upload the entire profile directory under
      `./packages/use-cases/university/protocol/target/<profile-id>` as one workflow
      artifact so the JSON and Markdown stay paired

Proof-server contract seam:

| Current simulator operation   | Proof-server contract operation                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `issueDiplomaCredential`      | issuer + holder DID refs, student claim identity, issuance challenge, credential proof timestamps |
| `buildJobApplicationRequest`  | issuer method ref, verifier challenge, company request policy and overrides                       |
| `buildMallDiscountRequest`    | issuer method ref, verifier challenge, mall minimum-grade threshold                               |
| `buildPresentationSubmission` | holder DID ref, stored credential ref, request summary, optional tampering mode                   |
| `verifyJobApplication`        | credential ref, request summary, credential proof ref, presentation proof ref                     |
| `verifyMallDiscount`          | credential ref, request summary, credential proof ref, presentation proof ref                     |

The `ProofServerContractUniversityProofExecutionBackend` intentionally delegates
today's semantics to the simulator while recording these DTOs through a
`UniversityProofServerAdapter`. A real transport can replace the recording
adapter without changing the protocol runner's `UniversityProofExecutionBackend`
surface.
