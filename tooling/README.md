# Tooling

This top-level area owns repository support machinery rather than VC product
surfaces.

Current contents:
- shared repository scripts
- artifact packaging support

Future contents:
- CI helpers
- metrics collectors
- repo-quality automation

Tooling may touch every top-level area, but runtime packages must not depend on
`tooling/`.
