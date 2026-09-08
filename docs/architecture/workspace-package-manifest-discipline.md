# Workspace Package Manifest Discipline

Every retained workspace is either a distributable library or the private
synthetic composition fixture.

## Distributable libraries

Internal libraries set `private: true`. Supported libraries set `private: false`
and use the approved npmjs `publishConfig`. All libraries declare:

- `license: "Apache-2.0"`
- `type: "module"`
- explicit JavaScript and declaration entrypoints
- an `exports` map whose targets are included in `files`
- package-local build, test, lint, typecheck, and clean scripts
- `workspace:*` for dependencies owned by this repository

Packages exposing Compact source include that source in their tarball contract.
Generated artifacts are included only through an audited export and artifact
policy.

## Synthetic fixture

`examples/core-composition` is private and has no publication contract. It
exercises supported package entrypoints from a clean composition boundary and
must not grow product data, protocols, deployment infrastructure, or concrete
credential schemas.

## Authoritative inventory

Keep these files aligned:

- `package.json#workspaces`
- `pnpm-workspace.yaml`
- `tooling/scripts/workspace-catalog.mjs`

Validate changes with:

```bash
pnpm run check:workspace-catalog
pnpm run check:workspace-manifests
pnpm run check:release-package-contract
```
