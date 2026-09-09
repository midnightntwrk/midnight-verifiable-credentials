# Tooling

This top-level area owns repository support machinery rather than VC product
surfaces.

Current contents:

- repository validation scripts
- deterministic package and clean-consumer release checks
- generated release tarballs under `artifacts/npm/`

Tooling may touch every top-level area, but runtime packages must not depend on
`tooling/`.

`pnpm run artifacts:pack` creates the tarballs for `supported` workspaces and
tests them from clean, non-workspace consumers. Private examples are never
packed. Generated `tooling/artifacts/npm/*.tgz` files are gitignored.
