# Midnight VC Claim Representation

Status: normative companion profile for the current Midnight Credentials draft.

This document defines how credential families represent claims inside the
Compact-native `VC<TClaims, THolderBinding, TStatusBinding>` envelope.

It is companion material to:

- [`midnight-credentials.md`](./midnight-credentials.md)
- [`profiles.md`](./profiles.md)
- [`conformance.md`](./conformance.md)

## Standards Alignment

The Midnight model is compatible with explicit/plain claims and committed or
selectively disclosed claims:

- W3C Verifiable Credentials Data Model 2.0 represents credentials as issuer
  claims about subjects and allows normal `credentialSubject` properties:
  <https://www.w3.org/TR/vc-data-model/>
- W3C VC JOSE/COSE describes JWT-secured credentials and selective-disclosure
  options for JWT-based credentials: <https://www.w3.org/TR/vc-jose-cose/>
- RFC 9901 SD-JWT explicitly supports a signed JSON object containing both
  cleartext claims and digests for selectively disclosable claims:
  <https://www.rfc-editor.org/rfc/rfc9901.html>
- the current IETF SD-JWT VC draft permits SD-JWT VC credentials with zero,
  some, or many selectively disclosable claims:
  <https://datatracker.ietf.org/doc/html/draft-ietf-oauth-sd-jwt-vc-16>

Midnight therefore does not need to choose between all-public and all-private
claim bodies. A credential family may choose the representation that matches its
privacy and verifier-usability goals.

## Representation Taxonomy

A credential family `MUST` classify each credential field into one of these
representation categories.

| Category | Credential body representation | Presentation behavior | Typical use |
| --- | --- | --- | --- |
| `public` | direct typed value | always visible when the credential body or mirrored public disclosure is shared | low-sensitivity metadata, type codes, issuer jurisdiction, coarse assurance level |
| `selectivelyDisclosed` | direct typed value | disclosed only through a family-defined `reveal*` flag and equality check | simple prototypes where privacy is accepted but verifier code should remain small |
| `committedPrivate` | commitment digest | disclosed with value plus opening when requested | stable identifiers, birth dates, private account or eligibility fields |
| `predicateOnly` | commitment digest | used as a private witness for a predicate without revealing the value | age thresholds, minimum tier, eligibility thresholds |

A field `MUST NOT` be labeled private if its raw value is present as a direct
claim in the signed credential body. Direct claim values are public to any party
that receives or stores the credential body.

## Normative Family Rules

A credential family implementation:

- `MUST` define a fixed Compact claim struct; dynamic claim maps are not
  canonical inputs
- `MUST` document the representation category for each field
- `MUST` compute `claimRoot` with a family-scoped domain tag
- `MUST` domain-separate public/direct payload roots from private commitment
  roots when a family mixes both representations
- `MUST` verify any mirrored public claims in a presentation against the signed
  credential claims before accepting the presentation
- `MUST` verify every disclosed private value against the credential commitment
  before using that value
- `MUST` keep predicate-only witnesses tied to the credential commitment even
  when the raw value is not disclosed
- `SHOULD` keep stable identifiers, personal dates, government identifiers,
  credential IDs, and status handles out of always-public claims unless the use
  case explicitly accepts correlation

## Compact Shape

The preferred mixed representation is explicit at the type level:

```compact
export struct ExamplePublicClaims {
  credentialTypeCode: Uint<16>,
  issuerJurisdictionCode: Bytes<2>,
  assuranceLevel: Uint<8>,
}

export struct ExamplePrivateClaimCommitments {
  subjectIdCommitment: Bytes<32>,
  birthDateCommitment: Bytes<32>,
}

export struct ExampleCredentialClaims {
  publicClaims: ExamplePublicClaims,
  privateClaims: ExamplePrivateClaimCommitments,
}
```

The root should keep the two surfaces separate:

```compact
export pure circuit exampleClaimRoot(
  claims: ExampleCredentialClaims
): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([
    pad(32, "midnight:vc:example:v1"),
    persistentHash<ExamplePublicClaims>(claims.publicClaims),
    persistentHash<ExamplePrivateClaimCommitments>(claims.privateClaims)
  ]);
}
```

A presentation may mirror public claims so adapters and verifiers can surface
those values without guessing which fields are public:

```compact
export struct ExampleDisclosures {
  publicClaims: ExamplePublicClaims,
  revealBirthDate: Boolean,
  birthDateDays: Uint<32>,
  birthDateOpening: Bytes<32>,
}
```

The family verifier must then assert:

- `presentation.disclosed.publicClaims == credential.claims.publicClaims`
- disclosed private values open to the corresponding commitment
- predicate witnesses open to the corresponding commitment and satisfy the
  requested predicate

## Adapter Mapping

JSON, OpenID, JWT VC, and SD-JWT VC adapters are informative adapters around the
Compact canonical model.

Adapter guidance:

- map `public` fields to normal JSON credential claims or cleartext SD-JWT
  claims
- map `selectivelyDisclosed` fields to direct Compact disclosures, or to
  SD-JWT disclosures when exporting to SD-JWT
- map `committedPrivate` fields to Midnight commitment fields and, where an
  SD-JWT export is required, to selectively disclosable claims or private
  disclosure bundles
- map `predicateOnly` fields to Midnight predicate witnesses; do not invent an
  exported cleartext field unless the family has explicitly changed its
  representation category
- keep schema, credential type, status-mode metadata, and verification profile
  metadata non-selective unless a concrete interoperability profile says
  otherwise

## Current Repository Evidence

The repository now carries all three major patterns:

- direct/public-only laboratory:
  [`../../prototypes/credential-families/dummy-claims`](../../prototypes/credential-families/dummy-claims)
- direct academic prototype:
  [`../../prototypes/credential-families/university-diploma`](../../prototypes/credential-families/university-diploma)
- committed/private birth source credential:
  [`../../prototypes/credential-families/birth`](../../prototypes/credential-families/birth)
- mixed public-plus-private laboratory:
  [`../../prototypes/credential-families/mixed-claims`](../../prototypes/credential-families/mixed-claims)

The generic VC envelope already supports all of these because `claims` is the
family-defined `TClaims` type. The representation choice belongs to the family
schema, not to the generic envelope.
