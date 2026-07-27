# `standalone-environment`

> Maturity: `infrastructure`
> Package class: `source-only`

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
- not publishable as a package; it is private, source-only, and intentionally
  has no `prepack`, `types`, or `exports` surface

Related docs:

- spec: [`../../../../docs/spec/midnight-credentials.md`](../../../../docs/spec/midnight-credentials.md)
- conformance: [`../../../../docs/spec/conformance.md`](../../../../docs/spec/conformance.md)
- test matrix: [`../../../../docs/testing/test-matrix.md`](../../../../docs/testing/test-matrix.md)

## Purpose

This package centralizes the Docker-backed environment used by credentials
integration tests:

- starts the standalone Midnight stack from
  [`../infrastructure/standalone/standalone.yml`](../infrastructure/standalone/standalone.yml)
- builds and funds a wallet from the dev genesis seed
- configures API providers against mapped Docker ports
- provisions real Midnight DID profiles for issuer, holder, and verifier roles
- tears the environment down cleanly after tests

Runtime requirements:

- Docker Engine with Docker Compose 2.24 or newer; the standalone environment
  file uses `env_file` variable interpolation
- automated integration flows must start the stack through
  `StandaloneEnvironment`, which supplies a deterministic non-secret
  `INDEXER_DEVELOPMENT_KEY`
- direct Compose invocations must provide `INDEXER_DEVELOPMENT_KEY` as a
  nonzero 33-byte hexadecimal development key

Port binding:

- the shared standalone compose files bind service ports to `127.0.0.1` so
  proof server, indexer, and node APIs are not exposed on the LAN
- Testcontainers assigns dynamic host ports for the proof server, indexer, and
  node, then the harness discovers those mappings before configuring providers
- independent standalone integration runs can execute concurrently without
  claiming fixed host ports

It exists so package-level integration tests do not each reinvent:

- Docker lifecycle handling
- wallet sync and funding waits
- dust generation registration
- DID deployment and verification method publishing

## What It Exports

- `StandaloneEnvironment`
- `provisionDidProfile(...)`
- `provisionDerivedDidProfile(...)`
- `containerRuntimeAvailable()`
- `verifierChallengeForProfile(...)`
- `TIMEOUTS`

## Current Consumers

- `packages/use-cases/age-gate/contract/src/test/integration/`
- `packages/components/orchestration/protocol/src/test/integration/`

## Validation

```sh
pnpm run check:workspace-manifests # from the repository root
pnpm --dir packages/components/integration/standalone-environment run typecheck
pnpm --dir packages/components/integration/standalone-environment run build
```

Integration execution happens through the consuming packages:

```sh
pnpm --dir packages/use-cases/age-gate/contract run test:integration
pnpm --dir packages/components/orchestration/protocol run test:integration
```
