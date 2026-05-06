# Components

This top-level area is reserved for runtime wiring that composes core VC packages
into usable applications.

Target contents:
- storage adapters
- message bus implementations
- agents
- orchestration logic
- standalone integration harnesses

Components may depend on `core/`, `registry/`, and `protocols/`. Core packages
must not depend on components.
