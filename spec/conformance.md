# Conformance

Conformance is claimed for an exact specification version, implementation
package set and versions, supported configuration set, operation set, and the
SHA-256 digest of the exact manifest bytes recorded in
[`../conformance/manifest.sha256`](../conformance/manifest.sha256). Partial
primitive coverage is not a complete configuration claim. The manifest records
and binds the SHA-256 digest of every conformance vector it references.

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
marked `unsupported` has no conformant callable implementation in this version;
its manifest state and reason are the explicit unsupported outcome. A future
dispatcher that exposes such an operation MUST reject it explicitly. Absence of
an error or silent downgrade is not conformance.

Normative test entrypoints MUST import only the exact retained core surfaces in
the manifest allowlist. Protocol, credential-family, use-case, application, and
sibling-repository source imports are forbidden. Repository package-boundary
checks enforce the transitive dependency direction of retained core packages.

External credential families MAY run the same vectors through released package
versions or immutable prerelease artifacts. They own family-specific schema,
predicate, artifact, and application tests.
