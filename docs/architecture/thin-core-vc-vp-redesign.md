# Thin Core VC/VP Redesign

Status: proposed prototype-only execution plan

Purpose:

- replace the current fused generic VC core with a thinner final model
- make VC-side status binding a first-class generic parameter
- keep presentation and protocol semantics outside the credential core
- keep optional proof logic stackable so circuit composition stays deliberate
- provide the next 5 stacked PR slices for implementation

Related documents:

- current core spec:
  - [`../spec/midnight-credentials.md`](../spec/midnight-credentials.md)
- protocol classification:
  - [`./protocol-classification.md`](./protocol-classification.md)
- status binding note:
  - [`./status-binding-body-root-commitment.md`](./status-binding-body-root-commitment.md)
- dependency composition:
  - [`./dependency-composition.md`](./dependency-composition.md)
- maturity backlog:
  - [`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md)

## Decisions

This redesign is based on the following decisions:

1. prototype-only posture
- backward compatibility is not a goal for this redesign
- transitional compatibility facades should be avoided unless a migration would otherwise be blocked

2. thin generic core
- generic modules should contain only generic and must-have circuits
- optional proof semantics should live in separate helpers or higher-layer packages
- a source-file split is not valuable by itself; the real goal is to keep optional logic out of the default validation paths that affect circuit complexity

3. implicit status binding
- status binding should be selected by the generic type itself
- the core should not embed an explicit generic `StatusBindingKind` discriminator into the credential body

4. layered protocol model
- VC-side status binding belongs to the credential model
- presentation-time non-revocation and authority-attested status proofs belong to protocol or registry layers
- holder-binding, same-holder, predicates, and status proof protocols should remain stackable composition layers

## Current problems

The repository still carries several transitional shapes that work, but do not represent the final architecture.

### 1. The generic VC module is fused with presentation semantics

Current file:
- [`../../core/primitives/credentials/src/credentials/vc.compact`](../../core/primitives/credentials/src/credentials/vc.compact)

Current state:
- `module VC<TClaims, TDisclosures, THolderBinding>` defines both:
  - `Credential`
  - `Presentation`
- the same module also owns generic presentation envelope validation

Problem:
- credentials and presentations are different semantic objects
- `TClaims` and `TDisclosures` belong to different layers
- the current shape makes the core harder to reason about and discourages clean composition

### 2. Generic protocol templates still carry status-capability semantics

Current file:
- [`../../core/primitives/credentials/src/credentials/protocols.compact`](../../core/primitives/credentials/src/credentials/protocols.compact)

Current state:
- generic issuance and presentation message templates live beside:
  - `VerifierStatusPolicy`
  - `StatusCapabilityKind`
  - status-capability validators

Problem:
- generic message envelopes are reusable core protocol syntax
- status proof policy and capability vocabulary are not part of the same minimal layer
- this mixes generic transport-neutral protocol shape with registry-facing status semantics

### 3. Core status bindings still depend on capability-style transitional abstractions

Current files:
- [`../../core/primitives/credentials/src/credentials/types.compact`](../../core/primitives/credentials/src/credentials/types.compact)
- [`../../core/primitives/credentials/src/credentials/status-bindings.compact`](../../core/primitives/credentials/src/credentials/status-bindings.compact)

Previous state:
- core defined:
  - `StatusCapabilityKind`
  - `NoStatusCapability`
  - `RevokedSetNonMembershipStatusCapability`
  - `AuthorityAttestedStatusCapability`
- `status-bindings.compact` converted capability-style values into `RegistryBoundStatusBinding`

Problem:
- the credential core should own only VC-side status binding
- proof-mode or verifier-facing status vocabulary should not be the source of truth for the core binding layer

### 4. Status-aware hidden-holder families still retain a transitional wrapper

Current files:
- [`../../prototypes/credential-families/birth-secret/src/secret-birth-credential/status-model.compact`](../../prototypes/credential-families/birth-secret/src/secret-birth-credential/status-model.compact)
- [`../../prototypes/credential-families/birth-secret/src/secret-birth-credential/helpers.compact`](../../prototypes/credential-families/birth-secret/src/secret-birth-credential/helpers.compact)

Current state:
- the capability-first wrappers have been removed
- the hidden-holder family still exposes one transitional wrapper:
  - `SecretBirthCredentialWithStatusBinding`

Problem:
- this wrapper is still a migration bridge
- it is not the target architecture when status binding is part of the credential generic itself

## Target model

The final prototype core should expose four thin generic templates and one shared relation layer.

### 1. VC

Conceptual shape:

```compact
module VC<TClaims, THolderBinding, TStatusBinding> {
  export struct Credential {
    version: Uint<16>,
    schema: SchemaRef,
    issuerVerificationMethodRef: VerificationMethodRef,
    holderBinding: THolderBinding,
    statusBinding: TStatusBinding,
    issuedAt: Uint<64>,
    hasExpiration: Boolean,
    expiresAt: Uint<64>,
    claims: TClaims,
    claimRoot: Bytes<32>,
  }
}
```

Responsibilities:
- define the credential envelope
- compute the credential body root
- validate generic credential envelope invariants
- validate issuer proof against the credential body root

Non-responsibilities:
- presentation semantics
- family request semantics
- status proof protocols
- holder-binding-specific checks beyond generic composition hooks

### 2. VP

Conceptual shape:

```compact
module VP<TDisclosures, THolderBinding> {
  export struct Presentation {
    version: Uint<16>,
    schema: SchemaRef,
    credentialClaimRoot: Bytes<32>,
    issuerVerificationMethodRef: VerificationMethodRef,
    holderBinding: THolderBinding,
    disclosed: TDisclosures,
  }
}
```

Responsibilities:
- define the presentation envelope
- compute the presentation body root
- validate generic presentation envelope invariants that do not depend on family-specific request semantics

Non-responsibilities:
- credential-side status binding
- status proof protocols
- family predicates

### 3. Issue

Conceptual shape:

```compact
module Issue<TOfferBody, TRequestBody, TResultBody> { ... }
```

Responsibilities:
- issuance message envelopes
- generic message alignment
- generic schema / issuer / profile consistency checks that belong to issuance choreography

### 4. Present

Conceptual shape:

```compact
module Present<TRequestBody, TSubmissionBody, TResultBody> { ... }
```

Responsibilities:
- presentation message envelopes
- generic request/submission/result alignment
- no embedded status proof semantics beyond generic envelope structure

### 5. Relations

A shared non-generic helper layer should own generic VC/VP linkage logic.

Responsibilities:
- credential/presentation claim-root linkage
- issuer consistency between VC and VP
- generic envelope matching rules that are independent of family logic

This layer exists so `VC<>` and `VP<>` remain thin.

## Status binding model

The core should own only the credential-side status binding vocabulary.

Target core binding shapes:
- `NoStatusBinding`
- `RegistryBoundStatusBinding`

The following concepts should not remain first-class core binding concepts:
- `StatusCapabilityKind`
- `NoStatusCapability`
- `RevokedSetNonMembershipStatusCapability`
- `AuthorityAttestedStatusCapability`

Those belong either:
- in registry-specific proof protocol layers, or
- in temporary family-level compatibility helpers outside the thin core

## Composition rule

Family and verifier code should compose validation explicitly.

A typical validation stack should read like this:

1. schema validation
2. claim-root validation
3. generic VC envelope validation
4. generic issuer proof validation
5. generic VC/VP relation validation
6. holder-binding validation
7. status-binding validation
8. family disclosure validation
9. family request-satisfaction validation
10. optional predicate or status-proof validation

If a step is optional, it should not be part of the default generic path.

## Proposed core file layout

Target directory:
- [`../../core/primitives/credentials/src/credentials`](../../core/primitives/credentials/src/credentials)

Target files:

1. `types.compact`
- shared refs and proof structs only

2. `vc.compact`
- thin `VC<TClaims, THolderBinding, TStatusBinding>`

3. `vp.compact`
- thin `VP<TDisclosures, THolderBinding>`

4. `relations.compact`
- generic VC/VP linkage helpers

5. `issue.compact`
- generic issuance protocol templates

6. `present.compact`
- generic presentation protocol templates

7. `holder-bindings.compact`
- holder-binding helpers only

8. `status-bindings.compact`
- VC-side binding structs and binding-root helpers only

9. `protocols.compact`
- shared protocol envelopes and protocol-neutral helper checks only

Registry-facing status protocol vocabulary should live in:
- [`../../registry/status-registry/src/status-proof-protocol.compact`](../../registry/status-registry/src/status-proof-protocol.compact)

## 5-PR implementation cut

### PR 1
`docs(architecture): freeze thin VC/VP redesign`

Scope:
- land this design note
- state explicit prototype-only migration rules
- freeze the thin-core boundaries before code churn begins

Acceptance criteria:
- one document defines the target generic shapes and layering rules
- the next implementation PRs can reference this document directly

### PR 2
`refactor(core): replace fused VC with thin VC and VP templates`

Scope:
- rewrite `vc.compact` around `VC<TClaims, THolderBinding, TStatusBinding>`
- add `vp.compact`
- remove the old fused `VC<TClaims, TDisclosures, THolderBinding>` model

Acceptance criteria:
- generic credential and presentation data models are separated cleanly
- no family-specific semantics are introduced into the new core files

### PR 3
`refactor(core): introduce Issue/Present and extract relation helpers`

Scope:
- split the generic protocol templates out of `protocols.compact` into:
  - `issue.compact`
  - `present.compact`
- add `relations.compact`
- move generic VC/VP linkage checks into `relations.compact`

Acceptance criteria:
- generic issuance/presentation choreography is separated from credential and presentation data models
- generic linkage helpers no longer force a fused VC/VP module
- `protocols.compact` is reduced to shared protocol/status primitives rather
  than owning the protocol template modules themselves

### PR 4
`refactor(core): isolate status binding from status proof protocols`

Scope:
- slim `status-bindings.compact` to VC-side binding only
- remove capability-style status abstractions from the core
- move protocol-style status semantics to the registry package
- keep status-bound family body roots keyed only by the concrete binding root,
  not by an extra generic `StatusBindingKind` discriminator

Acceptance criteria:
- core no longer treats status proof capability types as the primary status model
- the credential-side binding layer is explicit and minimal
- `protocols.compact` no longer owns status policy or status capability
  vocabulary

### PR 5
`refactor(birth): migrate explicit birth family to final VC/VP model`

Scope:
- migrate the explicit birth family to:
  - `VC<BirthCredentialClaims, ExplicitHolderBinding, NoStatusBinding>`
  - `VP<BirthCredentialDisclosures, ExplicitHolderBinding>`
- update its issuance and presentation protocol bindings to the new core shapes

Acceptance criteria:
- the simplest active family validates against the final generic model
- the redesign is proven on a real family before hidden-holder or status-aware migrations begin

## Deferred work after the first 5 PRs

Not part of this first cut:

1. hidden-holder family migration
2. registry-bound status-native migration for `birth-secret`
3. same-holder composition refactoring
4. protocol naming or surface review beyond the initial `Issue` / `Present` split
5. full spec and guide rewrite

These should follow only after the explicit birth family has validated the new architecture.

## Circuit-complexity guardrail

Every implementation PR in this redesign should preserve one rule:

- optional logic must stay out of the default generic validation path

That means:
- holder-binding helpers should be called explicitly
- status-binding helpers should be called explicitly
- status proof protocols should remain outside the generic core
- family predicates should remain family-local

A module split is useful only when it enforces that composition boundary in actual circuit execution.

## External reference systems

The repository should validate this redesign against adjacent anonymous-credential systems before large implementation churn begins.

Reference systems reviewed for this plan:
- [PACMAN](https://github.com/cfpsubmissions/pacman)
- [OWLID_RELEASE](https://github.com/TriplePlayLabs/OWLID_RELEASE)

### PACMAN takeaways

Useful patterns:
- keep the long-lived credential model separate from presentation and proof artifacts
- keep protocol-neutral checks or predicates separate from the proof backend
- keep proof-backend hooks out of the generic domain model
- budget proof cost explicitly by dimensions such as issued attributes, revealed attributes, status witnesses, and committed-slot capacity

Constraints worth keeping in mind:
- PACMAN's tuple-specialized plugin composition does not scale cleanly
- the repository should avoid encoding extensibility through ad hoc product-type explosions or backend-specific generic plumbing

Direct influence on this redesign:
- `VC<>` should own credential state only
- `VP<>` should be a separate presentation artifact
- status should remain an optional module layered at presentation or verification time rather than polluting the thin core

### OWLID takeaways

Useful patterns:
- keep proof core transport-agnostic and move session, consent, QR, and websocket flows into adapters
- model revocation through a pluggable provider or checker boundary rather than hardwiring service concerns into the credential model
- compose proofs as independent attachments bound to stable commitment and registry identifiers
- keep heavy proving runtime and proving-key delivery optional

Constraints worth keeping in mind:
- verifier trust policy should not be embedded into the holder's proof request if it is really verifier-local policy
- OwlID's online revocation checks are informative for layering, but they do not solve the repository's final offline non-revocation goal

Direct influence on this redesign:
- verifier policy should stay separate from holder proof request bodies
- status should admit multiple evidence modes above the VC binding layer
- protocol adapters should reuse one verification core rather than duplicating verification logic per transport

Follow-on rule:
- capture only the practices that align with the repository's Compact-first architecture and circuit-composition constraints
- do not import foreign abstractions wholesale when the trust model or proving model differs materially
