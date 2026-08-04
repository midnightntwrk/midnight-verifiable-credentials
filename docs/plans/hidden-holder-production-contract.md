# Hidden-Holder Production Contract

Status: implementation-ready contract and roadmap for secret-holder and
blinded-secret claims.

Primary issue:

- [#31](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/31)

Related scopes are deliberately not duplicated here:

- [#23](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/23)
  owns the blinded-secret transport/rejection implementation track.
- [#40](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/40)
  owns the credential-status and revocation contract.
- [#15](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/15)
  owns broader package/profile-surface reconciliation.

This document is the canonical claim boundary for #31. It complements the
normative draft by collecting the exact evidence and deferred guarantees that
separate the current reference hidden-holder profiles from stronger
production-facing claims.

## Scope

This plan covers:

- plain `SecretHolderBinding`
- `BlindedSecretHolderBinding`
- the protocol/session rules layered around those profiles

It does not itself define revocation or a final external transport adapter.

## Why this exists

"Hidden-holder" is an umbrella term, not one maturity claim. The repository
already has real reference capability for:

- secret-holder proof/profile semantics
- blinded-secret issuance and presentation happy paths
- explicit rejection outcomes for key blinded-secret failure classes
- replay/idempotency behavior in the reference protocol layer

But "hidden-holder" is still too broad a phrase to support strong production
claims without separating:

- the core hidden-holder proof profile
- the blinded-secret transport/session contract
- status/revocation authority and freshness
- deployment-level randomness, state, and external-wire policy

A package or deployment MUST NOT promote a row in the current-support column
into a production-ready claim unless the corresponding deferred column is
closed and independently evidenced.

## Canonical claim matrix

| Surface | Current checked-in support | Production claim remains deferred |
| --- | --- | --- |
| Plain `SecretHolderBinding` | Hidden secret commitment, challenge response, verifier-scoped pseudonym, and same-holder witness semantics are reference-tested in the core/family surfaces. | A production profile still needs a named secret-storage boundary, reviewed randomness/nonce policy, authority evidence, status posture, and external-adapter assumptions. |
| `BlindedSecretHolderBinding` proof | Compact offer/request/result and presentation request/submission/result shapes bind the holder commitment, challenge, profile, and family; reference issuance/presentation happy paths are tested. | The proof profile does not by itself provide a production blind-issuance network protocol, durable multi-instance state, final status proof, or cross-implementation wire compatibility. |
| Issuance expiry | Blinded-secret offer and request bodies carry expiry fields; reference agents enforce them when callers provide `currentDay`, with explicit rejection outcomes. | A deployment must define its authoritative clock, skew policy, retry behavior, and external mapping. This is not a generic credential-expiry or ledger-authority guarantee. |
| Presentation expiry | The reference protocol enforces envelope-level request/submission expiry when callers provide `currentTimeMs`; duplicate outcomes can be retained and replayed under configured policy. | Body-level presentation timeout fields, a final external timeout convention, cancellation, one-time consumption, and multi-instance transactional semantics remain open. |
| Randomness and state | Protocol constructors default to Node CSPRNG randomness and expose injectable randomness/state-store seams; a local file-backed tagged-JSON reference path covers ordinary restart recovery. | Production requires a reviewed runtime/HSM randomness policy, secret-storage controls, durable pending/finalized state, atomic delivery/side-effect coupling, and crash/race/multi-instance evidence. |
| Status, authority, and interoperability | The hidden-holder family has prototype registry-bound/status-aware paths and explicit hard-invalid `revoked` handling; transport-shaped APIs preserve typed outcomes and correlation metadata. | DID/trust/status authority, accepted-root freshness, final in-circuit non-membership, final revocation semantics, OID4VCI/OID4VP or DIDComm mapping, and universal wire compatibility remain deferred. |

Evidence for the current-support column is maintained in:

- [`../spec/profiles.md`](../spec/profiles.md)
- [`../spec/hidden-holder-interoperability.md`](../spec/hidden-holder-interoperability.md)
- [`../../packages/prototypes/credential-families/birth-secret/README.md`](../../packages/prototypes/credential-families/birth-secret/README.md)
- [`../../packages/components/orchestration/protocol/README.md`](../../packages/components/orchestration/protocol/README.md)
- [`../testing/test-matrix.md`](../testing/test-matrix.md)

## Production claim checklist

### 1. Plain secret-holder profile

Before a package or adapter claims production-shaped support for the plain
secret-holder profile, it should define:

- holder-secret generation and storage expectations
- issuer and holder nonce/randomness requirements
- verifier challenge/session correlation rules
- whether revocation/non-revocation is implemented or explicitly deferred
- which external adapter or wire assumptions remain outside the package

### 2. Blinded-secret issuance/presentation contract

Before a package or adapter claims production-shaped support for the
blinded-secret profile, it should define all plain secret-holder requirements
plus:

- authoritative correlation keys for offer/request/submission/result threads
- replay and idempotency rules
- expiry semantics for each protocol stage
- durable pending-state behavior across retries, restarts, or delayed delivery
- explicit rejection semantics for malformed, mismatched, expired, replayed, or
  refused sessions
- the external interoperability contract that carries the Compact values

## Current repository position

Today the repository can already claim:

- stable reference plain secret-holder proof/profile behavior
- supported reference blinded-secret issuance and presentation flows
- explicit blinded-secret rejection outcomes in the reference protocol layer
- reference replay/idempotency behavior for blinded-secret issuance and
  presentation outcomes
- an injectable protocol state-store seam for pending/session transport state
- configurable retention/eviction policy for finalized replay/idempotency state
- envelope-level request/submission expiry semantics for blinded-secret
  presentation in the reference protocol layer

Today the repository should not yet claim:

- durable multi-instance or transactionally coupled hidden-holder session state
- a deployment-independent production randomness, nonce, or secret-storage policy
- final authority-backed revocation/non-revocation semantics
- final external transport or cross-implementation interoperability

The repository does provide narrower evidence that must not be erased by those
limitations: default Node CSPRNG generation, injectable randomness and state
seams, local file-backed restart examples, envelope-level presentation expiry,
and typed rejection/idempotency behavior in the reference orchestration layer.

## Next engineering slices

The implementation order below keeps the overlapping issues separate:

1. **#23 transport closure:** finish exact-byte delivery registration,
   processing-lease recovery, cancellation, one-time result consumption,
   multi-instance/race semantics, and a stable external error/timeout mapping.
2. **#31 deployment contract:** document reviewed CSPRNG/HSM and secret-storage
   requirements, durable-store obligations, clock/skew policy, and the evidence
   required before a package or deployment can make a production-shaped claim.
3. **#40 status closure:** resolve accepted-root authority/freshness and the
   final in-circuit non-membership/revocation boundary; do not imply that the
   prototype status paths close #31.
4. **#15 surface reconciliation:** keep profile names, package maturity labels,
   and conformance disclosures aligned as the above contracts land.

Do not solve these by adding a new umbrella "hidden-holder transport" profile:
plain proof semantics and blinded-secret session semantics remain separate
claims.

Current progress note:

- the reference protocol layer can now hide randomness/challenge generation
  behind an injectable interface
- pending offer/request/submission/outcome state can now sit behind an
  injectable `ProtocolStateStore` interface with an in-memory reference store
- finalized replay/idempotency state can now be retained with TTL and bounded
  count policy in the reference store seam
- the reference protocol now supports envelope-level presentation request and
  submission expiry checks
- integrators now have a byte-backed codec adapter seam for wiring persistent
  state into `ProtocolStateStore`
- production hardening still requires the caller to document and review the
  randomness, nonce, and secret-storage policy behind the injected/default
  source
- production hardening still requires a durable store with the required
  multi-instance and crash/replay semantics
- production hardening still requires a final interoperable timeout and error
  contract outside the current reference envelopes

## Exit criteria for a #31 claim

A package or deployment may describe a hidden-holder profile as
production-shaped only when its claim names the exact profile and records all
of the following:

- proof/profile semantics and checked test evidence
- secret generation, storage, and recovery boundary
- randomness and nonce source, including failure behavior
- pending/finalized state durability, retention, replay, and concurrency model
- issuance and presentation clock, expiry, skew, cancellation, and retry rules
- status binding/proof mode, authority, accepted-root freshness, and explicit
  revocation posture
- external adapter, authentication, error, timeout, and interoperability scope

Until then, use the narrower labels `reference implementation`,
`production-shaped reference path`, or `prototype status capability` exactly as
qualified in the profile, interoperability, and conformance documents.
