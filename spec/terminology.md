# Terminology

| Term | Meaning |
| --- | --- |
| Credential family definition | Versioned schema, capability, artifact, package, and codec descriptor. |
| Credential family | Independently released schema and family-specific circuits built on the core. |
| VC | Canonical issuer-signed credential envelope. |
| VP | Canonical holder-created presentation envelope. |
| Direct claim | Typed claim carried directly in the signed credential body. |
| Claim commitment | Digest carried in the credential body while the opening remains private. |
| Disclosure | Claim value intentionally exposed in a presentation. |
| Predicate | Boolean statement proved over a claim without disclosing that claim. |
| Holder binding | Evidence that the presenting party controls the credential's bound key or secret. |
| Status binding | Issuer-signed reference binding a credential to status evidence. |
| Canonical object | Protocol-independent object whose meaning is defined by this specification. |
| Adapter | Transport, wallet, DID-method, or application integration outside the core. |

An adapter MUST NOT reinterpret a canonical object or omit verification required
by its owning credential family.
