# @midnight-ntwrk/credential-proofs

> Maturity: `core`
> Package class: `dist`
> Release stage: `supported`

Family-neutral proof execution ports and immutable, versioned proof/build/deployment
manifest contracts for credential-family repositories.

## Scope

This package defines `ProofJob`, `ProofProvider`, `ProofVerifier`, and
`ArtifactResolver`, plus contracts and validation for digest-addressed proof,
build, and deployment manifests. It is a contract-only boundary: providers,
verifiers, and resolvers are injected by an adapter and this package performs no
proof execution, artifact fetching, signature verification, or deployment.

The package does **not** own family circuits, proving or verifier keys, ZKIR/BZKIR,
deployment bundles, status authority, verification-v1 decisions/transcripts, or
runtime adapters. A complete deployable composition owns its generated artifacts
and supplies their immutable manifests; a manifest is evidence and metadata, not
an authority or trust decision.

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
