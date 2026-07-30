# Public Compact fixture inventory

This repository tracks only the explicitly listed `src/managed` roots in
[`tooling/fixtures/compact-public/manifest.json`](../../tooling/fixtures/compact-public/manifest.json).
The set is prototype/use-case test evidence, not a production distribution
bundle. `dist/`, reports, caches, and the `birth-secret` prototype are excluded.

The fixture policy permits Compact-managed code, compiler metadata, prover keys,
verifier keys, `zkir`, and `bzkir`. It rejects wallet/controller/signing keys,
seed material, npm/GitHub credentials, deployment secrets, and private
witnesses. Every file is recorded with bytes and SHA-256; source, runtime,
compiler, and lockfile digests are recorded in the same manifest.

Run `pnpm run fixtures:inventory` to inspect the current checkout. Run
`pnpm run fixtures:validate` in CI: it fails closed on missing, undeclared,
stale, or mismatched fixtures. `pnpm run fixtures:regenerate` is the explicit
reviewed regeneration lane and refuses oversized files unless Git LFS is
available. The current origin/develop checkout has no fixture roots committed;
this phase therefore leaves the manifest in `awaiting-lfs-storage` state and CI
must use the documented source rebuild fallback until LFS is installed and the
fixture set is reviewed.

The source rebuild fallback is intentional: changing a Compact source file,
compiler/runtime input, lockfile, or artifact digest must not silently trust
stale fixtures. Scheduled/manual regeneration should produce a manifest diff
for review rather than overwrite the tracked set.
