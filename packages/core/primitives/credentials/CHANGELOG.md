# Changelog

All notable changes to `@midnight-ntwrk/midnight-did-credentials` are recorded
in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- request-scoped hidden-holder pseudonym records and circuits binding verifier
  identity, deployment, audience, origin, consent, request, and challenge;
- comparison-only Compact trusted-time helpers for ledger seconds, Unix days,
  and validity intervals, consumed directly by private authoritative contracts
  and deliberately excluded from canonical reusable Compact composition;
- canonical request-, holder-action-, and credential-action replay-scope records,
  action bindings, and fixed-policy decision-nullifier derivation helpers with
  Compact/TypeScript parity vectors;
- final injected Verification V1 execution boundaries for ledger-local,
  ledger-attested, and public-only off-chain profiles, including differential
  classification evidence and bounded provider/transaction failure labels; and
- committed-transaction confirmation plus exact transcript, evidence receipt,
  decision nullifier, and atomic business-mutation binding before a result may
  claim ledger authority.

### Changed

- defined the package as a private pre-1.0 release candidate for local tarball
  distribution;
- declared an ESM-only JavaScript surface and explicit Compact source exports;
- added a browser-safe `./jubjub` export and clean installed-tarball consumer
  checks for Node ESM, TypeScript, bundlers, and Compact;
- bounded the Compact runtime dependency to compatible `0.15.x` releases; and
- restricted the tarball to runtime output, audited Compact source, licensing,
  documentation, changelog, and package metadata.

## [0.1.0] - 2026-07-16

### Added

- initial reusable Compact-first VC and VP primitive package.
