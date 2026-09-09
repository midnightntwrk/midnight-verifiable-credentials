# Midnight Verifiable Credentials

Protocol-independent verifiable credential and presentation building blocks for
Midnight.

This site documents the normative core specification, conformance evidence, and
the two reusable packages published by this repository. Concrete credential
families, protocols, wallets, applications, and deployment environments belong
in independently versioned consumer repositories.

## Start Here

- [Read the core specification](/spec/)
- [Install and compose the packages](/guide/quickstart)
- [Inspect conformance evidence](/conformance/)
- [Understand the core-only boundary](/architecture/core-only)

## Published Packages

| Package                              | Responsibility                                               |
| ------------------------------------ | ------------------------------------------------------------ |
| `@midnight-ntwrk/credential-model`   | Credential-family and claim-schema metadata with validation  |
| `@midnight-ntwrk/credential-compact` | Family-neutral Compact VC/VP structures and proof primitives |

Both packages are intentionally small, independently consumable building
blocks. Neither package defines an issuance or presentation protocol.

## Trust Boundary

A valid core proof establishes control of a supplied Jubjub key over an exact,
domain-separated body. It does not independently establish issuer trust, DID
authorization, current credential status, trusted time, or application policy.
Those decisions remain explicit composition responsibilities.
