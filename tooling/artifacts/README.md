# Artifacts

Generated tarballs live under `tooling/artifacts/npm/`.

Purpose:
- provide a stable packaging target for candidate and supported VC packages
- avoid patching tarballs in downstream repos
- make downstream vendor refreshes a copy operation instead of an ad hoc rebuild

Commands:

```bash
pnpm run artifacts:pack
./upgrade-libs.sh --destination /path/to/downstream-repo
```

Notes:
- only `candidate` and `supported` workspaces from the workspace catalog are
  packed
- internal compatibility packages, prototypes, use cases, scenarios,
  reporting, and integration infrastructure are intentionally excluded
- `tooling/artifacts/npm/*.tgz` are generated outputs and are gitignored.
