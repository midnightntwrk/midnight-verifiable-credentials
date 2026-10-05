# Core Conformance Data

[`manifest.json`](./manifest.json) maps every retained core operation to its
normative section and vector category. Files under
[`vectors/`](./vectors/) contain deterministic positive and negative fixtures.
[`manifest.sha256`](./manifest.sha256) identifies the exact manifest bytes used
for a conformance claim.

[`vectors/credential-schema-definition.json`](./vectors/credential-schema-definition.json)
defines the model package's structural validation contract for identifiers,
SemVer, credential types, claims, paths, disclosure modes, and required flags.
It also proves that schema display metadata may be omitted, while
present metadata must be non-empty, trimmed strings. Format version 2 vector
patches replace existing values by default and use
`{ "op": "remove", "path": "..." }` when the absence of an optional property
is significant. The conformance lane executes those vectors against both the
model package's TypeScript source entrypoint and freshly built package output.
The release-package lane independently exercises omitted, valid, and invalid
optional metadata through the same public API from an installed tarball. The
three layers distinguish source semantics, build output, and package-export
regressions.

[`compact-circuits.json`](./compact-circuits.json) inventories every circuit
exported by both published Compact entrypoints. A `supported` circuit maps to a
normative operation and executable vectors. A `low-level` circuit is available
for composition but does not make an independent semantic conformance claim.
An `implementation-detail` circuit would be compiler-visible but unstable;
there are currently no exported circuits in that class. The conformance lane
fails when an entrypoint and this inventory differ.

[`credential-did-midnight-circuits.json`](./credential-did-midnight-circuits.json)
classifies the circuits owned by the optional Midnight DID composition
extension. It binds both published entrypoints: the composition root must expose
exactly the extension circuits, while the standalone root must expose the exact
core-plus-extension union. Its executable vectors cover controller, method,
key, state-version, relationship, holder, proof, and signer-authorization
substitution.

Signer-authorization vectors include fixed known-answer roots, challenges, and
signature scalars so challenge derivation and signature verification cannot
drift together without detection.
The invalid issuer-signature vector also records the low-level boundary: bare
descriptor matching accepts matching method/key metadata, while the composed
`VC<>::assertAuthorizedIssuerProof` circuit rejects the forged signature.

Credential-proof vectors require implementations that accept a precomputed
body root to reject any value other than the canonical root of the supplied
credential.

Credential-presentation, holder-binding, and status-binding vectors reject
schema, claim-root, issuer, holder, proof-signer, registry, authority, and
status-handle substitution at the reusable core boundary. Status vectors cover
only structural binding; they are not current-status evidence.

Envelope and verification-method vectors cover version, claim-root,
expiration-order, controller, and method invariants. Presentation-proof vectors
exercise the shipped explicit-holder composition, recompute the presentation
body root, and reject context, body, credential-to-presentation holder, proof
signer, proof-key, and signature substitution. The fixture delegates to the package
circuit instead of maintaining a second implementation.

The conformance lane also checks the reverse mapping from every normative
Compact operation to at least one supported core or extension circuit. The two
Compact Value codec operations are TypeScript-only and are tested separately.

The conformance lane compiles a concrete generic `VC<>` instantiation and tests
credential-derived issuer authorization. The release-package lane compiles the
same fixture outside the repository against only the installed tarball's public
Compact path. It also executes a small synthetic DID-backed VC/VP composition
from packed public packages with nonempty typed claims, a package identifier
derived from an explicit stable package name, a schema identifier derived from
the validated stable schema ID, separately selected Compact compatibility
version components, resolved
assertion/authentication methods, real Jubjub signatures, and targeted
credential-claim, consumer-defined disclosure relation, body, issuer, holder,
method, proof-key mismatch against the supplied method snapshot, relationship,
context, and signature substitutions. The fixture does not authenticate that
snapshot and is composition evidence rather than a protocol, trust decision, or
product use case.

Run:

```bash
./run.sh conformance
```

The target performs its required workspace build once through
`test:core-conformance` before running the source model vectors and generated
Compact conformance suites.

The check imports only retained package source/generated surfaces. It remains
independent from protocols, concrete credential schemas, use cases,
applications, and sibling repositories.
