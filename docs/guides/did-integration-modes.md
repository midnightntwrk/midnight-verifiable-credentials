# DID Integration

The retained DID adapters consume the published Midnight DID `0.5.0` package
cohort from npm. They do not import a sibling checkout or consume copied source.

Direct consumers pin exact versions for:

- `@midnight-ntwrk/midnight-did`
- `@midnight-ntwrk/midnight-did-domain`

The root overrides keep transitive DID packages on the same cohort. When the
cohort changes, update all direct dependencies and overrides together, install
from the frozen lockfile, and run:

```bash
./run.sh integration-report
./run.sh check-integration
pnpm run test:did-key-normalization
```

The repository no longer consumes resolver secret-storage tarballs or other
local DID artifacts. Unpublished cross-repository dependencies must be copied
only by the root identity workspace tarball automation.

Top-level `midnight-did-credentials*` symlinks are local compatibility aliases
for retained Compact packages. Canonical source lives under `packages/` and new
TypeScript consumers must use package exports.
