# @midnight-ntwrk/midnight-did-credentials-mixed-claims

Status:

- compileable mixed claim-representation laboratory
- explicit-holder credential family built on `ExplicitHolderBinding` and
  `NoStatusBinding`

Purpose:

- demonstrate that Midnight credentials can carry explicit/public claims and
  committed/private claims in the same signed credential body
- give credential-family authors a small reference for SD-JWT-style mixed
  cleartext plus selectively-disclosable/private semantics without changing the
  generic VC envelope
- keep privacy tradeoffs visible in source and docs instead of implying that all
  claim fields are commitments

Scope:

- explicit-holder `VC<MixedClaimsCredentialClaims, ExplicitHolderBinding, NoStatusBinding>`
- public/direct claim group for low-sensitivity metadata
- private claim-commitment group for identity, date, and tier values
- presentation request gates for explicit disclosure and a minimum-tier
  predicate
- no status/revocation semantics
- no hidden-holder extension

Claim representation:

| Field | Category | Notes |
| --- | --- | --- |
| `publicClaims.credentialTypeCode` | `public` | clear direct claim, suitable for schema/profile routing |
| `publicClaims.issuerJurisdictionCode` | `public` | clear direct claim, encoded as bounded bytes |
| `publicClaims.assuranceLevel` | `public` | clear direct claim for coarse assurance signaling |
| `privateClaims.subjectIdCommitment` | `committedPrivate` | opened only when `requireSubjectIdDisclosure` is true |
| `privateClaims.birthDateCommitment` | `committedPrivate` | opened only when `requireBirthDateDisclosure` is true |
| `privateClaims.accountTierCommitment` | `predicateOnly` | used for the minimum-tier predicate without requiring raw cleartext in the credential |

Root model:

- `mixedClaimsPublicClaimsRoot(...)` hashes the public claim group
- `mixedClaimsPrivateClaimCommitmentsRoot(...)` hashes the commitment group
- `mixedClaimsClaimRoot(...)` domain-separates the mixed family root with
  `midnight:vc:mixed-claims:v1`

Presentation model:

- presentations mirror `publicClaims` and the verifier checks that mirror
  against the signed credential claims
- subject id and birth date disclosures carry the value plus opening
- account tier carries a witness plus opening when the verifier enforces a
  minimum tier; the raw tier is not part of `MixedClaimsDisclosures`
- private values are not accepted until the circuit recomputes the commitment
  and matches the signed credential body

Related docs:

- claim representation spec:
  [`../../../docs/spec/claim-representation.md`](../../../docs/spec/claim-representation.md)
- core spec:
  [`../../../docs/spec/midnight-credentials.md`](../../../docs/spec/midnight-credentials.md)
- conformance:
  [`../../../docs/spec/conformance.md`](../../../docs/spec/conformance.md)
- scaffold guidance:
  [`../../../docs/templates/family-scaffold-template.md`](../../../docs/templates/family-scaffold-template.md)

Build and test:

- `npm run compact -w ./prototypes/credential-families/mixed-claims`
- `npm run build -w ./prototypes/credential-families/mixed-claims`
- `npm run lint -w ./prototypes/credential-families/mixed-claims`
- `npm run typecheck -w ./prototypes/credential-families/mixed-claims`
- `npm run test:ci -w ./prototypes/credential-families/mixed-claims`
- root light lanes: `./run.sh build --light` and `./run.sh test --light`
