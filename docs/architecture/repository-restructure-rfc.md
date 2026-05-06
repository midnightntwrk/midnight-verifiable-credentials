# Midnight VC Repository Restructure RFC

Status: proposed repository-structure RFC

Audience:
- VC maintainers
- package authors
- protocol and integration engineers
- reviewers evaluating long-term repository shape

## Purpose

This RFC proposes a clearer top-level repository structure for the Midnight VC
workspace.

The goal is to separate:

- normative and explanatory documentation
- reusable VC core and capability surfaces
- reusable registry surfaces
- reusable protocol bindings
- reusable runtime and wiring components
- prototype families and prototype quality evidence
- concrete use-case subprojects
- repo-local tooling and automation

This RFC is about repository structure, dependency direction, CI policy, and
contribution discipline.

It is not a request to immediately rename npm packages or ship one disruptive
filesystem move in a single PR.

Related documents:

- architecture overview:
  - [`./overview.md`](./overview.md)
- package boundaries:
  - [`./package-boundaries.md`](./package-boundaries.md)
- package tier inventory:
  - [`./package-tier-inventory.md`](./package-tier-inventory.md)
- protocol classification:
  - [`./protocol-classification.md`](./protocol-classification.md)
- VC maturity backlog:
  - [`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md)

## Problem

The current workspace grew around package-level iteration, which was useful for
shipping maturity slices quickly, but it now mixes several different concerns at
the top level:

- reusable core semantics
- prototype credential families
- business/demo compositions
- transport bindings
- orchestration and agent logic
- integration harnesses
- documentation and quality evidence

That makes several things harder than they should be:

1. integrators cannot immediately distinguish reusable core from prototype-only
   material
2. transport bindings and runtime wiring sit too close to core capability
   packages
3. prototype families and concrete business use cases are not clearly separated
4. CI policy can only reason about package names, not stable architectural
   areas
5. Conventional Commit scopes and review expectations drift toward package-local
   history instead of high-level architecture boundaries
6. future extraction of reusable areas such as status registry becomes harder

## Design goals

The restructured repository should make these things obvious:

1. what is canonical VC core
2. what is reusable across the Midnight ecosystem
3. what is only prototype validation material
4. what is only concrete application/use-case composition
5. what is only runtime wiring or integration machinery
6. which areas are allowed to depend on which other areas
7. how CI should validate those boundaries

## Non-goals

This RFC does not require:

- immediate npm package renaming
- immediate public import-path changes
- one-shot movement of all files in a single branch
- deciding every future credential family or use case now
- extracting `registry/` into a separate repository immediately

Those are follow-up execution decisions.

## Decision: `architecture` stays under `docs`

`architecture` should not become a top-level sibling of code.

Reason:

- architecture is documentation
- maintainers expect architecture decisions, overviews, and RFCs to live beside
  specs, guides, and decisions
- the repository should expose one coherent documentation tree instead of a
  second documentation island

Therefore the target remains:

- `docs/architecture/`

not:

- `architecture/`

## Proposed top-level structure

```text
docs/
core/
registry/
protocols/
components/
prototypes/
use-cases/
tooling/
assets/
```

### 1. `docs/`

Owns human-readable material.

Target structure:

```text
docs/
  spec/
  books/
  faq/
  architecture/
  decisions/
  guides/
  reference/
  testing/
```

Rules:

- normative specs live in `docs/spec`
- architecture decisions and RFCs live in `docs/architecture` and
  `docs/decisions`
- prototype limitations must be labeled explicitly in docs, not blended into
  normative spec without markers
- generated quality summaries may be linked from docs, but raw measurement data
  should not define the documentation structure

### 2. `core/`

Owns reusable VC semantics and reusable capability layers.

Target structure:

```text
core/
  primitives/
    credentials/
    iso-registry/
  capabilities/
    same-holder/
  protocols/
    generic-issuance-presentation/
```

Rules:

- `core/` must not depend on `protocols/`, `components/`, `prototypes/`, or
  `use-cases/`
- `core/` is the canonical source of Compact-native VC semantics
- `core/` owns reusable holder-binding, proof, and VC-side status-binding
  concepts
- `core/` must not contain business-specific verifier logic or transport
  bindings

### 3. `registry/`

Owns reusable registry surfaces that may later graduate into their own
repository.

Target structure:

```text
registry/
  status-registry/
```

Rules:

- `registry/` may depend on `core/`
- `registry/` must not depend on `prototypes/`, `use-cases/`, or
  `components/`
- this area is intended to be reusable across the Midnight ecosystem
- status/revocation registry surfaces should live here rather than being buried
  in demos or use cases

### 4. `protocols/`

Owns interoperability bindings and externally-facing protocol shapes.

Target structure:

```text
protocols/
  oidc/
  didcomm/
  custom-api/
```

Meaning:

- OpenID-style bindings
- DIDComm bindings
- repo-local custom API bindings where needed

Rules:

- `protocols/` may depend on `core/` and `registry/`
- `protocols/` must not depend on `components/`, `prototypes/`, or
  `use-cases/`
- `protocols/` owns binding shapes, message envelopes, interoperability
  semantics, and mapping rules
- `protocols/` must not become the home of agent state, storage, or orchestration
  runtime logic

### 5. `components/`

Owns reusable runtime machinery and wiring pieces.

Target structure:

```text
components/
  adapters/
  agents/
  storage/
  message-bus/
  orchestration/
  integration/
```

Examples:

- DID-aware runtime adapters
- protocol state stores
- message buses
- agent logic
- standalone integration harnesses

Rules:

- `components/` may depend on `core/`, `registry/`, and `protocols/`
- `components/` must not depend on `prototypes/` or `use-cases/`
- this area wires things together, but it does not redefine core semantics or
  public protocol bindings

### 6. `prototypes/`

Owns prototype credential families and the evidence that the core is solid.

Target structure:

```text
prototypes/
  credential-families/
    birth/
    birth-secret/
  quality/
    complexity/
    latency/
    compatibility/
    test-matrix/
```

Meaning:

- examples of L1/L2 combinations
- all possible combinations needed to prove core capability maturity
- quality/latency/complexity evidence for those prototypes

Rules:

- `prototypes/` may depend on `core/` and `registry/`
- `prototypes/` may depend on `protocols/` or `components/` only when the
  prototype explicitly exists to validate that integration surface
- the default expectation is that prototype families stay close to the core and
  prove capability composition, not transport complexity
- prototype quality evidence should track:
  - circuit complexity
  - proving-key/prover size
  - latency
  - compatibility and integration behavior

### 7. `use-cases/`

Owns concrete subprojects for real application flows.

Target structure:

```text
use-cases/
  age-gate/
    contract/
    scenarios/
    docs/
  revocation-aware-age-gate/
    contract/
    scenarios/
    docs/
```

Meaning:

- concrete VC + protocol + wiring combinations for real business flows
- each use case is a compositional consumer of the lower layers

Rules:

- `use-cases/` may depend on `core/`, `registry/`, `protocols/`,
  `components/`, and `prototypes/`
- BDD scenarios should live here, not in a generic repo-level bucket forever
- each use case should own:
  - its contract/app surface
  - its living-documentation scenarios
  - its flow-specific documentation

### 8. `tooling/`

Owns repo-local automation and non-runtime helpers.

Target structure:

```text
tooling/
  scripts/
  ci/
  metrics/
  repo-quality/
```

Rules:

- `tooling/` may observe or build every area
- runtime code must not depend on `tooling/`
- CI helpers, reporting scripts, quality collectors, and repo automation belong
  here rather than leaking into architectural areas

### 9. `assets/`

Owns static visual or support assets.

Rules:

- no runtime architecture meaning should be encoded only in `assets/`
- assets support docs, prototypes, and use cases, but do not define them

## Dependency direction

The intended dependency model is:

```text
core        -> core
registry    -> core
protocols   -> core, registry
components  -> core, registry, protocols
prototypes  -> core, registry
use-cases   -> core, registry, protocols, components, prototypes
tooling     -> may observe/build all, imported by none
```

Important notes:

1. `protocols/` is not a replacement for `components/`
   - `protocols/` defines binding and interoperability shapes
   - `components/` defines runtime machinery that can use those bindings
2. `use-cases/` depends on `protocols/`
   - this is the explicit place where business/application flows consume OIDC,
     DIDComm, or custom API bindings
3. `prototypes/` and `use-cases/` are not the same thing
   - prototypes prove core solidity and composition breadth
   - use cases prove that a real flow is understandable and usable

## Target mapping from current packages

| Current package / area | Target area | Notes |
| --- | --- | --- |
| `credentials` | `core/primitives/credentials` | canonical VC core |
| `credentials-iso-registry` | `core/primitives/iso-registry` | shared code vocabulary |
| `credentials-same-holder` | `core/capabilities/same-holder` | reusable proof capability |
| `credentials-status-registry` | `registry/status-registry` | reusable ecosystem-facing registry surface |
| `credentials-birth` | `prototypes/credential-families/birth` | prototype family proving the core |
| `credentials-birth-secret` | `prototypes/credential-families/birth-secret` | hidden-holder prototype family |
| `credentials-openid` | `protocols/oidc` | OpenID-shaped binding layer |
| future DIDComm binding | `protocols/didcomm` | explicit protocol area |
| future custom API binding | `protocols/custom-api` | repo-local API binding area |
| `credentials-offchain-did` | `components/adapters/offchain-did` | runtime DID adapter, not core |
| `credentials-protocol` | `components/orchestration/protocol` | orchestration/wiring, not core |
| agent logic | `components/agents` | if/when split further |
| message bus | `components/message-bus` | if/when split further |
| protocol state store | `components/storage` | if/when split further |
| `standalone-environment` | `components/integration/standalone-environment` | integration harness |
| `credentials-demo-contract` | `use-cases/.../contract` | should split by concrete use case, not remain one generic demo bucket |
| `vc-bdd-scenarios` | `use-cases/.../scenarios` | living docs should sit under concrete flows |
| complexity / latency collectors | `tooling/metrics` | executable collectors |
| complexity / latency baselines | `prototypes/quality` | prototype evidence set |

## CI policy after restructure

CI should obey the high-level directory separation.

### Path-based lanes

The top-level lanes should classify changes by area:

- `docs`
- `core`
- `registry`
- `protocols`
- `components`
- `prototypes`
- `use-cases`
- `tooling`

### Minimum expectations per area

- `docs/`
  - docs validation only
- `core/`
  - lint, typecheck, package-boundary checks, core tests, contract-surface
    validation
- `registry/`
  - registry tests, contract-surface validation, trust-boundary tests
- `protocols/`
  - protocol/schema tests, compatibility tests, selected integration checks
- `components/`
  - runtime tests, orchestration tests, selected integration checks
- `prototypes/`
  - prototype tests plus quality-baseline checks for complexity and latency
- `use-cases/`
  - BDD scenarios, use-case contract/app tests, targeted end-to-end checks
- `tooling/`
  - script quality, CI validation, boundary checker validation

### Boundary enforcement

The repository should add or extend a boundary checker so it can fail PRs when:

- `core/` imports from `protocols/`, `components/`, `prototypes/`, or
  `use-cases/`
- `registry/` imports from `components/`, `prototypes/`, or `use-cases/`
- `protocols/` imports from `components/`, `prototypes/`, or `use-cases/`
- `components/` imports from `prototypes/` or `use-cases/`
- `prototypes/` imports from `use-cases/`

### Quality tracking

CI should treat prototype quality evidence as a first-class concern.

At minimum, selected prototype lanes should track:

- contract / circuit / `k`
- row counts where available
- prover/proving-artifact size
- integration latency
- comparison against the current checked-in baseline

## Conventional Commit policy after restructure

Conventional Commits should obey the high-level directory boundaries.

### Preferred scopes

Use the highest-level repository area as the primary scope:

- `docs`
- `core`
- `registry`
- `protocols`
- `components`
- `prototypes`
- `use-cases`
- `tooling`
- `assets`
- `root`

Examples:

```text
docs(docs): add repository restructure RFC
refactor(core): split reusable VC binding helpers
feat(registry): add status-registry reusable surface
feat(protocols): add DIDComm binding draft
refactor(components): isolate protocol-state storage
feat(prototypes): add new hidden-holder family matrix slice
test(use-cases): add age-gate BDD scenario
ci(tooling): enforce top-level dependency boundaries
```

If a change is narrower and the repository chooses to preserve area-specific
subscopes later, they should still begin from the top-level area concept rather
than from an arbitrary historical package name.

Examples of acceptable future refinements:

- `core-credentials`
- `protocols-oidc`
- `components-orchestration`
- `use-cases-age-gate`

The important rule is:

- the commit scope should reinforce the architectural area, not obscure it

## Why this is better than the current layout

This structure makes several important facts obvious:

1. `core/` is the canonical VC meaning layer
2. `registry/` is reusable and separately extractable
3. `protocols/` is about interoperability bindings, not runtime orchestration
4. `components/` is wiring, not core
5. `prototypes/` prove maturity
6. `use-cases/` prove concrete value and provide live docs
7. `docs/architecture` remains the authoritative place for architecture
   reasoning

## Migration plan

### Phase 1: structure RFC and boundary rules

- land this RFC
- align documentation language with the target top-level model
- define CI and commit-scope policy before moving code

### Phase 2: docs and tooling separation

- make `docs/` and `tooling/` explicit first
- lowest runtime risk

### Phase 3: protocols and components split

- move transport bindings into `protocols/`
- move runtime wiring into `components/`
- enforce the non-cycle rule between them

### Phase 4: prototype and use-case split

- move credential-family prototypes under `prototypes/`
- move business/demo flows and BDD scenarios under `use-cases/`
- attach complexity/latency evidence to prototypes

### Phase 5: registry isolation

- move reusable registry surfaces under `registry/`
- keep npm/public import compatibility during migration

### Phase 6: core consolidation

- move or rename the remaining core packages last
- this is the highest-churn step and should happen once the outer layers are
  already settled

## Open questions

1. should `core/protocols/` become a physical area now, or remain conceptual
   until generic issuance/presentation modules are large enough to deserve it?
2. should prototype quality baselines remain checked into `docs/metrics` for
   human readability while raw baselines live under `prototypes/quality`?
3. when `registry/` is mature enough, should it move into a dedicated repo with
   this repository consuming it as a dependency?
4. should use-case BDD scenarios stay colocated under each use case, or should
   the repository keep a thin shared scenario runtime under `components/` or
   `tooling/`?

## Immediate recommendation

Adopt the repository taxonomy in this RFC first, then execute it in phases.

Do not start by renaming packages for cosmetic reasons.
Start by enforcing the dependency model and moving the non-core outer layers
into clearer areas.
