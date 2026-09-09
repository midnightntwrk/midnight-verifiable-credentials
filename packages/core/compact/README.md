# @midnight-ntwrk/credential-compact

> Release stage: `supported`
> Maturity: `core`
> Package class: `dist`

Supported prerelease package for reusable, family-neutral Compact VC/VP
semantics. This is a library include surface, not a deployable contract,
credential family, proof artifact, or registry authority.

## Scope

The package contains generic VC/VP envelopes, schema references, issuer and
holder-binding shapes, proof/challenge primitives, VC-side status-binding
shapes, source-neutral signer-authorization descriptors and binding helpers,
VC/VP linkage helpers, and
protocol-neutral `compact-value-v1.base64url` TypeScript framing for canonical
Compact runtime values. `StatusRegistryRef` is vocabulary only: this package
does not authenticate registry mutation, roots, time, witnesses, or final
non-membership.

Signer authorization supports two composition modes. Applications may install
an accepted descriptor through local governance, or verify a domain-separated
authority proof before materializing the same descriptor. This package does not
resolve `midnight-did`, evaluate Trust Registry policy, synchronize registry
state, or provide trusted wall-clock time.

`verification-v1`, issuance/presentation protocol choreography, family claims
and predicates, status-registry authority, proving/deployment artifacts,
wallets, signing keys, witnesses, secrets, and use-case code are deliberately
excluded.

## Toolchain and generated output

The package is compiled with the pinned Compact `0.31.1` compiler and exactly
`@midnight-ntwrk/compact-runtime` `0.16.0`. Builds verify both versions, then
regenerate `src/managed` and `dist`; neither directory is hand-edited.
`dist/compact-build.json` records the exact compiler/runtime tuple, source digest,
and generated-artifact digest.

`./credentials.compact` is the only standalone root.
`./credentials/composable.compact` is the only composition-safe root: include it
exactly once before dependency-free family composition entrypoints. The other
credential leaf modules remain packaged for internal composition but are not
advertised as standalone exports because they rely on declarations supplied by
the shared root.

The external consumer gate compiles both canonical roots from the packed
tarball. Hidden-holder, pseudonym, and same-holder semantics require a dedicated
threat model and belong in independently versioned credential-family packages.

## Ownership

This package is the single canonical owner of reusable Compact VC/VP semantics.
The retired compatibility packages are not part of the workspace or release
surface. Their `verification-v1`, status-attestation, and hidden-holder
entrypoints are not supported by this package. Technical ownership is the VC
package maintainers; release operation and incident ownership are defined by
the repository's npm publication runbook.

## Usage boundary

Consumers must use the package name and explicit exports, never repository
relative includes or `src`/`managed` paths. Candidate tarball and clean-consumer
checks compile every advertised Compact entrypoint outside this repository.
