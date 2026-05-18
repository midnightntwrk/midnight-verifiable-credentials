# @midnight-ntwrk/midnight-did-credentials-university-diploma

Status:

- compileable university diploma credential-family package
- explicit-holder academic credential prototype with selective disclosure

Purpose:

- model a non-revocable university diploma with the simplest holder binding
- support issuer-to-student issuance, employer verification, and student-discount verification
- keep the claim surface small, explicit, and aligned with current Compact limits

Scope:

- explicit-holder `VC<UniversityDiplomaClaims, ExplicitHolderBinding, NoStatusBinding>`
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
- the prototype assumes credit-bearing degree awards only; honorary or zero-credit diploma variants are intentionally out of scope for this first family cut

Selective disclosure model:

- companies can ask for graduate identity, award, year, and final grade
- the mall flow can ask for final grade and enforce a minimum grade threshold
- fields like faculty, honors, credits, diploma id, and student id can stay hidden unless the verifier asks for them
- when a field is not revealed, the verifier must treat the matching `reveal*`
  flag as authoritative and ignore the corresponding value slot; well-behaved
  holders should still zero or clear unrevealed slots

Build and test:

- `npm run build -w ./prototypes/credential-families/university-diploma`
- `npm run lint -w ./prototypes/credential-families/university-diploma`
- `npm run typecheck -w ./prototypes/credential-families/university-diploma`
- `npm run test:ci -w ./prototypes/credential-families/university-diploma`
