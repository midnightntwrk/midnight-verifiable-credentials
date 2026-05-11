# hello-verifier contract

Status:

- starter use-case package / live integration example

Purpose:

- show the smallest verifier-side Compact contract that consumes an existing VC family
- keep the flow concrete enough to run locally without the full age-gate business surface
- give integrators a copyable package for "verify one credential shape against one request"

Current scope:

- uses the explicit-holder `credentials-hello-family` playground family
- builds a request that requires a tiny selective-disclosure surface
- verifies one presentation against that request
- records the accepted credential root, challenge, and disclosed values in ledger state

Non-goals:

- issuance storage
- reusable business capabilities
- revocation/status handling
- holder-side witness predicates
- standalone application wiring

This package is intentionally a starter, not a privacy blueprint.
The underlying `credentials-hello-family` package uses direct typed claims so
the verifier flow stays easy to read.

Run locally:

```bash
npm run build -w use-cases/hello-verifier/contract
npm run test:ci -w use-cases/hello-verifier/contract
```
