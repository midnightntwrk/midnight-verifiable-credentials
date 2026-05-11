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
- reference implementation packages:
  - [`credentials`](./core/primitives/credentials/README.md)
  - [`credentials-status-registry`](./registry/status-registry/README.md)
    - current prototype status / revocation registry support package
  - [`credentials-birth`](./prototypes/credential-families/birth/README.md)
  - [`credentials-birth-secret`](./prototypes/credential-families/birth-secret/README.md)
  - [`credentials-hello-family`](./prototypes/credential-families/hello-family/README.md)
    - claim-type playground and starter family package
  - [`credentials-iso-registry`](./core/primitives/iso-registry/README.md)
  - [`credentials-offchain-did`](./components/adapters/offchain-did/README.md)
  - [`credentials-openid`](./protocols/openid/README.md)
    - current reference transport-adapter surface
- prototype / experimental packages:
  - [`credentials-status-registry`](./registry/status-registry/README.md)
  - [`credentials-protocol`](./components/orchestration/protocol/README.md)
  - [`credentials-demo-contract`](./use-cases/age-gate/contract/README.md)
- shared integration infrastructure:
  - [`standalone-environment`](./components/integration/standalone-environment/README.md)
- planned prototype restoration work:
  - future `credentials-birth-binding-prototypes` restoration
    - not currently present as a real workspace package on `develop`

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
- companion guides:
  - [`docs/guides/midnight-credentials-for-dummies.md`](./docs/guides/midnight-credentials-for-dummies.md)
  - [`docs/guides/package-selection.md`](./docs/guides/package-selection.md)
  - [`docs/guides/integration-surface-map.md`](./docs/guides/integration-surface-map.md)
  - [`docs/guides/prototype-execution-ladder.md`](./docs/guides/prototype-execution-ladder.md)
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
  - prototype status / revocation registry contract and off-chain witness helpers
- [`credentials-iso-registry`](./core/primitives/iso-registry/README.md)
  - shared Compact-native ISO code types
- [`credentials-offchain-did`](./components/adapters/offchain-did/README.md)
  - DID-aware runtime adapter for offchain DID holder binding
- [`credentials-status-registry`](./registry/status-registry/README.md)
  - prototype status/revocation registry and off-chain builder helpers
- [`credentials-birth`](./prototypes/credential-families/birth/README.md)
  - explicit-holder birth credential family
- [`credentials-birth-secret`](./prototypes/credential-families/birth-secret/README.md)
  - secret-holder birth credential family
- [`credentials-hello-family`](./prototypes/credential-families/hello-family/README.md)
  - claim-type playground for the current Compact primitive surface
- [`credentials-openid`](./protocols/openid/README.md)
  - OID4VCI / OID4VP-inspired transport/domain adapters
- [`credentials-protocol`](./components/orchestration/protocol/README.md)
  - reference off-chain orchestration and protocol simulation
- [`credentials-demo-contract`](./use-cases/age-gate/contract/README.md)
  - verifier/business contract demo
- [`standalone-environment`](./components/integration/standalone-environment/README.md)
  - shared Docker-backed integration harness

No checked-in prototype matrix package currently exists for cross-profile birth
binding restoration work.

If that work returns, it should come back as an explicit workspace package
rather than as artifact-only residue.

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
- `@midnight-ntwrk/midnight-did-standalone-environment`

Intentionally excluded:

- `@midnight-ntwrk/midnight-did-credentials-demo-contract`
