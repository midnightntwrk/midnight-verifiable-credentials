# Contributing

We welcome your contributions to the Midnight network! By contributing, you'll play a vital role in shaping the future of a blockchain focused on data privacy.

## Contributor License Agreement

Like many other open source projects, we ask contributors to sign a contributor
License Agreement before accepting contributions. We use CLA assistant (https://github.com/cla-assistant/cla-assistant) to streamline the CLA
signing process, enabling contributors to sign our CLAs directly within a GitHub pull request.

## Getting Started

* **Review Existing Contributions and Issues:** Before submitting, please check if a similar issue or feature request already exists by searching our issue tracker.
* **Understand the Project:** Familiarize yourself with Midnight's architecture, technology, and coding standards. You can find relevant information in our litepaper.
* **Set up Your Development Environment:** Ensure you have the necessary tools and dependencies installed. See our developer [documentation](https://docs.midnight.network/) for detailed instructions.

## Submitting Issues

Use one of the [templates] to submit an issue to the Project Board. The Midnight team or a community member will address it if it's relevant.
Ensure the title is a clear summary of the requirement and provides enough context.

**Issue Types:**

* **Bug Report:** Provide detailed information about the issue, including steps to reproduce it, expected behavior, and actual behavior, screenshots, or any other relevant information.
* **Documentation Improvement:** Clearly describe the improvement requested for existing content and/or raise missing areas of documentation and provide details for what should be included.
* **Feature Request:** Clearly describe your feature, its benefits, and most importantly, the expected outcome. This helps us analyze the proposed solution and develop alternatives.
* **Enhancement:** (WIP)

## Code Contribution Process

* **Pull Requests:** Code contributions are submitted via Pull Requests.
* **Fork the Repository:** Create your own fork of the Midnight repository.
* **Create a Branch:** Make your changes in a separate branch,
  prefixed with a short name moniker (e.g. `jill-my-feature`).
* **Follow Coding Standards:** Adhere to the coding style guides specified in our documentation.
* **Write Tests:** Include unit tests and integration tests to cover your changes.
* **Commit Messages:** Write clear and concise commit messages.
* **Submit Pull Request:** Submit your pull request to the appropriate branch in the main repository.
* **Please do not `--force` pushes** - doing so means that reviewers will have to re-review all
  commits in the PR rather than commits since last review.
* **Code Review:** All pull requests undergo code review by project maintainers.
  Be prepared to address feedback from reviewers.

## Commit Message Convention

Use Conventional Commits for new contributions:

```text
<type>(<scope>): <summary>
```

Examples:

```text
feat(credentials-status-registry): add status proof protocol helpers
fix(credentials-protocol): retain latest finalized outcome on tied timestamps
docs(spec): clarify status binding versus proof protocol split
test(credentials-demo-contract): add revocation demo smoke coverage
ci(root): skip heavy lanes for docs-only pull requests
```

Recommended types:

* `feat`
* `fix`
* `docs`
* `refactor`
* `test`
* `build`
* `ci`
* `chore`

Recommended scopes for this repository:

* `root`
* `docs`
* `spec`
* `credentials`
* `credentials-status-registry`
* `credentials-same-holder`
* `credentials-iso-registry`
* `credentials-offchain-did`
* `credentials-openid`
* `credentials-protocol`
* `credentials-birth`
* `credentials-birth-secret`
* `credentials-demo-contract`
* `standalone-environment`
* `serenity-vc-scenarios`

Rules:

* keep the summary imperative and concise
* use a real scope whenever the change is package- or area-specific
* use `root` when the change spans the repository without a better single scope
* if one PR has multiple commits, each commit should still be meaningful on its own

## Pull Request Description Convention

Pull request bodies should use real Markdown with actual newlines. Do not pass a
single escaped string containing literal `\n` sequences.

Use this structure:

```md
## Summary
- what changed
- what changed

## Why
- why the change was needed

## Validation
- command
- command

## Follow-ups
- optional
```

Rules:

* prefer short bullets over long prose
* include the real validation commands that were run
* add follow-ups only when there is material deferred work
* if the PR is docs-only, say so plainly in `Summary` or `Why`

## Requirements for Acceptable Contributions:

* **Coding Standards:** Code must adhere to the coding style guides defined in our documentation
* **Testing:** New functionality must include corresponding unit tests and integration tests.
* **Documentation:** Code changes should be accompanied by proposed relevant documentation updates.
* **License:** All contributions must be compatible with the project's license.
  Where possible all files should have this license header:

```ts
// This file is part of <REPLACE WITH REPOSITORY NAME>.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
```

Where this is not possible, a copy of the Apache 2.0 or the repository's top-level LICENSE file in the same directory is required

## Support and Communication:

Ask anything about Midnight! We're here to help. Connect with us on [Discord](https://discord.com/invite/midnightnetwork), [Telegram](https://t.me/Midnight_Network_Official), and [X](https://x.com/MidnightNtwrk) and Join the Community to stay updated and engage with other Midnight enthusiasts.

We appreciate your contributions!
