# VC Production Backlog Execution Plan

Status: active branch and PR map.

2026-07-30 reconciliation: `origin/main` is signed promotion commit `b34878b`
(PR #358), while execution remains on `origin/develop` at `50dffbb`.

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

## 2026-07-30 current PR reconciliation and ordered queue

Verified current state: #336 is open at `bd4c7d4` without terminal full-gate
evidence; #337 is open at `860e0fa` with Standalone Integration: Protocol
pending; #353 merged its CODEOWNERS fix at `16710ce` and therefore needs an
audit, not a new rebase of the merged PR; #357 is open at `66c1cc0` with Build
and Package Tests failing; #358 merged at signed commit `b34878b`; and #346 is
closed/superseded. Keep all maturity issues open unless their independent
conditions are evidenced.

Today's queue is ordered by dependency and release risk, not PR number:

1. **#336:** reconcile against current `develop`, resolve `pnpm-lock.yaml`,
   then rerun CI and review. Its disclosure work is partial P1-3/G3 evidence,
   not passport graduation or generic disclosure closure.
2. **#337:** complete the metadata and gate requirements, then merge only after
   current-head terminal gate evidence; it remains a P0-6 maintenance candidate.
3. **#353:** audit the merged CODEOWNERS change against post-#358 `main` and
   preserve the union of ex-identus, security, SRE, and path-specific owners;
   create a narrowly scoped follow-up only if that audit finds a gap.
4. **#357:** keep the PR limited to manifest cleanup, separate its unrelated
   digital-passport failure, and repair the recorded invalid `.devloops` gate
   configuration before rerunning CI.
5. **#342:** advance only after the release contract, exact artifact/provenance
   evidence, and clean-consumer verification support `0.1.0-rc1`.
6. **A1/E2/F1/G1:** begin only on the disjoint surfaces and with their existing
   authority dependencies; no final profile status is scheduled before DID,
   trust, status, time, replay, artifact, and gate prerequisites are real.

Keep maximum active stack depth at two. A promotion or green summary does not
remove the existing stop conditions, and no queue item is merge-ready merely
because #358 made `main` current.

## Branch graph

```text
PR-00 architecture/backlog (independent)

develop
|- Track A: verification authority
|  |- PR-A0 verification threat model, v1 specification, and test design
|  |- PR-A1 verification transcript and result contract (after A0)
|  |- PR-A2 decision nullifier and replay semantics (stacked on A1)
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
|  `- PR-E2 durable idempotent session state (stacked on E1)
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
| PR-A1 | `codex/vc-verification-contract-v1` | `develop` after A0 | authoritative `persistentHash` encoding spike, transcript/public-input/result types, evidence bindings, fail-closed API skeleton, digest and mutation tests; no final-profile claim | A0 merged; supported Compact encoding surface identified; cross-runtime digest vectors; core build/test, typecheck, surface discipline, light gate, Claude security review |
| PR-A2 | `codex/vc-decision-nullifier-v1` | PR-A1 | request/holder/credential replay scopes, persistent nullifier semantics, and atomic generic capability tests | focused contract tests, restart/race/rollback tests, light gate, Claude security review |
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
| PR-E2 | `codex/vc-durable-protocol-sessions` | PR-E1 | durable multi-instance sessions, idempotency, cancellation, expiry and races | protocol/restart/race suites, light gate, Claude review |
| PR-F1 | `codex/vc-oid4vc-final-profile` | `develop` | OID4VCI/OID4VP final profile, DCQL, nonce/audience/request-object mappings | OpenID tests/vectors, protocol tests, light gate, Claude protocol review |
| PR-F2 | `codex/vc-dapp-connector-extension` | `develop` after upstream API agreement | nested `extensions["org.midnight.credentials"]`, capabilities and sessions | upstream connector compatibility, injected/mobile harness, origin/consent tests, Claude review |
| PR-G1 | `codex/vc-zk-artifact-manifests` | `develop` | build/deployment manifest schemas, digest verifier, locator API | reproducibility/negative tests, pack consumer test, light gate, Claude supply-chain review |
| PR-G2 | `codex/vc-product-composition-kit` | `develop` after A/B/C/G1 contracts | bounded composition manifest, validation CLI, Turbo product generator | generated-repo build/pack/conformance test, light gate, Claude architecture review |
| PR-G3 | `codex/vc-digital-passport-correctness` | `develop` | five-claim/docs alignment, dependency boundary, calendar age, encoding/version/status posture | digital-passport build/tests, product fixtures, light gate, Claude domain/security review |
| PR-H1 | `codex/vc-display-locale-model` | `develop` | framework-neutral privacy/display model with BCP 47, direction and normalization metadata | model/property/accessibility tests, pack tests, light gate, Claude privacy review |
| PR-H2 | `codex/vc-passport-transliteration-profile` | PR-H1 or product repo | versioned original-script and ICAO-oriented transliteration profile | multilingual fixtures, normalization/bidi tests, product review, Claude privacy review |

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

The first autonomous window is deliberately bounded:

1. Publish PR-00, obtain Claude review, and watch all selected CI checks.
2. Start PR-D1 from `origin/develop` as an independent branch because CI/gate
   repair should not be stacked on documentation.
3. If PR-D1 exposes a large or CI-only failure, stop that lane and start the
   disjoint PR-E1 CSPRNG audit/implementation instead.
4. If PR-D1 is locally green and remains reviewable, finish and publish it; do
   not create PR-D2 until PR-D1 merges.
5. Use remaining time for PR-C1 discovery and the smallest consumer-correct
   package slice that can pass the full package/light gate. Do not mix all
   package releases into one emergency refactor.
6. Merge only PRs with terminal green CI, acceptable GitHub review state, a
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
