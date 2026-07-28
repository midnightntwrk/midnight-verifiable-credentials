# Public Repository Hardening Plan

Status: in progress

Repository audit: 2026-07-28

Tracking: [#324](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/324),
[#350](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/350)

## Objective

Maintain a public repository baseline that is safe for contributors, produces
actionable security evidence, and keeps repository-local controls separate from
GitHub organization and infrastructure-as-code settings.

The organizational implementation reference is `midnightntwrk/midnight-did`.
VC package ownership, validation, release scope, and credential-family
boundaries remain repository-specific.

## Current baseline

- GitHub visibility is public.
- The default branch is `main`; normal engineering pull requests target
  `develop`.
- Community files, issue templates, and canonical pull-request templates exist
  on `develop`.
- GitHub's community-profile API currently reports 87% because `main` does not
  yet contain the issue and pull-request template fixes merged to `develop`.
- The repository description is still `This Repository is Managed by
  Terraform`, and the repository has no topics.
- Pull-request dependency review is configured to activate only for a public
  repository.
- General code and dependency scanning fails on high-severity findings.
- npm publication is manually dispatched and uses provenance.

## Repository-local controls

- [x] Keep external GitHub Actions pinned to full commit SHAs.
- [x] Disable persisted checkout credentials.
- [x] Keep the general Scan workflow on `develop`, `main`, and release branches.
- [x] Preserve high-severity gating in the general Scan workflow.
- [x] Move OpenSSF Scorecard publication to a dedicated workflow.
- [x] Publish official Scorecard results from `main` and on a weekly schedule.
- [x] Upload Scorecard SARIF with least-privilege job permissions.
- [x] Enforce Scorecard separation and permissions in
  `check-security-workflows.mjs`.
- [x] Keep security/SRE ownership on security-sensitive workflows and policy.
- [x] Remove template placeholders and duplicate contribution guidance.
- [x] Keep private vulnerability reporting as the documented disclosure path.

## GitHub and IaC owner actions

These controls cannot be completed reliably in product-repository files:

- [ ] Promote the current `develop` community-file fixes to `main`.
- [ ] Set the repository description to:
  `Reusable Midnight VC/VP packages, protocol adapters, status/revocation components, and conformance prototypes.`
- [ ] Add topics: `midnight`, `verifiable-credentials`, `verifiable-presentations`,
  `self-sovereign-identity`, `zero-knowledge`.
- [ ] Configure `main` and `develop` rulesets with required pull requests,
  code-owner review, signed commits, and the intended required status checks.
- [ ] Confirm private vulnerability reporting and security advisories are
  enabled.
- [ ] Confirm secret scanning and push protection are enabled.
- [ ] Confirm npm publication environment protection and the required npm
  trusted-publishing/token configuration.
- [ ] Run the dedicated Scorecard workflow on `main` and triage the first
  published result.

These settings belong in `midnight-iac` or GitHub administration. Do not add
organization credentials or settings automation to this repository.

## Scorecard evidence model

The general Scan workflow owns Checkov, Trivy, OpenGrep, and other actionable
code/dependency scanning. It deliberately skips Scorecard so positive and
diagnostic Scorecard records do not compete with the official result in Code
Scanning.

The dedicated Scorecard workflow:

- runs after pushes to `main`, weekly, and by manual dispatch
- uses the official `ossf/scorecard-action`
- publishes the result through OIDC
- uploads SARIF to GitHub Code Scanning
- has no write permission beyond OIDC and security-event publication

## Validation

Repository-local changes are accepted when these commands pass:

```bash
pnpm run check:security-workflows
pnpm run docs:links
./run.sh --light
git diff --check
```

After promotion to `main`, verify the workflow reaches a terminal green state,
the README badge resolves, the official Scorecard viewer has a current result,
and GitHub's community-profile API surfaces the templates.
