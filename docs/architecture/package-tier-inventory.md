# Package Tier Inventory

This inventory describes the retained core-only workspace. Publication support
is governed separately by the [release contract](./package-release-contract.md).

## Reusable core

| Package | Role |
| --- | --- |
| `credential-model` | Credential configuration, descriptors, and codecs |
| `credential-compact` | Family-neutral Compact semantics |
| `credential-proofs` | Proof and artifact interfaces |
| `credential-status` | Generic status semantics and ports |
| `credential-display` | Framework-neutral display metadata |
| `credentials` | Compact credential and presentation primitives |
| `credentials-same-holder` | Same-holder proof composition |
| `credentials-iso-registry` | Compact-native ISO code types |

## Midnight implementations

| Package | Role |
| --- | --- |
| `credentials-status-registry` | Existing combined status-registry implementation |
| `credential-status-midnight-contract` | Atomic status state and mutation authorization |
| `credential-status-midnight-verifier` | Least-privilege status reads and witnesses |
| `credential-status-midnight-authority` | Controller/delegate authorization ports |
| `credentials-offchain-did` | Off-chain DID holder-binding adapter |
| `credential-did-midnight` | `did:midnight` holder-binding adapter |

## Non-package fixture

`examples/core-composition` is private and exists only to prove clean package
composition. It is not a credential family, protocol, or application.

Credential families, product examples, exchange protocols, runtime discovery,
session orchestration, and deployment harnesses are not repository tiers. They
belong in independent consumer repositories.
