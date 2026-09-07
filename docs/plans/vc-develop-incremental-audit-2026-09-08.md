# VC Develop Incremental Audit

Status: point-in-time architecture, product-surface, and delivery-control review.
This report updates the 2026-09-04 razor input after the feature stack was
merged. It recommends a freeze and simplification sequence; it does not
authorize deletion, publication, issue closure, or promotion to `main`.

Audit date: 2026-09-08 (Asia/Makassar)

Repository: `midnightntwrk/midnight-verifiable-credentials`

Audited branch: `origin/develop` at `b4a405e0e040`

Comparison baseline: `origin/develop` at `7a4ae4f6ea94` on 2026-09-04

Default branch: `origin/main` at `12cd54096727`

## Executive assessment

All 12 feature PRs identified in the September 4 audit were merged into
`develop` between September 4 and September 7. The previous pending-stack risk
is now repository risk: the branch added 403 changed files, about 28,300
authored code lines, 83,300 generated lines, four private workspaces, 21
internal dependency edges, and about 50 MiB of LFS proving material.

The implementation is well tested locally at the unit and repository-profile
level. That does not establish that the architecture is small, externally
interoperable, or ready to support. The public release set remains five
packages, while most of the merged behavior is private, local evidence. The
only independent public repository found consuming a VC package is the digital
passport repository, and it consumes `credential-compact@0.1.0-rc3`; it does
not exercise the new runtime resolver, proof-authority APIs, status split,
OpenID profile, or aggregate decision model.

The branch should not be promoted or published in its current form. The most
important reasons are:

1. Every merged feature PR still records `REVIEW_REQUIRED` and no approving
   review. The review rule was bypassed, and branch protection requires only
   `scan` rather than the full CI workflow.
2. Nine previously reported correctness/security issues remain open. Two are
   labeled blockers, including one in the supported `credential-proofs`
   package; another affects npm dist-tag rollback.
3. Several PRs say `Closes` for production-shaped issues while their own
   checked-in documentation says the result is reference-only, locally
   conformant, or blocked on unavailable ledger capability.
4. The supported root APIs grew by 91 named exports without an external
   consumer validating those contracts.
5. Private prototypes and use cases still dominate workspaces, CI, scripts,
   generated output, and LFS storage.

Recommended posture: freeze features, do not cut another RC, fix or remove the
known blocker surfaces, restore truthful review/CI controls, then execute a
small razor sequence from `origin/develop`.

## What changed since September 4

### Merged feature PRs

The former stack is fully merged into `develop`:

| PR | Merged result | Architectural effect |
| --- | --- | --- |
| #512 | Runtime credential-family resolution | Adds authenticated registry discovery and 16 runtime-family contract types to supported `credential-model`. |
| #515 | DID and trust authority evidence | Adds authority-provider, policy, transcript, and verification contracts to supported `credential-proofs`; also carries #516. |
| #517 | Authenticated status-root proofs | Adds a TypeScript SHA-256 reference verifier and one internal status package. |
| #518 | Trusted-time evidence | Adds time authority, policy, digest, checkpoint, and verifier contracts to supported `credential-proofs`. |
| #519 | Atomic age-gate decision nullifiers | Expands the private age-gate contract and doubles its primary prover-key class. |
| #520 | Proof/deployment authority and parity | Adds artifact authority and receipt contracts to supported `credential-proofs`. |
| #521 | Hidden-holder privacy hardening | Adds public-surface snapshot and verifier-binding helpers, plus broad private-package changes. |
| #522 | Verification V1 executors | Adds authority-bound executor behavior in private orchestration and compatibility packages. |
| #525 | Aggregate decision sets | Adds a multi-result profile to supported `credential-model` and implementation to the private compatibility package. |
| #526 | Strict OpenID Final profile | Expands the private OpenID package and local conformance fixtures. |
| #527 | University production evidence | Expands the already large private university use case. |
| #528 | Status/OpenID production evidence | Adds a fourth new private workspace and one more default light-gate target. |

PRs #513 and #514 were merged into #512's branch, and #516 was merged into
#515's branch. Their content reached `develop` through those parent PRs.

### Repository growth

| Measure | Sep 4 | Current | Delta |
| --- | ---: | ---: | ---: |
| Workspaces | 30 | 34 | +4 |
| Supported/public workspaces | 5 | 5 | 0 |
| Private/internal workspaces | 25 | 29 | +4 |
| Internal package dependency edges | 47 | 68 | +21 |
| Root `package.json` scripts | 172 | 183 | +11 |
| Named `run.sh` targets | 32 | 34 | +2 |
| Default non-Docker light-gate targets | 25 | 26 | +1 |
| Files under `tooling/scripts` | 70 | 73 | +3 |
| Tracked Markdown files under `docs/` | 101 | 107 | +6 |
| Decision documents | 18 | 19 | +1 |
| Checked-in generated files | 165 | 173 | +8 |
| Git LFS objects | 100 | 104 | +4 |
| Git LFS payload | about 759 MiB | about 809 MiB | about +50 MiB |

The current workspace catalog classifies 5 workspaces as supported and 29 as
internal: 7 core, 8 reference, 9 infrastructure, 2 lab, and 8 demo workspaces.
Thirty workspaces are buildable `dist` packages even though only five are
release surfaces.

### Diff composition

The direct, ancestry-safe diff from the September baseline is:

| Category | Files | Additions | Deletions |
| --- | ---: | ---: | ---: |
| Authored code | 171 | 28,265 | 346 |
| Generated Compact/profile output | 121 | 83,269 | 14,191 |
| Documentation | 52 | 1,435 | 143 |
| Configuration, manifests, and JSON contracts | 59 | 3,667 | 255 |
| Total | 403 | 116,636 | 14,935 |

The largest authored-code additions are in the private compatibility
credentials package, supported `credential-proofs`, orchestration, university,
supported `credential-model`, private OpenID, and the three new private status
packages. Tests are substantial, but test volume protects the chosen design;
it is not evidence that all of those boundaries are necessary.

## Highest-risk findings

### R1. The stack was merged without the configured human review gate

All 12 feature PRs currently show:

- `reviewDecision: REVIEW_REQUIRED`;
- no approving GitHub review; and
- no pending or failing recorded PR-head check; jobs selected by each PR's
  path classification passed.

`develop` protection requires one code-owner approval, but it also grants a PR
bypass allowance and does not enforce the rule for administrators. Only the
`scan` context is a required status check. The broad CI workflow is not a merge
requirement.

This means green implementation checks were available, but architectural
approval was not recorded, the full CI workflow was not required, and branch
policy did not stop the merge. Passing tests cannot substitute for deciding
whether 91 new public names and four new workspaces belong in the product.

Disposition:

1. Suspend the review bypass for ordinary delivery.
2. Require a bounded `lint + typecheck + unit + package-consumer` gate.
3. Require one approval from someone other than the implementation agent or
   merge operator for public API and security-model changes.
4. Keep expensive Compact and integration lanes path-aware or scheduled after
   the core gate becomes authoritative.

### R2. Known blocker and high-severity issues remain in shipped or release-critical surfaces

The following issues were open at the audit snapshot and the reported code
paths remain present:

| Issue | Surface | Current risk | Razor action |
| --- | --- | --- | --- |
| #471 | Supported `credential-proofs` | `createDeploymentManifest` signs before full structural validation. | Fix before any publication. |
| #475 | npm publication tooling | An unintended `latest` tag is removed rather than restoring the previous value. | Fix and exercise rollback before another RC. |
| #472 | Private OpenID | `presentation_submission` remains optional without the reported compensating rule. | Fix if OpenID survives; otherwise remove the affected adapter. |
| #473 | Private OpenID | Base `request_uri` validation remains less strict than the new fetch helpers. | Consolidate validation or remove the base path. |
| #476 | Private OpenID | Expiry fields use positive rather than non-negative integers. | Resolve against the pinned specification and add a compatibility decision. |
| #470 | Private protocol orchestration | A zero retention setting can delete unrelated retained outcomes. | Fix before reuse, or delete with the orchestration surface. |
| #474, #481 | Private display | Runtime validation does not enforce two documented display invariants. | Fix only if display remains in scope; otherwise defer outside the release graph. |
| #477 | Quality-evidence tooling | A purported SHA-256 value is only checked for non-emptiness. | Remove the evidence framework or enforce the digest contract. |

The repository should not add more production-shaped evidence on top of known
blockers. Correctness fixes and deletion of unused affected surfaces take
priority over new capability work.

### R3. Public API growth is not backed by public-consumer evidence

The supported package count did not change, but two supported root APIs grew
materially:

| Package | Named root exports before | Current | Added |
| --- | ---: | ---: | ---: |
| `credential-model` | 66 | 83 | 17 |
| `credential-proofs` | 72 | 146 | 74 |

Across the five supported packages, the merged change adds about 3,600
non-test authored lines and 2,900 test lines. `credential-model` now contains
about 3,600 non-test lines; its composition validator/resolver plus runtime
resolver account for most of that surface. `credential-proofs` now contains
about 3,700 non-test lines spanning manifests, DID/trust evidence, trusted
time, artifact authority, execution receipts, and hidden-holder privacy.

The registry still serves `0.1.0-rc3` for all five packages under both `rc`
and `latest`; the last successful publish was August 6, before this feature
stack. Therefore current `develop` is an unreleased, much wider contract.

GitHub code search across the `midnightntwrk` organization found the external
digital-passport repository consuming only
`@midnight-ntwrk/credential-compact@0.1.0-rc3`. It found no external repository
consumer for `credential-model`, `credential-proofs`, `credential-status`, or
`credential-did-midnight`, and none for the private exchange/status packages.
This search is a point-in-time signal, not proof that no private consumer
exists.

Disposition: do not publish this root API wholesale. Move unproven resolver,
authority, and trusted-time contracts behind internal modules or a separately
versioned experimental package. Promote only the subset used by a clean,
independent credential-family repository.

### R4. Production issue closure is broader than the delivered authority

Several merged PRs use `Closes` language even though their own documentation
retains explicit production blockers:

- #518 says it closes #497, but `trusted-time-evidence-v1.md` states that the
  Compact toolchain cannot provide ledger position, context digest, or the
  time-error window and must not be described as the complete B3 anchor.
- #517 says it closes #496, but the new verifier package states that its
  SHA-256 proof verifier is TypeScript reference code, not a Compact proof or
  ledger authority.
- #526 says it closes #503, but `external-interop-status.json` records
  `executed: false` for both independent issuer/wallet and verifier/wallet
  lanes.
- #527 and #528 call their outputs production evidence while both packages
  explicitly state that they are private, synthetic, locally conformant
  evidence and not production approval.

Because `main` is the default branch, the referenced issues remain open after
merging to `develop`. Promoting `develop` would automatically close many of
them even though the checked-in acceptance criteria still say they are
partial or blocked.

Disposition: before any promotion, replace `Closes` semantics with milestone
issues for the bounded reference implementation, or revise the original issue
acceptance criteria and obtain explicit human risk acceptance. Do not let a
branch promotion turn a reference implementation into a production closure
claim.

### R5. New evidence remains self-referential and private

The status/OpenID evidence workspace has seven repository package
dependencies. Only
`credential-model` and `credential-proofs` are supported; the legacy
credentials facade, OpenID package, and three status packages are private.
Its deterministic adapters are all repository-owned, and its README confirms
that no external wallet, issuer, verifier, proof service, status registry, or
conformance lab was run.

The university evidence also remains private and explicitly local. Adding both
paths increases maintenance but does not provide two independent consumers of
the reusable API. They are two local compositions of the same repository
implementation.

Disposition: retain one minimal end-to-end reference flow. Remove the other
from the default gate or move it to a separately owned example repository.
Prefer external digital-passport integration evidence over another internal
synthetic composition.

### R6. Generated artifacts consume disproportionate repository and CI budget

The primary private age-gate prover changed from 42,832,409 bytes at `k=17`
and 105,869 rows to 85,149,980 bytes at `k=18` and 226,473 rows. A new request
prover adds about 10 MB. Together these changes explain nearly all of the
roughly 50 MiB LFS increase.

The current tree contains about 809 MiB of LFS payload in 104 objects. Large
private demo provers remain checked into the core library repository and are
rebuilt in the shared CI cone. This cost is paid by contributors who do not
use the demo.

Disposition: keep source and the smallest conformance fixture in this
repository. Publish deployable proving artifacts by immutable digest outside
Git, and build private demo artifacts only in affected or scheduled lanes.

### R7. Active status documents are stale and contradictory

Examples at the current tip:

- `vc-remaining-deliverables.md` was last reconciled on September 2 and still
  describes A2 as `Partial / in review`, even though #519 merged.
- The same document names old open PRs #418, #420, and #421 as a queue stop
  condition.
- `vc-maturity-backlog.md` says it is canonical but was last audited July 15.
- publication guides and package inventories describe RC2 while npm serves
  RC3.
- the hand-maintained `AGENT.md` package map omits current workspaces and
  supported packages that are present in the machine catalog.
- GitHub still describes the public repository as `This Repository is Managed
  by Terraform` and has no homepage.

Disposition: after this audit is accepted, replace the competing active plans
with one generated current-state page and one human-owned razor backlog.
Archive historical execution plans from the active index.

### R8. The documented Node prerequisite is not reproducible at patch level

The repository and `.nvmrc` specify Node 24 broadly. A frozen offline install
under Node 24.14.0 fails the enforced engine check because
`@serenity-js/assertions@3.44.3` requires `^24.15.0` on the Node 24 line. The
install used for focused audit tests required an explicit engine override.

Disposition: pin the supported Node patch/minor in `.nvmrc`, CI, `engines`, and
the contributor guide, or choose dependencies whose engine range matches the
documented prerequisite.

## Current validation state

### GitHub

- No merged feature PR currently has a pending or failing recorded check; the
  jobs selected by path classification passed.
- The `develop` push Scan run for `b4a405e0` passed.
- At 04:16 WITA on September 8, the `develop` CI run was active in `Build
  age-gate outputs`; it had not yet reached a terminal result.
- `develop` is 17 commits ahead of `main`; there is no open promotion PR.

### Audit worktree

The following static checks passed from a clean worktree:

- workspace catalog;
- workspace manifests;
- package boundaries;
- CI build-cone definitions and workflow wiring;
- VC surface discipline;
- release package contract: five supported, zero candidate packages;
- run-target catalog; and
- Markdown links: 178 checked files.

A focused dependency-aware build passed for ten workspaces covering model,
Compact, proofs, status, the three status packages, legacy credentials,
OpenID, and status/OpenID evidence. Focused suites then passed 313 tests across
model, proofs, the three status packages, OpenID, and status/OpenID evidence.

This was not a full `./run.sh --light` qualification. The audit worktree skips
LFS hydration, and the current GitHub head run is the authoritative full-lane
signal. The local install also required bypassing the Node 24.14 engine
mismatch described in R8.

## Pending pull requests

There are no remaining open feature PRs from the audited stack. There are 16
open PRs in total:

- 14 automated dependency PRs;
- #483, the conflicting 3,339-line current-head CI watcher; and
- #372, an approved but obsolete July backlog reconciliation targeting
  `main`.

Recommended queue action:

1. Close #483 and replace it, if still needed, with a small wrapper around
   GitHub's existing checks API.
2. Close #372 because its facts and target are obsolete.
3. Close bot PRs targeting `main` and configure updates to target `develop`.
4. Recreate dependency updates after the razor sequence, grouped by compatible
   Midnight SDK and Serenity cohorts instead of maintaining stale individual
   branches.

## Proposed razor sequence

The following PRs should be independent where possible and kept to a maximum
stack depth of two.

### RZ0. Restore delivery control and a truthful current state

- require the small authoritative CI gate and human approval;
- remove ordinary bypass use;
- replace stale status/backlog documents with one current page;
- mark production-shaped results as reference or local evidence; and
- block `develop` promotion and npm publication until RZ1 and RZ2 are decided.

### RZ1. Resolve known correctness and release blockers

- fix #471 and #475 first;
- fix #470, #472, #473, #474, #476, #477, and #481 only for surfaces selected
  to survive; and
- delete rather than repair a private surface that has no retained consumer.

### RZ2. Quarantine unproven supported-package APIs

- retain the minimal family model, codecs, Compact primitives, proof/artifact
  interfaces, generic status ports, and DID adapter used by real consumers;
- move runtime discovery, aggregate profiles, authority composition, trusted
  time, and artifact parity out of supported root exports until an external
  consumer proves them; and
- add API-extractor or an equivalent reviewed public-surface snapshot so API
  growth is intentional.

### RZ3. Collapse private status and verification architecture

- keep one internal status reference implementation rather than three package
  boundaries unless independent deployment/release ownership requires them;
- keep one result/transcript contract rather than duplicating authority models
  across model, proofs, compatibility credentials, exchange, and use cases;
- preserve the negative vectors and threat models even when code is removed;
  and
- do not label TypeScript reference verification as ledger authority.

### RZ4. Reduce prototype and use-case inventory

- keep one small synthetic credential family and one end-to-end flow;
- remove the frozen digital-passport copy after validating the independent
  repository;
- graduate or remove birth, birth-secret, dummy, mixed, hello, and university
  inventory against explicit owners and dates; and
- choose university or status/OpenID evidence, not both, for the default gate.

### RZ5. Reduce generated artifacts, scripts, and CI

- move large proving keys out of Git/LFS and resolve them by digest;
- remove runner targets and scripts with no surviving package or flow;
- reduce the default gate to supported packages plus one representative flow;
  and
- run expensive Compact, BDD, and Docker qualifications by affected path,
  schedule, or release candidate.

## Keep list

The audit recommends preserving these assets while simplifying:

- the five-package release allowlist as a ceiling, not an entitlement to keep
  every current export;
- canonical Compact VC/VP and holder-binding primitives;
- clean tarball consumer and package-boundary checks;
- verification, status, trusted-time, and privacy threat models plus useful
  negative vectors;
- one minimal external-family integration, preferably digital passport; and
- standard public-repository security, dependency review, and provenance
  controls.

## Decision required

Before implementation starts, maintainers should approve:

1. the one supported credential-family consumer;
2. the one retained end-to-end evidence flow;
3. the exact public exports required by those two consumers;
4. which open bug surfaces will be fixed versus removed;
5. whether the three private status packages represent real ownership/runtime
   isolation or only conceptual layering; and
6. the artifact and CI budgets for the resulting smaller repository.

The next backlog should be derived only from those six decisions. It should not
resume the previous production backlog by default.

## Evidence sources

This report used:

- fetched Git trees for `origin/develop`, `origin/main`, and the September 4
  baseline;
- direct Git diff, package, script, target, generated-file, and LFS inventory;
- machine-readable workspace and release catalogs;
- current source exports, package manifests, specs, plans, and evidence status
  files;
- GitHub PR, review, issue, branch-protection, workflow, and repository
  metadata;
- npm registry metadata for the five supported packages;
- organization GitHub code search and the public digital-passport repository;
  and
- focused static checks, dependency-aware builds, and unit/profile tests.

Local test evidence proves the current implementation is internally
consistent. It does not prove external interoperability, production authority,
necessity of the abstractions, or an acceptable long-term support cost.
