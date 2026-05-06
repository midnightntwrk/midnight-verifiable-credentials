# CI Build Cones

This repository uses four shared build cones for reusable CI outputs:

1. `foundation`
   - `credentials`
   - `credentials-status-registry`
   - `credentials-same-holder`
   - `credentials-iso-registry`
   - `components/adapters/offchain-did`
   - `protocols/openid`
2. `birth-family`
   - `credentials-birth`
   - `credentials-birth-secret`
3. `age-gate`
   - `use-cases/age-gate/contract`
4. `protocol`
   - `components/orchestration/protocol`

## Why Cones

The previous shared-build lane treated all reusable outputs as one cache key and one tarball. That made every downstream job pay the restore cost for unrelated outputs and made any change in one package invalidate the whole shared-output cache.

The cone model keeps the current workflow shape simple:

- one shared build job
- topological Turbo builds
- four cache keys
- four uploaded artifacts
- downstream jobs restore only the cones they consume

## Hashing Rule

Each cone hash includes:

- root build inputs:
  - `package.json`
  - `package-lock.json`
  - `turbo.json`
  - `tsconfig.json`
  - `.eslintrc.json`
- all tracked files under the cone's package set
- tracked files under `tooling/scripts`

Higher cones include the tracked inputs of lower cones in their hash scope:

- `birth-family` includes `foundation`
- `age-gate` includes `birth-family`
- `protocol` includes `age-gate`

This keeps cache invalidation aligned with the actual dependency chain without forcing a single monolithic cache key.

## Build Order

When a cone cache is missing, the workflow rebuilds only that cone:

1. `foundation`
2. `birth-family`
3. `age-gate`
4. `protocol`

Each step uses Turbo filters so the build stays topological and reuses local `.turbo` cache entries inside the job.

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
- model `standalone-environment` as a reusable artifact cone

Those can be revisited later if the current four-cone model stops being coarse enough.
