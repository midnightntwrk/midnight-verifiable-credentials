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
- each preset includes:
  - canonical verifier `requestPolicy`
  - `purpose` text copied into company/mall fixtures
  - `policyRationale` text for every explicit disclosure or threshold field

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
- `./run.sh university-policy-catalog`
- `node ./use-cases/university/scripts/list-data-profiles.mjs --json`
- the policy-catalog audit proves both `readable-10` and `stress-100`
  verifier fixtures reference known presets, embed matching policies, exercise
  every catalog preset, and document why each explicit disclosure or threshold
  policy field is requested
