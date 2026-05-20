# Verifier Contract Template

Status: starter template for Layer 3 business contracts.

Use this when you need the smallest practical Compact contract that consumes an
existing VC family and enforces one verifier-defined business rule.

This template is intentionally narrow:

- one credential family
- one verifier request type
- one business predicate
- no extra transport or orchestration concerns

## Start from the right packages

Contract-authoring surfaces:

- `packages/core/primitives/credentials/src/credentials/composable.compact`
- one family root such as `packages/prototypes/credential-families/birth/src/birth-credential.compact` or
  `packages/prototypes/credential-families/birth-secret/src/secret-birth-credential.compact`
- optional capability packages such as `credentials-same-holder`

Do not start from:

- `credentials-protocol`
- `credentials-openid`
- `credentials-offchain-did`
- generated `managed/**` exports

## Minimal shape

```compact
pragma language_version >= 0.16.0;

import CompactStandardLibrary;
import "../../packages/core/primitives/credentials/src/credentials/composable" prefix Core_;
import "../../packages/prototypes/credential-families/birth-secret/src/secret-birth-credential" prefix BirthSecret_;

export ledger MIN_AGE: Uint<64>;

constructor(minAge: Uint<64>) {
  MIN_AGE = minAge;
}

export circuit verifyAgeGate(
  request: BirthSecret_SecretBirthCredentialVerificationRequest,
  submission: BirthSecret_SecretBirthCredentialVerificationSubmission,
): [] {
  let result =
    BirthSecret_verifySecretBirthCredentialPresentationForRequest(
      request,
      submission,
    );

  // Replace this with the contract-specific acceptance rule you actually need.
  assert(result.ageOverThreshold);
  assert(result.minimumAge == MIN_AGE);
}
```

## What to customize

1. Family imports
   - switch to the family root that owns your schema-specific request and
     presentation types.
2. Request type
   - keep the verifier request typed and family-specific.
3. Business rule
   - express the final contract decision after family verification succeeds.
4. Capability issuance
   - if the contract should mint or anchor a reusable business capability,
     add that after the verifier predicate succeeds.

## Status-aware variant

If your contract needs the current prototype revocation/status flow:

- keep the VC-side binding in the family/credential shape
- keep `registryId` and `revokedRoot` verifier-supplied
- consume the family-level status-aware request/submission types
- do not make the contract pretend to discover freshness on its own

For that path, start from:

- `packages/prototypes/credential-families/birth-secret/src/secret-birth-credential.compact`
- `packages/use-cases/age-gate/contract/src/demo-revocation.compact`
- `docs/spec/status-verification-protocol.md`

## On-chain / off-chain split

On-chain:

- Compact request/verification circuits
- contract storage and final business decision

Off-chain:

- request construction
- holder witness preparation
- transport/orchestration
- optional status proof building

## Copy checklist

- import only Compact roots
- use one family-specific verification entrypoint
- keep the verifier request typed
- keep status freshness off-chain
- keep business logic after credential verification, not mixed into lower-layer
  family validation
