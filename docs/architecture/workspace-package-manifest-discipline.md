# Workspace Package Manifest Discipline

Target branch: `develop`.

This repository has three workspace package shapes. Keep the shape explicit so
local tarballs, CI restored artifacts, and downstream examples consume the same
surface that maintainers review.

Each workspace package also declares checked Midnight metadata:

```json
"midnight": {
  "maturity": "core | reference | lab | demo | infrastructure",
  "packageClass": "dist | scenario | source-only",
  "releaseStage": "candidate | supported"
}
```

The metadata answers two different questions:

- `maturity` tells humans how to treat the package when composing examples,
  specs, and downstream demos.
- `packageClass` tells tooling which manifest surface the package is allowed to
  expose.
- `releaseStage` is omitted for internal workspaces. Candidate and supported
  packages declare it explicitly and are the only packable workspaces.

Maturity values:

| Value | Meaning |
|---|---|
| `core` | Foundational VC primitive/capability package. Treat breaking changes as protocol-surface changes. |
| `reference` | Reference implementation intended to guide downstream credential-family or protocol work. |
| `lab` | Experimentation package used to probe claim shapes, disclosure models, or Compact constraints. |
| `demo` | Use-case package for runnable scenarios, verifier contracts, reports, or living documentation. |
| `infrastructure` | Local adapter, orchestration, or integration support package. |

Every package README must repeat the two values near the top of the file. This
keeps the human-facing package status aligned with the manifest and prevents
lab/demo packages from looking like publish-ready primitives by accident.

## Package Classes

| Class | Workspaces | Manifest contract |
|---|---|---|
| Dist package | Core, registry, adapters, protocol, credential families, verifier contracts, university protocol/reporting | `license`, release-stage-appropriate `private`, `type`, `main`, `module`, `types`, root `exports`, and `files` point at `dist/**` plus minimal metadata |
| Source-only integration package | `packages/components/integration/standalone-environment` | private source package with `main` and `files` pointing at `src/**/*.ts`; no dist export map is promised |
| Scenario package | `packages/use-cases/*/scenarios` | private executable package with no publish entrypoint or tarball surface |

## Dist Package Rules

Internal dist packages must expose:

- `license: "Apache-2.0"`
- `private: true`
- `type: "module"`
- `main: "dist/index.js"`
- `module: "dist/index.js"`
- `types: "./dist/index.d.ts"`
- `exports["."]` with `types`, `import`, and `default`
- any `exports` subpath condition points at `./dist/**`
- any `typesVersions` path points at `dist/**`
- `files` containing:
  - `dist/**`
  - `README.md`
  - `package.json`
  - `tsconfig.json`
  - `tsconfig.build.json`

If the package has Compact sources under `src/`, its `files` list must also
include `src/**/*.compact` so generated tarballs keep the Compact source
contract visible to auditors.

Release candidates additionally must:

- declare `midnight.releaseStage: "candidate"` and remain `private: true`;
- omit `publishConfig` until a registry and release workflow are approved;
- include `CHANGELOG.md` in place of build-only scripts and TypeScript configs
  in the tarball allowlist;
- expose one truthful runtime format with no CommonJS `require` condition for
  ESM output;
- define complete release metadata and release-compatible dependency ranges;
  and
- pass [`./package-release-contract.md`](./package-release-contract.md).

A future supported package declares `midnight.releaseStage: "supported"` and
may set `private: false` only in the reviewed publication-enablement change.

## Scenario Package Rules

BDD scenario packages are executable harnesses, not library surfaces. They must:

- be `private`
- carry `license: "Apache-2.0"`
- use `type: "module"`
- declare Node/npm engine requirements
- avoid `main`, `module`, `types`, `exports`, and `files`

## Source-Only Integration Rule

`packages/components/integration/standalone-environment` remains source-only because it
is a local integration harness over DID package refs and Testcontainers. It
must stay private and declare its source files explicitly rather than pretending
to be a dist package.

It must expose:

- `license: "Apache-2.0"`
- `private: true`
- `type: "module"`
- `main: "src/index.ts"`
- no `module`, `types`, or `exports` map
- no publish lifecycle hooks (`prepack`, `prepare`, `prepublish`,
  `prepublishOnly`), because this harness is not distributed as a tarball
- `files` containing:
  - `src/**/*.ts`
  - `README.md`
  - `package.json`
  - `tsconfig.json`

The `main: "src/index.ts"` entrypoint is valid only because this package is
private and consumed through npm workspaces. Do not copy that pattern into a
dist package or published package surface.

The package may still keep a `build` script so local type generation catches
compiler regressions, but generated `dist/**` output is a disposable local
artifact and must not be part of its package surface.

## Guard

Run:

```bash
pnpm run check:workspace-manifests
pnpm run check:release-package-contract
```

The guard is also part of `pnpm run ci:lint`. Update the guard and this document
in the same PR when adding a new workspace, adding a new workspace package
class, or intentionally changing a package entrypoint.
