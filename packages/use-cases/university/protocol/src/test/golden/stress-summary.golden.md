# University Protocol Stress Summary

- schema version: midnight-university-protocol-stress-summary.v2
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
    - failed assert: University-diploma production final grade predicate is below the verifier minimum: 2

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

## Sampled Transcript
- issuance samples: 3 shown, 97 omitted
- job application samples: 5 shown, 95 omitted
- discount samples: 5 shown, 0 omitted

### Issuance Samples
- Ada Avery 0001: Student STU-0001 requested diploma issuance -> University issued diploma credential to STU-0001 in batch-01
- Ben Avery 0002: Student STU-0002 requested diploma issuance -> University issued diploma credential to STU-0002 in batch-01
- Cara Avery 0003: Student STU-0003 requested diploma issuance -> University issued diploma credential to STU-0003 in batch-01

### Job Application Samples
- Ada Avery 0001 to Northwind Robotics: Company company-northwind-robotics requested a diploma presentation from STU-0001 -> Student STU-0001 submitted a jobApplication presentation -> Company company-northwind-robotics returned accepted for STU-0001
- Ben Avery 0002 to Blue Ocean Analytics: Company company-blue-ocean-analytics requested a diploma presentation from STU-0002 -> Student STU-0002 submitted a jobApplication presentation -> Company company-blue-ocean-analytics returned accepted for STU-0002
- Cara Avery 0003 to Pioneer Systems: Company company-pioneer-systems requested a diploma presentation from STU-0003 -> Student STU-0003 submitted a jobApplication presentation -> Company company-pioneer-systems returned accepted for STU-0003
- Dion Avery 0004 to Northwind Robotics: Company company-northwind-robotics requested a diploma presentation from STU-0004 -> Student STU-0004 submitted a jobApplication presentation -> Company company-northwind-robotics returned accepted for STU-0004
- Ella Avery 0005 to Blue Ocean Analytics: Company company-blue-ocean-analytics requested a diploma presentation from STU-0005 -> Student STU-0005 submitted a jobApplication presentation -> Company company-blue-ocean-analytics returned accepted for STU-0005

### Discount Samples
- Ada Avery 0001 to Student Square Mall: Mall mall-student-square requested a diploma presentation from STU-0001 -> Student STU-0001 submitted a mallDiscount presentation -> Mall mall-student-square returned accepted for STU-0001
- Ben Avery 0002 to Student Square Mall: Mall mall-student-square requested a diploma presentation from STU-0002 -> Student STU-0002 submitted a mallDiscount presentation -> Mall mall-student-square returned accepted for STU-0002
- Cara Avery 0003 to Student Square Mall: Mall mall-student-square requested a diploma presentation from STU-0003 -> Student STU-0003 submitted a mallDiscount presentation -> Mall mall-student-square returned accepted for STU-0003
- Dion Avery 0004 to Student Square Mall: Mall mall-student-square requested a diploma presentation from STU-0004 -> Student STU-0004 submitted a mallDiscount presentation -> Mall mall-student-square returned rejected for STU-0004
- Ella Avery 0005 to Student Square Mall: Mall mall-student-square requested a diploma presentation from STU-0005 -> Student STU-0005 submitted a mallDiscount presentation -> Mall mall-student-square returned rejected for STU-0005

## Artifact Retention
- target directory: packages/use-cases/university/protocol/target/stress-100
- files: summary.json, summary.md
- CI recommendation: Upload target/stress-100 as a workflow artifact directory.

## Notes
- Mall discount evaluation remains a fixed-size five-applicant control sample.
- Timing and throughput figures are machine-local measurements and should be compared in bands, not as exact constants.
- Sampled transcript views keep profile summaries readable; use transcript exports when full DTO payloads are required.
