# ADR-0009: Gate Releases on Verifiable Supply-Chain Evidence

- Status: Accepted
- Date: 2026-07-16

## Context

The repository builds npm tarballs and Compact/ZK artifacts, but a build output
is not yet a supported public release. The integration branch is `develop`,
while the inherited scan workflow protected only `main`. Automated dependency
updates covered GitHub Actions but not the pnpm lockfile. The repository also
lacked a binding rule for vulnerability exceptions and release evidence.

ADR-0008 keeps packages private until a publication workflow, ownership, and
provenance contract exist. ADR-0003 requires digest-addressed ZK bundles. This
record defines the security gates and evidence that those later release flows
must satisfy; it does not claim that a supported release workflow exists now.

## Decision

1. Run code and secret scanning for pushes and pull requests affecting
   `develop`, `main`, and `release/**`, plus a scheduled scan.
2. Enable Dependabot for the root pnpm dependency graph and GitHub Actions,
   targeting `develop`. Once the repository is public, review every pull
   request dependency change across runtime, development, and unknown scopes,
   and reject newly introduced high or critical vulnerabilities. Private
   repositories require GitHub Advanced Security for the dependency-review
   API, so this gate remains dormant during the current private staging phase.
3. Pin every action introduced into a security or release workflow to a full
   commit SHA. Version comments may document the human-readable release.
4. Do not add a vulnerability allowlist without a linked risk-acceptance
   record containing the advisory, affected artifacts, rationale, compensating
   controls, accountable owner, and an expiry no later than 30 days. The
   machine-readable entries live in `osv-scanner.toml`; the corresponding
   review records live in `docs/security/vulnerability-exceptions.md`.
   Critical exceptions require both the package owner and the security code
   owner.
5. Before a package or ZK bundle advances to `supported`, its release workflow
   must emit:
   - a CycloneDX SBOM for packaged runtime contents;
   - cryptographically bound provenance identifying the repository, source
     commit, workflow identity, lockfile, toolchain versions, and artifact
     digests;
   - a signature or platform-verifiable release attestation; and
   - the contract/build/deployment manifest required by ADR-0003 for ZK
     artifacts.
6. A clean consumer must be able to verify the digest, signature or
   attestation, provenance subject, and SBOM before installing or deploying an
   artifact. Release automation must fail closed when required evidence is
   missing or names a different artifact digest.
7. A suspected compromise freezes publication and deployment of affected
   versions. Maintainers and security owners must preserve evidence, revoke or
   deprecate affected artifacts, rotate exposed credentials, publish a fixed
   version with new evidence, notify known consumers, and record the incident
   and recovery decision. Published package versions are never overwritten.

## Consequences

- Security checks cover the branch used for integration and dependency changes
  receive a dedicated review gate.
- The repository has an explicit, expiring exception process instead of
  permanent inline suppressions. OSV ignores fail closed after their recorded
  expiry and remain under security/SRE code ownership.
- Current tarballs remain development artifacts. This ADR deliberately blocks
  promotion to `supported` until SBOM, provenance, signing/attestation, and
  clean-consumer verification are implemented.
- Dependabot configuration is loaded from the default branch. These updates
  become active when the security configuration is promoted from `develop` to
  `main`; that promotion is a public-readiness release gate.
- GitHub/IaC must require the CI, scan, and public dependency-review checks plus
  code-owner approval on protected integration and release branches. No
  repository ruleset was visible when this decision was recorded.
- PR-G1 owns the ZK manifest and digest-verifier implementation. The future
  release workflow owns SBOM, attestation, and publication mechanics; neither
  requirement is satisfied by this policy document alone.
