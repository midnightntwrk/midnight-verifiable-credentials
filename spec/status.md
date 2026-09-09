# Status

A status-free credential uses the empty `NoStatusBinding`. A status-bound
credential uses `RegistryBoundStatusBinding`, containing a non-zero registry
identifier, a structurally valid authority verification-method reference, and a
non-zero opaque status-handle commitment. The complete binding is part of the
issuer-signed credential body.

The core validator checks only those structural invariants. It does not prove
that the issuer or status authority approved the registry, that the handle has
a valid opening, or that the credential currently has an accepted status.

Status verification requires:

- binding the evidence to the exact credential and registry;
- authenticating the registry authority;
- selecting an accepted state/root;
- enforcing freshness or trusted time;
- proving the handle opening and requested status statement; and
- failing closed on unavailable or indeterminate required evidence.

Registry deployment, network lookup, caching, transaction submission, and
business policy remain outside the core.

This core defines only the credential-side status binding. It does not provide
status evidence creation or verification, and consumers MUST NOT treat a
binding-only check as proof of current non-revocation.
