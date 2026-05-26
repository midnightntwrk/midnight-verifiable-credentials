# `credentials-iso-registry`

> Maturity: `reference`
> Package class: `dist`

Compact-native ISO code types shared by Midnight credential families.

Status:

- reference implementation

Tier:

- reusable core helper package

Surface classification:

- `On-chain + off-chain`
- Compact type definitions are the authoritative source
- generated/runtime TypeScript exports are off-chain mirrors only

Dependency direction:

- may depend on lower shared primitives only
- higher-layer families and contracts may compose it
- must not depend on DID-aware adapters, transport/orchestration packages,
  demos, or standalone integration harnesses

Reusable outside this repo:

- yes

Related docs:

- spec: [`../../../../docs/spec/midnight-credentials.md`](../../../../docs/spec/midnight-credentials.md)
- conformance: [`../../../../docs/spec/conformance.md`](../../../../docs/spec/conformance.md)
- companion guide: [`../../../../docs/guides/midnight-credentials-for-dummies.md`](../../../../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../../../../docs/testing/test-matrix.md`](../../../../docs/testing/test-matrix.md)

## Purpose

This package provides bounded numeric types for values that recur across
credential families:

- `CountryCode`
- `CurrencyCode`
- `LanguageCode`
- `RegionCode`
- `GenderCode`

Using numeric codes keeps the values:

- Compact-friendly
- easy to compare inside circuits
- reusable across multiple credential schemas

The presentation layer can always render these values back to human-readable
text off-chain.

## Current Scope

The current prototype uses the ISO registry directly in the passport family and
reserves it as the shared source of truth for future credential families such as
driving license, national ID, and AML/KYC.

## Validation

```sh
pnpm --dir credentials-iso-registry run all
```
