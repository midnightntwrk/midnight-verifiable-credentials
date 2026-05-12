# DID + VC Blueprint and Gap Analysis

Status: cross-repository audit and working blueprint for the current Midnight DID
and Verifiable Credentials split.

Date: 2026-05-12

## Scope

Repositories in scope:

- `midnight-did`
- `midnight-verifiable-credentials`

Audit perspectives:

1. engineering / integration
2. technical architecture and quality attributes
3. SSI best practices and integration guidance

## Method

This document combines:

- local self-attestation against checked-in docs and package surfaces
- external non-interactive audit runs through `claude -p`
- external non-interactive audit runs through `codex exec`

Where the external tools disagree with the local assessment, this document
records the narrower fact that is directly supported by checked-in repo
artifacts.

## Executive Summary

The repository split is directionally correct:

- `midnight-did` is now a focused DID method and service workspace
- `midnight-verifiable-credentials` is now the place where VC semantics,
  families, status capabilities, transport adapters, demos, and living
  documentation evolve

The strongest current part of the system is no longer raw feature breadth. It
is documentation-guided composability:

- package selection is much better
- on-chain vs off-chain surfaces are much clearer
- starter templates exist
- BDD scenarios now act as living docs
- CI is fast enough to keep the repo usable as an active design space

The biggest remaining gaps are now operational and documentary, not architectural:

- keeping the current package inventory and runner surface in sync with the
  converged top-level tree
- keeping generated compatibility shims legible as shims rather than as
  canonical architecture areas
- keeping starter and laboratory packages clearly separated from reference-grade
  reusable surfaces

In plain terms:

- integrators can now find the right package faster
- architects can now understand the layer model faster
- SSI reviewers can now see the repository's honesty about prototype vs
  reference claims faster
- the remaining work is mostly maintenance discipline, starter breadth, and
  CI/compatibility hygiene rather than another large core-architecture rewrite

## Repository Split Blueprint

### `midnight-did`

Primary role:

- reference implementation of `did:midnight`
- DID domain model, contract, resolver, API, services, and secret storage

Best current reading:

- reusable DID method and service stack
- separate from the VC repo by intent
- still operationally relevant to VC integrations because DID tarballs and DID
  runtime behavior feed standalone VC flows

### `midnight-verifiable-credentials`

Primary role:

- Compact-first VC/VP core
- credential-family packages
- status/revocation capability work
- transport/domain adapters
- protocol/reference orchestration packages
- verifier/business-contract demos
- standalone integration infrastructure
- BDD scenarios as living docs

Best current reading:

- this repo is the main VC design, implementation, and integrator surface
- maturity is explicitly mixed by package
- it already contains a better maturity model than many prototype repos, but it
  still needs one more normalization pass around status ownership and core
  protocol boundaries

## Component Taxonomy

### Reusable core components

These are the main reusable building blocks that should survive prototype churn.

- DID:
  - `contract`
  - `domain`
  - `did`
  - `api`
  - `secret-storage`
- VC:
  - `credentials`
  - `credentials-same-holder`
  - `credentials-iso-registry`
  - `credentials-birth`
  - `credentials-birth-secret`
  - the stable parts of `credentials-status-registry`

### Reusable core protocols

These are protocol semantics that belong to the core spec or near-core proof
model, not just to application orchestration.

- generic issuance and presentation envelope semantics in `credentials`
- holder-binding and same-holder proof semantics
- status binding semantics that belong to the VC shape itself
- lower reusable status proof-protocol semantics once package ownership is
  normalized

### Prototype-only or prototype-heavy surfaces

These are useful and real, but they should not be mistaken for final reference
interoperability.

- `credentials-demo-contract`
- authority-attested status path
- verifier-supplied-root revocation path
- dormant adjacent prototype artifacts such as the quarantined passport demo
- any roadmap-only package names not present as real workspaces

### Wiring / helper / orchestration surfaces

These are necessary and valuable, but they are not the core VC spec.

- `credentials-protocol`
- `credentials-openid`
- `credentials-offchain-did`
- `standalone-environment`
- BDD scenario harnesses
- witness builders, attestation builders, simulators, and CI/build scripts

## Perspective 1: Engineering / Integration

### Assessment

An integrator can now get started materially faster than before, because the VC
repo has a real navigational spine:

- top-level docs index
- package selection guide
- integration surface map
- hidden-holder hello-world guide
- verifier contract template
- family scaffold template
- BDD scenarios as executable examples

The DID repo also helps by clearly stating that VC work lives outside the DID
workspace and by preserving tarball-based package handoff patterns.

That said, the integrator path is still stronger for understanding than for
execution. It is easier to see what to do than to generate the exact next
artifact automatically.

### Strongest integration accelerators

- explicit package-selection guidance
- canonical on-chain/off-chain classification
- starter templates for verifier contracts and family scaffolds
- hidden-holder hello-world path
- BDD smoke scenarios as live examples
- explicit artifact packaging in both repos for downstream consumption
- clearer repo split between DID and VC responsibilities

### Main integration blockers and ambiguities

- creating a new family is still a manual scaffold exercise, not a generated
  workflow
- the current starter set is now stronger as execution guidance than before:
  the current stack adds a tiny DID bootstrap example, a near-zero-
  interpretation DID + VC smoke path on top of the current hello-family and
  hello-verifier starters, a root `./run.sh hello-smoke` lane, and a CI-native
  `Hello Smoke Lane` parity check for the smallest checked-in handoff
- status ownership is still conceptually split across `credentials` and
  `credentials-status-registry`
- integrators still need to understand too much status prototype context before
  deciding what is safe to adopt
- transport/orchestration packages are better labeled now, but the repo still
  lacks a single “build X capability with Y trust model” cookbook
- cross-repo DID + VC integration still requires manual tarball and environment
  discipline rather than one guided integration kit
- the DID-to-VC dependency contract is now partially explicit:
  the repo has a checked-in smoke-path guide and compatibility-matrix seed for
  the current offchain-DID starter path, but it still does not maintain a
  broader version matrix beyond that authoritative hello lane
- the DID repo still contains dormant VC-shaped prototype directories that can
  mislead a fresh integrator about which repository owns the active VC SDK

### Self-attestation score

- discoverability: strong
- first implementation path: moderate
- new family authoring speed: moderate
- status-aware integration clarity: moderate-to-weak
- smart-contract composition guidance: moderate and improving

## Perspective 2: Technical Architecture and Quality Attributes

### High-level architecture

The current split is structurally sound:

- DID concerns are isolated in `midnight-did`
- VC concerns are isolated in `midnight-verifiable-credentials`
- the VC repo itself is layered from reusable core through families, adapters,
  demos, and orchestration

The key architectural question is no longer “are the layers documented?” It is:

- are status and proof-protocol ownership normalized enough that the current
  package layout matches the intended architecture?

### Quality attribute assessment

#### Performance

Mixed.

Strengths:

- CI is now fast enough to support iteration
- architecture docs explicitly acknowledge Compact cost as an architectural
  concern
- circuit complexity is being measured via `k`, rows, prover size, and latency

Risks:

- revocation-aware circuits remain very heavy
- proof composition is still the major cost driver
- some Layer 3 business flows still inline too much verification work

#### Availability

Moderate.

Strengths:

- clear split between on-chain verification surfaces and off-chain orchestration
- standalone environment and focused CI lanes improve reproducibility

Risks:

- many prototype status flows still rely on verifier/application freshness and
  off-chain availability
- authority-attested status remains dependent on delegated off-chain behavior

#### Security

Moderate, with explicit prototype caveats.

Strengths:

- the docs now state prototype trust seams directly
- hidden-holder privacy obligations are documented
- verifier-supplied-root and authority-attested trust boundaries are explicit

Risks:

- final cryptographic status contract is not finished
- freshness remains mostly off-chain policy
- prototype helper APIs still expose some footguns such as caller-managed nonce
  policy in the authority-attested path

#### Maintainability

Strong and improving.

Strengths:

- much better package guides
- better public-surface curation
- focused CI lanes and faster PR path
- BDD layer provides executable narrative docs without replacing Vitest

Risks:

- status package ownership still causes conceptual duplication
- some maturity signaling still depends on distributed docs rather than one
  canonical per-package header and tier inventory

#### Composability

Strong in the core and materially improved at the status boundary, with the
remaining generic root-bound non-membership tail explicitly documented as an
upstream Compact/runtime dependency rather than as ordinary local repo work.

Strengths:

- layered package model is increasingly clear
- family and core surfaces are narrower than before
- contract-facing subpaths are now curated

Risks:

- shared proof-protocol types still need better ownership placement
- Layer 3 demos still risk being over-read as canonical patterns

#### Testability

Strong.

Strengths:

- Vitest coverage across core, families, protocol, and status packages
- standalone integration coverage
- BDD layer for living docs
- CI optimization now makes the matrix runnable in practice

Risks:

- BDD layer must stay curated and not become a second full regression matrix
- complex status scenarios still need more adversarial coverage

#### Scalability

Moderate.

Strengths:

- package decomposition scales engineering work better than before
- CI structure is now more sustainable

Risks:

- heavy proving artifacts and large revocation-aware circuits remain a scaling
  constraint
- some protocol/state decisions still assume reference-scale rather than
  production-scale backends

#### Interoperability

Moderate.

Strengths:

- OpenID-inspired adapters exist
- spec and conformance drafts exist
- DID-aware adapters are separated from core VC semantics

Risks:

- some interoperability surfaces remain repo-local reference shapes rather than
  broader SSI implementation kits
- status and hidden-holder interoperability are still advancing, not final

### Self-attestation score

- architecture legibility: strong
- NFR completeness: moderate
- status/security closure: moderate-to-weak
- testability/maintainability: strong
- interoperability maturity: moderate

## Perspective 3: SSI Best Practices

### Assessment

The repos increasingly reflect good SSI engineering discipline, especially in
how they now disclose prototype boundaries and privacy/status trade-offs. That
is one of their strongest traits.

The main remaining SSI gap is not that the concepts are absent. It is that the
best-practice guidance is still spread across specification text, package
READMEs, architecture docs, and prototype notes rather than presented as one
clean adoption map for integrators.

### Best practices already present

- Compact-first canonical model instead of transport-first drift
- clear separation between holder binding, proof semantics, and transport
- explicit privacy discussion for hidden-holder and public status paths
- conformance and profile drafts exist rather than relying only on code
- OpenID transport adapters are isolated from canonical core semantics
- BDD scenarios are used as executable documentation instead of replacing the
  main correctness matrix
- prototype trust seams are disclosed rather than hidden behind “production
  ready” language

### Limitations and trade-offs

- final non-revocation proof contract is not shipped
- verifier/application freshness selection still dominates the current status
  path
- authority-attested status is a real prototype bridge, not a final SSI
  interoperability endpoint
- some repo-specific capability names and package boundaries still require too
  much local knowledge for outside SSI adopters
- integration guidance exists, but there is still no concise SSI capability
  decision matrix that says “choose this profile/status path when you need these
  privacy and trust properties”

### Self-attestation score

- honesty about maturity: strong
- practical SSI guidance: moderate
- production-readiness signaling: moderate
- interoperability/reference-kit strength: moderate-to-weak

## Consolidated Gap Analysis

### Highest-priority gaps

1. Keep the current-state inventory explicit in public guidance.
- per-package classification should be obvious without cross-reading several
  docs
- generated `midnight-did-credentials*` compatibility symlinks should stay
  documented as shims, not as canonical architecture roots

2. Keep the status boundary explicit, but no longer treat it as the main local blocker.
- package ownership is materially cleaner than in the earlier split-state repo
- the remaining generic root-bound non-membership tail should stay documented
  as an upstream Compact/runtime dependency, not as ordinary repo work

3. Turn the starter material into a broader integration kit.
- the repo now has a compiling `hello-family`, a compiling `hello-verifier`, a
  DID-aware hello smoke path, a broad `dummy-claims` family, and a dedicated
  verifier-lab lane for that claim surface
- the remaining gap is broader starter coverage for “new family”, “new
  verifier flow”, and downstream integrator handoff

4. Keep BDD focused on high-value living examples.
- expand narrative coverage without duplicating the full test matrix

### Secondary gaps

- clarify whether the synchronous protocol-state seam is the final contract or
  only a staging point
- turn `credentials-protocol` production safety from convention into an
  explicit contract:
  durable state adapter, cryptographic RNG expectations, and a small production
  checklist
- add a dedicated SSI capability/trade-off matrix
- expose a cleaner cookbook for common trust models:
  - no status
  - off-chain verifier-side live-state verification
  - authority-attested status
  - same-contract live-state verification
  - future generic root-bound non-membership once Compact supports it
- make the cross-repo DID-to-VC handoff contract explicit:
  minimal runnable bootstrap path is now present; the remaining gap is a wider
  tested compatibility/version matrix

## Recommended Backlog Deltas

These recommendations refine the existing VC backlog rather than replacing it.

### Strengthen VC-MAT-18

Add explicit deliverables:

- one canonical package-tier inventory page
- standardized per-package README header containing:
  - tier
  - stability
  - reusable vs prototype vs wiring
  - dependency direction
  - “safe for external integration” note

### Strengthen VC-MAT-19

Add explicit architecture question:

- decide whether reusable shared status proof-protocol Compact types belong in:
  - `credentials`
  - `credentials-status-registry`
  - or a new lower shared package

### Clarify VC-MAT-20

Record the current acceptance boundary explicitly:

- shared status-binding payload in the issuer-signed body is delivered
- freshness and replay semantics are delivered for the supported status modes
- adversarial tests for root swap, stale replay, wrong registry, revoked
  credentials, and missing-binding cases are delivered on the current stack
- unsafe authority-attestation nonce handling is no longer the default path
- the remaining generic root-bound in-circuit proof tail is an upstream
  Compact/runtime dependency, not ordinary repo backlog execution

### Extend VC-MAT-08

Add integrator-kit follow-up:

- generated family scaffold or copy script
- minimal runnable DID/VC smoke path on top of the now compiling hello-family
  and hello-verifier starters, not just markdown templates
  - now delivered on the current stack via the offchain-DID-backed hello path
- issuer-oriented starter
- wallet-oriented starter
- DID + VC handoff checklist for downstream repos consuming tarballs
- tested DID-tarball to VC-workspace compatibility/version matrix

### Extend VC-MAT-06

Add production-safety follow-up:

- reference durable `ProtocolStateStore` adapter for real deployments
- explicit cryptographic RNG requirement instead of relying on unsafe defaults
- small production checklist for `credentials-protocol` users

### Extend VC-MAT-17

Add scenario curation rule:

- each new BDD scenario must justify itself as living documentation
- avoid mirroring the unit/integration matrix in screenplay form

## External Audit Corroboration

This section is filled from non-interactive `claude -p` and `codex exec`
runs. If those runs return narrower or stronger findings, prefer the most
concrete claim that is directly supported by checked-in evidence.

### Claude

- recorded artifact:
  - local-only VC review artifact path: `../../review/claude-3p-audit-1.txt`
- triaged Claude findings that materially sharpen the current reading:
  1. the current starter material needed tiny runnable entrypoints:
     that gap is now materially reduced by the hello-family, hello-verifier,
     DID-aware hello smoke path stack, and CI-native hello-smoke parity lane
  2. `credentials-protocol` needed a production-safe default story:
     that gap is now materially reduced by the checked-in durable reference
     path, explicit randomness requirements, and production checklist
  3. the DID-to-VC package contract is still implicit:
     downstream consumers need a tested version matrix for tarball-based DID
     dependencies versus VC workspace releases
  4. dormant VC-shaped prototype directories in `midnight-did` remain a
     cross-repo maturity-signaling problem even though the active VC work has
     moved into `midnight-verifiable-credentials`
  5. prototype status/revocation caveats still need to stay louder than
     generic “reference implementation” language
- Claude findings intentionally not promoted into the VC backlog at this stage:
  - the “multi-family composition is undocumented” claim is mostly stale
    because the repo now ships explicit dependency-composition guidance
  - Universal Resolver, JSON-LD/JWT bridge, and on-chain schema-registry ideas
    are larger product-direction questions rather than immediate VC maturity
    backlog items
- consequence:
  - the Claude audit now corroborates and slightly sharpens the local plus
    non-interactive Codex assessment rather than contradicting it

### Codex

Digest-based non-interactive Codex audit materially reinforced the local
assessment.

Codex highlights that matched the local reading:

- the strongest overall signal is architectural intent plus operational
  discipline, not completed maturity
- the main systemic weakness is no longer repo-local status ownership drift;
  it is the remaining external dependency for a future generic root-bound
  non-membership path
- the next phase should prioritize normalization over expansion

Concrete Codex recommendations that should affect execution planning:

1. keep one authoritative cross-repo smoke path for DID resolution plus one VC
   issuance/presentation/verification flow, then expand only if a second path
   proves a materially different trust model
2. publish a package maturity/support matrix and use it to guide external
   adoption
3. replace docs-only starter guidance with generated issuer, wallet, and
   verifier scaffolds
4. freeze a canonical inventory of reusable core vs adapter vs wiring vs
   prototype packages
5. normalize status/revocation ownership so proof-protocol types, builders, and
   workflows sit behind one stable seam
6. add a small negative-case BDD set:
   - stale root
   - wrong registry
   - revoked credential
   - boundary misuse

Recorded artifact:

- sibling DID repo local-only audit artifact path:
  `../midnight-did/review/did-vc-audit/codex-digest-audit.txt`

## Current Recommended Execution Order

1. `VC-MAT-18`
2. `VC-MAT-19`
3. `VC-MAT-11`
4. `VC-MAT-16`
5. `VC-MAT-08`
6. `VC-MAT-17`
7. `VC-MAT-06`
8. `VC-MAT-09`
9. upstream Compact/runtime dependency for future generic root-bound
   non-membership

## Evidence Paths

Primary DID evidence:

- sibling DID repo checkout:
  - `../midnight-did/README.md`
  - `../midnight-did/docs/vc-repository-maturity-consolidation.md`

Primary VC evidence:

- repo root:
  - `../../README.md`
- docs entrypoint:
  - `../README.md`
- package-selection guide:
  - `../guides/package-selection.md`
- integration-surface map:
  - `../guides/integration-surface-map.md`
- hidden-holder hello world:
  - `../guides/hidden-holder-hello-world.md`
- architecture overview:
  - `../architecture/overview.md`
- package boundaries:
  - `../architecture/package-boundaries.md`
- credential status:
  - `../spec/credential-status.md`
- status verification protocol:
  - `../spec/status-verification-protocol.md`
- test matrix:
  - `../testing/test-matrix.md`
- serenity-js BDD plan:
  - `./serenity-js-bdd-layer.md`
- VC maturity backlog:
  - `./vc-maturity-backlog.md`
