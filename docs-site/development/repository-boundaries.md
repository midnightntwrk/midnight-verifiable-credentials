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
