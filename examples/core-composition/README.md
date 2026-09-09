# Core composition example

> Maturity: `reference`
> Package class: `source-only`

This private, synthetic example shows the smallest TypeScript composition of
the public `@midnight-ntwrk/credential-model` and
`@midnight-ntwrk/credential-compact` exports. It defines generic family and
claim-schema metadata, then round-trips an opaque Compact value.

It is conformance evidence, not a product or implementation template. It has no
DID, protocol, transport, session, deployment, application, or real-person
data. It is not published.

Run its focused checks:

```bash
pnpm turbo run typecheck test \
  --filter=@midnight-ntwrk/credential-core-composition-example
```

Turbo builds the two package dependencies before running the fixture checks.
