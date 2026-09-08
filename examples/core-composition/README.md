# Core composition example

> Maturity: `reference`
> Package class: `source-only`

This private, synthetic example shows the smallest TypeScript composition of
the public `@midnight-ntwrk/credential-model` and
`@midnight-ntwrk/credential-compact` exports. It defines a family descriptor,
round-trips its JSON codec, and round-trips an opaque Compact value.

It is conformance evidence, not a product or implementation template. It has no
DID, protocol, transport, session, deployment, application, or real-person
data. It is not published.

Run its focused checks:

```bash
pnpm --dir examples/core-composition typecheck
pnpm --dir examples/core-composition test:ci
```
