# BDD Support

> Maturity: `infrastructure`
> Package class: `source-only`

Shared source-only support helpers for use-case BDD packages.

This package is private and executes TypeScript sources directly through the
scenario packages' `ts-node/esm` Cucumber loaders. It does not publish a `dist/`
surface.

## Step Insight Reports

`src/step-insight.ts` owns the common Serenity step-insight report envelope:

- `schemaVersion`: use-case-owned report schema id
- `title`: Serenity artifact title
- `request`: human intent behind the step
- `response`: expected result summary
- `checks`: narration of assertions performed by scenario code
- `dto`: JSON-safe DTO summary with BigInt values serialized as decimal strings
  and byte arrays serialized as compact hex strings

Use-case packages should keep thin wrappers that pin their schema version and
export local function names for their step definitions.

## Summary-First Reports

`src/bdd-summary.ts` turns Cucumber JSON output into a compact
`midnight-bdd-summary.v1` report:

- `summary.json`: machine-readable totals, scenario status, durations, tags, and
  first non-passing step
- `summary.md`: quick human-readable table for local inspection before opening
  the heavier Serenity HTML report

Scenario packages should emit Cucumber JSON to `target/cucumber-report.json` and
write summaries to `target/summary.json` and `target/summary.md`.

CI retains the compact handoff files under the `bdd-summary-artifacts` artifact
when the focused BDD-only lane runs the age-gate smoke and university BDD
scenarios. The upload uses `if: always()` so failed scenario executions still
leave the Cucumber JSON and generated summaries available for inspection before
opening the heavier Serenity report.

`src/bdd-pipeline.ts` owns the small execution wrapper that runs clean,
Cucumber execution, summary generation, and Serenity aggregation. It still runs
summary/report generation after a failing Cucumber run and then exits with the
original scenario failure code.

## Consumers

Scenario packages execute this source-only package directly through
`ts-node/esm`; consumers that import it in TypeScript projects must keep
`allowImportingTsExtensions: true` because `src/index.ts` re-exports source
files with `.ts` extensions.
