# `@midnight-ntwrk/credential-status-midnight-authority`

> Maturity: `infrastructure`
> Package class: `dist`

Internal candidate controller/delegate write-authorization adapter for Midnight status.

`createStatusRegistryAuthorityGateV1` consumes the family-neutral DID method and trust evidence ports introduced by issue #494. It binds the `status` actor to the exact operator key, relationship, network/state/trust policy, request digest, immutable registry namespace/deployment, authority generation, operation, nonce, expected version, and validity interval. Delegates additionally require authenticated grant evidence for the exact active revoke scope; unavailable evidence is indeterminate and stale, revoked, expired, cross-scope, or cross-deployment evidence is invalid.

The package owns a status-specific signing **port**, not keys. `StatusAuthoritySignerV1` keeps custody and DID method implementations injected. This repository does not implement a DID method or trust registry here.

Security status: reference adapter only. The injected grant provider must authenticate controller-issued grant provenance. Final in-circuit authority and trusted ledger time remain governed by the B1/B3 gates in the status authority specification.
