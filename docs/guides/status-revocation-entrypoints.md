# Status and Revocation Entry Points

Use this page when you need to understand where credential status,
revocation, freshness, and non-revocation proof work lives in this repository.

## Fast Path

Start from these files, in this order:

1. [`../spec/credential-status.md`](../spec/credential-status.md)
   - defines status support levels, verifier obligations, and the fail-closed
     rule that a revoked credential is invalid.
2. [`../spec/revocation-registry.md`](../spec/revocation-registry.md)
   - defines the prototype revoked-set registry model and why the registry
     tracks revoked handles instead of active credentials.
3. [`../spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)
   - defines how verifiers, holders, and Layer 3 contracts coordinate accepted
     registry roots and status evidence.
4. [`../../packages/registry/status-registry/README.md`](../../packages/registry/status-registry/README.md)
   - documents the shipped Compact and TypeScript helper package.
5. [`../architecture/status-verification-modes.md`](../architecture/status-verification-modes.md)
   - compares same-contract live status, verifier-side live checks, and
     authority-attested Layer 3 status checks.

## Ownership Map

| Concern                                                       | Owner                     | Start Here                                                                                                                                         |
| ------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status terminology, support levels, and fail-closed semantics | Spec                      | [`credential-status.md`](../spec/credential-status.md)                                                                                             |
| Revoked-set registry model                                    | Spec and registry package | [`revocation-registry.md`](../spec/revocation-registry.md)                                                                                         |
| Verifier-supplied root and protocol handoff rules             | Spec                      | [`status-verification-protocol.md`](../spec/status-verification-protocol.md)                                                                       |
| Compact registry surface                                      | Registry package          | [`packages/registry/status-registry/src/revocation-registry.compact`](../../packages/registry/status-registry/src/revocation-registry.compact)     |
| Registry-facing proof protocol types                          | Registry package          | [`packages/registry/status-registry/src/status-proof-protocol.compact`](../../packages/registry/status-registry/src/status-proof-protocol.compact) |
| Off-chain witness, attestation, and verifier helpers          | Registry package          | [`packages/registry/status-registry/src`](../../packages/registry/status-registry/src)                                                             |
| Family-level status integration example                       | Birth secret family       | [`../../packages/prototypes/credential-families/birth-secret/README.md`](../../packages/prototypes/credential-families/birth-secret/README.md)     |
| Contract demo status lane                                     | Age-gate demo contract    | [`../../packages/use-cases/age-gate/contract/README.md`](../../packages/use-cases/age-gate/contract/README.md)                                     |

## Current Implementation Stance

The repository has a usable prototype status stack, not a final production
revocation implementation.

Implemented today:

- status binding vocabulary in the core credentials package
- registry-bound status helper types and builders
- revoked-set registry Compact surface
- observed-root and live-contract-state helper paths
- authority-attested status proof helpers
- fail-closed status verifier helpers
- status-aware family and contract examples

Not final yet:

- in-circuit proof that an externally supplied root is the latest live registry
  root
- production governance for delegated status authorities
- final privacy-preserving non-membership implementation for every credential
  family
- status-list fallback semantics

The current rule is deliberate: the verifier or orchestrating application
chooses the accepted registry state, the holder proves status evidence against
that state, and the verifier or business contract fails closed when accepted
evidence says the credential is revoked.

## Which Mode Should I Use?

Use same-contract live status when the business contract can access the same
registry state that it verifies against. This is the strongest current local
prototype seam.

Use verifier-side live-state status when status can be checked before an
optional business-contract call. This is the clearest path for off-chain
verifiers and integration tests.

Use authority-attested Layer 3 status when a Layer 3 contract must consume
status evidence from an external registry domain. Treat this as a transitional
prototype path until direct live-root binding is available.

Use `NoStatusBinding` when a family is intentionally non-revocable. Document
that choice in the family README instead of leaving status semantics implicit.

## Validation

For a status/revocation change, run the narrowest relevant lane first:

```bash
./run.sh revocation
pnpm --dir ./packages/registry/status-registry run test:ci
```

Before PR review, run the documentation and integration checks:

```bash
pnpm run docs:links
./run.sh integration-report
./run.sh check-integration
```

Run the full light lane when the change touches shared package wiring:

```bash
./run.sh --light
```
