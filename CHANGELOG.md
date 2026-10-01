# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- add normative credential-family validation vectors executed through the
  public model API and packed-consumer boundary;
- bind both published Midnight DID Compact entrypoints to their exact extension
  or core-plus-extension circuit sets;
- add the canonical explicit-holder presentation-proof circuit with complete
  holder equality, signer-reference, accepted-key, derived-root, and signature
  composition;
- add reverse conformance coverage from normative Compact operations to shipped
  supported circuits;
- add a synthetic packed-package consumer proving a complete DID-backed VC/VP
  composition across the model, Compact, and DID packages with nonempty claims
  and targeted substitution rejection.

### Changed

- BREAKING: make typed Compact payload decoding fail closed unless descriptor
  re-encoding reproduces the exact payload, rejecting alternate zero-padded
  chunk widths and lossy descriptor round trips while preserving untyped chunk
  framing;
- narrow the Midnight DID binding's public resolver contract to the domain
  values it consumes and remove the full resolver implementation from its
  production dependency graph;
- make npm release verification fail closed when any non-selected dist-tag is
  added, removed, or changed, with explicit absent states for tracked channel
  tags;
- advance the release base to `0.3.0`, reject RC publication unless that base
  is newer than every catalog package's npm `latest` version, and reject stable
  publication when the base is older than a published `latest` tag.

## [0.2.0] - 2026-09-25

### Added

- restore `@midnight-ntwrk/credential-did-midnight` as a flat Midnight DID
  `0.7.0` binding extension with TypeScript resolution, composable Compact
  circuits, negative conformance vectors, and clean packed-consumer coverage;
- pin its Ledger `8.0.2` build profile and require explicit composition with
  core context-specific signature verification;
- add credential and presentation signing helpers that bind a supplied Midnight
  DID Jubjub secret to the canonical VC core challenge and self-verify the
  resulting proof;
- use hedged nonces bound to the secret, operation, signed inputs, and fresh
  entropy in the Ledger 8 signing helpers; and
- adopt Midnight DID 0.7 canonical big-endian Jubjub JWK coordinates through
  the public domain codec while preserving the native Compact point and binding
  root; historical 0.6 snapshots require re-resolution or an explicit,
  provenance-authenticated migration that preserves their observed DID state.

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
- establish the published `midnight-did` `0.7.0` package family as the current
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

Release evidence: [GitHub Release](https://github.com/midnightntwrk/midnight-verifiable-credentials/releases/tag/v0.2.0)
and [stable npm publication run](https://github.com/midnightntwrk/midnight-verifiable-credentials/actions/runs/36151434368).
