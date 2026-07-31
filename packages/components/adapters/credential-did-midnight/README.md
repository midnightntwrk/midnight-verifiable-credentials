# @midnight-ntwrk/credential-did-midnight

> Release stage: `candidate`
> Maturity: `infrastructure`
> Package class: `dist`

Private P1 candidate for reusable off-chain `did:midnight` resolution and
holder-binding conversion. This package is not published or promoted by this
phase.

## Scope

The adapter resolves long-form offchain Midnight DIDs and converts the selected
Jubjub authentication method into holder-binding values. It can also construct
DID material from an injected public key. It never signs, stores, or exports
private keys: signing and key custody remain ports owned by the consuming
wallet or issuer runtime.

The package deliberately excludes Compact contracts, generated proving or
verification material, wallet secrets, deployment artifacts, credential
families, product code, and orchestration. It does not depend on a VC core or
Compact package; its holder-binding type is a small structural runtime value
that consumers can map to their chosen credential implementation.

## Public API

The root ESM export provides:

- `createOffchainDIDHolderBindingFromDidUrl`
- `createLongFormOffchainDIDUrlForJubjubHolder`
- `normalizeOffchainDIDMethodReference`
- `hashOffchainDIDMethodId`
- `OffchainDIDHolderBinding`
- `ResolvedOffchainDIDHolderBinding`

Use package exports rather than repository source paths. The candidate pins the
published Midnight DID runtime cohort at `0.5.0-rc1`; this is an exact
registry-resolvable version, not a workspace or local dependency.

## Validation

```bash
pnpm --dir packages/components/adapters/credential-did-midnight run lint
pnpm --dir packages/components/adapters/credential-did-midnight run typecheck
pnpm --dir packages/components/adapters/credential-did-midnight run test:ci
pnpm --dir packages/components/adapters/credential-did-midnight run build
```
