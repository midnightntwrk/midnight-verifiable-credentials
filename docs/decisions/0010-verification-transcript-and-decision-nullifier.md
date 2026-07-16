# ADR-0010: Bind verification decisions to a canonical transcript and nullifier

- Status: Accepted
- Date: 2026-07-17
- Owners: VC core, verifier-contract, status, and security owners
- Supersedes: ADR-0005

## Context

ADR-0005 makes Compact the authority for final verification and requires a
challenge-bound transcript plus persistent replay protection. It does not fix
the byte-level transcript contract, distinguish proof validity from business
policy, or define how a side-effecting decision consumes its nullifier.

Leaving those details to each verifier creates incompatible receipts and three
security failures:

- off-chain preflight can be mistaken for a ledger decision;
- a caller can omit or reinterpret a security-relevant public input; and
- replay protection can be checked separately from the protected state change.

The current DID, trust-registry, status, trusted-time, and artifact surfaces do
not yet provide all authoritative evidence required by the final profiles. The
verification contract therefore needs a stable boundary that fails closed
while those dependencies mature.

## Decision

ADR-0005's core boundary remains binding: Compact owns final VC/VP validity,
the three named verification profiles remain the target profiles, and
off-chain execution cannot claim ledger authority. This record replaces
ADR-0005 because it materially changes and completes the result contract.

### Keep proof, policy, execution, and authority orthogonal

`VerificationResultV1` has four independent axes:

- `proofStatus`: `malformed | invalid | indeterminate | valid`;
- `decisionStatus`: `notEvaluated | approved | policyDenied | replay`; and
- `executionStatus`: `notSubmitted | rejected | reverted | committed`; and
- `authority`: `ledger-local | ledger-attested | local-process`.

Only these combinations are valid:

| Proof status | Decision status |
| --- | --- |
| `malformed`, `invalid`, or `indeterminate` | `notEvaluated` |
| `valid` | `approved`, `policyDenied`, or `replay` |

Policy cannot upgrade a non-valid proof. A replay is a valid proof whose
side-effecting decision scope has already been consumed. A flattened outcome
may be exposed for compatibility, but it is derived from these axes and is not
the authoritative representation.

Only a committed Midnight transaction can emit a ledger receipt with
`ledger-local` or `ledger-attested`. Typed decoding failures and aborted
transactions return a separate `local-process` attempt result, never a
ledger-authority receipt. TypeScript mirrors, wallet checks, resolver
preparation, and public off-chain verification also emit `local-process`.

A valid, policy-approved proof whose protected write reverts remains
`valid/approved` but has `executionStatus: reverted`; it is not an approval
receipt and consumes no nullifier.

### Hash one versioned, fixed-width public transcript

`VerificationTranscriptV1` is an ordered Compact record composed of bounded
enums, integers, and `Bytes<32>` values. It is hashed with Compact
`persistentHash<VerificationTranscriptV1>`. It does not hash JSON, CBOR, raw
URLs, locale-sensitive text, or implementation-specific object layouts.

Every variable-length identifier is normalized by its owning specification and
converted to a `Bytes<32>` digest before it reaches the transcript. A digest is
not proof that the underlying value is authoritative; the final circuit must
also validate the corresponding ledger state, proof, attestation, or
deployment configuration.

The transcript includes all request, profile, deployment, credential binding,
identity, trust, status, policy, artifact, time, disclosure, and replay inputs
listed in [`verification-contract-v1.md`](../spec/verification-contract-v1.md).
The exact field order is part of v1. Adding, removing, or reordering a field
requires a new transcript version.

Hidden-holder profiles commit a challenge- and verifier-scoped credential
binding. They do not expose a reusable credential/body root in the transcript
or receipt.

The holder's presentation proof binds a canonical consent digest containing
the profile, audience, origin, request, challenge, expiry, disclosure,
predicates, policy, and exact protected action invocation. A verifier cannot
reuse a proof or wallet consent for a different action by constructing a new
internally consistent transcript.

### Derive the decision nullifier independently

A side-effecting verifier derives `decisionNullifier` from a separate,
versioned `DecisionNullifierMaterialV1` record. That material includes the
deployment context, verifier, configured replay policy, and a contract-derived
replay scope. It does not include the transcript digest. Request-scoped replay
includes the request and challenge in that scope; holder- or credential-action
replay deliberately excludes fresh request identifiers so a new request cannot
bypass a product-wide one-time action. The completed transcript includes the
exact action invocation, replay policy, replay scope, and derived nullifier.

This order is mandatory:

1. validate the private witness and all authoritative public evidence;
2. derive the decision nullifier from validated fields;
3. assert that the supplied transcript contains that nullifier;
4. reject an already-consumed nullifier;
5. record the nullifier immediately before the protected state change; and
6. perform both writes in the same atomic Midnight transaction.

There is no external check-then-act gap. If the protected state change fails,
the nullifier write must roll back with it. Read-only verification uses the
explicit `none` nullifier mode and the canonical zero digest.

### Fail closed on unavailable authority

Caller-provided network, contract, origin, DID, trust, status, time, or artifact
values cannot become authoritative merely because they are transcript-bound.
Unavailable required authority produces `indeterminate` with
`decisionStatus: notEvaluated`. Evidence that is available and proves a stale,
revoked, unsupported, mismatched, or otherwise hard-invalid condition produces
`invalid/notEvaluated`.

In particular:

- browser origin is authoritative to a ledger profile only when an accepted
  wallet/connector attestation is verified; otherwise it is local request
  metadata because Compact cannot observe browser origin directly;
- network and verifier deployment context must be bound to ledger
  initialization or an accepted deployment manifest, not an untrusted string;
- DID verification relationships, trust epochs, status roots, and delegated
  attestations require evidence from their owning authorities;
- expiry requires ledger-derived time or a bounded accepted time attestation;
  and
- artifact and deployment digests require the manifest contract from
  ADR-0003 before they can support a production claim.

## Consequences

Verifier implementations share one mutation-testable public-input contract,
and receipts can express the difference between cryptographic validity,
business denial, replay, and execution authority. Atomic nullifier consumption
protects side effects across process restarts and concurrent relays.

The transcript is intentionally wider than a minimal proof API. Integrations
must normalize identifiers and preserve exact versioned digests. Profiles that
lack an authoritative evidence source remain `local-process` or
`indeterminate`; they cannot be marketed as ledger verification.

## Rejected alternatives

- One `valid | invalid` boolean was rejected because it collapses malformed
  input, missing authority, policy denial, and replay.
- A TypeScript verifier issuing ledger-shaped receipts was rejected because a
  local process cannot claim Midnight transaction authority.
- Deriving the nullifier from a transcript that already contains the nullifier
  was rejected as circular.
- Checking a nullifier in one call and mutating business state in another was
  rejected because concurrent calls can pass the same check.
- Treating a caller-supplied root, time, network, or origin as authoritative
  merely because it is hashed was rejected because commitment is not
  provenance.

## Follow-up

The normative shape is in
[`verification-contract-v1.md`](../spec/verification-contract-v1.md), and its
threat model and required negative tests are in
[`verification-authority-v1-test-design.md`](../testing/verification-authority-v1-test-design.md).
Tracks A1, A2, and A3 in the
[`production execution plan`](../plans/vc-production-execution-plan-2026-07-16.md)
must satisfy those documents before security-critical Compact semantics land.
