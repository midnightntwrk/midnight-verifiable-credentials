# ADR-0003: ZK artifact distribution and discovery

- Status: Accepted
- Date: 2026-07-15
- Owners: credential product, release engineering, and verifier maintainers
- Supersedes: none
- Reconciled by: [Credential-family ownership policy](../architecture/credential-family-ownership-policy.md) (issues #374/#378)

## Context

Midnight deployable contracts need exact prover, verifier, and ZKIR artifacts.
These files may be large and are sensitive to Compact source, compiler,
runtime, and composition changes. Package versions, schema versions, artifact
digests, and deployment addresses identify different things and must not be
collapsed into one version string.

Mutable URLs or package-relative assumptions make it possible to prove or
verify with artifacts that do not correspond to the deployed contract.

## Decision

Pure credential-family packages publish no proving artifacts. The final
deployable contract owns the artifact bundle generated from its complete
composition.

Each release produces an immutable build manifest containing at least:

- product, package, schema, and contract identifiers;
- source commit and clean-tree assertion;
- Compact compiler, runtime, and generator versions;
- circuit identifiers and parameterization;
- artifact paths, byte sizes, and cryptographic digests;
- dependency lockfile digest;
- SBOM and provenance references; and
- the digest of the manifest itself.

The canonical bundle preserves the Midnight artifact layout expected by
runtime tooling, including `keys/<circuit>.prover`,
`keys/<circuit>.verifier`, and `zkir/<circuit>.bzkir` where those files are
required.

A separate signed deployment manifest binds a build-manifest digest to:

- network and chain identifiers;
- contract address and deployment transaction or block reference;
- constructor/configuration digest;
- accepted DID, trust-registry, status, and policy references;
- governance owner and support window; and
- predecessor, successor, deprecation, or revocation information.

Artifacts are distributed by digest through an OCI-compatible registry and a
matching release attachment. Package tarballs contain typed locator metadata
and verification code, not mutable copies of large proving keys. An optional
offline bundle may include the tarballs and artifacts while preserving the same
digests.

Consumers resolve an exact manifest digest, verify all bytes before use, cache
by digest, and fail closed on mismatch. `latest`, branch names, and mutable tags
are not valid production selectors. Trust-registry entries may discover an
approved deployment-manifest digest but do not host the artifacts.

## Public prototype/use-case fixture exception

The production distribution decision above does not prohibit a deliberately
curated public test-fixture set. `tooling/fixtures/compact-public/manifest.json`
defines the only prototype/use-case `src/managed` roots that may be restored by
ordinary CI. Managed code, prover keys, verifier keys, `zkir`, and `bzkir` are
public build artifacts in this fixture set, not secret keys. They remain bound to
source, compiler/runtime, lockfile, and per-file digest/byte metadata.

This exception is not a production bundle or npm package surface: `dist/`,
reports, caches, deployment manifests, and unlisted package outputs remain
excluded. Wallet/controller/signing keys, seed material, npm/GitHub credentials,
deployment secrets, and private witnesses remain prohibited. Fixture validation
fails closed on drift; missing or stale fixtures invoke the explicit source-build
fallback rather than silently accepting stale output.

Large fixture files use the repository-approved Git LFS policy in `.gitattributes`;
this approved storage path keeps generated public keys and circuits out of normal
Git blobs while preserving their manifest digests and byte sizes. The regeneration
command still refuses oversized files when Git LFS is unavailable.

## Consequences

- A verifier can prove that local artifacts correspond to a known build and
  deployment.
- Package release, schema evolution, artifact generation, and deployment can
  evolve independently without ambiguous identifiers.
- Release automation must generate, sign, publish, mirror, and test manifests.
- Offline and mobile clients need storage and eviction policies for large
  digest-addressed assets.

## Rejected alternatives

- **Embed all keys in npm tarballs:** increases package size and couples
  JavaScript package installation to runtime-specific artifacts.
- **Publish mutable object-store paths:** cannot give reproducible or fail-closed
  resolution.
- **Store binaries in the trust registry:** mixes authorization metadata with
  large artifact distribution and availability concerns.

## Follow-up

Manifest schemas, signing policy, consumer verification, publication lanes,
and disaster recovery are tracked in
[`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md).

## References

- [OCI Distribution Specification](https://specs.opencontainers.org/distribution-spec/)
- [SLSA artifact verification](https://slsa.dev/spec/v1.2/verifying-artifacts)


## Repository ownership reconciliation (2026-07-30)

This ADR remains the artifact authority. Pure credential-family prototypes do
not own final proving, verifier, or ZKIR bundles; a complete deployable
composition owns the immutable manifest. The approximately 758 MB storage
decision is not approved by issues #374/#378. Artifact storage (#376) and CI
restore/regeneration/drift behavior (#377) remain separate follow-up work. No
signing secret, controller/private key, deployment credential, seed, or other
operational secret may be committed.
