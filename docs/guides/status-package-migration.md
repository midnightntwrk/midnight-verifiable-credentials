# Status package least-privilege migration

Issue #495 introduces three internal candidate packages while lifecycle and publication remain owned by #463, #466, and #444:

| Consumer | Package | Permitted capability |
| --- | --- | --- |
| Registry state/deployment adapter | `@midnight-ntwrk/credential-status-midnight-contract` | Atomic state, authorization gate invocation, nonce receipts, audit commitment |
| Verifier/read/proof | `@midnight-ntwrk/credential-status-midnight-verifier` | Exact-state reads, handle/root derivation, reference membership/non-membership verification, #494 authority-evidence consumption |
| Controller/delegate operator | `@midnight-ntwrk/credential-status-midnight-authority` | #494 DID/trust evidence binding, delegate grant evidence, write authorization, injected signing port |

## Migration rules

- New read-only code imports the verifier package, never the legacy mixed registry root.
- Mutation services import the authority and contract packages explicitly.
- External-root verification requires the verifier package's explicit cryptographic-proof, #494 root-authority, and freshness-verifier ports. The verifier policy must supply the accepted authority-policy digest plus trusted leaf/credential/presentation/challenge bindings; never copy them from holder evidence. Omitted or unavailable evidence is indeterminate; authenticated mismatch is invalid.
- The bundled SHA-256 verifier is reference/off-chain semantics, not a Compact proof or an authority upgrade. Private external status stays unavailable until a ZK adapter can prove a challenge-scoped leaf without disclosure.
- Signing/key custody remains injected; the authority package does not store keys.
- Profiles with status disabled require none of these packages or any legacy registry/status-proof package. Generic issuer/holder signing selected independently by the profile remains present.
- `@midnight-ntwrk/midnight-did-credentials-status-registry` remains a private compatibility surface for existing Compact/prototype consumers during migration. Its mixed and unauthenticated Compact entrypoints remain explicitly unsupported for production.

## Security boundary

The new state package serializes gate verification with mutation and gives exact replay/nonce/version/audit behavior. The authority package authenticates external facts through injected #494 evidence ports and an injected delegate-grant evidence provider; it does not implement a DID method, trust registry, grant-signature authority, trusted ledger time, or key custody.

Issue #496 adds cryptographic SHA-256 reference root/proof verification and binds its result into a canonical status transcript, while preserving package separation. It does not claim final Compact B2/B3 completion. A pinned-toolchain probe compiled `MerkleTree.checkRoot(MerkleTreeDigest { ... })`, but `root()` was rejected as runtime-only and `pathForLeaf(...)` was unavailable in-circuit; no native non-membership circuit was compiled. Trusted execution-context time also remains a separate gate. Consumers must not label the TypeScript reference result as a Compact proof or ledger-authoritative.
