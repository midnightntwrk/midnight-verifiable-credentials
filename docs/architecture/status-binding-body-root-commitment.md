# Status Binding Body-Root Commitment

Status: design target for `VC-MAT-20` rollout

Companion documents:

- [`../spec/credential-status.md`](../spec/credential-status.md)
- [`../spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)
- [`../spec/revocation-registry.md`](../spec/revocation-registry.md)
- [`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md)

## Purpose

This note defines the repository's target design for committing VC-side status
binding into the issuer-signed credential body root.

It exists to close the remaining prototype gap after the first hidden-holder
status rollout, where status-aware families can:

- validate a shared `RegistryBoundStatusBinding`
- validate a presentation-time status proof protocol
- commit that binding into an issuer-signed status-aware family body root

while still keeping the status-aware credential in a wrapper surface instead of
making `RegistryBoundStatusBinding` native to the credential generic itself.

That gap is no longer acceptable once status-aware families claim a durable
reference architecture instead of a prototype wrapper.

## Current gap

Today the secret-birth family still uses one transitional wrapper surface:

- `SecretBirthCredentialWithStatusBinding`

That wrapper is still a compatibility and transition surface, but the gap is
now narrower than the original design problem:

- the issuer proof already signs a status-aware body root
- the wrapper no longer leaves status binding wholly outside the signed root
- the remaining weakness is architectural:
  the status-aware credential is not yet a native
  `VC<..., RegistryBoundStatusBinding>` shape

The verifier/contract can still check consistency between:

- the wrapper status binding
- the presentation-time status proof protocol

and the issuer is already cryptographically attesting to the VC-side status
binding through the wrapper's status-aware body root. What remains is to make
that binding part of the credential type itself rather than a wrapper-level
bundle.

## Design goal

The final reference model should make this true:

- if a credential family claims to carry status binding, the issuer proof must
  fail whenever the bound status fields change

In other words:

- `registryId`
- authority verification-method reference
- `statusHandleCommitment`

must all participate in the issuer-signed body root for the status-aware
credential family.

## Required commitment model

### 1. VC-side binding only

Every family must commit the concrete VC-side binding that it instantiates in
the issuer-signed body.

For the current redesign, the important rule is:

- the binding type itself is the discriminator
- the body root should not add an extra generic `StatusBindingKind` field on
  top of that concrete binding

Prototype proof-mode names such as:

- `NoStatusCapability`
- `AuthorityAttestedStatusCapability`
- `RevokedSetNonMembershipStatusCapability`

must not be treated as proof-mode choices at this layer. The body root should
commit only the VC-side binding shape, not the verifier-facing proof protocol.

### 2. Registry-bound binding fields

When the binding mode is registry-bound, the issuer-signed body must commit:

- `registryRef.registryId`
- `registryRef.authorityVerificationMethodRef.didContractAddress`
- `registryRef.authorityVerificationMethodRef.methodId`
- `statusHandleCommitment`

No field from that VC-side binding may remain wrapper-only.

### 3. One issuer-signed anchor

The family body-root helper should compute one canonical status-binding value
that is included directly in the issuer-signed credential body.

Conceptually:

```text
statusBindingRoot = persistentHash(binding)
credentialBodyRoot = persistentHash(
  credentialCoreFields + statusBindingRoot
)
```

Equivalent inlining is acceptable, but the repository should prefer the
standalone `statusBindingRoot` form by default. If a family inlines the
binding fields directly instead of hashing a standalone `statusBindingRoot`,
the family spec must document one canonical field order and encoding, and every
implementation of that family must follow it exactly:

- changing the VC-side status binding must change the issuer-signed body root
- the issuer proof must no longer validate against a tampered status binding

### 4. Presentation-time proof protocol stays separate

Presentation-time proof protocols still bind separately at verification time:

- `AuthorityAttestedStatusProofProtocol`
- `RevokedSetNonMembershipStatusProofProtocol`

Those proof protocols must match the committed VC-side binding, but they do not
belong inside the issuer-signed credential body root.

This preserves the architecture split already accepted in the repository:

- VC-side binding in `credentials`
- registry-facing proof protocol in `credentials-status-registry`

## Migration rule for wrapped families

During rollout, wrapped families may temporarily expose compatibility structs,
but they must satisfy both conditions:

1. the wrapped credential's issuer proof verifies against a body root that
   already commits the status binding
2. wrapper-level status objects are either:
   - direct views of the embedded binding
   - or validated aliases that family-level validation proves equal to the
     embedded binding at runtime

Wrapper validation alone is not the desired end state once the family claims
this maturity level. The final target is to eliminate the wrapper as the
primary status-aware credential representation.

## Recommended rollout

### Slice A: design and terminology

- land this design note
- update status specs to point at this commitment target
- keep the terminology focused on `RegistryBoundStatusBinding`

### Slice B: first-family rollout

Start with `credentials-birth-secret`.

Reason:

- it already carries the most active status-aware prototype surface
- it already has status-binding and status-proof alignment tests
- it feeds the age-gate use case that the repository currently uses as the main
  live documentation path

### Slice C: native hidden-holder status credential

After the first wrapper-based rollout proves the cryptographic body-root
pattern:

- migrate `credentials-birth-secret` so the status-aware credential itself is a
  native `VC<..., RegistryBoundStatusBinding>`
- keep any remaining outer bundle only for protocol-edge convenience, not as
  the source of VC-side status binding

### Slice D: shared-family rollout

After the native hidden-holder shape proves the pattern:

- lift shared helpers where they belong
- migrate any remaining wrapped family models that still keep status binding
  outside the issuer-signed body root

## Acceptance criteria

The rollout is only complete when the repository demonstrates all of the
following:

1. tampering with committed VC-side status binding changes the family body root
2. issuer proof verification fails after any such tamper
3. wrapper-level aliases cannot diverge from the embedded binding
4. presentation-time status proof protocols still validate only when they match
   the same committed binding; the first alignment tests should live in
   `credentials-birth-secret`
5. specs and conformance docs clearly state that status binding is carried in
   the issuer-signed body, not just in a wrapper

## Non-goals

This design does not solve:

- live root discovery
- root freshness or canonical-root selection
- final in-circuit revoked-set non-membership
- transport or orchestration semantics

Those remain separate items in the maturity backlog.

## Recommendation

Treat this as the canonical target for the next status-binding implementation
wave.

Do not promote status-aware family surfaces beyond prototype/reference maturity
until the issuer-signed body root commits the full VC-side status binding.
