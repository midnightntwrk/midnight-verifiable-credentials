# DID and trust authority evidence

Status: reusable V1 consumption and binding contract.

## Boundary

`@midnight-ntwrk/credential-proofs/authority-evidence` defines injected,
family-neutral ports for authenticated DID method state and trust authorization
evidence. DID method implementation and DID document resolution remain owned by
`midnight-did`. Trust registry data models, governance, roots, and product policy
remain owned by a trust-registry deployment. This repository does not implement
or select either mechanism.

An authority-capable credential profile must select exactly one `did-resolver`
and one `trust-resolver` requirement. The resolved composition must identify the
same exact profile ID/version and bind those requirements to non-empty provider
IDs, versions, and instance IDs. The authority policy also carries the profile's
DID method, issuer relationship, network,
state-version evidence mode, trust scope, and epoch-evidence mode.

## Actor key requirements

A verification binds each of these actor roles independently:

1. `issuer`
2. `holder`
3. `verifier`
4. `status`

Each proof-carried actor requirement contains only a DID, method reference,
SHA-256 public-key fingerprint, required verification relationship, exact DID
state version, and exact trust epoch. Raw public keys, holder witnesses, claim
openings, wallet inventory, and private claims are not accepted by the authority
port.

Authenticated DID evidence must match the selected method, DID, method
reference, key fingerprint, relationship, network, state version, and
version-evidence mode. Its lifecycle state must be `active`. Rotation is
positive when the proof uses the active replacement method/key at the selected
new state version; a proof using the old method after it is marked `rotated`, a
revoked method, or a deactivated DID is invalid.

Authenticated trust evidence must bind the same DID, method reference, key
fingerprint, and network, plus the profile scope and selected epoch. Its
epoch-evidence mode must match the profile and its status must be `active`.
Suspended or withdrawn evidence is invalid.

## Classification

- A returned authenticated mismatch is `invalid/notEvaluated`.
- Missing evidence, an unauthenticated response, or a provider exception is
  `indeterminate/notEvaluated`.
- Only four fully matched DID and trust selections are `valid/approved`.
- Neither invalid nor indeterminate authority can be upgraded by a valid proof
  or permissive family verifier.

Copied DID method references carrying attacker key fingerprints therefore fail:
the method reference may match, but the proof-carried fingerprint cannot match
the authenticated method state and trust authorization simultaneously.

## Canonical transcript and result

`CanonicalAuthorityVerificationTranscriptV1` commits:

- profile identity and DID/trust policy values;
- exact resolved DID/trust provider identities;
- proof, credential, presentation, and presentation-request SHA-256 digests;
- each actor requirement;
- selected DID evidence identity, observation time, state version, relationship,
  and lifecycle/rotation fields; and
- selected trust evidence identity, observation time, scope, epoch, and status.

The transcript uses the package's `canonical-json-v1` encoding and a SHA-256
digest. Provider responses are projected into this fixed record, so unknown
adapter fields cannot enter the transcript. The canonical result exposes
`valid`, `invalid`, or `indeterminate`, an approved/not-evaluated decision,
reason codes, and the transcript digest. It never retains proof bytes, proof
inputs, private holder witnesses, or arbitrary runtime adapter input.

`verifyProofWithAuthorityV1(...)` verifies a family-neutral proof first and
queries authority providers only for a valid proof.
`AuthorityBoundVerifierAgent` in `@midnight-ntwrk/credential-exchange` computes
canonical VC/VP request and presentation digests and then applies the same
authority policy. These adapters consume authority evidence; they do not make a
DID method or registry authoritative merely because it returned data.
