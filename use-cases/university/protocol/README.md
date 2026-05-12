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
- deterministic transcript assertions over thread and policy semantics
- explicit negative-path coverage for a company verifier that bypasses the safe
  request-builder helper and publishes a malformed job-application request

Build and test:

- root lane:
  - `./run.sh university-protocol`
  - `./run.sh university-protocol --light`
- `npm run lint -w ./use-cases/university/protocol`
- `npm run typecheck -w ./use-cases/university/protocol`
- `npm run test:ci -w ./use-cases/university/protocol`
- `npm run build -w ./use-cases/university/protocol`
