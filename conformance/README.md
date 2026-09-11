# Core Conformance Data

[`manifest.json`](./manifest.json) maps every retained core operation to its
normative section and vector category. Files under
[`vectors/`](./vectors/) contain deterministic positive and negative fixtures.
[`manifest.sha256`](./manifest.sha256) identifies the exact manifest bytes used
for a conformance claim.

[`compact-circuits.json`](./compact-circuits.json) inventories every circuit
exported by both published Compact entrypoints. A `supported` circuit maps to a
normative operation and executable vectors. A `low-level` circuit is available
for composition but does not make an independent semantic conformance claim.
An `implementation-detail` circuit would be compiler-visible but unstable;
there are currently no exported circuits in that class. The conformance lane
fails when an entrypoint and this inventory differ.

Signer-authorization vectors include fixed known-answer roots, challenges, and
signature scalars so challenge derivation and signature verification cannot
drift together without detection.

Credential-proof vectors require implementations that accept a precomputed
body root to reject any value other than the canonical root of the supplied
credential.

Credential-presentation, holder-binding, and status-binding vectors reject
schema, claim-root, issuer, holder, proof-signer, registry, authority, and
status-handle substitution at the reusable core boundary. Status vectors cover
only structural binding; they are not current-status evidence.

Envelope and verification-method vectors cover version, claim-root,
expiration-order, controller, and method invariants. Presentation-proof vectors
recompute the presentation body root and reject context, body, holder, and
signature substitution.

The conformance lane compiles a concrete generic `VC<>` instantiation and tests
credential-derived issuer authorization. The release-package lane compiles the
same fixture outside the repository against only the installed tarball's public
Compact path.

Run:

```bash
./run.sh conformance
```

The check intentionally imports only `packages/core/compact` source/generated
surfaces. It must remain independent from protocols, concrete credential
families, use cases, applications, and sibling repositories.
