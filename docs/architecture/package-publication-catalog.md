# Package Publication Catalog

Status: proposed target package graph for ADR-0014.

This catalog defines the reusable packages intended for independent
credential-family repositories. It is a target inventory, not a statement that
the packages are currently supported or published.

## Target packages

| Package | Responsibility | Target stage | Priority |
| --- | --- | --- | --- |
| `@midnight-ntwrk/vc-core` | Pure TypeScript model, schema/capability descriptors, composition manifests, and errors | Public | P0 |
| `@midnight-ntwrk/vc-compact` | Generic Compact VC/VP envelopes, holder bindings, and curated generated exports | Public | P0 |
| `@midnight-ntwrk/vc-artifacts` | Versioned proving-key, verifier-key, ZKIR, and deployment manifest contracts plus resolver ports | Public | P0 |
| `@midnight-ntwrk/vc-proof` | Family-neutral proof jobs and provider/verifier ports | Public | P0 |
| `@midnight-ntwrk/vc-status` | Generic status bindings, policies, and reader/writer/verifier ports | Public | P0 |
| `@midnight-ntwrk/vc-verification` | Canonical transcripts, result axes, policy composition, and decision-nullifier contracts | Public | P0 |
| `@midnight-ntwrk/vc-testing` | Generic fixtures, fake ports, and deterministic test utilities | Public development package | P0 |
| `@midnight-ntwrk/vc-conformance` | Black-box family, protocol, package, and composition conformance suites | Public development package | P0 |
| `@midnight-ntwrk/vc-same-holder` | Same-holder Compact capability | Public | P1 |
| `@midnight-ntwrk/vc-protocol` | Family-neutral issuance/presentation messages, state machines, and transport ports | Public candidate | P1 |
| `@midnight-ntwrk/vc-session` | Durable sessions, versioned codecs, replay/idempotency contracts, and CAS storage port | Public candidate | P1 |
| `@midnight-ntwrk/vc-oid4vci` | OID4VCI Final binding | Public | P1 |
| `@midnight-ntwrk/vc-oid4vp` | OID4VP Final, DCQL, and request binding | Public | P1 |
| `@midnight-ntwrk/vc-did-midnight` | `did:midnight` resolution and verification-relationship adapters; signing remains an injected wallet/issuer port | Public | P1 |
| `@midnight-ntwrk/vc-proof-midnight` | Compact/Midnight proving and verification adapters | Public | P1 |
| `@midnight-ntwrk/vc-status-midnight-contract` | Generic Midnight status-registry contract and curated generated exports | Public candidate | P1 |
| `@midnight-ntwrk/vc-status-midnight-reader` | Midnight status witness, read, and verification adapter | Public candidate | P1 |
| `@midnight-ntwrk/vc-status-midnight-authority` | Governing-authority and issuer mutation adapter | Public candidate | P1 |
| `@midnight-ntwrk/vc-dapp-connector` | Nested credentials extension for the existing Midnight DApp Connector API | Public candidate | P1 |
| `@midnight-ntwrk/vc-session-file` | Node file-backed session adapter | Public candidate | P2 |
| `@midnight-ntwrk/vc-didcomm` | Optional DIDComm transport binding | Public candidate | P2 |
| `@midnight-ntwrk/vc-display` | Neutral display-metadata contracts proven by at least two independent products | Incubating | P2 |

Private prototypes should use capability-oriented synthetic names such as
`vc-prototype-basic`, `vc-prototype-committed`, and `vc-prototype-mixed`.
Standalone infrastructure, BDD scenarios, reports, and use-case applications
remain internal. Product renderers, localization resources, transliteration
rules, and database-specific session adapters remain in product or adapter
repositories until they demonstrate an independent reusable boundary.

## Allowed dependency edges

`A -> B` means package A may depend on package B. Any edge not listed here,
other than a package's explicitly reviewed third-party dependencies, is denied
by default and must be added through an ADR update before implementation.
Package names in this matrix omit the `@midnight-ntwrk/` scope for readability.

| Package | May depend on |
| --- | --- |
| `vc-core` | none |
| `vc-compact` | `vc-core` |
| `vc-artifacts` | `vc-core` |
| `vc-proof` | `vc-core`, `vc-artifacts` |
| `vc-status` | `vc-core` |
| `vc-verification` | `vc-core`, `vc-proof`, `vc-status` |
| `vc-protocol` | `vc-core`, `vc-verification` |
| `vc-session` | `vc-core` |
| `vc-same-holder` | `vc-core`, `vc-compact` |
| `vc-display` | `vc-core`, only after ADR-0004's two-product evidence gate |
| `vc-oid4vci` | `vc-protocol` |
| `vc-oid4vp` | `vc-protocol`, `vc-verification` |
| `vc-did-midnight` | `vc-core`, published Midnight DID packages |
| `vc-proof-midnight` | `vc-proof`, `vc-compact`, published Midnight runtime packages |
| `vc-status-midnight-contract` | `vc-status`, `vc-compact` |
| `vc-status-midnight-reader` | `vc-status`, `vc-status-midnight-contract` |
| `vc-status-midnight-authority` | `vc-status-midnight-contract` |
| `vc-dapp-connector` | `vc-protocol`, `vc-session`, `@midnight-ntwrk/dapp-connector-api` |
| `vc-session-file` | `vc-session` |
| `vc-testing`, `vc-conformance` | any package whose target stage is `Public` or `Public candidate`; those packages never depend back on testing or conformance |

`vc-protocol` and `vc-session` do not depend on each other. Applications and
connector adapters compose them. Generated family Compact bindings remain in
the family repository, and deployable contract bundles own the final artifact
and deployment manifests.

## Current-to-target migration

| Current package or surface | Target |
| --- | --- |
| `midnight-did-credentials` | Split stable TypeScript descriptors into `vc-core`, generic Compact/generated exports into `vc-compact`, artifact contracts into `vc-artifacts`, proof execution into `vc-proof`, and decision semantics into `vc-verification` |
| `credentials-same-holder` | `vc-same-holder` |
| `credentials-status-registry` | Split generic status semantics into `vc-status` and Midnight implementation into contract, reader, and authority packages |
| `credentials-protocol` | Keep family-neutral FSM/transport logic in `vc-protocol`, durable state in `vc-session`, and move birth agents/descriptors to private evidence |
| `credentials-openid` | Move generic Compact value codec downward, then split OID4VCI and OID4VP |
| `credentials-offchain-did` | `vc-did-midnight`; keep signer/key custody behind an injected port |
| `credentials-iso-registry` | Keep internal until demonstrated by at least two independent families |
| credential-family and use-case packages | Private examples, minimal conformance fixtures, independent product repositories, or removal |

## Publication contract

An upstream credential-family repository may consume only packages that:

- have a named technical and support owner;
- are `candidate` or `supported` in the release contract;
- use registry-resolvable semantic versions;
- have explicit exports and no deep-source import requirement;
- contain no `workspace:`, `file:`, Git, URL, sibling, prototype, or use-case
  runtime dependency;
- produce deterministic tarballs with SBOM and provenance;
- pass Node, TypeScript, bundler, and Compact clean-consumer checks as
  applicable; and
- publish compatibility, migration, support, and deprecation policies.

The first clean external consumer should be
`midnight-verifiable-credential-digital-passport`.

## Orthogonality acceptance

The package graph is sufficiently orthogonal when a clean external family
repository can:

1. implement a protocol-neutral `CredentialFamilyDefinition` using only
   published family-authoring packages;
2. pass family and package conformance without importing repository source;
3. swap protocol, session, DID, proof, status, and display adapters without
   changing family code;
4. run with no prototype, use-case, reporting, BDD, or standalone dependency;
5. install with no local, Git, URL, or deep-source locator; and
6. prove forbidden edges through a machine-checked dependency graph.

## Delivery order

1. Add publication allowlists, `pack: false` prototype policy, and an
   allowlisted-edge graph guard.
2. Extract the P0 family-authoring substrate: family definition, generic
   codecs, artifacts, proof, status, and verification contracts.
3. Add public testing/conformance packages and clean external-family fixtures.
4. Validate digital passport as the first independent consumer.
5. Split family agents and durable state from `credentials-protocol`, keeping
   protocol and session mutually independent.
6. Move the generic Compact codec out of OpenID; implement final OID4VCI and
   OID4VP packages.
7. Split generic status semantics from Midnight contract, reader, and authority
   implementations.
8. Publish through prerelease promotion, retain compatibility facades for one
   cycle, then remove the old names.
