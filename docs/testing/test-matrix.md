# Midnight VC Test Matrix

Status: current implemented test surface as of 2026-05-01.

## Core package tests

- `credentials/src/test/proof-context.test.ts`
  - proof challenge/context separation
- `credentials/src/test/protocol-envelope.test.ts`
  - protocol envelope threading and validation
- `credentials/src/test/secret-holder-binding.test.ts`
  - secret holder-binding primitives
- `credentials/src/test/lightweight-holder-binding.test.ts`
  - Jubjub and offchain holder-binding checks
- `credentials/src/test/offchain-midnight-holder-binding-runtime.test.ts`
  - offchain DID runtime helper behavior
- `credentials/src/test/package-surfaces.test.ts`
  - exported package surfaces

## Credential family tests

### `credentials-birth`

- holder-binding tests
- age predicate tests
- capability profile tests
- protocol tests

### `credentials-birth-secret`

- holder-binding tests
- age predicate tests
- capability profile tests
- same-holder composition tests

### `credentials-birth-binding-prototypes`

- binding matrix tests across:
  - explicit DID holder binding
  - secret holder binding
  - blinded secret holder binding
  - offchain Midnight DID holder binding
  - legacy/minimal Jubjub holder binding

## Transport/domain tests

### `credentials-openid`

- Compact payload codec tests
- OID4VCI-shaped schema tests
- OID4VP-shaped schema tests

## Protocol/orchestration tests

### `credentials-protocol`

- explicit-holder issuance/presentation/full lifecycle
- secret-holder issuance/presentation
- verifier-domain pseudonym flows
- same-holder flows
- contract-verifier capability lifecycle
- contract-verifier age-gate flows

## Demo contract tests

### `credentials-demo-contract`

- local/unit verifier contract tests
- standalone integration test:
  - issuance-verification lifecycle

## Standalone integration tests

Docker-backed integration runs currently exist in:

- `credentials-demo-contract`
- `credentials-protocol`

Executed through:

```bash
./run.sh
```

or directly through package-level `test:integration` commands when Docker is available.
