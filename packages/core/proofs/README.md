# @midnight-ntwrk/credential-proofs

> Maturity: `core`
> Package class: `dist`
> Release stage: `supported`

Family-neutral proof execution ports, DID/trust authority-evidence binding, and
immutable, versioned proof/build/deployment manifest contracts for
credential-family repositories.

## Scope

This package defines `ProofJob`, `ProofProvider`, `ProofVerifier`, and
`ArtifactResolver`, plus contracts and validation for digest-addressed proof,
build, and deployment manifests. It is a contract-only boundary: providers,
verifiers, and resolvers are injected by an adapter; manifest serialization,
SHA-256 integrity checks, artifact-byte checks, and Ed25519 deployment-signature
verification are runtime-agnostic Web Crypto operations. The exported resolver
helper verifies the requested manifest, descriptor identity, length, and digest
before returning artifact bytes. It performs no proof execution, artifact
fetching/publication, signing-key custody, or deployment.

The `authority-evidence` export consumes an authority-capable
`CredentialFamilyProfileV1` and `ResolvedCredentialCompositionV1`, requires exact
DID/trust resolver selections, and binds issuer, holder, verifier, and status
key fingerprints to authenticated method, relationship, network, state-version,
lifecycle, trust-scope, and trust-epoch evidence. Injected provider failures or
unauthenticated evidence are indeterminate; authenticated mismatches are invalid.
Its canonical JSON transcript commits selected evidence identity, observation
time, and exact state/epoch selections without retaining proof inputs, proof
bytes, or holder witnesses.
`verifyProofWithAuthorityV1` applies this evidence only after cryptographic proof
verification succeeds.

The `trusted-time` export defines a separate ledger/attested time port. Evidence
is bound to network, deployment, request, challenge, audience, origin, profile,
freshness policy, and source policy; future, stale, expired, rollback, replay, malformed, and
mismatched evidence fails closed. Sequence checkpoints stay stable across requests by
keying only network, deployment, verifier-selected authority, and source policy.
Authority-attested mode recomputes the verifier-selected policy digest before it
selects the configured actor, then composes the #494 DID/trust verifier with an
independent execution-anchor adapter. Caller time is
accepted only by `local-reference` under `offchain-public-v1` and remains
`local-process`.

The package does **not** own family circuits, proving or verifier keys, ZKIR/BZKIR,
deployment bundles, a DID method, a trust registry/governance policy, status
authority, Compact verification-v1 decisions/transcripts, or runtime adapters. A
complete deployable composition owns its generated artifacts
and supplies their immutable manifests; a manifest is evidence and metadata, not
an authority or trust decision. G1 signs the canonical deployment envelope with
explicit `Ed25519`; the deployment digest and signature omit only the
self-referential signature bytes, while covering the algorithm, key id, and all
deployment binding fields. This algorithm choice is scoped to generic off-chain
G1 manifests and does not claim interoperability with a DID or trust-registry
authority. Authority evidence is accepted only through the separately selected
profile/composition provider ports; G1 therefore remains integrity verification
only: locator/publication,
cache/revocation, recovery, deployment integration, and external trust/authority
layers remain follow-ups and are not silently selected by this package.

## Example

```ts
import {
  defineProofJob,
  type ProofProvider,
  type ProofVerifier,
} from "@midnight-ntwrk/credential-proofs";

const job = defineProofJob({
  formatVersion: 1,
  id: "employee-age",
  version: "0.1.0",
  familyId: "example.employee",
  circuitId: "age-over-threshold",
  proofManifestDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  input: { threshold: 18 },
});

const provider: ProofProvider = { prove: async (requested) => ({
  formatVersion: 1,
  jobId: requested.id,
  proofManifestDigest: requested.proofManifestDigest,
  proof: new Uint8Array(),
}) };
```

All package exports are ESM-only and depend only on registry-resolvable
`@midnight-ntwrk/credential-model` types at runtime. The candidate remains
private until clean consumer, ownership, compatibility, and release approvals
are complete.
