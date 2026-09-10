# Data Model

## Credential family definition

A TypeScript family definition records a stable identifier, semantic version,
optional human-readable name and description, and one versioned claim schema.
The schema may also carry a human-readable name and description and records its
credential types and claim metadata, including claim paths, disclosure modes,
required flags, and optional value-type labels.

The definition does not prescribe credential or presentation payload types,
codecs, capabilities, proof artifacts, package composition, deployment, or
protocol behavior. Credential-family repositories own those concerns.

## Schema reference

An exact schema reference has these Compact fields:

- `packageId: Bytes<32>`, a non-zero identifier for the independently released
  credential-family package;
- `schemaId: Bytes<32>`, a non-zero identifier for the schema within that
  package;
- `majorVersion: Uint<16>`, which MUST be greater than zero; and
- `minorVersion: Uint<16>`, which MAY be zero.

A core implementation MUST reject a zero `packageId`, zero `schemaId`, or zero
`majorVersion`. The pair of package and schema identifiers plus both version
fields identifies the exact schema contract used by a credential.

## Credential

A canonical credential body contains:

- `version`, which is `1` for this draft;
- an exact schema reference;
- the issuer verification-method reference;
- signed `issuedAt`, `hasExpiration`, and `expiresAt` values;
- typed direct claims or the empty direct-claims type;
- typed claim commitments or the empty commitments type;
- one holder-binding value;
- one status-binding value; and
- a claim root binding the family-defined claim representation.

The claim and commitment layouts are fixed by the credential family. A core
implementation MUST NOT accept an unbounded runtime claim map as canonical
Compact input. The issuer proof is a separate object over the complete
credential body and issuance context; it is not a field of the credential
body. `issuedAt` and `expiresAt` are signed numeric assertions, not trusted
wall-clock evidence.

The generic envelope validator checks the version, a caller-supplied expected
claim root, and expiration ordering when `hasExpiration` is true. Family code
MUST validate its claim root, schema, holder binding, and selected status
binding before accepting the credential.

## Presentation

A Compact presentation body contains `version`, an exact schema reference, the
credential claim-root binding, issuer verification-method reference, holder
binding, and family-defined disclosures. Its proof is separate. The generic
presentation validator checks only the version; credential-to-presentation
relations, holder proof binding, disclosures, predicates, status, request
scope, challenge freshness, and application policy are separate checks.
The generic credential-to-presentation relation requires the exact schema
reference, credential claim root, and issuer verification-method reference to
match before family-specific disclosure or predicate checks run.

Proofs are separate from semantic bodies. Verifiers MUST recompute body roots
and MUST NOT trust roots supplied without the corresponding canonical value.
Proof construction and verification are defined in
[`proof-semantics.md`](./proof-semantics.md).

Signer authorization is optional and separate from proof validity. A proof
establishes control of its supplied public key. Applications that need an
issuer or verifier trust decision MUST additionally bind that proof to an
accepted signer authorization as defined in
[`signer-authorization.md`](./signer-authorization.md).
