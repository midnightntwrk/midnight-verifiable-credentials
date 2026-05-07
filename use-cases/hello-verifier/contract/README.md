# hello-verifier contract

Status:

- starter use-case package / live integration example

Purpose:

- show the smallest verifier-side Compact contract that consumes an existing VC family
- keep the flow concrete enough to run locally without the full age-gate business surface
- give integrators a copyable package for "verify one credential shape against one request"

Current scope:

- uses the explicit-holder `credentials-birth` family
- builds a request with an age-threshold predicate
- verifies one presentation against that request
- records the accepted credential root and request challenge in ledger state

Non-goals:

- issuance storage
- reusable business capabilities
- revocation/status handling
- standalone application wiring

Run locally:

```bash
npm run test:ci -w use-cases/hello-verifier/contract
```
