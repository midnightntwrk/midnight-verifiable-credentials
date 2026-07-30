# Registry

This top-level area is reserved for reusable VC registry packages that can later
be extracted for broader Midnight ecosystem reuse.

Migration status:
- reusable registry workspaces live under `packages/registry/`

Target contents:
- status / revocation registries
- other reusable registry-style VC support packages

Registry packages may depend on `packages/core/`, but must not depend on `packages/prototypes/` or
`packages/use-cases/`.
