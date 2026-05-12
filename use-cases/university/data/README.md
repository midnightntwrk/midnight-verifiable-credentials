# University Data Profiles

Canonical university fixture profiles:

- `readable-10`
  - directory: `./`
  - purpose: human-readable BDD scenarios and transcript exports
  - shape: 10 students, 2 issuance batches of 5
- `stress-100`
  - directory: `./stress-100`
  - purpose: throughput-oriented protocol stress lanes
  - shape: 100 students, 5 issuance batches of 20

Shared verifier request presets:

- catalog file:
  - `./request-policy-presets.json`

- `job-application-grade-and-award`
  - employer requests graduate identity, institution, award, year, and final grade
- `job-application-honors-without-grade`
  - employer requests honors classification instead of the raw final grade
- `job-application-credits-and-grade`
  - employer requests earned credits plus the final grade
- `mall-discount-grade-over-90`
  - mall requests university name and final grade with `minimumFinalGrade = 91`

Validation:

- `./run.sh university-data-profiles`
- `node ./use-cases/university/scripts/list-data-profiles.mjs --json`
