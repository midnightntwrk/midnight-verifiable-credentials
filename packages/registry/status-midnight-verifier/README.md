# `@midnight-ntwrk/credential-status-midnight-verifier`

> Maturity: `infrastructure`
> Package class: `dist`

Internal candidate read/proof adapter for Midnight status registry state.

The package exposes:

- exact same-contract lookup over one authenticated `StatusRegistryStateV1` snapshot;
- a SHA-256 reference Merkle verifier for membership and sorted-neighbor non-membership proofs;
- profile-, namespace-, deployment-, registry-, root-, version-, accepted-authority-policy-, verifier-trusted subject/request-, freshness-, and transcript-bound external proof verification;
- explicit #494 DID/trust authority and freshness provider ports;
- `createTrustedTimeStatusFreshnessVerifierV1`, which rejects local clocks and
  checks status age/expiry against scope-bound ledger or attested time; and
- shared JSON vectors available at `./test-vectors/authenticated-status-v1.json`.

Required omitted or unavailable proof, root authority, or freshness evidence is `indeterminate`. Authenticated mismatch, malformed/forged witness, stale root, or proved membership is `invalid`. Only proved non-membership for the policy's verifier-trusted leaf, credential, presentation, and challenge digests is `valid`; copying those values from holder evidence is unsafe.

The package remains least privilege: it imports proof verification semantics but no writer, mutation, signer, or key-custody API. Public external proofs may bind a stable handle digest. Hidden/private same-contract results emit only a challenge-scoped subject digest. External hidden-holder proof verification remains unavailable until a real zero-knowledge adapter can prove the scoped leaf relation without exposing stable holder material.

Maturity is intentionally `infrastructure`. `createSha256StatusProofVerifierV1()` is a cryptographic TypeScript reference verifier, **not** a Compact proof and not ledger authority. A pinned-toolchain probe compiled `MerkleTree.checkRoot(...)`, but rejected in-circuit `root()` access and could not call `pathForLeaf(...)`; no native Compact non-membership proof compiled. Callers must inject authoritative root/freshness providers and must not upgrade this result beyond their selected profile.
