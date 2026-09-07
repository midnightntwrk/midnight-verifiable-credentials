# Core Conformance Data

[`manifest.json`](./manifest.json) maps every retained core operation to its
normative section, implementation state, and vector category. Files under
[`vectors/`](./vectors/) contain deterministic positive and negative fixtures.

Run:

```bash
./run.sh conformance
```

The check intentionally imports only `packages/core/compact` source/generated
surfaces. It must remain independent from protocols, concrete credential
families, use cases, applications, and sibling repositories.
