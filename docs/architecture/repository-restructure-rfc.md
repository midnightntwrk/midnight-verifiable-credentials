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

This RFC also makes one repository-policy change explicit:

- `*demo*` is not a durable architectural category
- current `*demo*` packages should be split into:
  - prototype matrices when they exist to prove VC core solidity or capability
    composition
  - concrete `packages/use-cases/` subprojects when they exist to model a real
    application flow

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
- ownership and graduation policy:
  - [`./credential-family-ownership-policy.md`](./credential-family-ownership-policy.md)

## Approved first bounded phase

Issues #374 and #378 establish governance before physical movement. Existing
credential families already mostly live under
`packages/prototypes/credential-families`; this phase audits that inventory,
keeps family tests with each prototype, reconciles ADR-0002/0003, aligns the
workspace/package catalogs, and adds the narrow dependency guard. It does not
move packages, graduate a family, approve the reported ~758 MB generated
artifact bundle, or implement #375/#376/#377.

The durable rules and current exception are maintained in
[credential-family ownership and graduation policy](./credential-family-ownership-policy.md).

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
- generic `demo` buckets that blur prototype validation and concrete business
  flows

That makes several things harder than they should be:

1. integrators cannot immediately distinguish reusable core from prototype-only
   material
2. transport bindings and runtime wiring sit too close to core capability
   packages
3. prototype families and concrete business use cases are not clearly separated
4. generic `demo` packages hide whether a flow is proving core maturity or
   illustrating a concrete application scenario
5. BDD living documentation is easier to misplace next to prototypes or
   low-level package tests when it should be attached to concrete use cases
6. CI policy can only reason about package names, not stable architectural
   areas
7. Conventional Commit scopes and review expectations drift toward package-local
   history instead of high-level architecture boundaries
8. future extraction of reusable areas such as status registry becomes harder

## Design goals

The restructured repository should make these things obvious:

1. what is canonical VC core
2. what is reusable across the Midnight ecosystem
3. what is only prototype validation material
4. what is only concrete application/use-case composition
5. what is only runtime wiring or integration machinery
6. which areas are allowed to depend on which other areas
7. how CI should validate those boundaries
8. where BDD living documentation belongs

## Non-goals

This RFC does not require:

- immediate npm package renaming
- immediate public import-path changes
- one-shot movement of all files in a single branch
- deciding every future credential family or use case now
- extracting `packages/registry/` into a separate repository immediately

Those are follow-up execution decisions.

## Decision: RFCs and ADRs are documentation

RFCs and ADRs must be treated as documentation artifacts.

They belong under `docs/`, not as top-level siblings of code.

Repository policy:

- RFCs live under `docs/architecture/`
- ADRs live under `docs/decisions/`

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
packages/core/
packages/registry/
packages/protocols/
packages/components/
packages/prototypes/
packages/use-cases/
tooling/
docs/guides/assets/
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
- architecture overviews and RFCs live in `docs/architecture`
- ADRs and decision records live in `docs/decisions`
- prototype limitations must be labeled explicitly in docs, not blended into
  normative spec without markers
- generated quality summaries may be linked from docs, but raw measurement data
  should not define the documentation structure

### 2. `packages/core/`

Owns reusable VC semantics and reusable capability layers.

Target structure:

```text
packages/core/
  primitives/
    credentials/
    iso-registry/
  capabilities/
    same-holder/
  packages/protocols/
    generic-issuance-presentation/
```

Rules:

- `packages/core/` must not depend on `packages/protocols/`, `packages/components/`, `packages/prototypes/`, or
  `packages/use-cases/`
- `packages/core/` is the canonical source of Compact-native VC semantics
- `packages/core/` owns reusable holder-binding, proof, and VC-side status-binding
  concepts
- `packages/core/` must not contain business-specific verifier logic or transport
  bindings

### 3. `packages/registry/`

Owns reusable registry surfaces that may later graduate into their own
repository.

Target structure:

```text
packages/registry/
  status-registry/
```

Rules:

- `packages/registry/` may depend on `packages/core/`
- `packages/registry/` must not depend on `packages/prototypes/`, `packages/use-cases/`, or
  `packages/components/`
- this area is intended to be reusable across the Midnight ecosystem
- status/revocation registry surfaces should live here rather than being buried
  in demos or use cases

### 4. `packages/protocols/`

Owns interoperability bindings and externally-facing protocol shapes.

Target structure:

```text
packages/protocols/
  oidc/
  didcomm/
  custom-api/
```

Meaning:

- OpenID-style bindings
- DIDComm bindings
- repo-local custom API bindings where needed

Rules:

- `packages/protocols/` may depend on `packages/core/` and `packages/registry/`
- `packages/protocols/` must not depend on `packages/components/`, `packages/prototypes/`, or
  `packages/use-cases/`
- `packages/protocols/` owns binding shapes, message envelopes, interoperability
  semantics, and mapping rules
- `packages/protocols/` must not become the home of agent state, storage, or orchestration
  runtime logic

### 5. `packages/components/`

Owns reusable runtime machinery and wiring pieces.

Target structure:

```text
packages/components/
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

- `packages/components/` may depend on `packages/core/`, `packages/registry/`, and `packages/protocols/`
- `packages/components/` must not depend on `packages/prototypes/` or `packages/use-cases/`
- this area wires things together, but it does not redefine core semantics or
  public protocol bindings

### 6. `packages/prototypes/`

Owns prototype credential families and the evidence that the core is solid.

Target structure:

```text
packages/prototypes/
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

- `packages/prototypes/` may depend on `packages/core/` and `packages/registry/`
- `packages/prototypes/` may depend on `packages/protocols/` or `packages/components/` only when the
  prototype explicitly exists to validate that integration surface
- the default expectation is that prototype families stay close to the core and
  prove capability composition, not transport complexity
- prototypes should split by VC + capability + protocol combination whenever
  that combination is the thing being proven
- prototypes should not own repository-level BDD living documentation
- prototypes should rely on low-level tests, quality baselines, and targeted
  integration evidence rather than scenario narratives
- prototype quality evidence should track:
  - circuit complexity
  - proving-key/prover size
  - latency
  - compatibility and integration behavior

### 7. `packages/use-cases/`

Owns concrete subprojects for real application flows.

Target structure:

```text
packages/use-cases/
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
- each use case is the correct home for living-documentation scenarios

Rules:

- `packages/use-cases/` may depend on `packages/core/`, `packages/registry/`, `packages/protocols/`,
  `packages/components/`, and `packages/prototypes/`
- BDD scenarios should live here, not in a generic repo-level bucket forever
- BDD scenarios must not be mixed into prototype package trees or low-level
  package test suites as if they were another unit or integration layer
- each use case should own:
  - its contract/app surface
  - its living-documentation scenarios
  - its flow-specific documentation

Use-case rule:

- if an artifact exists to explain a concrete business flow to integrators,
  product engineers, or application developers, it belongs under `packages/use-cases/`
- if an artifact exists to prove a reusable VC + capability + protocol
  combination is sound independent of any one business story, it belongs under
  `packages/prototypes/`

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

### 9. Guide-local assets

Owns static visual or support assets.

Rules:

- no runtime architecture meaning should be encoded only in visual assets
- documentation artwork should live beside the guide that renders it, for
  example under `docs/guides/assets/`
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

1. `packages/protocols/` is not a replacement for `packages/components/`
   - `packages/protocols/` defines binding and interoperability shapes
   - `packages/components/` defines runtime machinery that can use those bindings
2. `packages/use-cases/` depends on `packages/protocols/`
   - this is the explicit place where business/application flows consume OIDC,
     DIDComm, or custom API bindings
3. `packages/prototypes/` and `packages/use-cases/` are not the same thing
   - prototypes prove core solidity and composition breadth
   - use cases prove that a real flow is understandable and usable
4. BDD is a use-case concern, not a prototype concern
   - prototypes may have low-level tests and quality evidence
   - use cases own human-readable scenario narratives and Serenity-style
     reports

## Target mapping from current packages

| Current package / area | Target area | Notes |
| --- | --- | --- |
| `credentials` | `packages/core/primitives/credentials` | canonical VC core |
| `credentials-iso-registry` | `packages/core/primitives/iso-registry` | shared code vocabulary |
| `credentials-same-holder` | `packages/core/capabilities/same-holder` | reusable proof capability |
| `credentials-status-registry` | `packages/registry/status-registry` | reusable ecosystem-facing registry surface |
| `credentials-birth` | `packages/prototypes/credential-families/birth` | prototype family proving the core |
| `credentials-birth-secret` | `packages/prototypes/credential-families/birth-secret` | hidden-holder prototype family |
| `credentials-openid` | `packages/protocols/openid` | OpenID-shaped binding layer |
| future DIDComm binding | `packages/protocols/didcomm` | explicit protocol area |
| future custom API binding | `packages/protocols/custom-api` | repo-local API binding area |
| `credentials-offchain-did` | `packages/components/adapters/offchain-did` | runtime DID adapter, not core |
| `credentials-protocol` | `packages/components/orchestration/protocol` | orchestration/wiring, not core |
| agent logic | `packages/components/agents` | if/when split further |
| message bus | `packages/components/message-bus` | if/when split further |
| protocol state store | `packages/components/storage` | if/when split further |
| `standalone-environment` | `packages/components/integration/standalone-environment` | integration harness |
| `credentials-demo-contract` | `packages/prototypes/...` and `packages/use-cases/.../contract` | split the current generic demo bucket into prototype combination proofs and concrete use-case contracts |
| `vc-bdd-scenarios` | `packages/use-cases/.../scenarios` | living docs should sit under concrete flows |
| complexity / latency collectors | `tooling/metrics` | executable collectors |
| complexity / latency baselines | `packages/prototypes/quality` | prototype evidence set |

## Current deviation inventory

Status: audited on `2026-05-08`.

The target architecture areas now exist, but the repository is still in a
partial-move state.

### Legacy root package directories still carrying real code

These packages still live at the top level even though the RFC target areas are
already present:

- `credentials/`
- `credentials-iso-registry/`
- `credentials-same-holder/`
- `credentials-status-registry/`
- `credentials-birth/`
- `credentials-birth-secret/`

Target destinations:

- `credentials/` -> `packages/core/primitives/credentials/`
- `credentials-iso-registry/` -> `packages/core/primitives/iso-registry/`
- `credentials-same-holder/` -> `packages/core/capabilities/same-holder/`
- `credentials-status-registry/` -> `packages/registry/status-registry/`
- `credentials-birth/` -> `packages/prototypes/credential-families/birth/`
- `credentials-birth-secret/` ->
  `packages/prototypes/credential-families/birth-secret/`

### Transitional tooling-owned vendor surfaces

These tracked paths remain valid, but they should live under tooling-owned
areas rather than as top-level architecture roots:

- `tooling/vendor/`
  - transitional local tarball input/output surface
  - treated as tooling support, not as an architecture area

The former top-level `infrastructure/preprod-proof-server.yml` outlier has now
been rehomed under:

- `packages/components/integration/infrastructure/standalone/preprod-proof-server.yml`

### Compatibility shims that are not architecture debt

The generated `midnight-did-credentials*` top-level symlinks are compatibility
bridges, not canonical repository areas.

They should not be counted as target-structure violations while the physical
move wave is in progress.

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
- `packages/core/`
  - lint, typecheck, package-boundary checks, core tests, contract-surface
    validation
- `packages/registry/`
  - registry tests, contract-surface validation, trust-boundary tests
- `packages/protocols/`
  - protocol/schema tests, compatibility tests, selected integration checks
- `packages/components/`
  - runtime tests, orchestration tests, selected integration checks
- `packages/prototypes/`
  - prototype tests plus quality-baseline checks for complexity and latency
- `packages/use-cases/`
  - BDD scenarios, use-case contract/app tests, targeted end-to-end checks
- `tooling/`
  - script quality, CI validation, boundary checker validation

### Boundary enforcement

The repository should add or extend a boundary checker so it can fail PRs when:

- `packages/core/` imports from `packages/protocols/`, `packages/components/`, `packages/prototypes/`, or
  `packages/use-cases/`
- `packages/registry/` imports from `packages/components/`, `packages/prototypes/`, or `packages/use-cases/`
- `packages/protocols/` imports from `packages/components/`, `packages/prototypes/`, or `packages/use-cases/`
- `packages/components/` imports from `packages/prototypes/` or `packages/use-cases/`
- `packages/prototypes/` imports from `packages/use-cases/`

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

1. `packages/core/` is the canonical VC meaning layer
2. `packages/registry/` is reusable and separately extractable
3. `packages/protocols/` is about interoperability bindings, not runtime orchestration
4. `packages/components/` is wiring, not core
5. `packages/prototypes/` prove maturity
6. `packages/use-cases/` prove concrete value and provide live docs
7. `demo` stops being a catch-all architectural label
8. `docs/architecture` remains the authoritative place for architecture
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

- move transport bindings into `packages/protocols/`
- move runtime wiring into `packages/components/`
- enforce the non-cycle rule between them

### Phase 4: prototype and use-case split

- move credential-family prototypes under `packages/prototypes/`
- split the current `*demo*` surfaces by intent:
  - reusable combination proofs into `packages/prototypes/`
  - concrete business/application flows into `packages/use-cases/`
- move BDD scenarios under the corresponding `packages/use-cases/` flow instead of
  keeping them in a generic shared bucket
- attach complexity/latency evidence to prototypes

### Phase 5: registry isolation

- move reusable registry surfaces under `packages/registry/`
- keep npm/public import compatibility during migration

### Phase 6: core consolidation

- move or rename the remaining core packages last
- this is the highest-churn step and should happen once the outer layers are
  already settled

## Open questions

1. should `packages/core/protocols/` become a physical area now, or remain conceptual
   until generic issuance/presentation modules are large enough to deserve it?
2. should prototype quality baselines remain checked into `docs/metrics` for
   human readability while raw baselines live under `packages/prototypes/quality`?
3. when `packages/registry/` is mature enough, should it move into a dedicated repo with
   this repository consuming it as a dependency?
4. should use-case BDD scenarios stay colocated under each use case, or should
   the repository keep a thin shared scenario runtime under `packages/components/` or
   `tooling/`?

Current recommendation:

- keep any reusable scenario runtime thin and shareable if needed
- keep the scenarios themselves under `packages/use-cases/`

## Immediate recommendation

Adopt the repository taxonomy in this RFC first, then execute it in phases.

Do not start by renaming packages for cosmetic reasons.
Start by enforcing the dependency model and moving the non-core outer layers
into clearer areas.
