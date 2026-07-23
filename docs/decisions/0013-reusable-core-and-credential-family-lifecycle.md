# ADR-0013: Reusable core and credential-family lifecycle

- Status: Accepted
- Date: 2026-07-23
- Owners: VC maintainers and credential product owners
- Supersedes: ADR-0001

## Context

`midnight-verifiable-credentials` currently contains reusable VC/VP packages,
concrete credential-family packages, and runnable use cases. That breadth has
been useful for finding missing primitives and proving end-to-end composition,
but it creates an ambiguous release boundary. A concrete family can acquire
product-specific governance, security, localization, rendering, contract, and
release requirements that should not be coupled to the reusable core release
train.

Digital passport now has a dedicated repository,
`midnight-verifiable-credential-digital-passport`, and is the first concrete
application of this boundary. Other credential products need the same ability
to release and version independently while consuming stable core building
blocks.

The repository still needs concrete experiments. A reusable abstraction should
be supported by executable evidence before it is promoted, and use cases are
valuable integration and contribution evidence. Experiments and evidence must
not become an accidental product release surface.

## Decision

The target repository model is:

```text
packages/                  # reusable, schema-neutral release-capable packages
examples/
  credential-types/        # private, time-bounded prototypes
  use-cases/               # private runnable composition evidence
tooling/
  conformance/fixtures/    # minimal synthetic schemas and vectors
  integration/             # repository-local test infrastructure
docs/evidence/             # versioned evidence manifests and results
```

Only reusable, schema-neutral packages may be published from this repository.
Concrete credential families, product contracts, display resources,
localization, product-specific conformance, and product release artifacts
belong in independent repositories with independent ownership, versioning,
security response, and release trains.

Concrete credential types may exist here only as private, non-packable
prototypes or minimal conformance fixtures. Every prototype must record:

- the reusable capability hypothesis it exercises;
- an accountable owner and target milestone;
- supported profiles and known limitations;
- synthetic test data and reproducible evidence; and
- an exit criterion: graduate, reduce to a fixture, or remove.

The prototype lifecycle is:

1. **Propose:** record the capability hypothesis and exit criterion.
2. **Prototype:** implement the smallest private credential example needed to
   test the hypothesis.
3. **Evidence:** exercise it through a runnable use case, conformance vectors,
   exact dependency versions, and artifact digests.
4. **Generalize:** move schema-neutral behavior into a reusable package.
5. **Exit:** graduate the product to an independent repository, reduce it to a
   minimal conformance fixture, or archive and remove it.

After graduation, the independent repository is the sole source of truth for
the credential family. Core retains generic conformance vectors, evidence, and
links, not a competing implementation. Repository isolation remains strict:
consumers use registry packages or immutable release artifacts, never sibling
source paths, submodules, or cross-repository workspace imports.

During migration, the existing `packages/prototypes/credential-families` and
`packages/use-cases` workspaces remain private compatibility inventory. They:

- must not become `candidate` or `supported` release packages;
- must not gain new product features except extraction, regression, or
  capability-generalization work;
- must not be dependencies of reusable core packages; and
- must be moved, reduced, or removed through tracked migration slices.

Use cases remain first-class contribution evidence. They must consume the same
public package surfaces expected of external family repositories and must not
define a second supported product implementation.

## Consequences

- Reusable packages can evolve around coherent capabilities instead of product
  release schedules.
- Each credential product can own its governance, compatibility, security,
  display, localization, contract, and release decisions.
- Prototypes continue to expose missing abstractions before those abstractions
  are published.
- Existing family-coupled orchestration must be inverted behind injected
  family codecs, builders, and verifier ports before family packages can leave.
- CI and catalog tooling must distinguish release packages from private
  evidence workspaces and reject forbidden dependency edges.
- Graduating a family requires consumer evidence in the independent repository
  before the duplicate core implementation is removed.

## Rejected alternatives

- **Publish reference families from core:** this creates two potential release
  authorities once a product repository exists and couples unrelated support
  obligations.
- **Remove every concrete example immediately:** this would discard valuable
  regression and composition evidence before reusable seams are extracted.
- **Create one repository per issuer or schema patch:** deployment and
  compatible schema evolution do not by themselves define a product boundary.
- **Keep product repositories as submodules:** this violates repository
  isolation and recreates a source-level monorepo dependency.

## Follow-up

The package decomposition, publication catalog, prototype migration, and
digital-passport handoff are tracked in
[`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md). The
publication catalog's concrete package names and split boundaries are
provisional until ADR-0014 is accepted.
