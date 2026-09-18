# Midnight DID Binding

## Purpose

The Midnight DID binding maps a resolved, subject-owned native Jubjub
verification method into the protocol-independent VC/VP structures. It is an
optional extension: the core VC/VP primitives remain usable with another
verification-method source.

The binding does not define DID creation or mutation, signing, trust policy,
credential exchange, or a transport protocol.

## Resolution profile

An implementation MUST resolve an on-chain `did:midnight` through a resolver
compatible with `@midnight-ntwrk/midnight-did` `0.6.0`. It MUST reject:

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

Jubjub JWK `x` and `y` coordinates are 32-byte base64url values in the encoding
defined by Midnight DID. The binding MUST decode those bytes as little-endian
field integers for Compact's `JubjubPoint` representation.

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
