# University Data Profiles

Status: generated from `data-profile-registry.mjs` and the deterministic fixture generator.

Regenerate with:

```bash
pnpm run update:university-data-profiles
pnpm run check:university-data-profiles
```

## `readable-10`

- Purpose: Human-readable BDD and transcript narrative profile.
- Fixture directory: `data`
- Students: 10
- Issuance batches: 2 of up to 5 students
- Companies: 3 (`standard` set)
- Discount applicants: 5 (3 accepted, 2 rejected)

## `cohort-30`

- Purpose: Intermediate rich cohort for readable throughput, diversity, and sampled transcript reporting.
- Fixture directory: `data/cohort-30`
- Students: 30
- Issuance batches: 3 of up to 10 students
- Companies: 6 (`expanded` set)
- Discount applicants: 10 (5 accepted, 5 rejected)

## `stress-100`

- Purpose: Throughput-oriented protocol stress profile.
- Fixture directory: `data/stress-100`
- Students: 100
- Issuance batches: 5 of up to 20 students
- Companies: 3 (`standard` set)
- Discount applicants: 5 (3 accepted, 2 rejected)
