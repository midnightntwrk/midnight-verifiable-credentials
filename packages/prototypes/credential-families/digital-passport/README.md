# @midnight-ntwrk/midnight-did-credentials-digital-passport

> Maturity: `reference`
> Package class: `dist`

Digital-passport credential specialization for the generic Midnight VC/VP core.

Status:

- reference implementation

Tier:

- credential-family package

Dependency direction:

- depends on reusable core packages
- may be composed by Layer 3 contracts and Layer 4 adapters
- should not depend on protocol/orchestration packages, demos, or standalone
  integration harnesses

Reusable outside this repo:

- yes

Surface classification:

- `On-chain + off-chain`
- `src/digital-passport-credential.compact` is the authoritative contract-authoring surface
- generated/runtime TypeScript exports are off-chain mirrors only
- `./testing` is an `Off-chain only` fixture surface for integration tests;
  do not import `../<package>/src/...` from sibling workspaces
- example:
  `import { createDigitalPassportFixtureForParticipants } from "@midnight-ntwrk/midnight-did-credentials-digital-passport/testing";`

Start here:

1. use this package when you want digital-passport credential commitment-only claims
   on top of the generic Midnight VC/VP core
2. write contracts against the Compact family entrypoint
3. use generated/runtime exports only in tests, wallets, verifiers, and
   adapter code
4. read [`../../../../docs/guides/integration-surface-map.md`](../../../../docs/guides/integration-surface-map.md)
   for the Compact/runtime split

Related docs:

- spec: [`../../../../docs/spec/midnight-credentials.md`](../../../../docs/spec/midnight-credentials.md)
- profiles: [`../../../../docs/spec/profiles.md`](../../../../docs/spec/profiles.md)
- conformance: [`../../../../docs/spec/conformance.md`](../../../../docs/spec/conformance.md)
- companion guide: [`../../../../docs/guides/midnight-credentials-for-dummies.md`](../../../../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../../../../docs/testing/test-matrix.md`](../../../../docs/testing/test-matrix.md)

## Purpose

This package defines the digital-passport credential family on top of the generic
[`credentials`](../../../../packages/core/primitives/credentials/README.md) package.

It owns the schema-specific parts that should not live in the generic core:

- digital-passport claim commitments
- digital-passport schema validation
- typed digital-passport presentation requests
- first-name, last-name, and date-of-birth selective disclosure
- age-over-threshold predicate validation

## Claim Schema

| Field | Compact Type | Representation | Notes |
|---|---|---|---|
| `firstName` | `Bytes<64>` | `committedPrivate` | Text-padded to 64 bytes; revealed on request via `revealFirstName` |
| `lastName` | `Bytes<64>` | `committedPrivate` | Text-padded to 64 bytes; revealed on request via `revealLastName` |
| `dateOfBirth` | `Uint<32>` | `committedPrivate` + `predicateOnly` | Days since Unix epoch; supports age-over-threshold predicate without revealing the date |

Schema identifiers:

- `packageId = "midnight:vc:digital-passport"`
- `schemaId = "digital-passport:v1"`
- `majorVersion = 1`

The claim root uses domain-separated hashing:
```
persistentHash<Vector<4, Bytes<32>>>([
  pad(32, "midnight:vc:digital-passport:v1"),
  firstNameCommitment,
  lastNameCommitment,
  dateOfBirthCommitment,
])
```

## Holder Binding

This family uses `ExplicitHolderBinding`: the holder binds their DID
verification method reference directly into the credential and presentation.
The generic core validates the holder binding proof.

## Status Binding

This family uses `NoStatusBinding`: credentials have no on-chain revocation or
suspension status. Status checking, if needed, is an off-chain concern.

## Disclosures

`DigitalPassportDisclosures` supports three disclosure modes:

| Disclosure | Field | Description |
|---|---|---|
| `revealFirstName` | `firstNameValuePadded` + `firstNameOpening` | Opens the first-name commitment to reveal the padded text value |
| `revealLastName` | `lastNameValuePadded` + `lastNameOpening` | Opens the last-name commitment to reveal the padded text value |
| `proveAgeOverThreshold` | `ageThresholdYears` | Proves the holder is at least `ageThresholdYears` years old without revealing `dateOfBirth` |

## Presentation Requests

`DigitalPassportPresentationRequest` allows a verifier to request one or more
disclosures:

| Field | Description |
|---|---|
| `requireFirstNameDisclosure` | Require the holder to reveal their first name |
| `requireLastNameDisclosure` | Require the holder to reveal their last name |
| `requireAgeOverThreshold` | Require the holder to prove age over `requestedAgeThresholdYears` |
| `requestedAgeThresholdYears` | The minimum age in years (must be > 0 when `requireAgeOverThreshold` is true, 0 otherwise) |
| `verifierChallengeHash` | Anti-replay challenge from the verifier (must be non-empty) |

## Validation Circuits

| Circuit | Purpose |
|---|---|
| `digitalPassportClaimRoot` | Domain-separated claim root from commitments |
| `firstNameCommitment` / `lastNameCommitment` / `dateOfBirthCommitment` | Individual commitment circuits |
| `assertValidDigitalPassportSchemaRef` | Validates schema identifiers |
| `assertValidDigitalPassportPresentationRequest` | Validates request structure and constraints |
| `assertValidDigitalPassportCredential` | Validates the full credential envelope |
| `assertValidDigitalPassportPresentation` | Validates a presentation and its disclosures |
| `assertDigitalPassportPresentationSatisfiesRequest` | Checks that disclosures match request requirements |
| `assertValidDigitalPassportAgePredicate` | Validates the age-over-threshold predicate with a current-day witness |

## Protocol Model

This family follows the thin-core protocol model (VC/VP types + claim root):

- `DigitalPassportIssuanceOffer`, `DigitalPassportIssuanceRequest`, `DigitalPassportIssuanceResult`
- `DigitalPassportVerificationRequest`, `DigitalPassportVerificationSubmission`, `DigitalPassportVerificationResult`

## Relationship to midnight-passport-issuer SD-JWT claims

The digital-passport Compact credential family is the on-chain complement to the
off-chain SD-JWT digital-passport credential defined in the `midnight-passport-issuer`
workspace. The SD-JWT claims source the same fields:
- `first_name` → `firstName` (`Bytes<64>`, text-padded)
- `last_name` → `lastName` (`Bytes<64>`, text-padded)
- `date_of_birth` → `dateOfBirth` (`Uint<32>`, days since epoch)

An adapter layer maps between SD-JWT selective-disclosure claims and the
Compact commitment-based disclosures. The Compact family provides stronger
privacy guarantees because raw values never appear in the signed credential
body — only commitment digests.

## Build and test

- Compile Compact artifacts: `npm run contract -w credentials-digital-passport`
- Build TS exports: `npm run build -w credentials-digital-passport`
- Run tests: `npm test -w credentials-digital-passport`
