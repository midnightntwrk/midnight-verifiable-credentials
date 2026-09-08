# ADR-0016: Core-only VC specification and implementation

- Status: Accepted
- Date: 2026-09-08
- Updated: 2026-09-09
- Owners: VC maintainers
- Supersedes: product, protocol, and multi-package architecture decisions archived in Git history

## Context

The repository grew from generic VC/VP primitives into credential families,
applications, exchange protocols, status infrastructure, deployment code, and
runtime integrations. Those experiments were useful but obscured the public
API and coupled unrelated release and security lifecycles.

The repository now needs one responsibility: specify and implement reusable
Midnight VC/VP semantics without selecting a product, transport, DID method,
wallet, or deployment.

## Decision

This repository owns:

- the normative, protocol-independent VC/VP specification under `spec/`;
- canonical credential and presentation data structures;
- a bounded TypeScript model and validation API;
- generic Compact VC/VP primitives and curated generated bindings;
- positive and negative conformance vectors; and
- the build, test, and release tooling for those surfaces.

The supported public release graph contains exactly:

- `@midnight-ntwrk/credential-model`;
- `@midnight-ntwrk/credential-compact`.

The core may define canonical inputs and results for issuer, holder, and
verifier ceremonies. It must not send protocol messages, manage sessions,
select infrastructure, persist product workflows, or make business decisions.
Unsupported capability combinations fail explicitly.

The repository does not own:

- concrete credential families, schemas, applications, or business contracts;
- OID4VC, DIDComm, HTTP, QR, DApp Connector, or wallet integrations;
- DID-method adapters, trust registries, or status services;
- deployment assembly, runtime discovery, or product proving artifacts; or
- rendering, localization, transliteration, and framework-specific UI.

One synthetic example may demonstrate package composition. It is a test
fixture, not a product, protocol implementation, or compatibility claim.

Credential families and applications use published versions or immutable
package artifacts. Cross-repository source imports, workspace links, generated
trees, and submodule dependencies are prohibited.

Normative behavior changes require matching conformance vectors. The current
breaking reset is `0.2.0-rc1`; historical prereleases may be deprecated but
must not be unpublished.

## Consequences

- Protocol and product repositories can evolve on independent release trains.
- The default gate needs no Docker, LFS hydration, wallet, or application
  scenario.
- Deleted experiments remain discoverable through Git history and issues,
  without continuing to define the active architecture.
- A new public package requires evidence of a genuinely independent lifecycle,
  consumers, ownership, and release need before this decision is revised.
