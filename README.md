# Midnight Verifiable Credentials

Compact-first Verifiable Credentials and Verifiable Presentations for Midnight.

This repository contains:

- the generic Midnight VC/VP core
- concrete credential-family packages
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
  - [`credentials`](./core/primitives/credentials/README.md)
  - [`credentials-status-registry`](./registry/status-registry/README.md)
    - reusable registry package with the current prototype status / revocation trust model
  - [`credentials-birth`](./prototypes/credential-families/birth/README.md)
  - [`credentials-birth-secret`](./prototypes/credential-families/birth-secret/README.md)
  - [`credentials-hello-family`](./prototypes/credential-families/hello-family/README.md)
    - smallest starter family package
  - [`credentials-dummy-claims`](./prototypes/credential-families/dummy-claims/README.md)
    - broad direct claim-surface and selective-disclosure laboratory
  - [`credentials-mixed-claims`](./prototypes/credential-families/mixed-claims/README.md)
    - mixed explicit/public plus committed/private claim-representation laboratory
  - [`credentials-university-diploma`](./prototypes/credential-families/university-diploma/README.md)
    - academic diploma prototype aligned to the university issuance and verifier-flow use case
  - [`credentials-iso-registry`](./core/primitives/iso-registry/README.md)
  - [`credentials-offchain-did`](./components/adapters/offchain-did/README.md)
  - [`credentials-openid`](./protocols/openid/README.md)
    - current reference transport-adapter surface
- prototype / experimental packages:
  - [`credentials-protocol`](./components/orchestration/protocol/README.md)
  - [`hello-verifier-contract`](./use-cases/hello-verifier/contract/README.md)
    - smallest verifier-side starter and broad direct claim-surface lab consumer
  - [`university-verifier-contract`](./use-cases/university/contract/README.md)
    - verifier-side university diploma request and presentation consumer
  - [`university-protocol`](./use-cases/university/protocol/README.md)
    - protocol-style multi-party university issuer/student/company/mall flow
    - includes a separate 100-student stress lane for throughput-oriented protocol measurements
    - emits paired JSON and Markdown stress artifacts for CI retention
  - [`credentials-demo-contract`](./use-cases/age-gate/contract/README.md)
- shared integration infrastructure:
  - [`standalone-environment`](./components/integration/standalone-environment/README.md)

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
  - [`docs/guides/midnight-credentials-for-dummies.md`](./docs/guides/midnight-credentials-for-dummies.md)
  - [`docs/guides/package-selection.md`](./docs/guides/package-selection.md)
  - [`docs/guides/integration-surface-map.md`](./docs/guides/integration-surface-map.md)
  - [`docs/guides/vc-surface-change-discipline.md`](./docs/guides/vc-surface-change-discipline.md)
  - [`docs/guides/prototype-execution-ladder.md`](./docs/guides/prototype-execution-ladder.md)
- university diploma use case:
  - [`use-cases/university/README.md`](./use-cases/university/README.md)
  - [`use-cases/university/operator-guide.md`](./use-cases/university/operator-guide.md)
  - [`use-cases/university/contract/README.md`](./use-cases/university/contract/README.md)
  - [`use-cases/university/scenarios/README.md`](./use-cases/university/scenarios/README.md)
  - [`use-cases/university/protocol/README.md`](./use-cases/university/protocol/README.md)
- architecture:
  - [`docs/architecture/overview.md`](./docs/architecture/overview.md)
  - [`docs/architecture/package-boundaries.md`](./docs/architecture/package-boundaries.md)
  - [`docs/architecture/package-tier-inventory.md`](./docs/architecture/package-tier-inventory.md)
  - [`docs/architecture/protocol-classification.md`](./docs/architecture/protocol-classification.md)
  - [`docs/architecture/dependency-composition.md`](./docs/architecture/dependency-composition.md)
- testing:
  - [`docs/testing/test-strategy.md`](./docs/testing/test-strategy.md)
  - [`docs/testing/test-matrix.md`](./docs/testing/test-matrix.md)
- design/comparison notes:
  - [`docs/decisions/anoncreds-comparison.md`](./docs/decisions/anoncreds-comparison.md)
  - [`docs/plans/holder-binding-extension-plan.md`](./docs/plans/holder-binding-extension-plan.md)

## Workspace map

- [`credentials`](./core/primitives/credentials/README.md)
  - generic VC/VP envelopes, proof model, holder-binding profiles
- [`credentials-same-holder`](./core/capabilities/same-holder/README.md)
  - same-holder composition capability
- [`credentials-status-registry`](./registry/status-registry/README.md)
  - status / revocation registry contract and off-chain witness helpers, still operating under the current prototype trust model
- [`credentials-iso-registry`](./core/primitives/iso-registry/README.md)
  - shared Compact-native ISO code types
- [`credentials-offchain-did`](./components/adapters/offchain-did/README.md)
  - DID-aware runtime adapter for offchain DID holder binding
- [`credentials-birth`](./prototypes/credential-families/birth/README.md)
  - explicit-holder birth credential family
- [`credentials-birth-secret`](./prototypes/credential-families/birth-secret/README.md)
  - secret-holder birth credential family
- [`credentials-hello-family`](./prototypes/credential-families/hello-family/README.md)
  - smallest compileable starter family package
- [`credentials-dummy-claims`](./prototypes/credential-families/dummy-claims/README.md)
  - broad direct claim-surface and selective-disclosure laboratory
- [`credentials-mixed-claims`](./prototypes/credential-families/mixed-claims/README.md)
  - mixed explicit/public plus committed/private claim-representation laboratory
- [`credentials-university-diploma`](./prototypes/credential-families/university-diploma/README.md)
  - academic diploma prototype with batch-issuance and verifier-policy flows
- [`credentials-openid`](./protocols/openid/README.md)
  - OID4VCI / OID4VP-inspired transport/domain adapters
- [`credentials-protocol`](./components/orchestration/protocol/README.md)
  - reference off-chain orchestration and protocol simulation
- [`hello-verifier-contract`](./use-cases/hello-verifier/contract/README.md)
  - smallest verifier-side starter and broad direct claim-surface lab consumer
- [`university-verifier-contract`](./use-cases/university/contract/README.md)
  - verifier-side university diploma job-application and discount contract package
- [`university-protocol`](./use-cases/university/protocol/README.md)
  - threaded multi-party reference orchestration over the university diploma family
- [`credentials-demo-contract`](./use-cases/age-gate/contract/README.md)
  - verifier/business contract demo
- [`standalone-environment`](./components/integration/standalone-environment/README.md)
  - shared Docker-backed integration harness

Generated compatibility roots:

- the top-level `midnight-did-credentials*` entries are generated compatibility
  symlinks for local tooling and legacy includes
- they are not canonical architecture areas; read the repository through
  `core/`, `registry/`, `protocols/`, `components/`, `prototypes/`,
  `use-cases/`, and `tooling/`

## Validation

Main repo validation:

```bash
./run.sh
```

Light mode:

```bash
./run.sh --light
```

Targets that currently honor `--light`:

- `./run.sh`
- `./run.sh build`
- `./run.sh typecheck`
- `./run.sh test`
- `./run.sh hello-smoke`
- `./run.sh dummy-claims-lab`
- `./run.sh university-protocol`
- `./run.sh university-protocol-export`
- `./run.sh university-protocol-cohort`
- `./run.sh university-protocol-stress`
- `./run.sh university-summary`

Discover explicit repository targets:

```bash
./run.sh targets
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

- [`use-cases/university/operator-guide.md`](./use-cases/university/operator-guide.md)

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

- `npm run lint`
- `npm run build:all`
- `npm run test:all`
- `npm run docs:links`

## Artifact packaging

Stable tarball output lives under [`tooling/artifacts/npm/`](./tooling/artifacts/README.md).

Commands:

- `npm run artifacts:pack`
- `npm run upgrade:vendor`
- `./upgrade-libs.sh --destination /path/to/downstream-repo`

Published/exported local tarball set currently includes:

- `@midnight-ntwrk/midnight-did-credentials`
- `@midnight-ntwrk/midnight-did-credentials-status-registry`
- `@midnight-ntwrk/midnight-did-credentials-same-holder`
- `@midnight-ntwrk/midnight-did-credentials-iso-registry`
- `@midnight-ntwrk/midnight-did-credentials-offchain-did`
- `@midnight-ntwrk/midnight-did-credentials-openid`
- `@midnight-ntwrk/midnight-did-credentials-protocol`
- `@midnight-ntwrk/midnight-did-credentials-birth`
- `@midnight-ntwrk/midnight-did-credentials-birth-secret`
- `@midnight-ntwrk/midnight-did-credentials-hello-family`
- `@midnight-ntwrk/midnight-did-credentials-dummy-claims`
- `@midnight-ntwrk/midnight-did-credentials-mixed-claims`
- `@midnight-ntwrk/midnight-did-credentials-university-diploma`
- `@midnight-ntwrk/midnight-did-standalone-environment`

Intentionally excluded:

- `@midnight-ntwrk/midnight-did-credentials-demo-contract`
- `@midnight-ntwrk/midnight-did-hello-verifier-contract`
