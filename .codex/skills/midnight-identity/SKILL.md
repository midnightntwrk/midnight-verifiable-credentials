---
name: midnight-identity
description: "Use for the Midnight VC core specification, TypeScript model, Compact primitives, conformance vectors, packaging, and repository validation."
---

# Midnight VC Core

Use this skill in `midnight-verifiable-credentials`, whether it is cloned
independently or checked out inside `midnight-identity-workspace`.

## Start Here

1. Read [`AGENT.md`](../../../AGENT.md).
2. Read the workspace-root `AGENT.md` when working inside the identity workspace.
3. Confirm the requested PR base. Normal work targets `develop`; the core-only
   migration targets `vc-core` while that integration branch exists.

## Boundary

This repository owns the protocol-independent specification, conformance
vectors, `@midnight-ntwrk/credential-model`, and
`@midnight-ntwrk/credential-compact`.

Keep DID methods, credential families, applications, transports, wallets,
registries, deployment environments, UI, and substantial use cases in their
own repositories. Do not add compatibility implementations for removed code.
Cross-repository dependencies use published packages or workspace-root-managed
tarballs, never sibling source or generated output.

## Development

- Preserve the generic Compact envelope
  `VC<TPublicClaims, TClaimCommitments, THolderBinding, TStatusBinding>`.
- Update normative text and conformance vectors with behavioral changes.
- Do not edit generated Compact output by hand.
- Use pnpm and the lockfile; do not create npm or Yarn lockfiles.
- Pack release evidence with `pnpm run artifacts:pack`; do not commit tarballs.

Use the narrowest relevant target while iterating. Follow `AGENT.md` as the
single source for the current pre-PR gate.

## Pull Requests

- Work in an isolated `codex/*` branch and worktree based on the actual PR base.
- Target the integration branch for feature work; target `main` only for an
  explicit release-promotion PR.
- Keep one scope per PR and no more than two active stack levels.
- Sign commits with GPG and DCO.
- Run the current-head external review and wait for terminal CI.
- The repository defaults to human-only merges.
- Ignore findings about deleted systems; fix defects in retained core behavior
  or in the change's validation path.

Use a user-level Midnight MCP configuration when helpful. Never commit personal
MCP settings, credentials, keys, witnesses, or credential data.
