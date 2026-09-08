# Holder Binding

## Explicit binding

An explicit binding identifies the holder verification method. A presentation
MUST carry the same binding, and its proof key MUST match the bound method. The
binding and proof checks are distinct and both are required.

The Compact binding contains a `holderVerificationMethodRef` with a Midnight
`didContractAddress` and a 32-byte `methodId`. Both values MUST be non-zero. A
core implementation MUST reject a zero contract address or zero method ID
before comparing the credential and presentation bindings.

The conformance vectors verify explicit-binding structure and equality only.
Credential-family repositories own end-to-end protocol and negative vectors.

## Hidden binding

Hidden binding commits to holder-controlled secret material and proves control
without exposing that secret. A conforming design requires domain-separated
commitments, challenge binding, secure randomness, opening consistency,
request binding, unlinkability analysis, and negative vectors.

The package contains experimental secret and blinded-secret composition
primitives, but the core conformance manifest does not claim a complete hidden
holder-binding operation. Credential-family repositories own the threat model,
protocol, and negative vectors required to use those primitives.

A consumer that selects hidden holder binding MUST NOT silently substitute an
explicit or unbound credential.
