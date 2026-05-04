# Midnight VC Profiles

Status: profile catalog for the current normative draft.

This document describes the currently supported Midnight VC holder-binding and
verification profiles.

It is companion material to:

- [`midnight-credentials.md`](./midnight-credentials.md)
- [`credential-status.md`](./credential-status.md)

## Purpose

The core spec defines the data model and proof model. This document defines the
currently recognized profile families and their intended scope.

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

Current implementation packages:
- [`../../credentials/README.md`](../../credentials/README.md)
- [`../../credentials-birth/README.md`](../../credentials-birth/README.md)
- [`../../credentials-demo-contract/README.md`](../../credentials-demo-contract/README.md)

Current test coverage:
- birth credential holder-binding tests
- birth protocol tests
- protocol explicit-holder lifecycle tests
- demo-contract verifier tests

Current limitations:
- on-chain DID-centric
- less privacy-preserving than hidden-holder profiles
- repository status/revocation support is still Level 0 as defined in
  `credential-status.md`

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
- [`../../credentials/README.md`](../../credentials/README.md)
- [`../../credentials-birth-secret/README.md`](../../credentials-birth-secret/README.md)
- [`../../credentials-protocol/README.md`](../../credentials-protocol/README.md)

Current test coverage:
- core secret-holder-binding tests
- birth-secret holder-binding tests
- age predicate tests
- protocol secret-holder lifecycle tests

Current limitations:
- production deployments still need explicit disclosure of holder-secret
  storage, randomness/nonce handling, and external adapter assumptions
- repository status/revocation support is still Level 0 as defined in
  `credential-status.md`

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
- [`../../credentials/README.md`](../../credentials/README.md)
- [`../../credentials-birth-secret/README.md`](../../credentials-birth-secret/README.md)
- [`../../credentials-protocol/README.md`](../../credentials-protocol/README.md)

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
- repository status/revocation support is still Level 0 as defined in
  `credential-status.md`

### 4. Verifier-domain pseudonym profile

Status:
- prototype

Purpose:
- derive pairwise pseudonyms from a hidden holder secret and verifier domain

Binding mechanism:
- `verifierScopedPseudonym(...)`
- hidden holder secret plus verifier domain hash

Current implementation packages:
- [`../../credentials/README.md`](../../credentials/README.md)
- [`../../credentials-protocol/README.md`](../../credentials-protocol/README.md)

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
- [`../../credentials-same-holder/README.md`](../../credentials-same-holder/README.md)
- composed by [`../../credentials-birth-secret/README.md`](../../credentials-birth-secret/README.md)

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
- carries:
  - holder DID state hash
  - holder method id digest
  - holder Jubjub public key
- holder method id rule:
  - normalized fragment
  - hashed into `Bytes<32>`

Current implementation packages:
- [`../../credentials/README.md`](../../credentials/README.md)
- [`../../credentials-offchain-did/README.md`](../../credentials-offchain-did/README.md)

Current test coverage:
- core lightweight holder-binding tests
- `credentials-offchain-did` runtime helper tests

Current limitations:
- intended for offchain-DID-only prototype flows
- mixed onchain/offchain DID combinations are intentionally out of scope
- the profile does not by itself prove resolver-backed DID semantics

### 7. Legacy compatibility Jubjub holder binding

Status:
- legacy compatibility profile

Purpose:
- smallest possible public-key holder binding for compatibility and non-DID
  demo flows

Binding mechanism:
- `JubjubHolderBinding`
- proof public key must match the bound Jubjub key

Current implementation packages:
- [`../../credentials/README.md`](../../credentials/README.md)

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

- raw `JubjubHolderBinding`
