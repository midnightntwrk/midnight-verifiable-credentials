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

## Presentation

A Compact presentation envelope contains a format version, exact schema
reference, credential claim-root binding, issuer verification-method reference,
holder binding, and family-defined disclosures. Family contracts define
request, challenge, predicate, and policy semantics around that envelope.

Proofs are separate from semantic bodies. Verifiers MUST recompute body roots
and MUST NOT trust roots supplied without the corresponding canonical value.

Signer authorization is optional and separate from proof validity. A proof
establishes control of its supplied public key. Applications that need an
issuer or verifier trust decision MUST additionally bind that proof to an
accepted signer authorization as defined in
[`signer-authorization.md`](./signer-authorization.md).
