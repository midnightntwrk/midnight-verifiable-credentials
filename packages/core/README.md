# Core

This area owns the protocol-independent VC/VP implementation:

- `model`: generic family and claim-schema metadata with validation
- `compact`: family-neutral Compact primitives

Core packages do not depend on status registries, runtime adapters, applications,
exchange protocols, or concrete credential families.
