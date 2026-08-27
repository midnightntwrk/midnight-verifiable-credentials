# Compact artifact contract

Compact-backed package `compact` scripts own generation; `build`, `typecheck`, and
`test:ci` consume that generated state through the same script. The package-local
command remains self-contained for direct developer use, while repeated lifecycle
hooks are artifact-first.

`tooling/scripts/ensure-compact-artifacts.mjs` records a manifest under
`src/managed/.compact-artifact.json` after successful generation. The package's
artifact-owner command must pass the complete declared output set on every
invocation. A manifest is reusable only when all of these facts still hold:

- every Compact source below the package `src` root, plus every recursively
  included Compact source (including sources in another package), has the
  recorded digest;
- the current `compact compile --version`, `@midnight-ntwrk/compact-runtime`
  version, declared recipe-input contents, and deterministic compiler-command recipe digest match the manifest;
  and
- every declared output has the recorded complete generated-file inventory and
  content digest (including its generated `contract/index.js` entrypoint).

Missing or unresolved includes, malformed manifests, missing or stale generated
files, source changes, compiler-recipe changes, and toolchain changes invalidate
generation. Include parsing consumes Compact comments and formatting variants,
and resolves only `.compact` sources inside the Git repository or, when Git
metadata is unavailable, inside the bounded ancestor workspace marked by
`pnpm-workspace.yaml`. On invalidation, every output owned by the manifest is
removed and the owner command must regenerate the complete set before the
manifest is atomically published. `sourceRoot`, outputs, and the manifest are
required to remain within the package root; cross-package includes are read-only
inputs. A direct sub-target that omits an already-owned sibling fails clearly
rather than publishing an incomplete manifest. Generation is serialized per
manifest with a tokenized lock: stale owners are recovered by compare-and-remove,
ownerless locks are bounded and recovered deterministically, and a releasing
owner cannot remove a newer lock. Post-generation runtime
alignment and source-map cleanup remain package-owned steps and do not change
the validity inputs.

CI build cones and `managed-artifact-catalog.mjs` continue to own output grouping,
cache readiness, and output-cone checks. The artifact manifest is ignored generated
state and does not widen package exports or package boundaries.
