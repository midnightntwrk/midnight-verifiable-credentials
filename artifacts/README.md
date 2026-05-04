# Artifacts

Generated tarballs live under `artifacts/npm/`.

Purpose:
- provide a stable packaging target for unpublished VC and standalone-environment packages
- avoid patching tarballs in downstream repos
- make downstream `libs/` refreshes a copy operation instead of an ad hoc rebuild

Commands:

```bash
npm run artifacts:pack
./upgrade-libs.sh --destination /path/to/downstream-repo
```

Notes:
- `credentials-demo-contract` is intentionally excluded. It is a repo-local demo contract, not a reusable dependency surface.
- `credentials-status-registry` is included. It is a reusable status/revocation
  prototype surface even though its contract-facing and off-chain builder
  responsibilities are still evolving.
- `artifacts/npm/*.tgz` are generated outputs and are gitignored.
