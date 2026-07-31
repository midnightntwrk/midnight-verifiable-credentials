# CI Build Cones

This repository uses four shared build cones for reusable CI outputs:

1. `foundation`
   - `credential-model`
   - `credential-compact`
   - `credentials`
   - `credentials-status-registry`
   - `credentials-same-holder`
   - `credentials-iso-registry`
   - `packages/components/adapters/offchain-did`
   - `packages/protocols/openid`
2. `birth-family`
   - `credentials-birth`
   - `credentials-birth-secret`
   - `credentials-hello-family`
   - `credentials-dummy-claims`
   - `credentials-mixed-claims`
   - `credentials-university-diploma`
   - `credentials-digital-passport`
3. `age-gate`
   - `packages/use-cases/age-gate/contract`
   - `packages/use-cases/hello-verifier/contract`
4. `protocol`
   - `packages/components/orchestration/protocol`
   - `packages/use-cases/university/contract`
   - `packages/use-cases/university/protocol`
   - `packages/use-cases/university/reporting`
   - `packages/components/integration/standalone-environment`

## Why Cones

The previous shared-build lane treated all reusable outputs as one cache key and one tarball. That made every downstream job pay the restore cost for unrelated outputs and made any change in one package invalidate the whole shared-output cache.

The cone model keeps the current workflow shape simple:

- one shared build job
- topological Turbo builds
- four cache keys
- four uploaded artifacts
- downstream jobs restore only the cones they consume

The `birth-family` name is now historical shorthand.
It currently groups the repo's credential-family workspaces, including the
`hello-family` starter family package, the broad `dummy-claims` laboratory, and
the university diploma family used by the larger university use case.
`dummy-claims` used to sit outside the shared cones; it now belongs to
`birth-family` so verifier-lab changes invalidate and restore with the other
credential-family artifacts.

The `protocol` name is also historical shorthand. It is the final downstream
cone and owns every build output that is not assigned to the foundation,
credential-family, or age-gate cones. This includes the private standalone
environment's TypeScript output; its Docker-backed integration tests remain
separate and are not run by the shared build job.

Intentional build-output exclusions:

- `packages/use-cases/age-gate/scenarios` and
  `packages/use-cases/university/scenarios` are scenario workspaces whose BDD
  reports are produced by dedicated validation lanes
- `packages/use-cases/bdd-support` is a source-only test-support workspace with
  no build task

## Hashing Rule

Each cone hash includes:

- root build inputs:
  - `package.json`
  - `pnpm-lock.yaml`
  - `turbo.json`
  - `tsconfig.json`
  - `.eslintrc.json`
- all tracked files under the cone's package set
- tracked files under `tooling/scripts`

The reusable cones intentionally encode only the tracked inputs needed by their
downstream consumers:

- `birth-family` includes the full `foundation` input set
- `age-gate` includes the full `birth-family` input set
- `protocol` hashes all build-capable workspaces because its downstream
  outputs compose the lower-level package surfaces

This keeps cache invalidation aligned with the actual dependency chain without
forcing a single monolithic cache key or making the protocol cone restore
unrelated verifier-lab outputs.

## Turbo Cache Policy

Turbo's package-local cache is intentionally separate from the cone artifact
cache. Cone keys decide whether reusable CI output archives are restored;
Turbo keys decide whether a package task can be skipped inside a job.

The root `turbo.json` therefore declares repository-wide invalidators for
inputs that sit outside package directories but still affect package tasks:

- root pnpm, TypeScript, Turbo, and Node version files
- GitHub workflow definitions
- all checked tooling scripts, including runner, cone, artifact, cleanup, and
  policy lanes; this intentionally includes the cache-policy checker itself so
  policy changes invalidate cached package tasks
- `COMPACT_COMPILER_VERSION`, because generated Compact output can change
  without a TypeScript source diff

The cacheable tasks keep explicit `outputs` entries. Build tasks own `dist`,
`src/managed`, and `*.tsbuildinfo`; lint, typecheck, and test tasks intentionally
declare empty outputs so they can cache success without publishing generated
files.

`pnpm run check:turbo-cache-policy` guards these invariants and is wired into
`ci:lint`, so future task additions cannot silently become cacheable without an
explicit output policy.

## Contract Audit

Run the build-cone contract check locally with:

```bash
pnpm run check:ci-build-cones
pnpm run check:ci-workflow-cones
```

The check reads the same shell definitions used by CI and verifies that:

- every cone input is a real root workspace with a `package.json`
- every cone output is a generated artifact directory under one of that cone's
  input packages
- outputs are restricted to the generated shapes CI knows how to restore:
  `dist` and `src/managed`
- cone topology is explicit: `foundation` is included by `birth-family` and
  `protocol`, `birth-family` is included by `age-gate`, and `protocol` carries
  its required birth, birth-secret, and age-gate inputs
- no cone output path is owned by more than one cone
- every build-capable workspace has exactly one cone output owner
- no cone output path is tracked by git
- every cone output path is ignored by `.gitignore`

The audit is wired into `ci:lint` so changes to `package.json`,
`tooling/scripts/ci-build-output-groups.sh`, `.gitignore`, or cone docs cannot
quietly drift from the repository's generated-artifact policy.

`check:ci-workflow-cones` adds the runner-side contract:

- every `build:cone:*` root script uses Turbo filters that match the cone's
  generated output owners
- foundational aggregate root build scripts do not directly rebuild
  cone-managed workspaces outside the cone runner; focused university/report
  scripts may rebuild their downstream owner directly
- `.github/workflows/ci.yml` hashes, verifies, builds, packs, and uploads every
  declared cone group
- the workflow does not reference unknown `ci-build-*` cache or artifact groups

The shell-side cone contract defines what belongs in each build cone; the
workflow-side contract defines where those cone outputs flow through CI cache
keys, artifact names, and restored output paths.

## Build Order

When a cone cache is missing, the workflow rebuilds only that cone:

1. `foundation`
2. `birth-family`
3. `age-gate`
4. `protocol`

Each step uses Turbo filters so the build stays topological and reuses local `.turbo` cache entries inside the job.

One important consequence: restored upstream `dist` trees are not, by themselves, enough to stop Turbo from traversing lower cones when a downstream cone misses. If the matching `.turbo` task entries are cold, Turbo may still rebuild transitive dependencies even though their output trees were restored from the cone cache. The current model prioritizes correctness and finer invalidation over eliminating every partial-miss rebuild.

## Artifact Rule

The workflow uploads four stable artifact names:

- `ci-build-foundation`
- `ci-build-birth-family`
- `ci-build-age-gate`
- `ci-build-protocol`

The archives are already gzip-compressed before upload, so `upload-artifact` uses `compression-level: 0` to avoid recompressing them.

## Non-Goals

This model does not yet attempt to:

- publish one artifact per workspace package
- use Nix as the primary build cache
- split the downstream `protocol` cone into smaller protocol, university, and
  integration-support artifacts

Those can be revisited later if the current four-cone model stops being coarse enough.
