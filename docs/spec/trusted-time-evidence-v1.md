# Trusted-time evidence V1

Status: implemented reference port and comparison-only Compact binding. This does not operate a time service or claim the unavailable full `LedgerExecutionTimeAnchorV1` position/context fields.

## Authority modes

| Mode | Eligible profile | Result authority |
| --- | --- | --- |
| `ledger` | `ledger-local-v1` | `ledger-local`, only after the injected execution-anchor adapter authenticates the exact anchor |
| `authority-attested` | `ledger-attested-v1` | `ledger-attested`, only after both the #494 DID/trust authority verifier and an independent ledger anchor accept |
| `local-reference` | `offchain-public-v1` only | `local-process`; never authoritative |

`TrustedTimeScopeV1` binds every evidence statement and anchor to the network, deployment, request digest, challenge digest, audience digest, origin digest, verification profile, and freshness-policy digest. `sourcePolicyDigest` fixes the verifier-selected source/finality or attestor policy. For attested time, the verifier recomputes that digest from its configured policy and compares the evidence policy to it before selecting the configured attestor actor; evidence cannot select its own policy or actor.

Replay checkpoints deliberately use a narrower stable key: network, deployment, authority, and source-policy digest. Request, challenge, audience, origin, and profile remain evidence-scope bindings but are excluded from this key, so changing the request cannot bypass cross-write sequence rollback detection. Implementations must persist the returned checkpoint with atomic compare-and-set semantics where replay and rollback protection is required.

The reference verifier checks canonical statement/anchor/evidence digests, exact scope and source policy, safe integer/unit shape, nested authority shape, validity ordering, inclusive maximum age/future-skew boundaries, expiry, monotonic sequence/time, and evidence replay. Missing adapters or evidence are `indeterminate`; malformed records and authenticated mismatches are fail-closed; no failure receives ledger authority.

## Compact boundary

The private compatibility helper defines `assertTrustedLedgerTimeV1`, `assertTrustedLedgerDayV1`, and `assertTrustedLedgerIntervalV1`. The private authoritative age-gate contracts include that leaf directly; the canonical reusable Compact composition deliberately excludes it because that composition has no authoritative ledger-time contract context. The helpers use `blockTimeGte`/`blockTimeLte` in the protected transition, so a disclosed candidate is data, not authority. The age-gate contracts use this boundary for request creation/expiry, credential not-before/expiry, age-day policy, and authority-attested status freshness.

The pinned toolchain still does not expose ledger position, context digest, or the time-error window. The injected TypeScript anchor port and comparison-only Compact helpers must not fabricate those fields or be described as the complete B3 anchor from `status-time-authority-v1.md`.

## Failure semantics

- unavailable time evidence, anchor, or attestor authority: `indeterminate` / `notEvaluated`;
- malformed, cross-scope, wrong source, future, expired, stale, rollback, or replay evidence: invalid/fail-closed;
- local reference clocks: accepted only for explicit off-chain preflight and always labeled `local-process`;
- authoritative status freshness: requires an authoritative trusted-time result; a local reference result is rejected.
