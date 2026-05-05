# VC BDD Scenarios

This workspace adds a TypeScript BDD layer on top of the Midnight VC
prototype.

It does not replace Vitest unit or integration suites. Instead, it runs a
small number of curated use-case scenarios that generate Serenity/JS-compatible
outcomes and Serenity BDD reports as living documentation for engineers and
integrators.

## First scenario

The initial slice covers a non-Docker birth-credential age-gate flow:

- issue a birth credential from test fixtures
- verify an age-gate presentation through the demo contract simulator
- claim the resulting access capability

## Run

From the repository root:

```bash
npm run test:bdd:smoke
```

That command reuses existing VC build artifacts when they are already present
and only falls back to the shared VC build prerequisites when they are missing.

The Serenity BDD report is generated under:

```text
vc-bdd-scenarios/target/site/serenity/
```
