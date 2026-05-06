# Age Gate BDD Scenarios

This workspace adds a TypeScript BDD layer for the concrete age-gate use case.

It does not replace Vitest unit or integration suites. Instead, it runs a
small number of curated use-case scenarios that generate Serenity/JS-compatible
outcomes and Serenity BDD reports as living documentation for engineers and
integrators.

## Current scenarios

The current slice covers two non-Docker VC flows:

- issue a birth credential from test fixtures
- verify an age-gate presentation through the age-gate contract simulator
- claim the resulting access capability
- issue a hidden-holder birth credential with status capability wiring
- verify a verifier-supplied-root age-gate presentation through the revocation-aware age-gate contract simulator
- claim the resulting revocation-aware access capability

## Run

From the repository root:

```bash
npm run test:bdd:smoke
```

That command reuses existing VC build artifacts when they are already present
and only falls back to the shared VC build prerequisites when they are missing.

The Serenity BDD report is generated under:

```text
use-cases/age-gate/scenarios/target/site/serenity/
```
