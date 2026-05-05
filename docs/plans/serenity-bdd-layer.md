# Serenity BDD Layer Plan

## Goal

Add a Serenity BDD scenario layer that complements, not replaces, the existing
Vitest suites.

This layer is intended to provide:

- living documentation for the main VC/DID use cases
- readable prototype narratives for engineers and integrators
- Serenity reports that make scenario flows easy to review without opening test
  internals first

## Why a separate layer

Vitest remains the right tool for:

- low-level circuit and protocol correctness
- package-local unit tests
- integration and regression coverage

Serenity BDD adds value where the repo currently has a gap:

- cross-package use-case storytelling
- reportable scenario traces
- a curated set of stable prototype examples

## Implementation shape

Use a separate Maven module with Cucumber + Serenity instead of embedding this
inside the Node workspaces.

Reasoning:

- Serenity BDD is naturally JVM-based
- the repo already has Node/Vitest for core engineering tests
- a separate module avoids polluting package-local toolchains
- Maven `verify` plus Serenity aggregation produces stable HTML reports without
  changing the existing package test runners

## Layering rules

1. Serenity scenarios must reuse existing VC behavior rather than duplicate it.
2. The first scenarios should call small bridge scripts that exercise existing
   package exports and simulators.
3. Docker-backed or real-DID flows are follow-up work, not the first spike.
4. Vitest remains the source of deep correctness; Serenity is the source of
   narrated use-case examples.

## Initial scope

Start with one smoke scenario:

- birth credential age-gate happy path
- no Docker
- no network provisioning
- uses existing birth fixture helpers and demo simulator

This keeps the first layer:

- cheap enough to run locally
- understandable from the report
- representative of a real VC prototype flow

## Rollout plan

### Phase 1

- create `serenity-vc-scenarios/`
- add Maven + Serenity + Cucumber wiring
- add one small happy-path scenario
- add one repository command to run it
- make the repository command artifact-aware so repeat runs do not always
  trigger the full shared VC prereq build

### Phase 2

- add secret-holder happy path
- add revocation demo happy path once the scenario boundary is stable
- document where generated reports live and how to read them

### Phase 3

- decide whether to add a dedicated CI lane for Serenity smoke scenarios
- keep the lane small and curated
- do not duplicate the full Vitest matrix in Serenity

## Candidate scenario backlog

1. explicit-holder age-gate
2. hidden-holder age-gate
3. same-holder proof composition
4. revocation-aware demo path
5. protocol agent lifecycle with real DIDs

## Non-goals for the first spike

- replacing Vitest
- full Docker-backed end-to-end coverage
- broad business workflow coverage
- using Serenity as the main regression layer
