# Prototypes

This top-level area is reserved for prototype credential-family combinations and
quality-evidence packages.

Target contents:

- VC family + capability + protocol combination proofs
- complexity / latency / quality tracking
- low-level example matrices that prove core solidity

Current subtrees:

- `credential-families/`

BDD living documentation does not belong here. Concrete flow scenarios belong in
`packages/use-cases/`.

## Credential-Family Maturity

Use the same maturity and package-class tags enforced by
`npm run check:workspace-manifests`:

| Package | Maturity | Package class | Role |
| --- | --- | --- | --- |
| `credential-families/birth` | `reference` | `dist` | Commitment-backed birth family and simplest reusable age-predicate reference. |
| `credential-families/birth-secret` | `reference` | `dist` | Hidden-holder birth family with status/revocation and same-holder capability coverage. |
| `credential-families/hello-family` | `reference` | `dist` | Starter explicit-holder family and offchain-DID smoke path. |
| `credential-families/university-diploma` | `reference` | `dist` | University diploma direct-claim reference used by the university use case. |
| `credential-families/dummy-claims` | `lab` | `dist` | Broad direct-claim compiler-surface laboratory. |
| `credential-families/mixed-claims` | `lab` | `dist` | Public/direct plus commitment-backed claim-representation laboratory. |

Graduation rule:

- `reference` packages can be used as examples for new credential-family code
  but are still private until publish policy changes.
- `lab` packages prove compiler or modeling boundaries and should not be copied
  into business flows without a README update that explains the production
  semantics.
- BDD scenarios in `packages/use-cases/` should link back to the family package
  they exercise rather than duplicating maturity policy locally.
