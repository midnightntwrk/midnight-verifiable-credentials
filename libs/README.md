# Transitional Local Dependencies

This repository is being split out of `midnight-did` before all shared packages
are published.

Use this directory only for `npm pack` generated tarballs, not copied build
artifacts.

Expected future transitional inputs if needed:

- `libs/midnight-did/*.tgz`
- `libs/midnight-verifiable-credentials/*.tgz`

Do not hand-copy `dist/` output here.

## Packaging helper

For a stable local export surface before copying into `libs/`, build tarballs into
`artifacts/npm/` first:

```bash
npm run artifacts:pack
```

Then refresh `libs/` directly if needed:

Refresh the local tarballs for this repository with:

```bash
./upgrade-libs.sh --destination ./libs
```

The default pack script intentionally skips `credentials-demo-contract` because that workspace composes Passport-specific packages that now live in `midnight-identity-solution-examples`.
