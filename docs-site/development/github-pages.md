# GitHub Pages

The documentation site is built with VitePress and published by GitHub Actions.

## Published URL

```text
https://midnightntwrk.github.io/midnight-verifiable-credentials/
```

The repository Pages source is `GitHub Actions`. The VitePress base path is
derived from `GITHUB_REPOSITORY` during workflow builds.

## Workflow Behavior

- Pull requests to `develop` or `main`: validate and build relevant docs changes.
- Pushes to `develop`: validate and build relevant docs changes.
- Pushes to `main`: build, deploy, smoke test, and crawl the published site.
- Manual dispatch: deploy only when the selected ref is `main`.
- A scheduled workflow checks links after the workflow is promoted to the
  default branch.

The site publishes from `main`, while `develop` remains the integration branch
for specification and package work. A docs deployment is public, so source
material must not contain private links, secrets, credentials, witnesses, or
unpublished product details.

Verify the repository setting with:

```bash
gh api repos/midnightntwrk/midnight-verifiable-credentials/pages \
  --jq '{html_url, build_type}'
```
