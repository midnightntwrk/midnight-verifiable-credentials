# Package Selection

Choose the smallest package that owns the required semantic boundary.

## Supported packages

| Need | Package |
| --- | --- |
| Define and validate a credential family | `@midnight-ntwrk/credential-model` |
| Compose family-neutral Compact VC/VP circuits | `@midnight-ntwrk/credential-compact` |

These packages are the reusable external building blocks. Their supported
exports and publication policy are defined by the
[release contract](../architecture/package-release-contract.md).

## Proof and status

`credential-model` describes only generic credential-family and claim-schema
metadata. Generic family-neutral proof and status-binding primitives remain in
`credential-compact`. Concrete proof execution, status registries, authority,
deployment, and verification policy belong to the credential-family or
application repository that owns them. The [core status specification](../../spec/status.md)
defines only the credential-side binding.

## Build a credential family

Create an independent repository that owns:

- its credential schema and policy;
- family-specific Compact composition;
- generated proving and verification artifacts;
- conformance profile and test vectors;
- issuer, holder, and verifier integration; and
- versioning, publication, and deployment.

Depend on supported packages by version. Do not copy repository source or use
deep imports. Use the
[synthetic composition fixture](../../examples/core-composition/README.md) only
as a minimal integration example.
