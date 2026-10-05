# @midnight-ntwrk/credential-compact

> Release stage: `supported`
> Maturity: `core`
> Package class: `dist`

Supported pre-1.0 package for reusable, family-neutral Compact VC/VP
semantics. This is a library include surface, not a deployable contract,
credential family, proof artifact, or registry authority.

## Install

```bash
pnpm add -E @midnight-ntwrk/credential-compact@0.2.0
```

`0.2.0` is the current stable release. To evaluate the current 0.3 release
candidate explicitly, install
`@midnight-ntwrk/credential-compact@0.3.0-rc1` and keep every package in the
VC graph on that same version. Confirm the moving `rc` tag before adopting it:

```bash
npm view @midnight-ntwrk/credential-compact dist-tags --json
```

## Scope

The package contains generic VC/VP envelopes, schema references, issuer and
holder-binding shapes, proof/challenge primitives, VC-side status-binding
shapes, source-neutral signer-authorization descriptors and binding helpers,
VC/VP linkage helpers, and
protocol-neutral `compact-value-v1.base64url` TypeScript framing for canonical
Compact runtime values. `StatusRegistryRef` is vocabulary only: this package
does not authenticate registry mutation, roots, time, witnesses, or final
non-membership.

Context-specific proof helpers validate signer references, reject identity,
off-curve, and non-prime-subgroup Jubjub public keys and nonce points, derive
domain-separated challenges, and verify Schnorr signatures. Signed timestamps
and challenge hashes still require application-defined time, freshness,
audience, and replay policy.

`ExplicitHolderPresentationProof<TPublicClaims, TClaimCommitments,
TDisclosures, TStatusBinding>::assertValidPresentationProof` is the supported
presentation-proof entrypoint. It accepts the credential, an independently
accepted holder public key, the complete presentation, and its proof; derives
the presentation root internally; validates generic VC-to-VP relations; rejects
holder or proof-key mismatch; binds the proof signer reference and key; and
verifies the presentation-context signature. The accepted key is a trust input:
the circuit cannot distinguish a pinned or authorized method snapshot from an
internally consistent attacker-supplied snapshot. Consumers still apply
credential-proof verification, DID resolution or snapshot authentication,
family-specific disclosure relations, status, freshness, and application policy
separately.

Signer authorization supports two composition modes. Applications may install
an accepted descriptor through local governance, or verify a domain-separated
authority proof before materializing the same descriptor. The authorization
proof is bound to a caller-configured network/consumer domain. The composed
`VC<>::assertAuthorizedIssuerProof` and verifier-request helper verify the
signature as well as the exact role, method, key, and scope binding. This
composed issuer helper is the supported authorization-aware issuance path.
`assertAuthorizedIssuerDescriptor` and
`assertProofSignerMatchesAuthorization` are low-level metadata comparisons and
do not verify a signature. `VC<>::assertValidCredentialProof` verifies a
credential's self-declared issuer proof but does not authorize that issuer. This
package does not resolve
`midnight-did`, evaluate Trust Registry policy, synchronize registry state, or
provide trusted wall-clock time.

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
The repository's
[`compact-circuits.json`](../../../conformance/compact-circuits.json) inventory
classifies the complete exported circuit surface and distinguishes supported
semantic operations from low-level composition primitives.

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

## TypeScript value framing

The TypeScript export encodes and decodes canonical Compact runtime values for
transport or storage. Typed application payloads should use
`encodeCompactPayload` and `decodeCompactPayload` with the generated descriptor
for that type.

```ts
import {
  decodeCompactValue,
  encodeCompactValue,
} from "@midnight-ntwrk/credential-compact";

const encoded = encodeCompactValue([Uint8Array.of(1, 2, 3)]);
const decoded = decodeCompactValue(encoded);
```

## Compatibility and support

- The TypeScript surface is ESM-only and supports Node.js 24 or newer.
- Compact consumers use compiler `0.31.1`, runtime `0.16.0`, and Ledger
  `8.0.2`.
- During `0.x`, breaking API changes may ship in a minor release. Keep exact
  versions pinned and read [`CHANGELOG.md`](./CHANGELOG.md) before upgrading.
- Release candidates are supported only until a newer candidate or stable
  release in the same minor line is published.

Technical ownership belongs to `@midnightntwrk/ex-identus`. Release operations
belong to `@midnightntwrk/mn-sre`. Security reports follow the repository
[`SECURITY.md`](../../../SECURITY.md) process.
