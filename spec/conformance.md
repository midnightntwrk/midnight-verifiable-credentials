# Conformance

Conformance is claimed for an exact specification version, package version,
configuration, operation set, and the SHA-256 digest of the exact manifest
bytes recorded in
[`../conformance/manifest.sha256`](../conformance/manifest.sha256). Partial
primitive coverage is not a complete configuration claim.

A supported configuration MUST have:

1. schema/configuration validation vectors;
2. issuer-to-holder-to-verifier positive round trips;
3. canonical TypeScript/Compact encoding or hash vectors;
4. malformed and substitution negative vectors;
5. replay, holder-binding, disclosure, predicate, expiry, and status negatives
   when those capabilities apply; and
6. a clean package consumer using only public exports.

The machine-readable source of current implementation status is
[`../conformance/manifest.json`](../conformance/manifest.json). An operation
marked `unsupported` MUST return or produce an explicit unsupported outcome;
absence of an error is not conformance.

Normative tests MUST import only retained core package surfaces. Protocol,
credential-family, use-case, application, and sibling-repository source imports
are forbidden.

External credential families MAY run the same vectors through released package
versions or immutable prerelease artifacts. They own family-specific schema,
predicate, artifact, and application tests.
