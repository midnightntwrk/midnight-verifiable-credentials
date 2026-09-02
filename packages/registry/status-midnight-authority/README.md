# `@midnight-ntwrk/credential-status-midnight-authority`

> Maturity: `infrastructure`
> Package class: `dist`

Internal candidate controller/delegate write-authorization adapter for Midnight status.

`createStatusRegistryAuthorityGateV1` consumes the family-neutral DID method and trust evidence ports introduced by issue #494. It binds the `status` actor to the exact operator key, relationship, network/state/trust policy, request digest, immutable registry namespace/deployment, authority generation, operation, nonce, expected version, and validity interval. Delegates additionally require authenticated grant evidence for the exact active revoke scope; unavailable evidence is indeterminate and stale, revoked, expired, cross-scope, or cross-deployment evidence is invalid.

Authorization validity now requires `StatusTrustedTimeVerifierV1`; the former
clock port is removed. `createStatusTrustedTimeVerifierV1` composes the shared
scope-bound trusted-time verifier, execution-anchor adapter, optional #494 time
attestor verifier, and persisted rollback/replay checkpoint. Checkpoint reads
use a request-independent key over network, deployment, authority, and source
policy, so a new request or challenge cannot reset the accepted sequence. The
injected checkpoint store must enforce monotonic compare-and-set semantics
atomically; a last-write-wins store is not replay protection. Nominally valid
adapter times must still be non-negative safe integers. Missing time or
checkpoint persistence is indeterminate, and local-reference time cannot
authorize a registry write.

The package owns a status-specific signing **port**, not keys. `StatusAuthoritySignerV1` keeps custody and DID method implementations injected. This repository does not implement a DID method or trust registry here.

Security status: reference adapter only. The injected grant provider must authenticate controller-issued grant provenance. The adapter does not operate a time source or fabricate the full B3 ledger-position/context anchor; those remain governed by the status authority specification.
