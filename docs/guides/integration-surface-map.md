# Midnight VC Integration Surface Map

Status: integrator guide for choosing on-chain vs off-chain repository surfaces.

## Purpose

This guide answers a practical integration question:

- which repository surfaces belong in Compact smart contracts
- which surfaces are safe to use from off-chain TypeScript applications
- which surfaces are canonical on both sides, but through different
  representations

The repository is Compact-first, so the same capability often appears twice:

- as Compact source used by contracts
- as generated/runtime TypeScript used by tests, wallets, verifiers, or
  orchestrators

Integrators should not guess which side a package belongs to.

## Usage classes

| Class | Meaning |
| --- | --- |
| `On-chain only` | Intended to be included or compiled into Compact contracts. Do not treat the TypeScript output as the contract-authoring surface. |
| `On-chain + off-chain` | Canonical capability shared across both layers: Compact source is authoritative on-chain, and generated/runtime types mirror that capability off-chain. |
| `Off-chain only` | Runtime/orchestration/transport/integration helpers. These do not belong inside Compact contracts. |

## Global rules

1. Compact source is authoritative.
   - If a package exposes `.compact` entrypoints, those are the contract-author
     surfaces.
   - That does not mean every `.compact` package root is a final deployable
     business contract; some are library/build roots only.
2. Generated `managed` TypeScript is off-chain only.
   - It is for applications, tests, codecs, and helper tooling.
3. Transport/orchestration packages are off-chain only.
   - They may validate canonical Compact values, but they do not define
     contract semantics.
4. Runtime DID helpers are off-chain only.
   - DID parsing, URL normalization, transport codecs, and Docker/runtime
     bootstrap logic never belong in Compact contracts.

## Surface map by package

### `credentials`

| Surface | Class | Use |
| --- | --- | --- |
| `src/credentials.compact` | `On-chain + off-chain` | Standalone canonical VC/VP package root. |
| `src/credentials/composable.compact` | `On-chain + off-chain` | Composition-safe shared root for credential families and Layer 3 contracts. |
| `src/credentials/vc-support.compact` | `On-chain + off-chain` | Narrower VC envelope/proof helper surface. |
| `src/credentials/bindings.compact` | `On-chain + off-chain` | Holder-binding structs and validation helpers. |
| `src/credentials/protocol-support.compact` | `On-chain + off-chain` | Generic issuance/presentation protocol module surface. |
| `src/index.ts` and `managed/**` exports | `Off-chain only` | Generated/runtime mirror of the Compact core for tests and applications. |
| `src/jubjub.ts` | `Off-chain only` | Runtime helper constants/functions shared by TS builders and tests. |

Integrator rule:

- write contracts against the Compact entrypoints
- use the generated/runtime exports only in off-chain code
- treat this package as a library/build surface, not as a final business
  contract to deploy directly

### `credentials-birth`

| Surface | Class | Use |
| --- | --- | --- |
| `src/birth-credential.compact` | `On-chain + off-chain` | Explicit-holder birth credential family root. |
| `managed/**` exports via `src/index.ts` | `Off-chain only` | Generated/runtime family mirror. |

### `credentials-birth-secret`

| Surface | Class | Use |
| --- | --- | --- |
| `src/secret-birth-credential.compact` | `On-chain + off-chain` | Hidden-holder birth credential family root. |
| `managed/**` exports via `src/index.ts` | `Off-chain only` | Generated/runtime family mirror. |

Important note:

- the package now contains prototype status-aware validation surfaces
- those surfaces are still part of the credential-family Compact model
- transport/session orchestration for them remains off-chain

### `credentials-same-holder`

| Surface | Class | Use |
| --- | --- | --- |
| Compact package entrypoints | `On-chain + off-chain` | Same-holder proof capability for hidden-holder families and contracts. |
| Generated/runtime TS exports | `Off-chain only` | Application/test mirror only. |

### `credentials-iso-registry`

| Surface | Class | Use |
| --- | --- | --- |
| Compact ISO code types | `On-chain + off-chain` | Shared vocabulary for contracts and credential families. |
| Generated/runtime TS exports | `Off-chain only` | Runtime mirror only. |

### `credentials-status-registry`

| Surface | Class | Use |
| --- | --- | --- |
| `src/revocation-registry.compact` | `On-chain only` | Status registry contract surface. |
| `src/status-proof-protocol.compact` | `On-chain + off-chain` | Registry-facing proof-protocol types and validators for families and Layer 3 contracts. |
| managed registry contract exports | `Off-chain only` | Runtime contract interface mirror. |
| `src/witness-builder.ts` | `Off-chain only` | Status-handle derivation and witness-input helpers. |
| `src/attestation-builder.ts` | `Off-chain only` | Transitional authority-attested status builder/signing helpers. |

Important note:

- the current builder helpers do not make revocation verification magically
  on-chain
- contracts still consume verifier-supplied roots or attested status evidence
- freshness and root selection remain off-chain responsibilities today

Integrator split:

- define VC/family status shape with:
  - `StatusRegistryRef`
  - `NoStatusBinding`
  - `RegistryBoundStatusBinding`
  from `credentials`
- define verification semantics with:
  - `RevokedSetStatusRequest`
  - `AuthorityAttestedStatusProofProtocol`
  - `RevokedSetNonMembershipStatusProofProtocol`
  from `credentials-status-registry` and the corresponding shared core types

### `credentials-demo-contract`

| Surface | Class | Use |
| --- | --- | --- |
| `src/demo.compact` | `On-chain only` | Demo verifier/business contract. |
| `src/demo-revocation.compact` | `On-chain only` | Status-aware hidden-holder demo verifier/business contract. |
| managed contract exports via `src/index.ts` | `Off-chain only` | Runtime mirror for tests/integration code. |
| `src/testing.ts`, `src/simulator.ts`, `src/witnesses.ts` | `Off-chain only` | Test/demo support code. |

Dormant artifact:

- `../../../prototypes/passport-compliance/reference/passport-compliance-demo.compact`
  is a dormant adjacent-prototype artifact
- it is not part of the supported package surface, default build, or exports
  map

### `credentials-offchain-did`

| Surface | Class | Use |
| --- | --- | --- |
| package public API (`createOffchainDIDHolderBindingFromDidUrl`, etc.) | `Off-chain only` | DID-aware runtime adapter helpers. |

Do not use this package inside Compact contracts.

### `credentials-openid`

| Surface | Class | Use |
| --- | --- | --- |
| package public API (`compact-value-codec`, `oid4vci`, `oid4vp`, etc.) | `Off-chain only` | OpenID-shaped transport/domain schemas and codecs. |

Do not use this package as a source of contract semantics.

### `credentials-protocol`

| Surface | Class | Use |
| --- | --- | --- |
| agent classes (`IssuerAgent`, `HolderAgent`, `VerifierAgent`, etc.) | `Off-chain only` | Reference orchestration and simulation. |
| `ProtocolStateStore` and codec-backed store adapters | `Off-chain only` | Durable/off-chain session state abstraction. |
| `ProtocolRandomnessSource` and envelope helpers | `Off-chain only` | Runtime orchestration helpers. |
| `MessageBus` transport seam | `Off-chain only` | In-process reference transport. |

Do not use this package as an on-chain API surface.

### `standalone-environment`

| Surface | Class | Use |
| --- | --- | --- |
| `StandaloneEnvironment`, `provisionDidProfile`, Docker/runtime helpers | `Off-chain only` | Integration-test bootstrap infrastructure. |

## Starter paths

If you need the shortest copyable entrypoint instead of a full package README, use:

- verifier contract starter:
  - `docs/templates/verifier-contract-template.compact.md`
- family package starter:
  - `docs/templates/family-scaffold-template.md`
- hidden-holder reference walkthrough:
  - `docs/guides/hidden-holder-hello-world.md`

These stay docs-only on purpose so they remain easy to copy without adding another compiled package surface.

## Recommended integrator workflow

### If you are writing a Layer 3 contract

Start with:

- `core/primitives/credentials/src/credentials/composable.compact`
- the relevant credential-family `.compact` entrypoint
- optional capability `.compact` entrypoints such as same-holder or the
  revocation registry contract

Avoid:

- `credentials-protocol`
- `credentials-openid`
- `credentials-offchain-did`
- `standalone-environment`

### If you are writing a wallet, verifier backend, or transport adapter

Start with:

- generated/runtime exports from `credentials` and the selected family package
- `credentials-openid` for envelope framing if needed
- `credentials-protocol` for reference orchestration patterns
- `credentials-status-registry` builders for prototype status flows

Avoid:

- treating demo contracts as canonical API
- treating runtime helpers as replacements for Compact verification semantics

### If you are integrating revocation/status today

Use:

- `registry/status-registry/src/revocation-registry.compact` for the
  on-chain registry contract
- `registry/status-registry/src/status-proof-protocol.compact` for
  verifier-facing status proof-protocol Compact types and validators in
  families or Layer 3 contracts
- `credentials-status-registry` TS builders off-chain
- `status-verification-protocol.md` for the current trust boundary

Remember:

- verifier/application supplies the accepted `(registryId, revokedRoot)` today
- contracts verify consistency against that supplied root
- final in-circuit revoked-set non-membership is still pending
