# Changelog

All notable changes to `@midnight-ntwrk/midnight-did-credentials` are recorded
in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
