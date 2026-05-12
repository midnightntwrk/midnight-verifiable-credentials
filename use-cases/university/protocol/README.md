# @midnight-ntwrk/midnight-did-university-protocol

Status:

- protocol-style multi-party university flow package
- shared-bus virtual issuer / student / company / mall orchestration over the university diploma family

Purpose:

- demonstrate the university use case as real threaded message exchange rather than direct fixture calls only
- reuse the shared protocol message bus and envelope primitives
- reuse the university verifier contract for employer and mall presentation checks

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
- the runner now exposes explicit exercise options for negative-path scenarios
  instead of relying on test-time monkey patching
- stable transcript export now exists in both JSON and Markdown forms under
  `target/readable-10`
- export summaries group entries per thread and include rejection-kind
  breakdowns for downstream tooling
- the 100-student stress lane now emits both JSON and Markdown artifacts under
  `target/stress-100`
- stress artifacts now carry an explicit schema version and retention hint so a
  CI lane can publish the whole directory without inventing a second format

Stress-lane note:

- the 100-student stress dataset scales issuance and company job-application
  threads to 100 students
- the mall discount slice intentionally remains fixed at 5 selected applicants
  so the stress summary isolates issuer and employer verifier throughput first
- treat `discountsMs` in the stress summary as a fixed-size control sample, not
  as a 100-student discount benchmark

Build and test:

- root lane:
  - `./run.sh university-protocol`
  - `./run.sh university-protocol --light`
  - `./run.sh university-protocol-export`
  - `./run.sh university-protocol-export --light`
  - `./run.sh university-protocol-stress`
  - `./run.sh university-protocol-stress --light`
- `npm run lint -w ./use-cases/university/protocol`
- `npm run typecheck -w ./use-cases/university/protocol`
- `npm run test:ci -w ./use-cases/university/protocol`
- `npm run build -w ./use-cases/university/protocol`
- transcript export:
  - `npm run export:transcript -w ./use-cases/university/protocol`
  - outputs:
    - `./use-cases/university/protocol/target/readable-10/transcript-export.json`
    - `./use-cases/university/protocol/target/readable-10/transcript-export.md`
- stress summary:
  - `npm run stress:run -w ./use-cases/university/protocol`
  - output:
    - `./use-cases/university/protocol/target/stress-100/summary.json`
    - `./use-cases/university/protocol/target/stress-100/summary.md`
  - retention guidance:
    - upload the entire `./use-cases/university/protocol/target/stress-100`
      directory as one workflow artifact so the JSON and Markdown stay paired
