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

It exists to close the current prototype gap where status-aware families can:

- validate a shared `RegistryBoundStatusBinding`
- validate a presentation-time status proof protocol

while still leaving the full status binding outside the issuer-signed body root
that anchors the credential proof.

That gap is no longer acceptable once status-aware families claim a durable
reference architecture instead of a prototype wrapper.

## Current gap

Today several status-aware families still use wrapper structs such as:

- `SecretBirthCredentialWithStatusCapability`
- `SecretBirthCredentialWithAuthorityAttestedStatusCapability`
- `SecretBirthCredentialWithStatusBinding`

Those wrappers are useful compatibility and transition surfaces, but they leave
one important weakness:

- the issuer proof signs the base credential body root
- the wrapper adds status binding or status capability data outside that
  issuer-signed root

The verifier/contract can still check consistency between:

- the wrapper status binding
- the presentation-time status proof protocol

but the issuer is not yet cryptographically attesting to the full VC-side
status binding as part of the signed credential body.

## Design goal

The final reference model should make this true:

- if a credential family claims to carry status binding, the issuer proof must
  fail whenever the bound status fields change

In other words:

- `registryId`
- authority verification-method reference
- `statusHandleCommitment`
- explicit binding mode

must all participate in the issuer-signed body root for the status-aware
credential family.

## Required commitment model

### 1. Explicit binding mode

Every family must commit an explicit VC-side status binding mode in the
issuer-signed body:

- no status
- registry-bound status

For this rollout, treat that as a closed set.

Prototype compatibility names such as:

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

Equivalent inlining is acceptable, but the commitment boundary must be
unambiguous:

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

Wrapper validation alone is not enough once the family claims this maturity
level.

## Recommended rollout

### Slice A: design and terminology

- land this design note (this PR)
- update status specs to point at this commitment target
- keep the terminology focused on `RegistryBoundStatusBinding`

### Slice B: first-family rollout

Start with `credentials-birth-secret`.

Reason:

- it already carries the most active status-aware prototype surface
- it already has status-binding and status-proof alignment tests
- it feeds the age-gate use case that the repository currently uses as the main
  live documentation path

### Slice C: shared-family rollout

After the first family proves the pattern:

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
