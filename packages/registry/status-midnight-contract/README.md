# `@midnight-ntwrk/credential-status-midnight-contract`

> Maturity: `infrastructure`
> Package class: `dist`

Internal candidate reference state package for a least-privilege Midnight status registry.

It owns immutable network/namespace/registry/deployment binding, serialized initialization and revocation, expected-version concurrency, operation-scoped nonce receipts, exact idempotent replay, same-nonce conflict rejection, revoked-set state, and a rolling redacted audit commitment. Every state-changing call invokes an injected `StatusRegistryAuthorizationGateV1` inside the serialized transition.

This package does **not** import DID/trust evidence, mutation signing, key custody, or verifier policy. Use `credential-status-midnight-authority` to supply the gate and `credential-status-midnight-verifier` for reads.

Security status: reference adapter only. It proves the package and state-machine boundary required by issue #495, but does not replace the legacy Compact registry or claim final B1/B2/B3 ledger authority. Root-bound non-membership cryptography and trusted ledger time remain separate work.
