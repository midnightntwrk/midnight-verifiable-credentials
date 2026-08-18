# Public Compact fixture inventory

This repository tracks only the explicitly listed `src/managed` roots in
[`tooling/fixtures/compact-public/manifest.json`](../../tooling/fixtures/compact-public/manifest.json).
The set is prototype/use-case test evidence, not a production distribution
bundle. `dist/`, reports, caches, and the `birth-secret` and `digital-passport` prototypes are excluded from the fixture set; those omitted workspaces remain covered by the source-build fallback.

The fixture policy permits Compact-managed code, compiler metadata, prover keys,
verifier keys, `zkir`, and `bzkir`. It rejects wallet/controller/signing keys,
seed material, npm/GitHub credentials, deployment secrets, and private
witnesses. Every file is recorded with bytes and SHA-256; source, runtime,
compiler, and lockfile digests are recorded in the same manifest.

Run `pnpm run fixtures:inventory` to inspect the current checkout. Run
`pnpm run fixtures:validate` in CI: it fails closed on missing, undeclared,
stale, or mismatched fixtures. `pnpm run fixtures:regenerate` is the explicit
reviewed regeneration lane and refuses oversized files unless Git LFS is
available. The fixture set and its manifest are committed and validated; Git LFS stores only the large public ZKP bytes. Ordinary CI checks out LFS pointers without hydration, then restores the manifest-keyed public ZKP cache. On an exact-cache miss it attempts a scoped `git lfs pull` for the manifest-declared `.prover`, `.verifier`, `.zkir`, and `.bzkir` paths. If those pointers remain unhydrated because LFS bandwidth or cache hydration is unavailable, validation explicitly selects the source rebuild fallback. Cache entries are never accepted without manifest digest validation, and stale, mismatched, undeclared, or forbidden material fails closed.

The source rebuild fallback is intentional: changing a Compact source file, compiler/runtime input, lockfile, or compiler version must not silently trust stale fixtures. Valid manifest metadata and policy with unavailable hydration may use this fallback alongside provenance drift; missing, undeclared, malformed, stale, or forbidden artifacts still fail closed. The fixture cache proves only that committed artifact bytes match the manifest; it is not evidence that Compact source compiles. The source-build/drift lane continues to compile and test source independently. Scheduled/manual regeneration should produce a manifest diff
for review rather than overwrite the tracked set.
