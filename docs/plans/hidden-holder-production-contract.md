# Hidden-Holder Production Contract

Status: roadmap/checklist for production-shaped secret-holder and
blinded-secret claims.

This document complements the normative draft by collecting the exact gaps that
still separate the current reference hidden-holder profiles from stronger
production-facing claims.

## Scope

This plan covers:

- plain `SecretHolderBinding`
- `BlindedSecretHolderBinding`
- the protocol/session rules layered around those profiles

It does not itself define revocation or a final external transport adapter.

## Why this exists

The repository already has real reference capability for:

- secret-holder proof/profile semantics
- blinded-secret issuance and presentation happy paths
- explicit rejection outcomes for key blinded-secret failure classes
- replay/idempotency behavior in the reference protocol layer

But "hidden-holder" is still too broad a phrase to support strong production
claims without separating:

- the core hidden-holder proof profile
- the blinded-secret transport/session contract

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

Today the repository should not yet claim:

- durable hidden-holder session state
- production randomness/nonce interfaces across transport-facing flows
- presentation-side message-level expiry semantics
- revocation/non-revocation
- final external transport interoperability

## Next engineering slices

1. randomness and nonce hardening
2. durable pending-state abstractions
3. presentation-side expiry / timeout semantics
4. adapter/interoperability contract
5. revocation direction
