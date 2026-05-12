# University Protocol Stress Summary

- schema version: midnight-university-protocol-stress-summary.v1
- dataset profile: stress-100

## Dataset
- students: 100
- companies: 3
- discount applicants: 5
- issuance batches: 5
- configured batch size: 20

## Counts
- issuance requests: 100
- issuance results: 100
- job application requests: 100
- job application submissions: 100
- job application results: 100
- discount requests: 5
- discount submissions: 5
- discount results: 5
- transcript entries: 515
- total threads: 205

## Outcomes
- accepted job applications: 100
- company accepted counts:
  - company-blue-ocean-analytics: 33
  - company-northwind-robotics: 34
  - company-pioneer-systems: 33
- accepted discounts: 3
- rejected discounts: 2

## Rejections
- job applications:
  - verificationFailed: 0
  - duplicate: 0
- discounts:
  - verificationFailed: 2
  - duplicate: 0
  - by reason:
    - failed assert: University-diploma disclosed final grade is below the verifier minimum: 2

## Timings (ms)
- issuance: <measured>
- jobApplications: <measured>
- discounts: <measured>
- runnerTotal: <measured>
- wallClock: <measured>

## Throughput
- issuanceCredentialsPerSecond: <measured>
- jobApplicationResultsPerSecond: <measured>
- discountEvaluationsPerSecond: <measured>
- transcriptEntriesPerSecond: <measured>

## Artifact Retention
- target directory: use-cases/university/protocol/target/stress-100
- files: summary.json, summary.md
- CI recommendation: Upload target/stress-100 as a workflow artifact directory.

## Notes
- Mall discount evaluation remains a fixed-size five-applicant control sample.
- Timing and throughput figures are machine-local measurements and should be compared in bands, not as exact constants.
