# ADR-0008: Separate Package Build Artifacts From Supported Releases

- Status: Accepted
- Date: 2026-07-16

## Context

The monorepo historically produced tarballs for every dist-class workspace.
Those artifacts supported isolated repository development while no VC npm
registry was available. Historically, all packages were private `0.1.0`
packages with wildcard ranges and ESM files exposed through `require`
conditions. A tarball could therefore exist without being consumer-correct,
supported, or safe to publish.

The repository also contains mixed maturity levels: reusable core,
experimental capabilities, credential-family references, orchestration,
demos, and integration infrastructure. Treating all packable workspaces as one
release train would create an unnecessarily large dependency and support
closure.

## Decision

1. Track `internal`, `candidate`, and `supported` release stages independently
   from package class, maturity, and pack eligibility.
2. Pack only candidate and supported dist-class packages. Internal, scenario,
   and source-only workspaces are not packable.
3. Establish the RC2 publication foundation as five supported packages:
   `credential-model`, `credential-compact`, `credential-proofs`,
   `credential-status`, and `credential-did-midnight`. Keep legacy Compact,
   concrete families, authority implementations, and application wiring
   internal while reusable surfaces are extracted.
4. Require candidates to expose one truthful module format, explicit runtime
   and Compact exports, compatible dependency ranges, complete metadata, a
   package changelog, deterministic prepack, and checked tarball contents.
5. Require clean external consumer evidence, named ownership, support and
   deprecation policy, registry selection, provenance, rollback, and release
   operations before advancing a candidate to `supported`.
6. Use registry versions for published dependencies. Where an unpublished
   package still requires cross-repository integration, keep tarball handoff
   mediated by the root identity workspace; release packages never import
   sibling repository source.

## Consequences

- The model package can mature as a bounded release unit without implying that
  status, OpenID, credential families, demos, or integration harnesses are
  supported.
- `private: true` is an intentional guard for candidates until publication is
  separately approved.
- Consumers have an ESM-only contract and a bounded Compact runtime minor
  line instead of a false CommonJS path or wildcard runtime compatibility.
- CI packaging becomes faster and more accurate because it packs only
  release-approved packages and proves each tarball against its declared clean
  consumer matrix.
- Publication enablement remains a separate reviewed change that selects the
  registry, provenance, version, and release operations.

## Implementation status

The first implementation of this decision promoted
`@midnight-ntwrk/credential-model` to `supported` and added the manual npmjs
workflow. RC2 extends that supported surface to the four reusable VC
packages listed above. The workflow publishes only supported paths from the
workspace catalog and cannot publish prototypes, use cases, or internal
compatibility workspaces.
