# Registry

This top-level area is reserved for reusable VC registry packages that can later
be extracted for broader Midnight ecosystem reuse.

Migration status:
- package moves into `registry/` are pending follow-up restructuring phases

Target contents:
- status / revocation registries
- other reusable registry-style VC support packages

Registry packages may depend on `core/`, but must not depend on `prototypes/` or
`use-cases/`.
