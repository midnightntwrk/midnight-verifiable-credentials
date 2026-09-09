# Core Conformance Data

[`manifest.json`](./manifest.json) maps every retained core operation to its
normative section and vector category. Files under
[`vectors/`](./vectors/) contain deterministic positive and negative fixtures.
[`manifest.sha256`](./manifest.sha256) identifies the exact manifest bytes used
for a conformance claim.

Signer-authorization vectors include fixed known-answer roots, challenges, and
signature scalars so challenge derivation and signature verification cannot
drift together without detection.

Run:

```bash
./run.sh conformance
```

The check intentionally imports only `packages/core/compact` source/generated
surfaces. It must remain independent from protocols, concrete credential
families, use cases, applications, and sibling repositories.
