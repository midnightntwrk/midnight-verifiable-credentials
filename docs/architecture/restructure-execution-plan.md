# Repository Restructure Execution Plan

Status: execution plan

Purpose:
- execute the approved repository restructure in bounded, reviewable phases
- keep CI and package behavior stable while the physical layout changes
- avoid mixing taxonomy work, package moves, and use-case reshaping in one PR

## Target top-level areas

The target repository shape is:

- `docs/`
- `core/`
- `registry/`
- `protocols/`
- `components/`
- `prototypes/`
- `use-cases/`
- `tooling/`
- `assets/`

Architecture notes:
- RFCs belong under `docs/architecture/`
- ADRs belong under `docs/decisions/`
- BDD belongs under `use-cases/`, not under repository-level prototype or low-level test trees
- `demo` is a temporary historical label to eliminate, not a durable architecture area

## Execution phases

### Phase 1: Tooling and directory spine

Goals:
- establish the top-level target areas as real tracked directories
- move shared repository scripts under `tooling/scripts/`
- move artifact-packaging support under `tooling/artifacts/`
- update CI, shell entrypoints, and package scripts to use the `tooling/` location
- update contribution guidance so commit scopes can follow the high-level structure during migration

Risk profile:
- low runtime risk
- moderate CI/path risk

### Phase 2: Protocols and components

Goals:
- move transport/binding packages under `protocols/`
- move orchestration, agents, storage, and harness packages under `components/`
- update workspaces, CI path filters, and boundary checks accordingly

Expected package moves:
- `credentials-openid` -> `protocols/openid`
- `credentials-protocol` -> `components/protocol`
- `credentials-offchain-did` -> `components/adapters/offchain-did`
- `standalone-environment` -> `components/integration/standalone-environment`
- `infrastructure/standalone` -> `components/integration/infrastructure/standalone`

### Phase 3: Prototypes and use-cases

Goals:
- split `credentials-demo-contract` into smaller prototype and use-case packages
- move BDD scenarios under `use-cases/<name>/scenarios`
- keep low-level prototype evidence separate from living documentation

Rules:
- prototypes prove VC + capability + protocol combinations
- use-cases prove concrete business/application flows
- BDD stays with use-cases only

### Phase 4: Registry and core normalization

Goals:
- move reusable registry packages under `registry/`
- move canonical reusable VC packages under `core/`
- update boundary docs and CI rules so the high-level directory model becomes the canonical enforcement surface

## Commit and CI policy during migration

Conventional Commit scopes should prefer the high-level area whenever a change is
best described by the target architecture:

- `docs`
- `core`
- `registry`
- `protocols`
- `components`
- `prototypes`
- `use-cases`
- `tooling`
- `assets`

Package-specific scopes remain acceptable while legacy workspace names still
exist, especially when one PR changes only one package.

CI rules should progressively classify by these top-level areas as the physical
moves land. Until then, CI must support both legacy paths and target paths.
