# University Request Policy Presets

Status: generated from [`request-policy-presets.json`](./request-policy-presets.json).

Regenerate with:

```bash
npm run update:university-request-policy-presets
npm run check:university-request-policy-presets
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
- Purpose: Use when a verifier needs institution identity plus a strict grade threshold check for a student discount offer.

Request policy:

- `requireUniversityNameDisclosure`: `true`
- `requireFinalGradeDisclosure`: `true`
- `enforceMinimumFinalGrade`: `true`
- `minimumFinalGrade`: `91`

Policy rationale:

- `requireUniversityNameDisclosure`: Show the student belongs to the trusted university population eligible for the mall offer.
- `requireFinalGradeDisclosure`: Expose the final grade because the offer is defined by a strict grade threshold.
- `enforceMinimumFinalGrade`: Apply the business rule in verifier logic instead of relying on a self-attested statement.
- `minimumFinalGrade`: Use 91 to represent a greater-than-90 threshold with integer fixture grades.
