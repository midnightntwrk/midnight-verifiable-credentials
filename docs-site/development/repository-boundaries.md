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
- make the VC core depend on a concrete family, protocol, application, or
  deployment environment

This documentation site is built entirely from this repository. The
`midnight-did` site is an architectural reference, not a build dependency.

## DID compatibility baseline

The `0.2.0` VC core is aligned with the public `midnight-did` `0.6.0` package
family for downstream signer-authorization adapters. This is a compatibility
baseline, not a package dependency: an application or credential-family
repository owns its DID dependency and translates a canonical DID verification
method into the VC core's fixed-width `VerificationMethodRef`.
