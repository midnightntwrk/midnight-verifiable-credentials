# Documentation Index

## Specification

- normative draft:
  - [`spec/midnight-credentials.md`](./spec/midnight-credentials.md)
  - for implementers and reviewers of the core VC model
- profiles:
  - [`spec/profiles.md`](./spec/profiles.md)
  - for readers who need the current holder-binding/profile taxonomy
- conformance:
  - [`spec/conformance.md`](./spec/conformance.md)
  - for readers defining implementation or review criteria
- credential status:
  - [`spec/credential-status.md`](./spec/credential-status.md)
  - for readers defining revocation, freshness, and non-revocation claim boundaries
- revocation registry:
  - [`spec/revocation-registry.md`](./spec/revocation-registry.md)
  - for readers implementing the prototype Midnight-native revoked-set non-membership model
- status verification protocol:
  - [`spec/status-verification-protocol.md`](./spec/status-verification-protocol.md)
  - for readers implementing verifier-supplied roots and Layer 3 status-aware verification
- hidden-holder interoperability:
  - [`spec/hidden-holder-interoperability.md`](./spec/hidden-holder-interoperability.md)
  - for readers defining transport and adapter obligations for hidden-holder flows

## Guides

- companion explainer:
  - [`guides/midnight-credentials-for-dummies.md`](./guides/midnight-credentials-for-dummies.md)
  - for readers new to Midnight VC concepts
- package selection:
  - [`guides/package-selection.md`](./guides/package-selection.md)
  - for engineers choosing the right workspace package or layer
- integration surface map:
  - [`guides/integration-surface-map.md`](./guides/integration-surface-map.md)
  - for integrators deciding which surfaces belong on-chain, off-chain, or both
- hidden-holder hello world:
  - [`guides/hidden-holder-hello-world.md`](./guides/hidden-holder-hello-world.md)
  - for engineers who need the shortest current reference hidden-holder integration path
- starter templates:
  - [`templates/verifier-contract-template.compact.md`](./templates/verifier-contract-template.compact.md)
  - [`templates/family-scaffold-template.md`](./templates/family-scaffold-template.md)
  - for copyable contract and family starting points
- current status-registry package surface:
  - [`../credentials-status-registry/README.md`](../credentials-status-registry/README.md)
  - for engineers implementing the current prototype revocation/status registry package

## Architecture

- overview:
  - [`architecture/overview.md`](./architecture/overview.md)
  - for readers orienting themselves in the repository layer model
- package boundaries:
  - [`architecture/package-boundaries.md`](./architecture/package-boundaries.md)
  - for package authors deciding where new VC, DID-aware, protocol, or demo logic belongs
- dependency composition:
  - [`architecture/dependency-composition.md`](./architecture/dependency-composition.md)
  - for package and contract authors composing capability layers

## Testing

- strategy:
  - [`testing/test-strategy.md`](./testing/test-strategy.md)
  - for test-scope and validation design
- matrix:
  - [`testing/test-matrix.md`](./testing/test-matrix.md)
  - for the currently implemented test surface
- Serenity BDD layer plan:
  - [`plans/serenity-bdd-layer.md`](./plans/serenity-bdd-layer.md)
  - for the living-documentation scenario layer and rollout plan

## Decisions and plans

- AnonCreds comparison:
  - [`decisions/anoncreds-comparison.md`](./decisions/anoncreds-comparison.md)
  - for positioning and design tradeoff context
- holder-binding roadmap / extension plan:
  - [`plans/holder-binding-extension-plan.md`](./plans/holder-binding-extension-plan.md)
  - for roadmap and extension context
- blinded-secret transport hardening plan:
  - [`plans/blinded-secret-transport-hardening.md`](./plans/blinded-secret-transport-hardening.md)
  - for the next production-readiness hardening phase of blinded-secret issuance
- hidden-holder production contract:
  - [`plans/hidden-holder-production-contract.md`](./plans/hidden-holder-production-contract.md)
  - for separating plain secret-holder claims from blinded-secret transport/session claims
- revocation capability options:
  - [`plans/revocation-capability-options.md`](./plans/revocation-capability-options.md)
  - for choosing the first Midnight-native status/revocation implementation path
- VC maturity backlog:
  - [`plans/vc-maturity-backlog.md`](./plans/vc-maturity-backlog.md)
  - for the current repository-audit backlog and gap-tracking work
- Serenity BDD layer plan:
  - [`plans/serenity-bdd-layer.md`](./plans/serenity-bdd-layer.md)
  - for the living-documentation test layer and its first rollout slice
