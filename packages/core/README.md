# Core

This area owns the protocol-independent VC/VP implementation:

- `model`: configuration, descriptors, codecs, and validation
- `compact`: family-neutral Compact primitives
- `proofs`: proof, authority-evidence, and artifact-manifest ports
- `status`: runtime-neutral credential-status semantics

Core packages do not depend on registry implementations, runtime adapters,
applications, exchange protocols, or concrete credential families.
