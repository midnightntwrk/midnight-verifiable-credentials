# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- restore `@midnight-ntwrk/credential-did-midnight` as a flat Midnight DID
  `0.6.0` binding extension with TypeScript resolution, composable Compact
  circuits, negative conformance vectors, and clean packed-consumer coverage.
- pin its Ledger `8.0.2` build profile and require explicit composition with
  core context-specific signature verification.

## [0.2.0] - 2026-09-18

### Changed

- BREAKING: reset the repository to a protocol-independent VC/VP specification,
  conformance suite, TypeScript model, and generic Compact implementation.
- BREAKING: reduce the initial public release graph to
  `@midnight-ntwrk/credential-model` and
  `@midnight-ntwrk/credential-compact` for `0.2.0-rc1`; the bounded
  `credential-did-midnight` extension joins the graph in `0.2.0-rc2`.
- BREAKING: narrow `@midnight-ntwrk/credential-model` to generic family and
  claim-schema metadata; runtime composition, artifact, and codec contracts now
  belong to credential-family and application repositories.
- BREAKING: remove the single-value status discriminator; registry-bound status
  values have a new persistent hash in `0.2.0-rc1`.
- BREAKING: replace the DID-specific `didContractAddress` verification-method
  field with the controller-neutral `controllerAddress` field.
- reject zero controller addresses for every validated verification-method
  reference and validate explicit holder references before equality checks.
- upgrade the Compact compiler to `0.31.1` and
  `@midnight-ntwrk/compact-runtime` to `0.16.0`.
- collapse local and CI validation into one non-Docker core gate.
- require publication to preflight, publish, and verify the complete supported
  package set while preserving the existing npm `latest` tag for prereleases.
- establish the published `midnight-did` `0.6.0` package family as the current
  adapter compatibility baseline while keeping its runtime dependencies in the
  optional binding extension rather than the VC core.

### Removed

- concrete credential families, product use cases, applications, and business
  verification contracts;
- OID4VC, DIDComm, connector, wallet, session, and transport implementations;
- DID adapters, proof execution, status-registry services, deployment assembly,
  display policy, and runtime discovery packages;
- compatibility aliases, cross-repository source links, vendored dependency
  tarballs, legacy runners, and product-specific CI infrastructure; and
- superseded architecture documents for those deleted systems.

Removed experiments remain available in Git history. Credential families and
applications now belong in independently versioned repositories that consume
the supported building-block packages.
