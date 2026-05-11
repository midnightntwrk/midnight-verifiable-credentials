# Midnight VC Test Matrix

Status: current implemented test surface as of 2026-05-11.

## Core package tests

- `core/primitives/credentials/src/test/proof-context.test.ts`
  - proof challenge/context separation
- `core/primitives/credentials/src/test/protocol-envelope.test.ts`
  - protocol envelope threading and validation
- `core/primitives/credentials/src/test/secret-holder-binding.test.ts`
  - secret holder-binding primitives
- `core/primitives/credentials/src/test/lightweight-holder-binding.test.ts`
  - legacy Jubjub and Compact-side offchain holder-binding checks
- `core/primitives/credentials/src/test/package-surfaces.test.ts`
  - exported package surfaces
- `core/primitives/credentials/src/test/offchain-did-holder-binding-alias.test.ts`
  - public TypeScript alias compatibility for `OffchainDIDHolderBinding`

## DID-aware adapter package tests

### `credentials-offchain-did`

- `components/adapters/offchain-did/src/test/offchain-did-holder-binding.test.ts`
  - offchain DID runtime helper behavior
- root `./run.sh hello-smoke` lane
  - keeps the DID-aware starter handoff runnable with `hello-family` and
    `hello-verifier`

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
- status-binding commitment tests
- authority-attested status verification tests
- revoked-set status request wiring and hard-revocation rejection tests
- same-holder composition tests
- blinded-secret issuance offer/request/result validation through
  `credentials-protocol`

### `credentials-hello-family`

- claim-root/domain-separation source checks
- presentation-request source-shape checks
- package export-surface checks
- real Compact compiler probes for currently supported versus unsupported
  primitive claim types
- root `./run.sh hello-smoke` lane
  - keeps the starter DID -> VC -> verifier handoff runnable from one repo
    command

### Planned prototype restoration

- `credentials-birth-binding-prototypes`
  - no checked-in source package or validated test surface on `develop`
  - future restoration should reintroduce explicit binding-matrix coverage

## Credential status / revocation tests

Current repository stance:

- prototype status/revocation surfaces now exist, but the repository still does
  not claim final production-ready non-revocation proofs

Implemented prototype coverage:

- `registry/status-registry/src/test/status-capability.test.ts`
  - status registry refs
  - revoked-set capability validation
  - authority-attested capability validation
  - deterministic revoked-set status-handle derivation
- `registry/status-registry/src/test/status-policy.test.ts`
  - verifier status policy validation and registry binding checks
  - rejection of optional or internally inconsistent status policies
- `registry/status-registry/src/test/witness-builder.test.ts`
  - deterministic status-handle derivation
  - revoked-set witness/capability construction
  - same-contract live-status witness construction
  - verifier policy compatibility checks
  - revoked snapshot rejection
- `registry/status-registry/src/test/attestation-builder.test.ts`
  - verifier-supplied status request construction
  - authority attestation statement and proof construction
  - request-bound status attestation payload construction
- `registry/status-registry/src/test/registry-state-observation.test.ts`
  - observed snapshot freshness normalization
  - minimum-version enforcement over observed snapshots
- `registry/status-registry/src/test/revocation-registry.test.ts`
  - registry initialization
  - double-init / zero-id / unset-sentinel rejection
  - registry/state binding semantics
  - append-only revocation bookkeeping
  - current prototype root-binding limitation disclosure
  - live contract-version binding after revoke
- `registry/status-registry/src/test/status-proof-protocol.test.ts`
  - registry-facing proof-protocol validation ownership
  - request/binding consistency checks
  - authority-attested proof acceptance and rejection paths
  - verifier policy compatibility for revoked-set and authority-attested flows
- `registry/status-registry/src/test/status-verifier-classification.test.ts`
  - canonical status-error classification over representative raw Compact/demo
    throw messages
  - preservation of typed helper causes through normalized verifier errors
  - plain-data failure-record projection for adapters and use-case tests
  - fail-closed fallback to `unclassifiedFailure` for unknown throw shapes
- `registry/status-registry/src/test/status-verifier-parity.test.ts`
  - cross-mode parity for canonical error codes across observed-snapshot,
    same-contract live-state, and authority-attested verifier paths
  - current parity coverage for `unknownRegistry`, `staleRegistryState`, and
    `unsupportedStatusProofMode`
- `prototypes/credential-families/birth-secret/src/test/status.test.ts`
  - hidden-holder same-contract live-status request wiring
  - hidden-holder revoked-set status request wiring
  - hard rejection when accepted revoked snapshots already contain the
    credential status handle
- `prototypes/credential-families/birth-secret/src/test/status-attestation.test.ts`
  - hidden-holder authority-attested status verification
  - verification-request challenge / status-request challenge consistency
  - verifier-root mismatch rejection
  - attestation expiry rejection
- `prototypes/credential-families/birth-secret/src/test/status-binding-commitment.test.ts`
  - native status-aware credential binding/body-root regression coverage

## Transport/domain tests

### `credentials-openid`

- Compact payload codec tests
- OID4VCI-shaped schema tests
- OID4VP-shaped schema tests

## Protocol/orchestration tests

### `credentials-protocol`

- explicit-holder issuance/presentation/full lifecycle
- Node/file-backed production-reference path:
  - stable JSON codec round-trip and file-backed persistence coverage
  - explicit-holder restart-safe credential recovery with crypto randomness
  - secret-holder presentation replay across verifier restart with crypto
    randomness and retained finalized outcomes
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
  - same-contract live-status hidden-holder status path
  - verifier-supplied-root hidden-holder status path
  - authority-attested hidden-holder status path
  - hard rejection when accepted status evidence already says the credential is
    revoked
  - canonical status-error-code normalization for representative negative-path
    failures across live, observed, and authority-attested modes
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
  - `use-cases/age-gate/scenarios`
- smoke scenarios:
  - `use-cases/age-gate/scenarios/features/age_gate_happy_path.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_age_gate_happy_path.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_live_status_happy_path.feature`
- negative scenarios:
  - `use-cases/age-gate/scenarios/features/hidden_holder_live_status_revoked.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_wrong_registry.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_wrong_root.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_stale_snapshot.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_stale_authority_attestation.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_wrong_authority.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_unsupported_authority_mode.feature`
  - `use-cases/age-gate/scenarios/features/hidden_holder_revoked_credential.feature`
- root commands:
  - `npm run test:bdd:smoke`
  - `npm run test:bdd:negative`
  - `npm run test:bdd:all`
  - `./run.sh bdd`
  - `./run.sh bdd-negative`
  - `./run.sh bdd-all`
- purpose:
  - living-documentation scenario coverage for the current VC prototype
- current scope:
  - non-Docker birth-credential age-gate happy path
  - non-Docker hidden-holder verifier-supplied-root age-gate happy path
  - non-Docker hidden-holder same-contract live-status age-gate happy path
  - non-Docker hidden-holder negative-path trust-boundary coverage for
    live-status local-revocation, wrong-registry, wrong-root,
    stale-snapshot, stale-attestation, wrong-authority,
    unsupported-authority-mode, and revoked-credential failures
- local report:
  - `use-cases/age-gate/scenarios/target/site/serenity/index.html`

## Standalone integration tests

Docker-backed integration runs currently exist in:

- `credentials-demo-contract`
- `credentials-protocol`

Executed through:

```bash
./run.sh
```

or directly through package-level `test:integration` commands when Docker is available.

## Repository Runner Targets

`./run.sh` now exposes the main repository lanes directly:

- `./run.sh`
  - full repository validation
- `./run.sh --light`
  - light repository validation
- `./run.sh lint`
  - package-boundary + lint lane
- `./run.sh typecheck`
  - typecheck lane
- `./run.sh build`
  - build lane
- `./run.sh test`
  - non-Docker package tests
- `./run.sh bdd`
  - Serenity/JS BDD smoke lane
- `./run.sh bdd-negative`
  - Serenity/JS BDD negative lane
- `./run.sh bdd-all`
  - full Serenity/JS BDD lane
- `./run.sh revocation`
  - revocation-focused CI lane
- `./run.sh integration-demo-contract`
  - standalone demo-contract integration only
- `./run.sh integration-protocol`
  - standalone protocol integration only
- `./run.sh integration`
  - both standalone integration lanes
- `./run.sh targets`
  - prints the supported target list

In addition to the wrapper targets above, `./run.sh` now accepts any root
`package.json` script directly. Useful examples:

- `./run.sh build:core`
- `./run.sh build:cone:age-gate`
- `./run.sh ci:package-tests`
- `./run.sh artifacts:pack`
