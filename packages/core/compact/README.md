# @midnight-ntwrk/credential-compact

> Release stage: `supported`
> Maturity: `core`
> Package class: `dist`

Supported prerelease package for reusable, family-neutral Compact VC/VP
semantics. This is a library include surface, not a deployable contract,
credential family, proof artifact, or registry authority.

## Scope

The package contains generic VC/VP envelopes, schema references, issuer and
holder-binding shapes, proof/challenge primitives, issuance and presentation
message envelopes, VC-side status-binding shapes, and VC/VP linkage helpers.
`StatusRegistryRef` is vocabulary only: this package does not authenticate
registry mutation, roots, time, witnesses, or final non-membership.

`verification-v1`, family claims and predicates, status-registry authority,
proving/deployment artifacts, wallets, signing keys, witnesses, secrets, and
use-case code are deliberately excluded.

## Toolchain and generated output

The candidate is compiled and checked with the pinned Compact `0.30.0` compiler
and exactly `@midnight-ntwrk/compact-runtime` `0.15.0`. Builds fail before
generated output is accepted if either resolved version drifts. `src/managed` and
`dist` are generated during build and are not hand-edited.
`dist/compact-build.json` records the exact compiler/runtime tuple, source digest,
and generated-artifact digest.

Only `./credentials.compact` and `./holder-binding/same-holder.compact` are
standalone roots. `./holder-binding/same-holder/composable.compact` is an
explicit composition fragment: include `credentials/bindings` (or the full
`credentials` root) first, then include the fragment exactly once. The other
credential leaf modules remain packaged for internal composition but are not
advertised as standalone exports because they rely on declarations supplied by
the shared root.

The external consumer gate compiles both standalone roots and the composition
fragment, then runs positive and negative same-holder vectors (different holder
secret, challenge, and binding) against each generated contract. This is a pure
binding predicate and adds no family or business semantics.

## Compatibility and ownership

The old private `@midnight-ntwrk/midnight-did-credentials` package remains an
internal compatibility facade for one migration cycle and receives no new API.
The old same-holder package remains private and unchanged as a compatibility
implementation. Technical ownership is the VC package maintainers; support and
publication ownership remain unassigned until a separate graduation review.
ADR-0014 remains **Proposed**; this candidate records an implementation graph,
not normative ADR acceptance.

## Usage boundary

Consumers must use the package name and explicit exports, never repository
relative includes or `src`/`managed` paths. Candidate tarball and clean-consumer
checks compile every advertised Compact entrypoint outside this repository.
