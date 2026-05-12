# University Diploma BDD Scenarios

Purpose:

- document the full university diploma prototype flow in BDD style
- make each request, response, and verification check visible in the scenario text
- define a metric vocabulary for later executable orchestration work
- execute the current virtual-agent university flow against the checked-in
  `university-diploma` family package

Files:

- batch issuance:
  - [`./features/university_diploma_batch_issuance.feature`](./features/university_diploma_batch_issuance.feature)
- job applications:
  - [`./features/university_diploma_job_application.feature`](./features/university_diploma_job_application.feature)
- mall discount:
  - [`./features/university_diploma_discount.feature`](./features/university_diploma_discount.feature)

Execution:

- root lane:
  - `./run.sh university-bdd`
- direct workspace lane:
  - `npm run test:bdd:university`

Current boundary:

- this package now executes the committed university scenarios with virtual
  issuer, student, company, and mall agents in one process
- the issuance scenario still uses the local batch harness so it can expose the
  more detailed issuance-stage metrics
- the job-application and mall-discount scenarios now consume the threaded
  [`../protocol/README.md`](../protocol/README.md) transcript directly instead
  of replaying separate local request choreography
- it is still a local reference harness, not a Docker-backed or networked SSI
  deployment
- the comments remain intentionally verbose so the step text still acts as
  living documentation even though the scenarios are now executable
