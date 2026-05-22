# Age Gate BDD Scenarios

> Maturity: `demo`
> Package class: `scenario`

This workspace adds a TypeScript BDD layer for the concrete age-gate use case.

It does not replace Vitest unit or integration suites. Instead, it runs a
small number of curated use-case scenarios that generate Serenity/JS-compatible
outcomes and Serenity BDD reports as living documentation for engineers and
integrators.

Step notes in the Serenity report use the versioned
`midnight-age-gate-step-insight.v1` shape:

- `request`: the human intent behind the scenario action
- `response`: the simulator or verifier outcome the reader should expect
- `checks`: the assertions that make the trust boundary explicit
- `dto`: compact JSON-safe counters, roots, registry ids, and failure codes

The use-case-specific wrapper lives at
`features/support/age-gate-step-insight.ts`; shared serialization and
normalization live at `@midnight-ntwrk/midnight-did-credentials-bdd-support`.
Scenario request/response/check narration lives in
`features/support/age-gate-reporting.ts`, so the feature files stay readable
while each scenario still emits a stable DTO-backed report note. The `checks`
entries are human-readable narration of assertions performed by the scenario
code, not a separate assertion engine.

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

Contract check:

```bash
npm run test:step-insight:contract -w ./packages/use-cases/age-gate/scenarios
```

That contract check verifies the `midnight-age-gate-step-insight.v1` schema,
the complete age-gate narrative catalog, and the compact DTO summaries for both
explicit-holder and hidden-holder result shapes.

Scope rule:

- this workspace is living documentation, not a second full regression matrix
- new scenarios should only land when they clarify trust boundaries,
  integration posture, or verifier/holder responsibilities materially
- scenario tasks should record request/response/check/DTO insight through
  `features/support/age-gate-reporting.ts` plus
  `features/support/age-gate-step-insight.ts` instead of embedding raw logs in
  step definitions; keep reusable serialization behavior in
  `@midnight-ntwrk/midnight-did-credentials-bdd-support`

The Serenity BDD report is generated under:

```text
packages/use-cases/age-gate/scenarios/target/site/serenity/
```

The summary-first artifacts are generated before the Serenity aggregation step:

```text
packages/use-cases/age-gate/scenarios/target/summary.json
packages/use-cases/age-gate/scenarios/target/summary.md
```

Use `target/summary.md` for a compact pass/fail table when you only need to
inspect scenario intent, tags, duration, and the first non-passing step.

On macOS, open the report directly with:

```bash
open packages/use-cases/age-gate/scenarios/target/site/serenity/index.html
```

Negative hidden-holder status scenarios now record both the raw failure message and one canonical status failure code through the shared plain-data failure-record helper, so the living docs can assert the fail-closed category directly.
