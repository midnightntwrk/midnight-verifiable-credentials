# Core

This area owns the protocol-independent VC/VP implementation:

- `model`: generic credential schema and claim metadata with validation
- `compact`: schema-neutral Compact primitives

Core packages do not depend on status registries, runtime adapters, applications,
exchange protocols, or concrete credential implementations.
