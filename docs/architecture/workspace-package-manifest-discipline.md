# Workspace Package Manifest Discipline

Target branch: `develop`.

This repository has three workspace package shapes. Keep the shape explicit so
local tarballs, CI restored artifacts, and downstream examples consume the same
surface that maintainers review.

## Package Classes

| Class | Workspaces | Manifest contract |
|---|---|---|
| Dist package | Core, registry, adapters, protocol, credential families, verifier contracts, university protocol/reporting | `license`, `private`, `type`, `main`, `module`, `types`, root `exports`, and `files` point at `dist/**` plus minimal metadata |
| Source-only integration package | `components/integration/standalone-environment` | private source package with `src/**/*.ts` files only; no dist export map is promised |
| Scenario package | `use-cases/*/scenarios` | private executable package with no publish entrypoint or tarball surface |

## Dist Package Rules

Dist packages must expose:

- `license: "Apache-2.0"`
- `private: true`
- `type: "module"`
- `main: "dist/index.js"`
- `module: "dist/index.js"`
- `types: "./dist/index.d.ts"`
- `exports["."]` with `types`, `import`, and `default`
- `files` containing:
  - `dist/**`
  - `README.md`
  - `package.json`
  - `tsconfig.json`
  - `tsconfig.build.json`

If the package has Compact sources under `src/`, its `files` list must also
include `src/**/*.compact` so generated tarballs keep the Compact source
contract visible to auditors.

## Scenario Package Rules

BDD scenario packages are executable harnesses, not library surfaces. They must:

- be `private`
- carry `license: "Apache-2.0"`
- use `type: "module"`
- declare Node/npm engine requirements
- avoid `main`, `types`, `exports`, and `files`

## Source-Only Integration Rule

`components/integration/standalone-environment` remains source-only because it
is a local integration harness over vendored DID tarballs and Testcontainers. It
must stay private and declare its source files explicitly rather than pretending
to be a dist package.

## Guard

Run:

```bash
npm run check:workspace-manifests
```

The guard is also part of `npm run ci:lint`. Update the guard and this document
in the same PR when adding a new workspace package class or intentionally
changing a package entrypoint.
