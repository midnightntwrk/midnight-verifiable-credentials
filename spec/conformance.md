# Conformance

Conformance is claimed for an exact specification version, implementation
package set and versions, operation set, and the SHA-256 digest of the exact
manifest bytes recorded in
[`../conformance/manifest.sha256`](../conformance/manifest.sha256). The manifest
records and binds the SHA-256 digest of every conformance vector it references.

An implemented operation MUST have:

1. positive vectors;
2. malformed and substitution negative vectors where applicable;
3. a normative section describing its semantics; and
4. a clean package consumer using only public exports.

The machine-readable source of current implementation coverage is
[`../conformance/manifest.json`](../conformance/manifest.json). It lists only
operations with callable implementation and vectors. Future protocol work is
not recorded as an unsupported pseudo-surface.

Normative test entrypoints MUST import only the exact retained core surfaces in
the manifest allowlist. Protocol, credential-family, use-case, application, and
sibling-repository source imports are forbidden. Repository package-boundary
checks enforce the transitive dependency direction of retained core packages.

External credential families MAY run the same vectors through released package
versions or immutable prerelease artifacts. They own family-specific schema,
predicate, artifact, and application tests.
