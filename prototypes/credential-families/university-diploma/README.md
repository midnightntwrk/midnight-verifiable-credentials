# @midnight-ntwrk/midnight-did-credentials-university-diploma

University-diploma credential-family prototype for the Midnight VC core.

Status:

- first implementation scaffold / explicit-holder family baseline

Tier:

- credential-family package

Purpose:

- introduce a concrete university diploma VC family aligned to the new `use-cases/university` research
- keep the first slice focused on claims, disclosures, schema helpers, and package surfaces
- defer verifier-contract semantics, trust-registry integration, and reissue flows to follow-on slices

Current scope:

- `UniversityDiplomaCredentialClaims`
- `UniversityDiplomaDisclosures`
- `UniversityDiplomaPresentationRequest`
- native `RegistryBoundStatusBinding` on the VC surface
- helper circuits for claim roots, schema validation, and request/disclosure alignment

Non-goals for this slice:

- issuance/result protocol envelopes
- full presentation-proof validation
- trust-registry verification
- revocation-service integration
- hidden-holder privacy variants
