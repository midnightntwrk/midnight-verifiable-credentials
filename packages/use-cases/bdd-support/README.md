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

## Consumers

Scenario packages execute this source-only package directly through
`ts-node/esm`; consumers that import it in TypeScript projects must keep
`allowImportingTsExtensions: true` because `src/index.ts` re-exports source
files with `.ts` extensions.
