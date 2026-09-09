# Terminology and Glossary

These definitions are normative where the specification uses the term.

| Term | Meaning |
| --- | --- |
| Credential family definition | Versioned metadata that identifies a credential family and its claim schema. |
| Credential family | Independently released schema and family-specific circuits built on the core. |
| Claim | Typed statement made by an issuer about a credential subject. |
| Canonical encoding | Deterministic byte representation used for hashing, signing, and conformance. |
| Challenge | Verifier-provided value that binds a presentation or proof to one interaction. |
| Credential subject | Entity described by the claims in a credential. |
| Credential status | Evidence used to determine whether a credential remains usable. |
| VC | Canonical issuer-signed credential envelope. |
| VP | Canonical holder-created presentation envelope. |
| Direct claim | Typed claim carried directly in the signed credential body. |
| Claim commitment | Digest carried in the credential body while the opening remains private. |
| Disclosure | Claim value intentionally exposed in a presentation. |
| Predicate | Boolean statement proved over a claim without disclosing that claim. |
| Holder binding | Evidence that the presenting party controls the credential's bound key or secret. |
| Status binding | Issuer-signed reference binding a credential to status evidence. |
| Status authority | Entity authorized to make or attest credential-status transitions. |
| Status registry | State and rules used to publish or evaluate credential status. |
| Schema | Machine-readable definition of a credential family's claims and constraints. |
| Issuer | Authority that creates and signs a credential. |
| Holder | Entity that controls a credential and creates a presentation. |
| Verifier | Entity that evaluates a credential or presentation under an explicit policy. |
| DID | Decentralized Identifier resolved to a DID document. DID methods are outside the core. |
| Proof | Cryptographic evidence evaluated under an explicit verifier policy and context. |
| Signer authorization | Scoped decision accepting one exact verification method and key for an issuer or verifier role. |
| Authorized signer descriptor | Canonical role, method, key, scope, policy, and decision-sequence binding consumed by signer-authorization checks. |
| Decision sequence | Authenticated logical ordering value for authorization updates; it is not a wall-clock timestamp. |
| Authorization source | Local application governance or external authority that evaluates policy and produces a signer authorization. |
| Witness | Private or public input supplied to a circuit. |
| Trusted time | Time evidence accepted from an explicitly configured authority or ledger source. |
| Prover key | Circuit-specific artifact used to create a zero-knowledge proof. |
| Verifier key | Circuit-specific artifact used to verify a zero-knowledge proof. |
| ZKIR | Intermediate representation from which Midnight proving artifacts are produced. |
| Relying party | Application that acts on a verifier's decision. |
| Canonical object | Protocol-independent object whose meaning is defined by this specification. |
| Adapter | Transport, wallet, DID-method, or application integration outside the core. |

An adapter MUST NOT reinterpret a canonical object or omit verification required
by its owning credential family.
