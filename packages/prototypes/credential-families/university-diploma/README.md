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
- the additive production presentation surface validates disclosed private
  values by recomputing their per-field commitments from the supplied raw value
  plus opening; public routing fields are checked directly against
  `credential.claims`
- the additive production predicate helpers validate final-grade and
  credits-earned thresholds against private witness values plus openings, so a
  verifier can check threshold policy without requiring those raw values in
  `UniversityDiplomaProductionDisclosures`
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
| `finalGrade` | direct claim | `finalGradeCommitment` plus `UniversityDiplomaProductionFinalGradePredicateWitness` |
| `creditsEarned` | direct claim | `creditsEarnedCommitment` plus `UniversityDiplomaProductionCreditsEarnedPredicateWitness` |

Production-profile helpers are intentionally additive. They make the field split
and commitment root executable without silently changing the existing v1
credential alias used by BDD, protocol transcripts, and reports.

Production-profile presentation helpers:

- `UniversityDiplomaProductionDisclosures` carries `reveal*` flags, raw values,
  and openings only for committed/private fields
- `UniversityDiplomaProductionPresentation` is an additive VP alias for the v2
  credential profile
- `assertValidUniversityDiplomaProductionPresentation(...)` verifies the v2
  credential proof, holder-bound presentation proof, VC/VP linkage, and every
  disclosed opening
- `assertUniversityDiplomaProductionPresentationSatisfiesRequest(...)` adds the
  verifier request policy checks, including required disclosures and the current
  minimum-grade policy over an opened `finalGrade`

Production-profile predicate helpers:

- `assertUniversityDiplomaProductionFinalGradeAtLeast(...)` checks that a
  private final-grade witness opens to the signed `finalGradeCommitment`, stays
  inside the 0-100 grade scale, and meets a verifier threshold
- `assertUniversityDiplomaProductionCreditsEarnedAtLeast(...)` checks that a
  private credits-earned witness opens to the signed `creditsEarnedCommitment`,
  stays positive, and meets a verifier threshold
- these helpers are separate from the current presentation request shape so the
  v2 production profile can support predicate-only policies without making the
  raw value appear in `UniversityDiplomaProductionDisclosures`

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
