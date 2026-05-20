# Documentation Index

## Specification

- normative draft:
  - [`spec/midnight-credentials.md`](./spec/midnight-credentials.md)
  - for implementers and reviewers of the core VC model
- profiles:
  - [`spec/profiles.md`](./spec/profiles.md)
  - for readers who need the current holder-binding/profile taxonomy
- claim representation:
  - [`spec/claim-representation.md`](./spec/claim-representation.md)
  - for readers deciding when a claim should be public/direct,
    selectively disclosed, committed-private, or predicate-only
- conformance:
  - [`spec/conformance.md`](./spec/conformance.md)
  - for readers defining implementation or review criteria
- credential status:
  - [`spec/credential-status.md`](./spec/credential-status.md)
  - for readers defining revocation, freshness, and non-revocation claim boundaries
- status error taxonomy:
  - [`spec/status-error-taxonomy.md`](./spec/status-error-taxonomy.md)
  - for readers defining fail-closed status invalidity outcomes across VC/VP and Layer 3 verification
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
- VC surface change discipline:
  - [`guides/vc-surface-change-discipline.md`](./guides/vc-surface-change-discipline.md)
  - for contributors changing Compact-generated types, credential literals,
    package exports, or claim-representation surfaces
- hidden-holder hello world:
  - [`guides/hidden-holder-hello-world.md`](./guides/hidden-holder-hello-world.md)
  - for engineers who need the shortest current reference hidden-holder integration path
- protocol production checklist:
  - [`guides/credentials-protocol-production-checklist.md`](./guides/credentials-protocol-production-checklist.md)
  - for integrators hardening the reference orchestration layer for real deployments
- protocol reference path:
  - [`guides/credentials-protocol-reference-path.md`](./guides/credentials-protocol-reference-path.md)
  - for engineers who need the current checked-in Node/file-backed orchestration path
- prototype execution ladder:
  - [`guides/prototype-execution-ladder.md`](./guides/prototype-execution-ladder.md)
  - for engineers who want the current runnable path from hello-verifier through BDD and revocation lanes
- DID + VC hello smoke path:
  - [`guides/did-vc-hello-smoke-path.md`](./guides/did-vc-hello-smoke-path.md)
  - for engineers who need the smallest checked-in DID bootstrap to VC verification handoff
- dummy-claims verifier lab:
  - [`guides/dummy-claims-verifier-lab.md`](./guides/dummy-claims-verifier-lab.md)
  - for engineers exercising the broad direct Compact claim surface against a verifier contract
- university diploma use case:
  - [`../packages/use-cases/university/README.md`](../packages/use-cases/university/README.md)
  - [`../packages/use-cases/university/operator-guide.md`](../packages/use-cases/university/operator-guide.md)
  - [`../packages/use-cases/university/contract/README.md`](../packages/use-cases/university/contract/README.md)
  - [`../packages/use-cases/university/protocol/README.md`](../packages/use-cases/university/protocol/README.md)
  - for engineers who need the large DID-backed issuance, job-application, and student-discount blueprint plus the local run/report playbook
- university diploma executable BDD scenarios:
  - [`../packages/use-cases/university/scenarios/README.md`](../packages/use-cases/university/scenarios/README.md)
  - for engineers who need a checked-in virtual-agent orchestration pack with metrics
- university diploma threaded protocol flow:
  - [`../packages/use-cases/university/protocol/README.md`](../packages/use-cases/university/protocol/README.md)
  - for engineers who need the same use case expressed as explicit request/result message threads
- university diploma compact reporting surface:
  - [`../packages/use-cases/university/reporting/README.md`](../packages/use-cases/university/reporting/README.md)
  - for engineers who need a one-page JSON/Markdown summary over the university artifact set
- starter templates:
  - [`templates/verifier-contract-template.compact.md`](./templates/verifier-contract-template.compact.md)
  - [`templates/family-scaffold-template.md`](./templates/family-scaffold-template.md)
  - for copyable contract and family starting points
- current status-registry package surface:
  - [`../packages/registry/status-registry/README.md`](../packages/registry/status-registry/README.md)
  - for engineers implementing the current prototype revocation/status registry package
- current smallest starter family package surface:
  - [`../packages/prototypes/credential-families/hello-family/README.md`](../packages/prototypes/credential-families/hello-family/README.md)
  - for engineers who need the smallest compileable starter family package
- broad direct claim-surface laboratory:
  - [`../packages/prototypes/credential-families/dummy-claims/README.md`](../packages/prototypes/credential-families/dummy-claims/README.md)
  - for engineers who need the widest currently supported direct Compact claim surface in one family package
- mixed public/private claim-representation laboratory:
  - [`../packages/prototypes/credential-families/mixed-claims/README.md`](../packages/prototypes/credential-families/mixed-claims/README.md)
  - for engineers who need explicit public claims plus committed private claims in one family package
- academic diploma family prototype:
  - [`../packages/prototypes/credential-families/university-diploma/README.md`](../packages/prototypes/credential-families/university-diploma/README.md)
  - for engineers who need a larger explicit-holder family with non-revocable issuance and verifier-side grade policies

## Architecture

- overview:
  - [`architecture/overview.md`](./architecture/overview.md)
  - for readers orienting themselves in the repository layer model
- package boundaries:
  - [`architecture/package-boundaries.md`](./architecture/package-boundaries.md)
  - for package authors deciding where new VC, DID-aware, protocol, or demo logic belongs
- repository restructure RFC:
  - [`architecture/repository-restructure-rfc.md`](./architecture/repository-restructure-rfc.md)
  - for the proposed target top-level repository model and migration phases
- package tier inventory:
  - [`architecture/package-tier-inventory.md`](./architecture/package-tier-inventory.md)
  - for integrators and architects classifying reusable core, prototype, and wiring packages
- protocol classification:
  - [`architecture/protocol-classification.md`](./architecture/protocol-classification.md)
  - for separating reusable core protocols from Layer 3 / Layer 4 wiring
- restructure execution plan:
  - [`architecture/restructure-execution-plan.md`](./architecture/restructure-execution-plan.md)
  - for the phased migration from legacy workspace paths to the target top-level architecture
- dependency composition:
  - [`architecture/dependency-composition.md`](./architecture/dependency-composition.md)
  - for package and contract authors composing capability layers
- CI build cones:
  - [`architecture/ci-build-cones.md`](./architecture/ci-build-cones.md)
  - for the shared-build cache and artifact topology used by CI
- workspace package-manifest discipline:
  - [`architecture/workspace-package-manifest-discipline.md`](./architecture/workspace-package-manifest-discipline.md)
  - for contributors adding or changing package entrypoints, export maps,
    tarball `files` manifests, or scenario/source-only workspace metadata
- Compact source conventions, purity, and commitment research:
  - [`architecture/compact-source-conventions-and-purity-research.md`](./architecture/compact-source-conventions-and-purity-research.md)
  - for the current comment-style, pure-circuit, and commitment-standardization research cut
- status-contract closeout boundary:
  - [`architecture/status-contract-closeout-boundary.md`](./architecture/status-contract-closeout-boundary.md)
  - for the final repository-owned `VC-MAT-20` delivery boundary versus the remaining upstream Compact blocker

## Testing

- strategy:
  - [`testing/test-strategy.md`](./testing/test-strategy.md)
  - for test-scope and validation design
- matrix:
  - [`testing/test-matrix.md`](./testing/test-matrix.md)
  - for the currently implemented test surface
- markdown link validation:
  - root `npm run docs:links`
  - for the checked-in relative-link fast path used by docs-only CI

## Decisions and plans

- AnonCreds comparison:
  - [`decisions/anoncreds-comparison.md`](./decisions/anoncreds-comparison.md)
  - for positioning and design tradeoff context
- holder-binding roadmap / extension plan:
  - [`plans/holder-binding-extension-plan.md`](./plans/holder-binding-extension-plan.md)
  - for roadmap and extension context
- holder-binding terminology:
  - [`architecture/holder-binding-terminology.md`](./architecture/holder-binding-terminology.md)
  - for canonical profile names, compatibility aliases, and release-discipline
    guardrails
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
  - for maturity status snapshots and historical capability /
    release-discipline gap tracking
- repository audit backlog:
  - [`plans/repository-audit-backlog.md`](./plans/repository-audit-backlog.md)
  - for repo-wide simplification findings, package/docs drift, and
    developer-experience follow-up queues
- VC maturity and university closeout wave:
  - [`plans/vc-maturity-university-wave-2026-05-15.md`](./plans/vc-maturity-university-wave-2026-05-15.md)
  - for the active 20-iteration execution plan targeting `develop`
- Serenity/JS BDD layer plan:
  - [`plans/serenity-js-bdd-layer.md`](./plans/serenity-js-bdd-layer.md)
  - for the TypeScript screenplay-style living-documentation test layer
