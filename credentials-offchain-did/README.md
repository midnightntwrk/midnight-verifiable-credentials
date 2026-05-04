# @midnight-ntwrk/midnight-did-credentials-offchain-did

DID-aware runtime adapter package for deriving Midnight VC holder-binding values
from portable offchain Midnight DID material.

Status:

- reference implementation adapter package

Surface classification:

- `Off-chain only`

Start here:

1. use this package only in runtime code that derives holder-binding values
   from off-chain Midnight DID material
2. do not use this package inside Compact contracts
3. read [`../docs/guides/integration-surface-map.md`](../docs/guides/integration-surface-map.md)
   for the canonical split between Compact authority and runtime adapters

Related docs:

- spec: [`../docs/spec/midnight-credentials.md`](../docs/spec/midnight-credentials.md)
- profiles: [`../docs/spec/profiles.md`](../docs/spec/profiles.md)
- conformance: [`../docs/spec/conformance.md`](../docs/spec/conformance.md)
- package boundaries: [`../docs/architecture/package-boundaries.md`](../docs/architecture/package-boundaries.md)
- package selection: [`../docs/guides/package-selection.md`](../docs/guides/package-selection.md)

## Purpose

This package owns DID-aware runtime helpers that should not live in the generic
`credentials` core package.

It converts portable offchain Midnight DID inputs into the Compact-side holder
binding shape already defined by the VC core.

## Public API

Primary exports:

- `createOffchainDIDHolderBindingFromDidUrl(...)`
- `normalizeOffchainDIDMethodReference(...)`
- `hashOffchainDIDMethodId(...)`

Type exports:

- `OffchainDIDHolderBinding`
- `ResolvedOffchainDIDHolderBinding`

Compatibility aliases are also exported temporarily for the historical
`OffchainMidnight...` naming.

## Build

- Build: `npm run build -w credentials-offchain-did`
- Test: `npm test -w credentials-offchain-did`
- Typecheck: `npm run typecheck -w credentials-offchain-did`
