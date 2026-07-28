# Midnight Verifiable Credentials

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/midnightntwrk/midnight-verifiable-credentials/badge)](https://scorecard.dev/viewer/?uri=github.com/midnightntwrk/midnight-verifiable-credentials)

Compact-first Verifiable Credentials and Verifiable Presentations for Midnight.

This repository contains:

- reusable Midnight VC/VP building blocks
- private credential-family prototypes used as architecture and conformance evidence
- transport/domain adapters
- protocol/reference orchestration packages
- verifier-contract demos
- standalone integration infrastructure

## Status

Current maturity is mixed by package:

- canonical package/protocol tier inventory:
  - [`docs/architecture/package-tier-inventory.md`](./docs/architecture/package-tier-inventory.md)
- normative spec draft:
  - [`docs/spec/midnight-credentials.md`](./docs/spec/midnight-credentials.md)
- profile catalog:
  - [`docs/spec/profiles.md`](./docs/spec/profiles.md)
- conformance draft:
  - [`docs/spec/conformance.md`](./docs/spec/conformance.md)
- claim representation companion:
  - [`docs/spec/claim-representation.md`](./docs/spec/claim-representation.md)
- reference implementation packages:
  - [`credential-model`](./packages/core/model/README.md)
    - protocol-neutral family-authoring package and first supported npm surface
  - [`credentials`](./packages/core/primitives/credentials/README.md)
  - [`credentials-status-registry`](./packages/registry/status-registry/README.md)
    - reusable registry package with the current prototype status / revocation trust model
  - [`credentials-birth`](./packages/prototypes/credential-families/birth/README.md)
  - [`credentials-birth-secret`](./packages/prototypes/credential-families/birth-secret/README.md)
  - [`credentials-hello-family`](./packages/prototypes/credential-families/hello-family/README.md)
    - smallest starter family package
  - [`credentials-dummy-claims`](./packages/prototypes/credential-families/dummy-claims/README.md)
    - broad direct claim-surface and selective-disclosure laboratory
  - [`credentials-mixed-claims`](./packages/prototypes/credential-families/mixed-claims/README.md)
    - mixed explicit/public plus committed/private claim-representation laboratory
  - [`credentials-university-diploma`](./packages/prototypes/credential-families/university-diploma/README.md)
    - academic diploma prototype aligned to the university issuance and verifier-flow use case
  - [`credentials-digital-passport`](./packages/prototypes/credential-families/digital-passport/README.md)
    - first credential-product graduation candidate; not yet production-ready
  - [`credentials-iso-registry`](./packages/core/primitives/iso-registry/README.md)
  - [`credentials-offchain-did`](./packages/components/adapters/offchain-did/README.md)
  - [`credentials-openid`](./packages/protocols/openid/README.md)
    - current reference transport-adapter surface
- prototype / experimental packages:
  - [`credentials-protocol`](./packages/components/orchestration/protocol/README.md)
  - [`hello-verifier-contract`](./packages/use-cases/hello-verifier/contract/README.md)
    - smallest verifier-side starter and broad direct claim-surface lab consumer
  - [`university-verifier-contract`](./packages/use-cases/university/contract/README.md)
    - verifier-side university diploma request and presentation consumer
  - [`university-protocol`](./packages/use-cases/university/protocol/README.md)
    - protocol-style multi-party university issuer/student/company/mall flow
    - includes a separate 100-student stress lane for throughput-oriented protocol measurements
    - emits paired JSON and Markdown stress artifacts for CI retention
  - [`credentials-demo-contract`](./packages/use-cases/age-gate/contract/README.md)
- shared integration infrastructure:
  - [`standalone-environment`](./packages/components/integration/standalone-environment/README.md)

## Documentation

Start here:

- docs index:
  - [`docs/README.md`](./docs/README.md)
- normative spec draft:
  - [`docs/spec/midnight-credentials.md`](./docs/spec/midnight-credentials.md)
- profile catalog:
  - [`docs/spec/profiles.md`](./docs/spec/profiles.md)
- conformance draft:
  - [`docs/spec/conformance.md`](./docs/spec/conformance.md)
- claim representation companion:
  - [`docs/spec/claim-representation.md`](./docs/spec/claim-representation.md)
- companion guides:
  - [`docs/pi-development.md`](./docs/pi-development.md)
    - optional pinned Pi development-loop interface and VC-specific review policy
  - [`docs/guides/midnight-credentials-for-dummies.md`](./docs/guides/midnight-credentials-for-dummies.md)
  - [`docs/guides/package-selection.md`](./docs/guides/package-selection.md)
  - [`docs/guides/integration-surface-map.md`](./docs/guides/integration-surface-map.md)
  - [`docs/guides/status-revocation-entrypoints.md`](./docs/guides/status-revocation-entrypoints.md)
  - [`docs/guides/did-integration-modes.md`](./docs/guides/did-integration-modes.md)
  - [`docs/guides/vc-surface-change-discipline.md`](./docs/guides/vc-surface-change-discipline.md)
  - [`docs/guides/prototype-execution-ladder.md`](./docs/guides/prototype-execution-ladder.md)
- university diploma use case:
  - [`packages/use-cases/university/README.md`](./packages/use-cases/university/README.md)
  - [`packages/use-cases/university/operator-guide.md`](./packages/use-cases/university/operator-guide.md)
  - [`packages/use-cases/university/contract/README.md`](./packages/use-cases/university/contract/README.md)
  - [`packages/use-cases/university/scenarios/README.md`](./packages/use-cases/university/scenarios/README.md)
  - [`packages/use-cases/university/protocol/README.md`](./packages/use-cases/university/protocol/README.md)
- architecture:
  - [`docs/architecture/overview.md`](./docs/architecture/overview.md)
  - [`docs/architecture/package-boundaries.md`](./docs/architecture/package-boundaries.md)
  - [`docs/architecture/workspace-package-manifest-discipline.md`](./docs/architecture/workspace-package-manifest-discipline.md)
  - [`docs/architecture/package-release-contract.md`](./docs/architecture/package-release-contract.md)
  - [`docs/architecture/package-tier-inventory.md`](./docs/architecture/package-tier-inventory.md)
  - [`docs/architecture/holder-binding-terminology.md`](./docs/architecture/holder-binding-terminology.md)
  - [`docs/architecture/protocol-classification.md`](./docs/architecture/protocol-classification.md)
  - [`docs/architecture/dependency-composition.md`](./docs/architecture/dependency-composition.md)
- testing:
  - [`docs/testing/test-strategy.md`](./docs/testing/test-strategy.md)
  - [`docs/testing/test-matrix.md`](./docs/testing/test-matrix.md)
- design/comparison notes:
  - [`docs/decisions/README.md`](./docs/decisions/README.md)
  - [`docs/plans/vc-maturity-backlog.md`](./docs/plans/vc-maturity-backlog.md)
  - [`docs/decisions/anoncreds-comparison.md`](./docs/decisions/anoncreds-comparison.md)
  - [`docs/plans/holder-binding-extension-plan.md`](./docs/plans/holder-binding-extension-plan.md)

## Workspace map

- [`credential-model`](./packages/core/model/README.md)
  - protocol-neutral family definitions, descriptors, codecs, and manifests
- [`credentials`](./packages/core/primitives/credentials/README.md)
  - generic VC/VP envelopes, proof model, holder-binding profiles
- [`credentials-same-holder`](./packages/core/capabilities/same-holder/README.md)
  - same-holder composition capability
- [`credentials-status-registry`](./packages/registry/status-registry/README.md)
  - status / revocation registry contract and off-chain witness helpers, still operating under the current prototype trust model
- [`credentials-iso-registry`](./packages/core/primitives/iso-registry/README.md)
  - shared Compact-native ISO code types
- [`credentials-offchain-did`](./packages/components/adapters/offchain-did/README.md)
  - DID-aware runtime adapter for offchain DID holder binding
- [`credentials-birth`](./packages/prototypes/credential-families/birth/README.md)
  - explicit-holder birth credential family
- [`credentials-birth-secret`](./packages/prototypes/credential-families/birth-secret/README.md)
  - secret-holder birth credential family
- [`credentials-hello-family`](./packages/prototypes/credential-families/hello-family/README.md)
  - smallest compileable starter family package
- [`credentials-dummy-claims`](./packages/prototypes/credential-families/dummy-claims/README.md)
  - broad direct claim-surface and selective-disclosure laboratory
- [`credentials-mixed-claims`](./packages/prototypes/credential-families/mixed-claims/README.md)
  - mixed explicit/public plus committed/private claim-representation laboratory
- [`credentials-university-diploma`](./packages/prototypes/credential-families/university-diploma/README.md)
  - academic diploma prototype with batch-issuance and verifier-policy flows
- [`credentials-digital-passport`](./packages/prototypes/credential-families/digital-passport/README.md)
  - digital-passport reference family and first independent product candidate
- [`credentials-openid`](./packages/protocols/openid/README.md)
  - OID4VCI / OID4VP-inspired transport/domain adapters
- [`credentials-protocol`](./packages/components/orchestration/protocol/README.md)
  - reference off-chain orchestration and protocol simulation
- [`hello-verifier-contract`](./packages/use-cases/hello-verifier/contract/README.md)
  - smallest verifier-side starter and broad direct claim-surface lab consumer
- [`university-verifier-contract`](./packages/use-cases/university/contract/README.md)
  - verifier-side university diploma job-application and discount contract package
- [`university-protocol`](./packages/use-cases/university/protocol/README.md)
  - threaded multi-party reference orchestration over the university diploma family
- [`credentials-demo-contract`](./packages/use-cases/age-gate/contract/README.md)
  - verifier/business contract demo
- [`standalone-environment`](./packages/components/integration/standalone-environment/README.md)
  - shared Docker-backed integration harness

Generated compatibility roots:

- the top-level `midnight-did-credentials*` entries are generated compatibility
  symlinks for local tooling and legacy includes
- they are not canonical architecture areas; read the repository through
  `packages/core/`, `packages/registry/`, `packages/protocols/`, `packages/components/`, `packages/prototypes/`,
  `packages/use-cases/`, and `tooling/`
- they are official local compatibility aliases until a dedicated deprecation
  PR removes a specific alias, updates Compact includes, and adjusts cleanup
  guards
- use [`docs/guides/did-integration-modes.md`](./docs/guides/did-integration-modes.md)
  for DID package integration modes, alias lifecycle, and repair commands

Status and revocation entrypoints:

- start with [`docs/guides/status-revocation-entrypoints.md`](./docs/guides/status-revocation-entrypoints.md)
  when choosing a status/revocation path
- read [`docs/spec/credential-status.md`](./docs/spec/credential-status.md)
  for status levels and fail-closed semantics
- read [`docs/spec/revocation-registry.md`](./docs/spec/revocation-registry.md)
  for the revoked-set registry model
- read [`docs/spec/status-verification-protocol.md`](./docs/spec/status-verification-protocol.md)
  for verifier-supplied root and status proof-protocol boundaries
- use [`packages/registry/status-registry`](./packages/registry/status-registry)
  for the shipped Compact and TypeScript helper package

## Validation

Main repo validation:

```bash
./run.sh
```

The default gate runs the same cataloged release targets and adds the standalone
Docker lanes when Docker is available.

The light gate runs every cataloged non-Docker validation target, including
all workspace package classes and tarball packaging:

```bash
./run.sh --light
```

Targets without a reduced variant still run their normal non-Docker lane when
they are part of the default light gate. Inspect the authoritative light-target,
release-target, and workspace catalogs with:

```bash
./run.sh targets
node ./tooling/scripts/workspace-catalog.mjs --json
```

Package all `dist`-class workspaces selected by the workspace catalog:

```bash
./run.sh package
```

Run any root `package.json` script through the same entrypoint:

```bash
./run.sh build:core
./run.sh ci:package-tests
./run.sh artifacts:pack
```

Run the BDD smoke lane directly:

```bash
./run.sh bdd
```

Run the threaded university protocol lane directly:

```bash
./run.sh university-protocol
```

Use the university operator guide when choosing between readable BDD,
proof-server-contract, standalone-hybrid, cohort, stress, and summary lanes:

- [`packages/use-cases/university/operator-guide.md`](./packages/use-cases/university/operator-guide.md)

Export the readable 10-student university protocol transcript:

```bash
./run.sh university-protocol-export
```

Run the 30-student university cohort protocol lane:

```bash
./run.sh university-protocol-cohort
./run.sh university-protocol-cohort --light
```

Run the 100-student university protocol stress lane:

```bash
./run.sh university-protocol-stress
./run.sh university-protocol-stress --light
```

Emit the one-page university artifact summary:

```bash
./run.sh university-summary
./run.sh university-summary --light
```

Print the versioned university report summary contract:

```bash
./run.sh university-report-contract
```

This target builds the reporting package quietly, prints the contract JSON to
stdout, and does not write report artifacts. Use it when dashboards, CI, or
handoff tooling need to compare `schemaId`, `schemaVersion`, handoff artifact
ids, source artifact ids, transcript schema, and required privacy-profile
sections without regenerating report artifacts.

Run the smallest DID-aware handoff lane directly:

```bash
./run.sh hello-smoke
```

Reuse existing build artifacts for that same lane:

```bash
./run.sh hello-smoke --light
```

Run only the negative BDD living-doc scenarios:

```bash
./run.sh bdd-negative
```

Run the full BDD scenario set:

```bash
./run.sh bdd-all
```

Direct package-wide validation entrypoints:

- `pnpm run lint`
- `pnpm run build:all`
- `pnpm run test:all`
- `pnpm run docs:links`

Inspect DID package integration wiring:

```bash
./run.sh integration-report
./run.sh check-integration
pnpm run check:did-integration
```

## Artifact packaging

Stable tarball output lives under [`tooling/artifacts/npm/`](./tooling/artifacts/README.md).
Only candidate and supported packages are packable; only supported packages
are publishable. A candidate artifact is not automatically a supported
release. See the
[package release contract](./docs/architecture/package-release-contract.md)
for the explicit candidate/support inventory and graduation requirements.

Commands:

- `pnpm run artifacts:pack`
- `pnpm run test:release-package-consumers` (focused rerun against already packed artifacts)
- `pnpm run test:release-tooling`
- `pnpm run upgrade:vendor`
- `./upgrade-libs.sh --destination /path/to/downstream-repo`

The current supported publication set contains only:

- `@midnight-ntwrk/credential-model`

All legacy packages, prototypes, use cases, scenarios, reporting, and
integration workspaces are intentionally excluded from the publication
artifact set.

Release operators should follow the
[npmjs publication runbook](./docs/guides/npmjs-publication.md). Public
publication is manual and runs only through `.github/workflows/publish.yml`.
