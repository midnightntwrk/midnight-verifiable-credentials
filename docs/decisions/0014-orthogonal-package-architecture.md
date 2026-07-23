# ADR-0014: Orthogonal package architecture

- Status: Proposed
- Date: 2026-07-23
- Owners: VC package maintainers
- Supersedes: none

## Context

ADR-0013 limits this repository's publication surface to reusable,
schema-neutral building blocks. The current package graph does not yet satisfy
that boundary. The protocol package imports birth-family implementations and
demo/integration code, the OpenID package owns a generic Compact value codec,
and the status package combines generic semantics with a Midnight registry
implementation.

Independent credential-family repositories need small packages that can be
combined without importing unrelated runtimes, protocols, storage systems, or
product code. Package splitting must follow real dependency, runtime, security,
and release boundaries rather than produce one package for every source folder.

## Decision

Adopt a ports-and-adapters package graph with `@midnight-ntwrk/vc-*` as the
target public naming convention. The exact publication stages and migration
mapping are recorded in
[`../architecture/package-publication-catalog.md`](../architecture/package-publication-catalog.md).

The approximate dependency tiers are illustrated below. The publication
catalog's allowed-edge matrix is the canonical graph.

```text
vc-core
  <- vc-compact / vc-artifacts / vc-status
  <- vc-proof / vc-verification / vc-same-holder
  <- vc-protocol / vc-session
  <- OID4VC / DIDComm / Midnight / DApp Connector / storage adapters
```

The main family composition point is a protocol-neutral
`CredentialFamilyDefinition` that supplies:

- schema and capability descriptors;
- credential and presentation codecs;
- proof and artifact requirements;
- supported holder-binding and status capabilities.

Protocol profiles and display metadata are separate sibling packages or
entrypoints in the family repository. The family definition never depends on a
transport, wallet, session, display framework, or deployment package.

Stable ports include:

- `CredentialCodec` and `PresentationCodec`;
- `IssuanceHandler` and `PresentationHandler`;
- `ProofProvider`, `ProofVerifier`, and `ArtifactResolver`;
- `DidResolver`, injected `DidSigner`, and
  `VerificationRelationshipResolver`;
- `StatusReader`, `StatusWriter`, and `StatusVerifier`;
- `ProtocolTransport` and `SessionStore`; and
- `DisplayResolver` for neutral display metadata after two product families
  demonstrate the abstraction.

These ports must use stable family-neutral types. They must not expose a
concrete family's generated Compact types.

Verification has an independent `vc-verification` boundary. It owns canonical
transcripts, the proof/decision/execution/authority result axes, policy
composition, and decision-nullifier contracts from ADR-0010. `vc-proof` owns
proof execution only, `vc-status` owns status semantics only, and
`vc-artifacts` owns versioned artifact and deployment manifest contracts.

Upon acceptance of this ADR, the exact allowed-edge matrix in the publication
catalog is normative. Unlisted internal edges are denied by default and CI must
enforce the matrix. In particular, `vc-protocol` and `vc-session` do not depend
on each other; applications and connector adapters compose both.

Midnight status support is split by security boundary into contract,
read/verification, and authority/write packages. DID integration resolves and
validates `did:midnight` relationships but does not own signing keys. File and
database session adapters are separate packages. Capability-first adapter names
use `vc-did-midnight`, `vc-proof-midnight`, and
`vc-status-midnight-*`.

The following dependency edges are forbidden:

- public packages to prototypes, examples, use cases, BDD, reporting, or
  standalone integration packages;
- reusable protocol packages to generated family types or family agents;
- adapters from unrelated capability families to one another unless a
  dedicated composition package explicitly owns the bundle; security-boundary
  splits within one adapter family may use only the edges enumerated in the
  canonical matrix;
- family packages to transport, wallet, application, or deployment packages;
- display/localization packages to proof, protocol, wallet, or network
  runtimes; and
- production packages to testing or conformance packages.

Display remains incubating under ADR-0004. Core may eventually publish neutral
display metadata demonstrated by at least two independent products, but
framework renderers, localization resources, and jurisdiction-specific
transliteration remain product-owned.

Published packages use independent pre-1.0 semantic versions, explicit
exports, provenance, SBOMs, trusted publication, and clean external-consumer
tests. Existing `@midnight-ntwrk/midnight-did-credentials*` package names may
act as compatibility facades for one documented migration cycle, but no new
API is added to those facades.

## Consequences

- An external credential family can install only the capabilities it needs.
- Protocol, DID, storage, proof, and UI integrations can be replaced without
  changing family semantics.
- The initial publication wave is limited to the family-authoring substrate;
  protocol, session, and platform adapters advance independently.
- Current packages must be split incrementally; this is not a directory rename.
- More packages create release and ownership cost, so a package advances only
  when it has an independent dependency or compatibility boundary and clean
  consumer evidence.
- `credentials-iso-registry` remains internal until at least two independent
  family repositories demonstrate the abstraction.

## Rejected alternatives

- **One public SDK package:** it would couple browser, Node, Compact, protocol,
  status, and Midnight runtime dependencies and prevent selective adoption.
- **Publish the current workspace graph:** it exposes family coupling and
  private integration dependencies as public contracts.
- **One package per source folder:** source organization alone is not a release
  boundary and would create unsupported package churn.
- **Expose generated family types through generic ports:** this would make the
  abstraction family-specific and block adapter substitution.

## Follow-up

Implementation order and acceptance tests are maintained in
[`../architecture/package-publication-catalog.md`](../architecture/package-publication-catalog.md)
and [`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md).
