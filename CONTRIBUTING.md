# Contributing

We welcome contributions to Midnight Verifiable Credentials. This repository
focuses on reusable VC/VP packages, protocol and runtime adapters, and
credential-family prototypes used as architecture and conformance evidence.

## Contributor License Agreement

Contributors must sign the project Contributor License Agreement. CLA Assistant
guides contributors through signing from the pull request when required.

## Before You Start

- Search existing issues and pull requests for related work.
- Read [`AGENT.md`](./AGENT.md) for repository boundaries and validation.
- Read the [package boundary guide](./docs/architecture/package-boundaries.md)
  before adding or moving reusable code.
- Open or confirm an issue for substantial behavior, architecture, security, or
  public API changes.
- Keep concrete, independently released credential families in their owning
  repositories; this repository may carry prototypes and use cases as evidence.

## Contribution Workflow

- Fork the repository and create a focused branch from `develop`.
- Keep changes scoped to the owning package and update nearby tests and docs.
- Follow the existing TypeScript, Compact, linting, and formatting conventions.
- Include unit, integration, negative, or conformance evidence appropriate to
  the change.
- Use clear Conventional Commit style messages.
- Include a DCO sign-off (`Signed-off-by: Name <email>`). GPG-signed commits are
  required for repository-facing maintainer work and encouraged for external
  contributors.
- Open normal engineering pull requests against `develop`. Release-promotion
  pull requests target `main`.
- Respond to review and CI findings without widening the PR scope silently.

Avoid force-pushing after review unless a maintainer asks for a rebase or
history rewrite; force-pushes make incremental review harder.

## Commit Convention

Use:

```text
<type>(<scope>): <summary>
```

Common types are `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, and
`chore`.

Preferred architecture scopes include `root`, `docs`, `spec`, `core`,
`registry`, `protocols`, `components`, `prototypes`, `use-cases`, `tooling`,
and `assets`. A package-specific scope is appropriate for a narrowly owned
change.

Keep the summary imperative and concise. Every commit in a multi-commit pull
request should remain meaningful on its own.

## Public Surface Changes

Treat these as public VC surfaces:

- Compact exported structs, circuits, and generated managed artifacts
- package exports, entrypoints, dependency boundaries, and release manifests
- credential, presentation, protocol, connector, and status/revocation DTOs
- claim representation, holder binding, verification, and error semantics
- `./run.sh`, CI workflows, package publishing, and artifact contracts

For surface changes, update tests, package documentation, specifications, and
migration notes in the same pull request. Run:

```bash
pnpm run check:vc-surface-discipline
```

## Validation

For most pull requests, run:

```bash
./run.sh --light
```

For Compact, protocol, package, release, or integration-sensitive changes, run
the focused target first and the broader non-light or integration lane required
by [`AGENT.md`](./AGENT.md).

If you cannot run a required command locally, explain why in the pull request
body and include the closest successful focused validation.

## Pull Request Description

Describe what changed, why it is needed, the issue and acceptance criteria, the
validation commands, and any explicit follow-up. Use real Markdown and actual
newlines. Surface-changing pull requests must identify migration and downstream
release implications.

## License Headers

All contributions must be compatible with Apache-2.0. New source files should
use an SPDX header appropriate for the file type where practical:

```text
// SPDX-License-Identifier: Apache-2.0
```

Do not add placeholder copyright-holder text. Generated or third-party files
must retain their required notices and make provenance clear.

## Support and Communication

Use GitHub issues and pull requests for repository-specific coordination. Use
the public channels linked from the Midnight documentation and website for
general Midnight questions.
