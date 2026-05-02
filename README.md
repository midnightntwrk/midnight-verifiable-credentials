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

- normative spec draft:
  - [`docs/spec/midnight-credentials.md`](./docs/spec/midnight-credentials.md)
- profile catalog:
  - [`docs/spec/profiles.md`](./docs/spec/profiles.md)
- conformance draft:
  - [`docs/spec/conformance.md`](./docs/spec/conformance.md)
- reference implementation packages:
  - [`credentials`](./credentials/README.md)
  - [`credentials-birth`](./credentials-birth/README.md)
  - [`credentials-birth-secret`](./credentials-birth-secret/README.md)
  - [`credentials-iso-registry`](./credentials-iso-registry/README.md)
  - [`credentials-openid`](./credentials-openid/README.md)
    - current reference transport-adapter surface
- prototype / experimental packages:
  - [`credentials-protocol`](./credentials-protocol/README.md)
  - [`credentials-demo-contract`](./credentials-demo-contract/README.md)
  - `credentials-birth-binding-prototypes`
- shared integration infrastructure:
  - [`standalone-environment`](./standalone-environment/README.md)

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
- architecture:
  - [`docs/architecture/overview.md`](./docs/architecture/overview.md)
  - [`docs/architecture/package-boundaries.md`](./docs/architecture/package-boundaries.md)
  - [`docs/architecture/dependency-composition.md`](./docs/architecture/dependency-composition.md)
- testing:
  - [`docs/testing/test-strategy.md`](./docs/testing/test-strategy.md)
  - [`docs/testing/test-matrix.md`](./docs/testing/test-matrix.md)
- design/comparison notes:
  - [`docs/decisions/anoncreds-comparison.md`](./docs/decisions/anoncreds-comparison.md)
  - [`docs/plans/holder-binding-extension-plan.md`](./docs/plans/holder-binding-extension-plan.md)

## Workspace map

- [`credentials`](./credentials/README.md)
  - generic VC/VP envelopes, proof model, holder-binding profiles
- [`credentials-same-holder`](./credentials-same-holder/README.md)
  - same-holder composition capability
- [`credentials-iso-registry`](./credentials-iso-registry/README.md)
  - shared Compact-native ISO code types
- [`credentials-birth`](./credentials-birth/README.md)
  - explicit-holder birth credential family
- [`credentials-birth-secret`](./credentials-birth-secret/README.md)
  - secret-holder birth credential family
- [`credentials-openid`](./credentials-openid/README.md)
  - OID4VCI / OID4VP-inspired transport/domain adapters
- [`credentials-protocol`](./credentials-protocol/README.md)
  - reference off-chain orchestration and protocol simulation
- [`credentials-demo-contract`](./credentials-demo-contract/README.md)
  - verifier/business contract demo
- `credentials-birth-binding-prototypes`
  - experimental cross-profile birth-credential prototype matrix
- [`standalone-environment`](./standalone-environment/README.md)
  - shared Docker-backed integration harness

## Validation

Main repo validation:

```bash
./run.sh
```

Light mode:

```bash
./run.sh --light
```

Direct package-wide validation entrypoints:

- `npm run lint`
- `npm run build:all`
- `npm run test:all`

## Artifact packaging

Stable tarball output lives under [`artifacts/npm/`](./artifacts/README.md).

Commands:

- `npm run artifacts:pack`
- `./upgrade-libs.sh --destination /path/to/downstream-repo`

Published/exported local tarball set currently includes:

- `@midnight-ntwrk/midnight-did-credentials`
- `@midnight-ntwrk/midnight-did-credentials-same-holder`
- `@midnight-ntwrk/midnight-did-credentials-iso-registry`
- `@midnight-ntwrk/midnight-did-credentials-openid`
- `@midnight-ntwrk/midnight-did-credentials-protocol`
- `@midnight-ntwrk/midnight-did-credentials-birth`
- `@midnight-ntwrk/midnight-did-credentials-birth-secret`
- `@midnight-ntwrk/midnight-did-standalone-environment`

Intentionally excluded:

- `@midnight-ntwrk/midnight-did-credentials-demo-contract`
