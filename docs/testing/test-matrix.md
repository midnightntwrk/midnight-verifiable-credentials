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
  - legacy Jubjub and Compact-side offchain holder-binding checks
- `credentials/src/test/package-surfaces.test.ts`
  - exported package surfaces

## DID-aware adapter package tests

### `credentials-offchain-did`

- `credentials-offchain-did/src/test/offchain-did-holder-binding.test.ts`
  - offchain DID runtime helper behavior

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

### Planned prototype restoration

- `credentials-birth-binding-prototypes`
  - no checked-in source package or validated test surface on `develop`
  - future restoration should reintroduce explicit binding-matrix coverage

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
