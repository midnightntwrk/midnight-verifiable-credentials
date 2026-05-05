# `credentials-protocol`

Reference protocol orchestration layer for Midnight Credentials.

Status:

- reference implementation
- evolving API surface

Surface classification:

- `Off-chain only`
- this package is a runtime/orchestration layer, not a Compact contract surface

Start here:

1. use this package for:
   - reference agent flows
   - protocol-state management patterns
   - transport-shaped integration experiments
2. do not use this package as an on-chain API or contract-authoring surface
3. read [`../docs/guides/integration-surface-map.md`](../docs/guides/integration-surface-map.md)
   before mixing it with Compact package entrypoints

Related docs:

- spec: [`../docs/spec/midnight-credentials.md`](../docs/spec/midnight-credentials.md)
- profiles: [`../docs/spec/profiles.md`](../docs/spec/profiles.md)
- conformance: [`../docs/spec/conformance.md`](../docs/spec/conformance.md)
- credential status: [`../docs/spec/credential-status.md`](../docs/spec/credential-status.md)
- hidden-holder interoperability:
  [`../docs/spec/hidden-holder-interoperability.md`](../docs/spec/hidden-holder-interoperability.md)
- companion guide: [`../docs/guides/midnight-credentials-for-dummies.md`](../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../docs/testing/test-matrix.md`](../docs/testing/test-matrix.md)

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

## What This Package Is

- a repo-local reference implementation
- a protocol simulation and conformance harness
- a place to test message shapes against Compact-generated circuits
- a bridge between Layer 2 credential families and Layer 3 business logic

## What This Package Is Not

- not a production-ready network transport library
- not yet a stable publishable API surface
- not a replacement for OIDC or DIDComm transports

The current public exports are intentionally narrow:

- explicit-holder and secret-holder agent classes
- injectable randomness interfaces for protocol challenges, issuer nonces,
  blinding factors, and signing nonces
- a generic `ProtocolStateStore` interface plus an in-memory reference
  implementation for protocol session state
- a byte-backed codec adapter seam so persistent stores can expose
  `ProtocolStateStore` without reimplementing typed collection logic
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
  offer/request mismatches, unknown offer references, expired offers, and
  expired requests
- idempotent re-delivery of duplicate blinded-secret issuance requests and
  duplicate blinded-secret issuance outcomes
- explicit blinded-secret presentation rejection messages for malformed
  submissions, request/submission mismatches, and unsatisfied verifier
  requests
- idempotent re-delivery of duplicate blinded-secret presentation submissions
  and duplicate blinded-secret presentation outcomes
- request/submission and submission/result alignment enforced by Compact circuits
- blinded holder-binding and pseudonym-specific validation through
  `credentials-birth-secret`
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
- production randomness/nonce interfaces instead of test/reference generation
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
- the exported default implementation is intentionally marked as unsafe and
  deterministic for repository tests
- production integrators should supply their own randomness source rather than
  relying on the default

State hardening rule:

- agent-local pending offers, requests, submissions, and completed transport
  outcomes now sit behind an injectable `ProtocolStateStore` interface
- the exported default implementation is an in-memory reference store
- production integrators should supply a persistent implementation if they need
  restart-safe protocol session handling
- finalized replay/idempotency outcomes can now be retained with a configurable
  TTL and/or bounded count

For blinded-secret issuance, the transport-shaped API is now the preferred
reference surface:

- issuer: `receiveRequestAndRespond(...)`
- holder: `receiveIssuanceOutcome(...)`

For blinded-secret presentation, the transport-shaped API is now the preferred
reference surface:

- verifier: `receiveSecretSubmissionAndRespond(...)`
- holder: `receivePresentationOutcome(...)`

Reference outcome rule:

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

Persistent state adapter rule:

- integrators can either implement `ProtocolStateStore` directly or expose a
  lower-level byte store plus per-collection codecs
- integrators can satisfy `ProtocolStateStore` with a persistent backend as
  long as it preserves named collection boundaries, stable key lookup, and
  typed value serialization
- the package now exports `ProtocolStateByteStore`,
  `ProtocolStateCodecResolver`, and `createCodecBackedProtocolStateStore(...)`
  as the preferred integration path when the persistence layer naturally
  stores bytes or blobs
- finalized outcome retention currently relies on `entries()` enumeration, so a
  persistent adapter must support full collection scans for TTL pruning and
  oldest-first eviction semantics
- adapters may optionally implement `deleteMany(keys)` to let the shared
  helpers prune or evict retained records without repeated single-key deletes
- the helper implementation snapshots `entries()` before deleting records, so
  adapters do not need to tolerate mutation during active iteration
- if a persistent adapter wants better write-time complexity, it should
  preserve the same semantics behind storage-native pruning/eviction rather
  than copying the reference in-memory scan literally

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

- `src/agents/issuer-agent.ts`
- `src/agents/holder-agent.ts`
- `src/agents/verifier-agent.ts`
- `src/agents/secret-issuer-agent.ts`
- `src/agents/secret-holder-agent.ts`
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
npm run lint -w credentials-protocol
npm run typecheck -w credentials-protocol
npm run all -w credentials-protocol
npm run test:integration -w credentials-protocol
```
