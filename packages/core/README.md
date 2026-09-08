# Core

This area owns the protocol-independent VC/VP implementation:

- `model`: family definitions, descriptors, codecs, and validation
- `compact`: family-neutral Compact primitives

Core packages do not depend on status registries, runtime adapters, applications,
exchange protocols, or concrete credential families.
