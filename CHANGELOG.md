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
- Holder-binding naming is now explicitly split between:
  - Compact/core struct name:
    `OffchainMidnightHolderBinding`
  - preferred public-facing TypeScript alias:
    `OffchainDIDHolderBinding`

### Fixed

- `ProtocolStateCollection` now requires `entries()` for retention/pruning
  semantics in protocol state adapters; the reference helpers now handle
  snapshot-based pruning and tied-timestamp retention more explicitly.
- The revocation demo no longer duplicates the revoked-set status request
  struct that now lives in the shared hidden-holder family surface.
