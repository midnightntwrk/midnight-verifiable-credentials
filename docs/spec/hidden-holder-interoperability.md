# Hidden-Holder Interoperability

Status: draft interoperability profile for hidden-holder protocol adapters.

This document defines the current repository-aligned transport obligations for
hidden-holder flows, especially blinded-secret issuance and presentation.

Companion documents:

- [`./midnight-credentials.md`](./midnight-credentials.md)
- [`./profiles.md`](./profiles.md)
- [`./conformance.md`](./conformance.md)
- [`../plans/hidden-holder-production-contract.md`](../plans/hidden-holder-production-contract.md)

The production-contract plan is the canonical #31 maturity boundary. This
specification owns only the adapter/transport obligations that overlap with
#23; it does not define status authority or turn the reference orchestration
layer into a final network protocol.

## Scope

This document covers:

- protocol envelope obligations for hidden-holder flows
- authoritative correlation keys
- success and rejection outcome expectations
- replay/idempotency expectations
- envelope-level expiry expectations in the current reference layer
- adapter obligations for carrying Compact values without redefining them

It does not define:

- a final OIDC, DIDComm, or HTTP binding
- a final body-level timeout field model inside credential-family Compact types
- revocation or non-revocation proofs

## Interoperability levels

### Level 1: Reference-compatible adapter

A reference-compatible adapter:

- preserves the Compact payloads and protocol envelopes defined by the
  credential family and protocol layer
- preserves message correlation keys exactly
- preserves success vs rejection outcome distinction
- preserves replay/idempotency behavior claimed by the underlying flow
- preserves expiry behavior claimed by the underlying flow

### Level 2: Production-shaped adapter

A production-shaped adapter does everything above and also documents:

- persistent protocol-state behavior
- retention/eviction rules for replay/idempotency state
- randomness policy for any adapter-generated values
- external error mapping and retry behavior
- authentication, authorization, and storage boundaries

## Authoritative correlation keys

Hidden-holder adapters `MUST` preserve these keys exactly:

- `envelope.messageId`
- `envelope.threadId`
- `envelope.respondsToMessageId`
- schema/version identity carried by the Compact body
- holder-binding profile identity carried by the Compact body

For repository-aligned hidden-holder flows:

- offer/request/result and request/submission/result threading is authoritative
- adapters `MUST NOT` synthesize a new thread or response key while keeping the
  old Compact payload
- adapters `MUST NOT` strip or rewrite response correlation metadata before the
  receiving agent validates the message

## Outcome model

Adapters `MUST` preserve the distinction between:

- success outcomes
- rejection outcomes

Adapters `MUST NOT` collapse a rejection into:

- a partial success object
- a transport success with missing fields
- an untyped generic error string when the underlying protocol already defines a
  typed rejection category

For blinded-secret flows in the current repository:

- issuance supports explicit rejection outcomes
- presentation supports explicit rejection outcomes
- duplicate deliveries support idempotent re-delivery of the prior outcome

## Expiry model

Current repository-aligned hidden-holder expiry semantics are:

- blinded-secret issuance:
  - Compact request/offer expiry fields are authoritative
- blinded-secret presentation:
  - envelope-level request/submission expiry is authoritative in the reference
    protocol layer

Adapters `MUST` preserve any carried expiry timestamps and the clock inputs used
for local validation.

Adapters `MUST NOT` claim stronger interoperability than the repository
currently provides:

- the presentation flow does not yet define final body-level timeout fields
- the repository does not yet define a final external timeout wire contract

## Replay and state requirements

A production-shaped adapter for hidden-holder flows should preserve enough state
to answer these questions deterministically:

- has this request/submission already been finalized?
- what was the prior finalized outcome?
- has the replay/idempotency record expired or been evicted?
- does this incoming outcome still correlate to a known request/submission?

Repository-aligned adapters may implement this through:

- `ProtocolStateStore` directly
- a byte-backed `ProtocolStateByteStore` plus codecs

A persistent store or file-backed restart example is evidence for local
recovery only. It is not, by itself, evidence of multi-instance locking,
transactional coupling to credential/business side effects, cancellation, or
one-time result consumption.

## Byte-store adapter obligations

Where an adapter uses the byte-backed state seam, it should provide:

- stable collection naming
- stable key encoding
- typed codec resolution per collection
- durable write/read/delete semantics as required by the deployment
- collection iteration or storage-native equivalents for retention/eviction

The adapter `MUST NOT` assume JSON is sufficient for all protocol state values,
because repository state values can include:

- `Uint8Array`
- `bigint`
- nested Compact-derived protocol messages

Codec implementations are part of the adapter trust boundary. Production
integrators should treat codec versioning and backward/forward compatibility as
explicit deployment concerns rather than copying a test-only serializer
verbatim.

Repository-aligned persistent adapter checklist:

- preserve stable collection names
- preserve stable key encoding across restart
- preserve typed value serialization for Compact-derived messages
- support retention scans or storage-native equivalents for TTL/count eviction
- preserve deterministic replay/idempotency answers after restart
- document whether the deployed adapter is truly synchronous or a synchronous
  facade over async storage

## Transport mapping rule

A transport adapter may wrap Compact protocol messages inside:

- HTTP payloads
- queue records
- OIDC envelopes
- DIDComm envelopes
- application-local RPC calls

But it `MUST NOT` redefine:

- Compact body semantics
- holder-binding profile semantics
- thread/response correlation semantics
- outcome typing semantics

## Current repository guidance

Today the repository provides enough evidence to support:

- reference-compatible hidden-holder adapters that preserve the declared
  Compact and envelope semantics
- local restart-safe adapters when the integrator supplies a persistent state
  store and accepts its documented single-instance boundary
- envelope-level presentation timeout enforcement in the reference protocol
  layer when the caller supplies the clock input

Today the repository still does not provide a final claim for:

- universal cross-implementation wire compatibility
- final external timeout field conventions
- revocation/non-revocation interoperability
