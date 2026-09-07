# Holder Binding

## Explicit binding

An explicit binding identifies the holder verification method. A presentation
MUST carry the same binding, and its proof key MUST match the bound method. The
binding and proof checks are distinct and both are required.

Explicit binding primitives are verified for non-status Midnight-contract
configurations. A full ceremony claim still requires issuance, presentation,
and negative round-trip vectors.

## Hidden binding

Hidden binding commits to holder-controlled secret material and proves control
without exposing that secret. A conforming design requires domain-separated
commitments, challenge binding, secure randomness, opening consistency,
request binding, unlinkability analysis, and negative vectors.

Hidden and blinded-secret holder binding are currently unsupported for a
production conformance claim. Existing experimental circuits MUST NOT be
advertised as completing those requirements.

An implementation MUST NOT downgrade hidden binding to explicit or unbound
credentials when the requested capability is unsupported.

