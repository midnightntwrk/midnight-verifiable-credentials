# Artifacts

Generated tarballs live under `tooling/artifacts/npm/`.

Purpose:

- verify the exact contents that the release workflow will publish
- test every public package from a clean, non-workspace consumer

Commands:

```bash
pnpm run artifacts:pack
```

Notes:
- only `candidate` and `supported` workspaces from the workspace catalog are
  packed
- private examples are validated but not packed
- `tooling/artifacts/npm/*.tgz` are generated outputs and are gitignored.
