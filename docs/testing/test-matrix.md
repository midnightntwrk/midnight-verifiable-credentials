# Midnight VC Test Matrix

Status: current implemented test surface as of 2026-07-17.

Quality measurements and infrastructure gaps are tracked separately in
[`quality-evidence.md`](./quality-evidence.md) and the machine-checked
[`quality-evidence.json`](./quality-evidence.json). This matrix is an inventory
of test surfaces; it does not claim that every listed lane has been run for the
current base.

University-specific run targets, light-artifact profiles, and retained summary
artifacts are tracked in
[`../../packages/use-cases/university/ci-matrix.md`](../../packages/use-cases/university/ci-matrix.md).

## Core package tests

- `packages/core/compact/src/test/package-surfaces.test.ts`
  - canonical standalone and shared composition exports
- `packages/core/compact/src/test/compatibility-facade-equivalence.test.ts`
  - byte equivalence for every intentionally shared compatibility-facade source
  - negative mutation proof that facade semantic drift is detected
  - explicit exclusion of legacy verification/status extensions from canonical ownership
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
- `packages/core/primitives/credentials/src/test/verification-v1.test.ts`
  - authoritative Compact/runtime digest vectors for every core-owned
    verification V1 record and one synthetic extension
  - request-, holder-action-, and credential-action replay-scope/nullifier
    parity plus malformed scope, policy, deployment, and binding rejection
  - direct Compact-path mutation coverage over all 47 transcript fields
  - fail-closed public-input, enum, evidence, result-state, and adapter behavior
- `packages/core/proofs/src/test/authority-evidence.test.ts`
  - issuer, holder, verifier, and status keys bound to profile-selected DID
    method/relationship/network/state/lifecycle and trust scope/epoch evidence
  - positive active replacement-key rotation and negative copied-reference
    attacker key, wrong relationship/network/version, rotated/revoked/deactivated,
    wrong scope/epoch, suspended/withdrawn, unauthenticated, missing, and provider
    unavailable vectors
  - canonical evidence identity/observation-time transcript and holder-witness exclusion
- `packages/core/proofs/src/test/authority-bound-proof-verifier.test.ts`
  - proof verification cannot be upgraded by authority evidence and proof inputs/
    bytes are excluded from canonical authority results
- `packages/core/proofs/src/test/trusted-time.test.ts`
  - ledger/attested/local-reference authority labels, verifier-selected attestor
    policy substitution, full scope mutation, nested malformed/unavailable
    evidence, inclusive skew/age boundaries, future, expiry, stale, request-A
    sequence 10 to request-B sequence 9 rollback, and replay vectors
- `packages/registry/status-midnight-verifier/src/test/trusted-time-freshness.test.ts`
  - #496 status freshness consumes authoritative time and fails future, stale,
    expired, mismatched, malformed, and unavailable evidence closed
- `packages/registry/status-midnight-authority/src/test/authority-gate.test.ts`
  - nominally valid trusted-time adapters returning NaN, infinity, fractional,
    or negative values fail invalid without applying a status write
- `packages/use-cases/age-gate/contract/src/test/demo.test.ts` and
  `demo-revocation.test.ts`
  - Compact/runtime parity at exact second and Unix-day boundaries; caller day/time
    mutation, future request, credential/status expiry, and stale status rejection
  - explicit-holder decision-nullifier repeat/reorder/restart persistence,
    separate-prestate relay competition with compare-and-swap commit,
    verifier-issued request ID/challenge/expiry binding, cross-context and
    trusted-time/transcript mutation, retained duplicate/conflict outcomes,
    failed verification, and rolled-back transaction state

## DID-aware adapter package tests

### DID package compatibility

- `tooling/scripts/midnight-did-ledger-key-normalization.test.mjs`
  - vendored `midnight-did` `LedgerToDomain` emits x-only Ed25519/X25519 JWKs
    from opaque ledger strings and rejects non-empty OKP `y` values in DID
    package coverage
  - preserves Jubjub, P-256, and secp256k1 EC coordinates from opaque ledger
    strings
- `tooling/scripts/ensure-midnight-did-package-aliases.test.mjs`
  - DID package alias shim links root imports to vendored packages instead of
    carrying a generated split-byte `LedgerToDomain` fallback

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
- independently compiled standalone root and family-prefixed composable export

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
- package export-surface checks for standalone and family-prefixed composable roots
- real Compact compiler probes for currently supported versus unsupported
  primitive claim types
- root `./run.sh hello-smoke` lane
  - keeps the starter DID -> VC -> verifier handoff runnable from one repo
    command
  - see `docs/guides/did-vc-hello-smoke-path.md` for the authoritative lane
    description

### Two-family composition evidence

- `pnpm run check:compact-composition-surfaces`
  - compiles the canonical core exactly once with birth and hello-family
    composables
  - rejects shared-core includes and unprefixed VC/VP module aliases in family
    composables
  - reports zero proof circuits, `k` as not applicable, and no prover/verifier,
    ZKIR, or BZKIR artifacts
  - remains explicitly non-authoritative compile/composition evidence

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
- root `./run.sh university-report-contract` lane
  - builds the reporting package quietly and prints the versioned
    `midnight-university-report-summary.v5` contract JSON to stdout
  - verifies report consumers can inspect schema id/version, handoff artifact
    ids, source artifact ids, transcript schema, and required privacy-profile
    sections without regenerating report artifacts
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
- `packages/registry/status-midnight-contract/src/test/contract-state.test.ts`
  - domain-separated empty/singleton/multi-leaf authenticated-root vectors
  - root/version/audit receipt transitions without status-handle disclosure
- `packages/registry/status-midnight-verifier/src/test/authenticated-status.test.ts`
  - exact same-contract active/revoked lookup and state-root consistency
  - SHA-256 membership, empty/boundary/interior non-membership verification
  - #494 DID/trust authority-provider integration
  - omitted/unavailable/stale/forged and network/namespace/registry/deployment/root/version/authority/leaf/witness/profile mutation vectors
  - public versus challenge-scoped private transcript disclosure boundary
  - exact shared packed JSON vector parity for root/proof, #494 authority request, provider anchors, canonical transcript, and transcript digest
  - pinned Compact feasibility probe: `checkRoot(...)` compiled, while in-circuit `root()` and `pathForLeaf(...)` did not; no native non-membership proof is claimed
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
    protocol layer for malformed requests, wrapper/body correlation mismatches,
    offer/request mismatches, unknown offer references, expired offers, expired
    requests, and conflicting replayed requests
  - idempotent re-delivery of exact duplicate blinded-secret issuance requests
    and duplicate blinded-secret issuance outcomes
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
  - `pnpm run test:bdd:smoke`
  - `pnpm run test:bdd:negative`
  - `pnpm run test:bdd:all`
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

## Release package consumers

The package lane runs `pnpm run test:release-package-consumers` after producing
and auditing release-approved workspace tarballs. For every release candidate
or supported package it creates a
project outside the repository, installs only the copied tarball, and verifies:

- each package's declared Node ESM, strict TypeScript, legacy TypeScript,
  browser-bundle, and Compact checks;
- Compact compilation against installed package exports when the package
  exposes Compact sources; and
- absence of workspace links, sibling paths, repository paths, and
  install-time package hooks.

The temporary consumer is always removed. The lane is also part of
`pnpm run artifacts:pack`, `pnpm run ci:package-tests`, and `./run.sh --light`.

The manual npmjs workflow repeats the same matrix against the exact published
version after bounded registry-propagation polling. Registry mode rejects all
local locators, installs with lifecycle scripts disabled during dependency
resolution, verifies the resolved package version, and then runs every
cataloged consumer check.

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

## Family-neutral exchange and adapter boundaries

| Evidence | Contract |
| --- | --- |
| `packages/components/orchestration/exchange/src/test/injected-family-agents.test.ts` | The same issuer/holder/verifier orchestration runs with directly and runtime-injected family adapters; the public guard binds exact family/schema versions, rejects incomplete optional opening ports, cross-family messages fail before dispatch, and transport wrapping cannot grant validity. |
| `packages/components/orchestration/exchange/src/test/claim-opening-delivery.test.ts` | A synthetic committed-private adapter delivers only the exact requested openings; altered, missing, additional, malformed, wrong-recipient, and mutating-adapter material fails before storage; restart revalidates private records; public receipt/presentation snapshots contain no openings or raw private claims; the canonical credential bytes remain unchanged. |
| `packages/components/orchestration/exchange/src/test/authority-bound-verifier.test.ts` | Canonical VC/VP and request bytes are digest-bound to the reusable DID/trust authority transcript; family failures cannot be upgraded; arbitrary holder verification input is not forwarded to providers or retained in results. |
| Birth/birth-secret Compact protocol tests and `packages/components/orchestration/protocol/src/test/{explicit-holder,secret-holder}/issuance.test.ts` | Both retained committed-private families include shared private parts in issuance results, validate every opening against the credential, reject wrong-recipient or altered material before storage, persist through file-backed restart, and selectively recover requested fields. |
| `tooling/scripts/workspace-boundary-policy.test.mjs` | Family packages cannot depend on protocol, orchestration, or use-case workspaces; neutral exchange depends only on the family-neutral `credential-model` and `credential-proofs` packages. |
| `tooling/scripts/test-family-neutral-exchange-consumer.mjs` | Packed model/exchange tarballs install outside the workspace; a generic wallet module with no concrete-family import resolves an authenticated runtime provider, persists/restarts, selectively recovers an opening, and completes an injected lifecycle without exposing the opening to its verifier. |
| `packages/core/compact/src/test/compact-value-codec.test.ts` and OpenID compatibility tests | Protocol-neutral Compact value framing is canonical in `credential-compact` while the legacy OpenID export remains compatible. |

These tests do not claim final protocol conformance, package delivery, plugin
execution, or production trust-root policy.

## Runtime family resolution

| Evidence | Contract |
| --- | --- |
| `packages/core/model/src/test/runtime-family-resolver.test.ts` positive registry case | A V1 provider resolves an unknown-at-build-time family through the exact #492 composition graph, authenticated package/export and SHA-256 artifact metadata, and a consumer surface guard. |
| `packages/core/model/src/test/runtime-family-resolver.test.ts` negative cases | Unknown, unavailable, malformed, unsupported registry version, family/schema version mismatch, package/artifact tampering, incompatible composition, untrusted evidence, trust-service failure, and rejected surfaces return typed fail-closed results. |
| `tooling/fixtures/runtime-family-wallet-consumer/` | Wallet code stays family-neutral while a separately defined runtime provider supplies the authenticated adapter; unchanged agents consume only the resolved injection. |

## Versioned profile and deployment resolution

| Evidence | Contract |
| --- | --- |
| `packages/core/model/src/test/composition-resolver.test.ts` positive graph and admitted-value cases | Independently versioned semantic/deployment contracts and provider catalogs resolve exact package/export/Compact/circuit/artifact/provider/deployment/conformance identities. |
| `packages/core/model/src/test/composition-resolver.test.ts` structural/property-style negatives | Unknown and omitted fields, deployment-role omissions, unknown values, family/profile/assembly mismatches, provider capability gaps, package conflicts, and artifact gaps fail with stable paths. |
| `packages/core/model/src/test/composition-resolver.test.ts` ADR-0015 deny table | All mandatory denial codes are exercised, including hidden/private public-only verification, missing status proof, caller time with ledger authority, non-atomic side effects, disabled status edges, uncommitted authority, and untested combinations. |
| `tooling/fixtures/credential-model-consumer/node-esm.mjs` | A clean packed-package consumer validates and resolves a fixture composition using only package-root exports. |
| `tooling/profile-coverage/profile-coverage.test.mjs` and [`prototype-profile-coverage.md`](./prototype-profile-coverage.md) | Seven retained-prototype manifests validate and resolve through the same #492 contracts. Deterministic property checks prove every declared supported value and every allowed pair across explicitly independent axes, fixed-axis rationales/interactions, all mandatory higher-order rows, every deny-rule negative, exact evidence links, and generated-output drift. |

This evidence does not implement concrete authority mechanisms, assert
exhaustive Cartesian coverage, claim OpenID conformance, select production
use-case values, or promote same-holder reference evidence to production
authority.

## Verification V1 executors

| Evidence | Contract |
| --- | --- |
| `packages/core/primitives/credentials/src/test/verification-v1.test.ts` | The Compact and TypeScript paths hash the exact same ordered 47-field transcript; every field, enum, domain, binding, and unavailable-evidence mutation fails closed. |
| `packages/core/primitives/credentials/src/test/verification-v1-executors.test.ts` | Ledger-local, ledger-attested, and offchain-public produce valid/invalid/indeterminate parity while retaining distinct authority labels. Missing/throwing providers, submitted/included/reverted/unconfirmed transactions, stale/tampered transcript/evidence/receipt/time/status/artifact paths, public-only private inputs, and atomic nullifier/business mutation violations fail closed. Only independently confirmed successful committed observations produce ledger receipts. |
| `packages/use-cases/age-gate/contract/src/test/demo.test.ts` | The side-effecting Compact fixture recomputes the V1 transcript/nullifier and atomically commits nullifier plus protected mutation; retries, concurrency, restart, conflict, verifier failure, and rollback inspect final ledger state. |

Executor support is conditional on injected authoritative mechanisms. Missing
DID/trust, status, trusted-time, artifact, prover/verifier, network, ledger, or
confirmation providers remain bounded local-process indeterminate results.
OpenID behavior (#503) remains outside this surface.

## Aggregate Decision Set V1

| Evidence | Contract |
| --- | --- |
| `packages/core/model/src/test/aggregate-decision.test.ts` | Aggregate profiles are fixed to pair/triple cardinality, one exact authority, explicit same-holder policy, and either an explicit read-only all-`none` tuple or a contract-derived atomic ledger mutation. |
| `packages/core/primitives/credentials/src/test/aggregate-decision-family-fixtures.ts` | Distinct birth-secret and university-diploma fixture identities declare only privacy-safe aggregate authority evidence. |
| `packages/core/primitives/credentials/src/test/aggregate-decision-v1.test.ts` | Pair/triple child chains bind complete Verification V1 issuer/DID, trust, explicit no-status or enabled status, time, artifact, holder, result, request/action/replay, authority, transaction, and nullifier evidence. Compact/TypeScript vectors and deterministic ordering agree. Missing/stale/indeterminate/mixed/duplicate/mismatched inputs fail closed; hidden output snapshots retain only bounded classifications and digests. |
| `packages/core/capabilities/same-holder/src/test/aggregate-same-holder.test.ts` | Private pair witnesses derive the actual holder-binding digests and commit the exact aggregate child set before a scoped public proof-receipt statement is emitted; snapshots exclude secrets/openings. Existing standalone same-holder suites remain non-authoritative composition evidence. |
| `packages/core/primitives/credentials/src/test/aggregate-decision-v1.test.ts` executor cases | Fabricated child receipts and forged same-holder receipts fail authentication; prepared-record rehashes, malformed observations, and confirmation mutation return bounded failures. Unavailable evidence stays indeterminate while stale evidence is invalid. Read-only commits use no mutation; approved side effects require exact atomic nullifier consumption; replay is a committed idempotent no-op. |

The aggregate remains bounded to two or three children. It does not define
OpenID #503 behavior, a dynamic Merkle set, cross-chain consensus, or
product-specific policy.

## Artifact and deployment authority parity

| Evidence | Contract |
| --- | --- |
| `packages/core/model/src/test/composition-resolver.test.ts` | Profile resolution requires exact build/deployment manifest digests, artifact ID/version/length/SHA-256/signer, circuit/profile versions, and immutable deployment/network identities; omitted and cross-graph identities fail closed. |
| `packages/core/proofs/src/test/artifact-authority.test.ts` | Existing signed manifest primitives verify exact bytes, signer, profile/circuit/artifact/deployment/network/version/freshness identities, a valid #494 transcript binding, and an injected authoritative execution receipt. Tampered evidence is invalid; unavailable evidence is indeterminate. |
| `packages/core/proofs/artifact-authority-vectors.json` | Stable controlled-regeneration provenance records source/toolchain, circuit k/rows, artifact size/digest, signed manifest digests, tamper/unavailable expectations, and valid/invalid/indeterminate parity cases. |
| `tooling/scripts/test-family-neutral-exchange-consumer.mjs` | A clean packed wallet/exchange consumer imports the artifact-authority subpath and proves classification/binding parity while preserving distinct local and ledger authority labels. |

This evidence verifies supplied artifact-authority path observations. The #499
executor binds those observations to its canonical transcript and transaction
confirmation boundary; neither layer performs artifact publication, deployment
operation, or release authorization.

## Hidden-holder status and pseudonym privacy

| Evidence | Contract |
| --- | --- |
| `packages/core/primitives/credentials/src/test/secret-holder-binding.test.ts` | Compact derives a pseudonym from verifier identity, deployment, audience, origin, consent, request, and challenge; mutation of every component changes the pseudonym. |
| `packages/prototypes/credential-families/birth-secret/src/test/holder-binding.test.ts` | The hidden birth family enforces the scoped pseudonym inside the private holder-witness check and rejects challenge/context mutations. |
| `packages/components/orchestration/protocol/src/test/secret-holder/pseudonym.test.ts` | The holder verifies the allow-listed verifier's signature over the transport wrapper, rejects forged senders, malformed dynamic request/challenge scope, and authenticated replays before disclosure; successful public/retained result shape contains a request-scoped presentation binding and no credential root, holder secret, opening, witness, or status handle. |
| `packages/registry/status-midnight-verifier/src/test/authenticated-status.test.ts` | Private root-bound evidence fails closed without a private proof adapter. With an injected adapter, the public transcript contains only scoped subject/proof digests and bounded status outcomes, never the leaf, raw proof digest, path, opening, or witness. |
| `packages/core/proofs/src/test/hidden-holder-privacy.test.ts` | Snapshots cover public results, receipts, events, errors, logs, and retained artifacts; intentional credential-root/holder/status leak fixtures and stable forbidden byte values fail closed without echoing secrets in errors. |
| `packages/use-cases/age-gate/contract/src/test/demo-revocation.test.ts` | The managed age-gate request binds its fixed deployment/audience/origin/consent context plus verifier identity, request, and challenge while preserving status-mode negatives. |
| `tooling/fixtures/credential-proofs-consumer/browser-entry.ts` | A clean browser consumer imports the privacy scanner from its dedicated package subpath. |

This slice does not implement #499 final executors, #502 aggregate authority,
University v1 hidden transport, browser fingerprinting defenses, or production
anonymity claims.
