# Holder Binding

## Explicit binding

An explicit binding identifies the holder verification method. A presentation
MUST carry the same binding, and its proof signer reference MUST match that
method. Binding equality, proof-reference matching, and proof signature
verification are distinct checks and all are required.

The supported Compact composition is
`ExplicitHolderPresentationProof<TDisclosures>::assertValidPresentationProof`.
Callers pass the holder binding from the credential, the complete presentation,
and its proof. The circuit rejects a presentation that substitutes its own
holder binding even when that substituted holder can produce a valid signature.

The Compact binding contains a `holderVerificationMethodRef` with a Midnight
`controllerAddress` and a 32-byte `methodId`. The controller MAY be a DID
contract, registry, or another contract that resolves the referenced method.
Both values MUST be non-zero. A core implementation MUST reject a zero
controller address or zero method ID before comparing the credential and
presentation bindings.

The core does not resolve the verification-method reference or independently
authenticate its mapping to `Proof.publicKey`. A DID adapter, local application,
or authorization source owns that decision. Matching only the method reference
MUST NOT be represented as proof that a DID document currently contains the
proof key.

The conformance vectors verify explicit-binding structure, equality between
credential and presentation bindings, equality between the presentation proof
signer reference and the binding, and the complete explicit-holder proof
composition. Credential-family repositories own family claims, request
freshness, status, and protocol negative vectors.

Hidden-holder, pseudonym, and same-holder designs are not provided by this core.
Credential-family repositories that implement them own their threat model,
protocol binding, and negative vectors and MUST NOT silently substitute an
explicit or unbound credential.
