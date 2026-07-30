# Dummy Claims Verifier Lab

Purpose:

- run the broad direct Compact claim-surface family against a dedicated verifier
  contract
- keep one checked-in path that proves every currently supported direct claim
  family can be selectively disclosed and consumed by Layer 3 code

Packages involved:

1. `@midnight-ntwrk/midnight-did-credentials-dummy-claims`
2. `@midnight-ntwrk/midnight-did-hello-verifier-contract`

What this lane validates:

- the `dummy-claims` family still compiles and passes its selective-disclosure
  package tests
- the `dummy-claims-verifier` contract still builds and accepts a full-surface
  disclosure request
- the verifier still rejects omitted direct, nested-field, nested-vector, and
  challenge-mismatch cases
- the verifier still rejects direct callers that try to relax any of the
  full-surface request invariants

Run locally:

```bash
./run.sh dummy-claims-lab
```

Reuse existing build artifacts:

```bash
./run.sh dummy-claims-lab --light
```

Direct package commands:

```bash
pnpm --dir ./packages/prototypes/credential-families/dummy-claims run test:ci
pnpm --dir ./packages/use-cases/hello-verifier/contract exec vitest run src/test/dummy-claims-verifier.test.ts
```

Notes:

- this is a verifier-lab path, not a privacy template
- unlike `hello-smoke`, this lane does not try to exercise the DID-aware starter
  handoff
- `--light` still depends on the existing `hello-family` and `hello-verifier`
  managed artifacts because the verifier package typechecks and tests both starter
  and lab surfaces from the same workspace package
- it is the right lane when you are changing the supported direct Compact claim
  surface or the verifier-side handling of nested disclosures
