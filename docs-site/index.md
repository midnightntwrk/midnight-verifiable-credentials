# Midnight Verifiable Credentials

Protocol-independent verifiable credential and presentation building blocks for
Midnight.

This site documents the normative core specification, conformance evidence, and
the reusable packages published by this repository. Concrete credential
implementations, protocols, wallets, applications, and deployment environments
belong in independently versioned consumer repositories.

## Start Here

- [Read the core specification](/spec/)
- [Install and compose the packages](/guide/quickstart)
- [Inspect conformance evidence](/conformance/)
- [Understand the core-only boundary](/architecture/core-only)

## Published Packages

| Package                                   | Responsibility                                               |
| ----------------------------------------- | ------------------------------------------------------------ |
| `@midnight-ntwrk/credential-model`        | Credential schema and claim metadata with validation         |
| `@midnight-ntwrk/credential-compact`      | Schema-neutral Compact VC/VP structures and proof primitives |
| `@midnight-ntwrk/credential-did-midnight` | Optional Midnight DID-to-core binding and Compact extension  |

The packages are intentionally small, composable building blocks. None defines
an issuance or presentation protocol.

This source tree documents the `0.4.0` release base. The current npm `latest`
graph is `0.2.0`, and `0.3.0-rc1` is available under `rc`. The
[quickstart](/guide/quickstart) pins exact versions and guards moving tags.

## Trust Boundary

A valid core proof establishes control of a supplied Jubjub key over an exact,
domain-separated body. It does not independently establish issuer trust, DID
authorization, current credential status, trusted time, or application policy.
Those decisions remain explicit composition responsibilities.
