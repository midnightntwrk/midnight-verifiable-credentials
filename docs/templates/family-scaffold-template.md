# Credential Family Scaffold Template

Status: starter template for adding a new VC family package.

Use this when the generic `credentials` package is not enough and you need a
schema-specific family with its own claims, disclosures, request shape, and
validation rules.

Fastest repo-local path:

```bash
npm run scaffold:family -- --slug example-family
npm run scaffold:family -- --slug example-family --claim-mode public
npm run scaffold:family -- --slug example-family --claim-mode commitment
npm run scaffold:family -- --slug example-family --claim-mode mixed
```

Supported claim modes: `--claim-mode public|commitment|mixed`.

That generator now creates a thin-core family package skeleton under:

- `prototypes/credential-families/<slug>`

The generated package includes:

- package metadata
- ESLint and TypeScript config
- thin-core Compact root and family subfiles
- helper scripts for Compact aliasing and managed-runtime cleanup
- placeholder tests for package surfaces and core schema scaffolding

It does not add the package to root workspaces automatically.

Default scaffold behavior is commitment-only. Use `--claim-mode public` for
direct-only public claims, `--claim-mode commitment` for private commitment-only
claims, and `--claim-mode mixed` when the family needs both public metadata and
private commitments. The generator maps those modes to `NoClaimCommitments`,
`NoPublicClaims`, or two concrete family structs respectively.

## Current Compact claim-surface guardrails

When filling in `claims.compact`, keep the current compiler surface in mind.

First choose the claim representation per field:

- `public` for direct values that may be visible anywhere the credential body
  travels
- `selectivelyDisclosed` for direct values disclosed through request gates
- `committedPrivate` for private values represented by commitments and opened
  only when requested
- `predicateOnly` for committed values used through private witnesses and
  schema-specific predicates

Then choose the generic VC shape:

| Family representation | `claims` type | `claimCommitments` type |
| --- | --- | --- |
| public/direct-only | `<Family>PublicClaims` | `NoClaimCommitments` |
| commitment-only | `NoPublicClaims` | `<Family>ClaimCommitments` |
| mixed | `<Family>PublicClaims` | `<Family>ClaimCommitments` |

Use [`../spec/claim-representation.md`](../spec/claim-representation.md) as the
authority for mixed public/private families.

Use native direct claim fields from:

- `Boolean`
- `Uint<n>`
- `Bytes<n>`
- `Field`
- vectors and nested structs built only from those supported kinds

Do not model these as if they were native direct Compact claim fields:

- `String`
- `Int<n>`
- `Float<n>`
- `Vector<k, T>` where `T` is itself an unsupported field kind

Design guidance:

- prefer flat claims by default
- use nested structs only when they encode a real domain grouping
- treat nested vector-of-struct claims as deliberate prototype or
  domain-specific choices, not the default shared-family style
- name commitment-only structs `*ClaimCommitments`, not `*Claims`
- update the changelog, family README, and migration notes when a generated
  Compact/runtime surface changes

Best current references for claim-shape work:

- smallest starter family:
  - `prototypes/credential-families/hello-family`
- broad direct claim-surface laboratory:
  - `prototypes/credential-families/dummy-claims`
- mixed public-plus-private claim representation laboratory:
  - `prototypes/credential-families/mixed-claims`
- surface-change release discipline:
  - `docs/guides/vc-surface-change-discipline.md`

## Package shape

A minimal family package should have these parts:

```text
prototypes/credential-families/example-family/
├── README.md
├── eslint.config.mjs
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── scripts/
│   ├── align-runtime-version.mjs
│   ├── ensure-compact-package-aliases.mjs
│   ├── find-repo-root.mjs
│   └── strip-managed-sourcemaps.mjs
└── src/
    ├── example-family-credential.compact
    ├── contract.ts
    ├── index.ts
    ├── example-family-credential/
    │   ├── claims.compact
    │   ├── model.compact
    │   └── helpers.compact
    └── test/
        ├── claim-root.test.ts
        ├── package-surfaces.test.ts
        └── presentation-request.test.ts
```

## Compact root template

```compact
pragma language_version >= 0.20;

import CompactStandardLibrary;

include "../../../core/primitives/credentials/src/credentials";
include "./example-family-credential/claims";
include "./example-family-credential/model";

import VC<ExampleFamilyPublicClaims, ExampleFamilyClaimCommitments, ExplicitHolderBinding, NoStatusBinding>;
import VP<ExampleFamilyDisclosures, ExplicitHolderBinding>;
import CredentialPresentationRelations<
  ExampleFamilyPublicClaims,
  ExampleFamilyClaimCommitments,
  ExampleFamilyDisclosures,
  ExplicitHolderBinding,
  NoStatusBinding
> prefix ExampleFamilyPresentation_;

export type ExampleFamilyCredential = Credential;
export type ExampleFamilyPresentation = Presentation;
include "./example-family-credential/helpers";
```

## What belongs in the family package

Put these here:

- schema-specific claims and disclosures
- typed verifier request shapes
- schema-specific predicates and disclosure rules
- schema-specific holder-binding combinations if the schema really needs them

Do not put these here:

- generic VC/VP envelope types
- generic DID and holder-binding primitives
- issue/present protocol adapters
- OpenID message framing
- demo/business-contract logic

## Runtime surface rule

Expose only:

- generated/runtime family mirror via `src/index.ts`
- `./contract` when downstream code needs the managed Compact output directly
- optional `./testing` only when another package truly needs fixtures from this
  family

Avoid:

- cross-package imports from another package's `src/test/**`
- exporting the full transitive `credentials` core surface again unless there
  is a specific compatibility reason

## First tests to add

1. claim-root domain separation
2. package export surface sanity
3. verifier-request challenge presence
4. then real family happy-path verification
5. wrong-holder-binding rejection
6. predicate/disclosure boundary tests

## Best current references

Explicit-holder family reference:

- `prototypes/credential-families/birth`

Hidden-holder family reference:

- `prototypes/credential-families/birth-secret`

Capability composition reference:

- `core/capabilities/same-holder`

## Packaging rule

If external consumers need fixtures or test helpers, promote them to an explicit
package surface such as:

- `src/testing.ts`
- `src/testing/...`

Do not rely on sibling imports into `src/test/**`.
