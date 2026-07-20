# University Request Policy Presets

Status: generated from [`request-policy-presets.json`](./request-policy-presets.json).

Regenerate with:

```bash
pnpm run update:university-request-policy-presets
pnpm run check:university-request-policy-presets
```

## `job-application-grade-and-award`

- Kind: `jobApplication`
- Title: Grade and award verification
- Purpose: Use when an employer needs the graduate identity, institution, degree, year, and final grade for an academic screening pass.

Request policy:

- `requireGraduateNameDisclosure`: `true`
- `requireUniversityNameDisclosure`: `true`
- `requireAwardNameDisclosure`: `true`
- `requireGraduationYearDisclosure`: `true`
- `requireFinalGradeDisclosure`: `true`

Policy rationale:

- `requireGraduateNameDisclosure`: Bind the application to the named graduate before an employer starts academic screening.
- `requireUniversityNameDisclosure`: Show which issuer minted the diploma so the employer can apply institution-specific trust rules.
- `requireAwardNameDisclosure`: Expose the degree title needed to match the applicant against the hiring stream.
- `requireGraduationYearDisclosure`: Expose the completion year needed for cohort and recency checks.
- `requireFinalGradeDisclosure`: Expose the raw final grade because this screening preset explicitly compares academic performance.

## `job-application-honors-without-grade`

- Kind: `jobApplication`
- Title: Honors without raw grade
- Purpose: Use when an employer needs degree context and honors classification but intentionally avoids collecting the raw final grade.

Request policy:

- `requireGraduateNameDisclosure`: `true`
- `requireUniversityNameDisclosure`: `true`
- `requireAwardNameDisclosure`: `true`
- `requireGraduationYearDisclosure`: `true`
- `requireHonorsCodeDisclosure`: `true`
- `requireFinalGradeDisclosure`: `false`

Policy rationale:

- `requireGraduateNameDisclosure`: Bind the application to the named graduate before an employer starts academic screening.
- `requireUniversityNameDisclosure`: Show which issuer minted the diploma so the employer can apply institution-specific trust rules.
- `requireAwardNameDisclosure`: Expose the degree title needed to match the applicant against the hiring stream.
- `requireGraduationYearDisclosure`: Expose the completion year needed for cohort and recency checks.
- `requireHonorsCodeDisclosure`: Expose honors classification as a coarse performance band.
- `requireFinalGradeDisclosure`: Keep the raw final grade private because this preset only needs honors classification.

## `job-application-credits-and-grade`

- Kind: `jobApplication`
- Title: Credits and grade verification
- Purpose: Use when an employer needs the degree outcome plus the earned-credit total to compare curriculum depth across graduates.

Request policy:

- `requireGraduateNameDisclosure`: `true`
- `requireUniversityNameDisclosure`: `true`
- `requireAwardNameDisclosure`: `true`
- `requireGraduationYearDisclosure`: `true`
- `requireCreditsEarnedDisclosure`: `true`
- `requireFinalGradeDisclosure`: `true`

Policy rationale:

- `requireGraduateNameDisclosure`: Bind the application to the named graduate before an employer starts academic screening.
- `requireUniversityNameDisclosure`: Show which issuer minted the diploma so the employer can apply institution-specific trust rules.
- `requireAwardNameDisclosure`: Expose the degree title needed to match the applicant against the hiring stream.
- `requireGraduationYearDisclosure`: Expose the completion year needed for cohort and recency checks.
- `requireCreditsEarnedDisclosure`: Expose earned credits so the employer can compare curriculum depth across universities.
- `requireFinalGradeDisclosure`: Expose the raw final grade because this preset compares both grade and curriculum depth.

## `mall-discount-grade-over-90`

- Kind: `mallDiscount`
- Title: Grade-above-90 discount
- Purpose: Use when a verifier needs a reveal-nothing grade-threshold eligibility proof for a student discount offer without collecting any diploma claims.

Request policy:

- `requireUniversityNameDisclosure`: `false`
- `requireFinalGradeDisclosure`: `false`
- `enforceMinimumFinalGrade`: `true`
- `minimumFinalGrade`: `91`

Policy rationale:

- `requireUniversityNameDisclosure`: Keep the university name hidden; issuer trust comes from verifying the credential against the trusted issuer verification method, not from a disclosed claim.
- `requireFinalGradeDisclosure`: Keep the final grade hidden; the threshold is proven in-circuit against the salted finalGradeCommitment instead of a disclosed grade.
- `enforceMinimumFinalGrade`: Apply the business rule as an in-circuit predicate instead of relying on a disclosed grade or self-attested statement.
- `minimumFinalGrade`: Use 91 to represent a greater-than-90 threshold with integer fixture grades.
