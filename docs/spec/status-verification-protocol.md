# Midnight VC Status Verification Protocol

Status: prototype contract-facing companion draft for status-aware verification.

Companion documents:

- [`./credential-status.md`](./credential-status.md)
- [`./revocation-registry.md`](./revocation-registry.md)
- [`./midnight-credentials.md`](./midnight-credentials.md)

## Purpose

This document defines how a verifier or Layer 3 contract should consume
status-aware VC/VP flows in the current Midnight prototype.

It exists to make three boundaries explicit:

- who chooses the accepted revocation root
- what the holder proves
- what the business contract verifies directly

## Current contract-facing rule

The verifier or orchestrating application `MUST` supply the accepted
`(registryId, revokedRoot)` pair.

The holder `MUST NOT` choose the accepted root unilaterally.

The business contract verifies consistency against that supplied root; it does
not discover root freshness or registry state by itself.

## Why this rule exists

Current Compact and contract-composability limits mean the business contract
cannot yet safely prove all of the following in one step:

- discover the current live revocation root from another contract
- verify that the supplied root is the latest or fresh enough root
- consume a final in-circuit revoked-set non-membership proof against that live
  root

So the current prototype splits responsibility cleanly:

- verifier/application:
  - obtains or selects an accepted current-enough root
- holder:
  - proves or presents status evidence bound to that root
- business contract:
  - verifies cryptographic and semantic consistency against that supplied root

## Shared request object

The repository now models the verifier-supplied status request as:

- `RevokedSetStatusRequest`

Conceptually it carries:

- `registryState.registryId`
- `registryState.revokedRoot`
- `verifierChallengeHash`

Purpose:

- bind the holder flow to one accepted registry domain
- bind the holder flow to one accepted revocation root
- bind the resulting proof or attestation to one verifier request

This request object is shared by different status proof protocols. It is not a
different VC shape.

## Contract-facing verification modes

### 1. Canonical target: embedded non-revocation proof

Long-term target:

- the holder produces a VP that includes:
  - normal credential/presentation validity
  - holder binding
  - status-handle consistency
  - non-membership in the revoked set under the accepted root

The business contract verifies one proof bundle plus the public status inputs:

- `registryId`
- `revokedRoot`
- verifier challenge

This is the preferred final architecture.

### 2. Transitional prototype: authority-attested status proof

Current implemented prototype:

- registry-bound status binding in the VC family
- `AuthorityAttestedStatusProof`

Purpose:

- let a trusted status authority attest that a credential-bound status handle
  commitment is non-revoked under the verifier-supplied root
- keep the final Layer 3 contract verification path concrete before the
  in-circuit non-membership proof lands

The authority attestation is bound to:

- `registryId`
- `revokedRoot`
- `statusHandleCommitment`
- `verifierChallengeHash`
- optional expiration

The authority signs that statement with the repository's generic `Proof`
container under a dedicated `midnight:vc:status-attestation` context.

## Authority role

The trusted signer for `AuthorityAttestedStatusProof` should be:

- the issuer, or
- a delegated status authority referenced by `StatusRegistryRef`

This is the current prototype trust model.

The verifier itself should not be the canonical status authority for generic
revocation semantics, because that collapses contract trust into:

- "the verifier decided this credential is acceptable"

rather than:

- "the credential is non-revoked under the accepted registry state"

Verifier-signed admission tokens can still be useful for specific applications,
but they are a different capability.

## Layer 3 verification contract

For the authority-attested prototype, a Layer 3 contract should verify:

1. the ordinary VC/VP proof
2. the status binding bound into the credential family
3. the verifier-supplied `RevokedSetStatusRequest`
4. the `AuthorityAttestedStatusProof`
5. verifier freshness policy for that attestation:
   - optional absolute expiration carried by the attestation
   - optional verifier-enforced max-age window carried by the policy

That means the contract checks:

- the attestation was signed by the authority referenced in the capability
- the attestation registry matches the credential-bound registry
- the attestation root matches the verifier-supplied root
- the attestation challenge matches the verifier challenge
- the attestation status-handle commitment matches the credential capability
- future-dated authority attestations are rejected
- if enabled, the attestation age does not exceed the verifier freshness window

## Freshness responsibility

Freshness is now split between the contract and the verifier in the current
prototype.

The verifier or application must decide:

- which root is current enough
- how that root was obtained
- whether cached or delegated status evidence is acceptable

The contract now enforces one freshness dimension for authority-attested proofs
when the verifier enables it:

- `VerifierStatusPolicy.enforceAttestationMaxAge`
- `VerifierStatusPolicy.maxAttestationAge`

That verifier max-age uses the same unit as:

- the verifier-supplied `currentTime`
- the attestation `createdAt`

So the contract can now reject an authority attestation that is:

- not expired in absolute terms
- but older than the verifier's accepted replay window

What still remains outside the contract:

- whether the supplied `revokedRoot` is actually the latest live root
- whether the verifier's chosen root source is trustworthy enough
- how a verifier rotates accepted roots over time

## Holder responsibility

The holder must be able to show that the requested registry really belongs to
the VC/VP they are presenting.

In the current prototype, this is achieved by:

- carrying a credential-bound status binding
- binding that status object to:
  - `registryId`
  - `statusHandleCommitment`
- requiring the authority attestation or witness inputs to match that same
  binding

So the holder does not merely present "some registry root"; they present status
evidence bound to the exact registry and commitment domain already carried by
the VC family.

## Normalized target architecture

The repository should distinguish:

- VC / VP status binding
- presentation-time status proof protocol

Recommended target model:

- VC / VP binding layer:
  - `NoStatusBinding`
  - `RegistryBoundStatusBinding`
- presentation-time proof-protocol layer:
  - `AuthorityAttestedStatusProofProtocol`
  - `RevokedSetNonMembershipStatusProofProtocol`

In that model:

- credential families import only the binding layer
- verifier flows and Layer 3 contracts choose a proof protocol separately
- different trust semantics stay explicit without multiplying VC shapes

Import guidance:

- VC/family shape:
  - import shared status binding from `credentials`
- verifier/session/business-contract status semantics:
  - import registry-facing request/proof-protocol helpers from
    `credentials-status-registry`

Current compatibility note:

- the repository still exposes `AuthorityAttestedStatusCapability` and
  `RevokedSetNonMembershipStatusCapability`
- those names should be read as compatibility-era wrappers over one shared
  registry-bound status shape

## Prototype limitations

Current limitations remain:

- the repository does not yet implement the final in-circuit revoked-set
  non-membership proof
- the revocation registry contract does not yet prove that a supplied
  `revokedRoot` equals the live Merkle root inside Compact
- root freshness is still verifier/application enforced, not contract-discovered
- the current wrapped credential families validate status binding objects and
  status proofs consistently, but they do not yet cryptographically commit the
  full status binding into the issuer-signed credential body root
- the current off-chain authority-attestation builder requires the caller to
  choose between:
  - the safe default helper, which now derives the signing nonce
    deterministically from signer secret material plus attestation context
  - an explicit unsafe override for tests or tightly controlled integrations
- authority-attested proof freshness is now partially enforceable through
  verifier max-age policy, but root freshness is still off-chain and
  verifier-selected
- the current prototype therefore enforces:
  - request challenge binding
  - optional absolute expiration
  - optional verifier max-age
  - authority identity and registry consistency

So the implemented authority-attested path is a meaningful prototype, not the
final non-revocation architecture.
