<!--
  This file is part of midnightntwrk/midnight-verifiable-credentials.
  Copyright (C) 2026 Midnight Foundation
  SPDX-License-Identifier: Apache-2.0
-->

# Blinded-Secret Transport Hardening Plan

## Issue

- [#23](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/23)

## Goal

Move blinded-secret issuance from a supported reference happy path to a
production-shaped transport and rejection contract.

This plan does not try to solve revocation or interoperability all at once.
Its purpose is narrower:

- make the blinded-secret issuance lifecycle explicit
- define how failures are represented
- define replay / timeout / correlation expectations
- define the next implementation slices needed to harden the protocol

## Current state

What the repository now proves:

- a secret-holder issuance flow exists
- the flow validates Compact-generated offer / request / result messages
- the holder and issuer agents reject malformed blinded-secret issuance
  messages at the agent boundary
- real DID-backed integration tests exercise the happy path

What the repository does not yet prove:

- a final production blind-signature transport protocol
- explicit interoperable rejection/result messages
- durable pending-state behavior across retries, restarts, or delayed delivery
- revocation / non-revocation
- cross-implementation interoperability guarantees

## Desired transport model

The production-shaped blinded-secret issuance flow should define these states
explicitly.

### 1. Offer

Issuer sends an offer that tells the holder:

- which credential family is being issued
- which holder-binding profile is required
- whether expiration is supported
- when the offer expires
- how the holder should correlate the future request

### 2. Request

Holder sends a request that contains:

- holder secret commitment
- holder binding blinding factor
- holder challenge hash
- requested expiration choice, if supported
- correlation to the accepted offer

### 3. Result

Issuer returns either:

- a successful issuance result
- or an explicit issuance rejection result

The successful result must stay bound to:

- the accepted offer
- the accepted request
- the holder challenge
- the credential family and profile

### 4. Final local holder state

After a successful result, the holder stores:

- the issued credential
- the credential proof
- the holder binding blinding factor
- enough correlation metadata to explain which issuance session produced the
  credential

## Transport rules that should become explicit

### Correlation

Every blinded-secret issuance session should have explicit correlation rules.

Required properties:

- an offer is an initial message
- a request must reference exactly one prior offer
- a result must reference exactly one prior request
- mismatched thread IDs or response IDs are rejection conditions

### Expiry

The contract should define expiry at both stages:

- offer expiry:
  - holder must not answer an expired offer
- request expiry:
  - issuer must not answer an expired request with success

Open design question:

- whether expiry is represented only in message bodies, only in transport
  envelopes, or in both

### Replay handling

The contract should define what happens if:

- the same request is delivered twice
- the same result is delivered twice
- an old request is replayed after the issuer already completed or rejected it

Minimum expectation:

- replay must not mint multiple credentials for one logical request unless the
  protocol explicitly defines idempotent re-delivery semantics

### Idempotency

The production contract should decide whether an issuer may return:

- the exact same successful result for a repeated request
- an explicit duplicate/replayed rejection

What matters is not which option wins.
What matters is that the rule is explicit and testable.

## Rejection model

The repository currently proves local rejection by throwing errors.

That is sufficient for a reference path, but not for production-shaped
interoperability.

The next protocol slices should define explicit rejection categories.

### Recommended rejection categories

1. `malformed_offer`
   - invalid schema, profile, or required fields
2. `malformed_request`
   - missing challenge, missing blinding factor, invalid request structure
3. `offer_request_mismatch`
   - request contradicts offer capabilities or profile
4. `expired_offer`
5. `expired_request`
6. `replayed_request`
7. `replayed_result`
8. `issuer_refused`
   - issuer policy refusal not caused by malformed transport
9. `result_request_mismatch`
   - result challenge or profile no longer matches the accepted request

### Why explicit rejection messages matter

Without an explicit rejection contract:

- holders cannot distinguish malformed input from issuer refusal
- retriers cannot know whether a session is safely repeatable
- transport adapters cannot present stable external behavior

## Randomness and nonce hardening

The reference flow still uses deterministic test-only values in places where
production implementations must use strong randomness.

This must be fixed before production claims.

Required hardening targets:

- holder binding blinding factor
- issuer nonce
- issuer signing nonce

Engineering requirement:

- APIs should make it difficult to accidentally supply deterministic or reused
  values in production code

## Pending-state lifecycle

The current agents keep pending offers and requests in memory.

That is acceptable for tests and local reference orchestration.
It is not yet a production state model.

The follow-up implementation should define:

- when pending state is created
- when it expires
- when it is deleted after success
- when it is deleted after rejection
- what survives process restart

## Non-goals for this plan

This plan does not itself define:

- revocation or non-revocation proofs
- a final OIDC / DIDComm binding
- a public stable SDK surface
- storage or wallet UX

Those are separate follow-up tracks.

## Recommended execution order

### Phase 1: contract definition

- define correlation, expiry, replay, and rejection rules in docs/spec
- add explicit protocol-level terminology for success vs rejection results

### Phase 2: reference implementation hardening

- replace deterministic test-only randomness interfaces
- add explicit rejection/result message types if that design is chosen
- add timeout and replay tests

### Phase 3: adapter preparation

- map the reference contract onto OIDC-shaped or DIDComm-shaped transport work
- add interoperability-oriented examples and vectors

### Phase 4: production-readiness follow-up

- revocation direction
- secret-storage expectations
- operational guidance

## Exit criteria

This capability should only be described as production-shaped when all of the
following are true:

- explicit success and rejection semantics are documented
- replay / timeout / idempotency behavior is defined and tested
- test-only deterministic nonce paths are removed from production-facing flows
- the holder and issuer state lifecycle is explicit
- the transport contract is stable enough for external adapters
