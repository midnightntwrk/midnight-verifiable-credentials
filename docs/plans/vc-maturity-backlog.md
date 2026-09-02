# VC Production Maturity Backlog

Status: canonical production-readiness backlog for `origin/develop`.

Last audited: 2026-07-15 at `c4d4581`, after public-readiness PR #323.

This file is the scheduling authority for repository-wide maturity work. Older
plans remain as delivery history and narrow design research; they do not define
the current production priority unless this backlog links to them explicitly.

The dedicated branch, PR, CI, review, and merge sequence is maintained in
[`vc-production-execution-plan-2026-07-16.md`](./vc-production-execution-plan-2026-07-16.md).

## Product direction

The repository is a Compact-first VC/VP core, conformance kit, and composition
toolbox. It should make concrete credential products straightforward to build,
but it must expose bounded, validated profiles rather than an untestable matrix
of arbitrary options.

The accepted architecture is recorded in the
[`ADR register`](../decisions/README.md):

1. This repository publishes reusable, schema-neutral building blocks only.
   Concrete credential families graduate to independent repositories; private
   prototypes and use cases remain solely as time-bounded composition evidence.
2. Credential families remain pure Compact libraries. Deployable issuance,
   status, verifier, and governance contracts are explicit compositions.
3. ZK artifacts belong to final deployable contracts and are resolved by exact
   digest through signed build and deployment manifests.
4. Rendering and localization are product-layer derivatives; policy-relevant
   transliteration is versioned and signed or committed.
5. Compact owns validity semantics. Off-chain verification is preflight or an
   explicitly restricted `local-process` profile.
6. VC wallet flows extend the existing Midnight DApp Connector API through a
   nested, versioned credentials capability.
7. OID4VCI/OID4VP are the normative wire protocols; DIDComm is optional.
8. [`ADR-0015`](../decisions/0015-vc-family-profile-vocabulary-and-boundaries.md)
   fixes the composition vocabulary, keeps the versioned semantic family
   profile separate from deployment assembly, rejects unsafe initial
   combinations explicitly, and records API, security, standards, and
   production maturity independently.

ADR-0013 supersedes the former reference-family release model. Existing family
workspaces are migration inventory, not a core publication queue.

### First bounded governance slice (#374/#378)

The first restructuring PR establishes the ownership boundary before physical
movement: audit the seven current credential-family prototypes, keep their
family-local tests and private catalog status, reconcile ADR-0002/0003, and
run the narrow package dependency guard. The canonical details are in
[`credential-family-ownership-policy.md`](../architecture/credential-family-ownership-policy.md).
This slice does not move packages, graduate digital-passport, approve the
approximately 758 MB generated-artifact proposal, or implement #375, #376, or
#377. Artifact storage (#376) and CI/regeneration/restore/drift work (#377)
remain separate follow-ups; secrets are never fixtures.

### Repository-boundary migration

Deliver:

- freeze new product feature work in core credential-family packages;
- define owner, capability hypothesis, limitations, and exit criteria for each
  retained prototype;
- invert family dependencies out of reusable orchestration through injected
  codecs, builders, and verifier ports;
- move retained prototypes and use cases to private `examples/` workspaces;
- port digital passport to
  `midnight-verifiable-credential-digital-passport` with independent consumer,
  conformance, package, and release evidence; and
- remove the duplicate core passport package, aliases, catalog entries, and
  release artifacts after the independent repository is validated.

Acceptance:

- reusable packages have no dependency on examples, prototypes, use cases, or
  product repositories;
- no concrete family or use-case package is packable or publishable from core;
- external family repositories consume versioned registry packages or
  immutable release artifacts, never sibling source; and
- each retained example has a recorded graduate, reduce, or remove outcome.

### Orthogonal package and publication graph

Design source:

- [`ADR-0014`](../decisions/0014-orthogonal-package-architecture.md)
- [`package-publication-catalog.md`](../architecture/package-publication-catalog.md)

Deliver:

- a machine-checked publication allowlist and forbidden-edge graph;
- a protocol-neutral `CredentialFamilyDefinition`, separate family protocol
  and display profiles, and model, Compact, proof-resource, verification,
  status, exchange, session-store, DID, and display ports;
- a machine-enforced allowed-edge matrix that keeps protocol and session
  modules internally acyclic and splits Midnight status contract, verifier,
  and authority boundaries;
- separation of family agents and storage adapters from reusable protocol
  state machines;
- separation of generic status semantics from the Midnight registry
  implementation;
- final OID4VCI and OID4VP subpaths in `openid4vc` that depend on generic
  codecs rather than own them; and
- clean external-family conformance and consumer fixtures.

Acceptance:

- the digital-passport repository installs only published semantic versions;
- family code remains unchanged when protocol, session, DID, proof, status, or
  display adapters are swapped; and
- no public package depends on prototype, use-case, BDD, reporting,
  integration, local-path, Git, URL, or deep-source surfaces.

## Current baseline

The May capability and repository-audit waves delivered broad reference
coverage: core/family packages, holder-binding variants, status prototypes,
OpenID-shaped DTOs, orchestration, university flows, target catalogs, artifact
catalogs, BDD reports, and standalone integration lanes. PR #323 completed the
repo-local GitHub community-file fixes.

That breadth is not a production claim. The audit found these current facts:

- `@midnight-ntwrk/credential-model` is the first supported pre-1.0 package
  with a manual npmjs release train and clean-consumer contract; all other
  workspaces remain private and internal;
- wildcard dependency ranges and ESM export maps with `require` aliases can
  produce incorrect consumer packages;
- the release gate does not execute every workspace and does not package-test
  the public surface;
- issuer proof keys are not yet bound to an active DID `assertionMethod` in the
  final VC verifier path;
- status mutation, external non-membership/root binding, trusted time, and
  authoritative replay prevention are incomplete;
- OpenID support is currently "inspired by" the protocols and predates final
  OID4VP DCQL conformance;
- managed-artifact freshness is only partially enforced; and
- the digital-passport reference package has schema/docs, status, time, text
  encoding, and dependency-boundary work before it can graduate.

## P0: Release and security blockers

### P0-1. Bind identity and authorization to ledger evidence

Deliver:

- one canonical DID URL verification-method reference across Compact, runtime,
  OpenID, and trust-registry inputs;
- issuer signature verification bound to an active DID key with
  `assertionMethod` relationship;
- holder and verifier relationship checks appropriate to each profile;
- trust-registry issuer/verifier/schema authorization bound to an accepted
  current state or signed epoch root; and
- rotation, deactivation, relationship-removal, suspension, stale-epoch, and
  wrong-network negative tests.

Acceptance:

- a caller-supplied proof key that is not the required active DID method cannot
  pass authoritative VC verification;
- off-chain resolution can prepare evidence but cannot override the Compact
  result; and
- cross-repository dependencies use released tarballs or published packages,
  never sibling source imports.

### P0-2. Close status, time, and replay trust boundaries

Design prerequisite:

- registry namespaces, authenticated initialization/mutation, delegation,
  rotation, audit, and migration are fixed by
  [`ADR-0011`](../decisions/0011-status-registry-namespace-and-authority.md);
- accepted status roots, non-membership, trusted-time modes, and freshness
  authority are fixed by
  [`ADR-0012`](../decisions/0012-trusted-time-and-status-freshness.md) and
  [`status-time-authority-v1.md`](../spec/status-time-authority-v1.md); and
- B1/B2/B3 implementation is gated by
  [`status-time-authority-v1-test-design.md`](../testing/status-time-authority-v1-test-design.md).
- the pinned Compact comparison-only time capability and the remaining full
  anchor blocker are recorded in
  [`compact-trusted-time-capability-2026-07-17.md`](../testing/compact-trusted-time-capability-2026-07-17.md).

Deliver:

- authenticated status-registry initialization and mutation;
- issuer/schema-major registry namespacing and audit events;
- in-circuit equality to an accepted status root and real non-membership for
  every profile advertised as privacy-preserving non-revocation;
- explicit demotion of observed-root helpers to `preflight...` until that proof
  exists;
- ledger-derived or bounded authoritative time for expiry and age policy; and
- persistent decision nullifiers consumed atomically before any capability or
  business state change.

Acceptance:

- unauthorized mutation, stale/forked roots, revoked credentials, fabricated
  time, duplicate requests, and restart/replay attempts fail closed;
- retrieval failure is `indeterminate`, never valid-with-warning; and
- standalone revocation integration is present in the release test matrix.

### P0-3. Implement the verification authority contract

Design prerequisite:

- the canonical transcript, orthogonal result axes, authority labels, and
  atomic nullifier decision are fixed by
  [`ADR-0010`](../decisions/0010-verification-transcript-and-decision-nullifier.md)
  and [`verification-contract-v1.md`](../spec/verification-contract-v1.md);
- implementation is gated by the threat model and negative-test design in
  [`verification-authority-v1-test-design.md`](../testing/verification-authority-v1-test-design.md);
  and
- this prerequisite does not complete the Compact implementation or close the
  DID, trust, status, time, artifact, and deployment authority blockers.

Deliver:

- versioned `VerificationTranscriptV1` and `VerificationPublicInputsV1` types;
- orthogonal proof status `malformed | invalid | indeterminate | valid`,
  decision status `notEvaluated | approved | policyDenied | replay`, and a
  discriminated local-attempt versus committed-ledger-receipt contract;
- `ledger-local-v1` and `ledger-attested-v1` final verification profiles;
- restricted `offchain-public-v1` with `authority: local-process` and no private
  witness or privacy-preserving predicate support;
- `prepareVerification`, `preflightVerification`,
  `submitLedgerVerification`, and `verifyPublicOffchain` runtime surfaces; and
- differential tests that bypass preflight and mutate every security-relevant
  public input.

Acceptance:

- generated TypeScript `pureCircuits` are documented and typed as mirrors or
  preflight, not ledger authority;
- policy may deny a valid proof but cannot make an invalid proof valid; and
- a final receipt discloses only minimal decision hashes and anchors, never raw
  claims or private witnesses.

V1 is a single-credential authority chain. Authoritative multi-credential and
same-holder VP decisions require a later aggregate decision-set contract that
binds every credential's issuer, trust, and status evidence; they must not
reuse one credential's chain as a proxy for the set.

### P0-4. Establish a real package and release contract

Deliver:

- an explicit public package inventory and owner/support matrix;
- package versions and changelogs driven by semantic release decisions;
- `private: false` only for supported packages, with complete license,
  repository, description, keywords, side-effect, engine, and export metadata;
- workspace dependency ranges that resolve to release-compatible versions,
  replacing `*` where it hides incompatibility;
- correct ESM/CJS policy without `require` pointing at ESM-only output;
- deterministic `prepack` builds for every publishable package; and
- clean-checkout `pnpm pack` installation tests in representative Node and
  bundler consumers, including Compact source and generated artifact imports.

Acceptance:

- a release candidate can be installed and exercised without the monorepo;
- tarballs contain only declared source, runtime, documentation, and manifest
  files; and
- release notes define compatibility, migration, deprecation, and support
  windows.

### P0-5. Make the release gate truthful

Deliver:

- one machine-readable workspace/target catalog that drives root scripts,
  Turbo, `run.sh`, CI cones, and package-class checks;
- `./run.sh --light` coverage of every non-Docker release task, including
  build, lint, typecheck, tests, generated-artifact validation, and packaging;
- full-lane coverage for every workspace, including university contract,
  protocol, scenarios, and reporting packages;
- rejection of unknown runner flags instead of silently forwarding or ignoring
  them; and
- retained coverage, BDD, packaging, performance, and conformance reports.

Acceptance:

- adding a workspace without a declared package class and gate is a CI error;
- a required task cannot disappear from the release gate without a catalog
  diff; and
- Docker/proof-server integration remains the only intentional exclusion from
  the light lane.

### P0-6. Restore supply-chain and branch security coverage

Deliver:

- code and secret scanning on `develop`, pull requests, release branches, and
  the eventual default public branch;
- active pnpm dependency updates and dependency-review policy;
- vulnerability thresholds with documented exceptions and expiry;
- immutable action and container references where practical;
- SBOM, provenance, artifact signature, and release-attestation generation; and
- a documented process for compromised packages, artifacts, keys, and
  deployments.

Acceptance:

- security workflows protect the branch actually used for integration;
- package and ZK artifact provenance can be verified from a clean consumer; and
- critical vulnerability exceptions require owner and security approval.

### P0-7. Harden protocol state and randomness

Deliver:

- CSPRNG-only production constructors for message IDs, nonces, challenges,
  secrets, openings, and session IDs;
- durable issuance/presentation session state with restart and multi-instance
  semantics;
- exact-duplicate idempotency and same-ID/different-bytes rejection;
- bounded retention, cancellation, expiry, and one-time result consumption;
- origin, audience, nonce, redirect, request-object, and downgrade threat
  models; and
- no private witness, inventory, or raw key exposure through transport APIs.

Acceptance:

- deterministic reference randomness cannot be selected accidentally in a
  production entrypoint; and
- crash/restart, duplicate delivery, race, expiry, and replay suites pass.

### P0-8. Obtain independent assurance

Deliver:

- a maintained threat model covering issuer, holder, verifier, wallet,
  connector, DID, trust registry, status authority, artifact registry, and
  deployment governance;
- independent Compact/cryptography review of transcript, signatures,
  commitments, holder binding, status, nullifiers, and disclosure;
- privacy review for correlation, status lookup, shared registries, logs,
  telemetry, rendering, QR handoff, and screenshots; and
- remediation SLAs with regression tests for every accepted finding.

Acceptance:

- no package or verification profile is labeled production before its relevant
  P0 findings are closed or explicitly risk-accepted by named owners.

## P1: Productization and adoption

### P1-1. Publish contract artifact and deployment manifests

Implement ADR-0003: reproducible build manifests, signed deployment manifests,
digest-addressed OCI/release bundles, offline bundles, locator SDK, cache
policy, artifact revocation, disaster recovery, and clean-consumer verification.
Replace mtime-based freshness with source/toolchain/output digests enforced in
CI, Nix, package tarballs, and runtime loading.

### P1-2. Deliver a bounded credential composition kit

Define a versioned composition manifest and validation CLI for supported
choices of family, holder binding, status, verification, transport, artifacts,
display, and locales. Provide generators for product repository, pure family,
composed contracts, conformance tests, release automation, and migration docs.
Invalid or untested combinations must be rejected rather than passed through as
open-ended plugin configuration.

### P1-3. Graduate digital passport as the first product

Before extraction:

- reconcile the README, schema root, five current claims, version validation,
  and package inventory;
- remove the credential-family dependency on the OpenID transport package;
- replace `years * 365` age policy with a product-approved calendar/time model;
- define authenticated status or explicitly declare a non-revocable profile;
- replace silent UTF-8 truncation with validated, normalization-aware encoding;
- define ICAO/original-script/transliteration semantics and fixtures; and
- prove the product template can release, install, resolve artifacts, and run
  conformance tests independently.

Extraction happens only after owners, governance, support, and release cadence
satisfy ADR-0013.

### P1-4. Compose trust-registry discovery and authorization

Define exact schema, role, artifact, deployment, policy, and epoch references;
add verifier-side resolution with pinned/fresh evidence; specify federation and
delegation; and test issuer suspension, verifier removal, schema withdrawal,
epoch rollover, and migration. OpenID Federation metadata may help discover
entities but does not replace Midnight trust-registry authorization.

### P1-5. Reach final OID4VC conformance

Upgrade `credentials-openid` from inspired DTOs to documented OID4VCI 1.0 and
OID4VP 1.0 profiles, including DCQL, request objects/by-reference, nonce and
audience binding, authorization details, deferred issuance where selected,
credential format negotiation, errors, and conformance vectors. Preserve the
canonical Compact message bytes and threading identifiers through mappings.

### P1-6. Add the credentials connector extension

Coordinate the optional extension registry with
`@midnight-ntwrk/dapp-connector-api`, then implement
`extensions["org.midnight.credentials"]` with capabilities, issuance,
presentation, durable session polling, cancellation, and events. Ship injected
web plus universal/deep-link and QR mobile handoff. Keep wallet inventory,
selection, keys, consent, and private proving inputs inside the wallet.

### P1-7. Add display and language components

Ship the framework-neutral display model first, including privacy classes,
disclosure prompts, issuer branding references, accessibility, BCP 47 locale,
script/direction, fallback, and normalization metadata. Add web and React Native
adapters only with consuming applications. Implement product-owned,
versioned transliteration profiles and mark display-only derivatives as
untrusted.

### P1-8. Produce measurable quality evidence

Set per-package coverage and mutation targets; add fuzz/property tests for
codecs, commitments, request parsing, and state machines; retain proof row/k,
artifact size, proving/verification latency, memory, throughput, and mobile
download baselines; and enforce reviewed regression budgets for critical
circuits and flows.

### P1-9. Define documentation and support authority

Publish a stable architecture overview, ADR lifecycle, architecturally admitted
profile and API-support package matrix, security assumptions, operator runbooks,
compatibility policy, release guide, incident response, and end-of-life process. Replace placeholder
documentation scripts and archive completed plans so contributors have one
current backlog and one decision register.

## P2: Ecosystem scale

- Add a DIDComm 2.x adapter only for an identified asynchronous agent/mediator
  deployment and preserve the same canonical messages and consent model.
- Add a W3C Digital Credentials API adapter after its browser contract is
  sufficiently stable; keep OID4VC and the Midnight connector usable without it.
- Add framework UI adapters only after the neutral model has real consumers.
- Graduate a second independently governed credential product to prove the
  repository template and shared abstractions are not passport-specific.
- Expand formal, symbolic, property, mutation, and differential verification
  around circuits and protocol state machines.
- Finish low-risk maintenance work: wrapper flattening, script deduplication,
  catalog generation, and removal or documentation of compatibility symlinks.

## Delivery order

1. Freeze the ADRs, threat model, verification transcript, result taxonomy, and
   package/release inventory.
2. Close DID, trust, status, time, and replay authority gaps.
3. Implement authoritative verification profiles and differential tests.
4. Make packaging, release gates, supply-chain evidence, and artifact manifests
   consumer-correct.
5. Upgrade OID4VC conformance and land the upstream connector extension.
6. Pilot the product composition kit and digital-passport graduation.
7. Complete independent review, performance budgets, support docs, and a
   release candidate before assigning production maturity.

OID conformance, artifact tooling, display modeling, and upstream connector
design can proceed in parallel once their contracts no longer depend on open P0
authority decisions.

## Production release definition

A package or profile is production-ready only when all of the following are
true:

- its owner, support window, compatibility policy, and security response are
  published;
- a clean consumer can install the tarball, resolve exact artifacts, and run a
  documented flow without monorepo source access;
- its authoritative trust assumptions are enforced and tested, not only
  documented;
- light and full gates cover its package class and retain release evidence;
- independent security findings are closed or explicitly risk-accepted; and
- release, rollback, key/artifact compromise, deployment migration, and
  deprecation procedures have been exercised.

Until then, keep the current package-level `reference`, `prototype`, and
`experimental` labels explicit.

## Historical plans

- [`repository-audit-backlog.md`](./repository-audit-backlog.md): completed and
  partial May 2026 simplification findings.
- [`university-improvement-backlog.md`](./university-improvement-backlog.md):
  university-specific delivered and follow-up work.
- [`vc-maturity-university-wave-2026-05-15.md`](./vc-maturity-university-wave-2026-05-15.md):
  historical iteration wave.
- [`archive/2026-05-20-backlog-collapse`](./archive/2026-05-20-backlog-collapse/):
  pre-collapse capability and PR history.
