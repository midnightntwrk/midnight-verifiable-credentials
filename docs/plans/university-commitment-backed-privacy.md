# University Commitment-Backed Privacy Plan

Status: active migration plan for `university-commitment-backed-privacy`.

The current `university-diploma` family is a direct-claim prototype. It is
valuable because the BDD reports, protocol transcripts, and verifier policies
are easy for humans to read. It is not a production privacy profile.

## Current Boundary

Current credential shape:

```text
VC<UniversityDiplomaClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>
```

Consequences:

- every academic field lives in `credential.claims`
- `claimCommitments` is empty
- `reveal*` booleans authorize what the presentation says the verifier may use
- `reveal*` booleans do not hide raw values from a party that receives the
  credential body

The package pins this boundary through
`UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY` and fixture tests in
`packages/prototypes/credential-families/university-diploma/src/test/privacy-boundary.test.ts`.

## Field Migration Target

| Field | Current representation | Production target | Reason |
| --- | --- | --- | --- |
| `diplomaId` | direct claim | committed private | stable credential identifier and correlation handle |
| `studentId` | direct claim | committed private | stable student identifier |
| `graduateName` | direct claim | committed private or disclosed public value | personal data |
| `universityName` | direct claim | public/direct | usually low sensitivity and useful for routing |
| `facultyName` | direct claim | committed private or direct by policy | can leak academic profile |
| `awardName` | direct claim | public/direct or committed private by policy | often needed by employers |
| `honorsCode` | direct claim | committed private | sensitive performance signal |
| `graduationYear` | direct claim | public/direct or committed private by policy | coarse timeline signal |
| `graduationMonth` | direct claim | committed private by default | finer timeline signal |
| `finalGrade` | direct claim | predicate-only or committed private | sensitive performance signal |
| `creditsEarned` | direct claim | predicate-only or committed private | sensitive academic detail |

## Migration Shape

The production-shaped family should keep public routing facts separate from
private commitments:

```compact
export struct UniversityDiplomaPublicClaims {
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
  finalGradeCommitment: Bytes<32>,
  creditsEarnedCommitment: Bytes<32>,
}
```

The claim root should domain-separate the public and commitment payloads:

```compact
persistentHash<Vector<3, Bytes<32>>>([
  pad(32, "midnight:vc:uni-diploma:v2"),
  persistentHash<UniversityDiplomaPublicClaims>(claims),
  persistentHash<UniversityDiplomaClaimCommitments>(claimCommitments)
])
```

## Execution Slices

1. Keep the current direct-claim prototype readable and explicitly labeled.
2. Add a separate commitment-backed diploma family or v2 surface instead of
   silently changing the v1 claim root.
3. Move stable identifiers and sensitive academic facts into
   `claimCommitments`.
4. Add opening witnesses for disclosed private fields.
5. Add predicate witnesses for final-grade and credit-threshold policies.
6. Update university protocol DTOs and BDD notes so reports show opened values
   only when the verifier policy requires them.
7. Keep compatibility fixtures for the readable v1 prototype until downstream
   examples no longer depend on it.

## Acceptance

- no docs or reports describe direct `credential.claims` values as private
- tests prove the v1 `reveal*` flags are policy gates, not secrecy controls
- v2 or the new production family uses `claimCommitments` for stable and
  sensitive fields
- verifier contracts validate openings or predicates before using committed
  values
- university BDD reports distinguish credential-body visibility from
  presentation authorization

## Validation

```bash
npm run test:ci -w ./packages/prototypes/credential-families/university-diploma
./run.sh university-protocol --light
./run.sh university-bdd
npm run docs:links
```
