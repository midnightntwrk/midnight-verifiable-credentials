# Credential-family ownership and graduation policy

- **Status:** accepted governance for issues [#374](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/374) and [#378](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/378)
- **Scope:** repository/package policy, documentation, catalog checks, and a narrow dependency guard
- **Non-goal:** no package move, import rewrite, production graduation, generated-key commit, or implementation of #375/#376/#377

This policy makes the existing `packages/prototypes/credential-families/` layout
an ownership boundary, not a cosmetic directory convention. The catalog and
boundary check enforce the dependency direction described here.

## Ownership boundary

| Area | Owns | May depend on | Must not become |
| --- | --- | --- | --- |
| `packages/core/` | family-neutral VC/VP models, Compact primitives, reusable capabilities | core | a family, product, transport, or deployment package |
| `packages/registry/` | reusable registry/status capability | core | a product-specific authority or family implementation |
| `packages/protocols/` | protocol/interoperability bindings | core and registry | family agents or application orchestration |
| `packages/components/` | reusable runtime adapters and wiring | core, registry, protocols | a hidden product composition |
| `packages/prototypes/credential-families/` | concrete claim/disclosure/predicate families and family-specific tests as private evidence | reusable layers; an integration dependency only when the prototype explicitly tests it | a supported release or production assertion |
| `packages/use-cases/` | production-shaped contract/app composition, scenarios, and flow documentation | lower layers and prototype evidence where needed for the current migration | proof that the composed product is production-ready by path alone |

Reusable core must remain family-agnostic: no core workspace dependency or source
import may point at a concrete family, prototype, use case, BDD package, or
standalone integration. Prototype families retain their own unit/contract tests
and remain private evidence. A use-case path means “composition evidence,” not
“approved production product.”

The repository-local guard is intentionally narrow. It checks workspace
manifest edges and keeps the existing protocol-agent test harness as a closed,
explicit migration exception. That exception is not a precedent for new
components: its exact edge list is recorded in
`tooling/scripts/check-package-boundaries.mjs` and any drift fails the check.
The existing harness is therefore visible technical debt, not silently accepted
architecture.

## ADR-0002/ADR-0003 reconciliation

| Decision | Retained | Superseded or clarified | Conflict/rationale | Migration reference |
| --- | --- | --- | --- | --- |
| ADR-0002 contract composition | Families remain pure compile-time claim/proof libraries; deployable roles are separate compositions; authority checks remain explicit | “A family may be composed” is clarified to mean evidence/use-case composition, not repository production approval | Directory placement and composition evidence cannot grant deployment or support status | Keep family code in prototypes; move production-shaped flow evidence to use cases only after graduation gates |
| ADR-0003 artifact ownership | Final complete deployable compositions own immutable manifests, exact digests, provenance, and deployment binding | Package-local/generated family artifacts are not an implicit release bundle | The pending ~758 MB storage proposal has no approval in this phase; large mutable blobs and secrets would violate reproducibility/security | #376 decides storage; #377 decides CI restore/regeneration/drift behavior; neither is implemented here |
| ADR-0002 ↔ ADR-0003 boundary | Contract role, family schema, artifact manifest, and deployment manifest remain distinct identifiers | “Artifact” is not shorthand for a family package or a deployment credential | Keeping these identities separate avoids coupling prototype evidence to deployment authority | Future product PRs must link family, composition, manifest, and deployment evidence |

## Current family inventory and dependants

The following inventory is the baseline on `origin/develop`. “Dependants” means
current workspace package dependants, not arbitrary textual references. Every
family remains private (`releaseStage: internal`) and has family-local tests.

| Family | Current workspace | Family tests | Current workspace dependants | Migration posture |
| --- | --- | --- | --- | --- |
| Birth | `packages/prototypes/credential-families/birth` | package `test:ci` / `src/test` | protocol orchestration; age-gate contract; age-gate scenarios | retain as prototype evidence; reduce or graduate only after gates |
| Birth-secret | `packages/prototypes/credential-families/birth-secret` | package `test:ci` / `src/test` | protocol orchestration; age-gate contract | retain as hidden-holder prototype evidence |
| Hello family | `packages/prototypes/credential-families/hello-family` | package `test:ci` / `src/test` | hello-verifier contract | retain as starter capability evidence |
| Dummy claims | `packages/prototypes/credential-families/dummy-claims` | package `test:ci` / `src/test` | hello-verifier contract | retain as direct-claims laboratory |
| Mixed claims | `packages/prototypes/credential-families/mixed-claims` | package `test:ci` / `src/test` | none currently | retain as claim-representation laboratory |
| University diploma | `packages/prototypes/credential-families/university-diploma` | package `test:ci` / `src/test` | university contract; university protocol; university scenarios | retain as use-case evidence; no product approval |
| Digital passport | `packages/prototypes/credential-families/digital-passport` | package `test:ci` / `src/test` | none currently; OpenID is a prototype integration dependency | frozen migration evidence for the independent digital-passport repository |

The root `package.json`, `pnpm-workspace.yaml`, and
`tooling/scripts/workspace-catalog.mjs` must list the same workspace set. The
catalog check also requires prototypes and use cases to remain private and
non-publishable. A family-specific package may be consumed by a use case for
regression evidence, but reusable core and reusable protocol surfaces may not
reverse-depend on it.

## Graduation gates

A family is not graduated by moving a directory or changing a catalog label.
Before a production-shaped composition is treated as a product candidate, all
of the following evidence must exist in the product owner’s review record:

1. **Security:** threat model, abuse cases, key custody, privacy, and security
   review with recorded findings and remediation.
2. **API/schema stability:** versioned family schema and public API, migration
   policy, compatibility window, and an accountable technical owner.
3. **Interoperability:** required profile and external-consumer/conformance
   evidence against the supported ecosystem integrations.
4. **Test and CI coverage:** family-local tests, negative cases, reproducible
   build inputs, and required CI lanes with current artifacts or deterministic
   rebuild instructions.
5. **Operational ownership:** support/on-call owner, release train, incident and
   deprecation policy, deployment responsibility, and lifecycle documentation.
6. **Explicit approval:** product, security, and repository maintainers approve
   the graduation in a linked review/ADR; path placement alone is never
   approval.

Digital passport remains a readiness candidate with independent ownership and
must not be declared production-ready by this repository. The family may be
reduced to compatibility/conformance evidence here once the independent
consumer proves the boundary.

## Incremental migration map

| Surface | This phase | Later bounded work |
| --- | --- | --- |
| Existing prototype families | inventory, ownership headers/docs, private catalog policy | reduce to fixtures, extract reusable seams, or hand off to independent product repositories |
| Family-coupled protocol orchestration | record closed migration exception and prevent drift | invert behind family-neutral ports, then relocate composition to a use case |
| Core/package graph | enforce no core → family/use-case edges | extract additional family-neutral packages only with independent consumer evidence |
| ADRs and catalog | reconcile ADR-0002/0003 and link this policy | update each implementation slice with its concrete migration result |
| Generated artifacts | document provenance/digest/restore policy; do not add the pending large bundle | #376 artifact decision and #377 CI/regeneration work are separate follow-ups |

Issue #15 remains the earlier prototype-reconciliation context; this policy
implements the current ownership/lifecycle boundary without duplicating that
issue’s work.

## Artifact and secret governance

ADR-0003 remains the artifact authority: pure family packages do not own final
prover/verifier/ZKIR bundles; a complete deployable composition owns an
immutable, digest-addressed manifest. The reported approximately 758 MB
artifact-storage decision is intentionally not approved by this phase. #376 is
the separate artifact-storage follow-up and #377 is the separate CI,
regeneration, restore, and drift-validation follow-up.

Never commit signing secrets, controller/private keys, deployment credentials,
seed material, or equivalent operational secrets. Any future fixture must use
synthetic or explicitly non-secret deterministic inputs, record provenance and
cryptographic digests, and fail closed on digest mismatch. Normal PR validation
must restore or verify approved artifacts without silently generating or
committing secrets; scheduled/manual regeneration and fallback rebuild remain
follow-up implementation work.

## Validation

Run the focused policy gates from a clean worktree:

```sh
pnpm run check:workspace-catalog
pnpm run check:package-boundaries
pnpm run test:workspace-boundary-policy
```

The full repository gate remains `npm run verify`/the repository’s configured
`pnpm` equivalent. This documentation/policy phase does not claim that a full
artifact or deployment lane was run.
