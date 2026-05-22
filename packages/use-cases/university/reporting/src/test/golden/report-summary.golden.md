# University Report Summary

- schema id: midnight-university-report-summary
- schema version: midnight-university-report-summary.v4
- university issuer: uni-example-001
- students: 10
- companies: 3 (Blue Ocean Analytics, Northwind Robotics, Pioneer Systems)
- mall: Student Square Mall (mall-student-square)
- discount applicants: 5

## Handoff Contract
### Handoff Artifacts
- human handoff: packages/use-cases/university/reporting/target/summary.md
- machine handoff: packages/use-cases/university/reporting/target/summary.json
- source manifest json: packages/use-cases/university/reporting/target/artifact-manifest.json
- source manifest markdown: packages/use-cases/university/reporting/target/artifact-manifest.md
- source artifact ids: readable-bdd-serenity, readable-protocol-transcript, stress-protocol-summary, issuer-batch-sweep-summary

### Operating Notes
- Use summary.md as the human handoff and summary.json as the machine handoff.
- Use artifact-manifest.json when a consumer needs to verify which source artifacts were summarized.
- The Serenity site and raw transcript/stress/batch artifacts remain source evidence, not the default handoff surface.

## Source Artifact Manifest
- total bytes: 100220

| artifact | schema version | files | bytes | sha256 |
| --- | --- | ---: | ---: | --- |
| Readable BDD Serenity JSON | n/a | 13 | 2778 | 3885403dcd926e8fff77fb5de5b33b6cf3d19e540628f9bc240b670339c3ce72 |
| Readable protocol transcript export | midnight-university-protocol-export.v1 | 1 | 74769 | d7c552e47e5d25b903863ff043b53718ac63dd16b6258d9879fa329421a84d19 |
| Stress protocol summary | midnight-university-protocol-stress-summary.v2 | 1 | 13166 | eca86ee79f5cab71ada40ec9059711c1de243f832d83d4dad8d73826302d970c |
| Issuer batch-sweep summary | midnight-university-batch-sweep-summary.v2 | 1 | 9507 | 7c60f98cbb138ea3ba0c98692a1fd2743f04b64c798193ec0bc640800d1a48fe |

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
- issuance ms: 370.53
- job applications ms: 1725.90
- discounts ms: 71.75
- wall clock ms: 2211.46
- issuance credentials/sec: 269.89
- job application results/sec: 57.94
- discount evaluations/sec: 69.68

## Batch Sweep
- fastest batch size by wall-clock credentials/sec: 10
- compile concurrency levels: 1, 2, 4
- best projected compile concurrency: batch size 5, 4 workers (1117.41 projected credentials/sec, 3.96x speedup)

| batch size | batches | issued | wall clock ms | compile avg ms | queue wait avg ms | wall-clock credentials/sec |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 50 | 100 | 373.49 | 7.42 | 190.17 | 267.74 |
| 5 | 20 | 100 | 354.30 | 17.65 | 168.43 | 282.25 |
| 10 | 10 | 100 | 345.81 | 34.49 | 155.11 | 289.18 |
| 20 | 5 | 100 | 363.60 | 72.47 | 137.28 | 275.03 |

## Batch Sweep Compile Projection
| batch size | compile concurrency | estimated issuer wall clock ms | projected credentials/sec | projected speedup | compile efficiency |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2 | 1 | 373.49 | 267.74 | 1.00 | 1.00 |
| 2 | 2 | 187.88 | 532.25 | 1.99 | 1.00 |
| 2 | 4 | 98.79 | 1012.28 | 3.78 | 0.96 |
| 5 | 1 | 354.30 | 282.25 | 1.00 | 1.00 |
| 5 | 2 | 177.76 | 562.55 | 1.99 | 1.00 |
| 5 | 4 | 89.49 | 1117.41 | 3.96 | 1.00 |
| 10 | 1 | 345.81 | 289.18 | 1.00 | 1.00 |
| 10 | 2 | 173.34 | 576.89 | 1.99 | 1.00 |
| 10 | 4 | 104.35 | 958.27 | 3.31 | 0.83 |
| 20 | 1 | 363.60 | 275.03 | 1.00 | 1.00 |
| 20 | 2 | 218.66 | 457.34 | 1.66 | 0.83 |
| 20 | 4 | 146.19 | 684.06 | 2.49 | 0.63 |

## Bottlenecks
- slowest readable scenario: A duplicate job-application submission is rejected without replacing the original acceptance (490.00 ms)
- slowest batch compile average: batch size 20 (72.47 ms)
- slowest stress phase: jobApplications (1725.90 ms)

## Notes
- Readable BDD counts are deduplicated by scenario title and keep only the latest recorded run per title.
- This report summarizes existing artifacts; it does not rerun issuance, protocol, or verifier logic internally.
- Batch-sweep and stress timings remain machine-local measurements and should be compared by trend, not by exact absolute value.
- Batch compile-concurrency projections parallelize only the fixture-construction phase in the model; the underlying readable issuance lane remains sequential.

