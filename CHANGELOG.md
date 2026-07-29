# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- protocol challenges, issuer nonces, blinding factors, signing nonces,
  message IDs, and thread IDs are now CSPRNG-backed by default; consumers that
  need reproducible fixtures must select an explicit deterministic source.

### Added

- added explicit `internal`, `candidate`, and `supported` package release
  stages, a canonical package support inventory, and fail-closed release
  candidate manifest/tarball validation.
- added ADR-0008 to separate packable workspace artifacts from supported
  public releases while VC packages use root-workspace-distributed tarballs.
- added a clean non-workspace consumer matrix that installs the core candidate
  tarball and exercises Node ESM, strict TypeScript, browser bundling, and
  Compact package-path resolution.

- added `SchemaCapabilities`, `SchemaFamilyResolutionHint`, and
  `SchemaDescriptor` to the credentials core so wallets and adapters can bind
  bounded credential-family capability metadata and resolver hints to a
  canonical `SchemaRef` without adding unbounded fields to Compact roots.
- added a canonical holder-binding terminology guide plus
  `check:holder-binding-terminology` to keep offchain DID, Compact/core,
  hidden-holder, and legacy Jubjub profile wording aligned across docs.
- added a deterministic university artifact manifest to the reporting summary
  with source artifact schema versions, producer lanes, byte sizes, file counts,
  SHA-256 digests, and the standalone manifest schema version
  `midnight-university-artifact-manifest.v1`. Missing source artifacts now fail
  summary rendering instead of producing partial reports, and callers must pass
  an explicit artifact base directory for portable manifest paths.
- added a workspace package-manifest audit that keeps package license/private
  metadata, dist export maps, source-only package policy, BDD scenario package
  policy, and tarball `files` surfaces aligned across root workspaces.
- added a root `./run.sh hello-smoke` lane plus matching `lint`,
  `typecheck`, and `test` scripts for the smallest DID-aware
  `offchain-did -> hello-family -> hello-verifier` handoff
- added `credentials-status-registry` as the prototype status / revocation
  registry package with:
  - verifier-supplied `RevokedSetStatusRequest`
  - authority-attested status proof helpers
  - witness-builder helpers
  - live-status witness helpers for same-contract verification prototypes
- added a focused Layer 3 status-aware revocation demo under
  `credentials-demo-contract`:
  - `src/demo-revocation.compact`
  - revocation simulator and witness helpers
  - dedicated test coverage
- added `ci:revocation` and a dedicated GitHub Actions lane for the revocation
  demo path
- added a production-shaped Node/runtime reference path for
  `credentials-protocol`:
  - `NodeCryptoRandomnessSource`
  - `createStableJsonProtocolStateStore(...)`
  - `createNodeFileBackedProtocolStateStore(...)`
  - `createNodeFileBackedProtocolPartyDependencies(...)`
  - restart/replay reference tests for explicit-holder recovery and
    secret-holder outcome re-delivery across verifier restart
- added an integration surface map and package maturity backlog for VC
  integrators and maintainers
- the core TypeScript package now exports `OffchainDIDHolderBinding` as the
  preferred public-facing alias for the existing
  `OffchainMidnightHolderBinding` Compact/runtime shape.
- added stable `./contract` package subpaths for the primary VC/family/demo
  packages so integrators can import explicit contract-facing surfaces without
  depending on duplicate root namespace exports:
  - `credentials`
  - `credentials-birth`
  - `credentials-birth-secret`
  - `credentials-same-holder`
  - `credentials-demo-contract`
- added a stable `./contract-revocation` package subpath for
  `credentials-demo-contract`.

### Changed

- promoted only `@midnight-ntwrk/midnight-did-credentials` to a private pre-1.0
  release candidate with ESM-only exports, explicit Compact subpaths, complete
  package metadata, a package changelog, and a compatible Compact `0.15.x`
  runtime range. Registry publication remains blocked on ownership, support
  policy, provenance, and release operations.
- added a browser-safe `@midnight-ntwrk/midnight-did-credentials/jubjub`
  subpath so pure arithmetic consumers do not pull generated on-chain WASM into
  a web bundle.

- protocol reference agents now derive generated issue/present message
  `features` compatibility hints from schema descriptors instead of maintaining
  independent per-agent feature literals.
- documented protocol `features` as compatibility hints rather than
  authoritative schema facts; adapters should compare them with trusted schema
  descriptors or family registries during migration.
- tightened `assertMatchingSchemaRefs(...)` so matching empty schema identities
  are rejected by the shared schema-reference precondition instead of comparing
  as equal.
- BREAKING: the university report summary schema moved to
  `midnight-university-report-summary.v3` because summaries now embed an
  artifact manifest. The renderer also emits `artifact-manifest.json` and
  `artifact-manifest.md` next to the existing summary artifacts, and the mall
  discount BDD expectations now match the current `minimumFinalGrade = 91`
  verifier explanation.
- tightened the university report-summary runtime guard so object checks reject
  arrays and artifact manifest byte/file counts must be non-negative integers.
- normalized the `credentials-protocol`, standalone-environment, age-gate
  contract, and BDD scenario package manifests so generated tarballs and
  workspace metadata expose the intended surface consistently.
- BREAKING: credential-family Compact roots now instantiate
  `VC<TPublicClaims, TClaimCommitments, THolderBinding, TStatusBinding>`.
  `claims` is the signed public/direct claim surface, `claimCommitments` is the
  signed commitment surface for private disclosure and predicate-only values,
  commitment-only families use `NoPublicClaims`, and direct-only families use
  `NoClaimCommitments`. Family authors should name commitment-only structs
  `*ClaimCommitments`, update scaffold output through `--claim-mode`, and call
  out generated Compact/runtime surface changes in migration notes. The family
  scaffold now derives generated type names from the Pascal-cased slug without
  appending an extra `Credential` namespace suffix, so new scaffold output uses
  names such as `<Family>Credential` rather than
  `<Family>CredentialCredential`.
- BREAKING: the VC status model no longer carries runtime `epoch` and
  `StatusSupportLevel` fields. Freshness remains a verifier/application
  responsibility via the accepted `(registryId, revokedRoot)` pair.
- BREAKING: the primary VC/family/demo root TypeScript entrypoints no longer
  publish duplicate `*Contract` namespace aliases. Contract-facing imports
  should now use the explicit stable package subpaths such as `./contract` and
  `./contract-revocation`.
- BREAKING: status architecture is being normalized around shared VC-side
  status binding plus presentation-time status proof protocols. New additive
  runtime types include:
  - `NoStatusBinding`
  - `RegistryBoundStatusBinding`
  - `AuthorityAttestedStatusProofProtocol`
  - `RevokedSetNonMembershipStatusProofProtocol`
- clarified the current status capability taxonomy across the specs and package
  READMEs:
  - `NoStatusCapability`
  - `AuthorityAttestedStatusCapability`
  - `RevokedSetNonMembershipStatusCapability`
- clarified the trust boundary for current status-aware verification:
  verifier/application supplies the accepted `(registryId, revokedRoot)`
- documented `credentials-status-registry` as a first-class workspace package
- documented the rule that demo contracts stay small, business-facing, and
  capability-specific
- BREAKING: `signAuthorityAttestedStatusProof(...)` now derives its signing
  nonce internally. Integrations that still need an explicit nonce override
  must now import
  `unsafeSignAuthorityAttestedStatusProofWithNonceScalar(...)` from the
  dedicated `credentials-status-registry/testing` subpath intentionally
  instead of passing `nonceScalar` into the safe helper or relying on the root
  package surface to expose the unsafe override.
- BREAKING: `VerifierStatusPolicy` now carries explicit
  `enforceAttestationMaxAge` / `maxAttestationAge` fields so
  authority-attested status freshness can be enforced by verifier policy
  instead of only by absolute attestation expiration.
- BREAKING: `credentials-birth-secret` status-aware wrapper proofs now sign a
  status-bound family body root that commits the shared
  `RegistryBoundStatusBinding`. The secret-birth family now supports only the
  `SecretBirthCredentialWithStatusBinding` wrapper surface; the legacy
  `SecretBirthCredentialWithStatusCapability` and
  `SecretBirthCredentialWithAuthorityAttestedStatusCapability` wrappers have
  been removed. Integrations must no longer reuse the plain base-credential
  proof for the status-bound wrapper surface. This rollout currently applies
  to the secret-birth family only; non-secret birth family proofs have not
  changed yet.
- normalized status ownership in code:
  - shared VC-side status binding remains in `credentials`
  - registry-facing proof-protocol Compact types and validators now live in
    `credentials-status-registry`
  - hidden-holder family and revocation-aware demo flows now import the
    registry-facing proof surface from `credentials-status-registry`
  - managed/runtime consumers should now import
    `RevokedSetStatusRequest`,
    `AuthorityAttestedStatusProofProtocol`, and
    `RevokedSetNonMembershipStatusProofProtocol` from
    `credentials-status-registry` rather than `credentials`
- BREAKING: `RevocationRegistryState` now carries a mandatory
  `registryVersion` field. Verifier-side snapshots, revoked-set requests,
  witness inputs, and authority-attested status statements must now carry the
  contract version they were observed against. `assertStateUsesThisRegistry(...)`
  now binds snapshots to both the live `registryId` and the live contract
  version, even though the Merkle `revokedRoot` itself remains verifier-supplied
  until the final in-circuit root-binding path lands.
- clarified the empty-root invariant and canonical live-state observation path
  for `credentials-status-registry`:
  - an initialized empty revoked-set registry may legitimately publish the
    zero Merkle root
  - shared TypeScript helpers can now derive the canonical
    `(registryId, revokedRoot, registryVersion)` snapshot directly from live
    registry contract state
  - the same helper layer can now reject already-revoked handles against live
    contract state before building revoked-set or same-contract status inputs
- added one explicit canonical runtime bundle surface for the non-authority
  status path in `credentials-status-registry`:
  - `CanonicalObservedNonMembershipBundle`
  - `CanonicalLiveNonMembershipBundle`
  - `buildCanonicalObservedNonMembershipBundle(...)`
  - `buildCanonicalLiveNonMembershipBundleFromContractState(...)`
  - `assertCanonicalNonMembershipBundle(...)`
- BREAKING: the generic Compact credential envelope is now split into a thin
  `VC<TClaims, THolderBinding, TStatusBinding>` plus a separate
  `VP<TDisclosures, THolderBinding>` module. Credential bodies now carry an
  explicit `statusBinding` field, so credential body roots and issuer proofs
  change for all families that instantiate the shared core.
- BREAKING: generic presentation-envelope validation is now split between:
  - `VP.assertValidPresentationEnvelope(presentation)`
  - `CredentialPresentationRelations.assertMatchingCredentialPresentation(...)`
  Consumers must no longer treat `assertValidPresentationEnvelope` as the
  credential/presentation linkage helper.
- BREAKING: VC-side status binding validators now live entirely in
  `credentials/status-bindings.compact`, while protocol-facing status
  capability and verifier-policy vocabulary now live in
  `credentials-status-registry/status-proof-protocol.compact`. Managed/runtime
  consumers must import `StatusCapabilityKind`, `VerifierStatusPolicy`,
  `RevokedSetNonMembershipStatusCapability`, and
  `AuthorityAttestedStatusCapability` from
  `credentials-status-registry` rather than `credentials`.
- BREAKING: the secret-birth status-bound family body root no longer hashes an
  extra `StatusBindingKind` discriminator. The concrete VC-side binding root
  is now the only status-specific extension layered onto the base credential
  body for those wrapper surfaces.
- BREAKING: `credentials-status-registry` TypeScript helpers are now
  binding-first for intermediate status construction:
  - `buildAuthorityAttestedStatusCapability(...)` is removed
  - `buildRevokedSetStatusCapability(...)` is renamed to
    `buildRevokedSetStatusBinding(...)`
  - `BuiltRevokedSetStatusWitness.statusCapability` is removed
- BREAKING: `RegistryBoundStatusBinding` now carries an explicit `statusType`
  field. Status-aware builders and proof-protocol compatibility helpers now
  default that field to `StatusType.revocationRegistry`, and status-aware
  families/tests must commit and validate it as part of the issuer-signed
  binding payload.
- Holder-binding naming is now explicitly split between:
  - Compact/core struct name:
    `OffchainMidnightHolderBinding`
  - preferred public-facing TypeScript alias:
    `OffchainDIDHolderBinding`

### Fixed

- `ProtocolStateCollection` now requires `entries()` for retention/pruning
  semantics in protocol state adapters; the reference helpers now handle
  snapshot-based pruning and tied-timestamp retention more explicitly.
- protocol-state retention helpers now support optional batch deletion via
  `deleteMany(keys)` and skip unnecessary collection scans when finalized
  outcome capacity is zero.
- the package-boundary guard now also blocks duplicate root `*Contract`
  namespace aliases for the curated VC/family/demo package entrypoints.
- The revocation demo no longer duplicates the revoked-set status request
  struct that now lives in the shared hidden-holder family surface.
- `SecretIssuerAgent` now compares blinded-secret offer/request issuer
  `methodId` values by bytes rather than object identity, so issuance survives
  persistence boundaries when pending offers are reloaded from a persistent
  protocol state store.
