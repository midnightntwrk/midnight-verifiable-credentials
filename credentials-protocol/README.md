# `credentials-protocol`

Reference protocol orchestration layer for Midnight Credentials.

Status:

- reference implementation
- evolving API surface

Related docs:

- spec: [`../docs/spec/midnight-credentials.md`](../docs/spec/midnight-credentials.md)
- profiles: [`../docs/spec/profiles.md`](../docs/spec/profiles.md)
- conformance: [`../docs/spec/conformance.md`](../docs/spec/conformance.md)
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
- blinded-secret presentation does not yet carry explicit message-level expiry
  fields, so the presentation transport path does not claim timeout semantics

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
