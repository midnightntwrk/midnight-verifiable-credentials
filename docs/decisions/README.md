# Architecture Decision Records

This directory records decisions that constrain the architecture of Midnight
Verifiable Credentials. Plans describe work that may change; accepted ADRs
describe boundaries that implementations must preserve until a later ADR
supersedes them.

## Statuses

- `Proposed`: under review and not yet binding.
- `Accepted`: the current architectural direction.
- `Superseded`: replaced by a newer ADR.
- `Deprecated`: retained for history but no longer recommended.

## Register

| ADR | Status | Decision |
| --- | --- | --- |
| [0001](./0001-credential-product-repository-boundary.md) | Accepted | Create a separate repository for an independently governed credential product, not for every issuer or schema revision |
| [0002](./0002-contract-composition-and-registry-governance.md) | Accepted | Keep credential families pure and compose deployment-specific authority, status, and verifier contracts |
| [0003](./0003-zk-artifact-distribution-and-discovery.md) | Accepted | Bind ZK artifacts to deployable contracts and distribute immutable, digest-addressed bundles |
| [0004](./0004-rendering-localization-and-transliteration.md) | Accepted | Separate canonical claims from rendering and version any policy-relevant localization or transliteration |
| [0005](./0005-verification-execution-and-authority.md) | Accepted | Use one Compact verification model with explicit on-chain authority and restricted off-chain profiles |
| [0006](./0006-existing-dapp-connector-credentials-extension.md) | Accepted | Add a versioned credentials extension to the existing Midnight DApp Connector API |
| [0007](./0007-openid-credential-protocols-and-didcomm.md) | Accepted | Use OID4VCI and OID4VP as the interoperable protocols and keep DIDComm optional |
| [0008](./0008-package-release-stages-and-candidate-contract.md) | Accepted | Separate packable artifacts from release candidates and supported packages |

[`anoncreds-comparison.md`](./anoncreds-comparison.md) remains design research,
not an ADR.

New records should start from [`0000-template.md`](./0000-template.md). Amend an
accepted ADR only for clarifications that do not change its decision. Use a new
ADR to reverse or materially change a decision.
