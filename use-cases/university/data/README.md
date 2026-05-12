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

Validation:

- `./run.sh university-data-profiles`
- `node ./use-cases/university/scripts/list-data-profiles.mjs --json`
