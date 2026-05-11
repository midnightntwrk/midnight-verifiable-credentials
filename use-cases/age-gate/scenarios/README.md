# Age Gate BDD Scenarios

This workspace adds a TypeScript BDD layer for the concrete age-gate use case.

It does not replace Vitest unit or integration suites. Instead, it runs a
small number of curated use-case scenarios that generate Serenity/JS-compatible
outcomes and Serenity BDD reports as living documentation for engineers and
integrators.

## Current scenarios

The current slice now covers:

- three happy-path scenarios:
  - explicit-holder age-gate happy path
  - hidden-holder revocation-aware happy path
  - hidden-holder same-contract live-status happy path
- eight negative hidden-holder status-boundary scenarios:
  - same-contract live-status revoked handle
  - wrong registry id
  - wrong revoked root
  - stale verifier-supplied status snapshot
  - stale authority-attested proof
  - wrong authority attestation signer
  - unsupported authority-attested proof mode
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

Scope rule:

- this workspace is living documentation, not a second full regression matrix
- new scenarios should only land when they clarify trust boundaries,
  integration posture, or verifier/holder responsibilities materially

The Serenity BDD report is generated under:

```text
use-cases/age-gate/scenarios/target/site/serenity/
```

On macOS, open the report directly with:

```bash
open use-cases/age-gate/scenarios/target/site/serenity/index.html
```

Negative hidden-holder status scenarios now record both the raw failure message and one canonical status failure code through the shared plain-data failure-record helper, so the living docs can assert the fail-closed category directly.
