# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- added `credentials-status-registry` as the prototype status / revocation
  registry package with:
  - verifier-supplied `RevokedSetStatusRequest`
  - authority-attested status proof helpers
  - witness-builder helpers
- added a focused Layer 3 status-aware revocation demo under
  `credentials-demo-contract`:
  - `src/demo-revocation.compact`
  - revocation simulator and witness helpers
  - dedicated test coverage
- added `ci:revocation` and a dedicated GitHub Actions lane for the revocation
  demo path
- added an integration surface map and package maturity backlog for VC
  integrators and maintainers
- the core TypeScript package now exports `OffchainDIDHolderBinding` as the
  preferred public-facing alias for the existing
  `OffchainMidnightHolderBinding` Compact/runtime shape.
- added stable `./contract` package subpaths for the primary VC/family/demo
  packages so integrators can import explicit contract-facing surfaces without
  depending on duplicate root namespace exports:
  - `credentials`
  - `credentials-birth`
  - `credentials-birth-secret`
  - `credentials-same-holder`
  - `credentials-demo-contract`
- added a stable `./contract-revocation` package subpath for
  `credentials-demo-contract`.

### Changed

- BREAKING: the VC status model no longer carries runtime `epoch` and
  `StatusSupportLevel` fields. Freshness remains a verifier/application
  responsibility via the accepted `(registryId, revokedRoot)` pair.
- BREAKING: the primary VC/family/demo root TypeScript entrypoints no longer
  publish duplicate `*Contract` namespace aliases. Contract-facing imports
  should now use the explicit stable package subpaths such as `./contract` and
  `./contract-revocation`.
- BREAKING: status architecture is being normalized around shared VC-side
  status binding plus presentation-time status proof protocols. New additive
  runtime types include:
  - `NoStatusBinding`
  - `RegistryBoundStatusBinding`
  - `AuthorityAttestedStatusProofProtocol`
  - `RevokedSetNonMembershipStatusProofProtocol`
- clarified the current status capability taxonomy across the specs and package
  READMEs:
  - `NoStatusCapability`
  - `AuthorityAttestedStatusCapability`
  - `RevokedSetNonMembershipStatusCapability`
- clarified the trust boundary for current status-aware verification:
  verifier/application supplies the accepted `(registryId, revokedRoot)`
- documented `credentials-status-registry` as a first-class workspace package
- documented the rule that demo contracts stay small, business-facing, and
  capability-specific
- BREAKING: `signAuthorityAttestedStatusProof(...)` now derives its signing
  nonce internally. Integrations that still need an explicit nonce override
  must call `unsafeSignAuthorityAttestedStatusProofWithNonceScalar(...)`
  intentionally instead of passing `nonceScalar` into the safe helper.
- BREAKING: `VerifierStatusPolicy` now carries explicit
  `enforceAttestationMaxAge` / `maxAttestationAge` fields so
  authority-attested status freshness can be enforced by verifier policy
  instead of only by absolute attestation expiration.
- BREAKING: `credentials-birth-secret` status-aware wrapper proofs now sign a
  status-bound family body root that commits the shared
  `RegistryBoundStatusBinding`. The secret-birth family now supports only the
  `SecretBirthCredentialWithStatusBinding` wrapper surface; the legacy
  `SecretBirthCredentialWithStatusCapability` and
  `SecretBirthCredentialWithAuthorityAttestedStatusCapability` wrappers have
  been removed. Integrations must no longer reuse the plain base-credential
  proof for the status-bound wrapper surface. This rollout currently applies
  to the secret-birth family only; non-secret birth family proofs have not
  changed yet.
- normalized status ownership in code:
  - shared VC-side status binding remains in `credentials`
  - registry-facing proof-protocol Compact types and validators now live in
    `credentials-status-registry`
  - hidden-holder family and revocation-aware demo flows now import the
    registry-facing proof surface from `credentials-status-registry`
  - managed/runtime consumers should now import
    `RevokedSetStatusRequest`,
    `AuthorityAttestedStatusProofProtocol`, and
    `RevokedSetNonMembershipStatusProofProtocol` from
    `credentials-status-registry` rather than `credentials`
- BREAKING: `RevocationRegistryState` now carries a mandatory
  `registryVersion` field. Verifier-side snapshots, revoked-set requests,
  witness inputs, and authority-attested status statements must now carry the
  contract version they were observed against. `assertStateUsesThisRegistry(...)`
  now binds snapshots to both the live `registryId` and the live contract
  version, even though the Merkle `revokedRoot` itself remains verifier-supplied
  until the final in-circuit root-binding path lands.
- BREAKING: the generic Compact credential envelope is now split into a thin
  `VC<TClaims, THolderBinding, TStatusBinding>` plus a separate
  `VP<TDisclosures, THolderBinding>` module. Credential bodies now carry an
  explicit `statusBinding` field, so credential body roots and issuer proofs
  change for all families that instantiate the shared core.
- BREAKING: generic presentation-envelope validation is now split between:
  - `VP.assertValidPresentationEnvelope(presentation)`
  - `CredentialPresentationRelations.assertMatchingCredentialPresentation(...)`
  Consumers must no longer treat `assertValidPresentationEnvelope` as the
  credential/presentation linkage helper.
- BREAKING: VC-side status binding validators now live entirely in
  `credentials/status-bindings.compact`, while protocol-facing status
  capability and verifier-policy vocabulary now live in
  `credentials-status-registry/status-proof-protocol.compact`. Managed/runtime
  consumers must import `StatusCapabilityKind`, `VerifierStatusPolicy`,
  `RevokedSetNonMembershipStatusCapability`, and
  `AuthorityAttestedStatusCapability` from
  `credentials-status-registry` rather than `credentials`.
- BREAKING: the secret-birth status-bound family body root no longer hashes an
  extra `StatusBindingKind` discriminator. The concrete VC-side binding root
  is now the only status-specific extension layered onto the base credential
  body for those wrapper surfaces.
- BREAKING: `credentials-status-registry` TypeScript helpers are now
  binding-first for intermediate status construction:
  - `buildAuthorityAttestedStatusCapability(...)` is removed
  - `buildRevokedSetStatusCapability(...)` is renamed to
    `buildRevokedSetStatusBinding(...)`
  - `BuiltRevokedSetStatusWitness.statusCapability` is removed
- Holder-binding naming is now explicitly split between:
  - Compact/core struct name:
    `OffchainMidnightHolderBinding`
  - preferred public-facing TypeScript alias:
    `OffchainDIDHolderBinding`

### Fixed

- `ProtocolStateCollection` now requires `entries()` for retention/pruning
  semantics in protocol state adapters; the reference helpers now handle
  snapshot-based pruning and tied-timestamp retention more explicitly.
- protocol-state retention helpers now support optional batch deletion via
  `deleteMany(keys)` and skip unnecessary collection scans when finalized
  outcome capacity is zero.
- the package-boundary guard now also blocks duplicate root `*Contract`
  namespace aliases for the curated VC/family/demo package entrypoints.
- The revocation demo no longer duplicates the revoked-set status request
  struct that now lives in the shared hidden-holder family surface.
