# Core Conformance Data

[`manifest.json`](./manifest.json) maps every retained core operation to its
normative section and vector category. Files under
[`vectors/`](./vectors/) contain deterministic positive and negative fixtures.
[`manifest.sha256`](./manifest.sha256) identifies the exact manifest bytes used
for a conformance claim.

Run:

```bash
./run.sh conformance
```

The check intentionally imports only `packages/core/compact` source/generated
surfaces. It must remain independent from protocols, concrete credential
families, use cases, applications, and sibling repositories.
