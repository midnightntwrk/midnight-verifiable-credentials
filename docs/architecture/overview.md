# Midnight VC Architecture Overview

Status: informative architecture overview

## Purpose
This document explains the repository structure and package responsibilities for
engineers who need to understand how the Midnight VC stack is assembled.

It is an orientation document, not a normative specification.

Related documents:

- normative spec:
  - [`../spec/midnight-credentials.md`](../spec/midnight-credentials.md)
- profile catalog:
  - [`../spec/profiles.md`](../spec/profiles.md)
- conformance draft:
  - [`../spec/conformance.md`](../spec/conformance.md)
- deeper package-composition note:
  - [`./dependency-composition.md`](./dependency-composition.md)
- package-boundary decision:
  - [`./package-boundaries.md`](./package-boundaries.md)
- package tier inventory:
  - [`./package-tier-inventory.md`](./package-tier-inventory.md)
- protocol classification:
  - [`./protocol-classification.md`](./protocol-classification.md)
- package-selection guide:
  - [`../guides/package-selection.md`](../guides/package-selection.md)

## Layer Model
The repository is organized as a layered Compact-first stack.

| Layer | Role | Package examples |
| --- | --- | --- |
| Layer 1 | Generic VC/VP capabilities | `credentials`, `credentials-same-holder`, `credentials-iso-registry`, `credentials-status-registry` |
| Layer 2 | Concrete credential families | `credentials-birth`, `credentials-birth-secret`, `credentials-hello-family` (starter), `credentials-dummy-claims` (claim-surface lab) |
| Layer 2.5 | DID-aware runtime adapters | `credentials-offchain-did` |
| Layer 3 status prototype | Status-aware contract surface plus off-chain builders | `credentials-status-registry` |
| Layer 3 | Verifier/business contract composition | `hello-verifier-contract`, `credentials-demo-contract` |
| Layer 4 | Transport and protocol orchestration | `credentials-openid`, `credentials-protocol` |
| Shared infra | Standalone integration/runtime support | `standalone-environment` |

Use [`./package-tier-inventory.md`](./package-tier-inventory.md) when you need
the canonical classification of which packages are:

- reusable core
- credential families
- DID-aware adapters
- Layer 3 / Layer 4 wiring helpers
- demos / prototypes
- shared integration infrastructure

Use [`./protocol-classification.md`](./protocol-classification.md) when the
question is not “which package owns this?” but “is this canonical VC protocol
semantics or just Layer 3 / Layer 4 wiring?”

## Package Responsibilities
### `credentials`
This is the generic VC/VP core.

It provides:

- generic credential and presentation envelopes
- proof structures and proof verification helpers
- schema reference types
- holder-binding structures and validation helpers
- generic transport framing helpers where they are part of the core runtime

This package defines repository-wide semantics. Concrete credential families
should depend on it rather than duplicating generic VC logic. It is not a
deployable business contract by itself.

### `credentials-same-holder`
This package provides holder-correlation capability for hidden-holder flows.

Use it when two or more credentials need to prove satisfaction by the same
hidden holder witness.

### `credentials-iso-registry`
This package provides shared Compact-native ISO code types.

It exists to keep country/currency/gender/related codes consistent across
credential families.

### `credentials-status-registry`
This package provides the current prototype status / revocation registry
surface.

It owns:

- the reference Compact revocation-registry contract
- off-chain status witness and authority-attestation builders
- request-bound status-attestation helpers for current Layer 3 flows

In the current repository shape, it should be treated as a Layer 1 capability
package with its own contract/runtime mix. The longer-term ownership of the
status DSL relative to the generic core remains an explicit backlog item rather
than a settled architecture fact.

### Credential-family packages
Credential-family packages define:

- concrete claim schemas
- disclosure schemas
- request schemas
- family-specific roots and validation circuits
- family-specific proofs of predicates

Examples currently in scope as strong repository surfaces are:

- `credentials-birth`
- `credentials-birth-secret`
- `credentials-hello-family`
  - current smallest compileable starter family,
    not a production privacy template
- `credentials-dummy-claims`
  - current broad direct claim-surface and selective-disclosure laboratory,
    not a production privacy template

### `credentials-offchain-did`
This package is the dedicated DID-aware adapter layer for offchain DID holder
binding.

It owns runtime parsing and conversion from portable offchain Midnight DID
inputs into the canonical VC holder-binding shape defined by `credentials`.

### `credentials-openid`
This package is a transport/domain adapter layer.

Its role is to move Compact-native payloads through OpenID-inspired or web
transport shapes without redefining canonical VC/VP semantics. Within the current
repository maturity model, it is treated as a reference implementation of the
transport-adapter role, even though it sits in the Layer 4 orchestration band.

### `credentials-protocol`
This package is a protocol/reference orchestration layer.

It models reference issuance/presentation flows and simulation logic above the
canonical Compact VC core.

### `hello-verifier-contract`
This starter and lab package owns:

- the smallest checked-in verifier contract over `credentials-hello-family`
- the offchain-DID-backed starter verifier path
- the full-disclosure verifier lab for `credentials-dummy-claims`

It should be treated as a starter and laboratory package, not as a canonical
reusable protocol or privacy template.

### `credentials-demo-contract`
This package demonstrates verifier/business contract composition.

It should consume credential-family verification logic rather than redefining VC
semantics locally.

Repository convention for demo packages:

- demos should be small and business-facing
- each demo should focus on one capability composition or trust boundary
- demos should export the circuits an integrator would actually call
- intermediate verification helpers should remain internal unless there is a
  strong reuse case

This keeps demo artifacts easier to review, easier to explain to integrators,
and materially cheaper to compile in CI.

### Historical placeholder package names
`credentials-birth-binding-prototypes` still appears in some planning notes as a
future restoration target. It is not a current workspace package and should not
be treated as part of the validated package spine.

### `standalone-environment`
This package provides shared integration infrastructure for docker-backed or
standalone validation lanes.

It is infrastructure, not a canonical VC/VP model package.

## Generated compatibility roots
The top-level `midnight-did-credentials*` symlinks that appear at the repository
root are generated compatibility bridges. They are useful for local tooling and
legacy include paths, but they are not part of the canonical architecture tree.

Read the repository shape through these durable areas instead:

- `core/`
- `registry/`
- `protocols/`
- `components/`
- `prototypes/`
- `use-cases/`
- `tooling/`

## Dependency Direction
The intended dependency direction is:

1. generic VC core and shared code types
2. concrete credential families
3. DID-aware adapter packages
4. business/verifier contracts and transport/protocol orchestration

The important architectural rule is:

- outer layers may compose inner layers
- outer layers should not redefine inner-layer semantics

In practice that means:

- credential families should reuse `credentials`
- verifier contracts should reuse family validation logic
- OpenID/protocol layers should wrap Compact payloads rather than invent a new
  canonical model
- demo contracts should stay narrow and add new roots for new capability
  combinations instead of exporting every intermediate verification path

The formal package-boundary rules for that layering are defined in:

- [`./package-boundaries.md`](./package-boundaries.md)

## Canonical Boundary
The canonical VC/VP model lives in Compact.

This means:

- Compact structs and circuits are the source of truth
- generated TypeScript artifacts are bridges for tests and applications
- JSON or OpenID envelopes are outer transport layers only

Architecturally, this is the most important rule in the repository.

## Public Surface Guidance
A package consumer should prefer:

- documented package entry points
- package README guidance
- package-level typed helpers

A consumer should avoid:

- depending on private generated names where a package helper exists
- treating generated `managed` output as the conceptual architecture boundary
- inventing field-by-field JSON formats as canonical input

## Composition Guidance
Single-family use is straightforward:

- import the family package
- use the family-specific types and validation circuits
- use the generic core through the family surface where possible

Multi-family contract composition is more demanding because shared Compact
source surfaces can collide. The detailed composition-safe package-shape problem
is described in:

- [`./dependency-composition.md`](./dependency-composition.md)

That document is intentionally deeper and more design-oriented than this
overview.

## Current Maturity Model
The repository contains a mix of maturity levels.

Current shorthand:

- reference implementation:
  - core VC package and key credential families
- prototype capability package:
  - `credentials-status-registry`
- reference transport adapter:
  - `credentials-openid`
- prototype:
  - `credentials-protocol` and selected profile-oriented surfaces
- experimental:
  - selected privacy-oriented or demo-oriented capabilities
- planned:
  - `credentials-birth-binding-prototypes` if it is restored as a real package

For the current package-by-package snapshot, see:

- [`../spec/conformance.md`](../spec/conformance.md)
  - `Current Package Maturity Table`
- [`../guides/integration-surface-map.md`](../guides/integration-surface-map.md)

Readers should evaluate maturity at the package and profile level, not at the
repository level.
