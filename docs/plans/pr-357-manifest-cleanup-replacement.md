# Replace obsolete manifest-cleanup PR #357

## Status

In progress.

## Objective

Supersede obsolete PR #357 with a narrow manifest cleanup applied directly to current `origin/develop`, so package metadata includes only files and scripts that still exist.

## In scope

- Remove the obsolete root `docs:vc-spec` placeholder script.
- In the `same-holder`, `birth-secret`, `birth`, and `status-registry` package manifests, replace stale `tooling/scripts/*.mjs` package-file globs with package-local `scripts/*.mjs` globs after verifying those scripts exist.
- In the `protocols/openid` package manifest, remove `src/**/*.compact` and `scripts/*.mjs` package-file globs after verifying those paths remain absent.
- Validate workspace manifest policy, release package contracts, package boundaries, and the packed contents/catalog behavior for all six manifests.

## Explicit non-goals

- Do not merge or cherry-pick stale PR #357 history or merge commit `849d70e`.
- Do not change source code, generated outputs, lockfiles, package dependencies, build behavior, or unrelated manifests.
- Do not broaden package publication scope beyond correcting the six stale manifests.
- Do not merge the replacement PR; final merge remains a human decision.

## Acceptance criteria

- The branch is based exactly on current `origin/develop` before the cleanup is applied.
- Root `package.json` no longer contains the obsolete `docs:vc-spec` placeholder.
- The four package-local script globs reference existing `scripts/*.mjs` files and no longer reference nonexistent `tooling/scripts/*.mjs` paths.
- `packages/protocols/openid/package.json` no longer lists absent Compact or package-local script paths.
- The effective implementation diff contains only the six intended manifest edits plus this required plan artifact, with no generated output or lockfile churn.
- Relevant manifest, package-boundary, release-package, and package-content validation passes.
- The replacement PR targets `develop`, links and supersedes #357, and reaches green current-head CI with required review/gate evidence.

## Definition of done

- The plan and six manifest corrections are committed with DCO and signature, pushed on a fresh branch, and represented by a new draft-first PR targeting `develop`.
- The PR body records objective, scope, acceptance criteria, definition of done, non-goals, risks, and exact validation.
- PR #357 is closed as superseded with a durable link to the replacement PR.
- Draft gate, required external/Copilot review handling, pre-approval gate, resolved-thread checks, and exact-head green CI are complete.
- The loop stops at the explicit human merge-approval gate without merging.

## Validation

```bash
pnpm install --frozen-lockfile
pnpm run check:workspace-manifests
pnpm run check:release-package-contract
pnpm run check:package-boundaries
pnpm run artifacts:pack
pnpm run test:release-package-consumers
./run.sh --light
```

Package archives or the release-package checker must demonstrate the expected package contents for `same-holder`, `birth-secret`, `birth`, `status-registry`, and `openid`; root script validation covers the sixth manifest.

## Open questions and risks

- `./run.sh --light` has a documented unrelated baseline risk from managed Compact runtime artifacts; failures must be compared with `origin/develop` and only PR-introduced failures fixed.
- No scope questions remain; the user explicitly approved replacement rather than repair-in-place.
