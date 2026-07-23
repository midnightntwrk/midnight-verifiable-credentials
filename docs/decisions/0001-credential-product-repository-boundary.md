# ADR-0001: Credential product repository boundary

- Status: Superseded by ADR-0013
- Date: 2026-07-15
- Owners: VC maintainers and credential product owners
- Supersedes: none

This record is retained for history. ADR-0013 establishes the stricter rule
that this repository publishes reusable schema-neutral packages only and keeps
concrete credential types solely as private, time-bounded evidence before
graduation, fixture reduction, or removal.

## Context

A concrete credential such as a digital passport needs more than a claim
schema. It can include Compact family code, optional deployable contracts,
runtime codecs, trust and status policy, artifact locators, display metadata,
locale data, examples, and release evidence. These parts often need one
compatible release train.

Creating a repository for every issuer, schema patch, or deployment would
fragment maintenance and make compatibility harder. Keeping every governed
credential product in this core repository would couple unrelated release,
legal, security, and governance decisions.

## Decision

Create an independent repository when a credential product or product family
has its own:

- accountable owners and security response;
- governance or regulatory lifecycle;
- compatibility and release cadence;
- deployable integration surface; or
- adoption documentation and conformance suite.

Do not create a repository solely for an issuer, deployment, schema patch, or
experimental claim layout. One product repository may own multiple packages,
applications, compatible schema versions, and platform adapters.

This repository owns generic primitives, bounded composition profiles,
conformance tools, and reference families. A reference family graduates to a
product repository once its governance and release boundary is real. Digital
passport is the first graduation candidate.

A product repository should use the workspace Turbo convention and may contain:

```text
packages/
  credential/       # canonical schema, Compact family, codecs
  contracts/        # optional composed deployable contracts
  sdk/              # product-facing integration API
  artifacts/        # manifests and locator client, not mutable binaries
  display-model/    # framework-neutral rendering model
  locales/          # signed or display-only locale resources
  ui-web/           # optional adapters justified by real consumers
  ui-react-native/
apps/
  examples/
```

Each product publishes a bounded composition manifest selecting supported
holder-binding, status, verification, transport, artifact, rendering, and
locale profiles. The core repository must not promise that every theoretically
possible combination is supported.

Repositories remain independent. Until packages are published to a registry,
cross-repository consumption uses immutable package tarballs and artifact
bundles supplied through the workspace distribution process, never direct
source paths or imports across repository boundaries.

## Consequences

- Product releases can bind the exact components that must interoperate.
- Security ownership and support windows become explicit.
- The core avoids product-specific regulatory and UI dependencies.
- Extraction has an operational cost and requires independent CI, releases,
  documentation, and vulnerability management.
- Product UI packages may release independently only when their declared
  schema compatibility range remains valid.

## Rejected alternatives

- **One repository per issuer:** deployment configuration is not a reusable
  product boundary and would create excessive repositories.
- **One repository per schema version:** semantic versioning and migration
  packages handle compatible evolution more clearly.
- **All credential products in core:** this couples unrelated governance and
  release trains.

## Follow-up

The extraction criteria, composition manifest, and digital-passport pilot are
tracked in [`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md).
