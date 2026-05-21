# @midnight-ntwrk/midnight-did-university-verifier-contract

> Maturity: `demo`
> Package class: `dist`

Status:

- compileable verifier-side contract package for the university diploma use case
- request-builder and presentation-verification surface for employer and mall flows

Purpose:

- turn the university diploma use case into a checked-in verifier contract path
- keep employer job-application verification and mall discount verification explicit
- reuse the non-revocable explicit-holder university diploma family directly

Scope:

- pure request builders for:
  - job applications
  - mall discount verification
- verifier-side circuits that accept university diploma presentations and record
  the last verified disclosed values
- no revocation, protocol delivery, or durable business-claim lifecycle

Privacy note:

- the employer path records the disclosed employer-facing claim values to ledger
  state for demo visibility
- the mall-discount path verifies the grade threshold but intentionally does not
  persist the student's exact final grade afterward

Build and test:

- `npm run build -w ./packages/use-cases/university/contract`
- `npm run lint -w ./packages/use-cases/university/contract`
- `npm run typecheck -w ./packages/use-cases/university/contract`
- `npm run test:ci -w ./packages/use-cases/university/contract`
