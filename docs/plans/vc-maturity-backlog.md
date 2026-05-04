# VC Maturity Backlog

Status: active repository-audit backlog for capability, documentation,
packaging, and integration hardening.

Purpose:

- capture repo-wide maturity gaps that cut across individual feature PRs
- separate accepted issues from overstated or already-partially-addressed
  findings
- provide a stable backlog for follow-up engineering and documentation slices

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

### VC-MAT-04: Resolve `OffchainDIDHolderBinding` vs `OffchainMidnightHolderBinding`

Priority: P1

Problem:

- docs and package surfaces use overlapping names for the same conceptual
  holder-binding family

Decision needed:

- either:
  - keep `OffchainMidnightHolderBinding` as canonical and document
    `OffchainDIDHolderBinding` as descriptive language only
- or:
  - add a stable alias and migrate docs plus runtime exports fully

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

## Notes

- Several of these items may already be partially addressed in stacked docs
  branches or unmerged PRs. They stay on this backlog until the changes land on
  `develop`.
- This backlog is intentionally repo-wide. It is not limited to the current
  revocation demo slice.
