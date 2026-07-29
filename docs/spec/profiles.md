# Midnight VC Profiles

Status: profile catalog for the current normative draft.

This document describes the currently supported Midnight VC holder-binding and
verification profiles.

It is companion material to:

- [`midnight-credentials.md`](./midnight-credentials.md)
- [`claim-representation.md`](./claim-representation.md)
- [`credential-status.md`](./credential-status.md)
- [`revocation-registry.md`](./revocation-registry.md)
- [`../architecture/holder-binding-terminology.md`](../architecture/holder-binding-terminology.md)

## Purpose

The core spec defines the data model and proof model. This document defines the
currently recognized profile families and their intended scope.

## Canonical terminology

Use [`../architecture/holder-binding-terminology.md`](../architecture/holder-binding-terminology.md)
as the naming authority when profile names, compatibility aliases, or
public/runtime adapter names appear in specs or package README files.

In short:

- `OffchainDIDHolderBinding` is the preferred runtime/public TypeScript name
  for the offchain DID adapter profile.
- `OffchainMidnightHolderBinding` remains the Compact/core struct name and
  should be described as such whenever it appears.
- `JubjubHolderBinding` is a legacy compatibility/minimal non-DID profile, not
  the default for new DID-shaped work.
- `hidden-holder` is an umbrella adjective; concrete implementation profiles
  should still be named `secret holder binding` or
  `blinded secret holder binding`.

Each profile section below states:

- status
- intended use
- binding mechanism
- current implementation packages
- current test coverage
- known limitations

## Profile taxonomy

### 1. Explicit DID holder binding

Status:
- reference implementation

Purpose:
- bind a credential holder to a public DID verification method reference

Binding mechanism:
- `ExplicitHolderBinding`
- holder proof is checked against `Proof.signerVerificationMethodRef`
- DID verification material follows the `midnight-did` JWK projection. The
  on-ledger representation stores canonical opaque `publicKeyJwk.x` and
  `publicKeyJwk.y` strings for Ed25519, X25519, P-256, and secp256k1 material.
  `Ed25519` and `X25519` resolve to OKP/x-only JWKs, so their ledger `y` value
  must remain the empty-string sentinel and must not be surfaced in DID
  documents. See
  [`../guides/did-integration-modes.md#did-key-normalization-compatibility`](../guides/did-integration-modes.md#did-key-normalization-compatibility)
  for the runtime compatibility checks.

Current implementation packages:
- [`../../packages/core/primitives/credentials/README.md`](../../packages/core/primitives/credentials/README.md)
- [`../../packages/prototypes/credential-families/birth/README.md`](../../packages/prototypes/credential-families/birth/README.md)
- [`../../packages/use-cases/age-gate/contract/README.md`](../../packages/use-cases/age-gate/contract/README.md)

Current test coverage:
- birth credential holder-binding tests
- birth protocol tests
- protocol explicit-holder lifecycle tests
- demo-contract verifier tests
- DID key-normalization package tests for Ed25519/X25519 x-only JWKs and
  Jubjub/P-256/secp256k1 EC coordinate preservation

Current limitations:
- on-chain DID-centric
- less privacy-preserving than hidden-holder profiles
- this explicit-holder family currently remains at the zero-status end of the
  repository taxonomy
- current status binding is:
  - `NoStatusBinding`

### 2. Secret holder binding

Status:
- reference implementation

Purpose:
- bind the holder through a hidden secret witness rather than a public DID
  method

Binding mechanism:
- `SecretHolderBinding`
- commitment over holder secret
- verifier challenge response derived from the holder secret

Current implementation packages:
- [`../../packages/core/primitives/credentials/README.md`](../../packages/core/primitives/credentials/README.md)
- [`../../packages/prototypes/credential-families/birth-secret/README.md`](../../packages/prototypes/credential-families/birth-secret/README.md)
- [`../../packages/registry/status-registry/README.md`](../../packages/registry/status-registry/README.md)
- [`../../packages/components/orchestration/protocol/README.md`](../../packages/components/orchestration/protocol/README.md)

Current test coverage:
- core secret-holder-binding tests
- birth-secret holder-binding tests
- age predicate tests
- protocol secret-holder lifecycle tests

Current limitations:
- production deployments still need explicit disclosure of holder-secret
  storage, randomness/nonce handling, and external adapter assumptions
- the secret birth family now carries prototype status-aware verification
  surfaces, but the repository does not yet claim final production revocation
  support
- current prototype status model is:
  - shared registry-bound status binding in the VC family
  - `AuthorityAttestedStatusProofProtocol`
  - `RevokedSetNonMembershipStatusProofProtocol`

### 3. Blinded secret holder binding

Status:
- reference implementation / production-hardening in progress

Purpose:
- support privacy-oriented issuance/presentation flows where the issuer should
  not learn the final usable holder-bound material directly

Binding mechanism:
- `BlindedSecretHolderBinding`
- blinded holder-secret commitment plus issuer nonce

Current implementation packages:
- [`../../packages/core/primitives/credentials/README.md`](../../packages/core/primitives/credentials/README.md)
- [`../../packages/prototypes/credential-families/birth-secret/README.md`](../../packages/prototypes/credential-families/birth-secret/README.md)
- [`../../packages/registry/status-registry/README.md`](../../packages/registry/status-registry/README.md)
- [`../../packages/components/orchestration/protocol/README.md`](../../packages/components/orchestration/protocol/README.md)

Current test coverage:
- core holder-binding tests
- secret-holder issuance tests with Compact offer/request/result validation
- secret-holder lifecycle integration tests

Current limitations:
- durable pending-state behavior across retries, restarts, or delayed delivery
  is not yet complete
- production randomness / nonce interfaces are not yet complete
- the reference protocol now models envelope-level presentation request and
  submission expiry, but the credential family still does not define final
  body-level timeout fields or an external interoperable timeout contract
- production transport interoperability is still evolving
- the credential family now carries prototype status-aware verification
  surfaces, but the repository does not yet claim final production revocation
  support
- current prototype status model is:
  - shared registry-bound status binding in the VC family
  - `AuthorityAttestedStatusProofProtocol`
  - `RevokedSetNonMembershipStatusProofProtocol`

### 4. Verifier-domain pseudonym profile

Status:
- prototype

Purpose:
- derive pairwise pseudonyms from a hidden holder secret and verifier domain

Binding mechanism:
- `verifierScopedPseudonym(...)`
- hidden holder secret plus verifier domain hash

Current implementation packages:
- [`../../packages/core/primitives/credentials/README.md`](../../packages/core/primitives/credentials/README.md)
- [`../../packages/components/orchestration/protocol/README.md`](../../packages/components/orchestration/protocol/README.md)

Current test coverage:
- secret-holder pseudonym protocol tests

Current limitations:
- still attached to hidden-holder prototype flows
- not yet described as a standalone production profile

### 5. Same-holder composition profile

Status:
- reference capability package

Purpose:
- prove that two or three holder-bound credentials are satisfied by the same
  hidden holder secret witness

Binding mechanism:
- same-holder witness-equality circuits over secret/blinded-secret bindings

Current implementation packages:
- [`../../packages/core/capabilities/same-holder/README.md`](../../packages/core/capabilities/same-holder/README.md)
- composed by [`../../packages/prototypes/credential-families/birth-secret/README.md`](../../packages/prototypes/credential-families/birth-secret/README.md)

Current test coverage:
- same-holder capability tests
- birth-secret same-holder tests
- protocol same-holder tests

Current limitations:
- currently specialized to hidden-holder flows
- not yet generalized as a universal multi-credential presentation bundle

### 6. Offchain DID holder binding

Status:
- preferred lightweight DID-shaped profile for offchain/prototype flows

Purpose:
- support portable, lightweight Midnight DID-shaped flows without full DID
  deployment/resolution

Binding mechanism:
- public-facing runtime name:
  - `OffchainDIDHolderBinding`
- current Compact/core shape:
  - `OffchainMidnightHolderBinding`
- current core TypeScript package export:
  - `OffchainDIDHolderBinding`
  - as an alias over the core Compact/runtime shape
- carries:
  - holder DID state hash
  - holder method id digest
  - holder Jubjub public key
- holder method id rule:
  - normalized fragment
  - hashed into `Bytes<32>`

Current implementation packages:
- [`../../packages/core/primitives/credentials/README.md`](../../packages/core/primitives/credentials/README.md)
- [`../../packages/components/adapters/offchain-did/README.md`](../../packages/components/adapters/offchain-did/README.md)

Current test coverage:
- core lightweight holder-binding tests
- `packages/components/adapters/offchain-did` runtime helper tests

Current limitations:
- intended for offchain-DID-only prototype flows
- mixed onchain/offchain DID combinations are intentionally out of scope
- the profile does not by itself prove resolver-backed DID semantics
- the naming transition is intentionally split:
  - Compact/core struct remains `OffchainMidnightHolderBinding`
  - runtime/public-facing adapter name is `OffchainDIDHolderBinding`

### 7. Legacy compatibility Jubjub holder binding

Status:
- legacy compatibility profile

Purpose:
- smallest possible public-key holder binding for compatibility and non-DID
  demo flows

Binding mechanism:
- legacy compatibility `JubjubHolderBinding`
- proof public key must match the bound Jubjub key

Current implementation packages:
- [`../../packages/core/primitives/credentials/README.md`](../../packages/core/primitives/credentials/README.md)

Current test coverage:
- lightweight holder-binding tests
- profile-specific negative-path tests in the core credentials package

Current limitations:
- not preferred for new DID-shaped flows
- kept mainly as a minimal primitive and compatibility profile

## Recommended profile choices

Use:

- explicit DID holder binding:
  - when on-chain DID verification method references are part of the trust model
- secret holder binding:
  - when privacy and hidden holder control are the primary concern
- offchain DID holder binding:
  - for lightweight DID-shaped prototypes and demos
- same-holder:
  - only when multi-credential holder correlation is required

Avoid for new DID-shaped work:

- raw legacy compatibility `JubjubHolderBinding`
