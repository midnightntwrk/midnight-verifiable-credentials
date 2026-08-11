# Remaining VC Production Deliverables

Status: current execution view derived from the canonical production backlog.

Last reconciled: 2026-08-11 for branch/PR state; baseline remains `origin/develop` commit `103e3e8` after PRs #335, #415, and #416.

The A2 replay/nullifier worktree contains an unmerged primitive checkpoint at
`4b514ec`; it is not part of `origin/develop` and does not close A2. The G1
and E2 entries below likewise record merged foundations only, not their full
production acceptance.

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
| Verification transcript and public-input implementation foundation | PR #335 |
| ZK artifact-manifest integrity contracts (foundation only) | PR #415 |
| Durable protocol state-store foundation (not full session closure) | PR #416 |

## P0 deliverables

These items block a production label for the affected package or profile.

| ID | Status | Owner | Deliverable | Depends on | Close when |
| --- | --- | --- | --- | --- | --- |
| X1 | External | `midnight-did` | Active DID verification-method and relationship evidence | DID package design and release | Issuer, holder, and verifier evidence binds the exact active method, relationship, network, rotation, and deactivation state, with negative vectors |
| X2 | External | `midnight-trust-registry` | Issuer/verifier/schema authorization and epoch evidence | Trust-registry proof and release design | VC can consume pinned or fresh authorization evidence and reject suspension, removal, withdrawal, stale epochs, rollover, and migration errors |
| A2 | Partial | VC | Atomic decision nullifier and replay contract | A1 merged (#335) | The unmerged checkpoint `4b514ec` adds Compact/TypeScript replay-scope and fixed-policy nullifier primitives; closure still requires a supported stateful Compact fixture proving restart, races, rollback, and atomic nullifier-plus-business mutation |
| B3 | Blocked | Compact/toolchain plus VC security review | Authoritative trusted-time adapter | Full current-execution anchor or an approved normative replacement | The final circuit binds every required time-anchor field and passes expiry, future, stale, rollback, replay, liveness, and finality vectors |
| B1 | Blocked on B3 | VC | Authenticated status-registry authority | B3 and X1 | Initialization, mutation, delegation, rotation, migration, and issuer/schema-major namespacing are authenticated and audited; unauthorized and stale transitions fail closed |
| B2 | Blocked on B1 and proof capability | VC | Accepted-root equality and actual non-membership proof | B1 plus supported in-circuit root/non-membership primitives | Every privacy-preserving non-revocation claim proves against the exact accepted root; revoked, stale, forked, mismatched, and malformed proofs fail |
| A3 | Blocked | VC | Final authoritative verification profiles | A1, A2, B1-B3, X1, X2, and G1 | `ledger-local-v1` and `ledger-attested-v1` compose DID, trust, status, time, artifact, and replay evidence; differential tests mutate every security-relevant input |
| C1 | Partial / ready | VC | Supported package and publication train | Registry, owners, support policy, and provenance decisions | Public inventory, semantic versions, compatible dependency ranges, truthful ESM/CJS exports, metadata, changelogs, publication workflow, and support windows exist for each supported package |
| C2 | Partial | VC | Clean-consumer coverage for every supported package | C1 package inventory | Every supported tarball installs and runs in representative Node, bundler, and Compact consumers without monorepo source access |
| D2 | Partial / ready | VC | Release supply-chain evidence and incident operations | C1 and G1 for final artifacts | SBOMs, provenance, signatures, attestations, vulnerability policy, key/package/artifact compromise response, rollback, and verification from a clean consumer are exercised |
| E2 | Partial | VC | Durable production protocol sessions | PR #329 CSPRNG baseline; state-store foundation merged in PR #416 | The merged foundation provides atomic state-store primitives, retained outcomes, cancellation, and one-time claims; closure still requires processing leases/agent wiring, multi-record transactions, multi-instance concurrency, crash recovery, and coupling to business side effects |
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
| G1 | Partial | Reproducible ZK build and signed deployment manifests, digest-addressed bundles, locator SDK, cache policy, revocation, offline recovery, and source/toolchain/output freshness checks | C1 for supported package publication; integrity foundation merged in PR #415 | PR #415 supplies canonical manifests, SHA-256 integrity, Ed25519 signatures, trusted-key verification, and fail-closed artifact resolution. Closure still requires real Compact-output generation, OCI/release distribution, locator/cache/offline recovery, revocation, deployment discovery, and external authority integration |
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
known security blocker. The current inventory is not a green "active stack depth
remains at two" claim: open PRs #418, #420, and draft PR #421 are active against
`develop`, while PR #419 is closed and PR #417 merged. Treat this as a stop
condition for starting another stacked PR until the queue is reconciled;
independent tracks still require their own focused and repository gates:

1. **A2 follow-up** - finish the stateful Compact replay/atomicity fixture, but
   first identify or add a supported ledger/emulator harness; the current
   primitive checkpoint `4b514ec` is not a closure claim.
2. **E2 follow-up** - add processing leases and agent integration on top of the
   merged state-store foundation without claiming exactly-once delivery.
3. **F1 or G1 follow-up** - advance the bounded OID4VCI/OID4VP profile/vector
   surface or generate real Compact-output manifests from the PR #415 contracts.
4. **H1 and Q1** - independently add the incubating display/locale model and
   measurable quality-evidence catalog; neither depends on trusted time.
5. **X1 and X2** - publish DID relationship and trust-registry authorization
   evidence in their owning repositories before downstream VC composition.
6. **B3 unblock decision, then B1/B2 and A3** - do not implement
   time-dependent status authority or final profiles while the mandatory execution
   anchor and external authority evidence remain unresolved.

Do not start another stacked PR while that queue-level stop condition remains.
Treat F2, G2, H2, and final passport extraction as dependency-gated work rather
than parallel implementation targets.

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
