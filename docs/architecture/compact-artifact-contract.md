# Compact artifact contract

Compact-backed package `compact` scripts own generation; `build`, `typecheck`, and
`test:ci` consume that generated state through the same script. The package-local
command remains self-contained for direct developer use, while repeated lifecycle
hooks are artifact-first.

`tooling/scripts/ensure-compact-artifacts.mjs` records a manifest under
`src/managed/.compact-artifact.json` after successful generation. A manifest is
reusable only when all of these facts still hold:

- every Compact source below the package `src` root has the recorded digest;
- the current `compact compile --version` and `@midnight-ntwrk/compact-runtime`
  version match the manifest; and
- every declared output contains its generated `contract/index.js` entrypoint.

Missing manifests, missing entrypoints, source changes, and toolchain changes
invalidate the manifest. Invalid outputs are removed before the deliberate
compiler command runs, and the manifest is written atomically only after all
outputs are present. Post-generation runtime alignment and source-map cleanup
remain package-owned steps and do not change the validity inputs.

CI build cones and `managed-artifact-catalog.mjs` continue to own output grouping,
cache readiness, and output-cone checks. The artifact manifest is ignored generated
state and does not widen package exports or package boundaries.
