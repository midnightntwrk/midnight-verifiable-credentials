# university use case

Status:

- research-only use-case definition / execution guide

Purpose:

- define a concrete university academic-credentials use case for the Midnight VC/VP stack
- narrow scope to diploma issuance, verification, revocation, correction, and reissue semantics
- translate the April 2026 Peru academic-credentials proposal into repo-native artifacts and execution slices

Research posture:

- `VCs now, proof-oriented VPs later`
- Midnight anchors issuer identity, signing authority, and status integrity
- the MVP holder experience is link-based and browser-first, not a mandatory student-controlled SSI wallet
- follow the repo-native Midnight proof stack; do not copy the source document's mixed P-256 plus `Ed25519Signature2020` examples literally

Out of scope:

- browser wallet UX and secure-link delivery mechanics
- HSM procurement and operator workflows
- government trust-registry implementation details
- billing, subscriptions, and university onboarding software
- transcript/course-history expansion beyond the first diploma credential family

## Why this use case belongs in this repo

This repo already has:

- generic VC/VP primitives in [`../../core/primitives/credentials`](../../core/primitives/credentials)
- status-aware verification building blocks in [`../../registry/status-registry`](../../registry/status-registry)
- explicit-holder and hidden-holder family patterns in:
  - [`../../prototypes/credential-families/birth`](../../prototypes/credential-families/birth)
  - [`../../prototypes/credential-families/birth-secret`](../../prototypes/credential-families/birth-secret)
- concrete verifier/business examples in [`../age-gate/contract`](../age-gate/contract)

A university diploma is the next credible vertical because it requires all of the following in one slice:

- issuer DID trust
- historical signing-key validity
- typed diploma claims
- deterministic verification outputs
- hard revocation handling
- softer corrected or superseded replacement semantics
- privacy by minimization rather than full-record disclosure

## Actors and trust boundaries

Primary actors:

- `University issuer`
  - owns the authoritative graduate registry
  - provisions a Midnight DID
  - signs diploma credentials
- `Registrar and approver roles`
  - initiate and approve issuance or reissue workflows
- `Graduate holder`
  - receives the credential through a secure claim path
  - may later export to a compatible wallet
- `Employer or institution verifier`
  - verifies diploma authenticity and current status
- `Government trust authority`
  - approves issuer legitimacy and may suspend or revoke issuer trust
- `Platform operator`
  - runs signing, status, delivery, and verification services without becoming the root of academic truth

Trust boundary assumptions for this repo slice:

- issuer DID resolution is an upstream trust input, not a use-case contract responsibility
- government issuer approval is an upstream trust input, not a credential-family responsibility
- the university remains authoritative for diploma facts and status transitions
- Midnight binds issuer identity and status integrity; it does not become the source of student PII

## Core source takeaway

The attached proposal is not asking for a student-held zero-knowledge wallet on day one.

It is asking for:

- a university-signed diploma VC
- deterministic verification against issuer trust and status
- minimal fact return to verifiers
- optional later export into richer wallet or VP ecosystems

So the correct repo mapping is:

- `VC first`
- `verification contract / API second`
- `holder-bound VP later, when student DID or wallet support is a real product requirement`

## Proposed artifact model

### VC artifacts

#### 1. UniversityDiplomaCredential

Primary artifact:

- `UniversityDiplomaCredential`
- recommended generic shape:
  - `VC<UniversityDiplomaCredentialClaims, THolderBinding, RegistryBoundStatusBinding>`

Recommended claim groups:

1. subject identity anchors
- graduate subject identifier commitment
- graduate legal-name commitment
- graduate document-type commitment
- graduate document-number commitment

2. diploma facts
- degree-title commitment
- program commitment
- faculty commitment
- award-date commitment
- graduation-status commitment
- optional honors commitment
- optional language / locale marker

3. evidence and operational linkage
- university registry-record identifier commitment
- issuance-batch identifier commitment
- optional template/version commitment

Design rule:

- commit everything by default
- disclose only what a verifier actually needs
- keep internal registry linkage committed even when it is never publicly disclosed

#### 2. UniversityCredentialStatusList

Status artifact for MVP:

- off-chain indexed status list
- periodic Midnight anchoring of the list integrity root or equivalent registry snapshot
- first-class reason separation between:
  - `revoked`
  - `corrected` or `superseded_reissued`

#### 3. University issuer trust record

Upstream trust artifact for the use case:

- issuer DID document
- government trust-registry entry
- signing-key lifecycle record

Design rule:

- keep this as trust-registry state for the MVP
- do not introduce a second university-trust VC unless the repo later decides to model that explicitly

#### 4. UniversityDiplomaReissueReference

Follow-on linkage artifact:

- reference from the new credential to the replaced credential id
- reason code such as `wallet_recovery`, `correction`, or `reissue`

### Verification artifacts

#### 1. MVP hosted verification artifact

The source proposal is browser-first and link-first.

So the MVP verifier path should support:

- credential file (VC JSON)
- QR-derived reference
- hosted verification link or reference

This is a verifier-facing artifact, not yet a strong holder-bound VP.

#### 2. Post-MVP presentation artifact

When student DID or wallet support becomes real, add:

- `UniversityDiplomaPresentation`
- recommended generic shape:
  - `VP<UniversityDiplomaDisclosures, THolderBinding>`

At that point the repo can support:

- verifier-request-driven disclosure requirements
- optional holder binding
- stronger presentation-time privacy controls

## Holder-binding strategy

The source document does not justify mandatory strong holder cryptography in the MVP.

So the recommended progression is:

1. MVP
- no mandatory student DID
- no mandatory holder proof
- diploma VC signed by the university
- verification is issuer- and status-centric

2. Follow-on
- explicit-holder presentation if wallet export becomes first-class
- hidden-holder or privacy-enhanced presentation only if there is a clear product requirement beyond minimal verifier responses

## Issuer onboarding and prerequisites

Before diploma issuance can exist, the university use case assumes:

- a university Midnight DID
- at least one active assertion/signing key
- a historical key-lifecycle record so verifiers can validate the key that signed a diploma at issuance time
- a government trust-registry entry marking the university as approved or accredited
- a status service capable of publishing revocation and supersession state

These are prerequisites for the use case, not features that the first verifier contract should try to own internally.

## Verification result model

Deterministic verifier outcomes should be explicit:

- `valid`
- `revoked`
- `corrected` or `superseded`
- `invalid_signature`
- `issuer_not_trusted`
- `not_found`

Repo mapping:

- `invalid_signature` is a VC/VP proof failure
- `revoked` is a hard status failure
- `issuer_not_trusted` is an upstream trust-registry failure
- `corrected` or `superseded` is a distinct replacement outcome, not forgery or tampering

## Issuance use case

Issuer-side sequence for the first university slice:

1. university DID and signing key are already active
2. registrar-approved diploma record is selected for issuance
3. the system builds `UniversityDiplomaCredentialClaims`
4. the system derives a status handle and `RegistryBoundStatusBinding`
5. the issuer signs the native status-aware VC body
6. the system records issuance metadata and status-list position off-chain
7. holder delivery happens outside this repo slice

Required issuance inputs:

- issuer verification method reference
- diploma facts
- registry-record id
- issuance batch id
- status registry id
- current registry snapshot inputs required by the chosen status flow

Required issuance outputs:

- `UniversityDiplomaCredential`
- issuer proof
- status-aware credential bundle
- holder-facing artifact for later verification or optional presentation

## Verification use cases

### 1. Public authenticity check

Input:

- credential file, hosted reference, or QR-derived reference

Verifier steps:

1. resolve issuer DID
2. resolve the issuer key valid at issuance time
3. check issuer trust status in the government registry
4. verify credential integrity and signature
5. resolve credential status
6. return deterministic validity result

Expected output:

- validity result only
- no unnecessary student data returned by the verifier API

### 2. Employer verification

MVP input:

- credential or hosted verification reference

Post-MVP input:

- presentation + typed `UniversityDiplomaPresentationRequest`

Typical facts an employer may need:

- graduate legal name
- degree title
- program
- award date
- graduation status

Typical data that should stay hidden unless explicitly required:

- document number
- internal registry references
- full operational issuance metadata
- recovery or reissue history

### 3. University or regulator audit check

Input:

- credential or presentation plus an internal verifier profile

Additional optional facts:

- registry-record id
- issuance batch id
- replacement linkage if corrected or reissued

## Revocation, correction, and reissue

The source proposal draws a crucial distinction.

### Hard revocation

Use when:

- the diploma credential must no longer verify as valid
- the academic or legal status of that digital credential is invalidated

Repo rule:

- revoked credentials are hard VC/VP invalidity
- verification must fail closed
- this matches the current stack direction already used for revoked hidden-holder credentials

### Corrected or superseded reissue

Use when:

- the diploma facts remain academically valid
- the old digital artifact was replaced because of correction, re-delivery, or wallet loss

Important distinction:

- this is not the same as academic invalidity
- the old artifact should not remain the canonical current copy
- verifiers should receive a deterministic replacement signal rather than a forged or tampered result

Recommended first repo treatment:

- implement `revoked` first as the cryptographic status outcome
- treat `corrected` or `superseded_reissued` as a follow-on verifier/status-service extension
- carry replacement linkage via `UniversityDiplomaReissueReference` or equivalent family-level reference

## Privacy and disclosure policy

Use-case rule:

- verification should confirm validity, not dump the entire diploma record by default

MVP privacy posture from the source:

- minimal fact return
- no full personal record exposure
- no on-chain personal data
- off-chain status with Midnight integrity anchoring

Post-MVP disclosure profiles:

1. `DisplayProfile`
- human-readable diploma view
- may reveal most diploma facts

2. `EmploymentProfile`
- reveals only what an employer needs to validate the degree claim

3. `MinimalValidityProfile`
- confirms issuer trust + signature validity + non-revocation
- reveals no internal registry metadata

## Operational controls

The source document is explicit that the use case is not only about cryptography.

Even though these concerns are out of scope for the first Compact slices, the README should preserve them as constraints:

- role-separated issuance approval
- strong operator identity and MFA
- tenant isolation per university
- append-only audit trails for issuance, correction, revocation, and reissue
- short-lived claim links with OTP or equivalent recovery checks
- the platform is a processor of issuance and status operations, not the long-term authority over diploma truth

## Mapping to current repo layers

Planned landing zones:

- credential family:
  - `prototypes/credential-families/university-diploma`
- optional hidden-holder extension later:
  - `prototypes/credential-families/university-diploma-secret`
- concrete verifier/business composition:
  - `use-cases/university/contract`
- living-doc scenarios:
  - `use-cases/university/scenarios`

Dependency direction should match existing repo practice:

- `use-cases/university` depends downward on reusable core, family, and status packages
- lower reusable packages must not depend upward on this use-case subtree

## Execution plan

### Slice 1: research and scope freeze

Deliverables:

- this README
- explicit `VCs now, VPs later` decision
- diploma VC artifact names
- deterministic verifier-result vocabulary
- revocation vs supersession split

### Slice 2: diploma VC family

Deliverables:

- `UniversityDiplomaCredentialClaims`
- `UniversityDiplomaCredential` family package
- fixture builders and package-surface tests
- native `RegistryBoundStatusBinding`

Acceptance:

- one university diploma VC can be issued locally with status binding

### Slice 3: verifier-side diploma check

Deliverables:

- `use-cases/university/contract`
- one verifier contract surface for:
  - issuer proof validation
  - issuer trust input checking
  - status-aware diploma validity decision

Acceptance:

- one business-facing verifier contract accepts valid diploma credentials and rejects revoked ones

### Slice 4: negative-path status coverage

Deliverables:

- revoked diploma rejection tests
- stale status-input rejection tests
- mismatch tests for issuer trust, key validity, or registry id where applicable

Acceptance:

- revoked diploma credentials fail as hard invalidity

### Slice 5: living documentation

Deliverables:

- `use-cases/university/scenarios`
- BDD scenarios for:
  - valid diploma verification
  - revoked diploma rejection
  - corrected or superseded replacement behavior once implemented

### Slice 6: corrected or superseded reissue semantics

Deliverables:

- replacement reference model
- verifier outcome for superseded credentials
- clear split between academic invalidity and digital-copy replacement

Acceptance:

- old replaced credential does not remain the canonical valid artifact
- verifier result explains replacement rather than treating it as forgery

### Slice 7: VP follow-on

Only start after the VC-first diploma flow is stable.

Deliverables:

- `UniversityDiplomaPresentation`
- `UniversityDiplomaDisclosures`
- `UniversityDiplomaPresentationRequest`
- holder-binding decision based on actual wallet or DID product needs

Acceptance:

- the repo can support a real holder-presented diploma flow without rewriting the underlying VC family

## Recommended first implementation cut

Build this first:

- `UniversityDiplomaCredential`
- native status binding
- verifier-side diploma validity check
- revoked diploma hard rejection

Delay these until after the first end-to-end VC path is green:

- strong holder-bound VP requirements
- hidden-holder privacy extensions
- transcript credentials
- wallet-recovery automation
- independent assurance mirrors
- full corrected or superseded replacement semantics
