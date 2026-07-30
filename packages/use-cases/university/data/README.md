# University Data Profiles

Canonical university fixture profiles:

- generated runbook:
  - `./data-profiles.md`
- `readable-10`
  - directory: `./`
  - purpose: human-readable BDD scenarios and transcript exports
  - shape: 10 students, 2 issuance batches of 5
- `cohort-30`
  - directory: `./cohort-30`
  - purpose: intermediate protocol/export profile with richer participant and
    outcome diversity while keeping summaries readable
  - shape: 30 students, 6 companies, 10 discount applicants, 3 issuance batches
    of 10
- `stress-100`
  - directory: `./stress-100`
  - purpose: throughput-oriented protocol stress lanes
  - shape: 100 students, 5 issuance batches of 20

Shared verifier request presets:

- catalog file:
  - `./request-policy-presets.json`
- generated runbook:
  - `./request-policy-presets.md`
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
- `node ./packages/use-cases/university/scripts/list-data-profiles.mjs --json`
- `pnpm run update:university-data-profiles`
- `pnpm run check:university-data-profiles`
- `pnpm run update:university-request-policy-presets`
- `pnpm run check:university-request-policy-presets`
- the data-profile lifecycle check proves generated profile JSON, batch
  coverage, company assignments, mall-discount eligibility, and the generated
  profile runbook stay synchronized
- the policy-catalog audit proves `readable-10`, `cohort-30`, and `stress-100`
  verifier fixtures reference known presets, embed matching policies, exercise
  every catalog preset, and document why each explicit disclosure or threshold
  policy field is requested
