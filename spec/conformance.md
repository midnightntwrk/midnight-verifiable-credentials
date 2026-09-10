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

The manifest binds the complete exported Compact circuit inventory in
[`../conformance/compact-circuits.json`](../conformance/compact-circuits.json).
Every exported circuit MUST be classified as:

- `supported`: a stable semantic operation with a normative section and
  executable conformance vectors;
- `low-level`: a composition primitive that makes no independent semantic
  conformance claim; or
- `implementation-detail`: a compiler-visible unstable helper that consumers
  MUST NOT depend on.

Every published Compact entrypoint MUST expose exactly the classified circuit
set recorded by the inventory. Adding or removing an exported circuit requires
an inventory update. A `supported` circuit without an implemented operation is
invalid.

Normative test entrypoints MUST import only the exact retained core surfaces in
the manifest allowlist. Protocol, credential-family, use-case, application, and
sibling-repository source imports are forbidden. Repository package-boundary
checks enforce the transitive dependency direction of retained core packages.

External credential families MAY run the same vectors through released package
versions or immutable prerelease artifacts. They own family-specific schema,
predicate, artifact, and application tests.
