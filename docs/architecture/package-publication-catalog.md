# Package Publication Catalog

Status: proposed target package graph for ADR-0014.

This catalog defines the reusable packages intended for independent
credential-family repositories. Current concrete families are private evidence
under `packages/prototypes/credential-families`; the ownership, dependant
inventory, and graduation gates are maintained in
[`credential-family-ownership-policy.md`](./credential-family-ownership-policy.md).
`@midnight-ntwrk/credential-model` is the first supported package;
`credential-compact`, `credential-proofs`, and `credential-status` are executable
private candidates, while every other row remains a target rather than a claim
that the package is currently supported or published. ADR-0014 remains Proposed; this implementation records
candidate evidence only and does not enforce its graph.

The naming convention uses credential-domain terms instead of the broad `ssi`
label or the abbreviated `vc` prefix. Package names describe the capability
first and put platform or protocol qualifiers last. The exception is
`openid4vc`, which retains the standards-family name.

## Target packages

| Package | Responsibility | Target stage | Priority |
| --- | --- | --- | --- |
| `@midnight-ntwrk/credential-model` | Pure TypeScript credential-family model, schema and capability descriptors, composition manifests, codecs, and errors | Public | P0 |
| `@midnight-ntwrk/credential-compact` | Generic Compact VC/VP envelopes, holder bindings, same-holder capability, and curated generated exports | Private candidate (not published) | P0 |
| `@midnight-ntwrk/credential-proofs` | Family-neutral proof jobs, provider/verifier ports, artifact resolver ports, and versioned proof/build/deployment manifest contracts | Private candidate (not published) | P0 |
| `@midnight-ntwrk/credential-status` | Generic credential-status bindings, policies, and reader/writer/verifier ports | Private candidate (not published) | P0 |
| `@midnight-ntwrk/credential-verification` | Canonical transcripts, result axes, policy composition, and decision-nullifier contracts | Public | P0 |
| `@midnight-ntwrk/credential-testkit` | Deterministic fixtures, fake ports, and black-box family, protocol, package, and composition conformance suites | Public development package | P0 |
| `@midnight-ntwrk/credential-exchange` | Family-neutral issuance/presentation messages and state machines plus durable session codecs, replay/idempotency contracts, transport ports, and a CAS storage port | Public candidate | P1 |
| `@midnight-ntwrk/openid4vc` | OpenID4VCI Final issuance and OpenID4VP Final presentation bindings, including DCQL and request binding | Public | P1 |
| `@midnight-ntwrk/credential-did-midnight` | `did:midnight` resolution and verification-relationship adapters; signing remains an injected wallet/issuer port | Private candidate (not published) | P1 |
| `@midnight-ntwrk/credential-proofs-midnight` | Compact/Midnight proving and verification adapters | Public | P1 |
| `@midnight-ntwrk/credential-status-midnight-contract` | Generic Midnight status-registry contract and curated generated exports | Public candidate | P1 |
| `@midnight-ntwrk/credential-status-midnight-verifier` | Midnight status witness, observation, read, and verification adapter | Public candidate | P1 |
| `@midnight-ntwrk/credential-status-midnight-authority` | Governing-authority and issuer status-mutation adapter | Public candidate | P1 |
| `@midnight-ntwrk/credential-wallet-connector` | Nested credentials extension for the existing Midnight DApp Connector API | Public candidate | P1 |
| `@midnight-ntwrk/credential-session-node` | Node file-backed session-store adapter | Public candidate | P2 |
| `@midnight-ntwrk/credential-transport-didcomm` | Optional DIDComm transport binding | Public candidate | P2 |
| `@midnight-ntwrk/credential-display` | Neutral display-metadata contracts proven by at least two independent products | Incubating | P2 |

Private prototypes should use capability-oriented synthetic names such as
`credential-prototype-basic`, `credential-prototype-committed`, and
`credential-prototype-mixed`.
Standalone infrastructure, BDD scenarios, reports, and use-case applications
remain internal. Product renderers, localization resources, transliteration
rules, and database-specific session adapters remain in product or adapter
repositories until they demonstrate an independent reusable boundary.

## Consolidation decisions

The catalog combines modules when they are dependency-compatible and require a
shared compatibility contract:

| Former targets | Consolidated target | Required public subpaths |
| --- | --- | --- |
| `vc-compact`, `vc-same-holder` | `credential-compact` | `.`, `./holder-binding/same-holder` |
| `vc-artifacts`, `vc-proof` | `credential-proofs` | `.`, `./artifacts`, `./providers` |
| `vc-testing`, `vc-conformance` | `credential-testkit` | `.`, `./fixtures`, `./conformance` |
| `vc-protocol`, `vc-session` | `credential-exchange` | `.`, `./protocol`, `./session` |
| `vc-oid4vci`, `vc-oid4vp` | `openid4vc` | `.`, `./issuance`, `./presentation` |

Subpath consolidation does not permit internal cycles. In particular,
`credential-exchange/session` remains family- and protocol-implementation
neutral, while the package root may compose session and protocol modules.

The following boundaries remain separate because they protect runtime weight,
replaceability, or least privilege:

- TypeScript model versus Compact runtime and generated circuits;
- generic status semantics versus Midnight status implementation;
- Midnight status contract, verifier/read, and authority/write roles;
- DID resolution versus proof execution;
- universal exchange logic versus Node storage;
- OpenID4VC, DIDComm, and wallet-connector transports; and
- neutral credential semantics versus product rendering and localization.

## Allowed dependency edges

`A -> B` means package A may depend on package B. Any edge not listed here,
other than a package's explicitly reviewed third-party dependencies, is denied
by default and must be added through an ADR update before implementation.
Package names in this matrix omit the `@midnight-ntwrk/` scope for readability.

| Package | May depend on |
| --- | --- |
| `credential-model` | none |
| `credential-compact` | `credential-model` |
| `credential-proofs` | `credential-model` |
| `credential-status` | `credential-model` |
| `credential-verification` | `credential-model`, `credential-proofs`, `credential-status` |
| `credential-exchange` | `credential-model`, `credential-verification` |
| `credential-display` | `credential-model`, only after ADR-0004's two-product evidence gate |
| `openid4vc` | `credential-exchange`, `credential-verification` |
| `credential-did-midnight` | `credential-model`, published Midnight DID packages |
| `credential-proofs-midnight` | `credential-proofs`, `credential-compact`, published Midnight runtime packages |
| `credential-status-midnight-contract` | `credential-status`, `credential-compact` |
| `credential-status-midnight-verifier` | `credential-status`, `credential-status-midnight-contract` |
| `credential-status-midnight-authority` | `credential-status-midnight-contract` |
| `credential-wallet-connector` | `credential-exchange`, `@midnight-ntwrk/dapp-connector-api` |
| `credential-session-node` | `credential-exchange` |
| `credential-transport-didcomm` | `credential-exchange` |
| `credential-testkit` | any package whose target stage is `Public` or `Public candidate`; production packages never depend back on the testkit |

Generated family Compact bindings remain in the family repository, and
deployable contract bundles own the final proving artifacts and deployment
manifests. `credential-proofs` owns the manifest contracts and resolver ports,
not every generated family artifact.

## Current-to-target migration

| Current package or surface | Target |
| --- | --- |
| `midnight-did-credentials` | Split stable TypeScript descriptors into `credential-model`, generic Compact/generated exports and same-holder support into `credential-compact`, proof/resource contracts into `credential-proofs`, and decision semantics into `credential-verification` |
| `credentials-same-holder` | `credential-compact/holder-binding/same-holder` |
| `credentials-status-registry` | Split generic status semantics into `credential-status` and Midnight implementation into contract, verifier, and authority packages |
| `credentials-protocol` | Keep family-neutral FSM, transport, durable session codecs, and storage ports in `credential-exchange`; move file storage to `credential-session-node` and birth agents/descriptors to private evidence |
| `credentials-openid` | Move the generic Compact value codec downward, then implement OID4VCI and OID4VP as `openid4vc/issuance` and `openid4vc/presentation` |
| `credentials-offchain-did` | `credential-did-midnight`; keep signer/key custody behind an injected port |
| `credentials-iso-registry` | Keep internal until demonstrated by at least two independent families |
| generic fixtures and conformance checks | `credential-testkit` |
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
3. swap exchange, session-store, DID, proof, status, and display adapters
   without changing family code;
4. run with no prototype, use-case, reporting, BDD, or standalone dependency;
5. install with no local, Git, URL, or deep-source locator; and
6. prove forbidden edges through a machine-checked dependency graph.

## First implementation slice

Start with `@midnight-ntwrk/credential-model` on an independent branch based on
`origin/develop`. This is the bottom of the dependency graph and can be
implemented without choosing a protocol, ledger adapter, storage engine, or
proof runtime.

The first slice should:

1. create a private candidate workspace under `packages/core/model`;
2. define `CredentialFamilyDefinition`, `CredentialCodec`,
   `PresentationCodec`, schema/capability descriptors, composition manifests,
   and family-neutral errors;
3. move or adapt only pure TypeScript contracts from the current credentials
   and protocol packages;
4. prohibit Compact runtime, generated family, prototype, use-case, transport,
   storage, and Midnight SDK runtime dependencies;
5. add explicit exports, unit tests, a clean external TypeScript consumer, and
   package-boundary checks; and
6. keep the current package as a compatibility facade until downstream
   packages migrate.

Acceptance for this slice is a zero-runtime-dependency package that can define
a synthetic credential family in an isolated fixture without importing
workspace source. No existing Compact or product behavior should move in the
same PR.

This slice is now implemented. The separate publication-enablement change
promotes the package from private `candidate` to `supported` and adds the
manual npmjs release train without widening the package graph.

## Delivery order

1. Add publication allowlists, `pack: false` prototype policy, and an
   allowlisted-edge graph guard.
2. Extract `credential-model` and prove it with a clean external family
   fixture.
3. Extract `credential-compact` and `credential-proofs`, including the
   same-holder and artifact/proof consolidations.
4. Extract `credential-status`, `credential-verification`, and
   `credential-testkit`.
5. Validate digital passport as the first independent consumer.
6. Move family-neutral exchange and durable session modules into
   `credential-exchange`; move Node file storage into
   `credential-session-node`.
7. Move the generic Compact codec out of OpenID and implement final OID4VCI and
   OID4VP subpaths in `openid4vc`.
8. Split generic status semantics from Midnight contract, verifier, and
   authority implementations.
9. Add the Midnight DID/proof adapters and wallet-connector extension.
10. Publish through prerelease promotion, retain compatibility facades for one
    documented cycle, then remove the old names.
