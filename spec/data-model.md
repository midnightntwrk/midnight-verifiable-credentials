# Data Model

## Credential configuration

A configuration identifies one schema version and selects bounded semantic
capabilities. Its normative fields are defined in
[configuration](./configuration.md).

## Credential

A canonical VC contains:

- a format version;
- an exact schema reference;
- typed direct claims or the empty direct-claims type;
- typed claim commitments or the empty commitments type;
- one holder-binding value;
- one status-binding value; and
- an issuer proof over the complete credential body and issuance context.

The claim and commitment layouts are fixed by the credential family. A core
implementation MUST NOT accept an unbounded runtime claim map as canonical
Compact input.

## Presentation request

A canonical presentation request contains an exact schema/configuration
reference, a fresh verifier challenge, requested disclosures, requested
predicates, and any required status freshness input. It contains no redirect,
HTTP, OIDC, DIDComm, session-store, or application-decision fields.

## Presentation

A canonical VP contains an exact request binding, the referenced credential
identity or body binding, requested disclosures and predicate results, holder
binding, applicable status evidence, and a presentation-context proof.

Proofs are separate from semantic bodies. Verifiers MUST recompute body roots
and MUST NOT trust roots supplied without the corresponding canonical value.

