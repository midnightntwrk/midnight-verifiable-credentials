# Package Release Contract

Status: canonical package release and publication policy.

This repository builds tarballs only for packages approved as candidates or
supported releases. A successful `pnpm pack` is not a support promise. Release
state is explicit in
`tooling/scripts/workspace-catalog.mjs` and is independent from package class,
maturity, and pack eligibility.

## Release stages

| Stage | Meaning | Registry publication |
| --- | --- | --- |
| `internal` | Workspace-owned package or harness with no external compatibility or support commitment | Forbidden |
| `candidate` | Pre-1.0 tarball with checked metadata, exports, dependency ranges, changelog, and package contents | Forbidden until graduation |
| `supported` | Approved public package with named ownership, compatibility policy, consumer evidence, provenance, and release operations | Allowed through the approved registry workflow |

Candidate packages remain `private: true` and omit `publishConfig`. Removing
`private` or selecting a registry is a separate release decision made when a
candidate graduates to `supported`.

Concrete credential families, prototypes, product contracts, and use-case
packages are not eligible for `candidate` or `supported` status in this
repository. They remain private evidence workspaces until they are reduced to
conformance fixtures, removed, or graduated to an independent repository.

## Current inventory

| Package | Stage | Channel | Technical/support owner | Support posture |
| --- | --- | --- | --- | --- |
| `@midnight-ntwrk/credential-model` | `supported` | npmjs `rc`; stable after explicit approval | `@midnightntwrk/ex-identus` / `@midnightntwrk/mn-sre` | Pre-1.0 family-authoring substrate |
| `@midnight-ntwrk/credential-compact` | `candidate` | private tarball only | VC package maintainers / support unassigned | Curated family-neutral Compact semantics; compiler/runtime tuple and API remain candidate evidence |
| `@midnight-ntwrk/credential-status` | `candidate` | private tarball only | VC package maintainers / support unassigned | Generic status semantics and replaceable ports; no registry authority or ledger implementation |
| `@midnight-ntwrk/midnight-did-credentials` | `internal` | none | VC package maintainers | Transitional Compact compatibility package |
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

All internal rows above are migration inventory, not a publication queue.
Their presence in the workspace does not permit packing or publishing them for
upstream consumption.

GitHub `CODEOWNERS` review is a repository protection mechanism. Package
technical ownership belongs to `@midnightntwrk/ex-identus`; npmjs credentials,
the protected release environment, and release incident operations belong to
`@midnightntwrk/mn-sre`. Security disclosure follows `SECURITY.md`.

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
- build deterministically through `prepack`;
- avoid install-time lifecycle hooks; a consumer install must not need producer
  source, scripts, or a workspace checkout; and
- pass the tarball allowlist and export-target checks run by
  `tooling/scripts/check-release-package-contract.mjs`.

For Compact `0.x` dependencies, a caret range preserves the compiler/runtime
minor compatibility boundary. The core candidate therefore requires
`@midnight-ntwrk/compact-runtime@^0.15.0`: compatible `0.15.x` patches are
allowed while `0.16.0` is excluded.

## Clean-consumer evidence

`tooling/scripts/test-release-package-consumers.mjs` copies each release
tarball and its declared fixture to an operating-system temporary directory.
It first resolves a lockfile with scripts disabled, rejects every local locator
except the copied package tarball, and only then performs a normal isolated
install. The lane also rejects lifecycle hooks in both source and packed
manifests, repository paths, or package resolution outside that temporary
project.

The `credential-model` package currently proves:

- Node ESM imports and runtime descriptor validation;
- strict `NodeNext` declaration consumption with `skipLibCheck: false`;
- legacy TypeScript `node` resolution for the root declaration surface; and
- a browser-targeted ESM bundle that defines and exercises a synthetic family.

Compact compilation is not applicable to this zero-runtime-dependency
TypeScript package. Packages that expose Compact sources must declare and pass
the Compact clean-consumer check. The private `credential-compact` candidate
also records compiler identity, generated-output provenance, source/artifact
digests, same-holder standalone/composable gate results, explicit Compact
exports, and a forbidden-artifact tarball scan. It does not claim status-registry
authority or verification-v1 compatibility.

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

Support is deliberately bounded: `0.x` minor releases may break APIs, patch
releases remain compatible within their minor line, and an RC is supported
only until its replacement in the same line is published. Package support
does not make any prototype credential family production ready.

## Publication

`.github/workflows/publish.yml` is the only approved npmjs publication path.
It is manual-only, validates branch/channel rules, runs the repository light
gate, prepares an ephemeral release version, packs and tests deterministic
tarballs, generates SPDX SBOM evidence, and publishes those exact tarballs
with npm provenance. The workflow then polls npmjs and reruns the clean
consumer matrix against the registry version. A before/after dist-tag snapshot
also proves that prerelease publication preserves `latest`.

The publish allowlist is emitted by
`tooling/scripts/workspace-catalog.mjs --publishable-paths`. Only `supported`
entries appear. Candidate tarballs may be tested locally but remain private.
See the [npmjs publication runbook](../guides/npmjs-publication.md) for
dispatch, authentication, rollback, and incident procedures.

## Validation

Run:

```bash
pnpm run check:release-package-contract
pnpm run artifacts:pack
# Optional focused rerun against the tarballs produced above.
pnpm run test:release-package-consumers
```

`artifacts:pack` packs only candidate and supported workspaces. It validates
tarball paths, required files, allowlisted contents, packed metadata, and every
concrete or wildcard export target before the packaging target succeeds. It
then packs each release package again and requires an identical SHA-256 digest,
proving byte-for-byte reproducibility in the same checkout. The packaging
command then runs the declared clean-consumer matrix against the validated
tarball before succeeding.
