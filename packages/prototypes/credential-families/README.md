# Retained credential-family prototype evidence

This generated catalog is private conformance evidence, not a product or production-readiness catalog. Source manifests live in each prototype's `conformance/composition-manifest.json`. The exact finite coverage guarantee is documented in [the profile coverage report](../../../docs/testing/prototype-profile-coverage.md).

## Capability matrix

| Prototype | Holder binding | Status | Verification | Protocols |
| --- | --- | --- | --- | --- |
| birth | explicit-did | disabled | ledger-local-v1 | canonical-reference |
| birth-secret | blinded-secret | authority-attested | ledger-attested-v1 | canonical-reference |
| digital-passport | explicit-did | disabled | ledger-local-v1 | oid4vp-1.0-final |
| university-diploma | explicit-did | disabled | ledger-local-v1 | canonical-reference |

## Maturity matrix

| Prototype | API | Security | Standards | Production |
| --- | --- | --- | --- | --- |
| birth | reference | unassessed | not-applicable | not-assessed |
| birth-secret | reference | unassessed | not-applicable | not-assessed |
| digital-passport | prototype | unassessed | inspired | not-assessed |
| university-diploma | reference | unassessed | not-applicable | not-assessed |

## Package and artifact matrix

| Prototype | Exact packages | Compact entrypoints | Trusted artifacts |
| --- | --- | --- | --- |
| birth | @midnight-ntwrk/midnight-did-credentials-birth@0.1.0 | packages/prototypes/credential-families/birth/src/birth-credential.compact | none declared |
| birth-secret | @midnight-ntwrk/midnight-did-credentials-birth-secret@0.1.0 | packages/prototypes/credential-families/birth-secret/src/secret-birth-credential.compact | none declared |
| digital-passport | @midnight-ntwrk/midnight-did-credentials-digital-passport@0.1.0 | packages/prototypes/credential-families/digital-passport/src/digital-passport-credential.compact | none declared |
| university-diploma | @midnight-ntwrk/midnight-did-credentials-university-diploma@0.1.0 | packages/prototypes/credential-families/university-diploma/src/university-diploma-credential.compact | none declared |

## Privacy and trust matrix

| Prototype | Claim disclosures | Private inputs | DID / trust scope | Limitations |
| --- | --- | --- | --- | --- |
| birth | committed | private-predicate | did:midnight; fixture-only | Prototype evidence only; status is disabled and no production authority is selected. |
| birth-secret | committed | hidden-holder, private-predicate | did:midnight; fixture-only | Authority-attested status and same-holder remain reference evidence, not production authority approval. |
| digital-passport | committed | private-predicate | did:midnight; fixture-only | Frozen migration evidence; OpenID-shaped framing is not OpenID conformance or a production passport use case. |
| university-diploma | public | none | did:midnight; fixture-only | Private use-case evidence only; University v1 privacy scope remains governed separately and is not production-approved. |

## Test evidence matrix

| Prototype | Fixture | Resolved graph | Happy path | Negative evidence |
| --- | --- | --- | --- | --- |
| birth | [fixture](../../../packages/prototypes/credential-families/birth/src/birth-credential.compact) | [definition](../../../packages/prototypes/credential-families/birth/conformance/family-definition.json) [resolved graph](../../../tooling/profile-coverage/generated/profile-coverage.json#/retainedPrototypeManifests/0/resolvedGraph) | [happy](../../../packages/prototypes/credential-families/birth/src/test/holder-binding.test.ts#L9) | [negative](../../../packages/prototypes/credential-families/birth/src/test/age-predicate.test.ts#L12) |
| birth-secret | [fixture](../../../packages/prototypes/credential-families/birth-secret/src/secret-birth-credential.compact) | [definition](../../../packages/prototypes/credential-families/birth-secret/conformance/family-definition.json) [resolved graph](../../../tooling/profile-coverage/generated/profile-coverage.json#/retainedPrototypeManifests/1/resolvedGraph) | [happy](../../../packages/prototypes/credential-families/birth-secret/src/test/status-attestation.test.ts#L16) | [negative](../../../packages/prototypes/credential-families/birth-secret/src/test/status.test.ts#L12) |
| digital-passport | [fixture](../../../packages/prototypes/credential-families/digital-passport/src/digital-passport-credential.compact) | [definition](../../../packages/prototypes/credential-families/digital-passport/conformance/family-definition.json) [resolved graph](../../../tooling/profile-coverage/generated/profile-coverage.json#/retainedPrototypeManifests/2/resolvedGraph) | [happy](../../../packages/prototypes/credential-families/digital-passport/src/test/protocol.test.ts#L9) | [negative](../../../packages/prototypes/credential-families/digital-passport/src/test/private-parts.test.ts#L12) |
| university-diploma | [fixture](../../../packages/prototypes/credential-families/university-diploma/src/university-diploma-credential.compact) | [definition](../../../packages/prototypes/credential-families/university-diploma/conformance/family-definition.json) [resolved graph](../../../tooling/profile-coverage/generated/profile-coverage.json#/retainedPrototypeManifests/3/resolvedGraph) | [happy](../../../packages/prototypes/credential-families/university-diploma/src/test/privacy-profile.test.ts#L33) | [negative](../../../packages/prototypes/credential-families/university-diploma/src/test/validation-guards.test.ts#L9) |
