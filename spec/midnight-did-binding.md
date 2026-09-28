# Midnight DID Binding

## Purpose

The Midnight DID binding maps a resolved, subject-owned native Jubjub
verification method into the protocol-independent VC/VP structures. It is an
optional extension: the core VC/VP primitives remain usable with another
verification-method source.

The binding does not define DID creation or mutation, key custody, trust
policy, credential exchange, or a transport protocol. It reuses the core proof
semantics without defining a second signature scheme or challenge domain.

## Resolution profile

Except for the authenticated historical-snapshot migration defined under
[Canonical mapping](#canonical-mapping), an implementation MUST resolve an
on-chain `did:midnight` through a resolver compatible with
`@midnight-ntwrk/midnight-did` `0.7.0`. The live-resolution path MUST reject:

- an unresolved or deactivated DID;
- a DID document whose subject differs from the requested DID;
- an off-chain Midnight DID, because it has no Compact contract address;
- a verification method not controlled by the DID subject;
- a method absent from the requested verification relationship;
- a non-`JsonWebKey` method;
- a key other than native `EC`/`Jubjub`; and
- a missing, zero, non-decimal, or greater-than-`uint64` DID `versionId`.

The supported relationships are `assertionMethod`, `authentication`, and
`capabilityInvocation`. Issuer authorization requires `assertionMethod`.
Holder binding requires `authentication`. Verifier authorization requires
`authentication` or `capabilityInvocation`.

## Canonical mapping

`VerificationMethodRef.controllerAddress` MUST contain the exact 32-byte
contract address encoded by the DID subject.

The verification method MUST be a fragment of that subject. After applying the
Midnight DID package's subject-binding and reference normalization rules,
`VerificationMethodRef.methodId` MUST be:

```text
SHA-256(UTF-8(canonical fragment))
```

The hash input includes the leading `#` and remains case-sensitive. For
example, `#key-1` and `#Key-1` are different methods.

Jubjub JWK `x` and `y` coordinates MUST use the Midnight DID 0.7 profile:
canonical unpadded base64url of exactly 32 unsigned big-endian bytes, with each
decoded integer below the Jubjub base-field modulus. The binding MUST use the
public `decodeJubjubJwkCoordinate` codec from
`@midnight-ntwrk/midnight-did-domain`.

Midnight DID 0.6 used fixed-width little-endian coordinate bytes. Persisted 0.6
DID-document snapshots MUST NOT be supplied directly to the 0.7 binding.
Consumers MUST either re-resolve the DID through a 0.7-compatible resolver or
perform an explicit migration whose authenticated provenance establishes the
snapshot's DID, verification method, relationship, positive observed
`versionId`, and 0.6 encoding profile. That migration MUST decode the known 0.6
little-endian coordinates and re-encode the same native point in the canonical
0.7 profile while preserving the authenticated binding fields. The binding
MUST NOT guess the profile by trying both byte orders. Resolver `versionId`
describes ledger state and MUST NOT be used as an encoding-version
discriminator. Some 0.6 byte strings are also valid 0.7 coordinate encodings
and will silently map to a different native point, so range validation alone is
not a migration detector.

After successful re-resolution or migration, consumers MUST discard or
quarantine the old snapshot. Outside the authenticated, version-specific
migration defined above, reinterpretation or byte reversal is forbidden. A
migration MUST use the known 0.6 profile directly and MUST NOT trial both byte
orders. An offline migration reconstructs an authenticated historical binding;
it does not prove that the DID remains active or that the method is current.
The migration provenance MUST authenticate that the DID was not deactivated at
the observed historical state. The migrated snapshot MUST still satisfy the
on-chain subject, subject match, subject-owned method, relationship membership,
`JsonWebKey`, native `EC`/`Jubjub`, and positive `uint64` `versionId`
requirements above. A consumer MUST expose the canonical migrated snapshot
through a `MidnightDIDResolutionSource` and MUST invoke
`resolveMidnightDIDMethodBinding`; it MUST NOT construct a
`MidnightDIDMethodBinding` directly. This preserves the adapter's subject,
controller, relationship-membership, key-profile, state-version, and canonical
method-ID checks.
Consumers MUST apply the Ledger 8 snapshot trust boundary below before relying
on that binding for authorization.

`didStateVersion` MUST equal the positive resolver `versionId` observed for the
document used to create the binding. It is a logical ledger state version, not
a timestamp.

## Compact extension

`MidnightDIDMethodBinding` contains the canonical verification-method
reference, native Jubjub key, observed DID state version, and verification
relationship. Its root is the canonical Compact persistent hash of the complete
structure.

The extension circuits MUST reject any substitution of the controller, method
ID, key, state version, or relationship when binding a proof, explicit holder,
or authorized signer descriptor.

The binding circuits establish reference and key equality only. They do not
verify a signature or authenticate a credential, presentation, authorization
decision, or verifier request. A consumer MUST also invoke the matching core
context proof circuit over a body root derived from the complete input:

- cryptographic-only issuance proof validation uses
  `VC<>::assertValidCredentialProof`; authorization-aware issuance MUST use
  `VC<>::assertAuthorizedIssuerProof` unless equivalent authorization is
  enforced independently;
- presentation validates the complete presentation envelope, matches its
  holder binding, derives `VP<>::presentationBodyRoot`, and invokes
  `assertValidPresentationContextProof`; and
- authority and verifier decisions use
  `assertValidSignerAuthorizationProof` and
  `assertAuthorizedVerifierProof`, respectively.

Calling `assertMidnightDIDProofMatchesMethod`,
`assertMidnightDIDHolderBinding`, or
`assertMidnightDIDSignerAuthorization` alone MUST NOT be represented as proof
of possession or an authenticated VC/VP decision.

An implementation MAY provide software signing helpers for the issuance and
presentation contexts. Such a helper MUST derive the challenge with the
matching core challenge circuit, MUST require the signing public key to equal
the resolved method binding, and MUST use a fresh nonzero nonce. It MUST return
a proof accepted by both the matching core context verifier and the Midnight
DID method-binding circuit. Its body root MUST be derived from the complete VC
or VP with the matching core circuit. The Midnight DID contract payload-signing
challenge is not an equivalent VC/VP challenge.

A software helper that accepts raw key material MUST derive its nonce from the
secret, operation domain, complete signed inputs, and fresh cryptographic
entropy. A wallet or hardware-backed implementation SHOULD retain the scalar
inside its signing boundary and perform the same nonce/challenge/response flow.

The standalone Compact entrypoint includes the VC core. The composition
entrypoint contains only Midnight DID-owned declarations and requires a
consumer to include the VC core composition root exactly once before it.

## Ledger 8 trust boundary

The binding establishes consistency between resolved off-chain input and values
used by a consumer contract. On Ledger 8, the circuit cannot call the DID
contract and therefore cannot independently establish that the supplied state
is current.

A consumer that makes a trust decision MUST either pin an accepted method
binding root through its own governance path or verify an authority-signed
`AuthorizedSignerDescriptor`. A caller-supplied binding that is merely
structurally valid MUST NOT be represented as current DID or trust-registry
evidence.

This version targets Compact `0.31.1`, runtime `0.16.0`, and Ledger `8.0.2`.
Ledger 9 cross-contract validation is outside this version.
