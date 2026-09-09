# VC Core Gap Audit

Date: 2026-09-10

Audited branch: `develop` at `962fb559aead049c711cdb5c1f7e65dac850b128`

## Executive conclusion

The core-only reset succeeded. The repository is now small enough to reason
about: two independent public packages, one normative specification, one
conformance suite, release tooling, and the documentation site. No protocol,
wallet, deployment, concrete credential-family, or product-use-case layer
should be restored here.

The repository is not ready to call the `0.2.x` surface complete. Three items
block the next credible release candidate:

1. The supported Compact API is larger than its conformance evidence, and one
   exported low-level proof helper permits a caller-supplied body root without
   checking that it belongs to the supplied credential.
2. The current dependency graph contains one known high-severity `js-yaml`
   vulnerability.
3. npm publication of `0.2.0-rc1` is blocked by package authorization.

A single small example is justified, but only as a compile/test-only core
composition fixture. It must not become an application, protocol demo, or
deployment harness.

## Current baseline

### Repository shape

- Public packages:
  - `@midnight-ntwrk/credential-model`
  - `@midnight-ntwrk/credential-compact`
- Workspace support surface: `docs-site`
- Compact source: approximately 767 lines across one standalone root and one
  composition-safe root.
- Normative specification: approximately 639 lines.
- Conformance data: five vector files and one digest-bound manifest.
- Repository files excluding installed/generated dependencies: approximately
  225.

The public packages are orthogonal: neither depends on the other. A family
repository can consume the metadata model, the Compact primitives, or both.

### Validation observed

- `./run.sh --light`: passed.
- Documentation validation and build: passed.
- Packed clean-consumer checks: passed for both public packages.
- GitHub Pages: live and returning HTTP 200.
- Latest `main` CI, Docs, Scan, and Scorecard runs: passed.
- `pnpm audit --audit-level high`: failed with one high-severity `js-yaml`
  advisory, `GHSA-2883-xcg3-v3hh`.

`main` is one merge commit ahead of `develop`, but their file content is
identical. No reverse-sync PR is needed solely for that merge commit.

### Registry state

- `@midnight-ntwrk/credential-model`: `0.1.0-rc1` through `0.1.0-rc3`.
- `@midnight-ntwrk/credential-compact`: `0.1.0-rc2` and `0.1.0-rc3`.
- Both `rc` tags point to `0.1.0-rc3`.
- Both `latest` tags also point to `0.1.0-rc3`.
- No `0.2.0-rc1` package, repository tag, or GitHub Release exists.

The latest `0.2.0-rc1` workflow attempt completed every repository-controlled
gate and failed on the first npm publish request with `E404`, consistent with
an unauthorized token or missing trusted-publisher binding.

## Priority gaps

### P0: Bound the supported Compact API and finish conformance

The Compact source exports 42 distinct pure circuits. The conformance manifest
currently declares 12 operations. Operation count does not need to equal
circuit count, but there is no machine-readable mapping that classifies every
exported circuit as supported, low-level, or internal. The current manifest
test proves only that declared operations reference an existing specification
document and vector category; it cannot detect an unclassified exported
circuit.

Concrete missing evidence includes credential and presentation envelopes,
credential/presentation relations, status-binding validation, verification
method validation, and several proof-context helpers.

There is also one dangerous public shape:

- `VC<>::assertValidCredentialProofForBodyRoot(...)` accepts a supplied
  `bodyRoot` but does not assert that it equals
  `credentialBodyRoot(credential)`. A consumer can therefore validate a
  signature over a different body while passing unrelated credential fields.

Deliver this through [issue #621](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/621):

1. Add an explicit exported-circuit inventory with `supported`, `low-level`, or
   `internal` classification.
2. Remove or make internal unsafe convenience helpers. If the body-root helper
   remains public, bind the supplied root to the credential-derived root.
3. Add one safe composed presentation verification recipe that derives the
   presentation root and applies explicit holder-proof binding.
4. Add positive and substitution/malformed vectors for every supported
   security-sensitive operation.
5. Add a test that fails when a public circuit has no classification and when
   a supported circuit has no normative/conformance mapping.
6. Execute release conformance against packed public exports, not only source
   paths and generated output in the repository checkout.

This work should improve the existing two packages. It does not justify a new
package or a protocol layer.

### P0: Remove the known dependency vulnerability

[PR #624](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/624)
is the correct replacement for the obsolete Renovate PR. It upgrades pnpm,
moves `js-yaml` to the fixed range, and adds an audit gate. Before merging it:

1. Refresh it onto current `develop` and rerun exact-head CI/review.
2. Confirm `pnpm audit --audit-level high` is clean.
3. Keep the exact pnpm version aligned across the root manifest, workflows,
   package engines, and clean-consumer fixtures.
4. Either constrain supported pnpm to the selected 10.x line or move pnpm
   settings to `pnpm-workspace.yaml` so a pnpm 11 invocation cannot silently
   ignore root `package.json#pnpm` overrides and patched dependencies.
5. Confirm the automatic Dependabot security update no longer fails because
   `js-yaml` is pinned to `4.3.1`.

Close [PR #366](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/366)
as obsolete after #624 is accepted. It conflicts with the deleted pre-core
workspace graph.

### P0: Authorize and publish `0.2.0-rc1`

[Issue #444](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/444)
correctly tracks the external npm authorization blocker. After the dependency
and conformance gates are accepted:

1. Configure npm trusted publishing for this repository and
   `.github/workflows/publish.yml`, or restore a correctly scoped release token.
2. Dispatch `channel=rc`, `rc_index=1` from `develop`.
3. Verify both exact package versions and the `rc` tag.
4. Decide whether to remove the current `latest` tags. A default install should
   not silently select a release candidate unless that is an explicit policy.
5. Create a signed repository tag and GitHub Release that links the source
   commit, package versions, changelogs, SBOMs, provenance, and workflow run.

The workflow itself is appropriately manual and already tests the packed
artifacts before publishing.

### P1: Add one bounded core-composition example

One example would materially improve adoption because the current quickstart
defines TypeScript metadata and names the Compact roots but does not connect
the two packages into a complete verification recipe.

Use a private fixture such as `tooling/fixtures/core-capability-showcase/`, not
an app workspace or publishable package. It should contain:

- one TypeScript family descriptor;
- one synthetic Compact claim structure;
- one Compact composition file using the packaged composable root; and
- one short guide mapping each step to the normative specification.

The fixture should demonstrate only:

1. family and claim-schema metadata;
2. a fixed `SchemaRef`;
3. direct and commitment-backed claim slots;
4. the VC envelope and issuer proof;
5. explicit holder binding;
6. a VP envelope, VC/VP relation, and holder proof;
7. optional signer authorization; and
8. structural status binding, clearly labeled as not current-status evidence.

Guardrails:

- compile and test from packed public packages;
- no ledger deployment, proof server, Docker, network, wallet, UI, DID adapter,
  transport, session, OIDC, DIDComm, registry implementation, BDD framework, or
  generated artifact committed to Git;
- one happy-path composition; negative behavior stays in conformance vectors;
- no independent release or compatibility API; and
- delete the fixture if it starts owning policy or application behavior.

This should remain a readable proof of composition, not a return to the former
use-case codebase.

### P1: Define the metadata-to-Compact schema identity bridge

`credential-model` identifies families and schemas with strings and semantic
versions. Compact `SchemaRef` uses fixed `Bytes<32>` package/schema identifiers
plus numeric major/minor versions. The specification does not currently show
how a family repository allocates and freezes those values.

Add a small normative or implementation-guidance section that defines:

- who owns each identifier;
- whether identifiers are random constants or domain-separated hashes;
- how semantic versions map to Compact major/minor values;
- how the constants are recorded in a family release; and
- one known-answer mapping used by the bounded composition example.

Do not add runtime discovery, a global schema registry, or a dependency between
the two core packages.

### P1: State the interoperability claim explicitly

The public specification uses VC/VP terminology and the metadata example uses
`VerifiableCredential`, but it does not state its relationship to the W3C
Verifiable Credentials Data Model, Data Integrity, JWT/SD-JWT credentials, or
AnonCreds.

Add a short specification section saying exactly what is Midnight-native,
which semantics are inspired by or map to external standards, and which
conformance claims are not made. Protocol and wire-format adapters remain in
consumer repositories.

This prevents users from assuming that a Compact `Credential` is directly a
W3C JSON credential or that the repository implements an exchange protocol.

### P1: Harden the TypeScript metadata boundary

The TypeScript package is intentionally small, but its runtime boundary needs a
little more precision:

- the local semantic-version regular expression accepts some strings that are
  invalid under the SemVer specification, such as empty dot-separated
  prerelease identifiers;
- `assertCredentialFamilyDefinition` accepts a statically typed
  `CredentialFamilyDefinition`, rather than `unknown` with an assertion return
  type, which makes safe parsing of external input awkward; and
- the five tests do not provide a table-driven negative matrix for every
  descriptor field.

Keep the repair small: use a standards-correct validator or bounded parser,
expose one `unknown`-to-model assertion/parse boundary, and add table-driven
negative tests. Do not turn this package into a runtime framework.

### P1: Validate one real external family consumer

[Issue #538](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/538)
remains valid. The digital-passport repository currently consumes the `0.1.x`
RC line. After `0.2.0-rc1` is published, update one independently owned family
repository to the exact RC and record its immutable revision and CI evidence.

One external consumer is enough for the release gate. More family examples do
not belong here.

### P2: Align repository governance with the release gate

Current branch protection requires only `scan`; it does not require the
always-running `Core Validation` check. Repository-level default workflow
permissions are `write`, and Actions are allowed to approve pull-request
reviews, while the checked-in policy declares human-only merges.

These settings belong in `midnight-iac`:

- require `Core Validation` and `scan` on `develop` and `main`;
- set default workflow permissions to read and disallow workflow PR approvals;
- preserve job-level `pages`, `id-token`, and `security-events` permissions;
- persist the non-placeholder repository description and documentation
  homepage; and
- add a small set of repository topics if organizational policy manages them.

The community-profile API reports 87% because it does not surface the existing
issue templates. Confirm the issue chooser manually; do not add duplicate
templates solely to chase the percentage.

## Open PR disposition

| PR | Recommendation |
| --- | --- |
| [#624](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/624) | Keep, refresh onto current `develop`, address the pnpm configuration boundary, rerun review/CI, then merge. |
| [#523](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/523) | Refresh or replace with a current-head one-line action pin update after #624. |
| [#366](https://github.com/midnightntwrk/midnight-verifiable-credentials/pull/366) | Close as obsolete; it edits deleted packages and conflicts with the core-only repository. |

## Issue hygiene

Keep as active core work:

- #621: Compact public-surface classification and conformance.
- #622 / #624: dependency security baseline.
- #444: npm authorization and release governance.
- #538: one external family consumer on the `0.2.x` line.
- #441: production-readiness umbrella, after narrowing it to this report.

Candidates to close or move:

- #623: the core portion is delivered by #626 and #627; leave Trust Registry
  producer work in `midnight-trust-registry#73` and close after a final evidence
  comment.
- #539: the core-only migration is complete; replace its unchecked historical
  checklist with links to the remaining core issues, then close it.
- #463, #544, and #546: repo-local implementations are gone. Move any remaining
  product handoff obligation to the destination repository and close the VC
  cleanup issues.
- #443: verify the checked-in `.devloops` and Pi extension satisfy its original
  acceptance criteria, then close or rewrite it around a concrete remaining
  defect.
- #324: close after the repository metadata/IaC follow-up and a manual issue
  chooser check.
- #321: leave as the automation-owned dependency dashboard.

## Recommended delivery order

1. Refresh and finish #624; close #366.
2. Deliver #621 in two bounded PRs: public-surface classification/safe helpers,
   then missing vectors and packed-export conformance.
3. Add the bounded core-composition showcase and schema identity guidance.
4. Add the external-standard positioning and small TypeScript validator
   hardening.
5. Resolve #444, publish `0.2.0-rc1`, create release evidence, and validate the
   digital-passport consumer under #538.
6. Reconcile stale migration issues and the milestone.

## Explicit non-goals

Do not add OIDC, DIDComm, connector APIs, wallets, sessions, issuer/verifier
services, registry policy evaluation, deployment infrastructure, UI rendering,
large BDD suites, or concrete credential families to this repository. Those
belong in independently versioned consumer repositories.
