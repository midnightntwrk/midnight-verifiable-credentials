# @midnight-ntwrk/midnight-did-credentials-birth-secret

> Maturity: `reference`
> Package class: `dist`

Secret-holder-binding birth-credential specialization for the generic Midnight VC/VP core.

Status:

- reference implementation

Tier:

- credential-family package

Dependency direction:

- depends on reusable core packages and selected reusable capability packages
- may be composed by Layer 3 contracts and Layer 4 adapters
- status-aware consumers must treat the current status path as prototype-shaped
  until the final cryptographic contract lands

Reusable outside this repo:

- yes, with prototype status-path caveats

Surface classification:

- `On-chain + off-chain`
- Compact family entrypoints are the authoritative contract-authoring surface
- generated/runtime TypeScript exports are off-chain mirrors only

Start here:

1. use this package when you need the current hidden-holder reference family
2. write contracts and family composition against the Compact entrypoints
3. use generated/runtime exports only in off-chain verifiers, wallets,
   protocol adapters, and tests
4. read [`../../../../docs/guides/integration-surface-map.md`](../../../../docs/guides/integration-surface-map.md)
   and [`../../../../docs/spec/status-verification-protocol.md`](../../../../docs/spec/status-verification-protocol.md)
   before adopting prototype status-aware flows

Related docs:

- spec: [`../../../../docs/spec/midnight-credentials.md`](../../../../docs/spec/midnight-credentials.md)
- profiles: [`../../../../docs/spec/profiles.md`](../../../../docs/spec/profiles.md)
- conformance: [`../../../../docs/spec/conformance.md`](../../../../docs/spec/conformance.md)
- credential status: [`../../../../docs/spec/credential-status.md`](../../../../docs/spec/credential-status.md)
- status verification protocol: [`../../../../docs/spec/status-verification-protocol.md`](../../../../docs/spec/status-verification-protocol.md)
- companion guide: [`../../../../docs/guides/midnight-credentials-for-dummies.md`](../../../../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../../../../docs/testing/test-matrix.md`](../../../../docs/testing/test-matrix.md)

## Purpose

This package defines the reference birth-credential family for flows that use a
hidden holder-binding secret instead of an explicit holder DID method
reference.

It sits next to the explicit holder-binding package:

- [`../birth`](../birth/README.md): explicit DID-bound holder profile
- [`../../../../packages/core/primitives/credentials`](../../../../packages/core/primitives/credentials/README.md): generic VC/VP envelope and proof core
- [`../../../../packages/core/capabilities/same-holder`](../../../../packages/core/capabilities/same-holder/README.md): optional same-holder composition capability for hidden-holder flows

This package defines the secret-bound variant on top of the generic
[`credentials`](../../../../packages/core/primitives/credentials/README.md) package.

It owns the schema-specific parts that should not live in the generic core:

- birth claim commitments
- secret birth-credential schema validation
- typed secret birth-credential presentation requests
- secret holder-binding witness validation
- birth-country disclosure binding
- age-over-threshold predicate validation

## Relationship to the generic core

The generic package owns:

- proof container types
- DID method identifiers
- explicit and secret holder-binding primitives
- generic VC/VP envelope types
- generic proof-binding checks
- generic credential/presentation linking checks

This package owns:

- `BirthCredentialClaimCommitments`
- `SecretBirthCredentialDisclosures`
- `SecretBirthCredentialPresentationRequest`
- `SecretBirthCredentialIssuanceOffer`, `SecretBirthCredentialIssuanceRequest`, `SecretBirthCredentialIssuanceResult`
- `SecretBirthCredentialVerificationRequest`, `SecretBirthCredentialVerificationSubmission`, `SecretBirthCredentialVerificationResult`
- `SecretBirthCredential`
- `SecretBirthCredentialPresentation`
- birth-specific commitment helpers
- secret-holder-binding validation, request, and predicate circuits
- generated protocol message families built on the generic issuance / presentation protocol modules
- concrete same-holder composition for secret birth credentials by composing the dedicated same-holder capability package

## Current supported scope

This package supports the reference blinded-secret issuance and presentation
happy path used by `credentials-protocol`. A credential can be bound to a
hidden holder secret commitment and later satisfied with a private holder
witness plus a verifier challenge.

What it does prove:

- Compact-generated blinded issuance offer/request/result message families
- Compact-generated secret-holder presentation request/submission/result
  message families
- issuer proof over the credential body
- matching secret holder-binding commitment between credential and presentation
- holder knowledge of the committed secret through a private witness
- challenge-bound response derived from the holder secret
- verifier-scoped pseudonym derivation from the hidden holder secret
- same-holder composition across two or three secret birth credentials when the verifier coordinates a shared challenge
- prototype status-aware verification using:
  - same-contract live status witnesses for contracts that own the live
    revocation set directly
  - verifier-supplied `(registryId, revokedRoot)`
  - revoked-set status capability binding
  - authority-attested status proofs for Layer 3 transitional verification

What it does not yet prove:

- production transport interoperability for the blinded-secret issuance path
- production transport interoperability for the blinded-secret presentation path
- durable protocol state across retries, restarts, or delayed delivery
- production randomness / nonce policy by itself; callers must still provide a
  production-grade implementation over the now-injectable protocol randomness
  interface
- presentation-side message-level expiry semantics
- final in-circuit revoked-set non-membership verification
- final contract-proven live Merkle-root binding for revocation state
- production-ready revocation semantics

Current status-contract boundary for this family:

- the family now participates in the repository's completed repo-owned
  `VC-MAT-20` delivery:
  - issuer-signed `RegistryBoundStatusBinding`
  - same-contract live-state verification path
  - observed-snapshot and authority-attested status helper paths
  - hard-invalidity `revoked` semantics
- the remaining gap is the future generic root-bound in-circuit proof path,
  not missing family-local status wiring

Important distinction:

- the plain secret-holder proof/profile semantics in this family are already a
  stable reference hidden-holder capability
- the blinded-secret issuance/presentation transport contract layered around
  that capability is still a production-hardening track
- the status-aware verification additions in this package are prototype
  capability surfaces, not final production revocation support
- in particular:
  - the status-aware wrapper proofs in this family now commit the shared
    `RegistryBoundStatusBinding` into an issuer-signed status-bound body root
  - if accepted status evidence says the credential is revoked, the family
    treats that as hard VC/VP invalidity rather than a softer business-policy
    denial result
  - `AuthorityAttestedStatusCapability` is still a transitional Layer 3 bridge
    that depends on verifier/application-supplied `(registryId, revokedRoot)`
    even though the wrapper proof now commits the VC-side binding
  - the family now also exposes a live-status request + witness path for
    same-contract verification prototypes that bind directly to a contract's
    local live revoked-set state without reusing the external snapshot shape
  - `RevokedSetNonMembershipStatusCapability` now commits the VC-side binding
    in the wrapper proof, but it is still not the final in-circuit
    non-membership enforcement path

## Why this package exists

This package demonstrates the privacy-oriented branch of the design:

- the issuer does not bind the credential to a public holder DID method
- the holder proves control through a hidden secret witness
- optional same-holder composition can be added without forcing every credential family to adopt it

## Claim Representation

This family uses the
[`claim-representation`](../../../../docs/spec/claim-representation.md) taxonomy as
follows:

- birth date, birth country, credential status, and holder-linkable data are
  `committedPrivate` values represented as commitments in the signed credential
  body
- age-over-threshold checks are `predicateOnly` witness paths over the committed
  birth-date value
- verifier-scoped pseudonym and same-holder witnesses are hidden-holder
  capability data, not public direct credential claims
- no field in this family is intentionally modeled as an always-public direct
  claim

## Build and test

- Compile Compact artifacts: `pnpm --dir credentials-birth-secret run contract`
- Build TS exports: `pnpm --dir credentials-birth-secret run build`
- Run tests: `pnpm --dir credentials-birth-secret run test`
