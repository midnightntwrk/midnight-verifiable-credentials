# VC Production Backlog Execution Plan

Status: active branch and PR map, reconciled 2026-09-02 for A2 implementation
state, with historical `origin/develop` baseline `103e3e8`.

Merged baseline: PR-A1/#335 (verification core), PR-G1/#415 (artifact-manifest
integrity foundation), and PR-E2/#416 (protocol state-store foundation). Issue
#498 supersedes the old local A2 checkpoint `4b514ec` with replay primitives
plus the required stateful atomicity fixture; it remains outside the merged
baseline until its stacked PR merges.

Execution window starts 2026-07-16. The canonical scope and acceptance criteria
remain in [`vc-maturity-backlog.md`](./vc-maturity-backlog.md); this document
defines how that backlog is divided into reviewable branches.

## SDLC rules

1. Every change starts on a dedicated `codex/*` branch in the repository that
   owns the code. The default base is current `origin/develop`.
2. Independent work uses independent PRs. A stacked PR is allowed only when it
   is a small logical continuation of a locally green baseline PR.
3. Maximum active stack depth is two. CI or infrastructure repairs are never
   stacked on an unmerged baseline.
4. Every commit is GPG-signed and carries a DCO sign-off.
5. Before opening a VC PR, run the focused checks and `./run.sh --light`. Run
   the workspace identity PR gate when the workspace state permits it.
6. Every PR receives a fresh Claude CLI review. Verified critical findings are
   fixed before merge; substantive fixes trigger another review.
7. Required GitHub CI targets are watched to terminal state. A dependent branch
   stops advancing when its baseline has a real CI failure.
8. Merge bottom-up. Rebase or retarget the next stacked PR onto updated
   `develop`, rerun its focused gate, and use `--force-with-lease` when needed.
9. Repository boundaries remain strict. Cross-repository changes are separate
   PRs and flow through published packages or workspace-copied tarballs.

## Branch graph

```text
PR-00 architecture/backlog (independent)

develop
|- Track A: verification authority
|  |- PR-A0 verification threat model, v1 specification, and test design
|  |- PR-A1 verification transcript and result contract (after A0)
|  |- PR-A2 atomic replay/nullifier contract (#498 stacked implementation)
|  `- PR-A3 final ledger profiles (after authority dependencies)
|- Track B: identity/status authority
|  |- PR-B0 status/time authority threat model and negative-test design
|  |- PR-B3 trusted-time evidence adapter (after B0)
|  |- PR-B1 authenticated status mutation and registry ownership (after B0/B3)
|  `- PR-B2 accepted-root and non-membership proof (stacked only when feasible)
|- Track C: release correctness
|  |- PR-C1 publishable package contract and export policy
|  `- PR-C2 clean-consumer pack tests (stacked on C1)
|- Track D: truthful gates and supply chain
|  |- PR-D1 complete workspace/package light-gate coverage
|  `- PR-D2 develop-branch security and provenance gates (independent after D1)
|- Track E: protocol safety
|  |- PR-E1 CSPRNG-only production constructors
|  `- PR-E2 durable idempotent session foundation (merged in #416; follow-up pending)
|- Track F: interoperability and wallet
|  |- PR-F1 final OID4VCI/OID4VP profile and DCQL
|  `- PR-F2 existing DApp Connector credentials extension
|- Track G: product composition
|  |- PR-G1 artifact/deployment manifest schemas and verifier
|  |- PR-G2 bounded product composition manifest and generator
|  `- PR-G3 digital-passport correctness and graduation candidate
`- Track H: presentation
   |- PR-H1 framework-neutral display and locale model
   `- PR-H2 product-owned passport transliteration profile
```

Only one stack in a track may be active at a time. Independent tracks may have
open PRs concurrently when they touch disjoint files and CI capacity remains
useful.

## PR map

| ID | Branch | Base | Scope | Required before merge |
| --- | --- | --- | --- | --- |
| PR-00 | `codex/vc-production-readiness-backlog` | `develop` | ADR register, canonical backlog, package inventory, this execution map | docs links, policy checks, light gate, Claude review, CI |
| PR-A0 | `codex/vc-verification-threat-model-v1` | `develop` | canonical transcript/nullifier ADR, v1 authority specification, threat model, and negative-test design | docs links, policy checks, light gate, Claude security review |
| PR-A1 | `codex/vc-verification-contract-v1` | `develop` after A0 | **Merged in PR #335**: authoritative `persistentHash` encoding spike, transcript/public-input/result types, evidence bindings, fail-closed API skeleton, digest and mutation tests; no final-profile claim | Merged baseline; final profile remains open |
| PR-A2 | `codex/issue-498-atomic-decision-nullifier` | `codex/issue-497-trusted-time-evidence` | **Issue #498 implementation**: Compact/TypeScript request/holder/credential replay scopes plus explicit-holder age-gate contract-derived nullifier consumption, duplicate/conflict receipts, and stateful restart/concurrency/rollback evidence | Core and age-gate tests, generated artifact comparison, relevant use-case lane, light gate, external security review, stacked CI |
| PR-A3 | `codex/vc-verification-profiles-v1` | `develop` after required B/G and upstream authority work | final `ledger-local-v1` and `ledger-attested-v1` evidence adapters and profile integration | DID/trust/status/time/artifact/connector prerequisites for claimed modes, full differential matrix, light gate, independent security review |
| PR-B0 | `codex/vc-status-time-threat-model-v1` | `develop` | ADRs and normative contract for authenticated registry ownership, root/non-membership, freshness, trusted time, and the required negative-test design | docs links, policy checks, light gate, Claude security review |
| PR-B1 | `codex/vc-status-registry-authority` | `develop` after B0 and the required B3 time surface | authenticated initialization/mutation, issuer/schema-major ownership, negative tests | B0 merged; authorization time source is authoritative; revocation lane, Compact build/tests, light gate, Claude security review |
| PR-B2 | `codex/vc-status-root-nonmembership` | PR-B1 | accepted-root equality and actual non-membership proof | upstream capability confirmed, revocation + integration lanes, full proof metrics, Claude cryptography review |
| PR-B3 | `codex/vc-trusted-time-authority` | `develop` after B0; blocked on the full execution-context anchor | ledger-derived or bounded authority-attested time evidence and freshness adapter | comparison-only capability is confirmed, but position, context-error/window, and context-digest authority must be resolved; then expiry/future/stale vectors, light gate, Claude security review |
| PR-C1 | `codex/vc-release-package-contract` | `develop` | public inventory, versions/ranges, ESM/CJS policy, metadata and prepack correctness | manifest checks, build/package tests, light gate, Claude release review |
| PR-C2 | `codex/vc-pack-consumer-tests` | PR-C1 | clean-checkout tarball installation and representative Node/bundler/Compact consumers | pack matrix, no-workspace consumer tests, light gate, Claude review |
| PR-D1 | `codex/vc-truthful-light-gate` | `develop` | catalog-driven inclusion of all non-Docker workspaces and packaging; reject unknown flags | catalog self-tests, all light targets, light gate, CI workflow checks, Claude CI review |
| PR-D2 | `codex/vc-develop-security-gates` | `develop` after D1 | scan `develop`, pnpm dependency updates/review, SBOM/provenance policy | workflow syntax/pin checks, security CI, light gate, Claude security review |
| PR-E1 | `codex/vc-protocol-csprng` | `develop` | production randomness factory and removal of unsafe default selection | protocol tests, replay/expiry vectors, typecheck, light gate, Claude security review |
| PR-E2 | `codex/vc-e2-durable-sessions` | `develop` after E1 | **Foundation merged in PR #416**: atomic state-store transitions, retained outcomes, cancellation, and one-time result claims; processing leases, agent wiring, multi-record transactions, crash recovery, and business-side-effect coupling remain | Full protocol/restart/race suite, multi-instance transaction semantics, light gate, Claude review; do not claim exactly-once delivery |
| PR-F1 | `codex/vc-oid4vc-final-profile` | `develop` | OID4VCI/OID4VP final profile, DCQL, nonce/audience/request-object mappings | OpenID tests/vectors, protocol tests, light gate, Claude protocol review |
| PR-F2 | `codex/vc-dapp-connector-extension` | `develop` after upstream API agreement | nested `extensions["org.midnight.credentials"]`, capabilities and sessions | upstream connector compatibility, injected/mobile harness, origin/consent tests, Claude review |
| PR-G1 | `codex/vc-zk-artifact-manifests` | `develop` | **Foundation merged in PR #415**: canonical manifest schemas, SHA-256 integrity, Ed25519 signatures, trusted-key verification, and fail-closed artifact resolution; real Compact-output generation and distribution remain | Follow-up generation/locator/cache/release work; reproducibility/negative tests, pack consumer test, light gate, Claude supply-chain review |
| PR-G2 | `codex/vc-product-composition-kit` | `develop` after A/B/C/G1 contracts | bounded composition manifest, validation CLI, Turbo product generator | generated-repo build/pack/conformance test, light gate, Claude architecture review |
| PR-G3 | `codex/vc-digital-passport-correctness` | `develop` | five-claim/docs alignment, dependency boundary, calendar age, encoding/version/status posture | digital-passport build/tests, product fixtures, light gate, Claude domain/security review |
| PR-H1 | `codex/vc-display-locale-model` | `develop` | framework-neutral privacy/display model with BCP 47, direction and normalization metadata | model/property/accessibility tests, pack tests, light gate, Claude privacy review |
| PR-H2 | `codex/vc-passport-transliteration-profile` | PR-H1 or product repo | versioned original-script and ICAO-oriented transliteration profile | multilingual fixtures, normalization/bidi tests, product review, Claude privacy review |
| PR-Q1 | `codex/vc-quality-evidence-catalog` | `develop` | measurable quality-evidence catalog and checker contracts | package/profile scopes, catalog fixtures, light gate, CI workflow checks, Claude CI review |
## Current follow-up inventory

This inventory was reconciled on 2026-08-11 against the current GitHub
branch/PR state. Only entries explicitly marked local are local preparation;
open or draft PRs remain subject to their own review, repository gates, and
current-head CI, and the closed entry is not an active lane:

- `codex/vc-a2-replay-scope-primitives` at `4b514ec` — **local** A2 Compact/TypeScript primitive checkpoint; the stateful atomic fixture remains open.
- `codex/vc-display-locale-model` — **open PR #418** (H1 incubating display/locale model).
- `codex/vc-zk-artifact-manifest-generation` — **closed PR #419** (G1 generation attempt); do not treat it as an active or merge-ready branch.
- `codex/vc-quality-evidence-catalog` — **draft PR #421** (Q1 evidence-contract/checker work).
- `codex/vc-backlog-rebaseline` — **open PR #420**, this documentation reconciliation.
- E2 has no separate divergent local branch at this baseline: the foundation is merged in PR #416 and the processing-lease follow-up has not started.

## Cross-repository prerequisites

Some P0 outcomes cannot be implemented safely in VC alone:

- DID key plus verification-relationship evidence belongs in `midnight-did` on
  its own branch and PR. VC consumes the merged package tarballs in a later
  branch; it never imports DID source.
- Trust-registry authorization proofs and epoch evidence belong in
  `midnight-trust-registry`. VC owns only the accepted evidence shape and final
  VC composition.
- The DApp Connector extension registry belongs in the repository that publishes
  `@midnight-ntwrk/dapp-connector-api`. The VC branch starts only after that API
  contract is agreed or available as a released package/tarball.
- A concrete digital-passport repository is created only after ownership,
  governance, release, and support criteria in ADR-0013 are satisfied.

Cross-repository PRs are independent queues. Their downstream VC PRs wait for a
merged producer release and a workspace tarball sync.

## CI target policy

Every PR watches the checks selected by `.github/workflows/ci.yml` and
`.github/workflows/scan.yaml`, not only the first green summary. At minimum:

| Change class | Local/focused targets | GitHub targets to inspect |
| --- | --- | --- |
| Docs/ADR/plan | `docs:links`, documentation policy checks, `./run.sh --light` | docs/change classification, lint/policy, required summary |
| Package metadata/release | manifest and package-boundary checks, `artifacts:pack`, clean-consumer tests, light gate | lint, typecheck, package tests, artifact/build-cone consumers |
| Core/Compact/status | owning build/test/revocation lane, light gate, proof metrics when relevant | Compact prepare/build cones, package tests, revocation, affected integration lanes |
| Protocol/OpenID | owning protocol/OpenID tests, replay/expiry tests, light gate | lint, typecheck, protocol/university flows selected by classifier |
| Workflow/security | catalog/classifier self-tests and light gate | every changed workflow/security target, with logs inspected independently |

A green skipped job is not evidence that an affected surface was tested. If the
classifier skips an expected target, fix the classifier or run the target
manually and attach evidence before merge.

## First eight-hour tranche

The first autonomous window is deliberately bounded and its D1/E1 branch-start
instructions are now historical: both tracks have completed their initial
changes and must not be restarted as duplicate PRs:

1. Preserve PR-00 as the bounded planning/reconciliation item, obtain review,
   and watch all selected CI checks.
2. PR-D1 is complete in PR #326; use its catalog-driven light-gate result as
   the baseline for follow-up work rather than starting PR-D1 again.
3. PR-E1 is complete in PR #329; use its CSPRNG constructor baseline for the
   remaining protocol-session work rather than starting PR-E1 again.
4. Continue only with disjoint, reviewable follow-up slices; do not create PR-D2
   until the D1 baseline and its current gates are reconciled.
5. Merge only PRs with terminal green CI, acceptable GitHub review state, a
   clean Claude review, and verified GPG/DCO commits.

Security-critical Compact changes in Tracks A and B require a dedicated
threat-model and test-design pass before editing. PR-A0 provides that gate for
Track A; Track B requires its own authority-specific equivalent. These changes
are not rushed merely to fill the first time window.

## Stop conditions

Stop the affected lane and report when:

- a baseline PR has a real CI failure;
- a required security property depends on an unmerged sibling-repository API;
- the implementation would duplicate Compact validity semantics in TypeScript;
- a branch exceeds one coherent review purpose;
- stack depth would exceed two;
- repository isolation would require a direct source reference;
- Claude reports a critical unresolved issue; or
- required CI/review/merge permissions are unavailable.

At the end of each autonomous window, record branches, commits, PR URLs,
validation, review findings, CI state, merges, blockers, and the exact next
backlog item. Do not claim a P0 item complete until its acceptance criteria in
the canonical backlog are met.
