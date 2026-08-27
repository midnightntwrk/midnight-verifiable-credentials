# @midnight-ntwrk/credential-status

> Release stage: `supported`
> Maturity: `core`
> Package class: `dist`

Supported prerelease package for the protocol-neutral credential-status
boundary. It intentionally has no Compact, ledger, runtime, or deployment
dependency.

## Scope

This package contains only credential-bound status bindings, the four generic
status verification modes, freshness and verifier-policy data, reader/writer/
verifier ports, and status outcome semantics. `StatusReference` and
`statusHandle` are opaque values: a later adapter owns their encoding and
authority.

A verifier must distinguish:

- `valid`: status evidence supports the requested policy;
- `invalid`: authenticated evidence proves a hard status failure such as
  revocation, a binding mismatch, an unsupported mode, or stale state; and
- `indeterminate`: required status evidence or authority is unavailable or
  cannot be authenticated.

Only `valid` is acceptable. `invalid` and `indeterminate` both fail closed, but
indeterminate must not be reported as proof of revocation or another hard
invalidity. This package does not implement status mutation, live roots,
caller-selected authority or clock access, witnesses, Midnight adapters, or
artifacts.

## Usage

Import the root or one of the explicit subpaths (`./bindings`, `./outcomes`,
`./policy`, and `./ports`). Consumers must use the package name rather than
repository-relative source paths. This package is published as part of the
supported RC development surface.
