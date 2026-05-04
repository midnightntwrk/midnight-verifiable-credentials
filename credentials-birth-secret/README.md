# @midnight-ntwrk/midnight-did-credentials-birth-secret

Secret-holder-binding birth-credential specialization for the generic Midnight VC/VP core.

Status:

- reference implementation

Surface classification:

- `On-chain + off-chain`
- Compact family entrypoints are the authoritative contract-authoring surface
- generated/runtime TypeScript exports are off-chain mirrors only

Start here:

1. use this package when you need the current hidden-holder reference family
2. write contracts and family composition against the Compact entrypoints
3. use generated/runtime exports only in off-chain verifiers, wallets,
   protocol adapters, and tests
4. read [`../docs/guides/integration-surface-map.md`](../docs/guides/integration-surface-map.md)
   and [`../docs/spec/status-verification-protocol.md`](../docs/spec/status-verification-protocol.md)
   before adopting prototype status-aware flows

Related docs:

- spec: [`../docs/spec/midnight-credentials.md`](../docs/spec/midnight-credentials.md)
- profiles: [`../docs/spec/profiles.md`](../docs/spec/profiles.md)
- conformance: [`../docs/spec/conformance.md`](../docs/spec/conformance.md)
- credential status: [`../docs/spec/credential-status.md`](../docs/spec/credential-status.md)
- status verification protocol: [`../docs/spec/status-verification-protocol.md`](../docs/spec/status-verification-protocol.md)
- companion guide: [`../docs/guides/midnight-credentials-for-dummies.md`](../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../docs/testing/test-matrix.md`](../docs/testing/test-matrix.md)

## Purpose

This package defines the reference birth-credential family for flows that use a
hidden holder-binding secret instead of an explicit holder DID method
reference.

It sits next to the explicit holder-binding package:

- [`../credentials-birth`](../credentials-birth/README.md): explicit DID-bound holder profile
- [`../credentials`](../credentials/README.md): generic VC/VP envelope and proof core
- [`../credentials-same-holder`](../credentials-same-holder/README.md): optional same-holder composition capability for hidden-holder flows

This package defines the secret-bound variant on top of the generic
[`credentials`](../credentials/README.md) package.

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

- `BirthCredentialClaims`
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

Important distinction:

- the plain secret-holder proof/profile semantics in this family are already a
  stable reference hidden-holder capability
- the blinded-secret issuance/presentation transport contract layered around
  that capability is still a production-hardening track
- the status-aware verification additions in this package are prototype
  capability surfaces, not final production revocation support
- in particular:
  - `AuthorityAttestedStatusCapability` is a transitional Layer 3 bridge that
    still depends on verifier/application-supplied `(registryId, revokedRoot)`
  - `RevokedSetNonMembershipStatusCapability` is currently a capability and
    witness surface, not yet final in-circuit non-membership enforcement

## Why this package exists

This package demonstrates the privacy-oriented branch of the design:

- the issuer does not bind the credential to a public holder DID method
- the holder proves control through a hidden secret witness
- optional same-holder composition can be added without forcing every credential family to adopt it

## Build and test

- Compile Compact artifacts: `npm run contract -w credentials-birth-secret`
- Build TS exports: `npm run build -w credentials-birth-secret`
- Run tests: `npm test -w credentials-birth-secret`
