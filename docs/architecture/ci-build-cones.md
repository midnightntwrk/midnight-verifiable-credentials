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
   - `credentials-hello-family`
   - `credentials-dummy-claims`
   - `credentials-university-diploma`
3. `age-gate`
   - `use-cases/age-gate/contract`
   - `use-cases/hello-verifier/contract`
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

The `birth-family` name is now historical shorthand.
It currently groups the repo's credential-family workspaces, including the
`hello-family` starter family package, the broad `dummy-claims` laboratory, and
the university diploma family used by the larger university use case.
`dummy-claims` used to sit outside the shared cones; it now belongs to
`birth-family` so verifier-lab changes invalidate and restore with the other
credential-family artifacts.

Intentional exclusions:

- `use-cases/university/contract` is built by university-specific prerequisites,
  not by the shared build cones
- `use-cases/university/protocol`, `use-cases/university/scenarios`, and
  `use-cases/university/reporting` are profile/reporting packages with their
  own artifact contracts
- `components/integration/standalone-environment` is kept outside the reusable
  cone cache because Docker-backed integration has separate setup and teardown
  concerns

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

The reusable cones intentionally encode only the tracked inputs needed by their
downstream consumers:

- `birth-family` includes the full `foundation` input set
- `age-gate` includes the full `birth-family` input set
- `protocol` includes the full `foundation` input set plus the birth,
  birth-secret, and age-gate contract packages it consumes

This keeps cache invalidation aligned with the actual dependency chain without
forcing a single monolithic cache key or making the protocol cone restore
unrelated verifier-lab outputs.

## Contract Audit

Run the build-cone contract check locally with:

```bash
npm run check:ci-build-cones
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
- no cone output path is tracked by git
- every cone output path is ignored by `.gitignore`

The audit is wired into `ci:lint` so changes to `package.json`,
`tooling/scripts/ci-build-output-groups.sh`, `.gitignore`, or cone docs cannot
quietly drift from the repository's generated-artifact policy.

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
- model `standalone-environment` as a reusable artifact cone

Those can be revisited later if the current four-cone model stops being coarse enough.
