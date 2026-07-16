# Compact Trusted-Time Capability Report

Status: confirmed bounded capability; production B3 remains blocked.

Date: 2026-07-17.

## Question

Can the repository's pinned Midnight stack establish authoritative current time
inside a Compact circuit, and does that surface satisfy the complete
`LedgerExecutionTimeAnchorV1` required by the B3 trusted-time adapter?

This report answers only the toolchain-capability prerequisite. It does not
implement authority signatures, DID evidence, sequence state, evidence
digests, or a final verification profile.

## Evaluated stack

| Surface | Evaluated value |
| --- | --- |
| Compact toolchain | `0.30.0` |
| Compact language | `0.22.0` |
| Compiler ledger target | `ledger-8.0.2` |
| Compact runtime | `0.15.0` |
| Root-resolved `@midnight-ntwrk/ledger-v8` | `8.1.0` |
| Time value type and unit | `Uint<64>` Unix seconds |

The compiler ledger target and root JavaScript ledger dependency are not the
same minor version. This report records the skew; it does not infer
compatibility from the shared major version.

Primary references:

- the [Compact standard-library time API](https://docs.midnight.network/compact/standard-library/exports#blocktimelt);
- the [Compact 0.30.0 standard-library definitions](https://github.com/LFDT-Minokawa/compact/blob/v0.30.0/compiler/standard-library.compact#L278-L291);
- the [Compact 0.30.0 ledger lowering](https://github.com/LFDT-Minokawa/compact/blob/v0.30.0/compiler/midnight-ledger.ss#L515-L542); and
- the [ledger 8.0.2 context fields](https://github.com/midnightntwrk/midnight-ledger/blob/ledger-8.0.2/onchain-runtime/src/context.rs#L858-L890).

## Confirmed capability

For nominal context time `T` and disclosed candidate `c`, Compact 0.30.0
implements:

| Primitive | Constraint |
| --- | --- |
| `blockTimeLt(c)` | `T < c` |
| `blockTimeGte(c)` | `T >= c` |
| `blockTimeGt(c)` | `T > c` |
| `blockTimeLte(c)` | `T <= c` |

A final circuit that asserts both

```text
blockTimeGte(disclose(candidateSeconds))
blockTimeLte(disclose(candidateSeconds))
```

constrains `candidateSeconds == T`. The candidate is still a disclosed circuit
input. It is not the authority: both ledger queries must be asserted in the
same protected transition. Calculating or returning their conjunction without
constraining the transition is insufficient.

This proves equality to the ledger context's nominal `secondsSinceEpoch`, not
to exact real-world wall-clock time. The Compact primitives ignore
`secondsSinceEpochErr`; changing that field does not change their result.

Direct lower/upper-bound checks are less time-fragile than exact equality and
are the preferred primitive for expiry or validity windows when the protocol
does not need to publish an exact nominal time value.

## Unavailable capability

Compact 0.30.0 exposes no supported circuit getter for:

- raw current time;
- `secondsSinceEpochErr`;
- previous block time;
- block height or slot;
- ordered ledger position; or
- a current execution-context digest.

The TypeScript/Rust context contains more fields, including `lastBlockTime`,
but reading those in application code or returning them from a witness does
not give them ledger authority in Compact. A contract `Counter` is application
state, not canonical block position.

Consequences:

1. The equality sandwich can populate a nominal `executionLedgerTime` only.
2. It cannot establish `executionPosition`, a context-derived dynamic error
   window, or `executionContextDigest` as currently required by
   `LedgerExecutionTimeAnchorV1`.
3. It cannot prove wall-clock accuracy, monotonic ordering, canonical-chain
   position, or finality.
4. An exact candidate is time-fragile: construction at `T` fails if execution
   is re-evaluated at `T + 1`.
5. Milliseconds and implicit unit conversions remain invalid.

Therefore the full B3 adapter and both authoritative time modes that require
the complete current-context anchor remain blocked. The specification must not
silently zero or fabricate unsupported anchor fields to make an implementation
appear complete.

## Executable regression gate

Run:

```bash
pnpm --dir packages/registry/status-registry run test:trusted-time-capability
```

The gate compiles
[`trusted-time-capability.compact`](../../packages/registry/status-registry/test-fixtures/trusted-time-capability.compact)
and verifies:

- all four comparator truth tables at `T - 1`, `T`, and `T + 1`;
- identical comparator behavior with zero and non-zero
  `secondsSinceEpochErr`;
- exact-candidate acceptance only at nominal `T`;
- rejection when a candidate prepared for `T` is replayed at `T + 1`;
- accepted and rejected bounded windows;
- generated circuits remain proof-requiring; and
- known raw time, error, previous-time, height, slot, and position getter names
  remain compile errors.

The negative getter probes guard the known surface but are not an exhaustive
language proof. Each Compact or ledger upgrade still requires source/API review
and rerunning this matrix before the capability can be accepted.

The gate runs in the status-registry `test` and `test:ci` scripts, as an
explicit non-Docker release-gate target, and in CI's Compact-toolchain
preparation job. Artifact-only CI lanes remain independent of the compiler.
This remains a test-tooling capability check, not a package export or
production entrypoint.

## B3 unblock conditions

Production B3 may resume only after one of these reviewed outcomes:

1. a supported Compact surface binds every mandatory
   `LedgerExecutionTimeAnchorV1` field, including error/window and context or
   ordered-position authority; or
2. the normative anchor is revised through security and protocol review to a
   comparison-only model with equivalent freshness, replay, liveness, and
   finality properties.

Either outcome still requires all `STA-TIME-*` and applicable differential
tests, authority/DID evidence, persistent scoped sequence state, and removal of
caller-time authority from final result paths.
