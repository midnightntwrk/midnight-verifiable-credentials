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
  - `university/reporting` provides a one-page summary over BDD, transcript,
    stress, and batch-sweep artifacts
  - executable Serenity/Cucumber scenarios plus deterministic scenario datasets
- `status-openid/evidence`
  - independent synthetic contractor-access composition
  - status-enabled OID4VCI/OID4VP Final with DCQL and an atomic Verification V1 decision
  - explicit production-shaped-only and local-conformance-only evidence boundary

BDD scenarios belong here because they document concrete flows rather than low-
level prototype matrices.


## Production-shaped does not mean production-approved

Use-case placement records composition evidence and living documentation. It
does not itself graduate a credential family or approve deployment. Use the
[ownership policy](../../docs/architecture/credential-family-ownership-policy.md)
for the required security, API/schema, interoperability, test/CI, operational,
and explicit-approval gates.
