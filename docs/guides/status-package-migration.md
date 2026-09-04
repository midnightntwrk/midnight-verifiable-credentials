# Status package least-privilege migration

Issue #495 introduces three internal candidate packages while lifecycle and publication remain owned by #463, #466, and #444:

| Consumer | Package | Permitted capability |
| --- | --- | --- |
| Registry state/deployment adapter | `@midnight-ntwrk/credential-status-midnight-contract` | Atomic state, authorization gate invocation, nonce receipts, audit commitment |
| Verifier/read/witness | `@midnight-ntwrk/credential-status-midnight-verifier` | State reads, handle digest/witness derivation, generic status reader |
| Controller/delegate operator | `@midnight-ntwrk/credential-status-midnight-authority` | #494 DID/trust evidence binding, delegate grant evidence, write authorization, injected signing port |

## Migration rules

- New read-only code imports the verifier package, never the legacy mixed registry root.
- Mutation services import the authority and contract packages explicitly.
- Signing/key custody remains injected; the authority package does not store keys.
- Profiles with status disabled require none of these packages or any legacy registry/status-proof package. Generic issuer/holder signing selected independently by the profile remains present.
- `@midnight-ntwrk/midnight-did-credentials-status-registry` remains a private compatibility surface for existing Compact/prototype consumers during migration. Its mixed and unauthenticated Compact entrypoints remain explicitly unsupported for production.

## Security boundary

The new state package serializes gate verification with mutation and gives exact replay/nonce/version/audit behavior. The authority package authenticates external facts through injected #494 evidence ports and an injected delegate-grant evidence provider; it does not implement a DID method, trust registry, grant-signature authority, trusted ledger time, or key custody.

This slice does not claim final Compact B1/B2/B3 completion. Root-bound proof cryptography, in-circuit DID/grant authorization, and trusted execution-context time remain separate gates. Consumers must not label off-chain reference receipts as ledger-authoritative.
