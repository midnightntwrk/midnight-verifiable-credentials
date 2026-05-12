# University Report Summary

- schema id: midnight-university-report-summary
- schema version: midnight-university-report-summary.v1
- university issuer: uni-example-001
- students: 10
- companies: 3 (Blue Ocean Analytics, Northwind Robotics, Pioneer Systems)
- mall: Student Square Mall (mall-student-square)
- discount applicants: 5

## Readable BDD Lane
- scenarios: 13
- passed: 13
- failed: 0
- total duration ms: 5030.00
- categories:
  - batchIssuance: 1
  - duplicateJobApplication: 1
  - duplicateMallDiscount: 1
  - holderBindingTampering: 4
  - invalidPolicy: 1
  - issuanceReplay: 1
  - jobApplications: 1
  - tamperedPresentation: 3

## Slowest Scenarios
- A duplicate job-application submission is rejected without replacing the original acceptance: 490.00 ms (SUCCESS)
- A duplicate mall discount submission is rejected without replacing the original mall outcome: 470.00 ms (SUCCESS)
- A tampered issuer verification method is rejected without affecting untampered job applications: 457.00 ms (SUCCESS)
- A tampered verifier challenge is rejected without affecting untampered job applications: 438.00 ms (SUCCESS)
- A tampered holder method reference is rejected without affecting untampered job applications: 434.00 ms (SUCCESS)

## Transcript Export
- schema version: midnight-university-protocol-export.v1
- transcript entries: 65
- total threads: 25
- issuance results: 10
- job application accepted: 10
- job application verification failed: 0
- discount accepted: 3
- discount verification failed: 2
- discount rejection reason: failed assert: University-diploma disclosed final grade is below the verifier minimum (2)

## Stress Summary
- dataset profile: stress-100
- students: 100
- transcript entries: 515
- total threads: 205
- accepted job applications: 100
- accepted discounts: 3
- rejected discounts: 2
- issuance ms: 366.07
- job applications ms: 1721.54
- discounts ms: 72.59
- wall clock ms: 2259.05
- issuance credentials/sec: 273.17
- job application results/sec: 58.09
- discount evaluations/sec: 68.88

## Batch Sweep
- fastest batch size by wall-clock credentials/sec: 10
| batch size | batches | issued | wall clock ms | compile avg ms | queue wait avg ms | wall-clock credentials/sec |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 50 | 100 | 373.49 | 7.42 | 190.17 | 267.74 |
| 5 | 20 | 100 | 354.30 | 17.65 | 168.43 | 282.25 |
| 10 | 10 | 100 | 345.81 | 34.49 | 155.11 | 289.18 |
| 20 | 5 | 100 | 363.60 | 72.47 | 137.28 | 275.03 |

## Bottlenecks
- slowest readable scenario: A duplicate job-application submission is rejected without replacing the original acceptance (490.00 ms)
- slowest batch compile average: batch size 20 (72.47 ms)
- slowest stress phase: wallClock (2259.05 ms)

## Notes
- Readable BDD counts are deduplicated by scenario title and keep only the latest recorded run per title.
- This report summarizes existing artifacts; it does not rerun issuance, protocol, or verifier logic internally.
- Batch-sweep and stress timings remain machine-local measurements and should be compared by trend, not by exact absolute value.

