# Proof Semantics

## Proof object

The core `Proof` object contains:

- `signerVerificationMethodRef`, the non-zero controller and method identifier
  asserted by the signer;
- `createdAt`, a signed unsigned integer assertion;
- `challengeHash`, a signed 32-byte context value;
- `publicKey`, the Jubjub public key used for verification; and
- `signature`, containing nonce point `r` and scalar `s`.

`createdAt` is not authenticated wall-clock time. `challengeHash` is not
automatically a verifier challenge, freshness guarantee, audience, or replay
barrier. The surrounding application defines and validates those semantics.
The core only ensures that both values are included in the signed payload.

The signer verification-method reference MUST be structurally valid. The proof
public key and signature nonce point MUST be valid, non-identity Jubjub
prime-subgroup points.

## Context separation

The verifier selects one of these 32-byte, zero-padded ASCII context tags:

| Context | Tag |
| --- | --- |
| Credential issuance | `midnight:vc:issuance` |
| Presentation | `midnight:vc:presentation` |
| Signer authorization decision | `midnight:vc:signer-auth:v1` |
| Verifier authorization request | `midnight:vc:verifier-req:v1` |

A proof valid in one context MUST NOT be accepted in another context.

For a body root, context tag, and proof, the payload root is:

```text
persistentHash<Vector<5, Bytes<32>>>([
  bodyRoot,
  contextTag,
  persistentHash<VerificationMethodRef>(signerVerificationMethodRef),
  upgradeFromTransient(transientHash<Uint<64>>(createdAt)),
  challengeHash
])
```

The Schnorr challenge is:

```text
degradeToTransient(persistentHash<Vector<3, Bytes<32>>>([
  payloadRoot,
  upgradeFromTransient(transientHash<JubjubPoint>(publicKey)),
  upgradeFromTransient(transientHash<JubjubPoint>(signature.r))
]))
```

For the Ledger 8 profile, proof producers MUST retry with a fresh nonce point
until the integer challenge is less than the Jubjub subgroup order:

```text
6554484396890773809930967563523245729705921265872317281365359162392183254199
```

This keeps the challenge in the scalar range consumed by Ledger 8 Jubjub
multiplication. Changing the nonce point changes the challenge because
`signature.r` is part of the challenge preimage.

Verification checks the equation:

```text
s * G == r + challenge * publicKey
```

Compact `persistentHash`, `transientHash`, and conversion semantics are defined
by the pinned compiler/runtime pair. JSON serialization is not an equivalent
signing representation.

Presentation verification MUST derive the body root from the complete supplied
presentation, validate the presentation envelope, match the proof signer
reference to the selected holder binding, and verify the presentation-context
proof over that derived root. A caller-supplied root, method-reference match,
or valid signature alone is not an equivalent composition.

## Trust boundary

A valid proof establishes control of the proof public key for the signed body
and context. It does not establish that the method or key is authorized for an
issuer, verifier, holder, registry, or application role.

An implementation that accepts a precomputed credential body root for
composition or caching MUST compare it with the root recomputed from the full
credential before verifying the proof. A valid signature over a different body
root does not authenticate the supplied credential.

An application that does not use a Trust Registry MAY validate an issuer proof
and make its own local trust decision. An application that requires signer
authorization MUST additionally apply the descriptor checks in
[`signer-authorization.md`](./signer-authorization.md). Presentation freshness,
holder binding, status, and application policy remain separate checks.
