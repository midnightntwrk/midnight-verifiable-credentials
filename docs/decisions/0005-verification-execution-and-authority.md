# ADR-0005: Verification execution and authority

- Status: Superseded by ADR-0010
- Date: 2026-07-15
- Owners: VC, DID, trust-registry, status, and verifier maintainers
- Supersedes: none

## Context

Verification can run in a Midnight contract or in an off-chain process. The
current TypeScript stack can decode messages, resolve DIDs, inspect serialized
state, and call generated `pureCircuits`. Those operations are useful for UX
and cost control but do not have ledger finality. Reimplementing security rules
in TypeScript would create a second semantic authority and allow the two paths
to diverge.

Current production blockers include caller-supplied issuer proof keys without
ledger DID relationship binding, caller-supplied time, unauthenticated status
mutation, observed roots without in-circuit non-membership, and replay state
that is not an authoritative ledger nullifier.

## Decision

Compact family and verifier circuits are the sole canonical VC/VP validity
semantics. Off-chain components may decode, resolve, cache, construct the exact
inputs, invoke generated circuits for preflight, and reject early. They may not
upgrade an invalid or indeterminate result to an authoritative approval.

The target verification profiles are:

| Profile | Authority | Intended use |
| --- | --- | --- |
| `ledger-local-v1` | Midnight transaction over local ledger state | Same-composition status and business action |
| `ledger-attested-v1` | Midnight transaction over a challenge-bound authority attestation and accepted anchors | External status or trust evidence bound to an active authority |
| `offchain-public-v1` | `local-process` only | Restricted verification where every security-relevant input is public |

`offchain-public-v1` cannot handle secret or blinded holder witnesses,
privacy-preserving predicates, same-holder proofs, or private status witnesses.
Observed-root and resolver-backed checks are preflight modes, not additional
authoritative profiles.

Each request commits to one `VerificationPublicInputsV1` transcript containing
or committing to:

- profile, network, verifier contract or OID `client_id`, audience/origin,
  request ID, nonce/challenge, expiry, and policy digest;
- credential family, schema and version, credential/presentation roots,
  disclosure and predicate requests, and artifact/deployment digests;
- issuer DID, canonical verification-method identifier, required relationship,
  active key/version evidence, and accepted trust-registry scope;
- status mode, registry, root/version or attestation, authority, and freshness
  policy; and
- trusted time evidence and a decision nullifier for side-effecting flows.

Claim openings, holder secrets, private status handles and paths, and other
witnesses remain private. The final verifier consumes a persistent nullifier
atomically before issuing a capability or changing business state.

Every result uses `malformed | invalid | indeterminate | policyDenied | replay`
and includes its profile, authority, and anchors. Retrieval failure is
`indeterminate`, never valid-with-warning. Off-chain policy may deny a
cryptographically valid presentation but may not make an invalid one valid.

## Responsibility boundary

| Concern | Authoritative path | Off-chain role |
| --- | --- | --- |
| VC body, signature, holder binding, disclosures, predicates | Compact | Decode and preflight using generated code |
| DID key and verification relationship | Accepted DID ledger evidence bound by Compact | Resolve and cache candidate evidence |
| Status | Local ledger set or in-circuit bound authority evidence | Fetch snapshots and prepare witnesses |
| Trust authorization | Accepted trust-registry state or proof bound by Compact | Resolve federation and local policy |
| Challenge, replay, business action | Transcript and persistent ledger nullifier | Create session, nonce, and duplicate cache |
| Transport, origin, consent | None | Wallet and verifier runtime |

## Consequences

- On-chain and off-chain paths cannot silently define different credential
  validity rules.
- Preflight remains valuable but its assurance is accurately labeled.
- A verifier contract needs explicit DID, trust, status, time, and replay
  anchors before claiming production authority.
- Differential tests must bypass preflight and prove the final Compact path
  rejects every security-relevant mutation.

## Rejected alternatives

- **Equivalent TypeScript verifier:** duplicates cryptographic and policy
  semantics and will drift from Compact.
- **All verification on-chain:** transport, consent, resolution, and UX remain
  off-chain concerns and should fail early where possible.
- **Treat observed status roots as proof:** root equality and non-membership are
  not yet proven for the generic external mode.

## Follow-up

ADR-0010 supersedes this record with the canonical transcript, result,
authority, and atomic nullifier contract. The production work remains P0 in
[`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md).
