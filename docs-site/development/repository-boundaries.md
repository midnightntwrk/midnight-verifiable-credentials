# Repository Boundaries

Every `midnight-*` repository is an independent source and release boundary.

## Allowed

- depend on packages published by the owning repository
- use immutable package tarballs supplied by workspace-root automation before a
  package is published
- link to public documentation and immutable release evidence

## Forbidden

- import source, generated files, or `dist` trees from a sibling repository
- use relative filesystem dependencies across repositories
- make the VC core depend on a concrete credential schema, protocol,
  application, or deployment environment

This documentation site is built entirely from this repository. The
`midnight-did` site is an architectural reference, not a build dependency.

## DID compatibility baseline

The selected issue-754 migration aligns the optional binding with exact public
`midnight-did` domain/Schnorr `1.0.0-rc1` packages and uses DID RC1 only as a
development compatibility dependency. Strict selected-runtime consumers and
bounded native signer proofs pass; see the [migration guide](/development/ledger9-migration).
The core remains independent of DID packages. An application owns resolver
configuration, DID lifecycle and snapshot trust; the thin binding maps canonical
methods into the core's fixed-width `VerificationMethodRef`. Do not add DID-api,
wallet or deployment infrastructure to consume this cohort.
