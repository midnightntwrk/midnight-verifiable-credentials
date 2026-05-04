# VC Maturity Backlog

Status: active repository-audit backlog for capability, documentation,
packaging, and integration hardening.

Purpose:

- capture repo-wide maturity gaps that cut across individual feature PRs
- separate accepted issues from overstated or already-partially-addressed
  findings
- provide a stable backlog for follow-up engineering and documentation slices

## Status Update: 2026-05-05

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
- package maturity and status-taxonomy/conformance alignment:
  - `#49`
  - `#53`

Substantially addressed on `develop`:

- `VC-MAT-01`
- `VC-MAT-02`
- `VC-MAT-03`
- `VC-MAT-05`
- `VC-MAT-12`
- `VC-MAT-13`

Partially advanced, but still active:

- `VC-MAT-09`
- `VC-MAT-15`

Next active queue:

1. `VC-MAT-04`
2. `VC-MAT-10`
3. `VC-MAT-06`
4. `VC-MAT-14`
5. `VC-MAT-07`
6. `VC-MAT-11`
7. `VC-MAT-08`

## Triage Legend

- `Accepted`: valid finding, should remain on the backlog until fixed
- `Accepted (narrowed)`: valid underlying issue, but the original wording
  overstates the current risk or scope
- `Partially addressed elsewhere`: valid finding that is already being worked
  in another stacked docs/spec slice and should remain open until merged
- `Deferred`: valid but not the best next move relative to more urgent gaps

## Triage of Current VC Repository Audit Findings

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
- `credentials-demo-contract/src/passport-compliance-demo.compact` is labeled as
  adjacent-prototype/example material rather than current validated workspace

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

- architectural terminology/spec slice:
  - status binding and proof-protocol split

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

Current grouped execution:

- stacked additive runtime/docs slice:
  - core TS alias export for `OffchainDIDHolderBinding`
  - docs aligned around Compact/core name vs public-facing TS name

Current grouped execution:

- stacked additive runtime/docs slice:
  - core TS alias export for `OffchainDIDHolderBinding`
  - docs aligned around Compact/core name vs public-facing TS name

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

Required outcome:

- decide whether the interface remains sync-only
- document or redesign durable backend expectations
- add explicit guidance for storage-native pruning/eviction

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
  - refresh the package-boundary regression guard and land it through `#20`
  - block sibling `../<package>/src/...` imports in repo validation
  - replace direct cross-package `src/test` imports with exported testing surfaces

Related carry-over work:

- merge and maintain the revived guardrail PR:
  - `#20` `codex/vc-boundary-guardrail`

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

- stacked docs slice:
  - status DSL ownership and import normalization

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
- dormant artifact cleanup and export-surface reduction are still pending

## Recommended Execution Order

1. `VC-MAT-01`
2. `VC-MAT-02`
3. `VC-MAT-03`
4. `VC-MAT-05`
5. `VC-MAT-09`
6. `VC-MAT-10`
7. `VC-MAT-04`
8. `VC-MAT-06`
9. `VC-MAT-07`
10. `VC-MAT-08`
11. `VC-MAT-11`
12. `VC-MAT-12`
13. `VC-MAT-13`
14. `VC-MAT-14`
15. `VC-MAT-15`
16. `VC-MAT-16`

## Notes

- Several of these items may already be partially addressed in stacked docs
  branches or unmerged PRs. They stay on this backlog until the changes land on
  `develop`.
- This backlog is intentionally repo-wide. It is not limited to the current
  revocation demo slice.
