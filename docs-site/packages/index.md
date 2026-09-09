# Packages

The supported release graph contains exactly two public packages.

| Package                                                   | Runtime                    | Primary consumer                            |
| --------------------------------------------------------- | -------------------------- | ------------------------------------------- |
| [`@midnight-ntwrk/credential-model`](/packages/model)     | TypeScript ESM             | Credential-family repositories and tooling  |
| [`@midnight-ntwrk/credential-compact`](/packages/compact) | Compact and TypeScript ESM | Family contracts and verification contracts |

The packages are independent and neither depends on the other. A concrete
credential-family repository commonly selects both because metadata and
circuit semantics are separate concerns.
