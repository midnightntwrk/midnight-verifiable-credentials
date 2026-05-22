# Midnight VC Test Matrix

Status: current implemented test surface as of 2026-05-11.

University-specific run targets, light-artifact profiles, and retained summary
artifacts are tracked in
[`../../packages/use-cases/university/ci-matrix.md`](../../packages/use-cases/university/ci-matrix.md).

## Core package tests

- `packages/core/primitives/credentials/src/test/proof-context.test.ts`
  - proof challenge/context separation
- `packages/core/primitives/credentials/src/test/protocol-envelope.test.ts`
  - protocol envelope threading and validation
- `packages/core/primitives/credentials/src/test/secret-holder-binding.test.ts`
  - secret holder-binding primitives
- `packages/core/primitives/credentials/src/test/lightweight-holder-binding.test.ts`
  - legacy Jubjub and Compact-side offchain holder-binding checks
- `packages/core/primitives/credentials/src/test/package-surfaces.test.ts`
  - exported package surfaces
- `packages/core/primitives/credentials/src/test/offchain-did-holder-binding-alias.test.ts`
  - public TypeScript alias compatibility for `OffchainDIDHolderBinding`

## DID-aware adapter package tests

### `credentials-offchain-did`

- `packages/components/adapters/offchain-did/src/test/offchain-did-holder-binding.test.ts`
  - offchain DID runtime helper behavior
- root `./run.sh hello-smoke` lane
  - keeps the DID-aware starter handoff runnable with `hello-family` and
    `hello-verifier`
  - root `./run.sh hello-smoke --light` and `ci:hello-smoke:from-artifacts`
    now keep the same path honest against restored build artifacts
  - see `docs/guides/did-vc-hello-smoke-path.md` for the authoritative lane
    description

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
  - see `docs/guides/did-vc-hello-smoke-path.md` for the authoritative lane
    description

### `hello-verifier` starter package

- `packages/use-cases/hello-verifier/contract/src/test/hello-verifier.test.ts`
  - explicit-holder starter verifier over `credentials-hello-family`
  - offchain-DID starter verifier over `credentials-hello-family`
- `packages/use-cases/hello-verifier/contract/src/test/dummy-claims-verifier.test.ts`
  - full-disclosure verifier over `credentials-dummy-claims`
  - negative coverage for omitted direct, nested-field, nested-vector, and
    challenge-mismatch cases

### `credentials-dummy-claims`

- claim-root/domain-separation source checks
- presentation-request source-shape checks
- package export-surface checks
- deterministic fixture-backed selective-disclosure verification across:
  - supported direct primitive fields
  - supported direct vector fields
  - nested selective disclosures
  - nested vector all-or-nothing disclosures
- negative validation guards for:
  - request challenge presence
  - credential claim-root integrity
  - holder-binding mismatch
  - request/proof challenge mismatch
- root `./run.sh dummy-claims-lab` lane
  - keeps the family-level selective-disclosure lab and verifier-level lab contract
    path runnable from one repo command
  - see `docs/guides/dummy-claims-verifier-lab.md` for the authoritative lane
    description

### `credentials-mixed-claims`

- claim-root/domain-separation source checks
- public/direct and private/committed claim-shape checks
- presentation-request source-shape checks
- package export-surface checks
- source guards for:
  - public claims mirrored in the presentation and matched against the signed
    credential claims
  - private subject-id and birth-date disclosures opening credential
    commitments
  - account-tier predicate witness opening the credential commitment before the
    threshold check

### `credentials-university-diploma`

- claim-root/domain-separation source checks
- presentation-request source-shape checks
- package export-surface checks
- deterministic fixture-backed selective-disclosure verification across:
  - company-style disclosure requirements
  - hidden academic fields when the verifier does not ask for them
  - mall-style minimum-grade verification
- privacy-boundary fixture checks that prove hidden presentation fields are
  still direct credential-body claims in the current prototype
- production-profile commitment checks that prove the intended v2 field split,
  per-field commitment openings, and domain-separated claim root
- the current v1 minimum-grade check still uses direct final-grade disclosure;
  the commitment-backed predicate witness remains a follow-up production slice
- negative validation guards for:
  - missing verifier challenge
  - request version drift
  - schema-ref drift
  - request/proof challenge mismatch
  - minimum-grade misconfiguration
  - disclosed-field tampering
  - credential claim-root tampering
  - holder-binding mismatch

### `university-verifier-contract`

- `packages/use-cases/university/contract/src/test/university-verifier.test.ts`
  - employer-style request construction and presentation verification
  - mall discount request construction and threshold verification
  - direct-request invariant rejection for the employer path
  - below-threshold rejection for the mall path
  - required-disclosure rejection for the mall path

### `university-protocol`

- `packages/use-cases/university/protocol/src/test/full-flow.test.ts`
  - threaded message-level student-initiated issuance over 10 students
  - threaded job-application request / submission / result flow over 3 companies
  - threaded mall discount request / submission / result flow over 5 applicants
  - transcript-level policy semantics for company-specific disclosure requests
  - thread integrity between requests and their corresponding results
- `packages/use-cases/university/protocol/src/test/duplicate-flow.test.ts`
  - duplicate job-application submission rejection
  - duplicate mall discount submission rejection
- `packages/use-cases/university/protocol/src/test/negative-flow.test.ts`
  - malformed verifier request policy rejection
  - no collateral acceptance loss outside the targeted cohort
- `packages/use-cases/university/protocol/src/test/tampered-flow.test.ts`
  - credential claim-root tampering rejection
  - verifier-challenge tampering rejection
  - issuer verification-method tampering rejection
  - no collateral acceptance loss outside the targeted student
- `packages/use-cases/university/protocol/src/test/holder-binding-flow.test.ts`
  - holder DID contract tampering rejection
  - holder method-reference tampering rejection
  - proof-signer DID contract tampering rejection
  - proof-signer method-reference tampering rejection
  - no collateral acceptance loss outside the targeted student
- `packages/use-cases/university/protocol/src/test/issuance-idempotency.test.ts`
  - replayed issuance-request counting
  - idempotent duplicate-request handling
  - one-credential-per-student guarantee under request replay
- `packages/use-cases/university/protocol/src/test/export.test.ts`
  - stable JSON transcript export
  - stable Markdown transcript export
  - golden-file normalization over thread ids and verifier challenge hashes
- `packages/use-cases/university/protocol/src/test/export-schema.test.ts`
  - explicit transcript schema id/version contract
  - runtime conformance validation over the live export and golden export
  - negative coverage for unsupported schema ids, versions, and reader
    compatibility windows
- `packages/use-cases/university/protocol/src/test/stress-export.test.ts`
  - stable 100-student stress-summary schema
  - normalized JSON and Markdown stress artifacts
  - explicit retention-hint contract for CI publication
- `packages/use-cases/university/reporting/src/test/report-summary.test.ts`
  - stable one-page JSON summary over Serenity, transcript-export, stress, and
    batch-sweep artifacts
  - stable one-page Markdown digest over the same artifact set
  - runtime conformance validation for the reporting schema
  - latest-run deduplication by Serenity scenario title

### University executable BDD specs

- `packages/use-cases/university/scenarios/features/university_diploma_batch_issuance.feature`
  - executable student-initiated batch issuance flow for 10 students
  - explicit duplicate issuance-request replay scenario with readable report
    counters for idempotent handling
- `packages/use-cases/university/scenarios/features/university_diploma_job_application.feature`
  - executable employer verification flow across 3 companies
- `packages/use-cases/university/scenarios/features/university_diploma_discount.feature`
  - executable mall discount flow with mixed grade outcomes
- `packages/use-cases/university/scenarios/features/university_diploma_negative_flows.feature`
  - executable malformed-policy, duplicate-thread, and tampered-diploma
    scenarios with readable per-step failure explanations
  - executable holder-binding and proof-signer mismatch scenarios with readable
    per-step failure explanations
- root `./run.sh university-batch-sweep` lane
  - sweeps issuance batch sizes over deterministic university fixtures
  - emits stable JSON and Markdown benchmark summaries
  - remains issuance-only so its timing summaries exclude company and mall
    verification phases
- root `./run.sh university-summary` lane
  - regenerates the readable BDD, transcript export, stress, and batch-sweep
    artifacts, then emits a one-page JSON/Markdown summary
  - `./run.sh university-summary --light` reuses the existing university
    artifact set when available and only rebuilds the reporting package itself
- root `./run.sh university-data-profiles` lane
  - validates the committed `readable-10`, `cohort-30`, and `stress-100`
    university data profiles against the shared generator registry
- root `./run.sh university-protocol-cohort` lane
  - executes the 30-student, 6-company university protocol profile
  - emits JSON/Markdown summary artifacts with sampled transcript views so
    reviewer-facing output stays readable while the profile exercises richer
    actor and policy diversity
- coverage boundary:
  - these scenarios run as one-process virtual-agent orchestration with metrics
  - issuance still uses the local batch harness for richer issuance-stage
    metrics
  - job-application and mall-discount flows now consume the threaded
    `university-protocol` transcript directly
  - they do not yet model real multi-process or networked party isolation
  - the separate `university-protocol` package remains the authoritative
    request/result message harness for the same actors and data

### Historical placeholder package names

- `credentials-birth-binding-prototypes`
  - not a checked-in workspace package on `develop`
  - if restored later, it should bring back explicit binding-matrix coverage

## Credential status / revocation tests

Current repository stance:

- prototype status/revocation surfaces now exist, but the repository still does
  not claim final production-ready non-revocation proofs

Implemented prototype coverage:

- `packages/registry/status-registry/src/test/status-capability.test.ts`
  - status registry refs
  - revoked-set capability validation
  - authority-attested capability validation
  - deterministic revoked-set status-handle derivation
- `packages/registry/status-registry/src/test/status-policy.test.ts`
  - verifier status policy validation and registry binding checks
  - rejection of optional or internally inconsistent status policies
- `packages/registry/status-registry/src/test/witness-builder.test.ts`
  - deterministic status-handle derivation
  - revoked-set witness/capability construction
  - same-contract live-status witness construction
  - verifier policy compatibility checks
  - revoked snapshot rejection
- `packages/registry/status-registry/src/test/attestation-builder.test.ts`
  - verifier-supplied status request construction
  - authority attestation statement and proof construction
  - request-bound status attestation payload construction
- `packages/registry/status-registry/src/test/registry-state-observation.test.ts`
  - observed snapshot freshness normalization
  - minimum-version enforcement over observed snapshots
- `packages/registry/status-registry/src/test/revocation-registry.test.ts`
  - registry initialization
  - double-init / zero-id / unset-sentinel rejection
  - packages/registry/state binding semantics
  - append-only revocation bookkeeping
  - current prototype root-binding limitation disclosure
  - live contract-version binding after revoke
- `packages/registry/status-registry/src/test/status-proof-protocol.test.ts`
  - registry-facing proof-protocol validation ownership
  - request/binding consistency checks
  - authority-attested proof acceptance and rejection paths
  - verifier policy compatibility for revoked-set and authority-attested flows
- `packages/registry/status-registry/src/test/status-verifier-classification.test.ts`
  - canonical status-error classification over representative raw Compact/demo
    throw messages
  - preservation of typed helper causes through normalized verifier errors
  - plain-data failure-record projection for adapters and use-case tests
  - fail-closed fallback to `unclassifiedFailure` for unknown throw shapes
- `packages/registry/status-registry/src/test/status-verifier-parity.test.ts`
  - cross-mode parity for canonical error codes across observed-snapshot,
    same-contract live-state, and authority-attested verifier paths
  - current parity coverage for `unknownRegistry`, `staleRegistryState`, and
    `unsupportedStatusProofMode`
- `packages/prototypes/credential-families/birth-secret/src/test/status.test.ts`
  - hidden-holder same-contract live-status request wiring
  - hidden-holder revoked-set status request wiring
  - hard rejection when accepted revoked snapshots already contain the
    credential status handle
- `packages/prototypes/credential-families/birth-secret/src/test/status-attestation.test.ts`
  - hidden-holder authority-attested status verification
  - verification-request challenge / status-request challenge consistency
  - verifier-root mismatch rejection
  - attestation expiry rejection
- `packages/prototypes/credential-families/birth-secret/src/test/status-binding-commitment.test.ts`
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
- root `ci:hello-smoke:from-artifacts`
  - lint, restored-artifact typecheck, and restored-artifact tests across:
    - `credentials-offchain-did`
    - `credentials-hello-family`
    - `hello-verifier`
- GitHub Actions job:
  - `Hello Smoke Lane`
- docs-only PR fast path:
  - `Classify Changes` + `Docs-only Validation`
  - skips Compact setup, build, unit, and integration lanes when every changed
    file is documentation-only

## Serenity/JS BDD scenarios

- package:
  - `packages/use-cases/age-gate/scenarios`
- smoke scenarios:
  - `packages/use-cases/age-gate/scenarios/features/age_gate_happy_path.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_age_gate_happy_path.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_live_status_happy_path.feature`
- negative scenarios:
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_live_status_revoked.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_wrong_registry.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_wrong_root.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_stale_snapshot.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_stale_authority_attestation.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_wrong_authority.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_unsupported_authority_mode.feature`
  - `packages/use-cases/age-gate/scenarios/features/hidden_holder_revoked_credential.feature`
- root commands:
  - `npm run test:bdd:smoke`
  - `npm run test:bdd:negative`
  - `npm run test:bdd:all`
  - `./run.sh bdd`
  - `./run.sh bdd-negative`
  - `./run.sh bdd-all`
  - `./run.sh hello-smoke`
  - `./run.sh hello-smoke --light`
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
  - `packages/use-cases/age-gate/scenarios/target/site/serenity/index.html`
- CI handoff artifact:
  - BDD-only PRs run the age-gate smoke and university BDD lanes, then upload
    `bdd-summary-artifacts` with Cucumber JSON plus `target/summary.json` and
    `target/summary.md` so failures can be inspected without downloading the
    full Serenity site first.

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
  - currently honored by:
    - `./run.sh`
    - `./run.sh build`
    - `./run.sh typecheck`
    - `./run.sh test`
    - `./run.sh hello-smoke`
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
