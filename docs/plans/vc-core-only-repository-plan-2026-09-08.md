# VC Core-Only Repository Plan

Status: proposed target architecture and migration plan

Date: 2026-09-08

Repository: `midnightntwrk/midnight-verifiable-credentials`

Execution:

- integration branch: `vc-core`;
- milestone: [VC Core-Only 0.2.0-rc1](https://github.com/midnightntwrk/midnight-verifiable-credentials/milestone/2);
- tracker: [#539](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/539); and
- boundary decision: [ADR-0016](../decisions/0016-core-only-specification-and-implementation.md); and
- legacy backlog disposition: [core-only issue disposition](./vc-core-only-issue-disposition-2026-09-08.md).

Decision requested: reduce this repository to the Midnight VC/VP
specification, core data model, Compact implementation, conformance vectors,
and minimal implementation tests. Remove high-level exchange protocols,
business use cases, credential families, runtime discovery, and application
orchestration from the maintained product surface.

## Recommendation

Adopt the AnonCreds responsibility boundary, adapted to Midnight:

- specify the credential cryptographic model and ceremonies;
- implement issuer, holder/prover, and verifier operations;
- define canonical serializable objects for those operations;
- keep registry/status integration behind narrow data and resolver ports; and
- leave transport, wallet coordination, application policy, and deployment
  workflows to outer repositories.

Keeping the specification and implementation in one repository is appropriate
for the current maturity. It gives every normative rule an executable test and
keeps Compact constraints visible during spec review. The repository must
still separate normative specification changes from implementation details so
the code does not silently become the specification.

OID4VCI, OID4VP, DIDComm, DApp Connector integration, and custom session
protocols should not be part of this repository's next release. They can be
implemented later as independent adapters after the core payloads and
ceremonies are stable.

Runnable application and integration use cases should move to
`midnight-identity-solution-examples`. Concrete credential-family source and
release artifacts should remain in independently versioned family
repositories, such as `midnight-verifiable-credential-digital-passport`.

## What to copy from AnonCreds

`anoncreds-rs` presents one reference library around three roles: issuer,
prover/holder, and verifier. Its data model includes schema, credential
definition, credential offer, credential request, credential, presentation
request, presentation, and revocation objects. The library exposes operations
over those objects without selecting HTTP, DIDComm, or OIDC as the wire
transport.

The AnonCreds specification separately defines issuance, presentation, and
revocation data flows. It leaves the identifier and registry mechanism to
pluggable AnonCreds methods. Sending a request or presentation is shown in the
flow, but the transport protocol is not the cryptographic implementation's
responsibility.

Midnight should copy that boundary, not the AnonCreds cryptography or every
object shape.

Reference sources:

- https://github.com/anoncreds/anoncreds-rs
- https://github.com/anoncreds/anoncreds-spec
- https://github.com/anoncreds/anoncreds-spec/blob/main/spec/anoncreds_methods.md
- https://github.com/anoncreds/anoncreds-spec/blob/main/spec/data_flow_presentation_overview.md

## Core versus high-level protocol

The word `protocol` currently hides two different responsibilities.

### Keep: cryptographic ceremonies

These operations define the meaning and security of a Midnight credential and
belong in the core specification and implementation:

1. define a credential configuration;
2. create issuance inputs or an issuance offer;
3. create a holder-bound credential request when the selected binding requires
   it;
4. issue a credential;
5. process and validate an issued credential;
6. create a presentation request;
7. create a presentation with disclosures and predicates;
8. verify a presentation;
9. create, update, and verify status evidence when status is enabled; and
10. return a cryptographic verification result.

These should be pure functions, Compact circuits, or narrow injected ports.
They should accept and return canonical objects. They should not send network
messages or persist sessions.

### Remove: exchange and application protocols

The following are outside the core repository:

- OID4VCI and OID4VP HTTP, authorization, redirect, request-object, and DCQL
  profiles;
- DIDComm messages, mediation, routing, and connection state;
- DApp Connector global or nested wallet APIs;
- QR, deep-link, universal-link, and browser-injection flows;
- durable workflow sessions, leases, retries, inboxes, outboxes, and
  idempotency stores;
- runtime package/credential-family discovery;
- business authorization, aggregate decisions, capability issuance, and
  ledger transaction receipts;
- product display, localization, and framework adapters; and
- concrete university, passport, birth, age-gate, and hello workflows.

Outer protocols consume core objects as opaque canonical payloads. They may
add correlation identifiers, transport security, consent, retries, and user
experience without redefining credential validity.

## Repository responsibility split

Use three explicit ownership levels:

| Repository type | Responsibility |
| --- | --- |
| `midnight-verifiable-credentials` | Normative VC/VP model, generic Compact implementation, canonical objects, cryptographic ceremonies, and conformance vectors. |
| Independent credential-family repositories | Family schema/configuration, family-specific Compact circuits and artifacts, family release train, and family-level tests. |
| `midnight-identity-solution-examples` | Runnable issuer/holder/verifier applications, protocol experiments, wallet integration, end-to-end scenarios, and cross-repository demonstrations. |

Moving a use case means recreating or porting it through released package
interfaces. Do not move source by introducing workspace-relative imports,
shared generated trees, or direct dependencies on this repository. Each
destination use case must declare released package versions and own its
runtime, fixtures, CI, and deployment configuration.

Use cases are evidence that the core architecture is usable, but they are not
part of the core release graph. The core repository should record links to
external evidence and the exact package versions tested rather than embedding
the applications themselves.

## Configuration rule

A credential configuration may change which core operations and evidence are
required, but it should not create an arbitrary new protocol for every
credential family.

Use a small, versioned capability profile:

```ts
interface CredentialConfigurationV1 {
  id: string;
  version: string;
  claimMode: "direct" | "committed" | "mixed";
  holderBinding: "none" | "explicit" | "hidden";
  status: "none" | "registry";
  verification: "offchain" | "midnight-contract";
}
```

The exact type will be defined by the specification. This example establishes
the constraint: bounded choices, no provider catalog, no deployment assembly,
no executable package locator, and no transport selection.

Each supported configuration must deterministically produce:

- the required canonical object set;
- the required issuer, holder, and verifier operations;
- the Compact entry points and artifact roles;
- the security invariants and negative vectors; and
- an unsupported result for combinations that are not implemented.

Prefer one stable ceremony with optional bounded steps over unrelated message
flows. For example, hidden holder binding may require an offer/request exchange
that an explicit profile can omit, but both profiles should still use the same
versioned issuance object vocabulary.

## Target specification

Use a top-level `spec/` directory for normative content. Keep ADRs and
implementation guides under `docs/`.

```text
spec/
  README.md
  terminology.md
  data-model.md
  configuration.md
  canonical-encoding.md
  issuance.md
  presentation.md
  verification.md
  holder-binding.md
  status.md
  security-considerations.md
  privacy-considerations.md
  conformance.md
  test-vectors/
```

Normative scope:

- credential configuration and schema references;
- VC and VP canonical representations;
- direct, committed, and mixed claim semantics;
- explicit and hidden holder binding;
- selective disclosure and predicates;
- issuance and presentation ceremonies;
- cryptographic verification and error outcomes;
- optional status binding and status-proof requirements;
- domain separation, hashing, encoding, and versioning;
- security/privacy invariants; and
- conformance vectors.

Non-normative scope:

- package installation and API examples;
- Compact compiler and artifact build instructions;
- migration guides;
- implementation design notes; and
- comparisons with other credential systems.

Normative changes require a dedicated spec section in the PR, updated vectors,
and explicit human approval. Implementation refactors that do not change
observable behavior should not edit the normative spec.

## Target implementation API

Model the implementation after AnonCreds' issuer, prover, and verifier entry
points while keeping Midnight's Compact-first semantics.

### Issuer

- define or validate a credential configuration;
- create issuance inputs/offer;
- verify a holder request when required;
- issue a credential; and
- initialize or update status state when enabled.

### Holder

- create holder-binding secret/material;
- create a credential request when required;
- validate/process an issued credential;
- select disclosures and predicates; and
- create a presentation.

### Verifier

- create a presentation request with a cryptographic nonce/challenge;
- verify the presentation against the exact configuration and request;
- verify status evidence when enabled; and
- return a bounded cryptographic result.

The verifier result should answer only questions owned by credential
verification:

- well formed or malformed;
- cryptographically valid, invalid, or indeterminate;
- requested disclosures/predicates satisfied or not satisfied;
- holder binding valid or invalid; and
- status valid, invalid, indeterminate, or not required.

It should not contain business approval, protected-action identity, ledger
mutation, HTTP status, redirect state, retry state, or workflow completion.

## Target package surface

Start with two supported public packages. Add a third only after an independent
consumer proves a separate lifecycle is required.

### 1. `@midnight-ntwrk/credential-model`

Responsibility:

- canonical TypeScript data types;
- configuration and schema descriptors;
- codecs and validation;
- issuer/holder/verifier operation interfaces;
- cryptographic result and error types; and
- optional status vocabulary.

Remove from its supported root:

- runtime credential-family registry and package loading;
- capability-provider catalogs;
- deployment assemblies and maturity policy;
- aggregate business decision profiles;
- artifact deployment selection; and
- transport/session concepts.

Keep the existing name for the first simplification release to avoid a rename
that adds no architectural value. Reconsider `credential-core` only for a
future stable major version.

### 2. `@midnight-ntwrk/credential-compact`

Responsibility:

- canonical generic Compact VC/VP sources;
- holder-binding, disclosure, predicate, and verification circuits;
- curated generated TypeScript bindings;
- the minimal runtime bridge needed to invoke those circuits; and
- artifact metadata for the package's own generic circuits.

It must not contain:

- concrete credential-family circuits;
- business contracts;
- deployable application prover keys;
- runtime family discovery;
- transport adapters; or
- DID/trust/status service clients.

### Optional future package

Keep `@midnight-ntwrk/credential-status` only if the status specification and
implementation have independent consumers, release cadence, and security
ownership. Until then, keep the small generic status vocabulary in
`credential-model` and status Compact primitives in `credential-compact`.

### Published packages to retire or move

| Current package | Proposed disposition |
| --- | --- |
| `credential-proofs` | Fold minimal generic proof/result interfaces into `credential-model`; fold generic Compact execution/artifact support into `credential-compact`; remove authority/deployment frameworks. |
| `credential-status` | Fold into the two core packages unless independent status consumers justify a package. |
| `credential-did-midnight` | Move to a DID-owned or dedicated adapter release surface; it is a method adapter, not credential core. |

Because all existing releases are prereleases, prefer a clear breaking
`0.2.0-rc1` core reset over compatibility facades that preserve an unproven
API. Deprecate superseded npm prereleases with a migration link. Do not
unpublish them.

## Target repository structure

```text
midnight-verifiable-credentials/
  spec/                         # normative VC/VP specification
  packages/
    core/model/                 # credential-model
    core/compact/               # credential-compact
  conformance/
    fixtures/                   # normative positive and negative vectors
    consumers/                  # clean public-package consumers
  examples/
    minimal/                    # one synthetic, non-product example
  docs/
    decisions/                  # ADRs
    architecture/               # implementation architecture
    guides/                     # contributor and migration guides
  tooling/
    scripts/                    # only scripts required by retained surfaces
  run.sh
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
```

The minimal example should not be a publishable workspace unless a real build
boundary requires it. It must use only public package exports and should fit in
one small directory without BDD/reporting infrastructure.

## Removal and relocation map

| Current area | Action |
| --- | --- |
| `packages/protocols/openid` | Remove from this repository. Preserve useful interoperability research in history; recreate as an adapter repository only when demanded. |
| `packages/components/orchestration/exchange` | Remove session/transport/runtime orchestration. Move only essential canonical issuance/presentation object types into `credential-model`. |
| `packages/components/orchestration/protocol` | Remove. Application agents, file stores, retries, and lifecycle workflows are outer-layer concerns. |
| `packages/components/adapters/credential-did-midnight` | Propose transfer to DID or a dedicated integration repository; freeze here until ownership is accepted. |
| `packages/components/adapters/offchain-did` | Remove with the legacy compatibility surface. |
| `packages/components/integration/standalone-environment` | Replace with a minimal test harness required by retained Compact integration tests. |
| `packages/registry/status-*` | Remove or fold the smallest generic semantics into core. Do not keep three packages without separate consumers and deployment ownership. |
| `packages/core/proofs` | Reduce and fold as described in the package plan. |
| `packages/core/display` | Remove; rendering and localization belong to products. |
| `packages/core/primitives/credentials` | Migrate retained canonical behavior to model/Compact, then remove the compatibility facade. |
| `packages/core/capabilities/same-holder` | Fold a retained generic capability into `credential-compact`; otherwise defer. |
| `packages/core/primitives/iso-registry` | Remove until two credential families require it. |
| `packages/prototypes/credential-families/*` | Remove after external-family migration checks. Git history is the archive. |
| `packages/use-cases/*` | Port maintained application and integration scenarios to `midnight-identity-solution-examples`, then remove them here. Retain one minimal synthetic example outside the release graph. |
| large checked-in prover/verifier artifacts | Remove from Git/LFS; publish immutable artifacts by digest only when a consumer needs them. |
| university/status/OpenID BDD and reporting | Remove with their use cases. |

## Dependency rule

The retained graph should be:

```text
credential-model
       ^
       |
credential-compact
```

External family repositories may depend on both. Core packages must not
depend on:

- DID method implementations;
- trust registries;
- transport protocols;
- wallets or connector APIs;
- concrete credential families;
- application contracts; or
- deployment-specific artifact registries.

All external integrations use published package versions. Repository
isolation rules continue to apply.

## Conformance strategy

Replace broad local use-case evidence with a compact conformance suite:

1. positive and negative vectors for every normative object;
2. issuer -> holder -> verifier round trips for each supported configuration;
3. cross-runtime hash/encoding vectors for TypeScript and Compact;
4. malformed, substitution, replay, holder-binding, disclosure, predicate,
   expiry, and status-negative cases;
5. one clean tarball consumer for each supported package; and
6. one external credential-family repository running the same vectors.

The first external consumer should be
`midnight-verifiable-credential-digital-passport`. It already consumes
`credential-compact`; expand it only after the reduced API is agreed.

No local synthetic wallet, issuer, or verifier should be described as external
interoperability evidence.

Runnable end-to-end evidence belongs in `midnight-identity-solution-examples`.
Its CI should consume released versions of the core and relevant family
packages. A failing example is feedback to the owning repository, not a reason
to create cross-repository source coupling.

## CI target

The default non-Docker gate should become:

```text
format/lint
spec links and normative-vector validation
typecheck
build credential-model
build credential-compact
unit tests
cross-runtime conformance vectors
clean tarball consumers
package boundary and API-surface checks
```

Run real Compact proof/integration qualification only for changed Compact
sources and release candidates. Eliminate university, BDD, OpenID, protocol,
status/OpenID, reporting, and business-contract targets from the default gate.

## Migration PR plan

Maximum active stack depth remains two. Do not mix deletion, API redesign, and
release publication in one PR.

### PR 1: Decide the boundary

- add an ADR accepting this core-only scope;
- define normative versus informative documentation;
- approve the two-package target and package dispositions;
- choose the minimal supported configuration matrix; and
- block feature additions outside that matrix.

Acceptance: maintainer approval on exact keep/remove decisions.

### PR 2: Establish the conformance contract

- create top-level `spec/` and `conformance/` skeletons;
- move only current normative rules that survive the scope decision;
- define issuer/holder/verifier operations and canonical objects;
- add API snapshots and cross-runtime vectors; and
- mark incomplete security capabilities as unsupported.

Acceptance: spec and implementation tests agree without protocol/use-case
imports.

### PR 3: Reduce `credential-model`

- remove runtime discovery, deployment/provider composition, aggregate
  business decisions, and transport concepts from public exports;
- retain bounded configuration, codecs, role operations, results, and errors;
- add migration notes; and
- prove the package from a clean consumer.

Acceptance: zero runtime dependencies and no imports from adapters, protocols,
families, registries, or use cases.

### PR 4: Reduce `credential-compact`

- make it the single Compact implementation owner;
- fold only retained same-holder/status/proof primitives;
- remove duplicated compatibility sources;
- exclude family/application circuits and deployable keys; and
- prove canonical TypeScript/Compact vectors.

Acceptance: one generic Compact root, one composition-safe root if still
needed, and no duplicate source owner.

### PR 5: Remove high-level protocols and private architecture

- remove OpenID, exchange/protocol orchestration, display, status
  implementation split, compatibility adapters, and standalone application
  infrastructure;
- remove stale docs, targets, scripts, catalog entries, and tests with their
  owners; and
- preserve only security vectors that protect retained core behavior.

Acceptance: no high-level protocol or business workflow package remains in
the workspace graph.

### PR 6: Remove credential families and use cases

- validate the independent digital-passport repository against the reduced
  packages;
- move maintained application and integration scenarios to
  `midnight-identity-solution-examples` through released package interfaces;
- remove all in-repository family prototypes and use cases after destination
  validation;
- add the minimal synthetic example; and
- remove obsolete generated files and LFS objects.

Acceptance: no concrete credential family is a workspace, and the minimal
example uses only published exports. Every retained runnable use case has a
named destination owner, package-version manifest, and passing destination CI.

### PR 7: Simplify CI and release tooling

- reduce `run.sh`, root scripts, Turbo tasks, and workflows to retained
  surfaces;
- require the small authoritative gate in branch protection;
- fix publication rollback before release;
- document support and deprecation; and
- prepare `0.2.0-rc1` without publishing it automatically.

Acceptance: a fresh clone can install, run the default gate, pack both
packages, and pass clean consumers without LFS hydration or Docker.

### PR 8: External validation and release

- consume the exact RC tarballs or npm versions from digital passport;
- run its family-level issuance and presentation path;
- record only cross-repository conformance evidence;
- resolve findings in the owning repository; and
- publish and promote only after human approval and terminal required CI.

Acceptance: independent consumer evidence for every retained public export
category.

## Stop conditions

Stop migration and request a maintainer decision if:

- a proposed core object contains HTTP, DIDComm, OIDC, wallet-session, or
  business-action fields;
- a package boundary has only one internal consumer and no security/runtime
  isolation reason;
- a supported configuration cannot be expressed by the bounded profile;
- a change weakens holder-binding, disclosure, predicate, status, or canonical
  encoding invariants;
- a family repository requires a deep import or unpublished workspace; or
- a PR grows the public API while deleting less high-level surface than it
  adds.

## Success measures

The migration is complete when:

- only two supported packages remain, unless status earns a separately
  approved third package;
- no protocol, orchestration, product family, business contract, or reporting
  workspace remains;
- the normative spec and conformance vectors cover every public operation;
- a fresh clone does not require Docker or LFS for the default gate;
- the digital-passport repository consumes only released public exports;
- maintained runnable use cases live in `midnight-identity-solution-examples`
  and consume released package versions;
- no public API depends on a local package locator or provider catalog;
- the default gate completes in a small, predictable time; and
- high-level protocols can be added externally without changing core VC/VP
  semantics.

## Final position

Avoiding DIDComm and OIDC now is the correct simplification. The core must not,
however, become message-free: canonical issuance and presentation objects are
part of the cryptographic contract between issuer, holder, and verifier.

The desired boundary is:

```text
this repository = what the credential means and how it is proven
family repositories = which credential is built and independently released
solution examples = how parties exchange it and what the proof enables
protocol adapter repositories = how parties discover each other and move bytes
```

That boundary gives future protocol adapters freedom without allowing each
credential configuration to redefine security semantics.
