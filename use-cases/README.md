# Use Cases

This top-level area is reserved for concrete sub-projects that demonstrate real
application flows.

Target contents:
- concrete contract/app compositions
- live documentation scenarios
- use-case-specific wiring and explanatory docs

Current subtrees:
- `age-gate/contract`
- `age-gate/scenarios`
- `university`
  - large diploma issuance, job-application, and student-discount blueprint
  - `university/contract` provides the verifier-side contract surface
  - `university/protocol` provides the threaded multi-party reference flow
  - executable Serenity/Cucumber scenarios plus deterministic scenario datasets

BDD scenarios belong here because they document concrete flows rather than low-
level prototype matrices.
