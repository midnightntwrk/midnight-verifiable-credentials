# Package Selection

Choose the smallest package that owns the required semantic boundary.

## Supported packages

| Need | Package |
| --- | --- |
| Define and validate credential configuration | `@midnight-ntwrk/credential-model` |
| Compose family-neutral Compact VC/VP circuits | `@midnight-ntwrk/credential-compact` |
| Integrate proof verification or artifact manifests | `@midnight-ntwrk/credential-proofs` |
| Model credential status without selecting a registry | `@midnight-ntwrk/credential-status` |
| Bind a credential holder through `did:midnight` | `@midnight-ntwrk/credential-did-midnight` |

These packages are the reusable external building blocks. Their supported
exports and publication policy are defined by the
[release contract](../architecture/package-release-contract.md).

## Internal packages

The display package and three `credential-status-midnight-*` packages are
incubating implementation components. They are not public compatibility
commitments and are not published. Do not build external release plans around
them.

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
