# Package Release Contract

Status: canonical pre-publication package release policy.

This repository can build many tarballs, but a successful `pnpm pack` is not a
support promise. Release state is explicit in
`tooling/scripts/workspace-catalog.mjs` and is independent from package class,
maturity, and pack eligibility.

## Release stages

| Stage | Meaning | Registry publication |
| --- | --- | --- |
| `internal` | Workspace-owned package or harness with no external compatibility or support commitment | Forbidden |
| `candidate` | Pre-1.0 tarball with checked metadata, exports, dependency ranges, changelog, and package contents | Forbidden until graduation |
| `supported` | Approved public package with named ownership, compatibility policy, consumer evidence, provenance, and release operations | Allowed through the approved registry workflow |

Candidate packages remain `private: true` and omit `publishConfig`. This is
intentional: the current distribution channel is an immutable local tarball
copied by the identity workspace, not an npm registry. Removing `private` or
selecting a registry is a separate release decision.

## Current inventory

| Package | Stage | Channel | Technical/support owner | Support posture |
| --- | --- | --- | --- | --- |
| `@midnight-ntwrk/midnight-did-credentials` | `candidate` | private `0.1.x` workspace tarball | Unassigned; graduation blocker | Pre-1.0 reference, no production SLA |
| `@midnight-ntwrk/midnight-did-credentials-status-registry` | `internal` | workspace tarball only | Unassigned | Prototype trust model |
| `@midnight-ntwrk/midnight-did-credentials-same-holder` | `internal` | workspace tarball only | Unassigned | Reference capability |
| `@midnight-ntwrk/midnight-did-credentials-iso-registry` | `internal` | workspace tarball only | Unassigned | Reference primitive |
| `@midnight-ntwrk/midnight-did-credentials-offchain-did` | `internal` | workspace tarball only | Unassigned | DID-aware adapter |
| `@midnight-ntwrk/midnight-did-credentials-openid` | `internal` | workspace tarball only | Unassigned | Reference transport adapter |
| `@midnight-ntwrk/midnight-did-credentials-protocol` | `internal` | workspace tarball only | Unassigned | Evolving orchestration API |
| `@midnight-ntwrk/midnight-did-credentials-birth` | `internal` | workspace tarball only | Unassigned | Reference family |
| `@midnight-ntwrk/midnight-did-credentials-birth-secret` | `internal` | workspace tarball only | Unassigned | Reference family with status caveats |
| `@midnight-ntwrk/midnight-did-credentials-hello-family` | `internal` | workspace tarball only | Unassigned | Starter reference |
| `@midnight-ntwrk/midnight-did-credentials-dummy-claims` | `internal` | workspace tarball only | Unassigned | Laboratory package |
| `@midnight-ntwrk/midnight-did-credentials-mixed-claims` | `internal` | workspace tarball only | Unassigned | Laboratory package |
| `@midnight-ntwrk/midnight-did-credentials-university-diploma` | `internal` | workspace tarball only | Unassigned | Prototype family |
| `@midnight-ntwrk/midnight-did-credentials-digital-passport` | `internal` | workspace tarball only | Unassigned | Graduation candidate after correctness work |
| `@midnight-ntwrk/midnight-did-credentials-demo-contract` | `internal` | workspace tarball only | Unassigned | Demo contract |
| `@midnight-ntwrk/midnight-did-hello-verifier-contract` | `internal` | workspace tarball only | Unassigned | Demo verifier contract |
| `@midnight-ntwrk/midnight-did-university-verifier-contract` | `internal` | workspace tarball only | Unassigned | Demo verifier contract |
| `@midnight-ntwrk/midnight-did-university-protocol` | `internal` | workspace tarball only | Unassigned | Use-case orchestration |
| `@midnight-ntwrk/midnight-did-university-reporting` | `internal` | workspace tarball only | Unassigned | Use-case reporting |

The two BDD scenario workspaces, `bdd-support`, and
`standalone-environment` are not release packages. They remain private
scenario or source-only workspaces and are never copied as VC tarballs.

GitHub `CODEOWNERS` review is a repository protection mechanism. It does not
substitute for a named package maintainer, support contact, response policy, or
deprecation owner.

## Candidate contract

Every candidate must:

- use a pre-1.0 semantic version until its API and authority guarantees are
  approved;
- publish one truthful runtime format; current VC candidates are ESM-only and
  must not expose `require` conditions that resolve to ESM files;
- declare explicit exports for JavaScript, declarations, generated artifacts,
  and audited Compact source entrypoints;
- use release-compatible dependency ranges and no wildcard, workspace, file,
  sibling-source, Git, or URL runtime dependencies;
- carry description, repository directory, keywords, side-effect metadata,
  engines, license, README, and package changelog;
- build deterministically through `prepack`; and
- pass the tarball allowlist and export-target checks run by
  `tooling/scripts/check-release-package-contract.mjs`.

For Compact `0.x` dependencies, a caret range preserves the compiler/runtime
minor compatibility boundary. The core candidate therefore requires
`@midnight-ntwrk/compact-runtime@^0.15.0`: compatible `0.15.x` patches are
allowed while `0.16.0` is excluded.

## Graduation

A candidate may become `supported` only after all of these are approved and
implemented:

1. clean non-workspace Node ESM, TypeScript, bundler, and Compact consumers
   install and exercise the generated tarball;
2. compatibility, migration, deprecation, and support windows are published;
3. a technical owner and support owner accept the package;
4. the registry, access policy, signing/provenance, tags, rollback, and release
   workflow are defined;
5. release notes identify known P0 authority or assurance limitations; and
6. package metadata changes to `private: false` only in the reviewed
   publication-enablement change.

The current core candidate does not satisfy these graduation criteria and must
not be described as production ready.

## Validation

Run:

```bash
pnpm run check:release-package-contract
pnpm run artifacts:pack
```

`artifacts:pack` validates candidate tarball paths, required files, allowlisted
contents, packed metadata, and every concrete or wildcard export target before
the packaging target succeeds. It then packs each candidate again and requires
an identical SHA-256 digest, proving byte-for-byte reproducibility in the same
checkout.
