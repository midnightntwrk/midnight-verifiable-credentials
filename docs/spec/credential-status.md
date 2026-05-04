# Midnight VC Credential Status

Status: normative companion draft for credential status and revocation claims.

Companion documents:

- [`./midnight-credentials.md`](./midnight-credentials.md)
- [`./profiles.md`](./profiles.md)
- [`./conformance.md`](./conformance.md)

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
- verifier obligations when requesting status-aware proofs
- hidden-holder privacy obligations when status is involved
- the repository's current implementation stance

This document does not yet define:

- a Compact-native revocation accumulator
- a final non-revocation proof circuit family
- a final HTTP/OpenID transport profile for status evidence
- a status registry governance system

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
- defines freshness/epoch semantics for that witness
- states exactly what the verifier learns from the non-revocation proof

This level is the likely long-term target for hidden-holder and
blinded-secret-heavy deployments.

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
- the freshness window for acceptable status evidence
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

Current repository packages claim:

- Level 0 status support only
- revocation/non-revocation is deferred
- claim-level expiry and protocol/session expiry do not equal revocation support

Current repository packages do not claim:

- public status check interoperability
- privacy-preserving non-revocation proofs
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

1. add a typed status capability contract for credential families
2. define verifier freshness-request semantics
3. choose the first reference status model:
   - public status lookup
   - or privacy-preserving non-revocation
4. add tests and package claims only after the chosen model exists
