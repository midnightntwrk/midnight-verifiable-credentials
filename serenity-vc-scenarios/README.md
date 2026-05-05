# Serenity VC Scenarios

This module adds a Serenity BDD layer on top of the Midnight VC prototype.

It does not replace Vitest unit or integration suites. Instead, it runs a
small number of curated happy-path scenarios that generate Serenity reports as
living documentation for engineers and integrators.

## First scenario

The initial spike covers a non-Docker birth-credential age-gate flow:

- issue a birth credential from test fixtures
- verify an age-gate presentation through the demo contract simulator
- claim the resulting capability

## Run

From the repository root:

```bash
npm run test:serenity:smoke
```

That command reuses existing build artifacts when they are already present and
only falls back to the shared VC build prerequisites when they are missing.

The Serenity HTML report is generated under:

```text
serenity-vc-scenarios/target/site/serenity/
```
