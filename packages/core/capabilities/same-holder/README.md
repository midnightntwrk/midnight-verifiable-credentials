# @midnight-ntwrk/midnight-did-credentials-same-holder

Same-holder capability package for Midnight credentials.

Status:

- reference implementation

Tier:

- reusable core capability package

Surface classification:

- `On-chain + off-chain`
- Compact entrypoints are the authoritative contract-authoring surface
- generated/runtime TypeScript exports are off-chain mirrors only

Dependency direction:

- may depend on shared core primitives
- higher-layer families and Layer 3 contracts may compose it
- must not depend on protocol/orchestration, demos, or standalone integration
  harnesses

Reusable outside this repo:

- yes

Related docs:

- spec: [`../../../../docs/spec/midnight-credentials.md`](../../../../docs/spec/midnight-credentials.md)
- profiles: [`../../../../docs/spec/profiles.md`](../../../../docs/spec/profiles.md)
- conformance: [`../../../../docs/spec/conformance.md`](../../../../docs/spec/conformance.md)
- companion guide: [`../../../../docs/guides/midnight-credentials-for-dummies.md`](../../../../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../../../../docs/testing/test-matrix.md`](../../../../docs/testing/test-matrix.md)

## Purpose

This package isolates one specific reusable capability:

- proving that two or three holder bindings are satisfied by the same hidden holder secret witness

It exists as a separate package so business contracts can import the capability
only when they need multi-credential same-holder composition.

That keeps the generic credentials core smaller and makes capability boundaries
more explicit.

## What it owns

- `assertSameSecretHolderBindingWitnesses(...)`
- `assertSameBlindedSecretHolderBindingWitnesses(...)`
- `assertSameSecretHolderBindingWitnesses3(...)`
- `assertSameBlindedSecretHolderBindingWitnesses3(...)`

## Compact Entry Points

- `src/same-holder.compact` is the standalone entry point used for the package
  build and generated TS/JS artifacts.
- `src/same-holder/composable.compact` is the Layer 3 entry point for contracts
  that already include `packages/core/primitives/credentials/src/credentials/bindings.compact` or
  `packages/core/primitives/credentials/src/credentials/composable.compact` and want the same-holder
  capability without re-including the full shared bundle.

These circuits do not define:

- credential schemas
- presentation schemas
- disclosure layouts
- predicates such as age or residency

They are capability helpers meant to be composed by a concrete credential family
or by a business contract.

## Design

The capability does not introduce a generic bundle object.

Instead it proves a narrower statement:

- under one verifier challenge
- two or three independently valid holder bindings
- are satisfied by the same hidden holder secret witness

That is a better fit for Midnight at the current stage because it keeps the
composition primitive reusable without prematurely fixing one universal
multi-credential presentation format.

## When to use this package

Use this package only when the business contract needs to assert:

- two or three hidden-holder presentations came from the same holder
- the verifier challenge should bind the presented credentials into one proof step

If a credential family only needs single-credential validation, keep the
dependency on `credentials` only.

## Build and test

- Compile Compact artifacts: `npm run contract -w credentials-same-holder`
- Build TS exports: `npm run build -w credentials-same-holder`
- Run tests: `npm test -w credentials-same-holder`
