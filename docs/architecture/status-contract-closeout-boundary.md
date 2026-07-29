# Status Contract Closeout Boundary

Status: repository-owned closeout note for the `VC-MAT-20` status-contract
wave.

Companion documents:

- [`./status-verification-modes.md`](./status-verification-modes.md)
- [`./live-root-binding-feasibility.md`](./live-root-binding-feasibility.md)
- [`./status-canonical-non-membership-bundle.md`](./status-canonical-non-membership-bundle.md)
- [`../spec/credential-status.md`](../spec/credential-status.md)
- [`../spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)
- [`../spec/revocation-registry.md`](../spec/revocation-registry.md)

## Purpose

This note closes the repository-owned part of `VC-MAT-20`.

The repo now has a coherent status-contract story. The remaining gap is not a
missing helper, missing verifier mode, or missing trust-model split inside this
codebase. It is the upstream Compact/runtime limitation around live Merkle-root
access.

## What is complete in this repository

The current stack now ships all of the following:

1. one shared VC-side status binding shape with the accepted minimum payload:
   - `statusType`
   - `registryRef`
   - `statusHandleCommitment`
2. canonical runtime non-membership bundle builders for:
   - observed-snapshot verification
   - same-contract live-state verification
3. three explicit status verification modes:
   - same-contract live-state verification
   - off-chain verifier-side live-state verification
   - authority-attested external-registry Layer 3 verification
4. a canonical fail-closed verifier error taxonomy shared across those modes
5. hard invalidity semantics for `revoked`
   - not a softer business-policy denial
6. verifier-enforced freshness semantics for authority-attested proofs
7. a safe default authority-attestation helper path with internal nonce
   derivation
   - unsafe nonce override remains testing-only
8. adversarial conformance around:
   - wrong registry
   - wrong root
   - stale registry state
   - revoked credentials
   - unsupported proof mode
   - authority mismatch
   - stale / expired / future-dated attestation

## Evidence map

The closeout claims above are backed by checked-in code and tests rather than
by prose alone.

1. VC-side status binding payload and status-type commitment:
   - [`../../packages/core/primitives/credentials/src/credentials/status-bindings.compact`](../../packages/core/primitives/credentials/src/credentials/status-bindings.compact)
   - [`../../packages/registry/status-registry/src/status-binding.ts`](../../packages/registry/status-registry/src/status-binding.ts)
2. canonical runtime non-membership bundle builders and verifier integration:
   - [`../../packages/registry/status-registry/src/canonical-non-membership.ts`](../../packages/registry/status-registry/src/canonical-non-membership.ts)
   - [`../../packages/registry/status-registry/src/status-verifier.ts`](../../packages/registry/status-registry/src/status-verifier.ts)
   - [`../../packages/registry/status-registry/src/test/canonical-non-membership.test.ts`](../../packages/registry/status-registry/src/test/canonical-non-membership.test.ts)
3. explicit verification modes and live-state observation seam:
   - [`./status-verification-modes.md`](./status-verification-modes.md)
   - [`../../packages/registry/status-registry/src/registry-state-observation.ts`](../../packages/registry/status-registry/src/registry-state-observation.ts)
   - [`../../packages/registry/status-registry/src/test/registry-state-observation.test.ts`](../../packages/registry/status-registry/src/test/registry-state-observation.test.ts)
4. fail-closed verifier taxonomy and plain failure surface:
   - [`../spec/status-error-taxonomy.md`](../spec/status-error-taxonomy.md)
   - [`../../packages/registry/status-registry/src/status-verifier.ts`](../../packages/registry/status-registry/src/status-verifier.ts)
   - [`../../packages/registry/status-registry/src/test/status-verifier-classification.test.ts`](../../packages/registry/status-registry/src/test/status-verifier-classification.test.ts)
5. hard-invalidity semantics for `revoked`:
   - [`../spec/credential-status.md`](../spec/credential-status.md)
   - [`../../packages/prototypes/credential-families/birth-secret/src/test/status.test.ts`](../../packages/prototypes/credential-families/birth-secret/src/test/status.test.ts)
   - [`../../packages/use-cases/age-gate/contract/src/test/demo-revocation.test.ts`](../../packages/use-cases/age-gate/contract/src/test/demo-revocation.test.ts)
   - [`../../packages/use-cases/age-gate/scenarios/features/hidden_holder_revoked_credential.feature`](../../packages/use-cases/age-gate/scenarios/features/hidden_holder_revoked_credential.feature)
6. authority-attested freshness and nonce hardening:
   - [`../../packages/registry/status-registry/src/attestation-builder.ts`](../../packages/registry/status-registry/src/attestation-builder.ts)
   - [`../../packages/registry/status-registry/src/test/attestation-builder.test.ts`](../../packages/registry/status-registry/src/test/attestation-builder.test.ts)
   - [`../../packages/registry/status-registry/src/status-proof-protocol.compact`](../../packages/registry/status-registry/src/status-proof-protocol.compact)
7. adversarial conformance coverage for the supported modes:
   - [`../../packages/registry/status-registry/src/test/witness-builder.test.ts`](../../packages/registry/status-registry/src/test/witness-builder.test.ts)
   - [`../../packages/use-cases/age-gate/scenarios/features/hidden_holder_stale_snapshot.feature`](../../packages/use-cases/age-gate/scenarios/features/hidden_holder_stale_snapshot.feature)
   - [`../../packages/use-cases/age-gate/scenarios/features/hidden_holder_wrong_registry.feature`](../../packages/use-cases/age-gate/scenarios/features/hidden_holder_wrong_registry.feature)

## What is intentionally not claimed

This repository still does **not** claim:

1. final generic in-circuit live-root equality for external snapshots
2. final generic in-circuit Merkle non-membership against an accepted root
3. final public status interoperability across external ecosystems

Those are real absences, but they are no longer a sign that the repo lacks a
status architecture. They are the remaining upstream or future-extension tail.

## Current repository decision

For the current backlog closeout:

1. same-contract live-state verification is the strongest current Layer 3
   reference path when the registry is local
2. off-chain verifier-side live-state verification is the preferred path when
   verification can terminate off-chain
3. authority-attested verification remains the supported Layer 3 bridge for
   external registries
4. the mirrored-root fallback is **not** adopted in this backlog wave
5. the generic root-bound non-membership target remains deferred to:
   - a new Compact surface for live root access, or
   - a future explicit architectural decision to mirror the root

## Backlog consequence

`VC-MAT-20` should now be read as:

- **repository-owned status-contract work: complete on the current stack**
  - three delivered verification modes
  - canonical runtime non-membership bundles
  - issuer-signed shared status binding payload
  - freshness / replay / nonce hardening for supported flows
  - fail-closed verifier taxonomy plus adversarial conformance coverage
- **upstream Compact dependency for generic root-bound in-circuit proof:
  still open**

That means the remaining internal backlog should not keep treating
`VC-MAT-20` as if it were still waiting on ordinary repo execution slices.

## Integrator consequence

Integrators should now choose a mode explicitly:

1. local registry in the same contract domain:
   - use same-contract live-state verification
2. off-chain verifier can decide status itself:
   - use verifier-side live-state verification
3. external registry but Layer 3 must still validate status:
   - use authority-attested verification

Do not wait for a future generic in-circuit root-bound proof before using the
repo where one of those three delivered modes already matches the deployment.

Do not over-claim:

- a local or authority-attested deployment is not the same thing as shipping
  the final generic root-bound non-membership architecture
