# Age Gate BDD Scenarios

This workspace adds a TypeScript BDD layer for the concrete age-gate use case.

It does not replace Vitest unit or integration suites. Instead, it runs a
small number of curated use-case scenarios that generate Serenity/JS-compatible
outcomes and Serenity BDD reports as living documentation for engineers and
integrators.

## Current scenarios

The current slice now covers:

- two happy-path scenarios:
  - explicit-holder age-gate happy path
  - hidden-holder revocation-aware happy path
- three negative hidden-holder status-boundary scenarios:
  - wrong registry id
  - wrong revoked root
  - stale authority-attested proof
  - revoked credential rejected before proof assembly

## Run

From the repository root:

```bash
./run.sh bdd
./run.sh bdd-negative
./run.sh bdd-all
```

Equivalent npm entrypoints:

```bash
npm run test:bdd:smoke
npm run test:bdd:negative
npm run test:bdd:all
```

Those commands reuse existing VC build artifacts when they are already present
and only fall back to the shared VC build prerequisites when they are missing.

The Serenity BDD report is generated under:

```text
use-cases/age-gate/scenarios/target/site/serenity/
```

On macOS, open the report directly with:

```bash
open use-cases/age-gate/scenarios/target/site/serenity/index.html
```
