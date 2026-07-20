# University Commitment-Backed Privacy Plan

Status: executed (#267). The university use case now presents the
commitment-backed production profile (`UniversityDiplomaProductionCredential`,
verifier schemaRef `uni-diploma:v2`): submissions ship salted per-field
commitments instead of hidden claim plaintext, the transport `studentId` field
became `applicantRef` (the salted studentId-commitment hex), and the
mall-discount verifier proves the grade threshold via a predicate witness
without any disclosure. Remaining follow-up: `applicantRef` is a stable
pseudonym reused across verifiers; a per-presentation blinded reference is the
production answer. The sections below are kept as the migration's design
record.

The pre-migration `university-diploma` family was a direct-claim prototype. It
was valuable because the BDD reports, protocol transcripts, and verifier
policies were easy for humans to read. It was not a production privacy profile.

## Pre-Migration Boundary

Pre-migration credential shape:

```text
VC<UniversityDiplomaClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>
```

Consequences of that shape:

- every academic field lived in `credential.claims`
- `claimCommitments` was empty
- `reveal*` booleans authorized what the presentation said the verifier may use
- `reveal*` booleans did not hide raw values from a party that received the
  credential body

The package now pins the post-migration boundary
(`production-commitment-v2`, `salted-per-field-persistent-commit`) through
`UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY`, its `productionTarget` metadata, and
fixture tests in
`packages/prototypes/credential-families/university-diploma/src/test/privacy-boundary.test.ts`.

The package also exposes additive production-profile building blocks in
`university-diploma-credential/claims.compact` and an additive
`UniversityDiplomaProductionCredential` v2 alias. These do not change the
current v1 credential alias; they give the next profile a typechecked
public/commitment partition, a domain-separated
`universityDiplomaProductionClaimRoot`, and a credential envelope that stores
sensitive academic facts in `claimCommitments`.

The additive v2 surface now also includes
`UniversityDiplomaProductionDisclosures`,
`UniversityDiplomaProductionPresentation`, and production presentation/request
validators. These validators recompute each disclosed committed/private field
from the raw value plus opening and compare it with the signed
`claimCommitments` entry before request policy checks use the value.

The additive v2 surface also includes production predicate witnesses for
minimum final-grade and credits-earned policies. Those witnesses keep the raw
academic value and opening outside `UniversityDiplomaProductionDisclosures`
while still proving that the value opens to the signed commitment and satisfies
the verifier threshold.

The production-profile field metadata is published through the
`@midnight-ntwrk/midnight-did-credentials-university-diploma/privacy-profile`
package surface. Protocol and reporting packages should consume that public
surface when describing public, committed-private, and predicate-only fields
instead of importing fixture-only testing helpers.

## Field Migration Target

| Field | v1 prototype representation | Production target | Reason |
| --- | --- | --- | --- |
| `diplomaId` | direct claim | committed private | stable credential identifier and correlation handle |
| `studentId` | direct claim | committed private | stable student identifier |
| `graduateName` | direct claim | committed private or disclosed public value | personal data |
| `universityName` | direct claim | public/direct | usually low sensitivity and useful for routing |
| `facultyName` | direct claim | committed private or direct by policy | can leak academic profile |
| `awardName` | direct claim | public/direct in the first production profile; committed private by policy-specific profiles | often needed by employers |
| `honorsCode` | direct claim | committed private | sensitive performance signal |
| `graduationYear` | direct claim | public/direct or committed private by policy | coarse timeline signal |
| `graduationMonth` | direct claim | committed private by default | finer timeline signal |
| `finalGrade` | direct claim | predicate-only or committed private | sensitive performance signal |
| `creditsEarned` | direct claim | predicate-only or committed private | sensitive academic detail |

## Migration Shape

The production-shaped family keeps public routing facts separate from private
commitments:

```compact
export struct UniversityDiplomaProductionPublicClaims {
  universityName: Bytes<32>,
  awardName: Bytes<32>,
  graduationYear: Uint<16>,
}

export struct UniversityDiplomaClaimCommitments {
  diplomaIdCommitment: Bytes<32>,
  studentIdCommitment: Bytes<32>,
  graduateNameCommitment: Bytes<32>,
  facultyNameCommitment: Bytes<32>,
  honorsCodeCommitment: Bytes<32>,
  graduationMonthCommitment: Bytes<32>,
  finalGradeCommitment: Bytes<32>,
  creditsEarnedCommitment: Bytes<32>,
}
```

The claim root should domain-separate the public and commitment payloads:

```compact
export pure circuit universityDiplomaProductionClaimRoot(
  publicClaims: UniversityDiplomaProductionPublicClaims,
  claimCommitments: UniversityDiplomaClaimCommitments
): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([
    pad(32, "midnight:vc:uni-diploma:v2"),
    universityDiplomaProductionPublicClaimsRoot(publicClaims),
    universityDiplomaClaimCommitmentsRoot(claimCommitments)
  ]);
}
```

Per-field commitment helpers currently rely on the caller supplying
field-specific openings. Production issuance must generate high-entropy
openings and domain-separate them by field; fixture helpers deliberately derive
deterministic, field-named openings only for repeatable tests.
This is especially important for low-entropy values such as `graduationMonth`,
`finalGrade`, and `creditsEarned`, where commitment privacy relies entirely on
opening secrecy until predicate witnesses replace raw-value openings.

## Execution Slices

1. Keep the v1 direct-claim prototype readable and explicitly labeled. Done;
   it remains a fixture/comparison alias.
2. Add a separate commitment-backed diploma family or v2 surface instead of
   silently changing the v1 claim root. Done: the additive Compact/fixture
   building blocks cover the field split, v2 claim-root shape, and
   `UniversityDiplomaProductionCredential` alias.
3. Move stable identifiers and sensitive academic facts into `claimCommitments`
   in the actual v2 credential alias. Done via #267: the verifier contract and
   university protocol present the v2 credential, with in-circuit openings and
   the mall-discount predicate path.
4. Add opening witnesses for disclosed private fields. Done: covered by the v2
   production presentation surface and fixture tests.
5. Add predicate witnesses for final-grade and credit-threshold policies. Done:
   covered by the v2 production predicate helper circuits, fixture tests, and
   the reveal-nothing predicate satisfies-request circuit.
6. Update university protocol DTOs and BDD notes so reports show opened values
   only when the verifier policy requires them. Done via #267: submissions
   carry `applicantRef` plus commitments, and issuance exports show
   `finalGradeCommitmentHex`.
7. Keep compatibility fixtures for the readable v1 prototype until downstream
   examples no longer depend on it. Ongoing.

## Acceptance

- no docs or reports describe direct `credential.claims` values as private
- tests prove the v1 `reveal*` flags are policy gates, not secrecy controls
- v2 or the new production family uses `claimCommitments` for stable and
  sensitive fields
- tests prove the production-profile claim root changes when committed private
  values change, even when public routing claims stay the same
- verifier contracts validate openings or predicates before using committed
  values; the additive v2 presentation helper validates openings for raw
  private disclosures, and the additive predicate helpers validate grade and
  credits thresholds without requiring raw-value disclosures
- university BDD reports distinguish credential-body visibility from
  presentation authorization

## Validation

```bash
pnpm --dir ./packages/prototypes/credential-families/university-diploma run test:ci
./run.sh university-protocol --light
./run.sh university-bdd
pnpm run docs:links
```
