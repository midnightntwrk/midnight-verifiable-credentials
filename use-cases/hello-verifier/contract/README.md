# hello-verifier contract

Status:

- starter use-case package / live integration example

Purpose:

- show the smallest verifier-side Compact contract that consumes an existing VC family
- keep the flow concrete enough to run locally without the full age-gate business surface
- give integrators a copyable package for "verify one credential shape against one request"

Current scope:

- uses the explicit-holder `credentials-hello-family` playground family
- includes a companion offchain-DID starter contract for the DID-aware smoke path
- includes a dummy-claims lab contract that consumes the widest currently supported direct Compact claim surface
- builds a request that requires a tiny selective-disclosure surface
- keeps boolean and big-unsigned disclosure mandatory, with bytes disclosure as the only starter toggle in the hello-family path
- exposes a full-disclosure lab request for the dummy-claims path so every supported claim family is exercised end-to-end
- verifies one presentation against that request
- records the accepted credential root, challenge, and disclosed values in ledger state

Non-goals:

- issuance storage
- reusable business capabilities
- revocation/status handling
- credential expiration enforcement
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

Dummy-claims lab path:

- broad direct claim-surface family: `credentials-dummy-claims`
- full-disclosure verifier contract: `src/dummy-claims-verifier.compact`

DID-aware starter path:

- [`../../../docs/guides/did-vc-hello-smoke-path.md`](../../../docs/guides/did-vc-hello-smoke-path.md)
