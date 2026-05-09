# Midnight VC Credential Status

Status: normative companion draft for credential status and revocation claims.

Companion documents:

- [`./midnight-credentials.md`](./midnight-credentials.md)
- [`./profiles.md`](./profiles.md)
- [`./conformance.md`](./conformance.md)
- [`./revocation-registry.md`](./revocation-registry.md)
- [`./status-verification-protocol.md`](./status-verification-protocol.md)

## Purpose

This document defines the repository's current status/revocation contract.

It exists to separate:

- core VC and holder-binding semantics
- transport/session semantics
- credential status and revocation semantics

Without that separation, implementations tend to make vague "production ready"
claims while silently leaving revocation, freshness, or privacy tradeoffs
undefined.

## Scope

This document defines:

- the current status terminology
- conformance levels for status support
- the status binding and proof-protocol model
- verifier obligations when requesting status-aware proofs
- hidden-holder privacy obligations when status is involved
- the repository's current implementation stance

The revocation-registry companion defines the repository's current prototype
target for a Level 2 non-revocation model.

## Terminology

| Term | Meaning in this document |
| --- | --- |
| `Credential status` | The validity state of a credential after issuance, independent of its claim contents |
| `Status authority` | The issuer or delegated authority that can assert whether a credential is active, suspended, revoked, or expired |
| `Status handle` | The credential-bound reference used to locate status information |
| `Status evidence` | The verifier-consumable proof, record, or witness that supports a status decision |
| `Freshness window` | The maximum acceptable age of status evidence at verification time |
| `Public status check` | A status lookup that can reveal the credential or holder correlation to the status authority or transport |
| `Non-revocation proof` | A privacy-preserving witness that proves a credential is not revoked without revealing more than necessary |

## Design rule

Credential status is a separate concern from:

- issuer proof validity
- holder binding
- disclosure layout
- predicate validity

A credential can be:

- structurally valid
- proof-valid
- correctly holder-bound

and still be:

- revoked
- suspended
- stale under a verifier freshness policy

Implementations `MUST NOT` treat issuer proof verification alone as a complete
production validity model when they claim status-aware verification.

Revocation rule:

- once status evidence proves that a credential is revoked under the accepted
  registry state, the VC/VP verification outcome `MUST` be hard invalidity
- implementations `MUST NOT` downgrade `revoked` into:
  - a soft business-policy denial
  - a warning-only result
  - or a still-valid presentation with reduced privilege
- business-policy outcomes such as `superseded`, `corrected`, or
  application-specific access denial remain separate concerns from revocation

## Status support levels

### Level 0: No status support

An implementation at this level:

- does not model revocation/non-revocation
- may only rely on claim-level expiry or application policy
- `MUST` disclose that status is deferred

Some current packages still remain at this level, especially families that do
not bind a status registry at all.

The corresponding explicit zero-status compatibility name is:

- `NoStatusCapability`

### Level 1: Public status check

An implementation at this level:

- binds a credential to a status handle
- defines how a verifier obtains status evidence
- defines freshness rules for that evidence
- may require online or delegated resolver access

This level can be production-acceptable for explicit-holder deployments, but it
may leak verifier, holder, or credential correlation to the status authority or
transport path.

The repository's current authority-attested Layer 3 bridge is not a pure public
lookup scheme, but it occupies the same delegated-freshness space: the
verifier/application still chooses the accepted root and the contract does not
discover status freshness by itself.

### Level 2: Privacy-preserving non-revocation

An implementation at this level:

- defines a status witness that can be consumed inside the proof model
- proves non-revocation without revealing unnecessary correlation data
- defines how the verifier obtains and accepts fresh-enough status evidence
- states exactly what the verifier learns from the non-revocation proof

This level is the likely long-term target for hidden-holder and
blinded-secret-heavy deployments.

The corresponding prototype target proof-protocol direction is:

- `RevokedSetNonMembershipStatusProofProtocol`

## Status binding and proof-protocol model

The repository should model status through two related but distinct layers.

### VC / VP status binding

The binding contributes:

- credential-bound status fields
- the registry domain that the credential belongs to
- the committed status-handle domain that later proofs must match

The normalized target binding model is:

- `NoStatusCapability`
- `RegistryBoundStatusBinding`

The current code still uses the compatibility name `NoStatusCapability` for the
explicit zero-status case. For registry-bound status, the current code exposes
two wrappers that already share the same VC-side data:

- `AuthorityAttestedStatusCapability`
- `RevokedSetNonMembershipStatusCapability`

Those two wrappers should be understood as different proof modes over one
shared registry-bound binding shape, not as fundamentally different VC shapes.

The first hidden-holder family rollout now lives in
`credentials-birth-secret`:

- its status-aware wrapper proofs commit the shared
  `RegistryBoundStatusBinding` into an issuer-signed status-bound body root
- the wrapper names remain compatibility-era status-capability labels, but the
  committed VC-side binding is now the canonical shared shape

Other or future status-aware family surfaces may still be in transition until
they adopt the same status-bound body-root pattern.

Ownership rule:

- shared VC-side status binding belongs to `credentials`
- registry-specific request/proof-protocol helpers belong to
  `credentials-status-registry`

### Presentation-time status proof protocol

The proof protocol contributes:

- presentation-time witness requirements
- verifier-request status policy fields
- additional proof and validation circuits

The normalized target proof-protocol model is:

- `AuthorityAttestedStatusProofProtocol`
- `RevokedSetNonMembershipStatusProofProtocol`

The current repository already contains the corresponding proof payloads:

- `AuthorityAttestedStatusProof`
- `RevokedSetNonMembershipWitnessInput`
- shared verifier-supplied request inputs such as `RevokedSetStatusRequest`
- `RevocationRegistryState`, which now carries:
  - `registryId`
  - `revokedRoot`
  - `registryVersion`

The detailed prototype revocation target for the revoked-set proof protocol is
defined in:

- [`./revocation-registry.md`](./revocation-registry.md)

The current transitional Layer 3 contract-facing prototype for trusted
authority-attested status proof is defined in:

- [`./status-verification-protocol.md`](./status-verification-protocol.md)

The target design for committing VC-side status binding into the issuer-signed
credential body root is defined in:

- [`../architecture/status-binding-body-root-commitment.md`](../architecture/status-binding-body-root-commitment.md)

`credentials-birth-secret` is the current first-family implementation of that
target. The broader repository-wide rollout is still incomplete until the same
pattern is lifted into other or future status-aware family surfaces.

## Required status disclosures

Any implementation claiming status support `MUST` document:

- whether it is Level 0, 1, or 2
- which credential families carry a status binding
- which authority controls status transitions
- which status states exist:
  - active
  - suspended
  - revoked
  - expired
  - or another explicitly defined set
- whether verification requires:
  - online lookup
  - cached evidence
  - embedded witness material
- which status proof protocol is used for verifier-facing checks
- the freshness window the verifier enforces
- whether hidden-holder privacy is reduced by the status path

## Verifier obligations

If a verifier claims status-aware verification, it `MUST` define:

- whether status is mandatory or optional for that request
- how it determines that the supplied status root is fresh enough
- whether stale status evidence is:
  - a hard rejection
  - a soft failure
  - or an application-policy override
- whether the verifier accepts:
  - public status checks
  - privacy-preserving non-revocation proofs
  - or both

Verifiers `MUST NOT` silently accept unverifiable status assumptions while
advertising production-ready revocation handling.

If the verifier accepts status-aware verification and the supplied status
evidence proves `revoked`, the verifier `MUST` reject the presentation before
any business-flow success path such as capability issuance, admission, or
session continuation.

## Hidden-holder privacy rule

For hidden-holder and blinded-secret profiles:

- Level 1 public status checks are allowed only if the implementation
  explicitly discloses the privacy tradeoff
- production-shaped privacy claims `SHOULD NOT` imply hidden-holder unlinkability
  if the status path still requires a correlating public lookup
- stronger hidden-holder production claims should target Level 2
  non-revocation rather than only Level 1 lookup-based status

In plain terms:

- hidden-holder proof privacy and public revocation lookup can coexist
- but the implementation must say clearly that the status path weakens privacy

## Repository stance today

Current repository packages now contain:

- explicit zero-status modeling through `NoStatusCapability`
- prototype registry-bound status surfaces and validators
- a first-family issuer-signed status-bound body-root rollout in
  `credentials-birth-secret`
- a prototype authority-attested status proof flow for hidden-holder
  verification
- a prototype revoked-set witness/proof-protocol flow without final in-circuit
  Merkle non-membership verification
- canonical off-chain helper surfaces for:
  - request + witness + protocol bundle construction
  - observed-root freshness normalization
  - verifier-supplied snapshot acceptance

Current repository packages now treat one status outcome as fixed:

- `revoked` is hard VC/VP invalidity
- it is not a typed business-level denial result
- prototype trust seams still exist around root freshness and final
  non-membership semantics, but they do not change the rejection rule once the
  accepted status evidence says the credential is revoked

Current repository packages still do not claim:

- final public status interoperability
- final privacy-preserving non-revocation proofs
- production-ready revocation semantics

## Conformance linkage

This document is normative for:

- profile-level status claims
- conformance disclosures about revocation/non-revocation
- hidden-holder privacy caveats where status is involved

`profiles.md` defines which current profiles still defer status.

`conformance.md` defines what a conformant implementation must disclose about
its chosen status level.

## Implementation direction

The next likely status/revocation engineering phases are:

1. complete in-circuit revoked-set non-membership verification on top of the
   canonical request/witness/protocol shape
2. strengthen live-root binding semantics for the revocation registry contract
3. broaden the issuer-signed status-bound body-root rollout beyond
   `credentials-birth-secret`
4. promote the current verifier-side helper path and starter/use-case surfaces
   into clearer integration guidance once their API story stabilizes
5. then upgrade conformance claims from prototype to production-shaped support
