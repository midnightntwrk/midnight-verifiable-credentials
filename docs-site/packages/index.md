# Packages

The supported release graph contains three public packages.

| Package                                                   | Runtime                    | Primary consumer                            |
| --------------------------------------------------------- | -------------------------- | ------------------------------------------- |
| [`@midnight-ntwrk/credential-model`](/packages/model)     | TypeScript ESM             | Credential-family repositories and tooling  |
| [`@midnight-ntwrk/credential-compact`](/packages/compact) | Compact and TypeScript ESM | Family contracts and verification contracts |
| [`@midnight-ntwrk/credential-did-midnight`](/packages/credential-did-midnight) | Compact and TypeScript ESM | Midnight DID-aware consumers |

The model and Compact core packages are independent. The optional Midnight DID
binding depends one-way on the Compact core. A concrete credential-family
repository selects only the boundaries it needs.
