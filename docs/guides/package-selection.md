# Midnight VC Package Selection

Status: informative package-selection guide

## Purpose
This guide helps engineers choose the right starting package in the
`midnight-verifiable-credentials` repository.

Use it when you know what kind of VC feature you need, but do not yet know
which package owns it.

Related documents:

- normative spec:
  - [`../spec/midnight-credentials.md`](../spec/midnight-credentials.md)
- profile catalog:
  - [`../spec/profiles.md`](../spec/profiles.md)
- architecture overview:
  - [`../architecture/overview.md`](../architecture/overview.md)

## Quick Selection
### I need the generic VC/VP model
Start with:

- [`../../credentials/README.md`](../../credentials/README.md)

Use this when you need:

- generic credential/presentation envelopes
- proof structures
- holder-binding structures
- canonical VC serialization helpers

### I need a concrete birth-credential family
Choose one of:

- explicit/public-holder shape:
  - [`../../credentials-birth/README.md`](../../credentials-birth/README.md)
- hidden-secret-holder shape:
  - [`../../credentials-birth-secret/README.md`](../../credentials-birth-secret/README.md)

Use `credentials-birth` when a public holder reference is acceptable.
Use `credentials-birth-secret` when holder privacy is the primary concern.

### I need same-holder correlation across credentials
Start with:

- [`../../credentials-same-holder/README.md`](../../credentials-same-holder/README.md)

This is a capability package, not a standalone credential family.

### I need shared ISO code types
Start with:

- [`../../credentials-iso-registry/README.md`](../../credentials-iso-registry/README.md)

Use this package instead of inventing local country/currency/gender code types.

### I need OpenID-oriented or web transport adaptation
Start with:

- [`../../credentials-openid/README.md`](../../credentials-openid/README.md)

Use this when the problem is transport, issuance/presentation envelope shape,
or payload framing around Compact-native values.

### I need reference issuance/presentation orchestration
Start with:

- [`../../credentials-protocol/README.md`](../../credentials-protocol/README.md)

Use this when you need off-chain flow orchestration, simulation, or reference
protocol behavior rather than the canonical VC data model alone.

### I need a verifier/business contract example
Start with:

- [`../../credentials-demo-contract/README.md`](../../credentials-demo-contract/README.md)

Use this as a composition example, not as a generic VC library.

### I need standalone integration infrastructure
Start with:

- [`../../standalone-environment/README.md`](../../standalone-environment/README.md)

Use this when the task is environment setup, docker-backed testing, or shared
integration harness behavior.

## Profile-Oriented Selection
### On-chain DID-oriented public holder binding
Start with:

- `credentials`
- then a family like `credentials-birth`

This aligns with explicit DID holder binding.

### Hidden-holder privacy-first flows
Start with:

- `credentials`
- `credentials-birth-secret`
- optionally `credentials-same-holder`

### Lightweight offchain Midnight DID prototypes
Start with:

- `credentials`
- then the offchain Midnight DID profile support described in:
  - [`../spec/profiles.md`](../spec/profiles.md)

### Prototype orchestration and transport flows
Start with:

- `credentials-protocol`
- `credentials-openid`

These are outer-layer packages. They are not the canonical spec source.
For the full holder-binding profile catalog, including verifier-domain pseudonym
and legacy Jubjub guidance, see [`../spec/profiles.md`](../spec/profiles.md).

## Maturity Guidance
### Reference implementation packages
These are the strongest package surfaces to build on first:

- `credentials`
- `credentials-birth`
- `credentials-birth-secret`
- `credentials-iso-registry`
- `credentials-openid`

`credentials-openid` is treated here as the current reference transport-adapter
surface, even though it lives in the outer orchestration layer.

### Prototype packages
These are valuable, but should be treated as evolving:

- `credentials-protocol`
- `credentials-demo-contract`
- `credentials-birth-binding-prototypes`

### Capability package
This package is stable in purpose, but not a standalone family:

- `credentials-same-holder`

### Infrastructure package
This package is support tooling, not a canonical VC model surface:

- `standalone-environment`

## Selection Rules
Prefer:

- the smallest package that owns the feature you need
- a credential family when your problem is schema-specific
- the generic core when your problem is VC semantics rather than schema
- transport/protocol packages only when your problem is orchestration or wire
  behavior

Avoid:

- starting from demo-contract when you really need the core VC model
- inventing custom transport formats before checking `credentials-openid`
- copying shared ISO code types locally
- treating prototype packages as a substitute for the canonical spec
