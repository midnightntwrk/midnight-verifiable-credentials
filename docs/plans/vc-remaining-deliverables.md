# Remaining VC Production Deliverables

Status: current execution view derived from the canonical production backlog.

Last reconciled: 2026-07-30 at `origin/main` commit `b34878b` (signed PR #358 promotion); execution remains on `origin/develop` at `50dffbb`.

This document answers one question: what still has to ship before this
repository can describe any package or verification profile as production
ready? The acceptance authority remains
[`vc-maturity-backlog.md`](./vc-maturity-backlog.md). Branch names and stack
rules remain in
[`vc-production-execution-plan-2026-07-16.md`](./vc-production-execution-plan-2026-07-16.md).
IDs such as `A1` correspond to the execution plan's `PR-A1` identifiers. The
tables omit completed identifiers such as `D1` and `E1`; their merged outcomes
are recorded in the completed baseline below.

## Status key

| Status | Meaning |
| --- | --- |
| Ready | Can start from current `origin/develop` without weakening an open security decision |
| Partial | A reference or candidate implementation exists, but production acceptance is not met |
| Blocked | Must not start the final implementation until the named prerequisite is resolved |
| External | The owning change belongs in another repository and must arrive through a released package or workspace-synced tarball |
| Later | Ecosystem work that is not required for the first production release |

## Completed baseline

Do not requeue these as unfinished deliverables. Their narrower results are now
part of the baseline; they do not imply that the larger P0 category is closed.

| Result | Evidence |
| --- | --- |
| Exhaustive catalog-driven non-Docker light gate | PR #326 |
| Core `credentials` private release-candidate contract | PR #327 |
| Clean tarball consumer tests for the core candidate | PR #328 |
| CSPRNG defaults for production protocol constructors | PR #329 |
| `develop` scanning, dependency review, update policy, and exception register | PR #330 |
| Verification authority V1 specification, threat model, and negative-test design | PR #331 |
| Status/time authority V1 specification, threat model, and negative-test design | PR #332 |
| Executable Compact comparison-only trusted-time capability gate | PR #333 |
| Signed `develop`-to-`main` promotion; current main baseline | PR #358 (`b34878b`) |
| CODEOWNERS ownership fix merged into main | PR #353 (`16710ce`); post-#358 union audit remains open |

## 2026-07-30 PR reconciliation and closeability

These are evidence and maintenance updates, not closures of the maturity IDs:

| Item | Current state | Remaining condition |
| --- | --- | --- |
| #336 | Open, head `bd4c7d4`; current checks do not provide terminal full-gate evidence | Reconcile `pnpm-lock.yaml` against current `develop`, rerun CI/review, and keep its disclosure result mapped only to partial P1-3/G3 evidence. |
| #337 | Open, head `860e0fa`; required Standalone Integration: Protocol check is pending | Complete draft-gate metadata and current-head terminal evidence; treat as P0-6 maintenance only. |
| #353 | Merged CODEOWNERS fix at `16710ce` | Reconcile post-#358 owner union across ex-identus, security, SRE, and path-specific owners before closing the P0-6 work. |
| #357 | Open, head `66c1cc0`; manifest-only scope, Build and Package Tests failing | Isolate the digital-passport failure and resolve the recorded invalid `.devloops` gate configuration; no C1/P0-4 acceptance yet. |
| #358 | Merged signed promotion at `b34878b` | Main is current for a release rehearsal, but this does not close package publication, clean-consumer, provenance, authority, or production-label requirements. |
| #346 | Closed and superseded by #358 | Do not requeue or create a replacement maturity item. |

Closeability recommendations are deliberately conservative: keep issue #342
open until `0.1.0-rc1` is published and verified from a clean consumer; consider
#347 only after its OSV-exception remediation is confirmed on `main` (it is
currently evidenced on `develop`); keep #324 and #350 open until repository
settings, topics, rulesets, secret scanning, vulnerability reporting, and
Scorecard publication are externally confirmed; and keep #321, #272, #268,
#267, #266, #265, #40, #36, #34, #31, #23, #21, and #15 mapped to their
existing work. No issue is closed by this reconciliation.

### `0.1.0-rc1` release readiness

PR #358 makes `main` current and enables a clean release rehearsal; it is not a
release. Only the supported `@midnight-ntwrk/credential-model` candidate is
eligible for an RC workflow. Every other VC package remains private/internal
until separately owned and supported. Before publishing `0.1.0-rc1`, require
package-contract checks, deterministic exact tarballs, isolated clean-consumer
Node/bundler/Compact tests, SBOM and provenance plus artifact/registry evidence,
green release gates, and named technical, support, and security owners. Keep
npm, GHCR, GitHub Release, and generated ZK artifacts as separate channels and
publish only channels with passing evidence. No package or verification profile
may receive a production label.

### Midnight-DID maturity themes

The benchmark cohort is five exact `0.5.0-rc1` npm packages
(`midnight-did`, `midnight-did-api`, `midnight-did-contract`,
`midnight-did-domain`, and `midnight-did-jubjub-schnorr`) resolved together,
with no ranges, tags, Git URLs, or sibling paths. Carry the same themes into
VC's queue: isolated clean-consumer tests; deterministic pack, SBOM, provenance,
digest, registry/tag, and release-channel evidence; real ledger/WASM
publish/resolve/sign/verify compatibility checks; named ownership/support and
incident procedures; and explicit authority/security work for DID relationships,
issuer `assertionMethod`, authenticated status roots/non-membership, trusted
time, atomic replay/nullifier decisions, and final OID4VP conformance. Package
maturity cannot substitute for these authority properties.

## P0 deliverables

These items block a production label for the affected package or profile.

| ID | Status | Owner | Deliverable | Depends on | Close when |
| --- | --- | --- | --- | --- | --- |
| X1 | External | `midnight-did` | Active DID verification-method and relationship evidence | DID package design and release | Issuer, holder, and verifier evidence binds the exact active method, relationship, network, rotation, and deactivation state, with negative vectors |
| X2 | External | `midnight-trust-registry` | Issuer/verifier/schema authorization and epoch evidence | Trust-registry proof and release design | VC can consume pinned or fresh authorization evidence and reject suspension, removal, withdrawal, stale epochs, rollover, and migration errors |
| A1 | Ready | VC | Verification transcript and public-input implementation | PR #331 design gate | Versioned transcript/input/result types, supported `persistentHash` encoding, evidence bindings, fail-closed APIs, cross-runtime digest vectors, and mutation tests are merged without claiming a final profile |
| A2 | Blocked on A1 | VC | Atomic decision nullifier and replay contract | A1 | Persistent request/holder/credential replay scopes survive restart and races; the nullifier is consumed atomically before any capability or business mutation |
| B3 | Blocked | Compact/toolchain plus VC security review | Authoritative trusted-time adapter | Full current-execution anchor or an approved normative replacement | The final circuit binds every required time-anchor field and passes expiry, future, stale, rollback, replay, liveness, and finality vectors |
| B1 | Blocked on B3 | VC | Authenticated status-registry authority | B3 and X1 | Initialization, mutation, delegation, rotation, migration, and issuer/schema-major namespacing are authenticated and audited; unauthorized and stale transitions fail closed |
| B2 | Blocked on B1 and proof capability | VC | Accepted-root equality and actual non-membership proof | B1 plus supported in-circuit root/non-membership primitives | Every privacy-preserving non-revocation claim proves against the exact accepted root; revoked, stale, forked, mismatched, and malformed proofs fail |
| A3 | Blocked | VC | Final authoritative verification profiles | A1, A2, B1-B3, X1, X2, and G1 | `ledger-local-v1` and `ledger-attested-v1` compose DID, trust, status, time, artifact, and replay evidence; differential tests mutate every security-relevant input |
| C1 | Partial / ready | VC | Supported package and publication train | Registry, owners, support policy, and provenance decisions | Public inventory, semantic versions, compatible dependency ranges, truthful ESM/CJS exports, metadata, changelogs, publication workflow, and support windows exist for each supported package |
| C2 | Partial | VC | Clean-consumer coverage for every supported package | C1 package inventory | Every supported tarball installs and runs in representative Node, bundler, and Compact consumers without monorepo source access |
| D2 | Partial / ready | VC | Release supply-chain evidence and incident operations | C1 and G1 for final artifacts | SBOMs, provenance, signatures, attestations, vulnerability policy, key/package/artifact compromise response, rollback, and verification from a clean consumer are exercised |
| E2 | Partial / ready | VC | Durable production protocol sessions | PR #329 CSPRNG baseline | Pending and finalized issuance/presentation sessions support multi-instance concurrency, exact-byte idempotency, same-ID/different-bytes rejection, cancellation, expiry, bounded retention, one-time result consumption, and crash/race/replay tests |
| S1 | Ready to plan | VC plus independent reviewers | Independent security, cryptography, and privacy assurance | Stable implementations for the reviewed profiles | Threat-model coverage is maintained, findings have owners and SLAs, accepted findings have regression tests, and unresolved risks are explicitly accepted by named owners |

### Hard blocker: trusted time

Compact 0.30.0 can constrain nominal Unix seconds against disclosed bounds, but
the accepted V1 anchor also requires context-error/window, ordered-position,
and context-digest authority. The current toolchain cannot establish those
fields. B3, B1, and final time-dependent profiles therefore remain blocked
until one of these outcomes is reviewed and accepted:

1. the Compact/Midnight stack exposes primitives that bind the complete anchor;
   or
2. [ADR-0012](../decisions/0012-trusted-time-and-status-freshness.md) and the
   normative V1 anchor are revised to a comparison-only model with equivalent
   freshness, replay, liveness, and finality properties.

Unsupported fields must not be supplied by a witness, read only in TypeScript,
or replaced with constants and then described as ledger-authoritative. See the
[`trusted-time capability report`](../testing/compact-trusted-time-capability-2026-07-17.md).

### Durable-session remainder

The protocol package already has CSPRNG defaults, state-store seams,
file-backed restart examples, retained outcomes, and several idempotency tests.
E2 is still open because the reference file store is not a multi-process
locking or transactional implementation, cancellation and one-time result
consumption are not a complete public contract, and the full same-ID/different-
bytes, race, crash, expiry, and multi-instance matrix is not yet a release gate.

## P1 deliverables

These deliver product composition, interoperability, adoption, and release
operations after or alongside the P0 authority work.

| ID | Status | Deliverable | Depends on | Close when |
| --- | --- | --- | --- | --- |
| G1 | Ready | Reproducible ZK build and signed deployment manifests, digest-addressed bundles, locator SDK, cache policy, revocation, offline recovery, and source/toolchain/output freshness checks | C1 for supported package publication | A clean consumer can resolve and verify the exact contract artifacts and deployment authority without mtime or monorepo assumptions |
| F1 | Ready | Final OID4VCI 1.0 and OID4VP 1.0 profile, including DCQL, request objects/by-reference, nonce/audience, authorization details, selected deferred issuance, format negotiation, errors, and conformance vectors | Stable canonical VC messages | OID mappings preserve canonical Compact bytes and threading identifiers and pass documented interoperability vectors |
| F2 | External/blocking agreement | Nested `extensions["org.midnight.credentials"]` capability in the existing Midnight DApp Connector API | Upstream connector extension registry/API agreement plus E2 | Injected web and universal/deep-link/QR mobile flows provide capabilities, issuance, presentation, durable polling, cancellation, events, origin binding, and consent without exposing inventory, keys, or private proving inputs |
| T1 | External plus VC composition | Trust-registry discovery and authorization composition | X2 and A3 evidence shapes | Exact schema, role, artifact, deployment, policy, and epoch references are resolved with pinned/fresh evidence; federation metadata never substitutes for authorization |
| G2 | Blocked on authority/release contracts | Bounded credential composition manifest, validator CLI, generators, conformance pack, release automation, and migration guide | A3, B1-B3, C1-C2, and G1 | Supported combinations are versioned and generated repositories build, pack, and pass conformance; invalid or untested combinations are rejected |
| G3 | Partial / cleanup ready | Digital-passport correctness and independent-product graduation candidate | B/A status-time decisions, C1-C2, G1-G2, product owners, and governance | Claims/docs/schema agree; transport dependency is removed; calendar age, encoding, normalization, status posture, locales, artifacts, installation, and conformance are production-defined |
| H1 | Ready | Framework-neutral privacy/display/locale model | Product input for validation | The model covers privacy classes, disclosure prompts, branding references, accessibility, BCP 47 locale, script/direction, fallback, and normalization metadata |
| H2 | Blocked on H1/product ownership | Versioned passport original-script and ICAO-oriented transliteration profile | H1 and G3 product policy | Multilingual, normalization, bidirectional-text, and transliteration fixtures pass; policy-relevant derivatives are signed or committed and display-only derivatives are untrusted |
| Q1 | Ready incrementally | Measurable quality evidence | Stable package/profile scopes | Per-package coverage and mutation targets, fuzz/property tests, proof rows/k, artifact size, latency, memory, throughput, mobile-download baselines, and reviewed regression budgets are retained |
| DOC1 | Ready incrementally | Documentation and support authority | C1 support decisions and stable profiles | Architecture, supported package/profile matrix, assumptions, runbooks, compatibility, release, incident, rollback, migration, deprecation, and end-of-life policy are published and placeholders are removed |

## P2 ecosystem deliverables

These are later work, not first-release blockers:

- add DIDComm 2.x only for a concrete asynchronous agent/mediator deployment;
- add a W3C Digital Credentials API adapter when its browser contract is stable;
- add framework-specific UI adapters only after the neutral display model has
  real consumers;
- graduate a second independently governed credential product to validate the
  product template and shared abstractions;
- expand formal, symbolic, property, mutation, and differential verification;
  and
- finish low-risk wrapper, script, catalog, and compatibility-symlink cleanup.

## Recommended next PR order

The following independent starts provide the highest value without crossing a
known security blocker:

1. **A1: verification contract core** - implement the transcript, encoding,
   public-input, result, and fail-closed API skeleton defined by PR #331.
2. **E2: durable protocol sessions** - close transactional, multi-instance,
   cancellation, consumption, and race semantics on the existing state seam.
3. **F1 or G1** - advance OID4VC conformance or artifact manifests on disjoint
   package/tooling surfaces.
4. **X1 and X2 in their owning repositories** - publish DID relationship and
   trust-registry authorization evidence before downstream VC composition.
5. **B3 unblock decision, then B1 and B2** - do not implement time-dependent
   status authority while the mandatory execution anchor is unresolved.
6. **A2 and A3** - land atomic replay protection, then compose final profiles
   only when every claimed authority dependency is real and tested.

Keep active stack depth at two. Treat F2, G2, H2, and final passport extraction
as dependency-gated work rather than parallel implementation targets.

## Production release closure

A package or profile leaves `reference`, `prototype`, or `experimental` status
only when all of these are true:

- named owners publish support, compatibility, and security-response windows;
- a clean consumer installs the package, verifies exact artifacts, and runs the
  documented flow without repository source access;
- every authoritative trust assumption is enforced and negatively tested;
- light and full gates retain the required release evidence;
- independent findings are closed or explicitly risk-accepted; and
- release, rollback, compromise, migration, and deprecation procedures have
  been exercised.
