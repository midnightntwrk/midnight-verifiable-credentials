# Holder Binding

## Explicit binding

An explicit binding identifies the holder verification method. A presentation
MUST carry the same binding, and its proof key MUST match the bound method. The
binding and proof checks are distinct and both are required.

The Compact binding contains a `holderVerificationMethodRef` with a Midnight
`controllerAddress` and a 32-byte `methodId`. The controller MAY be a DID
contract, registry, or another contract that resolves the referenced method.
Both values MUST be non-zero. A core implementation MUST reject a zero
controller address or zero method ID before comparing the credential and
presentation bindings.

The conformance vectors verify explicit-binding structure and equality only.
Credential-family repositories own end-to-end protocol and negative vectors.

Hidden-holder, pseudonym, and same-holder designs are not provided by this core.
Credential-family repositories that implement them own their threat model,
protocol binding, and negative vectors and MUST NOT silently substitute an
explicit or unbound credential.
