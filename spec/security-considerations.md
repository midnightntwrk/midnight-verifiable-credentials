# Security Considerations

Conforming implementations MUST:

- domain-separate issuance and presentation proofs;
- bind proofs to the exact body, verification method, and supplied proof context;
- reject identity, off-curve, and non-prime-subgroup proof public keys and nonce
  points;
- avoid treating a proof-carried public key as authorized without an independent
  application or authority decision;
- validate schema and credential-family definitions before accepting proof results;
- reject credential, presentation, holder, and status substitution;
- keep holder secrets, claim openings, signing keys, and prover witnesses out of
  public objects and logs;
- fail closed for malformed input and indeterminate required status;
- authenticate generated artifacts by exact version and digest; and
- use negative vectors for every supported capability.

Adapters own durable replay tracking, secure key storage, transport
authentication, rate limiting, and operational availability. Those controls do
not replace canonical core checks.

The manifest covers individual verified primitives. It MUST NOT be represented
as an end-to-end issuance, presentation, or verification security claim.

`Proof.createdAt` and `Proof.challengeHash` are signed inputs, not independently
trusted time or freshness. Applications MUST validate the selected challenge,
audience, replay, and time semantics outside the generic proof circuit.

Signer authorization MUST fail on substituted roles, scopes, verification
methods, public keys, policy commitments, decision sequences, or authority
keys or domains. Signer and authority keys MUST be valid Jubjub prime-subgroup
points. A caller-provided `isTrusted` boolean, descriptor, or timestamp is not
an authority unless it is bound to authenticated consumer state or a verified
authority proof for the intended network and consumer domain.

An authorization-aware issuer or verifier-request check MUST verify both the
proof signature and the accepted descriptor binding. Consumers replacing a
stored descriptor MUST enforce increasing decision sequence and non-decreasing
DID state version; accepting an older signed active descriptor after a newer
suspension or revocation re-enables the signer.
Revocation of an authorization ID is terminal; re-authorization uses a new ID.
