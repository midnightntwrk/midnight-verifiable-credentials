# ADR-0012: Trusted time and status freshness

- Status: Accepted
- Date: 2026-07-17
- Owners: VC, status, protocol, wallet, security, and credential product maintainers
- Refines: ADR-0002 and ADR-0010

## Context

Expiry, attestation age, status-root freshness, and delegated authority all use
time or ordered state. The current status prototype accepts `currentTime` from
its caller. Runtime helpers also attach observation timestamps to registry
snapshots. Those values can support local preflight but are not authoritative
inside a ledger verification.

A signed timestamp does not solve the problem by itself. The verifier still
needs an independent reason to accept that timestamp as current. Likewise,
equality between a supplied root and witness data proves consistency, not that
the root is owned, current, or a proof of non-membership.

## Decision

### Use explicit time authority modes

V1 has three time modes:

- `none`: the selected profile has no time-dependent policy and uses canonical
  not-required evidence;
- `ledger`: the final contract constrains time or an ordered ledger position to
  accepted execution context and never accepts a caller argument as authority;
  a disclosed candidate is acceptable only when supported ledger primitives
  constrain it in the same protected transition; and
- `authority-attested`: the final contract verifies a bounded time statement
  from an accepted authority and an independent freshness anchor.

`Date.now()`, process clocks, HTTP dates, wallet display time, verifier-supplied
`currentTime`, and unanchored signed timestamps are `local-process` inputs. They
cannot produce ledger authority.

If the supported Midnight/Compact toolchain does not expose a suitable ledger
time or ordered-position primitive, the `ledger` mode is unavailable and B3 is
blocked. Authority-attested mode does not bypass this requirement: every
time-dependent authoritative decision also binds a freshness value or validity
window read from the current ledger execution context. A stored monotonic
authority sequence detects rollback but cannot prove that a delayed first
submission is current.

The pinned Compact 0.30.0 stack exposes comparison-only nominal Unix-seconds
time. As recorded in the
[`Compact trusted-time capability report`](../testing/compact-trusted-time-capability-2026-07-17.md),
asserting both `blockTimeGte(candidate)` and `blockTimeLte(candidate)` proves a
disclosed candidate equals nominal context time. The comparison primitives can
constrain that nominal time against disclosed validity bounds, but they do not
expose or bind a context-derived error window, ordered position, or context
digest. Because those fields are mandatory in the accepted V1 anchor, this
bounded capability does not unblock production B3.

### Bind authoritative time evidence

`TrustedTimeStatementV1` is the exact authority-signed payload.
`TrustedTimeEvidenceV1` separately binds that statement to accepted DID method
provenance, its signature/proof, and the current execution-context ledger
anchor. Implementations must use one declared time unit per policy and reject
conversion, overflow, rollback, future values, expired evidence, excessive
skew, unknown authority, and non-monotonic sequence.

Time evidence is request- or transaction-scoped. A fresh verifier challenge
does not make an old time statement fresh unless the accepted authority signed
that challenge and the independent freshness anchor also accepts it.

### Separate status ownership, root acceptance, and non-membership

Status verification establishes three independent facts:

1. **ownership:** the registry namespace and deployment are controlled by the
   expected authority;
2. **freshness:** the accepted root/version satisfies the selected profile's
   current-state or bounded-age policy; and
3. **membership statement:** the credential-bound status handle is proven not
   to be in the revoked set represented by that root.

No one fact substitutes for another. Root equality alone is not
non-membership. A non-membership witness against an unauthenticated root is not
authoritative. A signed root without trusted freshness may be stale.

### Constrain status modes

- `same-contract-live` reads the local accepted registry state during the same
  transaction. It uses exact current version/root and needs no snapshot-age
  claim. A concurrent version change causes rejection/retry.
- `external-nonmembership` verifies a real non-membership proof against a root
  anchored to an accepted registry deployment and freshness policy.
- `authority-attested` verifies a request-bound status statement from the
  credential-bound authority plus trusted time evidence. It remains attested
  authority and does not become cryptographic non-membership.
- observed-root/runtime helpers are preflight only and return
  `authority: local-process`.

An unavailable required root, proof, DID relationship, authority statement, or
trusted-time source is `indeterminate/notEvaluated`. Authenticated evidence that
proves revocation, stale state, wrong registry, wrong network, expiry, or invalid
authorization is `invalid/notEvaluated`.

### Preserve privacy constraints

Status evidence for a hidden-holder profile must be verifier- and
challenge-scoped. It cannot publish a stable status handle, credential root,
holder DID, or reusable status-handle commitment. The current
`AuthorityAttestedStatusProof` prototype exposes a stable commitment and is not
eligible for a hidden-holder final profile.

## Consequences

- Existing caller-time freshness checks remain useful only for local preflight.
- B2 must prove both accepted-root binding and actual non-membership.
- B3's toolchain capability check confirms nominal comparison-only ledger time,
  but production B3 remains blocked on the mandatory anchor fields; it cannot
  fabricate or silently omit those fields.
- Final verification profiles must declare exact status, time, authority, and
  failure-classification combinations.

## Rejected alternatives

- **Caller-supplied `currentTime`:** attacker-controlled in an authoritative
  contract call.
- **Signed time with no freshness anchor:** permits replay of an old but valid
  statement.
- **Version alone means fresh:** a version has no age or canonical-chain meaning
  without accepted state authority.
- **Root equality means not revoked:** proves neither set ownership nor
  non-membership.
- **Network lookup during proof verification:** leaks correlation and introduces
  availability-dependent validity.
- **Map retrieval failure to valid-with-warning:** violates fail-closed
  verification authority.

## Follow-up

The normative records, acceptance matrix, threat model, and B2/B3 gates are
defined by:

- [`../spec/status-time-authority-v1.md`](../spec/status-time-authority-v1.md)
- [`../testing/status-time-authority-v1-test-design.md`](../testing/status-time-authority-v1-test-design.md)
- [`../testing/compact-trusted-time-capability-2026-07-17.md`](../testing/compact-trusted-time-capability-2026-07-17.md)
