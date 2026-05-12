# University Diploma BDD Scenarios

Purpose:

- document the full university diploma prototype flow in BDD style
- make each request, response, and verification check visible in the scenario text
- define a metric vocabulary for later executable orchestration work

Files:

- batch issuance:
  - [`./features/university_diploma_batch_issuance.feature`](./features/university_diploma_batch_issuance.feature)
- job applications:
  - [`./features/university_diploma_job_application.feature`](./features/university_diploma_job_application.feature)
- mall discount:
  - [`./features/university_diploma_discount.feature`](./features/university_diploma_discount.feature)

Important boundary:

- these feature files are currently narrative BDD specifications, not yet a
  runnable Serenity/Cucumber package like `use-cases/age-gate/scenarios`
- the comments are intentionally verbose so a later automation layer can map
  them into concrete request/response tasks and metric collectors
