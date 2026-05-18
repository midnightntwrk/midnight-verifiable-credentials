# Overview

<!-- Describe your changes briefly here, with some context as to why this is needed. -->

## Submission Checklist

<!-- Please check all the boxes that apply to your pull request. -->

- [ ] Useful pull request description
- [ ] Tests are provided (if possible)
- [ ] Key commits have useful messages
- [ ] All check jobs of the CI have succeeded
- [ ] Self-reviewed the diff
- [ ] Reviewer requested
- [ ] Update README.md file (if relevant)
- [ ] Update documentation (if relevant)
- [ ] No new todos introduced

## Surface-Change Checklist

<!--
Check these when the PR changes generated Compact/runtime surface, package
exports, credential literals, DTOs, claim representation, or verifier request /
response shape. Leave unchecked only when the PR is not a surface change.
-->

- [ ] Generated Compact/runtime surface reviewed for downstream literal/import impact
- [ ] Changelog or migration notes updated for breaking surface changes
- [ ] Claim representation documented when `claims` / `claimCommitments` shape changes
- [ ] Specs, README, templates, and scaffold guidance updated when a reusable pattern changes

## Links

<!--
- Link any relevant Confluence or additional Jira tickets if need be
- If your PR closes some of the existing issues, please add links to them here.
  Mentioned issues will be automatically closed.
  Usage: "Closes #<issue number>", or "Closes (paste link of issue)"
-->
