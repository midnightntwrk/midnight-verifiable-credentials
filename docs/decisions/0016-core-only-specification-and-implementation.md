# ADR-0016: Core-only VC specification and implementation

- Status: Accepted
- Date: 2026-09-08
- Owners: VC maintainers
- Supersedes: ADR-0006, ADR-0007, ADR-0013, ADR-0014, and ADR-0015

## Context

The repository grew from generic Compact VC/VP primitives into a broad
workspace containing credential families, use cases, OpenID bindings, durable
protocol sessions, runtime discovery, deployment assembly, display policy,
status infrastructure, business verification contracts, and reporting.

That breadth produced useful experiments, but it also obscured the supported
product. Most workspaces are private, the public API expanded without enough
independent consumers, and the default validation graph is dominated by
application evidence rather than reusable credential semantics.

AnonCreds provides a useful responsibility boundary. Its implementation owns
issuer, holder/prover, and verifier operations over canonical credential and
presentation objects. Its specification defines issuance, presentation, and
revocation flows without selecting an HTTP, OIDC, or DIDComm transport.
Midnight needs the same separation while retaining Compact-first semantics.

## Decision

`midnight-verifiable-credentials` owns only:

- the normative Midnight VC/VP specification;
- canonical, serializable credential and presentation objects;
- protocol-independent issuer, holder, and verifier ceremonies;
- a bounded TypeScript data model and validation API;
- generic Compact VC/VP implementation and curated generated bindings;
- positive and negative conformance vectors; and
- the build, test, and release tooling required by those surfaces.

The normative specification and reference implementation will remain in this
repository. Normative content lives under top-level `spec/`; implementation
architecture, ADRs, migration notes, and guides remain under `docs/`.
Observable normative changes require corresponding conformance vectors.

### Retained ceremonies

The core may define pure functions, Compact circuits, or narrow injected
ports for:

1. validating a credential configuration;
2. creating issuance inputs or an issuance offer;
3. creating and validating a holder request when the selected holder binding
   requires it;
4. issuing and processing a credential;
5. creating a presentation request with a nonce or challenge;
6. creating a presentation with disclosures and predicates;
7. verifying a presentation against the exact request and configuration; and
8. creating, updating, and verifying status evidence when status is enabled.

These operations accept and return canonical objects. They do not send
messages, select a transport, persist a workflow, or make business decisions.

### Bounded configuration

Configuration selects a small set of versioned semantic capabilities, such as
claim representation, holder binding, status, and verification location. It
does not select HTTP/OIDC/DIDComm behavior, wallet APIs, deployment providers,
runtime packages, or product workflows.

Unsupported combinations fail explicitly. A credential family may choose a
supported combination, but it may not redefine the canonical security meaning
of issuance, presentation, holder binding, status, or verification.

### Public packages

The target supported release surface contains two packages:

1. `@midnight-ntwrk/credential-model` owns canonical TypeScript types,
   codecs, validation, operation interfaces, results, errors, and the minimal
   generic status vocabulary.
2. `@midnight-ntwrk/credential-compact` owns generic Compact sources, curated
   generated bindings, the minimal runtime bridge, and metadata for its own
   generic artifacts.

A separate status package may be proposed later only after independent
consumers, release cadence, and security ownership demonstrate a separate
lifecycle. Minimal generic proof/result types move into `credential-model`;
generic Compact execution support moves into `credential-compact`.

`credential-did-midnight` is a method adapter and must move to a DID-owned or
dedicated integration release surface. Core packages do not depend on DID
method implementations, trust registries, transports, wallets, credential
families, application contracts, or deployment-specific artifact registries.

### Repository responsibility split

| Repository | Responsibility |
| --- | --- |
| `midnight-verifiable-credentials` | Normative VC/VP core, generic implementation, and conformance. |
| Independent credential-family repositories | Family schema/configuration, family circuits and artifacts, family tests, ownership, versioning, and releases. |
| `midnight-identity-solution-examples` | Runnable issuer/holder/verifier applications, wallet and protocol experiments, end-to-end scenarios, and cross-repository demonstrations. |
| Future adapter repositories | OID4VCI/OID4VP, DIDComm, DApp Connector, or other transport bindings when independently required. |

Cross-repository integration uses released packages or immutable package
artifacts. Source imports, shared generated trees, submodule dependencies, and
workspace-relative links across repositories are prohibited.

### Removed product surface

The maintained core release graph will not contain:

- OID4VCI, OID4VP, DIDComm, HTTP, QR/deep-link, or connector adapters;
- durable sessions, inboxes/outboxes, leases, retries, or workflow agents;
- runtime family discovery, provider catalogs, or deployment assembly;
- concrete credential families or product contracts;
- business authorization and aggregate application decisions;
- display, framework, localization, or transliteration packages;
- university, passport, birth, age-gate, hello, or similar use cases; or
- application proving keys and large use-case-specific generated artifacts.

One minimal synthetic example may remain outside the public release graph to
demonstrate the retained API. It is a conformance fixture, not a product,
protocol implementation, or interoperability claim.

### Migration and versioning

Current out-of-scope directories are migration inventory. They receive only
security fixes needed during extraction, regression protection, relocation,
or deletion. They do not receive new features.

Maintained use cases move to `midnight-identity-solution-examples`; governed
credential families move to independent repositories. Deletion follows
destination validation through released package interfaces.

Because existing npm releases are prereleases, the reduced surface will use
`0.2.0-rc1` as an explicit breaking reset. Superseded prereleases may be
deprecated with migration guidance but must not be unpublished.

## Consequences

- The supported package graph becomes small enough to understand, test, and
  release independently.
- Protocol adapters can evolve without changing core credential validity.
- Credential families and applications own independent release trains.
- Existing protocol, use-case, and private infrastructure code will be
  deleted or relocated even when it has substantial tests.
- The default gate no longer needs Docker, LFS hydration, BDD reporting, or
  product-specific scenarios.
- Security claims become bounded to canonical credential semantics and tested
  configuration combinations.

## Rejected alternatives

- **Keep high-level protocols as optional workspaces:** optional workspaces
  still expand ownership, dependency, CI, and security scope.
- **Generate a different protocol for every configuration:** this makes
  configuration combinations new security protocols instead of bounded core
  profiles.
- **Keep all prototypes as evidence:** Git history and external consumer tests
  preserve evidence without retaining a second product implementation.
- **Split the specification immediately:** one repository currently gives
  normative changes an executable implementation and conformance gate.
- **Preserve the 0.1 public surface through compatibility facades:** the API is
  prerelease and lacks enough external consumers to justify permanent
  compatibility complexity.

## Follow-up

Execution is tracked by milestone
[`VC Core-Only 0.2.0-rc1`](https://github.com/midnightntwrk/midnight-verifiable-credentials/milestone/2)
and issue
[#539](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/539).
The detailed migration sequence is in
[`../plans/vc-core-only-repository-plan-2026-09-08.md`](../plans/vc-core-only-repository-plan-2026-09-08.md).
Credential-family and use-case outcomes remain traceable through the milestone,
linked issues, merged pull requests, and Git history.
