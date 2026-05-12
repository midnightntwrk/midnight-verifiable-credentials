# DID + VC Hello Smoke Path

Status:

- current starter smoke path
- smallest checked-in DID-aware handoff into VC verification

Purpose:

- prove the runtime handoff from a portable offchain Midnight DID URL into a VC
  holder binding
- keep the path smaller than `age-gate` and smaller than the full protocol stack
- show the thinnest current package chain for integrators who need one concrete
  DID -> VC -> verifier story

## Packages in the path

1. `@midnight-ntwrk/midnight-did-domain`
   - bootstraps the portable offchain DID URL from a compact DID state payload
2. `@midnight-ntwrk/midnight-did-credentials-offchain-did`
   - derives `OffchainDIDHolderBinding` from that portable DID URL
3. `@midnight-ntwrk/midnight-did-credentials-hello-family`
   - issues and verifies the typed starter credential/presentation using the
     offchain DID holder-binding profile
4. `@midnight-ntwrk/midnight-did-hello-verifier-contract`
   - consumes that presentation in the smallest Layer 3 verifier starter

## What the checked-in smoke path proves

The current repository now has one runnable path that proves all of the
following in order:

1. a Jubjub keypair can be embedded into a portable offchain Midnight DID URL
2. the VC adapter can resolve that DID URL into an offchain holder binding
3. a starter VC family can issue a credential to that offchain holder binding
4. the same holder can produce a valid presentation proof for that credential
5. a starter verifier contract can accept that presentation and record the
   disclosed fields

This is intentionally narrower than `age-gate`:

- no revocation
- no reusable capability minting
- no external transport/session layer
- no durable protocol state

## Checked-in smoke tests

Family-layer handoff:

- [`../../prototypes/credential-families/hello-family/src/test/offchain-did-smoke.test.ts`](../../prototypes/credential-families/hello-family/src/test/offchain-did-smoke.test.ts)

Layer-3 verifier handoff:

- [`../../use-cases/hello-verifier/contract/src/test/hello-verifier.test.ts`](../../use-cases/hello-verifier/contract/src/test/hello-verifier.test.ts)

Adapter-layer binding derivation:

- [`../../components/adapters/offchain-did/src/test/offchain-did-holder-binding.test.ts`](../../components/adapters/offchain-did/src/test/offchain-did-holder-binding.test.ts)

## Run the smoke path locally

Smallest root-level lane:

```bash
./run.sh hello-smoke
```

Artifact-restored parity lane:

```bash
./run.sh hello-smoke --light
```

That lane runs:

- lint for `components/adapters/offchain-did`
- typecheck for `components/adapters/offchain-did`
- typecheck and tests for `prototypes/credential-families/hello-family`
- typecheck and tests for `use-cases/hello-verifier/contract`

It is intentionally build-less at the root level:

- the `hello-family` and `hello-verifier` package-local typecheck/pretest
  commands already run the Compact compiles they require
- the goal of `hello-smoke` is a smallest runnable handoff lane, not a second
  artifact-build umbrella

The repository now also exposes a CI-native parity path:

- root script:
  - `npm run ci:hello-smoke:from-artifacts`
- GitHub Actions check:
  - `Hello Smoke Lane`
- purpose:
  - prove that the smallest DID-aware handoff still works when it consumes the
    shared build-artifact cones rather than package-local fresh compiles

If you want to reproduce that restored-artifact parity path locally without the
root runner wrapper:

```bash
npm run build:starter-smoke-prereqs
npm run ci:hello-smoke:from-artifacts
```

That is the narrowest local recipe matching the CI lane shape:

- build the shared starter cones once
- then rerun hello-smoke lint, typecheck, and tests against restored artifacts
  instead of package-local fresh compiles

Equivalent package-local commands:

```bash
npm run test:ci -w components/adapters/offchain-did
npm run test:ci -w prototypes/credential-families/hello-family
npm run test:ci -w use-cases/hello-verifier/contract
```

If you want the narrowest DID-aware proof only:

```bash
npm exec -w prototypes/credential-families/hello-family -- vitest run src/test/offchain-did-smoke.test.ts
npm exec -w use-cases/hello-verifier/contract -- vitest run src/test/hello-verifier.test.ts
```

## Compatibility matrix seed

This is not a full support matrix yet. It is the first checked-in seed for the
current smoke path.

| DID side | VC side | Expected proof |
| --- | --- | --- |
| `@midnight-ntwrk/midnight-did-domain` `0.1.0` tarball | `@midnight-ntwrk/midnight-did-credentials-offchain-did` workspace package | can create and resolve a portable offchain DID URL |
| `@midnight-ntwrk/midnight-did` `0.1.0` tarball | `@midnight-ntwrk/midnight-did-credentials-hello-family` workspace package | can derive `OffchainDIDHolderBinding` and verify the family-level presentation |
| same as above | `@midnight-ntwrk/midnight-did-hello-verifier-contract` workspace package | can verify the offchain-DID-backed presentation in a Layer 3 starter contract |
| same as above | root `./run.sh hello-smoke` lane | can rerun the full checked-in DID-aware starter handoff from one repo command |
| same as above | root `./run.sh hello-smoke --light` lane | can rerun the same handoff against restored build artifacts rather than package-local fresh compiles |

## Limitations

- this path uses the `hello-family` starter claims surface, not a production
  privacy profile
- the offchain DID lifecycle is still runtime-only; no Compact contract in this
  repo owns DID state
- the starter reuses `VerificationMethodRef.didContractAddress` bytes to carry
  the resolved offchain DID state hash when binding the holder proof; treat
  that as a starter-only compatibility convention, not as an on-chain DID
  contract address
- this path proves the holder-binding handoff and presentation verification,
  not issuance transport or wallet UX
- if you need revocation or multi-party orchestration, move to `age-gate` or
  `credentials-protocol` after this smoke path passes
