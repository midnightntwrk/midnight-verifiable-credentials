# @midnight-ntwrk/midnight-did-credentials-offchain-did

> Maturity: `infrastructure`
> Package class: `dist`

DID-aware runtime adapter package for deriving Midnight VC holder-binding values
from long-form offchain Midnight DID material.

Status:

- reference implementation adapter package

Tier:

- DID-aware adapter package

Dependency direction:

- may depend on Midnight DID/runtime packages plus the VC core
- must not be imported by Compact contracts
- core VC packages must not depend on this adapter

Reusable outside this repo:

- yes, in DID-aware runtime integrations

Surface classification:

- `Off-chain only`

Start here:

1. use this package only in runtime code that derives holder-binding values
   from off-chain Midnight DID material
2. do not use this package inside Compact contracts
3. read the [package selection guide](../../../../docs/guides/package-selection.md)
   for the canonical split between Compact authority and runtime adapters

Related docs:

- [core specification](../../../../spec/README.md)
- [configuration](../../../../spec/configuration.md)
- [conformance](../../../../conformance/README.md)
- package boundaries: [`../../../../docs/architecture/package-boundaries.md`](../../../../docs/architecture/package-boundaries.md)
- package selection: [`../../../../docs/guides/package-selection.md`](../../../../docs/guides/package-selection.md)

## Purpose

This package owns DID-aware runtime helpers that should not live in the generic
`credentials` core package.

It converts long-form offchain Midnight DID inputs into the Compact-side holder
binding shape already defined by the VC core.

## Public API

Primary exports:

- `createOffchainDIDHolderBindingFromDidUrl(...)`
- `createLongFormOffchainDIDUrlForJubjubHolder(...)`
- `normalizeOffchainDIDMethodReference(...)`
- `hashOffchainDIDMethodId(...)`

Type exports:

- `OffchainDIDHolderBinding`
- `ResolvedOffchainDIDHolderBinding`

Compatibility aliases are also exported temporarily for the historical
`OffchainMidnight...` naming and the earlier portable offchain DID helper name.

## Build

- Build: `pnpm --dir packages/components/adapters/offchain-did run build`
- Test: `pnpm --dir packages/components/adapters/offchain-did run test:ci`
- Typecheck: `pnpm --dir packages/components/adapters/offchain-did run typecheck`
