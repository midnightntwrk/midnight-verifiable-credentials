# `standalone-environment`

Shared Midnight standalone integration harness for the credentials prototype.

Status:

- reference implementation

Tier:

- shared integration infrastructure package

Surface classification:

- `Off-chain only`
- Docker/runtime bootstrap support for integration tests

Dependency direction:

- may depend on runtime/test infrastructure and downstream packages under test
- must not be treated as reusable core VC semantics
- core, family, and reusable capability packages must not depend on this harness

Reusable outside this repo:

- limited; primarily repo-local integration support

Related docs:

- spec: [`../../../docs/spec/midnight-credentials.md`](../../../docs/spec/midnight-credentials.md)
- conformance: [`../../../docs/spec/conformance.md`](../../../docs/spec/conformance.md)
- test matrix: [`../../../docs/testing/test-matrix.md`](../../../docs/testing/test-matrix.md)

## Purpose

This package centralizes the Docker-backed environment used by credentials
integration tests:

- starts the standalone Midnight stack from `api/standalone.yml`
- builds and funds a wallet from the dev genesis seed
- configures API providers against mapped Docker ports
- provisions real Midnight DID profiles for issuer, holder, and verifier roles
- tears the environment down cleanly after tests

It exists so package-level integration tests do not each reinvent:

- Docker lifecycle handling
- wallet sync and funding waits
- dust generation registration
- DID deployment and verification method publishing

## What It Exports

- `StandaloneEnvironment`
- `provisionDidProfile(...)`
- `containerRuntimeAvailable()`
- `verifierChallengeForProfile(...)`
- `TIMEOUTS`

## Current Consumers

- `use-cases/age-gate/contract/src/test/integration/`
- `components/orchestration/protocol/src/test/integration/`

## Validation

```sh
npm run typecheck -w components/integration/standalone-environment
```

Integration execution happens through the consuming packages:

```sh
npm run test:integration -w use-cases/age-gate/contract
npm run test:integration -w components/orchestration/protocol
```
