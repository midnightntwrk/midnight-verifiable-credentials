# Glossary

This glossary gives concise reader-facing definitions. The
[core specification](../spec/README.md) is authoritative when a term has
normative requirements.

| Term | Meaning |
| --- | --- |
| Adapter | Narrow translation between core interfaces and an external runtime or SDK. |
| Artifact manifest | Immutable metadata that binds generated proving artifacts to source and toolchain inputs. |
| Canonical encoding | Deterministic byte representation used for hashing, signing, and conformance. |
| Canonical object | Protocol-independent object whose security meaning is defined by the core specification. |
| Challenge | Verifier-provided value that binds a presentation or proof to one interaction. |
| Claim | Typed statement made by an issuer about a credential subject. |
| Claim commitment | Digest in a credential that binds a private claim without revealing its opening. |
| Compact | Midnight's smart-contract language and zero-knowledge circuit toolchain. |
| Conformance vector | Deterministic positive or negative input used to test a normative requirement. |
| Credential family definition | Versioned metadata that identifies a credential family and its claim schema. |
| Credential family | Independently released schema, policy, circuits, artifacts, and integration built on this core. |
| Credential status | State used to determine whether a credential is active, revoked, suspended, or otherwise unusable. |
| Credential subject | Entity described by the claims in a credential. |
| DID | Decentralized Identifier resolved to a DID document containing verification relationships and services. |
| Disclosure | Claim value intentionally revealed in a presentation. |
| Holder | Entity that controls a credential and creates a presentation. |
| Holder binding | Evidence that the presenter controls the key or secret bound to a credential. |
| Issuer | Authority that creates and signs a verifiable credential. |
| Predicate | Statement proved over a claim without disclosing the claim value. |
| Proof | Cryptographic evidence evaluated under an explicit verifier policy and context. |
| Prover key | Circuit-specific artifact used to create a zero-knowledge proof. |
| Relying party | Application that acts on a verifier's decision. |
| Schema | Machine-readable definition of a credential family's claims and constraints. |
| Status authority | Entity authorized to make or attest credential-status transitions. |
| Status binding | Issuer-signed reference connecting a credential to its status mechanism. |
| Status registry | State and rules used to publish or evaluate credential status. |
| Trusted time | Time evidence accepted from an explicitly configured authority or ledger source. |
| VC | Verifiable Credential: an issuer-signed credential envelope. |
| Verifier | Entity that evaluates a credential or presentation under an explicit policy. |
| Verifier key | Circuit-specific artifact used to verify a zero-knowledge proof. |
| VP | Verifiable Presentation: a holder-created presentation envelope. |
| Witness | Private or public input supplied to a circuit to produce or verify a proof. |
| ZKIR | Intermediate representation from which Midnight proving artifacts are produced. |

Transports and high-level exchange protocols carry canonical VC/VP objects but
are outside this repository's scope.
