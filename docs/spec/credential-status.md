# Midnight VC Credential Status

Status: normative companion draft for credential status and revocation claims.

Companion documents:

- [`./midnight-credentials.md`](./midnight-credentials.md)
- [`./profiles.md`](./profiles.md)
- [`./conformance.md`](./conformance.md)
- [`./revocation-registry.md`](./revocation-registry.md)
- [`./status-verification-protocol.md`](./status-verification-protocol.md)

## Purpose

This document defines the repository's current status/revocation contract.

It exists to separate:

- core VC and holder-binding semantics
- transport/session semantics
- credential status and revocation semantics

Without that separation, implementations tend to make vague "production ready"
claims while silently leaving revocation, freshness, or privacy tradeoffs
undefined.

## Scope

This document defines:

- the current status terminology
- conformance levels for status support
- the status capability taxonomy
- verifier obligations when requesting status-aware proofs
- hidden-holder privacy obligations when status is involved
- the repository's current implementation stance

The revocation-registry companion defines the repository's current prototype
target for a Level 2 non-revocation model.

## Terminology

| Term | Meaning in this document |
| --- | --- |
| `Credential status` | The validity state of a credential after issuance, independent of its claim contents |
| `Status authority` | The issuer or delegated authority that can assert whether a credential is active, suspended, revoked, or expired |
| `Status handle` | The credential-bound reference used to locate status information |
| `Status evidence` | The verifier-consumable proof, record, or witness that supports a status decision |
| `Freshness window` | The maximum acceptable age of status evidence at verification time |
| `Public status check` | A status lookup that can reveal the credential or holder correlation to the status authority or transport |
| `Non-revocation proof` | A privacy-preserving witness that proves a credential is not revoked without revealing more than necessary |

## Design rule

Credential status is a separate concern from:

- issuer proof validity
- holder binding
- disclosure layout
- predicate validity

A credential can be:

- structurally valid
- proof-valid
- correctly holder-bound

and still be:

- revoked
- suspended
- stale under a verifier freshness policy

Implementations `MUST NOT` treat issuer proof verification alone as a complete
production validity model when they claim status-aware verification.

## Status support levels

### Level 0: No status support

An implementation at this level:

- does not model revocation/non-revocation
- may only rely on claim-level expiry or application policy
- `MUST` disclose that status is deferred

This is the repository's current package-level position today.

The corresponding explicit zero-status capability is:

- `NoStatusCapability`

### Level 1: Public status check

An implementation at this level:

- binds a credential to a status handle
- defines how a verifier obtains status evidence
- defines freshness rules for that evidence
- may require online or delegated resolver access

This level can be production-acceptable for explicit-holder deployments, but it
may leak verifier, holder, or credential correlation to the status authority or
transport path.

### Level 2: Privacy-preserving non-revocation

An implementation at this level:

- defines a status witness that can be consumed inside the proof model
- proves non-revocation without revealing unnecessary correlation data
- defines how the verifier obtains and accepts fresh-enough status evidence
- states exactly what the verifier learns from the non-revocation proof

This level is the likely long-term target for hidden-holder and
blinded-secret-heavy deployments.

The corresponding prototype target capability is:

- `RevokedSetNonMembershipStatusCapability`

## Status capability taxonomy

The repository should model status through an explicit `StatusCapability`.

The capability contributes:

- credential-bound status fields
- presentation-time witness requirements
- verifier-request status policy fields
- additional proof and validation circuits

The current taxonomy is:

- `NoStatusCapability`
- `AuthorityAttestedStatusCapability`
- `RevokedSetNonMembershipStatusCapability`

The detailed prototype revocation target for
`RevokedSetNonMembershipStatusCapability` is defined in:

- [`./revocation-registry.md`](./revocation-registry.md)

The current transitional Layer 3 contract-facing prototype for trusted
authority-attested status is defined in:

- [`./status-verification-protocol.md`](./status-verification-protocol.md)

## Required status disclosures

Any implementation claiming status support `MUST` document:

- whether it is Level 0, 1, or 2
- which credential families carry a status handle
- which authority controls status transitions
- which status states exist:
  - active
  - suspended
  - revoked
  - expired
  - or another explicitly defined set
- whether verification requires:
  - online lookup
  - cached evidence
  - embedded witness material
- the freshness window the verifier enforces
- whether hidden-holder privacy is reduced by the status path

## Verifier obligations

If a verifier claims status-aware verification, it `MUST` define:

- whether status is mandatory or optional for that request
- how it determines that the supplied status root is fresh enough
- whether stale status evidence is:
  - a hard rejection
  - a soft failure
  - or an application-policy override
- whether the verifier accepts:
  - public status checks
  - privacy-preserving non-revocation proofs
  - or both

Verifiers `MUST NOT` silently accept unverifiable status assumptions while
advertising production-ready revocation handling.

## Hidden-holder privacy rule

For hidden-holder and blinded-secret profiles:

- Level 1 public status checks are allowed only if the implementation
  explicitly discloses the privacy tradeoff
- production-shaped privacy claims `SHOULD NOT` imply hidden-holder unlinkability
  if the status path still requires a correlating public lookup
- stronger hidden-holder production claims should target Level 2
  non-revocation rather than only Level 1 lookup-based status

In plain terms:

- hidden-holder proof privacy and public revocation lookup can coexist
- but the implementation must say clearly that the status path weakens privacy

## Repository stance today

Current repository packages now contain:

- explicit zero-status modeling through `NoStatusCapability`
- prototype status capability surfaces and validators
- a prototype authority-attested status flow for hidden-holder verification
- a prototype revoked-set witness/capability flow without final in-circuit
  Merkle non-membership verification

Current repository packages still do not claim:

- final public status interoperability
- final privacy-preserving non-revocation proofs
- production-ready revocation semantics

## Conformance linkage

This document is normative for:

- profile-level status claims
- conformance disclosures about revocation/non-revocation
- hidden-holder privacy caveats where status is involved

`profiles.md` defines which current profiles still defer status.

`conformance.md` defines what a conformant implementation must disclose about
its chosen status level.

## Implementation direction

The next likely status/revocation engineering phases are:

1. complete in-circuit revoked-set non-membership verification
2. strengthen root-binding semantics for the revocation registry contract
3. add a dedicated revocation demo / Layer 3 consumer flow
4. then upgrade conformance claims from prototype to production-shaped support
