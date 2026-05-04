# Midnight VC Repository Audit Backlog

Status: backlog and audit snapshot for the current repository state.

## Purpose

This document records the main gaps and inconsistencies found while auditing:

- specifications
- guides and "book" material
- architecture docs
- package READMEs
- test strategy and test matrix
- integration-facing package surfaces

It is intentionally pragmatic. The goal is not to restate every document, but
to identify the places where the repository state and the documentation state
have drifted apart.

## Current snapshot

Repository strengths:

- the Compact-first VC/VP core is coherent
- holder-binding profile documentation is much stronger than earlier iterations
- the hidden-holder reference layer is now materially more production-shaped:
  randomness seam, protocol-state seam, replay retention, expiry semantics,
  codec-backed state adapters
- the status/revocation prototype is now explicit:
  - `NoStatusCapability`
  - `AuthorityAttestedStatusCapability`
  - `RevokedSetNonMembershipStatusCapability`
  - verifier-supplied root model
  - Layer 3 transitional authority-attested path

Repository gaps:

- top-level integrator guidance still lags the newer status/revocation and
  protocol-state work
- several docs still describe non-existent current workspace packages as if
  they were part of the validated repository spine
- on-chain/off-chain surface ownership has not been stated clearly enough for
  external integrators

## Priority findings

### P1. Documentation fidelity gap around current workspace reality

The biggest current repository/docs mismatch is that some documents describe
future or external-example credential families as if they are current repo
packages.

Examples:

- `docs/guides/midnight-credentials-for-dummies.md`
- `docs/testing/test-strategy.md`
- `docs/architecture/dependency-composition.md`

Observed issue:

- these docs discuss `credentials-passport`, `credentials-passport-secret`,
  `credentials-compliance`, driving-license, national-id, and employee
  packages as if they were part of the current workspace and test surface
- in the current repository, the validated package spine is much smaller:
  `credentials`, `credentials-birth`, `credentials-birth-secret`,
  `credentials-same-holder`, `credentials-iso-registry`,
  `credentials-offchain-did`, `credentials-openid`,
  `credentials-protocol`, `credentials-status-registry`,
  `credentials-demo-contract`, `standalone-environment`

Why this matters:

- integrators can easily assume these families already exist and are supported
- audit claims become weaker when examples and current repository state are not
  separated

Backlog:

1. mark external/product-prototype or future-family examples explicitly where
   they first appear
2. split "current repo state" from "future/example matrix" in
   `test-strategy.md`
3. trim or reframe the for-dummies package map so it does not imply current
   workspace support for absent packages

### P1. Missing integrator-facing surface classification

Before this audit, the repo did not provide one clear place telling
integrators:

- what belongs in Compact contracts
- what belongs in off-chain apps
- what is canonical on both sides through different representations

Why this matters:

- external users tend to overuse TypeScript mirrors where Compact source is the
  real contract-author surface
- runtime adapter packages can be mistaken for canonical verification surfaces

Backlog:

1. keep `guides/integration-surface-map.md` current
2. propagate short usage tags into package READMEs over time
3. consider README badges or section headings such as:
   - `On-chain surface`
   - `Off-chain runtime surface`
   - `Canonical Compact-first surface`

### P1. Status/revocation package is underrepresented in top-level docs

`credentials-status-registry` is now a real workspace package, but several
top-level docs historically omitted it from package maps and selection
guidance.

Why this matters:

- the status prototype can look "hidden" or accidental instead of deliberate
- integrators do not get a clear starting point for status-aware work

Backlog:

1. keep root README, docs index, architecture overview, and package-selection
   guide aligned with the real workspace list
2. add a dedicated revocation/status integration demo after the core proof path
   matures

### P2. Test strategy is too mixed between current validation and roadmap

`docs/testing/test-matrix.md` is now relatively current.
`docs/testing/test-strategy.md` still mixes:

- current validated repo surfaces
- future package families
- external example scenarios

Why this matters:

- readers cannot quickly tell what is tested now versus what is a design-space
  aspiration

Backlog:

1. split the strategy doc into:
   - current validated repo scope
   - future matrix / design-space expansion
2. keep the matrix doc strictly current and implementation-shaped
3. add a dedicated `ci:revocation` lane once a revocation demo exists

### P2. Protocol package README still needs maturity wording discipline

The protocol layer has gained meaningful hardening:

- randomness seam
- state-store seam
- codec-backed adapters
- replay retention
- envelope-level expiry

But it remains easy for readers to overinterpret it as a stable network
library.

Backlog:

1. keep the README explicit about:
   - reference implementation status
   - off-chain-only role
   - current status/revocation prototype state
2. add a dedicated external adapter contract document when a real wire-level
   interoperability target exists

### P2. Demo contract coverage does not yet include revocation/status

The repository now has a meaningful status prototype, but `credentials-demo-contract`
still demonstrates only the older issuance/verification capability flow.

Backlog:

1. add a dedicated `demo-revocation` consumer
2. exercise:
   - verifier-supplied root path
   - authority-attested transitional path
3. then add:
   - focused test coverage
   - focused CI lane

### P3. Conformance language should evolve with capability maturity

The conformance model already distinguishes Level 0 / 1 / 2 status support and
reference vs production-shaped claims. That is good.

What is still missing:

- a cleaner mapping between conformance claims and concrete packages
- a stronger "current package maturity table" that could be referenced from
  README files and release notes

Backlog:

1. add package-level maturity/status tables to conformance or architecture docs
2. align each package README to the same maturity vocabulary

## Library-friendliness improvements

### 1. Publish a stable integrator surface taxonomy

The repository should standardize three surface labels:

- `On-chain`
- `On-chain + off-chain`
- `Off-chain only`

Then use them consistently in:

- package READMEs
- docs index
- release notes / PR descriptions for surface-affecting changes

### 2. Distinguish canonical Compact source from generated TS mirrors

The repo already behaves this way technically.
It should say so more loudly for integrators.

Recommended wording pattern:

- Compact source entrypoints are the contract-author surface
- generated/runtime TS exports are off-chain mirrors

### 3. Make status integration entrypoints obvious

Integrators should not need to infer status architecture from scattered docs.

Recommended stable starting points:

- status claim model:
  - `docs/spec/credential-status.md`
- current revocation target:
  - `docs/spec/revocation-registry.md`
- current contract-facing trust boundary:
  - `docs/spec/status-verification-protocol.md`
- package:
  - `credentials-status-registry`

### 4. Promote package-level "start here" sections

Every integration-facing package README should clearly state:

- who should use this package
- whether it is on-chain/off-chain/both
- whether it is reference/prototype/experimental
- which package or spec should be read first

### 5. Separate "current repo" and "ecosystem examples"

This is especially important for:

- docs/guides material
- future design-space documents
- product-prototype examples that live outside this repo

## Concrete backlog

### Near-term

1. finish refreshing doc surfaces to current workspace reality
2. add explicit disclaimers where external/future package examples remain
3. add `demo-revocation`
4. add `ci:revocation`
5. keep the integration-surface map updated as packages evolve

### Medium-term

1. complete in-circuit revoked-set non-membership verification
2. strengthen live root-binding semantics for the revocation registry contract
3. define the first external hidden-holder transport contract beyond the
   in-process reference layer
4. add package-level maturity and surface tags consistently

### Longer-term

1. decide which additional credential families belong in this repository versus
   adjacent example/product repositories
2. split current/future test strategy material more aggressively
3. add stronger release-note / changelog conventions for surface changes
