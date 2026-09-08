# Tooling

This top-level area owns repository support machinery rather than VC product
surfaces.

Current contents:

- repository validation scripts
- deterministic package and clean-consumer release checks
- generated release artifacts under `artifacts/`

Tooling may touch every top-level area, but runtime packages must not depend on
`tooling/`.
