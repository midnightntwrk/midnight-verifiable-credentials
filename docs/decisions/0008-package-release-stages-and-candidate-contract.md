# ADR-0008: Separate Package Build Artifacts From Supported Releases

- Status: Accepted
- Date: 2026-07-16

## Context

The monorepo produces tarballs for nineteen dist-class workspaces. Those
artifacts support isolated repository development while no VC npm registry is
available. Historically, all packages were private `0.1.0` packages with
wildcard ranges and ESM files exposed through `require` conditions. A tarball
could therefore exist without being consumer-correct, supported, or safe to
publish.

The repository also contains mixed maturity levels: reusable core,
experimental capabilities, credential-family references, orchestration,
demos, and integration infrastructure. Treating all packable workspaces as one
release train would create an unnecessarily large dependency and support
closure.

## Decision

1. Track `internal`, `candidate`, and `supported` release stages independently
   from package class, maturity, and pack eligibility.
2. Make only `@midnight-ntwrk/midnight-did-credentials` the first pre-1.0
   candidate. It has no VC workspace or sibling-repository runtime dependency.
3. Keep candidates private and registry-neutral while distribution uses
   workspace-produced tarballs. Packability does not imply publication or
   support.
4. Require candidates to expose one truthful module format, explicit runtime
   and Compact exports, compatible dependency ranges, complete metadata, a
   package changelog, deterministic prepack, and checked tarball contents.
5. Require clean external consumer evidence, named ownership, support and
   deprecation policy, registry selection, provenance, rollback, and release
   operations before advancing a candidate to `supported`.
6. Keep cross-repository consumption tarball-based and mediated by the root
   identity workspace; release packages never import sibling repository
   source.

## Consequences

- The core package can mature as a bounded release unit without implying that
  status, OpenID, credential families, demos, or integration harnesses are
  supported.
- `private: true` is an intentional guard for candidates until publication is
  separately approved.
- Consumers have an ESM-only contract and a bounded Compact runtime minor
  line instead of a false CommonJS path or wildcard runtime compatibility.
- CI packaging becomes slower because it proves each current tarball can build;
  performance optimization must preserve the candidate contract.
- The next stacked release task is a clean non-workspace consumer matrix. It
  provides evidence for graduation but does not itself select a registry or
  assign organizational ownership.
