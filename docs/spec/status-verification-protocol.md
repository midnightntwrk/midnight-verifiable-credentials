# Midnight VC Status Verification Protocol

Status: prototype contract-facing companion draft for status-aware verification.

Companion documents:

- [`./credential-status.md`](./credential-status.md)
- [`./status-error-taxonomy.md`](./status-error-taxonomy.md)
- [`./revocation-registry.md`](./revocation-registry.md)
- [`./midnight-credentials.md`](./midnight-credentials.md)
- [`../architecture/status-verification-modes.md`](../architecture/status-verification-modes.md)

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
- `registryState.registryVersion`
- `verifierChallengeHash`

Purpose:

- bind the holder flow to one accepted registry domain
- bind the holder flow to one accepted revocation root
- bind the resulting proof or attestation to one verifier request

This request object is shared by different status proof protocols. It is not a
different VC shape.

## Implementation mode matrix

The repository now treats status verification mode as an implementation choice
over one shared VC-side binding model.

For the architecture-level distinction between:

- same-contract live revoked-set verification
- off-chain verifier-side live-state verification
- and authority-attested external-registry Layer 3 verification

see:

- [`../architecture/status-verification-modes.md`](../architecture/status-verification-modes.md)

Supported prototype modes are:

### 1. Same-contract live-root verification

Use this when:

- the revocation registry resides in the same contract domain as the business
  verification logic

Target shape:

- Layer 3 fetches or otherwise binds the accepted live-enough registry state in
  the same circuit path
- the VC/VP proof checks revocation status directly against that accepted state

This is the strongest current target because the business contract does not
need to trust an external status attestation once the live-root path exists in
that same contract domain.

Current shipped prototype seam:

- the repository now exposes a `LiveStatusWitnessInput` plus matching
  binding-first TypeScript helper path for this mode
- that witness shape omits the external `(registryId, revokedRoot)` snapshot
  and carries only:
  - `statusHandle`
  - `statusHandleOpening`
- a same-contract verifier can pair that witness with its own live local
  revocation state instead of consuming an authority attestation or
  verifier-supplied root snapshot
- when runtime access to the shared revocation-registry contract state is
  available, the repository now also exposes canonical helper paths to:
  - read the live `(registryId, revokedRoot, registryVersion)` snapshot from
    contract state
  - reject already-revoked handles against that live state
  - build the canonical revoked-set request/witness/protocol bundle directly
    from that live state plus freshness policy
- this still does not make the root contract-proven inside Compact itself; it
  turns live-state observation into one shared typed seam instead of another
  app-local convention

### 2. External-registry verifier-side verification

Use this when:

- the revocation registry resides in another contract or service domain, and
- the deployment does not require full VC/VP verification inside a Layer 3
  contract

Target shape:

- the verifier performs status validation off-chain
- the verifier decides whether the credential is acceptable before any optional
  business-contract call

This mode still uses the same VC-side binding and fail-closed error taxonomy.
It simply detects status invalidity outside Compact.

Canonical repository helper path:

- `verifyObservedRevokedSetStatus(...)` for legacy verifier-observed snapshots
- `verifyLiveContractStateStatus(...)` for legacy same-contract live runtime state
- `verifyAuthorityAttestedStatus(...)` when the verifier is consuming
  delegated status evidence off-chain
- `verifySameContractStatusV1(...)` for an exact lookup over one #495 contract-state object
- `verifyAuthenticatedRootStatusV1(...)` for #496's root-bound SHA-256 reference membership/non-membership verifier

The #496 external path additionally requires explicit cryptographic-proof,
#494 authority-evidence, and freshness-verifier providers. The verifier policy,
not holder evidence, supplies the accepted leaf and credential, presentation,
and challenge digests. Its transcript binds those request inputs with the
selected profile, network, namespace, registry, deployment, root/version,
accepted authority-policy digest, authority transcript, proof, and freshness
anchor. Omitted/unavailable dependencies are indeterminate; authenticated
mismatches, stale roots, forged witnesses, and proved membership are invalid.

These helpers return a typed `StatusVerificationResult` and map raw validator
failures onto the canonical status error codes instead of leaving each
integration to classify stringly-typed failures itself. If a failure does not
map cleanly, the helpers return `unclassifiedFailure` so the verifier can fail
closed without misreporting an internal/runtime issue as a specific status
verdict.

For live same-contract verifier checks, the helper applies any minimum
registry-version policy directly to the live `RevocationRegistryState`. It does
not pretend that live runtime state is an observed snapshot with an invented
observation time.

### 3. External-registry authority-attested Layer 3 verification

Use this when:

- the revocation registry resides in another contract or service domain, and
- the deployment still requires a Layer 3 contract to verify status-aware VC/VP
  flows

Target shape:

- the holder obtains an authority-attested status proof bound to the verifier
  challenge
- the authority may be:
  - the verifier itself at Layer 4
  - or another authority trusted by the verifier
- the Layer 3 contract verifies that attestation against the shared VC-side
  binding

This is a supported implementation option, not throwaway glue. It must be
hardened with explicit freshness, authority-identity, and replay semantics.

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

Current canonical prototype vocabulary for that target is already normalized
around:

- `RevokedSetStatusRequest`
- `RevokedSetNonMembershipWitnessInput`
- `RevokedSetNonMembershipStatusProofProtocol`

The request remains the public verifier-supplied input:

- `registryState.registryId`
- `registryState.revokedRoot`
- `verifierChallengeHash`

The witness input remains the holder-private status-binding side:

- `registryState`
- `statusHandle`
- `statusHandleOpening`

That split is intentional:

- the verifier chooses the accepted registry snapshot and challenge
- the holder proves they control a credential whose committed
  `statusHandleCommitment` opens to one concrete `statusHandle`
- the contract verifies that both sides are bound to the same registry domain
  and request

Future final Merkle non-membership work may add a proof-path witness, but it
should extend this protocol shape rather than replace the request/witness
separation entirely.

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
- `registryVersion`
- `statusHandleCommitment`
- `verifierChallengeHash`
- optional expiration

The authority signs that statement with the repository's generic `Proof`
container under a dedicated `midnight:vc:status-attestation` context.

Production warning: the current prototype verifies the public key carried by
that `Proof` but does not prove that those key bytes belong to the referenced
active DID method. Matching a method reference alone is insufficient. Final
profiles must use the DID key-provenance, distinct attestation-role, root-
freshness, and trusted-time contract in
[`status-time-authority-v1.md`](./status-time-authority-v1.md).

## Authority role

The trusted signer for `AuthorityAttestedStatusProof` should be:

- the issuer, or
- a separately delegated status-attestation authority accepted by the
  credential's stable registry/issuer policy

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

If the accepted status evidence says the credential is revoked, the contract
must reject the VC/VP proof outright. It must not surface revocation as a
successful verification with a softer business-policy denial result.

## Hard-invalidity outcomes

Regardless of implementation mode, the verifier/helper/contract must reject the
VC/VP attempt when it determines:

- `revoked`
- stale registry state
- unknown registry
- unsupported status proof mode
- authority mismatch
- status binding mismatch
- request or attestation mismatch

See the canonical fail-closed vocabulary in:

- [`./status-error-taxonomy.md`](./status-error-taxonomy.md)

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

The current repository already exposes one canonical off-chain helper path for
that verifier-side responsibility:

- `buildObservedRevocationRegistryState(...)`
- `assertObservedRevocationRegistryVersionAtLeast(...)`
- `assertObservedRevocationRegistryStateFreshEnough(...)`
- `buildRevokedSetStatusRequestFromObservedState(...)`
- `buildFreshRevokedSetNonMembershipInputs(...)`

Those helpers do not make the root live inside Compact. They normalize the
current implementation boundary so verifiers stop rebuilding root-freshness
checks and request/witness/protocol assembly ad hoc.

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

For the revoked-set non-membership target specifically, that means the holder
must be able to supply one canonical witness shape:

- the accepted `registryState`
- the accepted `registryVersion` carried inside that same snapshot
- the derived `statusHandle`
- the `statusHandleOpening` that reproduces the committed
  `statusHandleCommitment`

If that witness-building path or the accepted snapshot already shows the
credential as revoked, the correct prototype behavior is to fail before proof
assembly continues.

The holder does not get to replace that witness shape with ad hoc app-local
status metadata. If a future implementation adds Merkle non-membership witness
material, that additional witness must stay subordinate to the same canonical
request plus status-handle-opening model.

Current exported runtime bundle surfaces for that contract are:

- `CanonicalObservedNonMembershipBundle`
- `CanonicalLiveNonMembershipBundle`
- `buildCanonicalObservedNonMembershipBundle(...)`
- `buildCanonicalLiveNonMembershipBundleFromContractState(...)`
- `assertCanonicalNonMembershipBundle(...)`

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
- those names should be read as Compact compatibility surface only, not as the
  preferred off-chain builder vocabulary
- the off-chain TypeScript helper path is now binding-first around one shared
  registry-bound status shape
- `credentials-birth-secret` now commits that shared binding into an
  issuer-signed status-bound body root for its status-aware wrapper proofs
- other or future status-aware family surfaces may still need the same
  migration before the repository can claim the rollout is complete

## Prototype limitations

Current limitations remain:

- the repository now implements a cryptographic SHA-256 **TypeScript reference**
  membership/non-membership verifier and shared vectors, but not the final
  in-circuit revoked-set non-membership proof
- a pinned-toolchain probe compiled an in-circuit
  `MerkleTree.checkRoot(MerkleTreeDigest { ... })` equality check, but `root()`
  was rejected as runtime-only and `pathForLeaf(...)` was unavailable
  in-circuit; no native Compact non-membership proof compiled, so generated
  Compact artifacts are unchanged by #496
- external private/hidden-holder status remains indeterminate until a real ZK
  adapter proves a challenge-scoped leaf relation without exposing a stable
  handle or commitment
- the legacy canonical Compact witness shape therefore proves:
  - request binding
  - registry-domain binding
  - status-handle-opening consistency
  and not yet the final Merkle non-membership statement itself
- the revocation registry contract does not yet prove that a supplied
  `revokedRoot` equals the live Merkle root inside Compact
- root freshness is still verifier/application enforced, not contract-discovered
- `credentials-birth-secret` now cryptographically commits the shared
  `RegistryBoundStatusBinding` into an issuer-signed status-bound body root,
  but the broader repository rollout is not complete until the same pattern is
  applied to other or future status-aware family surfaces
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

Architecture companion note:

- [status-canonical-non-membership-bundle.md](../architecture/status-canonical-non-membership-bundle.md)
- [live-root-binding-feasibility.md](../architecture/live-root-binding-feasibility.md)
- [status-contract-closeout-boundary.md](../architecture/status-contract-closeout-boundary.md)
