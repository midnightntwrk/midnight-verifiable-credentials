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

The next repository slice extends the same transport-shaping work to
blinded-secret presentation, but presentation still remains behind issuance in
transport maturity.

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
- the flow now carries explicit offer and request expiry fields
- the holder and issuer agents reject malformed or expired blinded-secret
  issuance messages through explicit rejection results in the reference
  transport-shaped API
- duplicate blinded-secret issuance deliveries are idempotent in the reference
  transport-shaped API
- the holder and verifier agents now also exchange explicit blinded-secret
  presentation rejection results in the reference transport-shaped API for
  malformed submissions, request/submission mismatches, and unsatisfied
  verifier requests
- duplicate blinded-secret presentation deliveries are now idempotent in the
  same reference transport-shaped API
- the reference transport-shaped API uses caller-supplied `currentDay` for
  expiry enforcement and otherwise defaults to a no-time-advance `0n` model
- real DID-backed integration tests exercise the happy path

What the repository does not yet prove:

- a final production blind-signature transport protocol
- explicit message-level expiry fields for blinded-secret presentation
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

## Reference transport contract (normative for this package)

The reference transport has four terminal outcomes: `issued`, `rejected`,
`expired`, and `replayed`. Expiry is represented in the issuance body as an
inclusive last-valid day: a message is valid when `currentDay <= expiry`, and
expired when `currentDay > expiry`. The caller supplies `currentDay`; the
reference default is `0n`, not a wall-clock authority.

- An offer starts one session. Its `messageId` is the only value a request may
  name in `respondsToMessageId`; the offer's `threadId` is copied to the
  request.
- A request carries the holder challenge and names exactly one offer. The
  result or rejection copies the request `messageId` into
  `respondsToMessageId` and copies its `threadId`.
- The transport wrapper envelope and generated message-body envelope must be
  identical. A mismatch is a `correlation_mismatch` rejection (or a local
  boundary error when the holder receives an outcome).
- A request received after offer expiry is rejected as `expired_offer`; a
  request received after its own expiry is rejected as `expired_request`. These
  categories are retryable only in the sense that a caller may start a new
  session; the finalized request itself is not reopened.
- Exact re-delivery of a finalized request is idempotent: the issuer re-sends
  the byte-independent reference result or rejection it retained, and the
  holder accepts a duplicate outcome without minting another credential.
- Reuse of a finalized request `messageId` with different parsed message
  content is `replayed_request`; it is rejected and never replaces the first
  terminal outcome. Direct holder result handling also rejects a result replay
  after the request has already been finalized.

The currently emitted issuance rejection categories are `malformed_request`,
`correlation_mismatch`, `offer_request_mismatch`, `unknown_offer_reference`,
`expired_offer`, `expired_request`, and `replayed_request`. The reference
issuer does not emit `malformed_offer` or `issuer_refused` because it does not
receive or apply an issuer policy object at this layer. `replayed_result` is a
holder-side local rejection rather than an issuer response category.

These rules describe the in-memory/injectable reference orchestration only.
They do not define exact-wire-byte idempotency, durable pending state, crash or
multi-instance atomicity, a production clock/skew policy, or external
interoperability.

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
