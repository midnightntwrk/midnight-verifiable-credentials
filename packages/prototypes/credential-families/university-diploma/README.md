# @midnight-ntwrk/midnight-did-credentials-university-diploma

> Maturity: `reference`
> Package class: `dist`

Status:

- compileable university diploma credential-family package
- explicit-holder academic credential prototype with selective disclosure

Purpose:

- model a non-revocable university diploma with the simplest holder binding
- support issuer-to-student issuance, employer verification, and student-discount verification
- keep the claim surface small, explicit, and aligned with current Compact limits

Scope:

- explicit-holder `VC<UniversityDiplomaClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>`
- non-revocable diploma credential
- direct typed `selectivelyDisclosed` claims only; no hidden-holder or
  status-aware extensions
- selective disclosure over the academic fields most relevant to job applications
- verifier-side minimum-grade predicate for discount verification

Claim model:

- `diplomaId: Bytes<32>`
- `studentId: Bytes<16>`
- `graduateName: Bytes<32>`
- `universityName: Bytes<32>`
- `facultyName: Bytes<32>`
- `awardName: Bytes<32>`
- `honorsCode: Bytes<16>`
- `graduationYear: Uint<16>`
- `graduationMonth: Uint<8>`
- `finalGrade: Uint<8>`
- `creditsEarned: Uint<16>`

Design notes:

- human-readable text is encoded as fixed-width `Bytes<N>` because Compact still does not support `String`
- issuer identity comes from the credential envelope proof and issuer verification method reference, not from an in-claim DID string
- the family keeps the holder binding explicit and non-private on purpose because this slice is about large-scale issuance and verification flow clarity, not hidden-holder privacy
- the family chooses direct claims for BDD readability and prototype simplicity;
  fields such as `studentId` and `diplomaId` should move to commitments before
  a privacy-preserving production profile claims minimization
- because this family uses `NoClaimCommitments`, raw academic facts are visible
  to any party that receives the credential body; `reveal*` flags only control
  which mirrored fields a presentation authorizes for a verifier
- the testing surface exports `UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY` for the
  current v1 direct-claim boundary and `UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE`
  for the additive v2 target split
- the Compact source also exports additive production-profile building blocks:
  `UniversityDiplomaProductionPublicClaims`,
  `UniversityDiplomaClaimCommitments`, per-field commitment helpers,
  `universityDiplomaProductionClaimRoot`, and the additive
  `UniversityDiplomaProductionCredential` v2 alias
- the prototype assumes credit-bearing degree awards only; honorary or zero-credit diploma variants are intentionally out of scope for this first family cut

Current and production-profile field categories:

| Field | Current v1 representation | Production-profile building block |
| --- | --- | --- |
| `diplomaId` | direct claim | `diplomaIdCommitment` |
| `studentId` | direct claim | `studentIdCommitment` |
| `graduateName` | direct claim | `graduateNameCommitment` |
| `universityName` | direct claim | public/direct |
| `facultyName` | direct claim | `facultyNameCommitment` |
| `awardName` | direct claim | public/direct in the first production profile; committed private by policy-specific profiles |
| `honorsCode` | direct claim | `honorsCodeCommitment` |
| `graduationYear` | direct claim | public/direct |
| `graduationMonth` | direct claim | `graduationMonthCommitment` |
| `finalGrade` | direct claim | `finalGradeCommitment` first; predicate witness later |
| `creditsEarned` | direct claim | `creditsEarnedCommitment` first; predicate witness later |

Production-profile helpers are intentionally additive. They make the field split
and commitment root executable without silently changing the existing v1
credential alias used by BDD, protocol transcripts, and reports.

Migration plan:

- [`../../../../docs/plans/university-commitment-backed-privacy.md`](../../../../docs/plans/university-commitment-backed-privacy.md)

Selective disclosure model:

- companies can ask for graduate identity, award, year, and final grade
- the mall flow can ask for final grade and enforce a minimum grade threshold
- fields like faculty, honors, credits, diploma id, and student id can be absent
  from a presentation unless the verifier asks for them; they are not hidden
  from a party that already has the credential body
- when a field is not revealed, the verifier must treat the matching `reveal*`
  flag as authoritative and ignore the corresponding value slot; well-behaved
  holders should still zero or clear unrevealed slots

Build and test:

- `npm run build -w ./packages/prototypes/credential-families/university-diploma`
- `npm run lint -w ./packages/prototypes/credential-families/university-diploma`
- `npm run typecheck -w ./packages/prototypes/credential-families/university-diploma`
- `npm run test:ci -w ./packages/prototypes/credential-families/university-diploma`
