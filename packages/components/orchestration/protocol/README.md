# `credentials-protocol`

> Maturity: `infrastructure`
> Package class: `dist`

Reference birth/birth-secret protocol adapter layer for Midnight Credentials.

Family-neutral agents and injection ports now live in the private
`@midnight-ntwrk/credential-exchange` candidate at
`../exchange`. This legacy package remains the outward concrete reference and
compatibility surface; its existing package exports and class names are
preserved.

Status:

- reference implementation
- evolving API surface

Tier:

- Layer 4 wiring/orchestration package

Dependency direction:

- depends downward on reusable core and family packages
- must not be treated as a reusable core protocol package
- core, family, and reusable capability packages must not depend on this layer

Reusable outside this repo:

- limited; use as reference orchestration, not as canonical core semantics

Surface classification:

- `Off-chain only`
- this package is a runtime/orchestration layer, not a Compact contract surface

Start here:

1. use this package for:
   - reference agent flows
   - protocol-state management patterns
   - transport-shaped integration experiments
2. do not use this package as an on-chain API or contract-authoring surface
3. read [`../../../../docs/guides/integration-surface-map.md`](../../../../docs/guides/integration-surface-map.md)
   before mixing it with Compact package entrypoints

Related docs:

- spec: [`../../../../docs/spec/midnight-credentials.md`](../../../../docs/spec/midnight-credentials.md)
- protocol classification:
  [`../../../../docs/architecture/protocol-classification.md`](../../../../docs/architecture/protocol-classification.md)
- profiles: [`../../../../docs/spec/profiles.md`](../../../../docs/spec/profiles.md)
- conformance: [`../../../../docs/spec/conformance.md`](../../../../docs/spec/conformance.md)
- credential status: [`../../../../docs/spec/credential-status.md`](../../../../docs/spec/credential-status.md)
- hidden-holder interoperability:
  [`../../../../docs/spec/hidden-holder-interoperability.md`](../../../../docs/spec/hidden-holder-interoperability.md)
- production checklist:
  [`../../../../docs/guides/credentials-protocol-production-checklist.md`](../../../../docs/guides/credentials-protocol-production-checklist.md)
- production-shaped reference path:
  [`../../../../docs/guides/credentials-protocol-reference-path.md`](../../../../docs/guides/credentials-protocol-reference-path.md)
- companion guide: [`../../../../docs/guides/midnight-credentials-for-dummies.md`](../../../../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../../../../docs/testing/test-matrix.md`](../../../../docs/testing/test-matrix.md)

## Purpose

This package exercises the off-chain party interactions around the Compact
credential circuits:

- issuer creates offers and issues credentials
- holder accepts offers and prepares presentations
- verifier requests presentations and evaluates them
- an in-process `MessageBus` models the transport seam between parties

The goal is to keep the protocol logic close to the Compact domain model and
exercise the generated message shapes in TypeScript before introducing real
transport adapters such as OID4VCI, OID4VP, SIOP, or DIDComm.

## Schema Descriptor Rule

The reference agents treat `SchemaDescriptor` / `SchemaCapabilities` as the
authority for credential-family capabilities. Protocol message `features`
fields are emitted only as compatibility hints for generated issue/present
message shapes that still require them.

Concrete adapters live under `src/adapters/birth/`; compatibility re-exports
remain under `src/agents/`. The shared descriptor catalog lives in
`src/adapters/birth/schema-descriptors.ts` and provides:

- canonical reference `SchemaRef` values for the explicit birth and
  blinded-secret birth families
- schema capability descriptors for those families
- descriptor-derived compatibility feature hints for legacy message fields
- a no-hint family-resolution descriptor for the current closed ecosystem
- bounded resolver hints for generic wallet or adapter registries that need to
  map a `SchemaRef` to a concrete family handler
- `REFERENCE_SCHEMA_FAMILY_ADAPTERS` plus `resolveSchemaFamilyAdapter(...)` as a
  small TypeScript-side registry pattern for adapter routing

Resolver hints are bounded Compact `Bytes<32>` values. String hints shorter than
the bound are padded, strings longer than 32 UTF-8 bytes are rejected instead of
truncated, and raw byte hints must already be exactly 32 bytes. The `registry:`
prefix used by the reference hints is a local convention for adapter registries,
not a Compact URI field. The reference adapter registry therefore keeps parallel
resolvable descriptors beside the closed-ecosystem no-hint descriptors; this is
intentional so closed local tests and generic wallet routing can share the same
`SchemaRef` without changing its canonical shape.

New adapters should validate incoming compatibility feature hints against a
trusted schema descriptor or family registry before using them for routing or
policy.

## What This Package Is

- a repo-local reference implementation
- a protocol simulation and conformance harness
- a place to test message shapes against Compact-generated circuits
- a bridge between Layer 2 credential families and Layer 3 business logic
- a wiring/orchestration layer that consumes reusable core protocol semantics

## What This Package Is Not

- not a production-ready network transport library
- not yet a stable publishable API surface
- not a replacement for OIDC or DIDComm transports
- not the canonical reusable VC protocol package

The current public exports are intentionally narrow:

- explicit-holder and secret-holder agent classes
- injectable randomness interfaces for protocol challenges, issuer nonces,
  blinding factors, and signing nonces
- CSPRNG defaults for protocol randomness plus message and thread identifiers
  through Node `crypto.randomBytes`
- explicitly named deterministic sources for reproducible repository fixtures
- a generic `ProtocolStateStore` interface plus an in-memory reference
  implementation for protocol session state
- a byte-backed codec adapter seam so persistent stores can expose
  `ProtocolStateStore` without reimplementing typed collection logic
- an `ExactByteProtocolDeliveryRegistry` for atomic first-delivery
  registration, exact-byte duplicate detection, and same-ID/different-bytes
  rejection
- a restart-safe tagged JSON codec/store helper path for local persistence:
  - `createStableJsonProtocolStateStore(...)`
  - `createNodeFileBackedProtocolStateStore(...)`
  - `createNodeFileBackedProtocolPartyDependencies(...)`
- shared crypto and envelope helpers
- the typed in-memory message bus transport seam

Test-only helpers remain under `src/test/helpers`.

## Current State

### Explicit-holder flows

Explicit-holder issuance and presentation flows use the Compact-generated
protocol message types from `credentials-birth` end to end. Tests validate:

- offer, request, and result message shapes
- response envelope threading
- request/result matching rules enforced by Compact circuits

### Secret-holder flows

Secret-holder issuance and presentation flows now use the Compact-generated
protocol message families from `credentials-birth-secret` end to end. Tests
validate:

- offer, request, submission, and result message shapes
- response envelope threading
- request/result matching rules for blinded-secret issuance
- explicit blinded-secret issuance rejection messages for malformed requests,
  wrapper/body correlation mismatches, offer/request mismatches, unknown offer
  references, expired offers, expired requests, and conflicting replayed
  requests
- idempotent re-delivery of exact duplicate blinded-secret issuance requests
  and duplicate blinded-secret issuance outcomes
- explicit blinded-secret presentation rejection messages for malformed
  submissions, request/submission mismatches, and unsatisfied verifier
  requests
- idempotent re-delivery of duplicate blinded-secret presentation submissions
  and duplicate blinded-secret presentation outcomes
- request/submission and submission/result alignment enforced by Compact circuits
- blinded holder-binding and request-unlinkable pseudonym validation through
  `credentials-birth-secret`; pseudonyms bind the verifier profile's DID method
  identity plus deployment, audience, origin, consent, request, and challenge
- holder-side verification of the allow-listed verifier's signed transport
  wrapper, Compact validation of dynamic request/challenge scope, and atomic
  request replay rejection before pseudonym disclosure; hidden verification
  results retain a request-scoped presentation binding rather than a stable
  credential root
- same-holder composition flows through the agent layer, including a
  three-credential verifier session

The blinded-secret issuance happy path is a supported reference flow in this
package. The reference protocol layer now also exposes explicit rejection
messages for the blinded-secret issuance and presentation flows. The package
remains intentionally narrow and transport-agnostic; it is not yet a
production network library.

Status capability note:

- the repository now includes prototype status-aware VC/VP capability surfaces
  in the hidden-holder family
- this protocol package does not yet add a full end-to-end transport contract
  for those status capabilities
- current status root selection/freshness remains a verifier/application
  responsibility outside this package

Production-facing readers should separate two claims:

- plain secret-holder proof/profile behavior
- blinded-secret transport/session behavior

The first is already stable enough to describe as a repository reference hidden
holder profile. The second is still a production-hardening track. In
particular, this package does not yet claim:

- durable pending state across restarts or delayed delivery
- a final external interoperability contract for OIDC, DIDComm, or another wire
  protocol
- a final protocol-level status/revocation interoperability contract
- final production revocation/non-revocation support

The broader repository now carries prototype status/revocation capability
surfaces, but this package still treats status-aware transport behavior as an
evolving off-chain integration concern rather than a finished protocol claim.

Randomness hardening rule:

- agent-local challenge/nonce/blinding generation now sits behind an injectable
  `ProtocolRandomnessSource` interface
- agents use `NodeCryptoRandomnessSource` by default, and envelopes use a
  Node-CSPRNG identifier source by default
- deterministic singleton sources are explicitly prefixed `unsafeReference`;
  their `ReferenceDeterministic*` classes are also fixture-only
- agent constructors accept an `envelopeIdentifierSource` so runtimes can
  inject reviewed CSPRNG/HSM implementations or deterministic fixture sources
- production integrators may inject a runtime or HSM-backed source while
  preserving the fail-closed CSPRNG contract

State-store foundation rule:

- agent-local pending offers, requests, submissions, and completed transport
  outcomes now have an injectable `ProtocolStateStore` seam
- explicit-holder and hidden-holder stored credentials also have that seam, so
  a persistent backend can support local restart recovery
- birth and birth-secret issuance results deliver raw committed claims and
  openings as validated holder-only private parts; holders reject mismatches or
  wrong recipients before storage and can recover only requested fields after
  restart, while verifier submissions retain only selected disclosures
- holder agents recover their stored-credential counters at startup if metadata
  lags behind append-only stored credential records after a partial write
- the exported default implementation is an in-memory reference store
- finalized replay/idempotency outcomes can be retained with a configurable
  TTL and/or bounded count
- terminal sessions can use the exported
  `atomicallyTransitionProtocolSession(...)` / `cancelProtocolSession(...)`
  helpers; the first finalized or cancelled record wins an immutable
  create-if-absent transition within one backend collection/key
- `claimProtocolResultOnce(...)` records an at-most-once claim, while
  `claimRetainedProtocolStateAtMostOnce(...)` reads a retained result and then
  attempts that claim; neither operation is an end-to-end exactly-once delivery
  guarantee

These terminal transitions and result claims are a state-store foundation, not
end-to-end exactly-once issuance or presentation delivery. Agent integration,
transaction boundaries, processing leases and crash recovery, and coupling to
business side effects remain E2 follow-ups. A backend without atomic
create-if-absent support fails closed rather than emulating it with a racy
read-then-write. Terminal records have no implicit expiry or tombstone
protocol; retained outcomes are removed by the configured local retention
helper, and distributed expiry/recovery semantics remain an adapter concern.
The generic collection boundary cannot enforce immutability for arbitrary
values, so helper-created cloneable terminal/claim/retained records use
immutable defensive copies; custom adapters must preserve that guarantee when
exposing their own direct collection operations.

Exact-byte delivery rule:

- register the exact transport-received bytes with
  `ExactByteProtocolDeliveryRegistry` before decoding the message or performing
  protocol side effects
- the first payload for a message ID returns `accepted`
- later delivery of the same ID and exactly the same bytes returns `duplicate`
- later delivery of the same ID with any byte difference throws
  `ProtocolMessageIdReuseError` and leaves the first payload unchanged
- the registry fails closed with `AtomicProtocolStateUnavailableError` when
  the supplied byte-store collection does not implement atomic
  `setIfAbsent(...)`
- persistent storage errors are reconciled against the retained bytes; bounded
  unresolved races fail with `ProtocolDeliveryRegistrationContentionError`
- `FileSystemProtocolStateByteStore` publishes a fully flushed temporary file
  through an atomic hard-link create, so independent local processes cannot
  both win registration of the same absent ID
- the file adapter creates and enforces private `0700` state directories,
  including a caller-supplied existing root, and creates `0600` records; it does
  not encrypt message bytes, so use encrypted transport envelopes or a
  production secret-storage adapter whenever wire payloads contain sensitive
  data
- dedicate the registry collection to immutable delivery records; do not mix
  its writes with overwrite-style `set(...)` calls or delete records while
  registrations are in flight

```ts
const deliveries = new ExactByteProtocolDeliveryRegistry(
  new FileSystemProtocolStateByteStore("./state"),
  "issuer:example:issuance-deliveries",
);

const registration = deliveries.register(messageId, receivedWireBytes);
if (registration === "duplicate") {
  // Registration proves only that these exact bytes were seen. Load a durable
  // finalized outcome or acquire a processing lease and resume incomplete work.
}
```

The registry does not derive bytes from `ProtocolMessage`. Transports must
preserve and supply the original wire bytes; parsing and re-serializing JSON is
not an exact-byte idempotency contract. A `duplicate` result does not prove that
the original process completed side effects or retained an outcome. The current
agent entrypoints do not yet invoke this registry automatically, so end-to-end
transport wiring, processing-lease recovery, and atomic coupling between
delivery registration and finalized outcomes remain E2 follow-up work.

For blinded-secret issuance, the transport-shaped API is now the preferred
reference surface:

- issuer: `receiveRequestAndRespond(...)`
- holder: `receiveIssuanceOutcome(...)`

For blinded-secret presentation, the transport-shaped API is now the preferred
reference surface:

- verifier: `receiveSecretSubmissionAndRespond(...)`
- holder: `receivePresentationOutcome(...)`

Reference issuance outcome rule:

- exact duplicate blinded-secret issuance requests re-deliver the same prior
  approved or rejected outcome without minting a second credential
- reuse of a finalized request ID with different parsed content is rejected as
  `replayed_request` and cannot replace the original outcome
- a result delivered directly after its request has been finalized is rejected
  at the holder boundary rather than stored again

Reference presentation outcome rule:

- duplicate blinded-secret presentation submissions re-deliver the same prior
  approved or rejected outcome
- uncorrelated approved or rejected presentation outcomes are still rejected at
  the holder boundary

Reference timing rule:

- if a caller does not supply `currentDay`, the reference agents default to
  `0n`
- callers that want expiry enforcement for offer/request lifetime should pass
  an explicit `currentDay`
- blinded-secret presentation requests and submissions can now carry envelope-
  level expiry timestamps in the reference protocol layer
- callers that want blinded-secret presentation timeout enforcement should pass
  explicit `currentTimeMs` values together with request/submission expiry
  timestamps
- the Compact credential family still does not define body-level presentation
  expiry fields or a final interoperable timeout contract

Current production-shaped reference path:

- use `NodeCryptoRandomnessSource` or
  `createNodeFileBackedProtocolPartyDependencies(...)`
- use one file-backed state directory per party
- use the restart-safe tagged JSON codec-backed store path instead of the
  test-only `v8`
  codec wiring
- set explicit replay retention where finalized outcomes matter
- see
  [`../../../../docs/guides/credentials-protocol-reference-path.md`](../../../../docs/guides/credentials-protocol-reference-path.md)
  for the checked-in explicit-holder restart and secret-holder replay examples

Persistent state adapter rule:

- integrators can either implement `ProtocolStateStore` directly or expose a
  lower-level byte store plus per-collection codecs
- the current store seam is intentionally synchronous; adapters backed by async
  durability layers should expose a synchronous facade to the protocol agents
  rather than returning promises from this interface
- integrators can satisfy `ProtocolStateStore` with a persistent backend as
  long as it preserves named collection boundaries, stable key lookup, and
  typed value serialization
- the package now exports `ProtocolStateByteStore`,
  `ProtocolStateCodecResolver`, and `createCodecBackedProtocolStateStore(...)`
  as the preferred integration path when the persistence layer naturally
  stores bytes or blobs
- byte-store adapters that participate in exact-byte delivery registration
  must implement atomic `setIfAbsent(...)`; a read-then-write emulation is not
  sufficient for multi-instance semantics
- the package now also exports a restart-safe tagged JSON reference path for local durable
  Node deployments:
  - `createStableJsonProtocolStateStore(...)`
  - `createNodeFileBackedProtocolStateStore(...)`
  - `createNodeFileBackedProtocolPartyDependencies(...)`
- finalized outcome retention currently relies on `entries()` enumeration, so a
  persistent adapter must support full collection scans for TTL pruning and
  oldest-first eviction semantics
- adapters that back append-only ordinal-keyed collections can optionally
  expose `maxOrdinalKey()` so holder-agent credential-count recovery can avoid
  decoding or scanning full typed entries during startup repair
- adapters may optionally implement `deleteMany(keys)` to let the shared
  helpers prune or evict retained records without repeated single-key deletes
- the helper implementation snapshots `entries()` before deleting records, so
  adapters do not need to tolerate mutation during active iteration
- if a persistent adapter wants better write-time complexity, it should
  preserve the same semantics behind storage-native pruning/eviction rather
  than copying the reference in-memory scan literally

Persistent adapter checklist:

- preserve stable collection names and key encoding
- preserve typed value serialization across restarts and process boundaries
- preserve explicit-holder and hidden-holder stored credential records and
  credential indexes if the holder agent is expected to survive restart
- support full collection scans or storage-native equivalents for TTL pruning
  and oldest-first eviction
- expose `maxOrdinalKey()` for append-only ordinal-keyed collections when the
  backend can answer that query more directly than replaying every entry

Minimum production posture:

1. keep the CSPRNG default or inject a reviewed runtime/HSM-backed source; never
   select an `unsafeReference` deterministic source
2. replace the in-memory store when restart-safe or delayed-delivery behavior
   matters
3. define replay/idempotency retention semantics explicitly
4. define explicit time sources for expiry and freshness checks
5. document status-root acquisition/freshness if revocation-aware flows are in
   scope

Use the dedicated guide for the full checklist:

- [`../../../../docs/guides/credentials-protocol-production-checklist.md`](../../../../docs/guides/credentials-protocol-production-checklist.md)
- preserve deterministic replay/idempotency behavior after restart
- register exact received bytes atomically before decode or side effects when
  message-ID idempotency is claimed
- document whether retention is bounded by TTL, count, or both
- document whether the adapter is sync-only facade over async storage or a
  truly synchronous backend

Illustrative sketch:

```ts
class SqlProtocolStateStore implements ProtocolStateStore {
  collection<T>(name: string): ProtocolStateCollection<T> {
    return {
      get: (key) => loadTypedRow<T>(name, key),
      set: (key, value) => upsertTypedRow(name, key, value),
      delete: (key) => deleteRow(name, key),
      deleteMany: (keys) => deleteRows(name, keys),
      has: (key) => hasRow(name, key),
      entries: () => iterateTypedRows<T>(name),
    };
  }
}
```

The adapter does not need to understand VC semantics. It only needs to
preserve collection names, keys, and typed value bytes/JSON consistently.

The lower-level strict helpers still exist for narrow tests and internal
composition:

- issuer: `receiveRequestAndIssueCredential(...)`
- holder: `receiveCredentialResult(...)`

## Where To Start

- `src/adapters/birth/issuer-agent.ts`
- `src/adapters/birth/holder-agent.ts`
- `src/adapters/birth/verifier-agent.ts`
- `src/adapters/birth/secret-issuer-agent.ts`
- `src/adapters/birth/secret-holder-agent.ts`
- `src/transport/message-bus.ts`

## Test Map

- `src/test/explicit-holder/issuance.test.ts`
- `src/test/explicit-holder/presentation.test.ts`
- `src/test/explicit-holder/full-lifecycle.test.ts`
- `src/test/secret-holder/issuance.test.ts`
- `src/test/secret-holder/presentation.test.ts`
- `src/test/secret-holder/pseudonym.test.ts`
- `src/test/secret-holder/same-holder.test.ts`
- `src/test/contract-verifier/age-gate.test.ts`
- `src/test/contract-verifier/capability-lifecycle.test.ts`
- `src/test/integration/explicit-holder-lifecycle.integration.test.ts`
- `src/test/integration/secret-holder-lifecycle.integration.test.ts`
- `src/test/integration/contract-verifier-lifecycle.integration.test.ts`

## Validation

Run the package in isolation:

```sh
pnpm --dir packages/components/orchestration/protocol run lint
pnpm --dir packages/components/orchestration/protocol run typecheck
pnpm --dir packages/components/orchestration/protocol run all
pnpm --dir packages/components/orchestration/protocol run test:integration
```
