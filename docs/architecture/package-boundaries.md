# Midnight VC Package Boundary Decision

Status: architecture decision

Audience:
- VC package authors
- Layer 3 contract authors
- Layer 4 wallet/app/protocol authors

## Purpose

This document defines the package-boundary rules for the Midnight VC
repository.

The goal is to keep the VC stack:

- generic at its core
- highly composable for Layer 3 and Layer 4 engineers
- explicit about which packages own which kinds of logic

This is an architecture decision document. It is more authoritative than the
general overview when package placement or dependency direction is unclear.

Related documents:

- architecture overview:
  - [`./overview.md`](./overview.md)
- package tier inventory:
  - [`./package-tier-inventory.md`](./package-tier-inventory.md)
- protocol classification:
  - [`./protocol-classification.md`](./protocol-classification.md)
- dependency composition model:
  - [`./dependency-composition.md`](./dependency-composition.md)
- package-selection guide:
  - [`../guides/package-selection.md`](../guides/package-selection.md)
- profile catalog:
  - [`../spec/profiles.md`](../spec/profiles.md)
- holder-binding terminology:
  - [`./holder-binding-terminology.md`](./holder-binding-terminology.md)
- credential-family ownership and graduation policy:
  - [`./credential-family-ownership-policy.md`](./credential-family-ownership-policy.md)

## Design goals

The repository should let engineers compose Layer 3 and Layer 4 solutions from
small, understandable building blocks.

That means:

1. core VC semantics must not depend on a particular DID runtime or transport
2. credential families must not redefine generic VC semantics
3. transport/protocol packages must wrap canonical VC payloads rather than
   inventing new canonical models
4. demos and prototypes must prove capabilities without silently becoming core
   dependencies

## Package classes

The repository is divided into six package classes.

### 1. Core VC packages

These define reusable VC semantics and Compact-first primitives.

Current packages:

- `credentials`
- `credentials-same-holder`
- `credentials-iso-registry`
- `credentials-status-registry`

These packages form the compositional substrate used by the rest of the repo.

Current note on `credentials-status-registry`:

- it mixes a Compact registry contract with off-chain witness/attestation
  helpers
- in the current repository it is still best treated as a core-capability
  package because it defines the current status/revocation support surface used
  by higher layers
- the generic VC-side status binding should remain in `credentials`, while
  verifier-facing proof protocols and registry-specific helpers should live in
  `credentials-status-registry`

### 2. Credential-family packages

These define concrete claims, disclosures, predicates, and family-specific
request/verification models.

Current packages:

- `credentials-birth`
- `credentials-birth-secret`

Future examples:

- passport families
- compliance families
- sector-specific credential families

### 3. DID-aware adapter packages

These packages adapt DID-specific runtime concepts into VC-friendly values.

They are allowed to depend on:

- `midnight-did`
- DID-domain/runtime packages
- the generic VC core

They are not allowed to redefine canonical VC semantics.

Current packages:

- `credentials-offchain-did`

### 4. Status capability / registry packages

These packages own typed status/revocation capability surfaces where the
repository currently needs both:

- Compact contract state or validation surfaces
- off-chain builder/runtime helpers

Current packages:

- `credentials-status-registry`

These packages may expose mixed surfaces, but they must keep the boundary
explicit:

- on-chain contract-facing Compact entrypoints
- off-chain helper/builders in TypeScript

Normalized ownership rule:

- `credentials`
  - owns shared VC/VP status binding types
  - examples:
    - `StatusRegistryRef`
    - `NoStatusBinding`
    - `RegistryBoundStatusBinding`
- `credentials-status-registry`
  - owns verifier-facing status proof protocols and registry-specific helpers
  - examples:
    - `RevokedSetStatusRequest`
    - `AuthorityAttestedStatusProofProtocol`
    - `RevokedSetNonMembershipStatusProofProtocol`

They must not silently blur those two roles into one generic runtime API.

Import normalization rule:

- if the code is defining VC or VP family shape, import status binding from
  `credentials`
- if the code is defining verifier-request semantics, Layer 3 status checks, or
  off-chain status builders, import proof-protocol helpers from
  `credentials-status-registry`

### 5. Protocol / transport / application-composition packages

These packages orchestrate issuance, presentation, transport framing, session
flows, or app-facing workflows.

Current packages:

- `credential-exchange` — private family-neutral injected orchestration candidate
- `credentials-protocol` — private outward birth/birth-secret/age-gate reference and compatibility adapter
- `credentials-openid` — protocol adapter

Family-neutral exchange depends only on canonical model contracts. Concrete
reference adapters compose family packages from the outer layer. Protocol
adapters consume canonical family bytes and cannot redefine core validity.
See [`./family-neutral-exchange-ports.md`](./family-neutral-exchange-ports.md).

### 6. Demo / prototype / integration packages

These packages prove capability breadth or business-flow viability, but they are
not the core product surface.

Current packages:

- `credentials-demo-contract`
- `standalone-environment`

Target prototype package policy:

- any future prototype matrix or example package must be explicit, documented,
  and structurally real

Example target package:

- `credentials-birth-binding-prototypes`

Current state:

- no real workspace package currently exists under the historical placeholder
  name `credentials-birth-binding-prototypes` on `develop`
- docs and engineering work should treat that name as planned until restored

## What belongs in each package class

### `credentials`

This package is the generic VC core.

It should contain:

- generic credential and presentation envelope structs
- generic proof structs
- generic holder-binding structs and validation circuits
- generic issuance/presentation protocol modules
- Compact-first helper circuits that are independent of any specific DID
  runtime or transport adapter

It must not contain:

- business-specific verifier contract state or policy
- deploy-looking application contract wrappers around the generic core
- runtime DID URL parsing
- runtime DID resolution helpers
- filesystem-based package discovery
- transport-adapter logic
- business-contract/demo flow logic

Key rule:

- `credentials` owns the canonical Compact/core struct
  `OffchainMidnightHolderBinding`
- `credentials-offchain-did` owns the preferred runtime/public-facing adapter
  name `OffchainDIDHolderBinding`
- `credentials` must not own the runtime TS helper that parses a long-form DID
  URL and produces that binding

### Credential-family packages

These packages should contain:

- concrete claim schemas
- concrete disclosure schemas
- concrete request/verification shapes
- family-specific root computations
- family-specific validation circuits
- family-specific fixtures/tests

They must not contain:

- generic VC envelope semantics already defined in `credentials`
- transport/session logic
- generalized DID runtime helpers

Key rule:

- a family package should be easy to compose into many different Layer 3 and
  Layer 4 flows without dragging in transport or runtime concerns.

### DID-aware adapter packages

These packages should contain:

- runtime parsing/normalization of DID-aware inputs
- canonical conversion from DID-shaped runtime values into VC binding values
- helper functions such as:
  - method-reference normalization
  - method-id hashing
  - creation of DID-aware holder-binding structs from long-form DID material

They may depend on:

- `credentials`
- `midnight-did` and related DID packages

They must not contain:

- generic VC semantics that belong in `credentials`
- business/demo-specific assumptions
- protocol flow orchestration

Key rule:

- DID-aware helpers are allowed here and only here.

### Status capability / registry packages

These packages should contain:

- status-aware contract state or contract validation surfaces
- typed status request / witness / attestation helpers
- clearly separated on-chain and off-chain integration seams

They may depend on:

- `credentials`
- selected credential-family packages when the capability is family-aware

They must not contain:

- transport/session orchestration that belongs in protocol layers
- ambiguous APIs that hide whether a surface is contract-facing or runtime-only

Key rule:

- mixed-surface status packages are allowed, but they must label the contract
  surface and the runtime-helper surface explicitly
- status proof semantics are not a credential-family shape decision
- credential families bind status once
- verifier flows and Layer 3 contracts choose how to verify that binding

### Protocol / transport / application-composition packages

These packages should contain:

- orchestration of issuance and presentation flows
- transport/domain adapters
- session-level or challenge-level composition
- application-facing glue across multiple packages/core/family packages

They may depend on:

- core VC packages
- credential-family packages
- DID-aware adapter packages

They must not contain:

- redefinitions of canonical VC data structures
- hidden dependency on internal generated artifacts where stable package
  surfaces exist

Key rule:

- Layer 4 packages compose inner layers; they do not redefine them.

### Demo / prototype / integration packages

These packages should contain:

- business-flow demonstrations
- capability matrix prototypes
- integration harnesses
- standalone or containerized test infrastructure

They may depend on:

- anything they need to prove the intended flow

They must be clearly labeled as:

- demo
- prototype
- integration infrastructure

Key rule:

- they may prove breadth, but they must not quietly become the conceptual core
  of the repo.

## Dependency direction

Allowed dependency direction:

1. core VC packages
2. credential-family packages
3. DID-aware adapter packages
4. protocol / transport / application-composition packages
5. demo / prototype / integration packages

Practical interpretation:

- outer layers may depend on inner layers
- inner layers must not depend on outer layers

Examples:

- `credentials-birth` may depend on `credentials`
- `credentials-offchain-did` may depend on `credentials` and `midnight-did`
- `credentials-protocol` may depend on `credentials-birth` and
  `credentials-offchain-did`
- `credentials-demo-contract` may depend on family packages and protocol/demo
  helpers

Forbidden direction examples:

- `credentials` depending on `credentials-protocol`
- `credentials` depending on a DID-aware runtime adapter package
- `credentials-birth` depending on `credentials-openid`

## Specific decision: DID-aware runtime helpers

Decision:

- DID-aware runtime helpers are allowed in this repository
- they are not allowed in generic core packages
- they should live in a dedicated DID-aware adapter package

Reason:

- this keeps the core VC packages generic and highly reusable
- it lets engineers opt into DID-aware composition only when needed
- it avoids silent architecture reversal where the generic core becomes coupled
  to one runtime stack

## Specific decision: Offchain DID public holder binding

Decision:

- keep the canonical Compact/core struct name:
  - `OffchainMidnightHolderBinding`
- expose the preferred runtime/public-facing adapter name:
  - `OffchainDIDHolderBinding`
- preserve compatibility aliases while downstream runtime code migrates

Reason:

- Compact/source compatibility is less disruptive if the core struct name stays
  stable
- the shorter runtime/public-facing name is easier for engineers to understand
  and compose
- this keeps the boundary between core Compact semantics and runtime adapter
  ergonomics explicit

## Specific decision: raw Jubjub public holder binding

Decision:

- `JubjubHolderBinding` remains available as a compatibility/minimal primitive
- it is deprecated as a recommended public profile for new DID-shaped flows

Reason:

- it is still useful as a tiny compatibility or test primitive
- but the preferred public lightweight DID-shaped path should be the offchain
  DID holder-binding profile

## Composition guidance for engineers

### If you are building a new credential family

Use:

- `credentials`
- `credentials-iso-registry`
- optionally `credentials-same-holder`

Do not add:

- transport logic
- runtime DID parsing
- business contract state

### If you are building a DID-aware wallet/app helper

Use:

- `credentials`
- a DID-aware adapter package such as `credentials-offchain-did`
- optionally protocol/transport packages

Do not add DID runtime parsing to:

- `credentials`
- credential-family packages

### If you are building a business verifier contract

Use:

- one or more family packages
- core VC packages
- optional protocol simulation helpers for tests only

Do not make the contract package the owner of generic VC semantics.

### If you are proving capability breadth

Use:

- a clearly labeled prototype package

Do not:

- hide prototype logic inside the core package tree

## Immediate package consequences

The next architecture-aligned implementation steps are:

1. introduce a dedicated DID-aware adapter package for offchain DID binding
2. keep `credentials` generic
3. restore prototype/example packages only as explicit real workspace packages
4. update docs/spec/profile/test-matrix language to match the package split

## Acceptance criteria

This decision is being followed if:

- core packages remain runtime-agnostic
- DID-aware helpers live only in dedicated adapter packages
- transport/protocol packages compose inner layers rather than redefining them
- prototypes and demos are explicit and structurally separated
- engineers can build Layer 3 and Layer 4 solutions by composing package
  classes without importing private implementation debris


## Concrete-family ownership boundary

The concrete-family placement and graduation rules are normative in the
[credential-family ownership policy](./credential-family-ownership-policy.md).
In summary, reusable core remains family-agnostic; family-specific tests stay
with private prototype families; and production-shaped compositions belong under
`packages/use-cases/` without implying production approval. The workspace catalog
and package-boundary guard enforce the dependency direction and require any
legacy composition exception to be enumerated explicitly.
