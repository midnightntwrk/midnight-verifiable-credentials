# Public Compact fixture inventory

This repository tracks only the explicitly listed `src/managed` roots in
[`tooling/fixtures/compact-public/manifest.json`](../../tooling/fixtures/compact-public/manifest.json).
The set covers only retained core Compact primitives: credentials,
status-registry, same-holder, and ISO registry. It is test evidence, not a
production distribution bundle. `dist/`, reports, and caches are excluded.

The fixture policy permits Compact-managed code, compiler metadata, prover keys,
verifier keys, `zkir`, and `bzkir`. It rejects wallet/controller/signing keys,
seed material, npm/GitHub credentials, deployment secrets, and private
witnesses. Every file is recorded with bytes and SHA-256; source, runtime,
compiler, and lockfile digests are recorded in the same manifest.

Run `pnpm run fixtures:inventory` to inspect the current checkout. Run
`pnpm run fixtures:validate` in CI: it fails closed on missing, undeclared,
stale, or mismatched fixtures. `pnpm run fixtures:regenerate` is the explicit
reviewed regeneration lane and refuses oversized files unless Git LFS is
available. The fixture set and manifest are committed; Git LFS stores only the
large public ZKP bytes. Validation rejects stale, mismatched, undeclared, or
forbidden material.

Changing Compact source, compiler/runtime input, the lockfile, or compiler
version must not silently trust stale fixtures. The source build independently
proves compilation. Scheduled or manual regeneration produces a manifest diff
for review.
