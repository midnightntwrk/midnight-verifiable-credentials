# `@midnight-ntwrk/credential-status-midnight-verifier`

> Maturity: `infrastructure`
> Package class: `dist`

Internal candidate read/witness adapter for Midnight status registry state.

The package depends only on generic `credential-status` semantics and `credential-status-midnight-contract`. It exposes state reads, status-handle digest derivation, and a generic `StatusReader` adapter. It has no mutation, DID/trust evidence, signing, or key-custody dependency.

Root-bound membership/non-membership proof verification is intentionally outside issue #495 and must land before an external-root profile can claim cryptographic status validity.
