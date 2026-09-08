# Package Selection

Choose the smallest package that owns the semantic or runtime boundary you
need. Do not depend on a registry implementation or DID adapter when a core
interface is sufficient.

## Models and core semantics

| Need | Package |
| --- | --- |
| Credential configuration, descriptors, or codecs | `@midnight-ntwrk/credential-model` |
| Family-neutral Compact vocabulary | `@midnight-ntwrk/credential-compact` |
| Generic credential/presentation Compact primitives | `@midnight-ntwrk/midnight-did-credentials` |
| Proof provider and artifact-manifest ports | `@midnight-ntwrk/credential-proofs` |
| Generic status semantics and ports | `@midnight-ntwrk/credential-status` |
| Framework-neutral display metadata | `@midnight-ntwrk/credential-display` |
| Same-holder proof composition | `@midnight-ntwrk/midnight-did-credentials-same-holder` |
| Compact-native ISO types | `@midnight-ntwrk/midnight-did-credentials-iso-registry` |

## Midnight status

| Need | Package |
| --- | --- |
| Existing combined status-registry contract/helpers | `@midnight-ntwrk/midnight-did-credentials-status-registry` |
| Atomic ledger state and authorization gate | `@midnight-ntwrk/credential-status-midnight-contract` |
| Read-only status verification and witness access | `@midnight-ntwrk/credential-status-midnight-verifier` |
| Controller/delegate authorization and signing ports | `@midnight-ntwrk/credential-status-midnight-authority` |

Prefer the split packages for new integrations. Keep mutation authority out of
verifier-only applications.

## DID adapters

| Need | Package |
| --- | --- |
| Runtime-neutral off-chain DID holder binding | `@midnight-ntwrk/midnight-did-credentials-offchain-did` |
| `did:midnight` holder-binding integration | `@midnight-ntwrk/credential-did-midnight` |

Adapters translate core interfaces to DID APIs. They do not own credential
issuance, presentation exchange, discovery, or transport protocols.

## Building a credential family

Create a separate repository and depend on the required published packages.
Keep its schema, Compact contract, generated proof artifacts, conformance
profile, examples, and release version together. Use the specification and the
[core composition fixture](../../examples/core-composition/README.md) as the
integration baseline.

Package publication status is authoritative in the
[release contract](../architecture/package-release-contract.md).
