# VC Maturity Backlog

Status: active repository-audit backlog for capability, documentation,
packaging, and integration hardening.

Purpose:

- capture repo-wide maturity gaps that cut across individual feature PRs
- separate accepted issues from overstated or already-partially-addressed
  findings
- provide a stable backlog for follow-up engineering and documentation slices

## Status Update: 2026-05-06

Merged in the last completed iteration:

- revocation demo and focused CI lane:
  - `#50`
- discoverability and onchain/offchain surface guidance:
  - `#44`
  - `#46`
  - `#51`
- current-workspace vs adjacent-prototype clarification:
  - `#47`
  - `#48`
  - `#60`
- package maturity and status-taxonomy/conformance alignment:
  - `#49`
  - `#53`
- status binding/proof split and protocol-state hardening:
  - `#55`
  - `#56`
- holder-binding alias, changelog discipline, boundary guardrail, docs-only CI fast path, and starter templates:
  - `#58`
  - `#59`
  - `#61`
  - `#62`
  - `#63`
- remaining documentation backlog, curated contract surfaces, contribution conventions, and the TypeScript BDD/CI classifier slices:
  - `#64`
  - `#65`
  - `#66`
  - `#68`
  - `#70`
  - `#71`
  - `#72`
- protocol-state persistence, ordinal recovery hardening, and the second
  living-documentation scenario:
  - `#73`
  - `#74`
  - `#75`
  - `#76`
  - `#77`
  - `#78`
- architecture audit, CI optimization, package/protocol taxonomy, and Claude
  audit triage:
  - `#79`
  - `#80`
  - `#81`
  - `#82`
  - `#83`
  - `#84`
  - `#85`
  - `#86`

Substantially addressed on `develop`:

- `VC-MAT-01`
- `VC-MAT-02`
- `VC-MAT-03`
- `VC-MAT-04`
- `VC-MAT-05`
- `VC-MAT-07`
- `VC-MAT-10`
- `VC-MAT-12`
- `VC-MAT-13`
- `VC-MAT-14`
- `VC-MAT-15`
- `VC-MAT-11`
- `VC-MAT-16`
- `VC-MAT-18`
- `VC-MAT-19`

Partially advanced, but still active:

- `VC-MAT-06`
- `VC-MAT-08`
- `VC-MAT-09`
- `VC-MAT-17`
- `VC-MAT-20`

New audit-derived items:

- `VC-MAT-18`
- `VC-MAT-19`
- `VC-MAT-20`

Current highest-risk remaining area:

- the biggest unfinished core-spec gap is still status/revocation:
  the repository does not yet provide final in-circuit root binding and
  non-membership proof semantics
- the strongest remaining integrator-adoption gap is now execution, not
  discovery:
  the repo has templates and guides, but it still lacks a generated family
  scaffold and a concise DID + VC handoff kit
- the strongest remaining orchestration-layer adoption gap is now production
  safety:
  `credentials-protocol` still needs a more explicit durable-state, RNG, and
  deployment-checklist story for real integrations

Next active queue:

This older `VC-MAT-XX` queue is superseded by the category split and
twenty-slice execution plan below. Keep it only as a compact pointer to the
same top-level priorities:

1. `STATUS-CONTRACT` / `VC-MAT-20`
2. `INTEGRATOR-EXECUTION` / `VC-MAT-08`
3. `BDD-LIVE-DOCS` / `VC-MAT-17`
4. `ORCHESTRATION-PROD-SAFETY` / `VC-MAT-06`
5. `TEST-DOC-ALIGNMENT` / `VC-MAT-09`

## Category Split

The remaining backlog now falls into five execution categories:

### `STATUS-CONTRACT`

- final status / revocation trust-model hardening
- in-circuit and helper/API work around status binding, freshness, and
  adversarial verification behavior
- primary item:
  - `VC-MAT-20`

### `INTEGRATOR-EXECUTION`

- runnable starter and scaffold paths that convert the current documentation
  into execution-shaped onboarding
- primary item:
  - `VC-MAT-08`

### `BDD-LIVE-DOCS`

- curated use-case scenarios that explain trust boundaries without becoming a
  second regression matrix
- primary item:
  - `VC-MAT-17`

### `ORCHESTRATION-PROD-SAFETY`

- durable-state, randomness, and deployment-hardening work for the reference
  Layer 4 orchestration package
- primary item:
  - `VC-MAT-06`

### `TEST-DOC-ALIGNMENT`

- keep the package/test/lane docs synchronized with the real repository shape
  and cross-repo smoke-path expectations
- primary item:
  - `VC-MAT-09`
- execution rule:
  - treat this as a cross-cutting discipline that applies to every numbered
    slice below rather than as its own dedicated PR slot

## Twenty-Slice Execution Plan

The next backlog wave is intentionally decomposed into twenty reviewable PR
slots rather than a few broad epics. `TEST-DOC-ALIGNMENT` remains active, but
it is applied as a per-slice discipline instead of a separate numbered queue.

### `STATUS-CONTRACT`

1. deterministic signing-nonce defaults for authority attestation, plus
   helper/API narrowing
2. adversarial status protocol coverage:
   - root substitution
   - registry swap
   - missing-binding rejection
3. authority-attested freshness policy:
   verifier-enforced max-age semantics
4. status-proof protocol docs and README updates for the narrowed helper trust
   surface
5. full status-binding commitment design for issuer-signed body roots
6. first birth-family rollout of full status-binding commitment into body-root
   logic
7. shared family rollout of full status-binding commitment
8. canonical non-membership proof-protocol docs and witness shape
9. canonical non-membership proof implementation slice
10. live-root binding feasibility / integration slice for the registry surface

### `INTEGRATOR-EXECUTION`

11. generated family scaffold or copy script
12. tiny runnable hello-verifier starter
13. tiny runnable hello-family starter
14. issuer-oriented starter path
15. wallet-oriented starter path
16. DID + VC handoff checklist, smoke path, and compatibility matrix seed

### `BDD-LIVE-DOCS`

17. stale-root negative scenario
18. wrong-registry negative scenario
19. revoked / unsatisfied status scenario

### `ORCHESTRATION-PROD-SAFETY`

20. protocol production-safety package:
    durable-state checklist, RNG expectations, and deployment guidance

The first ten slices are status-contract work because that remains the highest
core-spec risk. The latter categories remain active, but they should stack on a
clearer status boundary rather than race ahead of it.

`TEST-DOC-ALIGNMENT` intentionally has no numbered slot in this plan. Treat it
as a per-slice acceptance requirement rather than as a standalone execution
queue.

## Architecture Audit: 2026-05-06

This audit combined:

- repo-local spec/package/code review on current `develop`
- a Claude-composed second-pass audit checklist focused on:
  - package-boundary drift
  - spec/doc drift
  - public-surface ambiguity
  - prototype-vs-core classification

### Reusable core VC components

- `credentials`
- `credentials-same-holder`
- `credentials-iso-registry`
- reusable family-level schema, predicate, and proof surfaces in:
  - `credentials-birth`
  - `credentials-birth-secret`

Current reading:

- these packages define the canonical Compact-native VC/VP envelopes,
  holder-binding shapes, proof containers, claim layouts, and family-specific
  verification logic that other packages should compose rather than redefine

### Reusable core protocols

- generic issuance and presentation protocol modules in `credentials`
- family-specific request/submission/result semantics in:
  - `credentials-birth`
  - `credentials-birth-secret`
- same-holder composition semantics in `credentials-same-holder`
- shared VC-side status binding plus verifier-request vocabulary for
  status-aware flows

Main caveat:

- status proof-protocol ownership is now normalized in code:
  - shared VC-side status binding remains in `credentials`
  - registry-facing proof-protocol Compact types and validators live in
    `credentials-status-registry`
- the remaining caveat is the prototype trust model:
  final in-circuit root binding and non-membership semantics are still pending

### Prototype-only surfaces

- current verifier-supplied-root and authority-attested status stories remain
  prototype trust models rather than final production non-revocation claims
- `credentials-demo-contract` proves business-flow composition and demo-shaped
  Layer 3 patterns, but it is not the canonical reusable VC package surface
- `vc-bdd-scenarios` is living documentation, not a conformance contract or a
  second regression matrix
- historical adjacent-prototype artifacts are now quarantined rather than
  presented as supported workspace packages

### Layer 3 / Layer 4 wiring and helpers

- `credentials-protocol`
- `credentials-openid`
- `credentials-offchain-did`
- `standalone-environment`
- off-chain builders and witness helpers in `credentials-status-registry`
- `vc-bdd-scenarios`

Current reading:

- these packages are important composition surfaces, but they are not the same
  thing as the reusable core VC spec
- `credentials-protocol` is the main reference orchestration layer and should
  be treated as off-chain wiring, not as a stable on-chain or canonical core
  protocol package

### Main gaps from this audit

- there is still no single canonical inventory that tells integrators which
  public packages and protocol surfaces are:
  - reusable core
  - reusable core protocol
  - prototype-only
  - Layer 3 / Layer 4 wiring
- docs now describe status binding and proof-protocol ownership better than the
  code actually enforces
- `credentials-protocol` still exposes a broad root runtime surface without a
  curated `exports` map, unlike the narrower entrypoint posture adopted by the
  newer package slices
- the spec and README set still describe some reusable core protocol semantics
  and some reference orchestration behavior too close together, especially
  where “reference protocol” language can be misread as “core reusable
  protocol”

### Claude Second-Pass Triage

The narrower Claude audit agreed on three high-value remaining gaps:

- the final cryptographic status contract is still incomplete:
  - live `revokedRoot` binding is not yet proven inside Compact
  - final non-membership proof semantics are not yet shipped end to end
  - the full status binding is not yet committed into the issuer-signed
    credential body root
- the authority-attested helper surface still exposes a caller-supplied signing
  nonce footgun
- deeper starter material is still secondary work after the core status/protocol
  decisions
- the protocol-state seam should stop drifting through optional methods and
  either:
  - freeze as a synchronous capability-typed contract
  - or move intentionally to an async facade once a real async backend is
    committed

The later three-perspective Claude audit added three useful refinements that
were not explicit enough here before:

- the current starter set is still more documentation-shaped than
  execution-shaped:
  the next onboarding slice should include tiny runnable hello paths, not only
  markdown templates
- the cross-repo DID to VC handoff contract is still implicit:
  downstream consumers need a tested DID-tarball to VC-workspace compatibility
  matrix, not just a narrative checklist
- `credentials-protocol` still needs a clearer production-safe story:
  durable state, explicit RNG expectations, and a short deployment checklist
  should be first-class outcomes rather than side knowledge

The same Claude pass also repeated some findings that are now stale on
`develop`:

- the broad tactical `VC-MAT-14` hardening bucket is no longer the main open
  problem after `#73` through `#78`
- the earlier Layer 3/family export and dormant-demo cleanup findings are now
  mostly closed for the current workspace

## Triage Legend

- `Accepted`: valid finding, should remain on the backlog until fixed
- `Accepted (narrowed)`: valid underlying issue, but the original wording
  overstates the current risk or scope
- `Partially addressed elsewhere`: valid finding that is already being worked
  in another stacked docs/spec slice and should remain open until merged
- `Deferred`: valid but not the best next move relative to more urgent gaps

## Triage of Prior VC Repository Audit Findings

This table is retained as historical input. The status update, architecture
audit, and recommended execution order above are the authoritative current
view.

| # | Finding | Triage | Priority | Backlog action |
| --- | --- | --- | --- | --- |
| 1 | `credentials-status-registry` is hard to discover in architecture/spec/guides | `Accepted` | P0 | Add explicit package entries, package role, and on-chain/off-chain usage guidance across top-level docs and architecture notes |
| 2 | Phantom passport/compliance/DL/NID/employee packages are referenced as if they were current workspace packages | `Accepted` | P0 | Split current-workspace content from external/sibling-prototype examples; mark adjacent prototype material explicitly |
| 3 | `StatusCapability` taxonomy is inconsistent across docs/spec/conformance | `Accepted` | P0 | Normalize docs/spec language around `NoStatusCapability`, `RevokedSetNonMembershipStatusCapability`, and `AuthorityAttestedStatusCapability` |
| 4 | `OffchainDIDHolderBinding` rename is half-applied | `Accepted` | P1 | Decide canonical public name, add alias or complete rename, and update docs plus generated TS guidance |
| 5 | Prototype revocation/status helpers sit too close to “reference implementation” language | `Accepted (narrowed)` | P1 | Tighten maturity labels and trust-boundary warnings so integrators cannot mistake current status support for final non-membership enforcement |
| 6 | Protocol state-store seam has backend foot-guns | `Accepted (narrowed)` | P1 | Track async backend shape, eviction semantics, and mutation safety as a dedicated protocol-state hardening track |
| 7 | Family bundles re-export too much of the core surface | `Accepted` | P1 | Define intended public subpath/package surface, then reduce accidental managed-surface over-export where feasible |
| 8 | No “Hello World” / scaffold / verifier-template exists | `Accepted` | P1 | Add minimal issuer/verifier/wallet-oriented starter templates and a first “new family” scaffold |
| 9 | Test matrix and strategy docs are stale/incomplete | `Accepted` | P1 | Keep test docs aligned with real packages, demo coverage, and focused lanes such as `ci:revocation` |
| 10 | `CHANGELOG.md` misses breaking surface changes | `Accepted` | P1 | Start recording user-visible/breaking surface changes for package APIs, required interfaces, and protocol semantics |
| 11 | Status capability types live in core while the registry contract/package owns the feature boundary | `Accepted` | P1 | Decide and document whether status is a Layer-1 core capability, a dedicated status package, or a registry-owned DSL |
| 12 | Conformance model has no dedicated status capability category | `Accepted` | P1 | Add a status capability conformance category and align it with shipped capability taxonomy |
| 13 | Public surface classification is missing for onchain-only / offchain-only / dual-use exports | `Accepted` | P1 | Add one canonical classification guide and propagate the labels into package READMEs |
| 14 | Protocol-state hardening items from earlier review rounds remain open | `Accepted (narrowed)` | P1 | Track concrete protocol-state fixes separately from the broader seam redesign so tactical fixes do not get lost |
| 15 | Layer-3 and family package public surfaces are too broad or misleading | `Accepted` | P1 | Reduce accidental exports, make demo surfaces intentionally narrow, and clarify that the core stub contract is not deployable |
| 16 | Status capability types conflate VC-side binding with verifier-facing proof semantics | `Accepted` | P1 | Split shared VC-side status binding from presentation-time status proof protocols, then migrate specs and code in phases |

## Backlog Items

### VC-MAT-01: Make `credentials-status-registry` a first-class documented package

Priority: P0

Problem:

- the package is real and testable
- top-level package maps and architecture docs do not consistently present it as
  part of the supported workspace

Required outcome:

- package appears in:
  - root README
  - docs README
  - architecture overview
  - package-boundaries guide
  - package-selection guide
- package role is explicit:
  - mixed Compact/runtime status support package
  - current prototype maturity
  - verifier/application supplies accepted root

### VC-MAT-02: Separate current workspace support from adjacent prototype examples

Priority: P0

Problem:

- several long-form docs read as if passport/compliance and related families are
  current local workspace packages
- this is integrator-hostile because it describes a broader product landscape
  than the checked-in repo actually ships

Required outcome:

- every long-form guide distinguishes:
  - current workspace packages
  - sibling or adjacent prototype repos
  - future roadmap examples
- `prototypes/passport-compliance/reference/passport-compliance-demo.compact` is labeled as
  adjacent-prototype/example material rather than current validated workspace

Current grouped execution:

- stacked package/docs slice:
  - remove the dormant passport/compliance compile script surface
  - mark the artifact as historical and unsupported in package/architecture docs

### VC-MAT-03: Normalize status capability taxonomy and maturity language

Priority: P0

Problem:

- status docs drifted while the repo evolved from:
  - no status support
  - to verifier-supplied-root support
  - to authority-attested transitional support

Required outcome:

- one canonical doc vocabulary for:
  - `NoStatusCapability`
  - `RevokedSetNonMembershipStatusCapability`
  - `AuthorityAttestedStatusCapability`
- explicit note that current non-membership support is not yet final
  cryptographic enforcement in Layer 3 contracts

Current grouped execution:

- stacked docs/spec slice:
  - status taxonomy + conformance alignment

### VC-MAT-16: Split status binding from status proof protocol

Priority: P1

Problem:

- the current repository uses `StatusCapability` names for two different jobs:
  - VC-side binding shape
  - verifier-facing proof semantics
- `AuthorityAttestedStatusCapability` and
  `RevokedSetNonMembershipStatusCapability` already share the same credential
  fields but imply different trust models

Required outcome:

- normalize the architecture around:
  - shared `NoStatusBinding` / `RegistryBoundStatusBinding`
  - separate `AuthorityAttestedStatusProofProtocol` /
    `RevokedSetNonMembershipStatusProofProtocol`
- keep compatibility aliases while the current runtime types migrate
- make package ownership explicit:
  - `credentials` owns shared VC-side binding types
  - `credentials-status-registry` owns verifier-facing status proof protocols

Current grouped execution:

- landed slices now cover:
  - architectural terminology/spec split
  - additive runtime binding/protocol types
  - verifier-facing builder/import normalization
- this slice now also landed:
  - registry-facing Compact proof-protocol types and validators moved into
    `credentials-status-registry`
  - hidden-holder family and revocation-aware demo flows now import that
    registry-facing proof surface directly
- remaining work moved under `VC-MAT-20`:
  - final in-circuit root binding and non-membership semantics

### VC-MAT-04: Resolve `OffchainDIDHolderBinding` vs `OffchainMidnightHolderBinding`

Priority: P1

Problem:

- docs and package surfaces use overlapping names for the same conceptual
  holder-binding family

Current decision:

- keep `OffchainMidnightHolderBinding` as the canonical Compact/core struct
- expose `OffchainDIDHolderBinding` as the preferred runtime/public-facing
  adapter name
- preserve compatibility aliases while downstream code migrates

### VC-MAT-17: Add a TypeScript BDD living-documentation layer

Priority: P1

Problem:

- Vitest covers correctness and regression well, but it is not a good living
  documentation surface for engineers or integrators
- the repository still needs a curated scenario layer that demonstrates current
  VC use cases end-to-end without becoming a second regression matrix

Required outcome:

- add a TypeScript BDD workspace package
- use Serenity/JS with screenplay-style tasks and questions
- keep the first scenario non-Docker and library-first
- generate report artifacts suitable for living documentation

Current grouped execution:

- replace the discarded JVM Serenity prototype with:
  - `use-cases/age-gate/scenarios/`
  - Cucumber.js
  - Serenity/JS
  - TypeScript
- smoke scenarios now on `develop`:
  - birth credential age-gate happy path
  - hidden-holder verifier-supplied-root revocation-aware age-gate happy path
- follow-up work:
  - add the next scenarios only when they materially improve living
    documentation for integrators or reviewers
  - add more scenario coverage without turning the BDD layer into a second full
    regression matrix
  - keep the BDD-only CI lane focused and trustworthy
  - add scenario coverage that clarifies status trust models, not just happy
    path feature breadth

### VC-MAT-05: Tighten prototype/reference trust-boundary signaling

Priority: P1

Problem:

- some capabilities are reference-shaped in code but still prototype-shaped in
  actual trust semantics
- revocation/status is the clearest example

Required outcome:

- package READMEs and conformance docs must say clearly:
  - what is final enough for reference use
  - what is still prototype-only
  - what the verifier/application must supply off-chain

Current grouped execution:

- stacked docs/spec slice:
  - status taxonomy + conformance alignment

### VC-MAT-06: Harden the protocol state-store seam

Priority: P1

Problem:

- current `ProtocolStateStore` is useful, but backend semantics remain biased
  toward in-memory/reference behavior
- async backends, eviction policy, and mutation safety need a cleaner contract
- production-facing orchestration defaults are still too implicit:
  the repo does not yet ship one obvious durable-state adapter, one explicit
  RNG requirement, and one short production checklist

Required outcome:

- decide whether the interface remains sync-only
- document or redesign durable backend expectations
- add explicit guidance for storage-native pruning/eviction
- provide or clearly document a reference durable adapter path for real
  deployments
- require explicit cryptographic RNG selection or otherwise fail closed on
  unsafe defaults
- publish a short production checklist for `credentials-protocol`

Current grouped execution:

- landed protocol-state hardening slices now cover:
  - optional batch-delete support for protocol-state collections
  - zero-capacity fast path for finalized-outcome retention
  - hidden-holder credential persistence behind `ProtocolStateStore`
  - explicit-holder credential persistence behind `ProtocolStateStore`
  - startup credential-count recovery after metadata drift
  - shared ordinal recovery helpers
  - optional `maxOrdinalKey()` hints for append-only collections
- remaining seam decision:
  - decide whether the current synchronous interface is final
  - or redesign around an explicit async durability contract
  - if no real async adapter is on the near-term roadmap, prefer freezing the
    current synchronous seam as a capability-typed contract instead of adding
    more ad hoc optional methods

### VC-MAT-07: Reduce accidental public surface inflation

Priority: P1

Problem:

- generated family bundles expose large portions of the transitive core surface
- this weakens the “import from the smallest package” guidance

Required outcome:

- define intentional public package entrypoints and subpaths
- decide where namespace-only re-exports are acceptable
- prefer narrow package surfaces for new packages/demos

Current grouped execution:

- boundary-hardening slice:
  - refresh the package-boundary regression guard and land it through `#61`
  - block sibling `../<package>/src/...` imports in repo validation
  - replace direct cross-package `src/test` imports with exported testing surfaces
- follow-up contract-surface slice:
  - add stable `./contract` subpaths for the primary VC/family/demo packages
  - add a dedicated `./contract-revocation` subpath for the revocation demo
  - preserve existing root exports during the transition
- follow-up root-surface slice:
  - remove duplicate `*Contract` namespace aliases from the root TypeScript
    entrypoints
  - make the stable subpaths the canonical contract-facing imports
- follow-up boundary-guard slice:
  - extend `check:package-boundaries` to block duplicate root `*Contract`
    namespace aliases in the curated package entrypoints

### VC-MAT-08: Add starter templates and “Hello World” integration paths

Priority: P1

Problem:

- new issuers, verifiers, and credential families still require source
  archeology

Required outcome:

- add at least:
  - minimal verifier contract template
  - minimal family scaffold
  - minimal hidden-holder demo walkthrough

Current grouped execution:

- starter-template slice landed through `#63`:
  - docs-only verifier contract template
  - docs-only family scaffold template
  - docs-only hidden-holder hello-world walkthrough
- still missing if deeper onboarding is needed later:
  - a generated family scaffold or copy script
  - a tiny runnable hello-family / hello-verifier starter, not only markdown
    templates
  - issuer-oriented starter path
  - wallet-oriented starter path
  - a DID + VC handoff checklist for downstream repos consuming DID tarballs
    plus VC packages
  - one authoritative cross-repo smoke path that starts from the DID packaging
    boundary and ends in one VC issuance/presentation/verification flow
  - a tested DID-tarball to VC-workspace compatibility/version matrix for that
    cross-repo path

### VC-MAT-09: Keep test docs aligned with real package/test coverage

Priority: P1

Problem:

- the testing docs drift as new packages and focused lanes land

Required outcome:

- test matrix tracks:
  - `credentials-status-registry`
  - `credentials-same-holder`
  - `credentials-protocol`
  - `demo-revocation`
  - focused lanes such as `ci:revocation`

Current progress:

- the docs now cover:
  - docs-only CI fast path
  - BDD-only CI lane classification
  - `vc-bdd-scenarios`
  - the revocation demo lane
- remaining risk:
  - the test docs will keep drifting unless every new lane and scenario slice
    updates them in the same PR
  - the split-repo architecture is still under-tested as one authoritative
    consumer journey unless a thin DID + VC cross-repo smoke path is kept alive

### VC-MAT-10: Start maintaining `CHANGELOG.md` for compatibility-significant changes

Priority: P1

Problem:

- surface changes have landed without a stable compatibility record

Required outcome:

- log breaking or compatibility-relevant changes, including:
  - required `ProtocolStateCollection.entries()`
  - status model simplification
  - verifier status capability changes
  - future package entrypoint changes

Current grouped execution:

- stacked docs slice:
  - initialize `CHANGELOG.md` with Keep a Changelog sections
  - record compatibility-significant VC status, revocation-demo, and holder
    binding surface changes

### VC-MAT-11: Decide ownership of the status DSL and package layer placement

Priority: P1

Problem:

- the status capability structs and policy types currently live in
  `credentials` core
- the actual registry contract and most off-chain status workflow code live in
  `credentials-status-registry`
- the architecture docs do not clearly explain whether this is:
  - intentional Layer-1 core ownership
  - temporary migration staging
  - or a misplaced package boundary

Required outcome:

- decide one of:
  - keep status DSL in `credentials` and document it as a core capability
  - move status DSL into a dedicated status capability package
  - keep the registry package as the owner and re-export through core during a
    migration period
- document the choice in architecture and package-boundary docs

Current architectural direction to evaluate:

- unify the VC-side status binding shape
- separate presentation-time proof modes, for example:
  - authority-attested status proof
  - revoked-set non-membership proof

Current grouped execution:

- docs/spec direction already landed:
  - `credentials` owns VC-side status binding shape
  - `credentials-status-registry` owns registry-specific proof-protocol helpers
    and off-chain builders
- this slice now landed:
  - registry-facing Compact proof-protocol types and validators moved into
    `credentials-status-registry`
  - the canonical Compact surface now matches the documented ownership split
- remaining architectural work moved under `VC-MAT-20`:
  - final trust-model hardening for the status contract itself

### VC-MAT-12: Add a dedicated status capability conformance category

Priority: P1

Problem:

- status support is orthogonal to holder binding
- current conformance text folds status into hidden-holder/profile language,
  which makes the model harder to reason about and contradicts shipped
  authority-attested status behavior

Required outcome:

- add a dedicated conformance category for status capability implementations
- list conformance expectations separately for:
  - `NoStatusCapability`
  - `RevokedSetNonMembershipStatusCapability`
  - `AuthorityAttestedStatusCapability`
- clarify prototype vs reference claims for each path

Current grouped execution:

- stacked docs/spec slice:
  - status taxonomy + conformance alignment

### VC-MAT-13: Publish a canonical onchain/offchain/dual surface map

Priority: P1

Problem:

- integrators cannot reliably tell which exported types/functions are:
  - onchain-only
  - offchain-only
  - or dual-use bridges
- this is especially risky for:
  - `pureCircuits.*`
  - status verification helpers
  - off-chain DID helpers
  - demo simulators and generated `Contract` shells

Required outcome:

- add one canonical architecture guide that classifies public surfaces as:
  - `ONCHAIN-ONLY`
  - `OFFCHAIN-ONLY`
  - `DUAL`
- propagate the classification to package READMEs for the most-used surfaces

### VC-MAT-14: Close the tactical protocol-state hardening gaps

Priority: P1

Problem:

- in addition to the larger seam redesign, there are specific open issues that
  should be fixed quickly:
  - mid-iteration deletion during expiry pruning
  - self-eviction edge case during finalized-outcome retention
  - sync-vs-async interface ambiguity
  - in-memory-only holder credential retention
  - O(n) write-path scans and persistent-adapter contract drift

Required outcome:

- track and close the tactical fixes independently of any larger storage
  refactor
- keep the persistent-adapter contract documented in one place instead of
  expanding it ad hoc across PRs

Current grouped execution:

- landed tactical fixes now include:
  - snapshot-based expiry pruning
  - tied-timestamp retention behavior
  - optional `deleteMany(keys)` support during pruning/eviction
  - zero-capacity fast path for finalized outcome retention
  - hidden-holder credential persistence
  - explicit-holder credential persistence
  - metadata-drift recovery for holder credential counters
  - shared ordinal recovery helpers and `maxOrdinalKey()` hints
- remaining work, if any, should now fold into `VC-MAT-06` rather than reopen a
  separate tactical bucket

### VC-MAT-15: Curate Layer 3 and family package public surfaces

Priority: P1

Problem:

- family bundles and demo packages expose more surface than intended:
  - broad transitive re-exports
  - duplicate namespace exports
  - deploy-looking empty core stubs
  - dormant demo artifacts that are not part of the validated workspace

Required outcome:

- keep demo packages intentionally narrow and business-facing
- reduce accidental family re-export inflation
- decide whether namespace exports stay or go
- either remove or quarantine dormant artifacts such as
  `passport-compliance-demo.compact`
- make it explicit that the core `credentials` contract shell is not a
  deployable business contract

Current progress:

- `credentials-demo-contract` now hosts a dedicated narrow
  `demo-revocation.compact` module
- the repository documents the “small business-facing demos” rule explicitly
- stable contract-facing subpath exports now exist for the main
  VC/family/demo packages
- duplicate root `*Contract` namespace aliases were removed so the narrower
  subpaths are the single obvious import path
- `check:package-boundaries` now blocks those aliases from reappearing
- the dormant `passport-compliance-demo.compact` artifact is quarantined from
  the supported demo surface
- this item is now mostly closed for the current workspace; any remaining work
  is incremental public-surface curation rather than a repo-shaping gap

Current grouped execution:

- maintain the current guardrails as new packages land rather than reopening
  the same broad-surface cleanup track

### VC-MAT-18: Publish a canonical reusable-core / prototype / wiring inventory

Priority: P1

Problem:

- the repository now has good pieces of this story spread across:
  - the core VC spec
  - architecture docs
  - package READMEs
  - integration guides
- but there is still no single canonical inventory that tells integrators which
  packages and public surfaces are:
  - reusable core VC components
  - reusable core protocols
  - prototype-only surfaces
  - Layer 3 / Layer 4 wiring and helpers

Required outcome:

- publish one canonical inventory in the architecture/spec set
- align package READMEs and conformance language to that inventory
- make the maturity tiers explicit enough that integrators do not infer
  stability from package presence alone
- standardize a per-package header that states:
  - tier
  - stability
  - allowed dependency direction
  - whether the package is reusable outside this repo
- add CI/load-bearing checks so the tier classification cannot silently drift
- make the inventory explicit for both:
  - package classes
  - protocol classes
- give integrators one obvious answer to:
  - which packages are reusable core
  - which are prototype-only
  - which are wiring/helpers

### VC-MAT-19: Separate reusable core protocols from Layer 3 / Layer 4 wiring protocols

Priority: P1

Problem:

- the repository correctly says transport is not canonical, but it still
  describes some reusable core protocol semantics and some off-chain reference
  orchestration too close together
- this is most visible in:
  - generic issuance/presentation semantics in `credentials`
  - reference orchestration in `credentials-protocol`
  - status/revocation request and proof vocabulary split across `credentials`
    and `credentials-status-registry`

Required outcome:

- explicitly classify which protocols belong to the reusable core spec
- explicitly classify which protocols are Layer 3 business-composition or
  Layer 4 transport/orchestration helpers
- tighten package-boundary, overview, and README language so “reference
  protocol” does not get mistaken for “core reusable protocol”
- evaluate whether shared proof-protocol Compact types should live in a
  dedicated lower shared package rather than forcing the final ownership choice
  to be only:
  - `credentials`
  - or `credentials-status-registry`
- keep the rule explicit that:
  - `credentials-protocol` is orchestration/wiring, not a reusable core
    protocol package
- make the preferred end-state legible enough that core proof-protocol
  semantics can be reused without dragging in Layer 3 or Layer 4 helpers

### VC-MAT-20: Finish the cryptographic status contract

Priority: P1

Problem:

- the current status/revocation model still depends on prototype trust seams:
  - `revokedRoot` freshness and authenticity are verifier/application-side
  - the final in-circuit non-membership proof path is not shipped
  - the first hidden-holder family rollout now lands in
    `credentials-birth-secret`, but the broader repository still has not
    completed the status-binding body-root rollout across the remaining
    status-aware family surfaces
- the authority-attested helper path still exposes caller-managed signing nonce
  generation as a prototype API footgun

Required outcome:

- bind the live registry root inside Compact rather than treating
  `revokedRoot` as an externally coordinated snapshot
- ship the end-to-end non-membership proof protocol as the canonical
  non-authority-attested path
- commit the full status binding into the issuer-signed credential body root,
  including:
  - registry id
  - list/index or handle location
  - status type
  - authority key material where applicable
  - and extend that commitment model beyond the first
    `credentials-birth-secret` rollout
- anchor status root freshness to a trust-bound source instead of a
  verifier-chosen root alone
- add freshness semantics to authority-attested proofs with verifier-enforced
  max-age policy
- remove or narrow unsafe caller-supplied nonce handling in
  authority-attested helper APIs
- add adversarial conformance coverage for:
  - registry swap
  - root substitution
  - stale attestation replay
  - index mismatch
  - missing-binding cases
- document the resulting status maturity claim clearly in the core spec,
  conformance, and package READMEs
- make the resulting trust-model choice obvious to integrators:
  - when verifier-supplied-root is acceptable as a prototype
  - when authority-attested status is acceptable as a prototype bridge
  - when the canonical non-membership path becomes the preferred reference
    architecture

## Recommended Execution Order

The current authoritative execution order is the twenty-slice plan above.

1. `STATUS-CONTRACT` slices `1` through `10`
2. `INTEGRATOR-EXECUTION` slices `11` through `16`
3. `BDD-LIVE-DOCS` slices `17` through `19`
4. `ORCHESTRATION-PROD-SAFETY` slice `20`
5. `TEST-DOC-ALIGNMENT` as a cross-cutting requirement on every slice

## Notes

- Several of these items may already be partially addressed in stacked docs
  branches or unmerged PRs. They stay on this backlog until the changes land on
  `develop`.
- This backlog is intentionally repo-wide. It is not limited to the current
  revocation demo slice.
