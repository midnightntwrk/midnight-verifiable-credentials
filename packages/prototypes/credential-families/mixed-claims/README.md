# @midnight-ntwrk/midnight-did-credentials-mixed-claims

> Maturity: `lab`
> Package class: `dist`

Status:

- compileable mixed claim-representation laboratory
- explicit-holder credential family built on `ExplicitHolderBinding` and
  `NoStatusBinding`

Purpose:

- demonstrate that Midnight credentials can carry explicit/public claims and
  committed/private claims in the same signed credential body
- give credential-family authors a small reference for SD-JWT-style mixed
  cleartext plus selectively-disclosable/private semantics using the generic
  public-claim plus claim-commitment VC envelope
- keep privacy tradeoffs visible in source and docs instead of implying that all
  claim fields are commitments

Scope:

- explicit-holder `VC<MixedClaimsPublicClaims, MixedClaimsClaimCommitments, ExplicitHolderBinding, NoStatusBinding>`
- public/direct claim group for low-sensitivity metadata
- private claim-commitment group for identity, date, and tier values
- presentation request gates for explicit disclosure and a minimum-tier
  predicate
- no status/revocation semantics
- no hidden-holder extension

Claim representation:

| Field | Category | Notes |
| --- | --- | --- |
| `claims.credentialTypeCode` | `public` | clear direct claim, suitable for schema/profile routing |
| `claims.issuerJurisdictionCode` | `public` | clear direct claim, encoded as bounded bytes |
| `claims.assuranceLevel` | `public` | clear direct claim for non-correlating coarse assurance signaling; zero is treated as unset and rejected |
| `claimCommitments.subjectIdCommitment` | `committedPrivate` | opened only when `requireSubjectIdDisclosure` is true |
| `claimCommitments.birthDateCommitment` | `committedPrivate` | opened only when `requireBirthDateDisclosure` is true |
| `claimCommitments.accountTierCommitment` | `predicateOnly` | used for the minimum-tier predicate without requiring raw cleartext in the credential |

Root model:

- `mixedClaimsPublicClaimsRoot(...)` hashes the public claim group
- `mixedClaimsClaimCommitmentsRoot(...)` hashes the commitment group
- `mixedClaimsClaimRoot(...)` domain-separates the mixed family root with
  `midnight:vc:mixed-claims:v1`

Presentation model:

- presentations mirror `publicClaims` and the verifier checks that mirror
  against the signed credential `claims`
- subject id and birth date disclosures carry the value plus opening
- account tier carries a witness plus opening when the verifier enforces a
  minimum tier; the raw tier is not part of `MixedClaimsDisclosures`
- private values are not accepted until the circuit recomputes the commitment
  and matches the signed credential `claimCommitments`
- this prototype verifier receives the credential body so it can compare public
  mirrors and private commitments directly; production verifier protocols that
  should not receive the credential body can compare against
  `credentialClaimRoot` plus family-specific inclusion/opening proofs instead
- `mixedClaimsPresentationRequestBodyRoot(...)` is exposed for downstream
  adapters that want to bind the verifier request into transcripts or external
  protocol messages

Related docs:

- claim representation spec:
  [`../../../../docs/spec/claim-representation.md`](../../../../docs/spec/claim-representation.md)
- core spec:
  [`../../../../docs/spec/midnight-credentials.md`](../../../../docs/spec/midnight-credentials.md)
- conformance:
  [`../../../../docs/spec/conformance.md`](../../../../docs/spec/conformance.md)
- scaffold guidance:
  [`../../../../docs/templates/family-scaffold-template.md`](../../../../docs/templates/family-scaffold-template.md)

Build and test:

- `npm run compact -w ./packages/prototypes/credential-families/mixed-claims`
- `npm run build -w ./packages/prototypes/credential-families/mixed-claims`
- `npm run lint -w ./packages/prototypes/credential-families/mixed-claims`
- `npm run typecheck -w ./packages/prototypes/credential-families/mixed-claims`
- `npm run test:ci -w ./packages/prototypes/credential-families/mixed-claims`
- root light lanes: `./run.sh build --light` and `./run.sh test --light`
