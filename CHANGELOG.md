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

### Changed

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

### Removed

- removed runtime `StatusSupportLevel` from the status surface
- removed runtime `epoch` from the first revocation/status verification model

### Breaking

- `ProtocolStateCollection` now requires `entries()` for retention/pruning
  semantics in protocol state adapters
- status runtime surfaces no longer expose `StatusSupportLevel`
- status runtime surfaces no longer expose revocation `epoch`
