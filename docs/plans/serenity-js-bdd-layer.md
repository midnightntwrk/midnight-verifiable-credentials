# Serenity/JS BDD Layer Plan

## Goal

Add a TypeScript BDD scenario layer that complements, not replaces, the
existing Vitest suites.

This layer is intended to provide:

- living documentation for the main VC use cases
- readable prototype narratives for engineers and integrators
- reportable scenario traces that are easier to review than package-local test
  internals

## Why a separate layer

Vitest remains the right tool for:

- low-level circuit and protocol correctness
- package-local unit tests
- integration and regression coverage

Serenity/JS with Cucumber adds value where the repo still has a gap:

- cross-package use-case storytelling
- screenplay-style scenario composition
- generated report artifacts that can be reviewed as living documentation

## Implementation shape

Use a separate Node workspace package with:

- Serenity/JS
- Cucumber.js
- TypeScript
- Screenplay Pattern abstractions for reusable tasks and questions

Do not introduce Java source or Maven into the repository.

Current reporting choice:

- author scenarios in TypeScript only
- keep Serenity BDD HTML aggregation through the Serenity CLI runtime for now

If the repository later requires zero Java runtime as well, replace only the
reporting backend with a pure Node reporting stack. The Cucumber + Serenity/JS
screenplay authoring layer should stay intact.

For browser-backed scenarios in later phases, add Playwright through
`@serenity-js/playwright`. The first slice does not need browser automation
because this repository is still library-first.

## Layering rules

1. BDD scenarios must reuse existing VC behavior rather than duplicate it.
2. The first scenarios should exercise existing package exports and simulators.
3. Docker-backed or real-DID flows are follow-up work, not the first spike.
4. Vitest remains the source of deep correctness; the BDD layer is the source
   of narrated use-case examples.

## Initial scope

Start with two smoke scenarios:

- birth credential age-gate happy path
- hidden-holder verifier-supplied-root revocation-aware age-gate happy path
- no Docker
- no browser automation yet
- use existing birth and demo-contract testing surfaces

This keeps the first layer:

- cheap enough to run locally
- understandable from the report
- representative of a real VC prototype flow

## Rollout plan

### Phase 1

- create `vc-bdd-scenarios/`
- add Serenity/JS + Cucumber + TypeScript wiring
- add one small happy-path scenario
- add one repository command to run it
- make the repository command artifact-aware so repeat runs do not always
  trigger the full shared VC prereq build

### Phase 2

- add authority-attested hidden-holder happy path
- add same-holder composition once the scenario boundary is stable
- add a dedicated scenario-only CI lane instead of relying on the docs-only
  classifier
- if needed later, swap the current Java-backed Serenity report aggregation for
  a pure Node reporting backend without changing scenario authoring

### Phase 3

- add Playwright-backed scenarios only where there is a real browser-facing
  flow to exercise
- keep the lane small and curated
- do not duplicate the full Vitest matrix in BDD form

## Candidate scenario backlog

1. explicit-holder age-gate
2. hidden-holder verifier-supplied-root age-gate
3. hidden-holder authority-attested age-gate
4. same-holder proof composition
5. protocol agent lifecycle with real DIDs

## Non-goals for the first spike

- replacing Vitest
- introducing Java source or Maven
- full Docker-backed end-to-end coverage
- broad business workflow coverage
- using the BDD layer as the main regression suite
