# AGENT

Repository guidance for AI/code agents working in `midnight-verifiable-credentials`.

## Purpose

This repository owns the Midnight Verifiable Credentials stack:

- generic Compact-first VC/VP core
- holder-binding profiles
- credential-family specializations
- OpenID-shaped transport/domain adapters
- protocol/reference orchestration
- verifier-contract demos
- standalone integration infrastructure

## Documentation rules

- Treat [`docs/spec/midnight-credentials.md`](./docs/spec/midnight-credentials.md) as the current normative draft.
- Keep informative material out of the normative spec when possible.
- Put:
  - spec material under `docs/spec/`
  - guides under `docs/guides/`
  - architecture notes under `docs/architecture/`
  - testing docs under `docs/testing/`
  - roadmap/extension notes under `docs/plans/` or `docs/decisions/`
- Keep package-local `README.md` files near packages.
- Keep root docs minimal:
  - `README.md`
  - `AGENT.md`
  - GitHub/community-health files such as `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`

## Documentation entry points

- `docs/spec/midnight-credentials.md`: normative working draft
- `docs/spec/profiles.md`: normative profile catalog
- `docs/spec/conformance.md`: normative conformance model
- `docs/guides/package-selection.md`: package-selection guide
- `docs/architecture/overview.md`: repository architecture map
- `docs/testing/test-matrix.md`: current implementation/test evidence

## Engineering rules

- Prefer updating docs together with capability changes.
- Maintain parity between:
  - implemented capability surface
  - package READMEs
  - spec/profile docs
  - test matrix docs
- Be explicit about maturity:
  - normative draft
  - reference implementation
  - prototype
  - experimental
  - planned

## Validation

Primary repo validation:

```bash
./run.sh
```

Light validation:

```bash
./run.sh --light
```

Package-local integration and protocol work may require Docker.
