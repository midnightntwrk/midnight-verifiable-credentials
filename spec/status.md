# Status

A status-free credential uses the canonical no-status binding. A status-bound
credential binds an issuer-authorized registry reference and opaque status
handle commitment into the issuer-signed credential body.

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
