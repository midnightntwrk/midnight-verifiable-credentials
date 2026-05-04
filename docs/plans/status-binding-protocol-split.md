# Status Binding And Proof-Protocol Split

Status: architectural refactor proposal

Companion documents:

- [`../spec/credential-status.md`](../spec/credential-status.md)
- [`../spec/revocation-registry.md`](../spec/revocation-registry.md)
- [`../spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)
- [`../architecture/package-boundaries.md`](../architecture/package-boundaries.md)

## Purpose

This note proposes a normalization of the current status model.

The current repository still uses `StatusCapability` for two different jobs:

- VC/VP shape binding
- presentation-time proof semantics

That is the wrong abstraction boundary.

A credential should describe:

- whether it participates in status checking
- which registry domain and status-handle commitment it binds to

A presentation-time verification flow should describe:

- how status is proven for that binding in this request
- what the verifier or contract is actually trusting

These are related, but they are not the same object.

## Problem Statement

Today the repository uses:

- `NoStatusCapability`
- `AuthorityAttestedStatusCapability`
- `RevokedSetNonMembershipStatusCapability`

The last two share the same VC-side data:

- `registryRef`
- `statusHandleCommitment`

but they differ in presentation-time proof semantics:

- authority signature over request-bound status statement
- cryptographic non-membership witness under an accepted root

If those two proof modes stay encoded as different credential-shape
capabilities, the model blurs:

- trust semantics
- privacy semantics
- protocol imports
- conformance claims

## Proposed Model

Split the current model into two layers.

### 1. VC / VP status binding layer

This layer answers:

- does this VC participate in status checking?
- which registry domain does it bind to?
- which status-handle commitment does it bind to?

Suggested shapes:

- `NoStatusBinding`
- `RegistryBoundStatusBinding`

Conceptually:

```text
NoStatusBinding
RegistryBoundStatusBinding {
  registryRef: StatusRegistryRef,
  statusHandleCommitment: Bytes<32>,
}
```

This is the part that belongs in the VC/VP family model.

### 2. Presentation-time status proof protocol layer

This layer answers:

- how is status proven for this request?
- which public inputs are verifier-supplied?
- what trust model is the contract verifying?

Suggested proof-protocol taxonomy:

- `AuthorityAttestedStatusProofProtocol`
- `RevokedSetNonMembershipStatusProofProtocol`

Conceptually:

```text
AuthorityAttestedStatusProofProtocol {
  request: RevokedSetStatusRequest,
  proof: AuthorityAttestedStatusProof,
}

RevokedSetNonMembershipStatusProofProtocol {
  request: RevokedSetStatusRequest,
  witness: RevokedSetNonMembershipWitnessInput,
}
```

This is the part that belongs in verifier requests, protocol flows, and Layer 3
verification semantics.

## Integrator Import Model

This split should also define which package/import an integrator uses.

### Credential-family authoring

When defining VC shape, import the status binding only.

Belongs in:

- `credentials`

What a family imports conceptually:

- `StatusRegistryRef`
- `NoStatusBinding`
- `RegistryBoundStatusBinding`

This keeps the credential family independent from the proof protocol chosen by a
specific verifier or contract.

### Layer 3 status-aware verification

When defining verification semantics, import a proof protocol.

Current owner:

- `credentials-status-registry`

What a verifier/business contract imports conceptually:

- `RevokedSetStatusRequest`
- `AuthorityAttestedStatusProofProtocol`
- `RevokedSetNonMembershipStatusProofProtocol`

This keeps verification semantics explicit and lets the contract choose what it
is trusting.

## Trust-Semantics Difference

This split is not cosmetic.

### Authority-attested protocol

Trusts:

- the authority signature
- the verifier-supplied `(registryId, revokedRoot)`
- challenge binding
- optional expiration policy

### Revoked-set non-membership protocol

Trusts:

- the verifier-supplied `(registryId, revokedRoot)`
- the non-membership witness
- status-handle commitment consistency

Those are different verification semantics and should be modeled as different
proof protocols, not as different VC binding shapes.

## Mapping From Current Types

Compatibility mapping:

| Current type | Proposed role |
| --- | --- |
| `NoStatusCapability` | `NoStatusBinding` |
| `AuthorityAttestedStatusCapability` | `RegistryBoundStatusBinding` |
| `RevokedSetNonMembershipStatusCapability` | `RegistryBoundStatusBinding` |
| `AuthorityAttestedStatusProof` | authority-attested proof protocol payload |
| `RevokedSetNonMembershipWitnessInput` | revoked-set non-membership protocol payload |
| `RevokedSetStatusRequest` | shared verifier-supplied request object |

This lets the repository normalize terminology before or during code migration.

## Suggested Migration Path

### Phase 1: terminology and conformance

- introduce the binding/proof-protocol distinction in specs and backlog
- stop describing proof modes as if they were different VC shapes

### Phase 2: additive type surface

Add new names alongside the current ones:

- `NoStatusBinding`
- `RegistryBoundStatusBinding`
- protocol-facing wrapper structs for authority-attested and revoked-set proof
  modes

Keep current capability names as compatibility aliases temporarily.

### Phase 3: family-model normalization

Move credential families to bind only the shared status binding shape.

### Phase 4: verifier/protocol normalization

Move verifier requests and Layer 3 examples to consume the explicit proof
protocol shapes.

### Phase 5: deprecation cleanup

Deprecate capability names that incorrectly encode proof semantics in the
credential shape.

## Package-Boundary Direction

Recommended ownership:

- `credentials`
  - owns shared VC/VP binding types
- `credentials-status-registry`
  - owns current proof protocols and registry-facing verification semantics

This also helps resolve the backlog item about status DSL ownership. The most
stable core should stay in `credentials`, while the protocol-specific proof
semantics stay in the status package.

## Open Question

Naming still needs one explicit decision:

- whether to keep `NoStatusCapability` as the zero-binding name for compatibility
- or rename it to `NoStatusBinding` immediately when the additive type layer is
  introduced

Recommended answer:

- keep `NoStatusCapability` temporarily as a compatibility alias
- move the architecture/spec language to `NoStatusBinding`

## Recommendation

Adopt this split.

It gives the repository:

- one normalized VC-side status shape
- explicit proof semantics at presentation time
- cleaner conformance claims
- clearer package/import ownership for integrators
- an easier path to add future status proof modes without changing VC shape
