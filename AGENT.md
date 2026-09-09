# AGENT

Engineering guide for `midnight-verifiable-credentials`.

## Scope

This is a core-only VC/VP specification and implementation repository. Follow
[ADR-0016](./docs/decisions/0016-core-only-specification-and-implementation.md).

Keep here:

- protocol-independent VC/VP data models and Compact primitives
- explicit holder-binding primitives
- generic credential-family and claim-schema metadata
- normative specifications and conformance vectors
- minimal synthetic composition fixtures

Keep out:

- concrete credential families and schemas
- product and organizational use cases
- wallet, issuer, verifier, or relying-party applications
- OIDC, DIDComm, connector, and business-process orchestration
- deployment environments and product integration harnesses

Credential families and substantial examples must live in independent
repositories with their own release trains. Use Git history and linked issues
for removed surfaces instead of preserving runnable compatibility implementations
or migration-only machinery here.

## Repository boundaries

Treat every `midnight-*` repository as independent. Never import sibling source,
generated files, `dist/` output, or package internals. Use published packages;
when a package is not published, consume tarballs copied by the root
`midnight-identity-workspace` automation.

Do not modify sibling repositories from this checkout. `NightFi` and
`arc-passport` are read-only references unless the user explicitly authorizes
work in them.

## Package layering

Allowed dependency direction:

```text
examples -> core
```

Rules:

- `packages/core` must not depend on adapters, registries, examples, or apps.
- packages must expose public entrypoints; consumers must not deep-import
  another package's `src`, `dist`, or generated implementation files.
- keep the workspace dependency graph acyclic.

The executable boundary policy is `pnpm run check:package-boundaries`.

## Workspace management

The authoritative workspace inventory is defined together in:

- `pnpm-workspace.yaml`
- `tooling/scripts/workspace-catalog.mjs`

Update both in one change. Internal workspace dependencies use
`workspace:*`. Use pnpm only; do not create `package-lock.json` or yarn lockfiles.

## Compact artifacts

Compact sources and generated artifacts are owned by their package. Do not copy
generated outputs across package or repository boundaries.

When Compact sources or runtime inputs change:

```bash
pnpm run build
```

Never commit wallet keys, signing keys, seeds, witnesses, credentials, or other
private material.

## Validation

Install exactly from the lockfile:

```bash
pnpm install --frozen-lockfile
```

Run the narrowest relevant lane while iterating:

```bash
./run.sh lint
./run.sh typecheck
./run.sh build
./run.sh test
./run.sh conformance
./run.sh package
```

Before a PR, run:

```bash
./run.sh --light
git diff --check
```

`./run.sh --light` is the core-only gate. It must remain free of Docker and
product/use-case integration environments.

## Pull requests

- Base core-only work on the repository's current integration branch unless an
  active stack requires a documented predecessor branch.
- Use `codex/*` branch names.
- Keep no more than two active stack levels.
- Commit with DCO and GPG:
  `git commit -S --signoff -m "<type>: <subject>"`.
- Follow `.devloops` for the required current-head external review and CI state.
- This repository uses human-only merges. Agents may push and prepare PRs but
  must not merge them.
- Treat findings against deleted or superseded surfaces as obsolete. Fix only
  real defects in the retained core or in the change's validation path.

## References

- [Specification](./spec/README.md)
- [Conformance](./conformance/README.md)
- [Documentation index](./docs/README.md)
- [Glossary](./docs/glossary.md)
- [Architecture decisions](./docs/decisions/README.md)
