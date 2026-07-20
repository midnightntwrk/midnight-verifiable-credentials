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

- presented production profile (#267): explicit-holder
  `VC<UniversityDiplomaProductionPublicClaims, UniversityDiplomaClaimCommitments, ExplicitHolderBinding, NoStatusBinding>`
  (`UniversityDiplomaProductionCredential`, schemaRef `uni-diploma:v2`)
- readable v1 prototype alias retained for fixtures and comparison:
  explicit-holder
  `VC<UniversityDiplomaClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>`
- non-revocable diploma credential; no hidden-holder or status-aware extensions
- commitment-backed selective disclosure over the academic fields most relevant
  to job applications
- verifier-side minimum-grade predicate for discount verification, proven
  against the salted `finalGradeCommitment`

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
- the presented production profile moves stable identifiers and sensitive
  academic facts (`diplomaId`, `studentId`, `graduateName`, `facultyName`,
  `honorsCode`, `graduationMonth`, `finalGrade`, `creditsEarned`) into salted
  per-field `claimCommitments`; hidden fields cross the wire only as
  commitments (#267)
- the v1 prototype alias uses `NoClaimCommitments`: raw academic facts are
  visible to any party that receives that credential body, and its `reveal*`
  flags only control which mirrored fields a presentation authorizes — it
  remains a fixture/comparison surface, not the presented profile
- the testing surface exports `UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY`
  (now describing the production-commitment-v2 boundary) and
  `UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE` for compatibility with existing
  fixture consumers; new protocol/reporting code should import the same
  metadata from the public `./privacy-profile` package surface instead of
  importing fixture helpers
- the Compact source exports the production-profile building blocks:
  `UniversityDiplomaProductionPublicClaims`,
  `UniversityDiplomaClaimCommitments`, per-field commitment helpers,
  `universityDiplomaProductionClaimRoot`, and the
  `UniversityDiplomaProductionCredential` v2 alias
- the production presentation surface validates disclosed private values by
  recomputing their per-field commitments from the supplied raw value plus
  opening; public routing fields are checked directly against
  `credential.claims`
- the production predicate helpers validate final-grade and credits-earned
  thresholds against private witness values plus openings, so a verifier can
  check threshold policy without requiring those raw values in
  `UniversityDiplomaProductionDisclosures`
- the prototype assumes credit-bearing degree awards only; honorary or zero-credit diploma variants are intentionally out of scope for this first family cut

v1-prototype and production-profile field categories:

| Field | v1 prototype representation | Production-profile representation |
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

The v1 alias is unchanged by the production helpers; since #267 the BDD,
protocol-transcript, and reporting lanes present the production
commitment-backed profile.

Production-profile presentation helpers:

- `UniversityDiplomaProductionDisclosures` carries `reveal*` flags, raw values,
  and openings only for committed/private fields
- `UniversityDiplomaProductionPresentation` is an additive VP alias for the v2
  credential profile
- `assertValidUniversityDiplomaProductionPresentation(...)` verifies the v2
  credential proof, holder-bound presentation proof, VC/VP linkage, and every
  disclosed opening
- `assertUniversityDiplomaProductionPresentationSatisfiesRequest(...)` adds the
  verifier request policy checks, including required disclosures and the
  disclosure-based minimum-grade policy over an opened `finalGrade`
- `assertUniversityDiplomaProductionPresentationSatisfiesRequestWithFinalGradePredicate(...)`
  satisfies a reveal-nothing minimum-grade request instead: the request must
  not demand final-grade disclosure
  (`assertValidUniversityDiplomaProductionPredicatePresentationRequest`), and
  the threshold is proven against the salted `finalGradeCommitment` via a
  holder-supplied predicate witness

Production-profile predicate helpers:

- `assertUniversityDiplomaProductionFinalGradeAtLeast(...)` checks that a
  private final-grade witness opens to the signed `finalGradeCommitment`, stays
  inside the 0-100 grade scale, and meets a verifier threshold
- `assertUniversityDiplomaProductionCreditsEarnedAtLeast(...)` checks that a
  private credits-earned witness opens to the signed `creditsEarnedCommitment`,
  stays positive, and meets a verifier threshold
- predicate witnesses keep the raw value and opening out of
  `UniversityDiplomaProductionDisclosures`; the mall-discount verifier uses the
  final-grade predicate path through the reveal-nothing satisfies-request
  circuit above

Migration plan:

- [`../../../../docs/plans/university-commitment-backed-privacy.md`](../../../../docs/plans/university-commitment-backed-privacy.md)

Selective disclosure model (production profile):

- companies can ask for committed claims such as graduate identity and final
  grade; each required field is opened as a (value, opening) pair validated
  against its signed commitment, while `universityName`, `awardName`, and
  `graduationYear` are public routing claims
- the mall flow demands no disclosure at all: it enforces the minimum grade
  through the final-grade predicate witness against `finalGradeCommitment`
- fields the request does not require stay hidden — they exist in the presented
  credential only as salted commitments, and their disclosure slots are zeroed
- when a field is not revealed, the verifier must treat the matching `reveal*`
  flag as authoritative and ignore the corresponding value slot

Build and test:

- `pnpm --dir ./packages/prototypes/credential-families/university-diploma run build`
- `pnpm --dir ./packages/prototypes/credential-families/university-diploma run lint`
- `pnpm --dir ./packages/prototypes/credential-families/university-diploma run typecheck`
- `pnpm --dir ./packages/prototypes/credential-families/university-diploma run test:ci`
