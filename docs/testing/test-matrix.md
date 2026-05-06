# Midnight VC Test Matrix

Status: current implemented test surface as of 2026-05-05.

## Core package tests

- `credentials/src/test/proof-context.test.ts`
  - proof challenge/context separation
- `credentials/src/test/protocol-envelope.test.ts`
  - protocol envelope threading and validation
- `credentials/src/test/secret-holder-binding.test.ts`
  - secret holder-binding primitives
- `credentials/src/test/lightweight-holder-binding.test.ts`
  - legacy Jubjub and Compact-side offchain holder-binding checks
- `credentials/src/test/package-surfaces.test.ts`
  - exported package surfaces
- `credentials/src/test/offchain-did-holder-binding-alias.test.ts`
  - public TypeScript alias compatibility for `OffchainDIDHolderBinding`

## DID-aware adapter package tests

### `credentials-offchain-did`

- `credentials-offchain-did/src/test/offchain-did-holder-binding.test.ts`
  - offchain DID runtime helper behavior

## Credential family tests

### `credentials-birth`

- holder-binding tests
- age predicate tests
- capability profile tests
- protocol tests
- exported `./testing` fixture surface compatibility

### `credentials-birth-secret`

- holder-binding tests
- age predicate tests
- capability profile tests
- same-holder composition tests
- blinded-secret issuance offer/request/result validation through
  `credentials-protocol`

### Planned prototype restoration

- `credentials-birth-binding-prototypes`
  - no checked-in source package or validated test surface on `develop`
  - future restoration should reintroduce explicit binding-matrix coverage

## Credential status / revocation tests

Current repository stance:

- prototype status/revocation surfaces now exist, but the repository still does
  not claim final production-ready non-revocation proofs

Implemented prototype coverage:

- `credentials/src/test/status-capability.test.ts`
  - status registry refs
  - revoked-set capability validation
  - authority-attested capability validation
  - deterministic revoked-set status-handle derivation
- `credentials/src/test/status-policy.test.ts`
  - verifier status policy validation and registry binding checks
  - rejection of optional or internally inconsistent status policies
- `credentials/src/test/status-attestation.test.ts`
  - request-bound authority attestation validation
  - verifier challenge binding through the full policy path
  - authority signer binding
  - wrong-authority rejection through the full policy path
  - revoked-root mismatch rejection
  - attestation expiry rejection
- `credentials-status-registry/src/test/witness-builder.test.ts`
  - deterministic status-handle derivation
  - revoked-set witness/capability construction
  - verifier policy compatibility checks
  - revoked snapshot rejection
- `credentials-status-registry/src/test/attestation-builder.test.ts`
  - verifier-supplied status request construction
  - authority attestation statement and proof construction
  - request-bound status attestation payload construction
- `credentials-status-registry/src/test/revocation-registry.test.ts`
  - registry initialization
  - double-init / zero-id / unset-sentinel rejection
  - registry/state binding semantics
  - append-only revocation bookkeeping
  - current prototype root-binding limitation disclosure
- `credentials-status-registry/src/test/status-proof-protocol.test.ts`
  - registry-facing proof-protocol validation ownership
  - request/binding consistency checks
  - authority-attested proof acceptance and rejection paths
  - verifier policy compatibility for revoked-set and authority-attested flows
- `credentials-birth-secret/src/test/status.test.ts`
  - hidden-holder revoked-set status request wiring
- `credentials-birth-secret/src/test/status-attestation.test.ts`
  - hidden-holder authority-attested status verification
  - verification-request challenge / status-request challenge consistency
  - verifier-root mismatch rejection
  - attestation expiry rejection

## Transport/domain tests

### `credentials-openid`

- Compact payload codec tests
- OID4VCI-shaped schema tests
- OID4VP-shaped schema tests

## Protocol/orchestration tests

### `credentials-protocol`

- explicit-holder issuance/presentation/full lifecycle
- secret-holder issuance/presentation
  - Compact offer/request/result validation in unit tests
  - negative-path coverage for malformed offer/request/result issuance messages
  - injectable randomness coverage for explicit-holder and blinded-secret
    reference flows
  - injectable protocol state-store coverage for blinded-secret issuance and
    presentation reference flows
  - codec-backed protocol state-store coverage for blinded-secret presentation
    replay across verifier recreation
  - helper-level finalized-outcome retention coverage for TTL expiry and
    bounded-count eviction
  - explicit blinded-secret issuance rejection messages in the reference
    protocol layer for malformed requests, offer/request mismatches, unknown
    offer references, expired offers, and expired requests
  - idempotent re-delivery of duplicate blinded-secret issuance requests and
    duplicate blinded-secret issuance outcomes
  - explicit blinded-secret presentation rejection messages in the reference
    protocol layer for malformed submissions, request/submission mismatches,
    unsatisfied verifier requests, expired requests, and expired submissions
  - idempotent re-delivery of duplicate blinded-secret presentation
    submissions and duplicate presentation outcomes
  - re-evaluation of finalized presentation submissions after retention expiry
  - holder-side rejection of uncorrelated presentation outcomes
  - holder-side rejection of uncorrelated issuance outcomes
  - agent-boundary rejection of forged issuance results
  - real DID-backed secret-holder lifecycle integration
- verifier-domain pseudonym flows
- same-holder flows
- contract-verifier capability lifecycle
- contract-verifier age-gate flows

## Demo contract tests

### `credentials-demo-contract`

- local/unit verifier contract tests
- local/unit revocation demo contract tests:
  - verifier-supplied-root hidden-holder status path
  - authority-attested hidden-holder status path
  - reusable capability lifecycle under revocation-aware verification
- standalone integration test:
  - issuance-verification lifecycle

Current gap:

- no standalone integration test yet for the revocation-aware demo contract

## Focused CI lanes

- root `ci:lint`
  - includes `check:package-boundaries`
  - blocks sibling `../<package>/src/...` imports in repository validation

- root `ci:revocation`
  - lint, typecheck, build, and test the current revocation slice across:
    - `credentials`
    - `credentials-status-registry`
    - `credentials-same-holder`
    - `credentials-birth`
    - `credentials-birth-secret`
    - `credentials-demo-contract`
- GitHub Actions job:
  - `Revocation Demo Lane`
- docs-only PR fast path:
  - `Classify Changes` + `Docs-only Validation`
  - skips Compact setup, build, unit, and integration lanes when every changed
    file is documentation-only

## Serenity/JS BDD scenarios

- package:
  - `vc-bdd-scenarios`
- current smoke scenarios:
  - `vc-bdd-scenarios/features/age_gate_happy_path.feature`
  - `vc-bdd-scenarios/features/hidden_holder_age_gate_happy_path.feature`
- root command:
  - `npm run test:bdd:smoke`
- purpose:
  - living-documentation scenario coverage for the current VC prototype
- current scope:
  - non-Docker birth-credential age-gate happy path
  - non-Docker hidden-holder verifier-supplied-root age-gate happy path

## Standalone integration tests

Docker-backed integration runs currently exist in:

- `credentials-demo-contract`
- `credentials-protocol`

Executed through:

```bash
./run.sh
```

or directly through package-level `test:integration` commands when Docker is available.
