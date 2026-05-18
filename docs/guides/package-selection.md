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
- claim representation:
  - [`../spec/claim-representation.md`](../spec/claim-representation.md)
- architecture overview:
  - [`../architecture/overview.md`](../architecture/overview.md)
- protocol classification:
  - [`../architecture/protocol-classification.md`](../architecture/protocol-classification.md)
- integration surface map:
  - [`./integration-surface-map.md`](./integration-surface-map.md)

## Quick Selection
### I need the generic VC/VP model
Start with:

- [`../../core/primitives/credentials/README.md`](../../core/primitives/credentials/README.md)

Use this when you need:

- generic credential/presentation envelopes
- proof structures
- holder-binding structures
- canonical VC serialization helpers

### I need a concrete birth-credential family
Choose one of:

- explicit/public-holder shape:
  - [`../../prototypes/credential-families/birth/README.md`](../../prototypes/credential-families/birth/README.md)
- hidden-secret-holder shape:
  - [`../../prototypes/credential-families/birth-secret/README.md`](../../prototypes/credential-families/birth-secret/README.md)

Use `credentials-birth` when a public holder reference is acceptable.
Use `credentials-birth-secret` when holder privacy is the primary concern.

### I need the smallest compileable family starter
Start with:

- [`../../prototypes/credential-families/hello-family/README.md`](../../prototypes/credential-families/hello-family/README.md)

Use this when you need:

- the smallest compileable family package in the repo
- a starter DID -> VC -> verifier flow that stays intentionally narrow
- a safe place to prototype minimal claim-shape tradeoffs before committing to
  a real privacy model

Do not use `credentials-hello-family` as a production privacy template.
It is intentionally a direct-claim playground.

### I need the broadest direct claim-type lab
Start with:

- [`../../prototypes/credential-families/dummy-claims/README.md`](../../prototypes/credential-families/dummy-claims/README.md)

Use this when you need:

- the widest currently supported direct Compact claim surface in one package
- deterministic selective-disclosure fixtures over primitives, vectors, nested
  structs, and nested vectors
- a checked-in reference for what the current compiler accepts versus rejects
- a package that can evolve as the Compact compiler accepts more native field
  kinds

Do not use `credentials-dummy-claims` as a production privacy template.
It is intentionally a direct-claim laboratory package.

### I need public claims and private commitments in one family
Start with:

- [`../../prototypes/credential-families/mixed-claims/README.md`](../../prototypes/credential-families/mixed-claims/README.md)

Use this when you need:

- a small reference for explicit/public claims in the signed credential body
- private source facts represented as commitments
- disclosure gates that open committed values only when requested
- a predicate-only value that is checked against a commitment before threshold
  verification

Do not treat public claims as private. Any direct public claim can be observed
by every party that receives the credential body.

### I need an academic diploma family and a larger verifier-flow blueprint
Start with:

- [`../../prototypes/credential-families/university-diploma/README.md`](../../prototypes/credential-families/university-diploma/README.md)
- [`../../use-cases/university/README.md`](../../use-cases/university/README.md)
- [`../../use-cases/university/contract/README.md`](../../use-cases/university/contract/README.md)
- [`../../use-cases/university/protocol/README.md`](../../use-cases/university/protocol/README.md)

Use this when you need:

- a non-revocable explicit-holder academic diploma family
- a larger data-backed issuer/holder/verifier blueprint than `hello-family`
- batch issuance planning across many holders
- executable BDD scenarios for employer and student-discount verifier flows
- a checked-in verifier-side contract path for employer and mall policies
- a threaded multi-party protocol-style flow over the same dataset and verifier rules

Current constraint:

- string-like claim fields still use bounded `Bytes<N>` encodings because
  `Opaque<"string">` cannot be used in the canonical
  `persistentHash<Claims>(claims)` claim-root pattern used by this repository

### I need same-holder correlation across credentials
Start with:

- [`../../core/capabilities/same-holder/README.md`](../../core/capabilities/same-holder/README.md)

This is a capability package, not a standalone credential family.

### I need status / revocation registry support
Start with:

- [`../../core/primitives/credentials/README.md`](../../core/primitives/credentials/README.md)
- [`../../registry/status-registry/README.md`](../../registry/status-registry/README.md)
- then read:
  - [`../spec/credential-status.md`](../spec/credential-status.md)
  - [`../spec/revocation-registry.md`](../spec/revocation-registry.md)
  - [`../spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)

Use this when you need:

- the VC-side status binding types used by credential families
- the current prototype revocation-registry Compact contract
- verifier-supplied `(registryId, revokedRoot)` request helpers
- authority-attested status proof builders
- off-chain status witness and status-handle helpers

Status ownership split:

- `credentials`
  - owns shared VC-side status binding and policy vocabulary
  - examples:
    - `StatusRegistryRef`
    - `NoStatusBinding`
    - `RegistryBoundStatusBinding`
- `credentials-status-registry`
  - owns registry-specific and verifier-facing proof-protocol helpers
  - examples:
    - `RevokedSetStatusRequest`
    - `AuthorityAttestedStatusProofProtocol`
    - `RevokedSetNonMembershipStatusProofProtocol`

This is not a standalone credential family.
This capability area is intentionally split across two packages:

- core VC binding vocabulary in `credentials`
- registry contract and verifier/holder helpers in `credentials-status-registry`

### I need shared ISO code types
Start with:

- [`../../core/primitives/iso-registry/README.md`](../../core/primitives/iso-registry/README.md)

Use this package instead of inventing local country/currency/gender code types.

### I need OpenID-oriented or web transport adaptation
Start with:

- [`../../protocols/openid/README.md`](../../protocols/openid/README.md)

Use this when the problem is transport, issuance/presentation envelope shape,
or payload framing around Compact-native values.

### I need reference issuance/presentation orchestration
Start with:

- [`../../components/orchestration/protocol/README.md`](../../components/orchestration/protocol/README.md)

Use this when you need off-chain flow orchestration, simulation, or reference
protocol behavior rather than the canonical VC data model alone.

Important rule:

- `credentials-protocol` is a Layer 4 wiring/orchestration package
- it is not the canonical reusable VC protocol specification

### I need a verifier/business contract example
Start with:

- [`../../use-cases/age-gate/contract/README.md`](../../use-cases/age-gate/contract/README.md)

Use this as a composition example, not as a generic VC library.

If you need the smallest copyable starting point rather than a full demo package, continue with:

- [`../templates/verifier-contract-template.compact.md`](../templates/verifier-contract-template.compact.md)
- [`./hidden-holder-hello-world.md`](./hidden-holder-hello-world.md)

### I need standalone integration infrastructure
Start with:

- [`../../components/integration/standalone-environment/README.md`](../../components/integration/standalone-environment/README.md)

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
- `credentials-offchain-did`
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
- `credentials-status-registry`
- `credentials-offchain-did`
- `credentials-birth`
- `credentials-birth-secret`
- `credentials-iso-registry`
- `credentials-openid`

`credentials-openid` is treated here as the current reference transport-adapter
surface, even though it lives in the outer orchestration layer.

Current note:

- `credentials-status-registry` is a real workspace package and the current
  entry point for status/revocation registry work
- its trust model is still prototype-grade, especially for final in-circuit
  non-membership enforcement

### Prototype packages
These are valuable, but should be treated as evolving:

- `credentials-protocol`
- `credentials-demo-contract`
- `credentials-status-registry`
- `credentials-dummy-claims`
- `credentials-mixed-claims`

Historical placeholder name still referenced in some planning docs:

- `credentials-birth-binding-prototypes`
  - not a current workspace package; treat it as roadmap-only unless it is restored explicitly

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
- treating `credentials-birth-binding-prototypes` as a current supported package
  when it is only a historical placeholder name in the docs
