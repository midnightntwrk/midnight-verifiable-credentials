# Digital-passport graduation checklist

Status: prototype; no production approval. This checklist is the evidence gate for
issue [#375](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/375).
Moving the family into a production-shaped use-case repository does not, by itself,
make the product production-ready.

## Current boundary and migration plan

| Surface | Current location | Target / compatibility action | Gate owner |
| --- | --- | --- | --- |
| Compact credential family and generated managed code | `packages/prototypes/credential-families/digital-passport` | Keep as private evidence until an independent consumer validates the replacement; preserve package tests and fixture builders during handoff | VC maintainers |
| Family codecs and TypeScript fixtures | `packages/prototypes/credential-families/digital-passport/src` | Extract only family-neutral seams into reusable packages; keep compatibility exports until the consumer migration is complete | VC maintainers |
| OpenID/protocol integration | `packages/prototypes/credential-families/digital-passport` and linked prototype integration packages | Re-home product composition in the independent digital-passport use-case repository; do not add a reverse dependency from reusable core | Product owner |
| Workspace/catalog/CI references | `pnpm-workspace.yaml`, `package.json`, `tooling/scripts/workspace-catalog.mjs`, CI cone/catalog checks | Update atomically with the approved migration; retain source-build fallback and existing prototype test coverage until the external consumer is green | Release/CI owner |

Compatibility is complete only when the independent consumer installs the intended
published or approved tarball inputs, exercises the public API and conformance
fixtures, and the old prototype tests still pass during the transition. No package
move or rename is authorized by this checklist.

## Required graduation gates

Every row requires a recorded evidence link, accountable owner, date, and `PASS` or
`BLOCKED` disposition in the approving review. A missing artifact is `BLOCKED`.

| Gate | Required evidence | Owner | Status |
| --- | --- | --- | --- |
| Security and threat model | Threat model, abuse cases, dependency review, privacy/data-minimization decision, and remediated findings | Security owner | BLOCKED |
| Secret and key handling | Classification of signing keys, controller/private keys, credentials, seeds, deployment secrets, and witnesses; proof none enter source or generated fixtures | Security + release owners | BLOCKED |
| Compact correctness | Reproducible compile, managed-code provenance, contract/property tests, negative cases, and digest-verified fixtures | Compact owner | BLOCKED |
| ZK behavior | Prover/verifier success and failure evidence, malformed-input tests, deterministic fixture provenance, and no secret material | ZK owner | BLOCKED |
| Interoperability | Intended passport profile conformance, external consumer matrix, encoding/localization/time boundary evidence, and migration compatibility | Interop owner | BLOCKED |
| API and versioning | Public API inventory, semver policy, deprecation/migration notes, compatibility window, and technical owner | API owner | BLOCKED |
| Performance and operations | Resource budgets, benchmark evidence, observability, incident response, support/on-call owner, and rollback plan | Operations owner | BLOCKED |
| CI and release | Current-head CI, reproducible package/tarball checks, security scans, provenance, publication boundary, and release runbook | Release/CI owner | BLOCKED |
| Explicit approval | Linked product, security, and repository-maintainer approvals for the specific migration and release boundary | Product + maintainers | BLOCKED |

A production claim is prohibited while any required row is `BLOCKED` or lacks an
explicit approval. A use-case directory is an organizational boundary, not a
security, support, or deployment authorization.

## Issue overlap and non-goals

Issue [#31](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/31)
owns the hidden-holder profile contract. This checklist consumes its decisions as a
security/API dependency and must link any overlapping profile requirement rather than
copying or redefining that contract.

This issue does not move or rename packages, publish a release, approve deployment,
claim production readiness, solve general fixture storage/CI optimization, or add
signing secrets, controller/private keys, credentials, or deployment material to
fixtures or source control. Fixture storage and regeneration remain the bounded
follow-up surfaces tracked by the repository maturity backlog.
