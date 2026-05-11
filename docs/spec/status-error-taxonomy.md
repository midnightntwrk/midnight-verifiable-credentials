# Midnight VC Status Error Taxonomy

Status: normative companion draft for fail-closed status invalidity outcomes.

Companion documents:

- [`./credential-status.md`](./credential-status.md)
- [`./revocation-registry.md`](./revocation-registry.md)
- [`./status-verification-protocol.md`](./status-verification-protocol.md)
- [`./conformance.md`](./conformance.md)

## Purpose

This document defines the repository's current status-error vocabulary.

It exists to make one rule explicit:

- status failures are part of VC/VP validity, not only business-policy outcomes

That rule matters because the repository now supports multiple status
implementation modes:

- same-contract live-root verification
- verifier-side external-registry verification
- authority-attested external-registry verification

Those modes have different trust boundaries, but they must fail closed on the
same classes of status invalidity.

## Hard-invalidity rule

If a verifier, helper, or Layer 3 contract determines any status error in this
taxonomy, it `MUST` reject the VC/VP verification attempt.

Implementations `MUST NOT` convert these outcomes into:

- a successful verification with a soft denial result
- a warning-only path
- an application-policy override that still treats the VC/VP as valid

Business outcomes such as `superseded`, `corrected`, or domain-specific access
denial remain separate and may exist only after the underlying VC/VP has
verified successfully.

## Canonical status errors

| Error | Meaning | Required disposition |
| --- | --- | --- |
| `revoked` | Accepted status evidence proves the credential is revoked under the accepted registry snapshot | hard invalidity |
| `staleRegistryState` | The supplied registry snapshot is older than the verifier's accepted freshness or version floor | hard invalidity |
| `unknownRegistry` | The supplied registry is not one the verifier or contract accepts for this flow | hard invalidity |
| `unsupportedStatusProofMode` | The verifier or contract does not support the presented status proof mode for this request | hard invalidity |
| `statusBindingMismatch` | The VC-side committed binding does not match the presented request, witness, or attestation | hard invalidity |
| `statusRequestMismatch` | The public status request and holder/authority status payloads do not agree on registry domain, root, version, or challenge | hard invalidity |
| `authorityMismatch` | The authority-attested proof was not signed by the authority referenced by the VC-side binding | hard invalidity |
| `attestationExpired` | The attested status statement is past its absolute expiration time | hard invalidity |
| `attestationTooOld` | The attested status statement exceeds the verifier-enforced max-age window | hard invalidity |
| `futureDatedAttestation` | The attested status statement is created in the future relative to accepted verifier time | hard invalidity |

## Helper-surface reserved failure code

The typed off-chain verifier helpers in `credentials-status-registry` may also
return one extra non-taxonomy code:

| Error | Meaning | Required disposition |
| --- | --- | --- |
| `unclassifiedFailure` | The helper caught a failure that did not map cleanly onto the canonical status-invalidity vocabulary | fail closed, treat as an integration/runtime error rather than as a successful status verdict |

This code exists so a verifier can distinguish:

- a real status-invalidity verdict such as `revoked` or `authorityMismatch`
- from a helper/runtime failure that needs investigation

It must still fail closed, but it should not be mislabeled as one of the
cryptographic status-invalidity outcomes above.

## Detection guidance

Typical detection points are:

- holder/verifier helper assembly:
  - `revoked`
  - `staleRegistryState`
  - `unknownRegistry`
- VC-side binding validation:
  - `statusBindingMismatch`
- status proof-protocol validation:
  - `statusRequestMismatch`
  - `unsupportedStatusProofMode`
- Layer 3 contract verification:
  - `authorityMismatch`
  - `attestationExpired`
  - `attestationTooOld`
  - `futureDatedAttestation`

The detection point may vary by implementation mode. The disposition must not.

The repository now also exposes a typed off-chain verifier helper surface under
`credentials-status-registry` that returns these same codes directly through
`StatusVerificationResult` values for:

- observed revoked-set verification
- same-contract live-state verification
- authority-attested external-registry verification

## Mode-specific note

The same error may surface at different layers depending on deployment mode:

- same-contract live-root mode may detect `staleRegistryState` or `revoked`
  directly inside the business-contract proof path
- verifier-side external-registry mode may detect those errors before any Layer
  3 contract call
- authority-attested external-registry mode may detect those errors during
  helper assembly, attestation verification, or both

That variation does not change the requirement:

- all of these outcomes are hard VC/VP invalidity

## Future direction

This document defines the canonical semantics first. A later repository-wide
protocol error registry may map these conditions onto transport or application
error codes, but those mappings must preserve the fail-closed rule above.
