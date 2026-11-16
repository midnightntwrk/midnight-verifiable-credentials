# Ledger9 migration profile

This is the selected source migration profile for [issue 754](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/754),
not a claim that an immutable VC release with this profile is published or that
all compatibility gates have passed. The credential-schema API remains intact.
Release numbering and publication require separate release approval.

## Exact identities

| Surface | Selected identity |
| --- | --- |
| Compact compiler | `0.36.0` |
| Compiler version output (Linux) | `0.36.0 (b5d9e4dfc 2026-11-03)` |
| Backend dependency, measured with `compact compile --ledger-version` | `zkir-3.2.0-rc.2` |
| Generated ZKIR format | 3.1, per the compiler release notes |
| Compact runtime, both packages | `@midnight-ntwrk/compact-runtime@0.21.0` |
| DID domain / Schnorr direct dependencies | `@midnight-ntwrk/midnight-did-domain@1.0.0-rc1`, `@midnight-ntwrk/midnight-did-jubjub-schnorr@1.0.0-rc1` |
| DID development dependency / transitive contract | `@midnight-ntwrk/midnight-did@1.0.0-rc1`, `@midnight-ntwrk/midnight-did-contract@1.0.0-rc1` |
| Public Ledger operation cohort (Schnorr dependency) | `@midnightntwrk/ledger-v9@1.0.0` (scope has no hyphen) |
| Contributor environment | Node.js 24, pnpm 11.25.0; Compact devtool 0.5.1 |

The compiler/backend measurement is not the npm Ledger version. Do not replace
an old `ledger-8.0.2` compiler assertion with an invented `ledger-9` string.
`midnight.compactBackendVersion` records the measured flag output;
`midnight.supportedLedger` declares the separate public npm cohort. It does not
prove that the package is installed or compatible. Internal older Ledger/SDK
packages can be intentional; inspect actual resolved edges and nominal/WASM
object boundaries, rather than banning every older package name.

## Reproducible compiler and packed metadata

The repository-owned [Nix derivation](../../nix/packages/compact-toolchain.nix)
selects official [Compact 0.36.0 release assets](https://github.com/midnightntwrk/compact/releases/tag/compactc-v0.36.0)
by raw zip SHA-256 for Linux x86_64 and Darwin aarch64. The locked reusable
flake supplies only the devtool. Compiler selection does not float with that
flake. Linux execution and both archive hashes are verifiable independently;
Darwin execution requires a Darwin runner.

Both package guards and build-manifest writers reject compiler, backend,
installed-runtime or declared-runtime drift before accepting metadata. The
packed `dist/compact-build.json` contract is now **schema 2** in both packages:

```json
{
  "schema": 2,
  "compiler": "0.36.0",
  "backend": "zkir-3.2.0-rc.2",
  "runtime": {
    "name": "@midnight-ntwrk/compact-runtime",
    "version": "0.21.0"
  },
  "supportedLedger": {
    "name": "@midnightntwrk/ledger-v9",
    "version": "1.0.0"
  }
}
```

Manifests also retain source/artifact digests and source file inventory. The
ambiguous schema-1 `ledger` field is removed. Metadata consumers must migrate;
the clean packed-consumer checker rejects schema 1 and mismatched identities.
These metadata checks are necessary but are not artifact provenance or proof
of deployment compatibility.

## Artifacts, keys and DID migration

Rebuild every package-owned standalone root and complete downstream composition
with the selected compiler/runtime together. Never copy generated files from
another repository or reuse Ledger8 verifier keys. Compact 0.36 generates only
ZKIR3; recompiling older contracts changes keys. Deployment owners must follow
the compiler's key replacement/redeployment guidance. This library does not
perform deployments or add cross-contract calls.

Published [DID RC1](https://github.com/midnightntwrk/midnight-did/releases/tag/v1.0.0-rc1),
from `750268664278c162e9171406983dc45f24bb5be7`, is Ledger9-only. Its existing
Ledger8 DID histories cannot be transparently preserved through the RC1 public
API. Replacement deployment changes the DID/address: consuming applications
must explicitly re-resolve/rebind issuer and holder methods, pinned roots and
authorization descriptors, or select a credential reissuance policy. Full DID
applications coordinate all five RC1 packages and their matching ZK archive;
this VC repository does not add DID-api, wallets, Dust, or an application stack.

Canonical 32-byte big-endian Jubjub JWKs remain the mapping profile. Do not
reintroduce little-endian autodetection, use state versions as codec markers,
or substitute DID payload-signing challenges for VC issuance/presentation
challenges. Snapshot acceptance, signer authority, status, trusted time and
freshness remain external. Ledger9 capability does not turn these equality
circuits into live DID calls. Network-binding hardening remains separate
[issue 696](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/696).

## Cryptographic compatibility and bounded proof validation

Compact 0.36 requires Field-typed identity coordinates and explicit
`JubjubScalar` arguments for elliptic-curve multiplication. The public proof
response/challenge remain `Field`; scalar casts reduce modulo the Jubjub
subgroup order, as specified by runtime 0.21's numeric-to-scalar conversion.
The subgroup projection remains two multiplications by `(q + 1) / 8` and `8`,
with the same constant and equality check. Identity, off-curve and torsion
points remain rejected.

The conformance known-answer roots, challenges, signature scalars, canonical
framing and DID substitution roots are unchanged under this profile; they were
not regenerated to match new output. Four off-curve rejection diagnostics
change because onchain-runtime-v4 now reports `failed to decode for built-in
type EmbeddedGroupAffine` instead of a generic WASM `unreachable` trap.
Identity and order-two torsion rejection expectations remain unchanged. Vector
and manifest digests change because the diagnostic strings change, not because
cryptographic expected values were replaced.

Strict workspace and clean packed-consumer TypeScript checks pass without
`skipLibCheck`. Packed consumers verify the installed runtime/domain/Schnorr/
public Ledger cohort, compile standalone/composition roots and execute the
synthetic DID VC/VP flow. This is bounded composition/pure-circuit evidence.

The unadapted generic transient point hash exposed a typed-lowering defect.
Before the canonical helper below, compiling the signer-authorization consumer
without `--skip-zk` panicked in ZKIR's cost model
with `cannot convert JubjubPoint to "Native"` (`midnight-proofs-0.8.2`,
`cost_model.rs:286`). A dependency-free reproducer for Compact 0.36.0 is:

```compact
pragma language_version >= 0.28;
import CompactStandardLibrary;
export ledger commitment: Field;
export circuit commit(point: JubjubPoint): [] {
  commitment = disclose(transientHash<JubjubPoint>(point));
}
```

The private `transientHashJubjubPoint` helper now hashes exactly
`Vector<2, Field>[jubjubPointX(point), jubjubPointY(point)]` at the two public-key
and nonce-point sites in the context challenge. The runtime's canonical
JubjubPoint alignment and value are x then y native fields, with no length
prefix or nominal tag. The fixed vector uses exactly those same inputs;
`upgradeFromTransient`, surrounding persistent hashes, context domains and the
public proof/challenge API are unchanged. This is neither a new byte format nor
a serialization framework. Persistent composite hashing is not rewritten.

Compact 0.31.1's default backend flattened the point into two fields before
hashing; its experimental typed backend already omitted that encoding. The
0.36 typed generic transient-hash path forwards the native point without the
required consuming-boundary encoding. Explicit native coordinate projection
preserves the old canonical preimage while avoiding that lowering defect. See
the frozen [runtime descriptors](https://github.com/LFDT-Minokawa/compact/blob/b5d9e4dfc532fe47011c4f6296e254f4853eb469/runtime/src/compact-types.ts#L93-L112)
and [typed lowering](https://github.com/LFDT-Minokawa/compact/blob/b5d9e4dfc532fe47011c4f6296e254f4853eb469/compiler/zkir-v3-passes/reduce-to-zkir.ss#L249-L257).

Package-local regressions compare both public challenge entrypoints against the
original runtime point descriptor across issuer/verifier/authority/nonce
fixtures, retain the fixed issuance challenge/signature, and reject changed
bodies/contexts and identity/off-curve/torsion points. The helper stays private.
Native standard-library Schnorr has a different transcript and is not a drop-in
replacement; subgroup, scalar, nonce and authorization rules are unchanged.

Normal key generation now succeeds for **all three circuits in the existing
signer-authorization composition**, with the fixed compiler/backend and no
`--skip-zk` or disabled cost/proof checks. Key generation alone is not proof
verification. A separate scratch-only native regression now also proves and
cryptographically verifies the following actual composition circuits:

| Circuit | Public transcript fields | Full public statement fields | Tagged proof bytes |
| --- | ---: | ---: | ---: |
| `syncSignerAuthorization` (authority-signed update) | 137 | 139 | 5765 |
| `assertAuthorizedIssuer` (after the update) | 59 | 61 | 5765 |
| `assertAuthorizedVerifierRequest` (materialized verifier) | 59 | 61 | 5765 |

The native engine is exact ZKIR commit
`eeb8a31620d07f74fd3f596ef8b20b9bd1cebec2` (3.2.0-rc.2), with its original
Cargo manifest and lockfile unchanged, including ledger dependency commit
`9a8777c4d035fc7f38ae286bcf5f8656668efd9f`. It consumes the existing `.bzkir`,
prover and verifier keys, not regenerated keys or a different proof-server
backend. Hash-checked existing Midnight parameters `bls_midnight_2p15` and
`bls_midnight_2p16` are read locally in synchronous mode; no substitute or mock
parameters are used. Native tooling is test-only scratch evidence, not a VC
production Rust dependency, SDK, service or new public interface.

Execution uses the generated `Contract.provableCircuits`, constructor-initialized
synthetic authority/ledger state, an authority-signed update, then the issuer
assertion; a separate valid materialized verifier supplies the verifier-request
state. The public runtime's `proofDataIntoSerializedPreimage` converts the REAL
call trace (including secret argument inputs despite zero witness callbacks).
It is only a serialization bridge, not the prover. Its zero binding/randomness
is a standalone test convention, not production randomness advice.

`IrSource::prove` generates actual proofs; `VerifierKey::verify` verifies them.
The expected statement is independently reconstructed from trace binding and
communications commitment plus every IR Impact/skip in order, asserting exact
length, full transcript consumption and equality to returned public inputs.
All three serialized proofs roundtrip and verify again. Each circuit rejects:

- a changed signature response with its original commitment;
- that same invalid response with the communications commitment RECOMPUTED,
  rejected by the native prover's direct-assertion preprocessing (not a claim
  that an invalid proof was generated);
- a byte flipped INSIDE the generated `Proof.0`, submitted to cryptographic
  verification against the original complete statement;
- the original valid proof against an altered public transcript statement.

This is bounded standalone circuit proving/verification for the named synthetic
flows, not a submitted transaction, live RC1 resolver, arbitrary state/lifecycle
coverage, network deployment or end-to-end application test. The verifier's
initial state is still an external trust input. Ordinary packed-consumer CI
continues to use `--skip-zk`; native results must be identified separately, not
inferred from that lane. No wallet/application, Docker or deployment stack is
added.

## Validation required before support claims

Dependency intake must pass the repository's unchanged release-age, trust,
integrity and audit controls; any exception requires explicit maintainer
approval. Retain strict TypeScript declaration checks. Upstream use of
`skipLibCheck` is not permission to relax the VC consumer contract.

Before declaring the profile supported, resolve/freeze the exact registry graph,
refresh the Nix pnpm dependency hash, rebuild package-owned artifacts, and pass
build, conformance/negative vectors, clean packed consumers/installed graph,
full light and docs gates. Review every changed root, challenge, signature and
digest for compiler/runtime causes instead of blindly refreshing expectations.
The existing circuit-parameter cache must also be checked with actual ZKIR3 key
generation; version probes alone do not establish its suitability.

Node-only metadata regressions use synthetic fixtures, not the selected runtime.
Pure-circuit execution does not prove a deployed contract. Consumer compilation
with `--skip-zk` is composition evidence, not proving evidence. The composed
DID VC/VP fixture injects synthetic DID documents and does not establish live
RC1 provider resolution or deployment. Any live support claim needs separately
identified, immutable upstream/downstream integration evidence and a supported
network. The bounded local gates above do not establish live deployment support.
