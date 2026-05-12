# @midnight-ntwrk/midnight-did-university-protocol

Status:

- protocol-style multi-party university flow package
- shared-bus virtual issuer / student / company / mall orchestration over the university diploma family

Purpose:

- demonstrate the university use case as real threaded message exchange rather than direct fixture calls only
- reuse the shared protocol message bus and envelope primitives
- reuse the university verifier contract for employer and mall presentation checks

Scope:

- 100 student-initiated issuance requests and 100 issuance results
- 100 company presentation-request / submission / result threads
- 5 mall discount presentation-request / submission / result threads
- deterministic transcript assertions over thread and policy semantics

Build and test:

- root lane:
  - `./run.sh university-protocol`
  - `./run.sh university-protocol --light`
- `npm run lint -w ./use-cases/university/protocol`
- `npm run typecheck -w ./use-cases/university/protocol`
- `npm run test:ci -w ./use-cases/university/protocol`
- `npm run build -w ./use-cases/university/protocol`
